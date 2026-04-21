from typing import Optional

from supabase import Client, create_client

from app.core.config import settings


def _create_supabase_client() -> Optional[Client]:
    if not settings.SUPABASE_URL or not settings.SUPABASE_SERVICE_KEY:
        return None
    return create_client(settings.SUPABASE_URL, settings.SUPABASE_SERVICE_KEY)


supabase = _create_supabase_client()
