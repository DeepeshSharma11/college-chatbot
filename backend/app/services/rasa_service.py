import httpx
from app.core.config import settings

async def get_rasa_response(message: str, sender_id: str) -> dict:
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.post(
                f"{settings.RASA_URL}/webhooks/rest/webhook",
                json={"sender": sender_id, "message": message}
            )
            if response.status_code == 200:
                messages = response.json()
                if messages and len(messages) > 0:
                    return messages[0]
            return {}
    except Exception as e:
        print(f"Rasa error: {e}")
        return {}