import asyncio
import logging
from typing import Dict, List, Optional

from app.services.college_knowledge import DEFAULT_RESPONSE, find_faq_response
from app.services.groq_service import get_groq_response, get_groq_enhanced_response, get_groq_suggestions

logger = logging.getLogger(__name__)

# Keywords that mark a query as college-domain related
COLLEGE_INFO_KEYWORDS = [
    "college", "university", "campus", "invertis",
    "admission", "fees", "fee", "course", "courses",
    "placement", "scholarship", "hostel", "library",
    "batao", "btech", "mba", "bca", "mca", "bba",
]

DEFAULT_SUGGESTIONS = [
    "Admission helpline number",
    "B.Tech CSE fees",
    "Hostel fees",
    "List all courses",
]

SOURCE_SUGGESTIONS: Dict[str, List[str]] = {
    "admission": ["Admission helpline number", "Required documents", "What is IUCET?"],
    "contact": ["Admission process", "Placement cell contact", "Campus address"],
    "fee": ["Hostel fees", "BCA fees", "MBA fees"],
    "hostel": ["Hostel AC room fees", "Admission process", "Campus facilities"],
    "courses": ["B.Tech courses", "Management courses", "Fees structure"],
    "placement": ["Placement cell number", "Internship details", "List all courses"],
}

# Short phrases that look like follow-ups to a prior message
_FOLLOW_UP_WORDS = {
    "number", "phone", "mobile", "contact", "email",
    "batao", "kitna", "kitni", "fees", "fee",
    "hostel", "admission", "documents", "process",
    "course", "courses", "do",
}

_STANDALONE_TOPICS = {
    "hostel", "mess", "refund", "btech", "mba", "bca",
    "mca", "bba", "bsc", "placement", "library", "admission",
    "fees", "fee", "course", "courses",
}

_LAST_QUESTION_PHRASES = [
    "abhi kya pucha", "abhi kya poocha",
    "maine kya pucha", "maine kya poocha",
    "last question", "previous question", "what did i ask",
]


# ── helpers ──────────────────────────────────────────────────────────────────

def _is_follow_up(msg: str) -> bool:
    lowered = msg.lower().strip()
    words = lowered.split()
    if len(words) > 5:
        return False
    if any(t in lowered for t in _STANDALONE_TOPICS):
        return False
    return any(w in lowered for w in _FOLLOW_UP_WORDS)


def _build_memory_query(msg: str, history: Optional[List[Dict]] = None) -> str:
    """Expand short follow-up queries with the previous context topic."""
    if not history or not _is_follow_up(msg):
        return msg

    last_user_msg = next(
        (item["text"] for item in reversed(history) if item.get("role") == "user" and item.get("text")),
        ""
    )

    lowered = msg.lower()
    if any(k in lowered for k in ["number", "phone", "mobile", "contact", "email"]):
        if "placement" in last_user_msg.lower():
            return "placement cell contact phone number email"
        return "admission contact phone number helpline email"

    if last_user_msg:
        return f"{last_user_msg} {msg}".strip()
    return msg


def _wants_previous_question(msg: str) -> bool:
    lowered = msg.lower()
    return any(phrase in lowered for phrase in _LAST_QUESTION_PHRASES)


def _last_user_question(history: Optional[List[Dict]]) -> Optional[str]:
    if not history:
        return None
    return next(
        (item["text"] for item in reversed(history) if item.get("role") == "user" and item.get("text")),
        None
    )


def _suggestions_for_source(source: str) -> List[str]:
    lowered = source.lower()
    for key, suggestions in SOURCE_SUGGESTIONS.items():
        if key in lowered:
            return suggestions
    return DEFAULT_SUGGESTIONS


# ── main entry point ──────────────────────────────────────────────────────────

async def get_bot_response(
    user_message: str,
    session_id: str,
    is_logged_in: bool = True,
    history: Optional[List[Dict]] = None,
) -> dict:
    """
    3-tier pipeline:
      1. RAG  → fast, accurate college facts from local JSON
      2. Groq → general / fallback LLM for anything not in RAG
      3. Static fallback → when Groq also fails
    """

    # ── Special: "what did I ask?" ───────────────────────────────────────────
    if _wants_previous_question(user_message):
        prev = _last_user_question(history)
        if prev:
            return {
                "response": f"Your previous question was:\n\n> {prev}",
                "source": "memory:last_user_question",
                "suggestions": ["Give a short answer", "What are the related fees?", "Admission helpline number"],
            }
        return {
            "response": "I couldn't find a previous question from you.",
            "source": "memory:no_history",
            "suggestions": DEFAULT_SUGGESTIONS,
        }

    memory_query = _build_memory_query(user_message, history)
    is_follow_up = _is_follow_up(user_message)

    # ── Tier 1: RAG ──────────────────────────────────────────────────────────
    faq_result = find_faq_response(memory_query, limit=1 if is_follow_up else 2)
    if faq_result:
        raw_rag = faq_result["response"]
        rag_source = faq_result["source"]

        # Run LLM enhancement + suggestions concurrently for speed
        enhanced_text, dynamic_suggestions = await asyncio.gather(
            get_groq_enhanced_response(memory_query, raw_rag),
            get_groq_suggestions(memory_query, raw_rag),
            return_exceptions=True,
        )

        final_response = (
            enhanced_text
            if isinstance(enhanced_text, str) and enhanced_text.strip()
            else raw_rag
        )
        final_suggestions = (
            dynamic_suggestions
            if isinstance(dynamic_suggestions, list) and dynamic_suggestions
            else _suggestions_for_source(rag_source)
        )
        return {
            "response": final_response,
            "source": rag_source,
            "suggestions": final_suggestions,
        }

    # ── Tier 2: Groq LLM ─────────────────────────────────────────────────────
    try:
        groq_result = await get_groq_response(memory_query, is_logged_in)
        if groq_result and groq_result.get("text"):
            groq_text = groq_result["text"]
            suggestions = await get_groq_suggestions(memory_query, groq_text)
            return {
                "response": groq_text,
                "source": "groq",
                "suggestions": suggestions or DEFAULT_SUGGESTIONS,
            }
    except Exception as e:
        logger.warning(f"Groq tier failed: {e}")

    # ── Tier 3: Static fallback ───────────────────────────────────────────────
    return {
        "response": DEFAULT_RESPONSE,
        "source": "fallback",
        "suggestions": DEFAULT_SUGGESTIONS,
    }
