from pydantic import BaseModel, EmailStr

class RegisterRequest(BaseModel):
    email: EmailStr
    password: str
    name: str

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class ChatRequest(BaseModel):
    message: str

class ChatResponse(BaseModel):
    response: str
    source: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"