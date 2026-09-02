# ADHD Atlas - Backend

FastAPI backend providing the task breakdown AI endpoint using Google Gemini Flash.

## Quickstart

```bash
# 1. Activate venv
.\.venv\Scripts\Activate.ps1

# 2. Add your GEMINI_API_KEY in .env
# GEMINI_API_KEY=your_key_here

# 3. Run FastAPI
uvicorn app.main:app --reload --port 8000
```

## Run Tests
```bash
pytest
```
