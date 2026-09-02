from typing import List, Optional, Literal
from pydantic import BaseModel, Field


# ---------------------------------------------------------
# 1. TASK DECONSTRUCTOR (Squirrel Level)
# ---------------------------------------------------------
class DeconstructStep(BaseModel):
    step_number: Optional[int] = 1
    text: str = Field(..., description="Actionable micro-step under 10-12 words")


class DeconstructRequest(BaseModel):
    task: str = Field(..., min_length=2, max_length=2000)
    density: int = Field(default=2, ge=1, le=5, description="Squirrel level (1-5), yields density * 3 steps")


class DeconstructResponse(BaseModel):
    original_task: Optional[str] = None
    density: Optional[int] = 2
    step_one_only: Optional[str] = "Open your workspace or get into position"
    steps: List[DeconstructStep] = []


# ---------------------------------------------------------
# 2. THE "DOPAMINE-SIZER"
# ---------------------------------------------------------
class DopamineStrategy(BaseModel):
    category: Optional[str] = "Hack"
    icon: Optional[str] = "⚡"
    title: str
    strategy: str
    fun_twist: Optional[str] = None   # A concrete small detail that makes it more fun


class DopamineRequest(BaseModel):
    task: str = Field(..., min_length=2, max_length=2000)
    intensity: int = Field(default=2, ge=1, le=5, description="Squirrel dopamine intensity level (1=Chill, 5=Excesivo)")


class DopamineResponse(BaseModel):
    task: Optional[str] = None
    intensity: Optional[int] = 2
    strategies: List[DopamineStrategy] = []
    dopamine_boost_quote: Optional[str] = "No necesitas ganas, solo necesitas empezar."


# ---------------------------------------------------------
# 3. CBT BRAIN DUMP & COGNITIVE REFRAMING
# ---------------------------------------------------------
class CbtReframeRequest(BaseModel):
    brain_dump: str = Field(..., min_length=3, max_length=4000)


class CbtReframeResponse(BaseModel):
    detected_distortions: List[str] = []
    validation_message: Optional[str] = "Your feelings are valid. Let's look at the facts calmly."
    reframing_phrase: str = Field(..., description="2-sentence calming perspective")
    grounding_action: Optional[str] = "Take 3 deep breaths and look at 3 objects around you."


# ---------------------------------------------------------
# 4. BRAIN DUMP TO TO-DO LIST (BRAIN TO TASK)
# ---------------------------------------------------------
class ActionableTaskItem(BaseModel):
    priority: Optional[str] = "MEDIUM"
    task: str
    quick_win: bool = False


class BrainDumpTodoRequest(BaseModel):
    text: str = Field(..., min_length=3, max_length=5000)


class BrainDumpTodoResponse(BaseModel):
    emotional_context_summary: Optional[str] = "Context extracted from your notes"
    actionable_tasks: List[ActionableTaskItem] = []


# ---------------------------------------------------------
# 5. AJUSTADOR DE TONO & OBJECTIVE TRANSLATOR
# ---------------------------------------------------------
class ToneAdjustRequest(BaseModel):
    message: str = Field(..., min_length=2, max_length=4000)


class ToneAdjustResponse(BaseModel):
    detected_tone: Optional[str] = "Neutral / Direct"
    confidence_rating: Optional[str] = "High"
    traduccion_sin_ansiedad: str = Field(..., description="Objective translation without ambiguity")
    sender_real_intent: Optional[str] = "Practical action required"
    suggested_calm_reply: Optional[str] = "Understood, on it."


# ---------------------------------------------------------
# 6. HYPER-FOCUSED LEARNING HELPER (Feynman Technique)
# ---------------------------------------------------------
class FeynmanRequest(BaseModel):
    topic: str = Field(..., min_length=2, max_length=500)


class FeynmanResponse(BaseModel):
    topic: Optional[str] = None
    simple_explanation: str
    analogy_title: Optional[str] = "Concept Analogy"
    analogy_explanation: str
    key_takeaways: List[str] = []


# Legacy support for phase 1 /breakdown endpoint
class TaskStep(BaseModel):
    step_number: int
    title: str
    description: str
    estimated_minutes: int = Field(default=5, ge=1, le=15)


class TaskBreakdownRequest(BaseModel):
    task: str


class TaskBreakdownResponse(BaseModel):
    original_task: str
    summary: str
    steps: List[TaskStep] = Field(..., min_length=3, max_length=4)
    total_estimated_minutes: int
