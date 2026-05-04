# AI Coding Assistant Memory

## Latest Session (May 2026)
- **Objective**: Enhanced RAG and AI responses for the College Chatbot.
- **RAG Updates**: Migrated FAQ storage to `backend/app/data/invertis_knowledge.json`. Improved keyword weighting, stop-word filtering, and thresholding in `college_knowledge.py`.
- **Groq Integration**: Hybrid RAG + LLM approach implemented. Groq now rephrases extracted RAG facts into natural language and generates dynamic context-aware suggestion chips.
- **English Responses**: System strictly configured to output English text for queries, including general CS/Academic topics while maintaining strict college domain authority for institutional questions.
- **Orchestrator Fix**: Fixed memory accumulation bug where `_build_memory_query` stacked the entire conversation history instead of isolating the topic, preventing hallucination.
- **Database Mapping**: Fixed `STORAGE_BACKEND=auto` to `supabase` in `.env` and provided `supabase_schema.sql` safe scripts for postgres migration.
- **Frontend Auth**: `register/page.tsx` now redirects correctly to `/login` without auto-login. `HomeActions.tsx` hides "Login/Demo" buttons in favor of a "Go to Chat" button when local storage contains `access_token`.
