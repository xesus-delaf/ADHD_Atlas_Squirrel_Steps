# 🧭 ADHD Atlas (Phase 1)

> **AI-Powered Task Decomposition for Executive Dysfunction & Cognitive Overwhelm**

ADHD Atlas receives an overwhelming task in free-form natural language and decomposes it into **3–4 hyper-concrete, physical micro-steps**, each taking **under 15 minutes**, returning structured and schema-validated JSON.

---

## 🏗️ Architecture & Stack

- **Backend**: Python 3.11+, FastAPI, Pydantic v2, Google GenAI SDK (`gemini-2.5-flash` / `gemini-1.5-flash`), `python-dotenv`, `uvicorn`.
- **Frontend**: React 19, TypeScript, Tailwind CSS v4, Lucide Icons, Axios, Vite.
- **AI Model**: Google Gemini Flash with strict JSON schema enforcement and automated 1-retry fallback.

---

## 🚀 Quickstart Guide (Running Locally)

### 1. Backend Setup

1. Open a terminal in the `backend` folder:
   ```bash
   cd backend
   ```

2. Create and activate a Python virtual environment:
   - **Windows (PowerShell)**:
     ```powershell
     python -m venv .venv
     .\.venv\Scripts\Activate.ps1
     ```
   - **Linux / macOS**:
     ```bash
     python3 -m venv .venv
     source .venv/bin/activate
     ```

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Configure your Gemini API Key in `backend/.env`:
   ```ini
   GEMINI_API_KEY=your_actual_gemini_api_key_here
   GEMINI_MODEL=gemini-2.5-flash
   ENVIRONMENT=development
   CORS_ORIGINS=http://localhost:5173,http://127.0.0.1:5173
   ```
   > 🔑 *You can generate a free Gemini API Key at [Google AI Studio](https://aistudio.google.com/app/apikey).*

5. Start the FastAPI server:
   ```bash
   uvicorn app.main:app --reload --port 8000
   ```
   - API Docs: [http://localhost:8000/docs](http://localhost:8000/docs)
   - Health Check: [http://localhost:8000/api/health](http://localhost:8000/api/health)

---

### 2. Frontend Setup

1. Open a new terminal in the `frontend` folder:
   ```bash
   cd frontend
   ```

2. Install npm dependencies:
   ```bash
   npm install
   ```

3. Start the Vite development server:
   ```bash
   npm run dev
   ```
   - Open your browser at: [http://localhost:5173](http://localhost:5173)

---

## 🧪 Running Tests

### Backend Unit & Integration Tests
Inside the `backend/` directory with virtual environment activated:
```bash
pytest
```
Runs 8 automated tests covering Pydantic schema validation, 3–4 step bounds, 15-minute limits, JSON stripping, and FastAPI endpoint routes.

### Frontend TypeScript & Build Verification
Inside the `frontend/` directory:
```bash
npm run build
```

---

## 📋 API Specification

### `POST /api/breakdown`
Decomposes an overwhelming task into actionable steps.

**Request Body:**
```json
{
  "task": "My home office is chaotic and I can't start studying for my exam."
}
```

**Response (200 OK):**
```json
{
  "original_task": "My home office is chaotic and I can't start studying for my exam.",
  "summary": "Clearing physical clutter and opening your exam notes in 3 steps.",
  "steps": [
    {
      "step_number": 1,
      "title": "Clear surface items into a single container",
      "description": "Pick up loose items, coffee mugs, and garbage on your desk and place them in a laundry basket or sink.",
      "estimated_minutes": 4
    },
    {
      "step_number": 2,
      "title": "Open syllabus and create a blank summary doc",
      "description": "Turn on your computer, open your syllabus tab, and create a blank document titled 'Exam Notes'.",
      "estimated_minutes": 5
    },
    {
      "step_number": 3,
      "title": "Write down 3 main chapter review headers",
      "description": "Type the 3 largest topics from the syllabus into your notes document.",
      "estimated_minutes": 8
    }
  ],
  "total_estimated_minutes": 17
}
```

---

## 📁 Project Structure

```
ADHD_Atlas/
├── backend/
│   ├── app/
│   │   ├── core/
│   │   │   ├── config.py         # Settings & environment validation
│   │   │   └── prompts.py        # System prompt, constraints & few-shot examples
│   │   ├── schemas/
│   │   │   └── task.py           # Pydantic schemas (TaskBreakdownRequest, TaskStep, TaskBreakdownResponse)
│   │   ├── services/
│   │   │   └── gemini_service.py # Gemini Flash client with structured schema & retry fallback
│   │   ├── routers/
│   │   │   └── breakdown.py      # POST /api/breakdown & GET /api/health
│   │   └── main.py               # FastAPI entry point & CORS
│   ├── tests/
│   │   ├── test_breakdown.py     # Schema and logic tests
│   │   └── test_api_endpoints.py # Integration test suite
│   ├── .env.example
│   ├── pytest.ini
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Header.tsx            # App bar with status pill
│   │   │   ├── TaskInput.tsx         # Textarea, sample triggers, character counter
│   │   │   ├── TaskCard.tsx          # Step card with local check state and time badge
│   │   │   ├── TaskBreakdownList.tsx # Progress bar and step list
│   │   │   ├── LoadingState.tsx      # Low-anxiety animated loader
│   │   │   └── ErrorAlert.tsx        # Friendly retry alert
│   │   ├── services/
│   │   │   └── api.ts                # Axios backend API client
│   │   ├── types/
│   │   │   └── task.ts               # TypeScript data definitions
│   │   ├── App.tsx                   # Main layout and state management
│   │   ├── index.css                 # Tailwind v4 styles & ambient glows
│   │   └── main.tsx
│   ├── index.html
│   ├── package.json
│   ├── tsconfig.json
│   └── vite.config.ts
└── README.md
```
