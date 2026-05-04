from typing import Literal, Optional

from pydantic import BaseModel, EmailStr

class RegisterRequest(BaseModel):
    email: EmailStr
    password: str
    name: str

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class ChatHistoryMessage(BaseModel):
    role: Literal["user", "bot"]
    text: str

class ChatRequest(BaseModel):
    message: str
    history: Optional[list[ChatHistoryMessage]] = None

class ChatResponse(BaseModel):
    response: str
    source: str
    suggestions: list[str] = []

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
