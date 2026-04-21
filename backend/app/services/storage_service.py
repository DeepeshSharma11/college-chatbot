import json
import logging
import uuid
from datetime import datetime, timezone
from pathlib import Path
from threading import Lock
from typing import Any, Dict, List, Optional

from app.core.config import settings
from app.core.supabase_client import is_supabase_configured, supabase


logger = logging.getLogger(__name__)


class StorageService:
    def __init__(self) -> None:
        backend_mode = settings.STORAGE_BACKEND.lower()
        self.prefer_supabase = backend_mode in {"auto", "supabase"} and supabase is not None
        self.require_supabase = backend_mode == "supabase"
        self._lock = Lock()
        self._db_path = Path(settings.LOCAL_DB_PATH)
        if not self._db_path.is_absolute():
            self._db_path = Path(__file__).resolve().parents[2] / self._db_path

    def _ensure_local_db(self) -> None:
        self._db_path.parent.mkdir(parents=True, exist_ok=True)
        if not self._db_path.exists():
            self._db_path.write_text(
                json.dumps({"users": [], "chat_messages": []}, indent=2),
                encoding="utf-8",
            )

    def _load_local_db(self) -> Dict[str, List[Dict[str, Any]]]:
        self._ensure_local_db()
        with self._lock:
            return json.loads(self._db_path.read_text(encoding="utf-8"))

    def _save_local_db(self, payload: Dict[str, List[Dict[str, Any]]]) -> None:
        self._ensure_local_db()
        with self._lock:
            self._db_path.write_text(json.dumps(payload, indent=2), encoding="utf-8")

    def _timestamp(self) -> str:
        return datetime.now(timezone.utc).isoformat()

    def get_storage_mode(self) -> str:
        if self.prefer_supabase:
            return "supabase"
        if is_supabase_configured() and supabase is None:
            return "supabase_unavailable"
        return "local"

    def _handle_supabase_error(self, exc: Exception, operation: str) -> None:
        if self.require_supabase:
            raise RuntimeError(f"Supabase {operation} failed: {exc}") from exc
        logger.warning("Supabase %s failed, falling back to local storage: %s", operation, exc)

    def get_user_by_email(self, email: str) -> Optional[Dict[str, Any]]:
        if self.prefer_supabase:
            try:
                result = supabase.table("users").select("*").eq("email", email).execute()
                return result.data[0] if result.data else None
            except Exception as exc:
                self._handle_supabase_error(exc, "read user by email")

        db = self._load_local_db()
        return next((user for user in db["users"] if user["email"] == email), None)

    def get_user_by_id(self, user_id: str) -> Optional[Dict[str, Any]]:
        if self.prefer_supabase:
            try:
                result = supabase.table("users").select("*").eq("id", user_id).execute()
                return result.data[0] if result.data else None
            except Exception as exc:
                self._handle_supabase_error(exc, "read user by id")

        db = self._load_local_db()
        return next((user for user in db["users"] if user["id"] == user_id), None)

    def create_user(
        self,
        *,
        email: str,
        name: str,
        password_hash: str,
        role: str = "student",
    ) -> Dict[str, Any]:
        user = {
            "id": str(uuid.uuid4()),
            "email": email,
            "name": name,
            "password_hash": password_hash,
            "role": role,
            "created_at": self._timestamp(),
        }

        if self.prefer_supabase:
            try:
                result = supabase.table("users").insert(user).execute()
                if not result.data:
                    raise ValueError("Registration failed")
                return result.data[0]
            except Exception as exc:
                self._handle_supabase_error(exc, "create user")

        db = self._load_local_db()
        db["users"].append(user)
        self._save_local_db(db)
        return user

    def save_chat_message(
        self,
        *,
        user_id: str,
        user_message: str,
        bot_response: str,
        source: str,
    ) -> Dict[str, Any]:
        message = {
            "id": str(uuid.uuid4()),
            "user_id": user_id,
            "user_message": user_message,
            "bot_response": bot_response,
            "source": source,
            "created_at": self._timestamp(),
        }

        if self.prefer_supabase:
            try:
                supabase.table("chat_messages").insert(message).execute()
                return message
            except Exception as exc:
                self._handle_supabase_error(exc, "save chat message")

        db = self._load_local_db()
        db["chat_messages"].append(message)
        self._save_local_db(db)
        return message

    def list_users(self) -> List[Dict[str, Any]]:
        if self.prefer_supabase:
            try:
                result = supabase.table("users").select(
                    "id, email, name, role, created_at"
                ).execute()
                return result.data
            except Exception as exc:
                self._handle_supabase_error(exc, "list users")

        db = self._load_local_db()
        return [
            {
                "id": user["id"],
                "email": user["email"],
                "name": user["name"],
                "role": user["role"],
                "created_at": user["created_at"],
            }
            for user in db["users"]
        ]

    def list_messages(self, limit: int = 100) -> List[Dict[str, Any]]:
        if self.prefer_supabase:
            try:
                result = (
                    supabase.table("chat_messages")
                    .select("*")
                    .order("created_at", desc=True)
                    .limit(limit)
                    .execute()
                )
                return result.data
            except Exception as exc:
                self._handle_supabase_error(exc, "list messages")

        db = self._load_local_db()
        return list(reversed(db["chat_messages"]))[:limit]


storage_service = StorageService()
