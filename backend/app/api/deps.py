from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from app.core.security import decode_token
from app.services.storage_service import storage_service
from app.core.supabase_client import supabase
from app.core.config import settings

bearer = HTTPBearer(auto_error=False)

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(bearer)):
    if not credentials:
        return None
    token = credentials.credentials
    use_supabase = (settings.STORAGE_BACKEND.lower() in ("supabase", "auto") and supabase is not None)

    if use_supabase:
        try:
            user_resp = supabase.auth.get_user(token)
            if not user_resp or not user_resp.user:
                raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid Supabase token")
            
            # Create a mock user dict for compatibility with the rest of the app
            return {
                "id": user_resp.user.id,
                "email": user_resp.user.email,
                "role": user_resp.user.user_metadata.get("role", "student") if user_resp.user.user_metadata else "student"
            }
        except Exception as e:
            # Fallback to local auth if Supabase verification fails, just in case
            pass

    try:
        payload = decode_token(token)
        user_id = payload.get("sub")
        if not user_id:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")
        
        user = storage_service.get_user_by_id(user_id)
        if not user:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")
        return user
    except Exception:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")

def require_role(*roles: str):
    async def checker(user=Depends(get_current_user)):
        if user.get("role") not in roles:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")
        return user
    return checker
