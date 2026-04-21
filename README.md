# College Chatbot

College helpdesk chatbot project built with:

- `FastAPI` backend
- `Next.js` frontend
- `Rasa` intent bot
- `GPT-2` fallback support
- Supabase-first storage with local fallback

This version is made submission-friendly. Even if Supabase or Rasa is not running, the chatbot still works with built-in college FAQ answers for common student queries like admissions, fees, courses, placements, hostel, scholarship, and library.

## Features

- Student registration and login with JWT auth
- Chat API with hybrid response flow
- `Rasa -> FAQ -> GPT-2 -> safe fallback` orchestration
- Supabase-first storage for users and chat history
- Automatic local fallback if Supabase is unavailable
- Optional Docker setup
- Ready frontend UI for demo

## Prerequisites

- Python `3.10+`
- Node.js `18+` or `20+`
- npm
- Optional: Docker Desktop
- Optional: Rasa environment if you want intent training

## Project Structure

```text
college-chatbot/
├── backend/
├── frontend/
├── rasa-bot/
├── docker-compose.yml
└── README.md
```

## How It Works

When a student sends a message:

1. Backend first tries `Rasa` for intent-based response.
2. If Rasa is unavailable or does not match, backend checks the built-in college FAQ layer.
3. If needed, it tries `GPT-2`.
4. If everything else misses, it returns a safe college-related fallback response.

This makes the project more reliable for college demos and viva.

## Backend Setup

```bash
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
copy .env.example .env
uvicorn app.main:app --reload
```

Backend runs on `http://localhost:8000`

If Supabase credentials are present in `backend/.env`, backend will use Supabase as the primary database automatically.

## Frontend Setup

```bash
cd frontend
npm install
copy .env.example .env.local
npm run dev
```

Frontend runs on `http://localhost:3000`

## Team Setup

Every teammate can run the project locally with these steps:

1. Clone the repo.
2. Create backend `.env` from `backend/.env.example`.
3. Create frontend `.env.local` from `frontend/.env.example`.
4. Install backend dependencies.
5. Install frontend dependencies.
6. Start backend.
7. Start frontend.
8. Optional: start Rasa in a separate terminal.

### Terminal 1: Backend

```bash
cd backend
venv\Scripts\activate
uvicorn app.main:app --reload
```

### Terminal 2: Frontend

```bash
cd frontend
npm run dev
```

### Terminal 3: Optional Rasa

```bash
cd rasa-bot
rasa run --enable-api --cors "*"
```

Open `http://localhost:3000`

## Rasa Setup

Rasa is optional now, but if you want full intent classification:

```bash
cd rasa-bot
rasa train
rasa run --enable-api --cors "*"
```

Rasa runs on `http://localhost:5005`

## Docker Setup

```bash
docker-compose up --build
```

## Quick Demo Flow

1. Open the frontend.
2. Register a new user.
3. Go to chat.
4. Ask questions like fees, hostel, admission, or courses.
5. If Rasa is not running, the built-in FAQ layer still answers.

## Default Storage Mode

By default this project uses:

- `STORAGE_BACKEND=auto`
- file path: `backend/data/local_db.json`

This means:

- if Supabase credentials are valid, data goes to Supabase first
- if Supabase is unavailable, backend falls back to local JSON storage
- project still works during demo even if cloud DB has a temporary issue

Note:

- local data file is created automatically at runtime
- `.gitignore` keeps local data, venv, node_modules, and env files out of git

If you want Supabase later, update backend `.env`:

```env
STORAGE_BACKEND=supabase
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_KEY=your_service_key
SUPABASE_ANON_KEY=your_anon_key
```

If you want automatic failover instead of strict Supabase-only mode:

```env
STORAGE_BACKEND=auto
```

## Supabase Migration

Run this SQL in the Supabase SQL editor:

- [backend/supabase/migrations/001_init_college_chatbot.sql](/abs/path/c:/Users/deepe/Desktop/college-chatbot/backend/supabase/migrations/001_init_college_chatbot.sql:1)

This creates:

- `users`
- `chat_messages`
- indexes for email and chat lookup

## Local To Supabase Data Migration

If you already have local data in `backend/data/local_db.json`, migrate it with:

```bash
cd backend
venv\Scripts\activate
python scripts/migrate_local_to_supabase.py
```

This script will upsert:

- local users into Supabase `users`
- local messages into Supabase `chat_messages`

## Storage Modes

- `auto`: Supabase primary, local fallback
- `supabase`: Supabase only, fail if cloud DB is unavailable
- `local`: local JSON only

## Sample Questions

- `Admission process kya hai?`
- `B.Tech ki fees kitni hai?`
- `Hostel facilities batao`
- `Placement record kya hai?`
- `Library timing kya hai?`

## Important Customization

Current college information is demo/sample data. Before final submission, replace it with your real college details in:

- `backend/app/services/college_knowledge.py`
- `rasa-bot/domain.yml`
- `rasa-bot/data/nlu.yml`

You can customize:

- college name
- fees
- available courses
- placement stats
- hostel info
- scholarship rules
- contact details

## API Endpoints

- `POST /api/v1/auth/register`
- `POST /api/v1/auth/login`
- `POST /api/v1/chat/message`
- `GET /health`

## Troubleshooting

- If frontend opens but chat fails, make sure backend is running on port `8000`.
- If Rasa is not running, chatbot will still work through FAQ fallback.
- Check `GET /health` to confirm whether storage is running in `supabase`, `local`, or `supabase_unavailable` mode.
- If `npm run build` fails on a different machine, first run `npm install`.
- If backend import fails, recreate the virtual environment and install `requirements.txt` again.
- If you want real college answers, update the FAQ content before demo.

## Verification Done

The following checks were run successfully during setup:

- backend import check
- chatbot FAQ smoke test
- frontend `npm run build`

## Suggested Submission Title

`AI-Powered College Chatbot using FastAPI, Next.js, Rasa, and GPT-2`

## Short Documentation Summary

This project is a hybrid college chatbot system designed to answer student queries. It uses Rasa for intent-based responses, GPT-2 for generative fallback, and a built-in FAQ layer for reliable college-specific answers. The backend is developed in FastAPI, the frontend in Next.js, and the system supports both local JSON storage and optional Supabase integration. It is suitable for admission helpdesk, college inquiry systems, and academic project submission.
