import logging

from app.services.college_knowledge import DEFAULT_RESPONSE, find_faq_response
from app.services.rasa_service import get_rasa_response
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
    # Step 1: Try Rasa for intent-based response
    try:
        rasa_result = await get_rasa_response(user_message, session_id)
        if rasa_result and rasa_result.get("text"):
            return {"response": rasa_result["text"], "source": "rasa"}
    except Exception as e:
        logger.warning(f"Rasa failed: {e}")

    # Step 2: Use built-in college FAQ when Rasa is unavailable or misses.
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
