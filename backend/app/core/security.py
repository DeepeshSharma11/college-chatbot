from datetime import datetime, timedelta, timezone
from jose import JWTError, ExpiredSignatureError, jwt
import hashlib
import secrets
from app.core.config import settings


def hash_password(password: str) -> str:
    """Hash password using SHA-256 with a random salt."""
    salt = secrets.token_hex(16)
    hash_obj = hashlib.sha256((password + salt).encode())
    return f"{salt}:{hash_obj.hexdigest()}"


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify password against stored hash."""
    try:
        salt, hash_value = hashed_password.split(":", 1)
        hash_obj = hashlib.sha256((plain_password + salt).encode())
        return secrets.compare_digest(hash_obj.hexdigest(), hash_value)
    except Exception:
        return False


def create_access_token(data: dict) -> str:
    """Create a signed JWT access token."""
    payload = data.copy()
    payload["exp"] = datetime.now(timezone.utc) + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    return jwt.encode(payload, settings.JWT_SECRET, algorithm=settings.JWT_ALGORITHM)


def decode_token(token: str) -> dict:
    """
    Decode a JWT token.
    Raises JWTError (caught by caller) on invalid/expired tokens.
    Returns payload dict on success.
    """
    # Raises ExpiredSignatureError or JWTError on failure — let caller handle it
    return jwt.decode(token, settings.JWT_SECRET, algorithms=[settings.JWT_ALGORITHM])