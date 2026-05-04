import json
import httpx
import logging
from app.core.config import settings

logger = logging.getLogger(__name__)

_INVERTIS_SYSTEM = (
    "You are the official chatbot for Invertis University, Bareilly (Uttar Pradesh). "
    "You have two main duties: "
    "1. Answer questions about Invertis University (admissions, fees, courses, placements, hostel). Give direct, specific answers based on facts. "
    "2. Help students with their general academic and educational questions (e.g., computer science, programming, math, science). "
    "If a user asks an academic question (like 'what is deadlock'), explain it clearly and concisely. "
    "If a question is completely unrelated to the university or education, gently steer the conversation back. "
    "If you don't know a university-specific answer, say: 'Please check invertis.org or call +91 9690955511.' "
    "Keep answers concise, factual, and strictly in English."
)


async def _call_groq(messages: list[dict], temperature: float = 0.7, max_tokens: int = 800) -> str | None:
    """Shared Groq API caller. Returns raw text or None on failure."""
    if not settings.GROQ_API_KEY:
        logger.warning("GROQ_API_KEY not set, skipping Groq.")
        return None
    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(
                settings.GROQ_API_URL,
                headers={
                    "Authorization": f"Bearer {settings.GROQ_API_KEY}",
                    "Content-Type": "application/json",
                },
                json={"model": settings.GROQ_MODEL, "messages": messages, "temperature": temperature, "max_tokens": max_tokens},
                timeout=15.0,
            )
            response.raise_for_status()
            return response.json()["choices"][0]["message"]["content"]
    except Exception as e:
        logger.error(f"Groq API error: {e}")
        return None


async def get_groq_response(prompt: str, is_logged_in: bool = True) -> dict | None:
    """Groq fallback for questions not covered by RAG."""
    system_prompt = _INVERTIS_SYSTEM
    if not is_logged_in:
        system_prompt += (
            " The user is NOT logged in. For any question needing authentication "
            "(personal grades, fee status, account details), reply ONLY: "
            "'Please login to ask this type of question.'"
        )
    text = await _call_groq([
        {"role": "system", "content": system_prompt},
        {"role": "user", "content": prompt},
    ])
    return {"text": text} if text else None


async def get_groq_enhanced_response(query: str, rag_context: str) -> str | None:
    """
    RAG + LLM hybrid: given structured RAG facts, ask Groq to produce a
    natural, conversational answer grounded strictly in those facts.
    """
    system_prompt = (
        f"{_INVERTIS_SYSTEM} "
        "You will be given VERIFIED FACTS from the university knowledge base. "
        "Use ONLY these facts to answer — do not add anything not present in the facts. "
        "Respond naturally and conversationally in English. "
        "Be concise — 2-4 sentences max unless more detail is genuinely needed."
    )
    user_prompt = (
        f"User question: {query}\n\n"
        f"Verified facts from Invertis University knowledge base:\n{rag_context}\n\n"
        "Answer the user's question using only the above facts."
    )
    return await _call_groq(
        [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt},
        ],
        temperature=0.4,  # Lower temp = more faithful to facts
        max_tokens=400,
    )


async def get_groq_suggestions(query: str, bot_response: str) -> list[str] | None:
    """
    Generate 3 dynamic, context-aware follow-up question suggestions
    based on what the user just asked and what the bot answered.
    """
    system_prompt = (
        "You are a suggestion engine for an Invertis University chatbot. "
        "Generate exactly 3 short follow-up questions a student might ask next, "
        "based on their current question and the bot's response. "
        "Rules:\n"
        "- Each suggestion must be a question about Invertis University\n"
        "- Keep suggestions short (5-8 words max each)\n"
        "- Write the suggestions strictly in English\n"
        "- Do NOT repeat the user's original question\n"
        "- Return ONLY a JSON array of 3 strings, nothing else. Example: [\"What are the hostel fees?\", \"What is the MBA fee?\", \"Show placement stats\"]"
    )
    user_prompt = f"User asked: {query}\nBot answered: {bot_response[:300]}"

    text = await _call_groq(
        [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt},
        ],
        temperature=0.8,
        max_tokens=120,
    )
    if not text:
        return None
    try:
        # Extract JSON array from response (handle markdown code blocks too)
        start, end = text.find("["), text.rfind("]")
        if start != -1 and end != -1:
            suggestions = json.loads(text[start : end + 1])
            if isinstance(suggestions, list) and len(suggestions) >= 2:
                return [str(s).strip() for s in suggestions[:4]]
    except Exception:
        pass
    return None
