import logging

from app.services.college_knowledge import DEFAULT_RESPONSE, find_faq_response
from app.services.groq_service import get_groq_response
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


def _looks_like_college_query(user_message: str) -> bool:
    lowered = user_message.lower()
    return any(keyword in lowered for keyword in COLLEGE_INFO_KEYWORDS)


async def get_bot_response(user_message: str, session_id: str) -> dict:
    # Step 1: Use Groq as primary LLM
    try:
        groq_result = await get_groq_response(user_message)
        if groq_result and groq_result.get("text"):
            return {"response": groq_result["text"], "source": "groq"}
    except Exception as e:
        logger.warning(f"Groq failed: {e}")

    # Step 2: Use built-in college FAQ when Groq is unavailable or misses.
    faq_result = find_faq_response(user_message)
    if faq_result:
        return faq_result

    # Step 3: Fallback to GPT-2 for generic conversational coverage.
    try:
        gpt2_text = await get_gpt2_response(user_message)
        if gpt2_text and _looks_like_college_query(gpt2_text):
            return {"response": gpt2_text, "source": "gpt2"}

        if _looks_like_college_query(user_message):
            return {"response": SAFE_COLLEGE_FALLBACK, "source": "fallback"}
    except Exception as e:
        logger.error(f"GPT-2 failed: {e}")

    return {"response": SAFE_COLLEGE_FALLBACK, "source": "fallback"}
