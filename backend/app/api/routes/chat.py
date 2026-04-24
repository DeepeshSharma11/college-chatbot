from fastapi import APIRouter, Depends, HTTPException
from app.api.deps import get_current_user
from app.services.chat_orchestrator import get_bot_response
from app.models.schemas import ChatRequest, ChatResponse
from app.services.storage_service import storage_service

router = APIRouter(prefix="/chat", tags=["chat"])

@router.post("/message", response_model=ChatResponse)
async def send_message(
    request: ChatRequest,
    current_user=Depends(get_current_user)
):
    try:
        user_id = current_user["id"] if current_user else "anonymous"
        is_logged_in = bool(current_user)
        
        # Get response via orchestrator (Groq first, safe fallback)
        bot_result = await get_bot_response(request.message, user_id, is_logged_in)
        response_text = bot_result["response"]
        response_source = bot_result["source"]
        
        if current_user:
            storage_service.save_chat_message(
                user_id=user_id,
                user_message=request.message,
                bot_response=response_text,
                source=response_source,
            )
        
        return ChatResponse(response=response_text, source=response_source)
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing message: {str(e)}")
