from fastapi import APIRouter, HTTPException, status
from app.models.schemas import RegisterRequest, LoginRequest, TokenResponse
from app.core.security import hash_password, verify_password, create_access_token
from app.services.storage_service import storage_service

router = APIRouter(prefix="/auth", tags=["auth"])

@router.post("/register", response_model=TokenResponse)
async def register(user_data: RegisterRequest):
    # Validate password length
    if len(user_data.password) < 6:
        raise HTTPException(status_code=400, detail="Password must be at least 6 characters")
    
    if len(user_data.password) > 72:
        raise HTTPException(status_code=400, detail="Password must be less than 72 characters")
    
    # Check if user exists
    existing = storage_service.get_user_by_email(user_data.email)
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Create user
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
    
    # Create access token
    access_token = create_access_token(data={
        "sub": user["id"],
        "email": user_data.email, 
        "role": "student"
    })
    
    return TokenResponse(access_token=access_token)

@router.post("/login", response_model=TokenResponse)
async def login(login_data: LoginRequest):
    # Get user by email
    user = storage_service.get_user_by_email(login_data.email)

    if not user:
        raise HTTPException(status_code=401, detail="Invalid credentials")

    # Verify password
    if not verify_password(login_data.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    # Create access token
    access_token = create_access_token(data={
        "sub": user["id"], 
        "email": user["email"], 
        "role": user["role"]
    })
    
    return TokenResponse(access_token=access_token)
