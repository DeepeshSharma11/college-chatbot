from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from app.core.security import decode_token
from app.services.storage_service import storage_service
from app.core.config import settings

bearer = HTTPBearer(auto_error=False)


async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(bearer)):
    if not credentials:
        return None
    token = credentials.credentials

    # Decode our own JWT (used for both local and Supabase auth flows)
    try:
        payload = decode_token(token)
        user_id = payload.get("sub")
        email = payload.get("email")
        role = payload.get("role", "student")

        if not user_id:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")

        # Return a lightweight user dict — no DB call needed since JWT is signed
        return {"id": user_id, "email": email, "role": role}
    except HTTPException:
        raise
    except Exception:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid or expired token")


def require_role(*roles: str):
    async def checker(user=Depends(get_current_user)):
        if not user or user.get("role") not in roles:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")
        return user
    return checker
