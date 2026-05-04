import json
import re
from functools import lru_cache
from pathlib import Path
from typing import Dict, List, Optional


DEFAULT_RESPONSE = (
    "I can help you with Invertis University admissions, fees, courses, placements, hostel, "
    "scholarships, facilities, library, and contact details. "
    "Please ask a specific question."
)

KNOWLEDGE_PATH = Path(__file__).resolve().parents[1] / "data" / "invertis_knowledge.json"


def _tokenize(text: str) -> set[str]:
    return set(re.findall(r"[a-z0-9]+", text.lower()))


@lru_cache(maxsize=1)
def _load_documents() -> List[Dict[str, object]]:
    with KNOWLEDGE_PATH.open("r", encoding="utf-8") as file:
        payload = json.load(file)
    return payload["documents"]


def _score_document(message: str, doc: Dict[str, object]) -> int:
    lowered_message = message.lower()
    message_tokens = _tokenize(message)
    doc_tokens = _tokenize(f"{doc['title']} {doc['text']}")
    keywords = [str(keyword).lower() for keyword in doc.get("keywords", [])]

    keyword_score = 0
    for keyword in keywords:
        if keyword in lowered_message:
            # Compound/specific keywords (multi-word or hyphenated) score higher
            weight = 8 if " " in keyword or len(keyword) > 8 else 4
            keyword_score += weight

    token_score = len(message_tokens.intersection(doc_tokens))
    return keyword_score + token_score


# Minimum score required to avoid returning loosely matched documents
_MIN_SCORE_THRESHOLD = 3


def retrieve_college_context(message: str, limit: int = 2) -> List[Dict[str, object]]:
    scored_documents = [
        (score, doc)
        for doc in _load_documents()
        if (score := _score_document(message, doc)) >= _MIN_SCORE_THRESHOLD
    ]
    scored_documents.sort(key=lambda item: item[0], reverse=True)

    if len(scored_documents) >= 2:
        top_score = scored_documents[0][0]
        second_score = scored_documents[1][0]
        # Only return 2nd doc if it's close in score to the top (within 50%)
        if second_score < top_score * 0.5:
            return [scored_documents[0][1]]

    return [doc for _, doc in scored_documents[:limit]]


# Keywords that indicate a disclaimer bullet (always include these)
_DISCLAIMER_PATTERNS = ["verify", "confirm", "official", "check", "contact"]


def _filter_bullets(bullets: List[str], query: str) -> List[str]:
    """Return only bullets relevant to the query. Always keep disclaimer bullets."""
    query_tokens = _tokenize(query)
    # Remove filler/stop words that would cause false positive matches
    _STOP_TOKENS = {"batao", "do", "karo", "hai", "kya", "ki", "ka", "ke", "se", "mein", "aur",
                    "1", "2", "rs", "lakh", "year", "per", "starts", "from", "at"}
    query_tokens -= _STOP_TOKENS

    matched_strong: List[str] = []  # bullet tokens are a superset of query tokens
    matched_weak: List[str] = []   # any overlap
    disclaimers: List[str] = []

    for bullet in bullets:
        if any(p in bullet.lower() for p in _DISCLAIMER_PATTERNS):
            disclaimers.append(bullet)
            continue
        bullet_tokens = _tokenize(bullet)
        overlap = query_tokens & bullet_tokens
        if not overlap:
            continue
        # Strong match: most query tokens appear in this bullet
        if len(overlap) >= max(1, len(query_tokens) * 0.6):
            matched_strong.append(bullet)
        else:
            matched_weak.append(bullet)

    if matched_strong:
        return matched_strong + disclaimers
    if matched_weak:
        return matched_weak + disclaimers
    # Full fallback: return everything
    return [b for b in bullets if b not in disclaimers] + disclaimers


def _format_rag_response(documents: List[Dict[str, object]], query: str = "") -> str:
    sections = []
    for doc in documents:
        section_lines = [f"### {doc['title']}"]
        bullets = doc.get("bullets")

        if isinstance(bullets, list) and bullets:
            # Filter bullets to only those relevant to the query
            filtered = _filter_bullets(bullets, query) if query else bullets
            section_lines.extend(f"- {bullet}" for bullet in filtered)
        else:
            section_lines.append(str(doc["text"]))

        source_url = doc.get("source_url")
        if source_url:
            section_lines.append(f"_Source: {source_url}_")

        sections.append("\n".join(section_lines))

    return "\n\n".join(sections)


def find_faq_response(message: str, limit: int = 2) -> Optional[Dict[str, str]]:
    documents = retrieve_college_context(message, limit=limit)
    if not documents:
        return None

    source_ids = ", ".join(str(doc["id"]) for doc in documents)
    return {
        "response": _format_rag_response(documents, query=message),
        "source": f"rag:{source_ids}",
    }
