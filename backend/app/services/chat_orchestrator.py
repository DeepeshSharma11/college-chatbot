import asyncio
import logging
from typing import Dict, List

from app.services.college_knowledge import DEFAULT_RESPONSE, find_faq_response
from app.services.groq_service import get_groq_response, get_groq_enhanced_response, get_groq_suggestions
from app.services.gpt2_service import get_gpt2_response

logger = logging.getLogger(__name__)

COLLEGE_INFO_KEYWORDS = [
    "college",
    "university",
    "campus",
    "invertis",
    "admission",
    "fees",
    "course",
    "placement",
    "scholarship",
    "hostel",
    "library",
    "batao",
]

SAFE_COLLEGE_FALLBACK = DEFAULT_RESPONSE

FOLLOW_UP_KEYWORDS = [
    "number",
    "phone",
    "mobile",
    "contact",
    "email",
    "address",
    "do",
    "batao",
    "kitna",
    "kitni",
    "fees",
    "fee",
    "hostel",
    "admission",
    "documents",
    "process",
    "course",
    "courses",
]

LAST_QUESTION_PHRASES = [
    "abhi kya pucha",
    "abhi kya poocha",
    "maine kya pucha",
    "maine kya poocha",
    "last question",
    "previous question",
    "what did i ask",
]

DEFAULT_SUGGESTIONS = [
    "Admission helpline number",
    "B.Tech CSE fees",
    "Hostel fees",
    "List all courses",
]

SOURCE_SUGGESTIONS = {
    "admission": [
        "Admission helpline number",
        "Required documents",
        "What is IUCET?",
    ],
    "contact": [
        "Admission process",
        "Placement cell contact",
        "Campus address",
    ],
    "fee": [
        "Hostel fees",
        "BCA fees",
        "MBA fees",
    ],
    "hostel": [
        "Hostel AC room fees",
        "Admission process",
        "Campus facilities",
    ],
    "courses": [
        "B.Tech courses",
        "Management courses",
        "Fees structure",
    ],
    "placement": [
        "Placement cell number",
        "Internship details",
        "List all courses",
    ],
}


def _looks_like_college_query(user_message: str) -> bool:
    lowered = user_message.lower()
    return any(keyword in lowered for keyword in COLLEGE_INFO_KEYWORDS)


def _is_follow_up(user_message: str) -> bool:
    lowered = user_message.lower().strip()
    words = lowered.split()
    if len(words) > 4:
        return False
        
    # If the message already has a specific topic noun, it's standalone, not a follow-up
    standalone_topics = ["hostel", "mess", "refund", "btech", "mba", "bca", "mca", "bba", "bsc", "placement", "library", "admission"]
    if any(topic in lowered for topic in standalone_topics):
        return False
        
    has_follow_up_word = any(keyword in lowered for keyword in FOLLOW_UP_KEYWORDS)
    return has_follow_up_word


def _build_memory_query(user_message: str, history: List[Dict[str, str]] | None) -> str:
    if not history or not _is_follow_up(user_message):
        return user_message

    last_user_msg = ""
    for item in reversed(history):
        if item.get("role") == "user" and item.get("text"):
            last_user_msg = item["text"]
            break

    lowered = user_message.lower()
    if any(keyword in lowered for keyword in ["number", "phone", "mobile", "contact", "email"]):
        if "placement" in last_user_msg.lower():
            return "placement cell contact phone number email"
        return "admission contact phone number helpline email"

    return f"{last_user_msg} {user_message}".strip()


def _wants_previous_question(user_message: str) -> bool:
    lowered = user_message.lower()
    return any(phrase in lowered for phrase in LAST_QUESTION_PHRASES)


def _last_user_question(history: List[Dict[str, str]] | None) -> str | None:
    if not history:
        return None

    for item in reversed(history):
        if item.get("role") == "user" and item.get("text"):
            return item["text"]

    return None


def _suggestions_for_source(source: str) -> List[str]:
    lowered = source.lower()
    for key, suggestions in SOURCE_SUGGESTIONS.items():
        if key in lowered:
            return suggestions
    return DEFAULT_SUGGESTIONS


async def get_bot_response(
    user_message: str,
    session_id: str,
    is_logged_in: bool = True,
    history: List[Dict[str, str]] | None = None,
) -> dict:
    if _wants_previous_question(user_message):
        previous_question = _last_user_question(history)
        if previous_question:
            return {
                "response": f"Your previous question was:\n\n> {previous_question}",
                "source": "memory:last_user_question",
                "suggestions": [
                    "Give a short answer",
                    "What are the related fees?",
                    "Admission helpline number",
                ],
            }

        return {
            "response": "I couldn't find a previous question from you.",
            "source": "memory:no_history",
            "suggestions": DEFAULT_SUGGESTIONS,
        }

    memory_query = _build_memory_query(user_message, history)

    # Step 1: RAG — accurate college facts from local knowledge base.
    faq_result = find_faq_response(memory_query, limit=1 if _is_follow_up(user_message) else 2)
    if faq_result:
        raw_rag = faq_result["response"]
        rag_source = faq_result["source"]

        # Run LLM enhancement + suggestion generation concurrently
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

    # Step 2: Groq — for questions not in local RAG.
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
        logger.warning(f"Groq failed: {e}")

    # Step 3: Fallback to GPT-2 for generic conversational coverage.
    try:
        gpt2_text = await get_gpt2_response(memory_query)
        if gpt2_text and _looks_like_college_query(gpt2_text):
            return {"response": gpt2_text, "source": "gpt2", "suggestions": DEFAULT_SUGGESTIONS}

        if _looks_like_college_query(memory_query):
            return {"response": SAFE_COLLEGE_FALLBACK, "source": "fallback", "suggestions": DEFAULT_SUGGESTIONS}
    except Exception as e:
        logger.error(f"GPT-2 failed: {e}")

    return {"response": SAFE_COLLEGE_FALLBACK, "source": "fallback", "suggestions": DEFAULT_SUGGESTIONS}
