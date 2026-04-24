import httpx
import logging
from app.core.config import settings

logger = logging.getLogger(__name__)

async def get_groq_response(prompt: str, is_logged_in: bool = True) -> dict | None:
    if not settings.GROQ_API_KEY:
        logger.warning("GROQ_API_KEY not set, skipping Groq.")
        return None
        
    headers = {
        "Authorization": f"Bearer {settings.GROQ_API_KEY}",
        "Content-Type": "application/json"
    }
    
    system_prompt = "You are a helpful college assistant chatbot."
    if not is_logged_in:
        system_prompt += (
            " The user is NOT logged in. You can answer general college questions "
            "(admissions, fees, courses, placements, hostel). "
            "HOWEVER, if the user asks for personal information, specific account details, "
            "grades, fee status, or anything requiring authentication, you MUST reply "
            "with exactly this and nothing else: 'Please login to ask this type of question.'"
        )

    payload = {
        "model": settings.GROQ_MODEL,
        "messages": [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": prompt}
        ],
        "temperature": 0.7,
        "max_tokens": 800
    }
    
    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(
                settings.GROQ_API_URL,
                headers=headers,
                json=payload,
                timeout=15.0
            )
            response.raise_for_status()
            data = response.json()
            return {"text": data["choices"][0]["message"]["content"]}
    except Exception as e:
        logger.error(f"Groq API error: {e}")
        return None
