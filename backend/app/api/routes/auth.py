import logging
from fastapi import APIRouter, HTTPException, status

logger = logging.getLogger(__name__)
from app.models.schemas import RegisterRequest, LoginRequest, TokenResponse, ForgotPasswordRequest, ResetPasswordRequest
from app.core.security import hash_password, verify_password, create_access_token
from app.services.storage_service import storage_service
from app.core.supabase_client import supabase
from app.core.config import settings

router = APIRouter(prefix="/auth", tags=["auth"])

_USE_SUPABASE = settings.STORAGE_BACKEND.lower() == "supabase" and supabase is not None


@router.post("/register", response_model=TokenResponse)
async def register(user_data: RegisterRequest):
    if len(user_data.password) < 6:
        raise HTTPException(status_code=400, detail="Password must be at least 6 characters")
    if len(user_data.password) > 72:
        raise HTTPException(status_code=400, detail="Password must be less than 72 characters")

    # When Supabase is the backend, use Supabase Auth to create the user.
    if _USE_SUPABASE:
        try:
            # Check if user already exists in our users table
            existing = storage_service.get_user_by_email(user_data.email)
            if existing:
                raise HTTPException(status_code=400, detail="Email already registered")

            # Create user in Supabase Auth
            auth_resp = supabase.auth.sign_up({
                "email": user_data.email,
                "password": user_data.password,
                "options": {"data": {"name": user_data.name, "role": "student"}},
            })
            if not auth_resp.user:
                raise HTTPException(status_code=400, detail="Registration failed. Please try again.")

            supabase_user_id = auth_resp.user.id

            # Mirror user in our custom users table (without password_hash for Supabase users)
            try:
                supabase.table("users").insert({
                    "id": supabase_user_id,
                    "email": user_data.email,
                    "name": user_data.name,
                    "password_hash": "",  # Not used for Supabase Auth users
                    "role": "student",
                }).execute()
            except Exception:
                pass  # Row may already exist from a previous attempt; safe to ignore

            # Return our own JWT so the rest of the app works uniformly
            access_token = create_access_token(data={
                "sub": supabase_user_id,
                "email": user_data.email,
                "role": "student",
            })
            return TokenResponse(access_token=access_token)

        except HTTPException:
            raise
        except Exception as exc:
            err = str(exc).lower()
            if "already registered" in err or "already exists" in err or "unique" in err:
                raise HTTPException(status_code=400, detail="Email already registered")
            raise HTTPException(status_code=400, detail=f"Registration failed: {exc}")

    # ---- Local storage path ----
    existing = storage_service.get_user_by_email(user_data.email)
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    hashed_password = hash_password(user_data.password)
    try:
        user = storage_service.create_user(
            email=user_data.email,
            name=user_data.name,
            password_hash=hashed_password,
            role="student",
        )
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc

    access_token = create_access_token(data={
        "sub": user["id"],
        "email": user_data.email,
        "role": "student",
    })
    return TokenResponse(access_token=access_token)


@router.post("/login", response_model=TokenResponse)
async def login(login_data: LoginRequest):
    # When Supabase is the backend, sign in via Supabase Auth.
    if _USE_SUPABASE:
        try:
            auth_resp = supabase.auth.sign_in_with_password({
                "email": login_data.email,
                "password": login_data.password,
            })
            if not auth_resp.user:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Invalid email or password",
                )

            # Issue our own JWT for uniform downstream handling
            access_token = create_access_token(data={
                "sub": auth_resp.user.id,
                "email": auth_resp.user.email,
                "role": auth_resp.user.user_metadata.get("role", "student") if auth_resp.user.user_metadata else "student",
            })
            return TokenResponse(access_token=access_token)

        except HTTPException:
            raise
        except Exception as exc:
            err = str(exc).lower()
            if "invalid" in err or "credentials" in err or "password" in err or "email" in err:
                raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid email or password")
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Login failed. Please try again.")

    # ---- Local storage path ----
    user = storage_service.get_user_by_email(login_data.email)
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")

    if not verify_password(login_data.password, user["password_hash"]):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")

    access_token = create_access_token(data={
        "sub": user["id"],
        "email": user["email"],
        "role": user["role"],
    })
    return TokenResponse(access_token=access_token)

@router.post("/forgot-password")
async def forgot_password(req: ForgotPasswordRequest):
    if not _USE_SUPABASE:
        raise HTTPException(status_code=501, detail="Forgot password is only supported with Supabase backend.")
    try:
        supabase.auth.reset_password_for_email(
            req.email,
            options={"redirect_to": "https://college-chatbot-frontend.vercel.app/reset-password"}
        )
        return {"message": "If the email is registered, a password reset link has been sent."}
    except Exception as exc:
        logger.error(f"Supabase reset password error: {exc}")
        raise HTTPException(status_code=400, detail=f"Failed to send reset email: {str(exc)}")

@router.post("/reset-password")
async def reset_password(req: ResetPasswordRequest):
    if not _USE_SUPABASE:
        raise HTTPException(status_code=501, detail="Password reset is only supported with Supabase backend.")
    if len(req.password) < 6:
        raise HTTPException(status_code=400, detail="Password must be at least 6 characters")
    try:
        user_resp = supabase.auth.get_user(req.access_token)
        if not user_resp or not user_resp.user:
            raise HTTPException(status_code=401, detail="Invalid or expired reset link. Please request a new one.")
        supabase.auth.admin.update_user_by_id(user_resp.user.id, {"password": req.password})
        return {"message": "Password updated successfully! You can now login with your new password."}
    except HTTPException:
        raise
    except Exception as exc:
        logger.error(f"Reset password error: {exc}")
        err = str(exc).lower()
        if "expired" in err or "invalid" in err:
            raise HTTPException(status_code=401, detail="Reset link has expired. Please request a new one.")
        raise HTTPException(status_code=400, detail="Failed to reset password. Please try again.")

