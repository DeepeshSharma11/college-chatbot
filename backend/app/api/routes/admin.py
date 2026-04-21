from fastapi import APIRouter, Depends, HTTPException
from app.api.deps import require_role
from app.services.storage_service import storage_service

router = APIRouter(prefix="/admin", tags=["admin"])

@router.get("/users")
async def get_all_users(current_user=Depends(require_role("admin"))):
    try:
        return {"users": storage_service.list_users()}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/messages")
async def get_all_messages(current_user=Depends(require_role("admin"))):
    try:
        return {"messages": storage_service.list_messages(limit=100)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
