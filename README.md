# 🧭 ADHD Atlas

> **AI-Powered Micro-Step Decomposer for Executive Dysfunction & Cognitive Overwhelm**

ADHD Atlas takes overwhelming, vaguely defined tasks and instantly transforms them into **3–4 hyper-concrete, physical micro-steps** under **15 minutes each**.

---

## ⚡ Tech Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 19, TypeScript, Tailwind CSS v4, Lucide Icons, Vite |
| **Backend** | Python 3.11+, FastAPI, Pydantic v2, Uvicorn |
| **Mobile** | Android (Jetpack Compose, Hardware Keystore) |
| **AI Engine** | Google Gemini (`gemini-2.5-flash` / `gemini-2.0-flash`) via Client-Side BYOK |

---

## 🔑 Bring Your Own Key (BYOK)

ADHD Atlas is built with a **zero-knowledge, stateless backend**:

- **No Server API Keys**: The backend `.env` does **not** store or require any Gemini API key.
- **Client-Side Control**: You supply your own free key from [Google AI Studio](https://aistudio.google.com/app/apikey).
- **Secure Per-Request Dispatch**: The key is stored exclusively on your device (`localStorage` in web, `EncryptedSharedPreferences` on Android) and attached per-call via the `X-Gemini-API-Key` header.

---

## 🚀 Quickstart (Local Development)

### 1. Backend Setup

```bash
cd backend

# Create & activate virtual environment
python -m venv .venv
# Windows (PowerShell): .\.venv\Scripts\Activate.ps1
# Linux / macOS:        source .venv/bin/activate

# Install dependencies & start server
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```
- **API Docs**: [http://localhost:8000/docs](http://localhost:8000/docs)
- **Health Check**: [http://localhost:8000/api/health](http://localhost:8000/api/health)

---

### 2. Frontend Setup

In a separate terminal:

```bash
cd frontend

# Install dependencies & start dev server
npm install
npm run dev
```
- Open [http://localhost:5173](http://localhost:5173) in your browser.
- Click the **🔑 Key Icon** in the top navigation bar.
- Paste your Gemini API key and hit **Save**.

---

### 3. Android App (Optional)

1. Open `ADHD_Atlas/android` in **Android Studio**.
2. Sync Gradle dependencies.
3. Run on an emulator or physical device running **Android 8.0+ (API 26+)**.

---

## 🧪 Testing & Verification

```bash
# Backend test suite (Schema validation, step boundaries, fallback logic)
cd backend
pytest

# Frontend build & TypeScript validation
cd frontend
npm run build
```

---

## 📡 API Specification

### `POST /api/breakdown`

Breaks down an overwhelming task into actionable, concrete physical steps.

**Headers:**
```http
Content-Type: application/json
X-Gemini-API-Key: <your_gemini_api_key>
```

**Request Body:**
```json
{
  "task": "My home office is chaotic and I can't start studying for my exam."
}
```

**Response (`200 OK`):**
```json
{
  "original_task": "My home office is chaotic and I can't start studying for my exam.",
  "summary": "Clearing physical clutter and opening your exam notes in 3 steps.",
  "steps": [
    {
      "step_number": 1,
      "title": "Clear surface items into a single container",
      "description": "Pick up loose items, coffee mugs, and trash from the desk and place them in a laundry basket.",
      "estimated_minutes": 4
    },
    {
      "step_number": 2,
      "title": "Open syllabus and create a blank notes document",
      "description": "Turn on computer, open syllabus tab, and create a blank doc titled 'Exam Notes'.",
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
├── backend/          # FastAPI API service
│   ├── app/          # Routers, schemas, prompts, and Gemini client
│   └── tests/        # Automated pytest test suite
├── frontend/         # React + Vite web client
│   ├── src/          # Components, state hooks, and BYOK modal
│   └── package.json
└── android/          # Native Jetpack Compose mobile app
    └── app/src/main/ # Scoped screen protection & Keystore vault
```
