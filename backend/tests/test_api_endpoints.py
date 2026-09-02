from fastapi.testclient import TestClient
from unittest.mock import AsyncMock
from app.main import app
from app.schemas.task import (
    DeconstructResponse,
    DeconstructStep,
    DopamineResponse,
    DopamineStrategy,
    CbtReframeResponse,
    BrainDumpTodoResponse,
    ActionableTaskItem,
    ToneAdjustResponse,
    FeynmanResponse,
    TaskBreakdownResponse,
    TaskStep,
)
from app.services.gemini_service import get_gemini_service

client = TestClient(app)


def test_health_endpoint():
    response = client.get("/api/health")
    assert response.status_code == 200
    payload = response.json()
    assert payload["status"] == "ok"
    assert len(payload["tools_available"]) == 6


def test_deconstruct_endpoint():
    mock_service = AsyncMock()
    mock_service.deconstruct_task.return_value = DeconstructResponse(
        original_task="Clean kitchen",
        density=2,
        step_one_only="Put mugs into the sink",
        steps=[
            DeconstructStep(step_number=1, text="Pick up mugs"),
            DeconstructStep(step_number=2, text="Wipe counter"),
            DeconstructStep(step_number=3, text="Take out trash"),
            DeconstructStep(step_number=4, text="Rinse sponge"),
            DeconstructStep(step_number=5, text="Put dishes away"),
            DeconstructStep(step_number=6, text="Sweep floor"),
        ]
    )
    app.dependency_overrides[get_gemini_service] = lambda: mock_service

    try:
        response = client.post("/api/deconstruct", json={"task": "Clean kitchen", "density": 2})
        assert response.status_code == 200
        data = response.json()
        assert len(data["steps"]) == 6
        assert data["step_one_only"] == "Put mugs into the sink"
    finally:
        app.dependency_overrides.clear()


def test_dopaminize_endpoint():
    mock_service = AsyncMock()
    mock_service.dopaminize_task.return_value = DopamineResponse(
        task="Study for math",
        strategies=[
            DopamineStrategy(title="Beat the Boss timer", strategy="10 min speed run", micro_reward="1 piece of chocolate"),
            DopamineStrategy(title="Body double stream", strategy="Study on Discord", micro_reward="Listen to favorite hype song"),
            DopamineStrategy(title="Dice roll quest", strategy="Roll a dice for problem number", micro_reward="5 min break"),
        ],
        dopamine_boost_quote="Every completed problem is +50 XP!"
    )
    app.dependency_overrides[get_gemini_service] = lambda: mock_service

    try:
        response = client.post("/api/dopaminize", json={"task": "Study for math"})
        assert response.status_code == 200
        data = response.json()
        assert len(data["strategies"]) == 3
        assert "dopamine_boost_quote" in data
    finally:
        app.dependency_overrides.clear()


def test_cbt_reframe_endpoint():
    mock_service = AsyncMock()
    mock_service.cbt_reframe.return_value = CbtReframeResponse(
        detected_distortions=["Catastrophizing", "All-or-nothing"],
        validation_message="It is completely natural to feel overwhelmed right now.",
        reframing_phrase="One unfinished assignment does not define your worth. Progress is measured one step at a time.",
        grounding_action="Look around and name 3 blue objects in your room."
    )
    app.dependency_overrides[get_gemini_service] = lambda: mock_service

    try:
        response = client.post("/api/cbt-reframe", json={"brain_dump": "I ruined everything and cannot do anything right"})
        assert response.status_code == 200
        data = response.json()
        assert "Catastrophizing" in data["detected_distortions"]
    finally:
        app.dependency_overrides.clear()


def test_tone_adjust_endpoint():
    mock_service = AsyncMock()
    mock_service.adjust_tone.return_value = ToneAdjustResponse(
        detected_tone="Passive-Aggressive",
        confidence_rating="High",
        traduccion_sin_ansiedad="The sender is simply asking if you have finished the report yet.",
        sender_real_intent="Requesting a quick status update.",
        suggested_calm_reply="Hi! I am working on it now and will send it over by 3 PM."
    )
    app.dependency_overrides[get_gemini_service] = lambda: mock_service

    try:
        response = client.post("/api/tone-adjust", json={"message": "Per my previous email, are you done?"})
        assert response.status_code == 200
        data = response.json()
        assert data["detected_tone"] == "Passive-Aggressive"
    finally:
        app.dependency_overrides.clear()
