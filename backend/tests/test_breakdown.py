import pytest
from pydantic import ValidationError
from app.schemas.task import TaskBreakdownRequest, TaskBreakdownResponse, TaskStep
from app.services.gemini_service import clean_json_string, GeminiBreakdownService


def test_task_breakdown_schema_valid():
    """Verify that a valid 3-4 step payload parses properly."""
    data = {
        "original_task": "Clean up cluttered workspace",
        "summary": "Tackling desk clutter in 3 easy steps.",
        "steps": [
            {
                "step_number": 1,
                "title": "Clear coffee cups",
                "description": "Pick up any mugs or cups and place them in the sink.",
                "estimated_minutes": 3,
            },
            {
                "step_number": 2,
                "title": "Stack papers",
                "description": "Gather papers into one pile on the desk corner.",
                "estimated_minutes": 5,
            },
            {
                "step_number": 3,
                "title": "Wipe surface",
                "description": "Wipe down the center desk area with a clean cloth.",
                "estimated_minutes": 4,
            },
        ],
        "total_estimated_minutes": 12,
    }
    response = TaskBreakdownResponse.model_validate(data)
    assert response.total_estimated_minutes == 12
    assert len(response.steps) == 3
    assert response.steps[0].estimated_minutes <= 15


def test_task_breakdown_schema_invalid_step_count():
    """Verify that 2 steps or 5 steps fail schema validation."""
    data_too_few = {
        "original_task": "Clean up cluttered workspace",
        "summary": "Tackling desk clutter.",
        "steps": [
            {
                "step_number": 1,
                "title": "Clear coffee cups",
                "description": "Pick up mugs.",
                "estimated_minutes": 3,
            },
            {
                "step_number": 2,
                "title": "Stack papers",
                "description": "Stack loose papers.",
                "estimated_minutes": 5,
            },
        ],
        "total_estimated_minutes": 8,
    }
    with pytest.raises(ValidationError):
        TaskBreakdownResponse.model_validate(data_too_few)


def test_task_breakdown_schema_step_over_15_mins():
    """Verify that steps over 15 minutes fail schema validation."""
    data = {
        "original_task": "Clean up cluttered workspace",
        "summary": "Tackling desk clutter.",
        "steps": [
            {
                "step_number": 1,
                "title": "Clear coffee cups",
                "description": "Pick up mugs from the desk.",
                "estimated_minutes": 25,  # Exceeds max 15
            },
            {
                "step_number": 2,
                "title": "Stack papers",
                "description": "Stack loose papers.",
                "estimated_minutes": 5,
            },
            {
                "step_number": 3,
                "title": "Wipe surface",
                "description": "Wipe down desk.",
                "estimated_minutes": 5,
            },
        ],
        "total_estimated_minutes": 35,
    }
    with pytest.raises(ValidationError):
        TaskBreakdownResponse.model_validate(data)


def test_clean_json_string():
    """Verify markdown code fences are stripped cleanly."""
    markdown_wrapped = "```json\n{\"test\": 123}\n```"
    assert clean_json_string(markdown_wrapped) == '{"test": 123}'

    raw = '{"test": 456}'
    assert clean_json_string(raw) == '{"test": 456}'
