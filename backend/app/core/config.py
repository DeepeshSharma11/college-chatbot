from typing import Optional

from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    SUPABASE_URL: Optional[str] = None
    SUPABASE_SERVICE_KEY: Optional[str] = None
    SUPABASE_ANON_KEY: Optional[str] = None
    JWT_SECRET: str = "change-me-in-production"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    RASA_URL: str = "http://localhost:5005"
    GPT2_MODEL_NAME: str = "gpt2"
    STORAGE_BACKEND: str = "auto"
    LOCAL_DB_PATH: str = "data/local_db.json"

    class Config:
        env_file = ".env"
        case_sensitive = True

settings = Settings()
