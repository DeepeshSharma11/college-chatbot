import json
from pathlib import Path

from supabase import create_client

from app.core.config import settings


def main() -> None:
    if not settings.SUPABASE_URL or not settings.SUPABASE_SERVICE_KEY:
        raise RuntimeError("Supabase credentials are missing in backend/.env")

    db_path = Path(settings.LOCAL_DB_PATH)
    if not db_path.is_absolute():
        db_path = Path(__file__).resolve().parents[1] / db_path

    if not db_path.exists():
        raise FileNotFoundError(f"Local DB not found at {db_path}")

    payload = json.loads(db_path.read_text(encoding="utf-8"))
    client = create_client(settings.SUPABASE_URL, settings.SUPABASE_SERVICE_KEY)

    users = payload.get("users", [])
    messages = payload.get("chat_messages", [])

    if users:
        client.table("users").upsert(users).execute()
        print(f"Migrated {len(users)} users to Supabase")
    else:
        print("No local users found")

    if messages:
        client.table("chat_messages").upsert(messages).execute()
        print(f"Migrated {len(messages)} chat messages to Supabase")
    else:
        print("No local chat messages found")


if __name__ == "__main__":
    main()
