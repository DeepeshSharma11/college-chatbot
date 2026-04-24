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
        # Get response via orchestrator (Groq first, safe fallback)
        bot_result = await get_bot_response(request.message, current_user["id"])
        response_text = bot_result["response"]
        response_source = bot_result["source"]
        
        storage_service.save_chat_message(
            user_id=current_user["id"],
            user_message=request.message,
            bot_response=response_text,
            source=response_source,
        )
        
        return ChatResponse(response=response_text, source=response_source)
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing message: {str(e)}")
