from typing import Optional

from supabase import Client, create_client

from app.core.config import settings


def is_supabase_configured() -> bool:
    return bool(settings.SUPABASE_URL and settings.SUPABASE_SERVICE_KEY)


def _create_supabase_client() -> Optional[Client]:
    if not is_supabase_configured():
        return None
    return create_client(settings.SUPABASE_URL, settings.SUPABASE_SERVICE_KEY)


supabase = _create_supabase_client()
