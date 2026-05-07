# Invertis University AI Chatbot

AI campus assistant for Invertis University, Bareilly. Built with **Next.js** frontend and **FastAPI** backend using a **Hybrid RAG + LLM** pipeline.

**Live:** Frontend on Vercel · Backend on Render

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14, Tailwind CSS, TypeScript |
| Backend | FastAPI, Python 3.10+ |
| LLM | Groq API (Llama 3.3 70B) |
| Auth | Supabase Auth + JWT |
| Database | Supabase (PostgreSQL) / Local JSON fallback |
| RAG | Custom keyword-scoring engine over `invertis_knowledge.json` |

## How It Works

```
User Query
    │
    ▼
┌──────────────┐
│  RAG Engine   │──→ Keyword scoring on invertis_knowledge.json
│  (Tier 1)     │    Returns verified facts with filtered bullets
└──────┬───────┘
       │ If match found
       ▼
┌──────────────┐
│  Groq LLM    │──→ Enhances RAG facts into natural response
│  (Enhance)   │    + Generates 3 dynamic suggestion chips
└──────┬───────┘
       │ If no RAG match
       ▼
┌──────────────┐
│  Groq LLM    │──→ Direct LLM response for general/academic queries
│  (Tier 2)    │
└──────┬───────┘
       │ If Groq fails
       ▼
┌──────────────┐
│  Static      │──→ Safe fallback message
│  (Tier 3)    │
└──────────────┘
```

## Features

- JWT-based student registration and login via Supabase Auth
- 3-tier response pipeline: RAG → Groq LLM → Static fallback
- Dynamic AI-generated follow-up suggestion chips
- Hinglish-friendly error messages for better student UX
- Context-aware follow-up query expansion (e.g. "number batao" after asking about placements)
- "What did I ask?" memory recall from chat history
- Premium dark theme UI with glassmorphism and ambient glow effects
- Mobile-responsive design across all pages
- Markdown rendering for bot responses
- Local JSON storage fallback (no database setup needed for demo)

## Project Structure

```
college-chatbot/
├── backend/
│   ├── app/
│   │   ├── api/
│   │   │   ├── routes/
│   │   │   │   ├── auth.py          # Register/Login endpoints
│   │   │   │   └── chat.py          # Chat message endpoint
│   │   │   └── deps.py              # JWT auth dependency
│   │   ├── core/
│   │   │   ├── config.py            # Environment settings
│   │   │   └── security.py          # Password hashing, JWT tokens
│   │   ├── data/
│   │   │   └── invertis_knowledge.json  # RAG knowledge base
│   │   ├── services/
│   │   │   ├── chat_orchestrator.py  # 3-tier response pipeline
│   │   │   ├── college_knowledge.py  # RAG engine with keyword scoring
│   │   │   ├── groq_service.py       # Groq API integration
│   │   │   └── storage.py           # Supabase/Local storage abstraction
│   │   └── main.py                  # FastAPI app entry point
│   ├── requirements.txt
│   └── supabase_schema.sql          # Database schema for Supabase
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── (auth)/
│   │   │   │   ├── login/page.tsx
│   │   │   │   └── register/page.tsx
│   │   │   ├── chat/page.tsx
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx             # Landing page
│   │   │   └── globals.css
│   │   ├── components/
│   │   │   ├── Chat/
│   │   │   │   ├── ChatWindow.tsx
│   │   │   │   ├── InputBar.tsx
│   │   │   │   └── MessageBubble.tsx
│   │   │   ├── Layout/Navbar.tsx
│   │   │   └── HomeActions.tsx
│   │   └── lib/apiClient.ts         # API client with error handling
│   └── package.json
├── docker-compose.yml
└── README.md
```

## Prerequisites

- Python 3.10+
- Node.js 18+
- npm
- Groq API Key (free at console.groq.com)
- Supabase project (free at supabase.com) — optional for local demo

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

### Backend Environment Variables

```env
STORAGE_BACKEND=local
JWT_SECRET=your_jwt_secret
GROQ_API_KEY=your_groq_api_key
GROQ_MODEL=llama-3.3-70b-versatile
GROQ_API_URL=https://api.groq.com/openai/v1/chat/completions
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_KEY=your_service_key
SUPABASE_ANON_KEY=your_anon_key
```

Set `STORAGE_BACKEND=supabase` for production with Supabase database.

## Frontend Setup

```bash
cd frontend
npm install
copy .env.example .env.local
npm run dev
```

Frontend runs on `http://localhost:3000`

### Frontend Environment Variables

```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
```

## Docker Setup

```bash
docker-compose up --build
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/auth/register` | Register new student |
| POST | `/api/v1/auth/login` | Login and get JWT token |
| POST | `/api/v1/chat/message` | Send message and get AI response |
| GET | `/api/v1/health` | Health check |

## Sample Questions

| Question | Response Source |
|----------|---------------|
| Admission process kya hai? | RAG + Groq Enhancement |
| B.Tech CSE ki fees kitni hai? | RAG (fee structure) |
| Hostel mein AC room ka price? | RAG (hostel fees) |
| Placement cell ka number batao | RAG (contacts) |
| What is deadlock in OS? | Groq LLM (academic) |
| Tell me a joke | Groq LLM (general) |

## Knowledge Base

All Invertis University data is stored in `backend/app/data/invertis_knowledge.json` covering:

- University overview and location
- Admission process and required documents
- Courses and departments (B.Tech, MBA, BCA, MCA, etc.)
- Fee structure 2025-26
- Hostel fees (AC/Non-AC rooms)
- Contact and admission helpline numbers
- Placement cell contacts (CRC)
- Academic facilities
- Scholarships and education loans

Source: [invertisuniversity.ac.in](https://www.invertisuniversity.ac.in/)

## Troubleshooting

- **Chat fails:** Ensure backend is running on port 8000
- **Groq not working:** Verify `GROQ_API_KEY` in backend `.env`
- **Auth errors:** Check `JWT_SECRET` is set in backend `.env`
- **Build fails on new machine:** Run `npm install` first
- **Import errors:** Recreate venv and reinstall `requirements.txt`

## Submission Title

**AI University Chatbot using FastAPI, Next.js, Groq LLM, and RAG**
