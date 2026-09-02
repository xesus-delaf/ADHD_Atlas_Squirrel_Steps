from typing import Optional, Annotated
from fastapi import APIRouter, Depends, Header, HTTPException, status
from app.schemas.task import (
    DeconstructRequest,
    DeconstructResponse,
    DopamineRequest,
    DopamineResponse,
    CbtReframeRequest,
    CbtReframeResponse,
    BrainDumpTodoRequest,
    BrainDumpTodoResponse,
    ToneAdjustRequest,
    ToneAdjustResponse,
    FeynmanRequest,
    FeynmanResponse,
    TaskBreakdownRequest,
    TaskBreakdownResponse,
)
from app.services.gemini_service import GeminiBreakdownService, get_gemini_service

router = APIRouter(tags=["Executive Function AI Suite"])


def extract_client_key(
    x_goog_api_key: Annotated[str | None, Header()] = None,
    authorization: Annotated[str | None, Header()] = None,
) -> str | None:
    """Extract custom BYOK API key from headers."""
    if x_goog_api_key and x_goog_api_key.strip():
        return x_goog_api_key.strip()
    if authorization and authorization.strip():
        auth = authorization.strip()
        if auth.lower().startswith("bearer "):
            return auth[7:].strip()
        return auth
    return None


@router.get("/health", summary="Health check")
async def health_check():
    """Health check endpoint to verify backend service readiness."""
    return {
        "status": "ok",
        "service": "ADHD Atlas API",
        "version": "1.0.0",
        "tools_available": [
            "deconstruct",
            "dopaminize",
            "cbt-reframe",
            "braindump-todo",
            "tone-adjust",
            "feynman-explain"
        ],
        "byok_supported": True
    }


# 1. THE TASK DECONSTRUCTOR (🐿️ Squirrel Level)
@router.post("/deconstruct", response_model=DeconstructResponse, summary="Deconstruct task by Squirrel Level")
async def deconstruct_endpoint(
    request: DeconstructRequest,
    x_goog_api_key: Optional[str] = Header(None, alias="X-Goog-Api-Key"),
    authorization: Optional[str] = Header(None, alias="Authorization"),
    service: GeminiBreakdownService = Depends(get_gemini_service)
):
    key = extract_client_key(x_goog_api_key, authorization)
    try:
        return await service.deconstruct_task(request.task, density=request.density, api_key=key)
    except ValueError as e:
        raise HTTPException(status_code=401 if "API key" in str(e) else 422, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"AI Service Error: {str(e)}")


# 2. THE "DOPAMINE-SIZER"
@router.post("/dopaminize", response_model=DopamineResponse, summary="Generate high-dopamine task gamification")
async def dopaminize_endpoint(
    request: DopamineRequest,
    x_goog_api_key: Optional[str] = Header(None, alias="X-Goog-Api-Key"),
    authorization: Optional[str] = Header(None, alias="Authorization"),
    service: GeminiBreakdownService = Depends(get_gemini_service)
):
    key = extract_client_key(x_goog_api_key, authorization)
    try:
        return await service.dopaminize_task(request.task, intensity=request.intensity, api_key=key)
    except ValueError as e:
        raise HTTPException(status_code=401 if "API key" in str(e) else 422, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"AI Service Error: {str(e)}")


# 3. CBT BRAIN DUMP & COGNITIVE REFRAMING
@router.post("/cbt-reframe", response_model=CbtReframeResponse, summary="CBT Distortion identification and soothing reframing")
async def cbt_reframe_endpoint(
    request: CbtReframeRequest,
    x_goog_api_key: Optional[str] = Header(None, alias="X-Goog-Api-Key"),
    authorization: Optional[str] = Header(None, alias="Authorization"),
    service: GeminiBreakdownService = Depends(get_gemini_service)
):
    key = extract_client_key(x_goog_api_key, authorization)
    try:
        return await service.cbt_reframe(request.brain_dump, api_key=key)
    except ValueError as e:
        raise HTTPException(status_code=401 if "API key" in str(e) else 422, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"AI Service Error: {str(e)}")


# 4. BRAIN DUMP TO TO-DO LIST
@router.post("/braindump-todo", response_model=BrainDumpTodoResponse, summary="Extract actionable tasks from emotional brain dump")
async def braindump_todo_endpoint(
    request: BrainDumpTodoRequest,
    x_goog_api_key: Optional[str] = Header(None, alias="X-Goog-Api-Key"),
    authorization: Optional[str] = Header(None, alias="Authorization"),
    service: GeminiBreakdownService = Depends(get_gemini_service)
):
    key = extract_client_key(x_goog_api_key, authorization)
    try:
        return await service.braindump_to_todo(request.text, api_key=key)
    except ValueError as e:
        raise HTTPException(status_code=401 if "API key" in str(e) else 422, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"AI Service Error: {str(e)}")


# 5. AJUSTADOR DE TONO & "TRADUCCIÓN SIN ANSIEDAD"
@router.post("/tone-adjust", response_model=ToneAdjustResponse, summary="Analyze message tone & generate anxiety-free translation for RSD")
async def tone_adjust_endpoint(
    request: ToneAdjustRequest,
    x_goog_api_key: Optional[str] = Header(None, alias="X-Goog-Api-Key"),
    authorization: Optional[str] = Header(None, alias="Authorization"),
    service: GeminiBreakdownService = Depends(get_gemini_service)
):
    key = extract_client_key(x_goog_api_key, authorization)
    try:
        return await service.adjust_tone(request.message, api_key=key)
    except ValueError as e:
        raise HTTPException(status_code=401 if "API key" in str(e) else 422, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"AI Service Error: {str(e)}")


# 6. HYPER-FOCUSED LEARNING HELPER
@router.post("/feynman-explain", response_model=FeynmanResponse, summary="Feynman explanation with pop culture/gaming analogy")
async def feynman_explain_endpoint(
    request: FeynmanRequest,
    x_goog_api_key: Optional[str] = Header(None, alias="X-Goog-Api-Key"),
    authorization: Optional[str] = Header(None, alias="Authorization"),
    service: GeminiBreakdownService = Depends(get_gemini_service)
):
    key = extract_client_key(x_goog_api_key, authorization)
    try:
        return await service.feynman_explain(request.topic, api_key=key)
    except ValueError as e:
        raise HTTPException(status_code=401 if "API key" in str(e) else 422, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"AI Service Error: {str(e)}")


# Legacy /breakdown endpoint
@router.post("/breakdown", response_model=TaskBreakdownResponse, summary="Legacy breakdown")
async def breakdown_legacy_endpoint(
    request: TaskBreakdownRequest,
    x_goog_api_key: Optional[str] = Header(None, alias="X-Goog-Api-Key"),
    authorization: Optional[str] = Header(None, alias="Authorization"),
    service: GeminiBreakdownService = Depends(get_gemini_service)
):
    key = extract_client_key(x_goog_api_key, authorization)
    try:
        return await service.breakdown_task(request.task, api_key=key)
    except ValueError as e:
        raise HTTPException(status_code=401 if "API key" in str(e) else 422, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"AI Service Error: {str(e)}")
