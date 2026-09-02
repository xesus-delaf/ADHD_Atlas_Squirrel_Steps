import asyncio
import json
import logging
import re
from typing import Optional, Type, TypeVar
from pydantic import BaseModel
from app.core.config import settings
from app.core.prompts import (
    TASK_DECONSTRUCTOR_PROMPT,
    DOPAMINE_SIZER_PROMPT,
    CBT_REFRAMING_PROMPT,
    BRAINDUMP_TODO_PROMPT,
    TONE_ADJUSTER_PROMPT,
    FEYNMAN_LEARNING_PROMPT,
)
from app.schemas.task import (
    DeconstructResponse,
    DopamineResponse,
    CbtReframeResponse,
    BrainDumpTodoResponse,
    ToneAdjustResponse,
    FeynmanResponse,
    TaskBreakdownResponse,
    TaskStep,
)

logger = logging.getLogger(__name__)
T = TypeVar("T", bound=BaseModel)


def clean_json_string(raw_text: str) -> str:
    """Strip markdown code blocks or extra whitespace from LLM output."""
    text = raw_text.strip()
    if text.startswith("```"):
        text = re.sub(r"^```(?:json)?\s*", "", text, flags=re.IGNORECASE)
        text = re.sub(r"\s*```$", "", text)
    return text.strip()


class GeminiBreakdownService:
    def __init__(self, api_key: Optional[str] = None, model_name: Optional[str] = None):
        self.model_name = model_name or settings.GEMINI_MODEL
        self._model_cache: dict[str, list[str]] = {}

    def _get_client(self, override_key: Optional[str] = None):
        """Initialize and return a Google GenAI client with the provided API key (BYOK)."""
        active_key = override_key or ""
        if not active_key or active_key.strip() == "" or active_key == "your_gemini_api_key_here":
            raise ValueError(
                "Gemini API key is not configured. Please enter your API key using the 🔑 button in the top-right corner."
            )

        try:
            from google import genai
            return ("google-genai", genai.Client(api_key=active_key.strip()))
        except ImportError:
            pass

        try:
            import google.generativeai as legacy_genai
            legacy_genai.configure(api_key=active_key.strip())
            return ("google-generativeai", legacy_genai)
        except ImportError:
            raise RuntimeError("Neither 'google-genai' nor 'google-generativeai' packages are installed.")

    def _discover_active_models(self, sdk_type: str, client: any, active_key: str) -> list[str]:
        """Dynamically discover which Gemini models are active and available for this specific API key."""
        if active_key in self._model_cache and self._model_cache[active_key]:
            return self._model_cache[active_key]

        discovered: list[str] = []
        try:
            if sdk_type == "google-genai":
                for m in client.models.list():
                    raw_name = getattr(m, "name", "") or ""
                    clean_name = raw_name.replace("models/", "").strip()
                    if clean_name and "gemini" in clean_name.lower():
                        # Exclude non-text/embedding models
                        lower = clean_name.lower()
                        if not any(skip in lower for skip in ["embed", "aqa", "imagen", "veo", "text-embedding"]):
                            discovered.append(clean_name)
            else:
                import google.generativeai as legacy_genai
                for m in legacy_genai.list_models():
                    methods = getattr(m, "supported_generation_methods", []) or []
                    if "generateContent" in methods:
                        clean_name = m.name.replace("models/", "").strip()
                        if "gemini" in clean_name.lower() and "embed" not in clean_name.lower():
                            discovered.append(clean_name)
        except Exception as e:
            logger.warning(f"Could not dynamically list models: {e}")

        # Ranking function to prioritize fastest/latest flash and pro models
        def model_rank(name: str) -> int:
            lower = name.lower()
            if self.model_name and self.model_name.lower() in lower:
                return 0
            if "2.5-flash" in lower:
                return 1
            if "2.0-flash" in lower and "lite" not in lower:
                return 2
            if "1.5-flash" in lower and "8b" not in lower:
                return 3
            if "flash" in lower:
                return 4
            if "2.5-pro" in lower:
                return 5
            if "2.0-pro" in lower:
                return 6
            if "1.5-pro" in lower:
                return 7
            if "gemini-pro" in lower:
                return 8
            return 9

        discovered.sort(key=model_rank)

        # Ensure sensible fallbacks are always present in the candidate list
        standard_fallbacks = [
            "gemini-2.0-flash",
            "gemini-1.5-flash",
            "gemini-2.5-flash",
            "gemini-1.5-flash-latest",
            "gemini-1.5-pro",
            "gemini-pro",
        ]
        for fb in standard_fallbacks:
            if fb not in discovered:
                discovered.append(fb)

        if discovered:
            self._model_cache[active_key] = discovered

        return discovered

    def _call_model_sync(
        self,
        sdk_type: str,
        client: any,
        model_name: str,
        prompt: str,
        system_instruction: str,
        response_model: Optional[Type[T]] = None
    ) -> str:
        """Synchronous wrapper to be run in asyncio thread pool."""
        # Strip models/ prefix if present
        clean_model = model_name.replace("models/", "").strip()
        if sdk_type == "google-genai":
            from google.genai import types
            config_args = {
                "system_instruction": system_instruction,
                "response_mime_type": "application/json",
                "temperature": 0.2,
            }
            if response_model:
                config_args["response_schema"] = response_model
            
            response = client.models.generate_content(
                model=clean_model,
                contents=prompt,
                config=types.GenerateContentConfig(**config_args)
            )
            return response.text or ""
        else:
            model = client.GenerativeModel(
                model_name=clean_model,
                system_instruction=system_instruction,
                generation_config={
                    "response_mime_type": "application/json",
                    "temperature": 0.2,
                }
            )
            response = model.generate_content(prompt)
            return response.text or ""

    async def _execute_structured_call(
        self,
        prompt: str,
        system_instruction: str,
        response_model: Type[T],
        api_key: Optional[str] = None
    ) -> T:
        """Call Gemini asynchronously with universal model discovery and auto-fallback."""
        active_key = api_key or self.default_api_key or ""
        sdk_type, client = self._get_client(override_key=active_key)

        # Dynamically discover all active models for this API key (guarded)
        try:
            candidate_models = await asyncio.wait_for(
                asyncio.to_thread(
                    self._discover_active_models, sdk_type, client, active_key
                ),
                timeout=8.0
            )
        except asyncio.TimeoutError:
            logger.warning("Model discovery timed out. Using standard fallback list.")
            candidate_models = [
                "gemini-2.0-flash",
                "gemini-1.5-flash",
                "gemini-2.5-flash",
                "gemini-1.5-flash-latest",
                "gemini-1.5-pro",
                "gemini-pro",
            ]

        last_error = None
        for model in candidate_models:
            try:
                # 1. Attempt with schema constraint
                raw_text = await asyncio.wait_for(
                    asyncio.to_thread(
                        self._call_model_sync,
                        sdk_type,
                        client,
                        model,
                        prompt,
                        system_instruction,
                        response_model
                    ),
                    timeout=12.0  # tight per-model timeout
                )
                cleaned = clean_json_string(raw_text)
                data = json.loads(cleaned)
                return response_model.model_validate(data)

            except asyncio.TimeoutError:
                logger.warning(f"Timeout calling model '{model}'. Trying next available model...")
                last_error = TimeoutError(f"Model '{model}' timed out.")
            except Exception as e:
                err_str = str(e).lower()
                # If 404/not found or unsupported, immediately move to next model
                if "404" in err_str or "not found" in err_str or "not supported" in err_str:
                    logger.info(f"Model '{model}' is not active on this key. Moving to next candidate...")
                    last_error = e
                    continue

                logger.warning(f"Error on model '{model}': {e}. Retrying with plain JSON prompt...")
                try:
                    # 2. Retry without strict schema definition
                    raw_text = await asyncio.wait_for(
                        asyncio.to_thread(
                            self._call_model_sync,
                            sdk_type,
                            client,
                            model,
                            f"{prompt}\n\nCRITICAL: Return ONLY valid unescaped JSON matching the schema.",
                            system_instruction,
                            None
                        ),
                        timeout=10.0  # shorter for retry
                    )
                    cleaned = clean_json_string(raw_text)
                    data = json.loads(cleaned)
                    return response_model.model_validate(data)
                except Exception as retry_err:
                    last_error = retry_err
                    logger.warning(f"Retry on model '{model}' also failed: {retry_err}")

        raise RuntimeError(
            f"No compatible Gemini model could generate content with this API key. Last error: {last_error}"
        )

    # ---------------------------------------------------------
    # 1. TASK DECONSTRUCTOR (🐿️ Squirrel Level)
    # ---------------------------------------------------------
    async def deconstruct_task(self, task: str, density: int = 2, api_key: Optional[str] = None) -> DeconstructResponse:
        total_steps = density * 3
        prompt = f"Deconstruct this task with density level {density} (exactly {total_steps} micro-steps under 8 words each):\n\"{task.strip()}\""
        res = await self._execute_structured_call(prompt, TASK_DECONSTRUCTOR_PROMPT, DeconstructResponse, api_key=api_key)
        if not res.original_task:
            res.original_task = task
        res.density = density
        return res

    # ---------------------------------------------------------
    # 2. THE "DOPAMINE-SIZER"
    # ---------------------------------------------------------
    async def dopaminize_task(self, task: str, intensity: int = 2, api_key: Optional[str] = None) -> DopamineResponse:
        prompt = f"Provide 3 high-impact ADHD dopamine strategies for this task with Squirrel Intensity Level {intensity}/5:\n\"{task.strip()}\""
        res = await self._execute_structured_call(prompt, DOPAMINE_SIZER_PROMPT, DopamineResponse, api_key=api_key)
        if not res.task:
            res.task = task
        res.intensity = intensity
        return res

    # ---------------------------------------------------------
    # 3. CBT BRAIN DUMP & COGNITIVE REFRAMING
    # ---------------------------------------------------------
    async def cbt_reframe(self, brain_dump: str, api_key: Optional[str] = None) -> CbtReframeResponse:
        prompt = f"Analyze this brain dump for cognitive distortions and provide a 2-sentence soothing reframing phrase:\n\"{brain_dump.strip()}\""
        return await self._execute_structured_call(prompt, CBT_REFRAMING_PROMPT, CbtReframeResponse, api_key=api_key)

    # ---------------------------------------------------------
    # 4. BRAIN DUMP TO TO-DO LIST
    # ---------------------------------------------------------
    async def braindump_to_todo(self, text: str, api_key: Optional[str] = None) -> BrainDumpTodoResponse:
        prompt = f"Separate emotional venting from actionable tasks and prioritize them logically:\n\"{text.strip()}\""
        return await self._execute_structured_call(prompt, BRAINDUMP_TODO_PROMPT, BrainDumpTodoResponse, api_key=api_key)

    # ---------------------------------------------------------
    # 5. AJUSTADOR DE TONO & "TRADUCCIÓN SIN ANSIEDAD"
    # ---------------------------------------------------------
    async def adjust_tone(self, message: str, api_key: Optional[str] = None) -> ToneAdjustResponse:
        prompt = f"Analyze tone and generate an objective 'Traducción sin Ansiedad' for this message:\n\"{message.strip()}\""
        return await self._execute_structured_call(prompt, TONE_ADJUSTER_PROMPT, ToneAdjustResponse, api_key=api_key)

    # ---------------------------------------------------------
    # 6. HYPER-FOCUSED LEARNING HELPER (Feynman Technique)
    # ---------------------------------------------------------
    async def feynman_explain(self, topic: str, api_key: Optional[str] = None) -> FeynmanResponse:
        prompt = f"Explain this topic using the Feynman technique — assume zero prior knowledge, no jargon, make it instantly clear with one universally relatable analogy:\n\"{topic.strip()}\""
        res = await self._execute_structured_call(prompt, FEYNMAN_LEARNING_PROMPT, FeynmanResponse, api_key=api_key)
        if not res.topic:
            res.topic = topic
        return res

    # Legacy endpoint compatibility
    async def breakdown_task(self, task: str, api_key: Optional[str] = None) -> TaskBreakdownResponse:
        deconstructed = await self.deconstruct_task(task, density=1, api_key=api_key)
        steps = [
            TaskStep(
                step_number=s.step_number,
                title=s.text,
                description=f"Action: {s.text}",
                estimated_minutes=4
            )
            for s in deconstructed.steps[:4]
        ]
        return TaskBreakdownResponse(
            original_task=task,
            summary=f"First action: {deconstructed.step_one_only}",
            steps=steps,
            total_estimated_minutes=len(steps) * 4
        )


def get_gemini_service() -> GeminiBreakdownService:
    return GeminiBreakdownService()
