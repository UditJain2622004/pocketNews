"""Idempotent listening feedback and simple learned-interest scoring."""
from __future__ import annotations

from datetime import datetime, timezone
from typing import Any, Literal

from pymongo.errors import DuplicateKeyError

from personalization_service import entry_tags
from publication_store import episode_story_entry


ListeningEventName = Literal["completed", "skipped"]


class ListeningEventError(ValueError):
    pass


def record_listening_event(
    database: Any,
    user_id: str,
    episode_id: str,
    event_id: str,
    story_id: str,
    event: ListeningEventName,
    progress_ratio: float,
) -> dict[str, Any]:
    if database is None:
        raise ListeningEventError("Database connection is unavailable.")
    if event not in ("completed", "skipped"):
        raise ListeningEventError("Unsupported listening event.")
    if not event_id.strip() or not story_id.strip():
        raise ListeningEventError("eventId and storyId are required.")
    if not 0 <= progress_ratio <= 1:
        raise ListeningEventError("progressRatio must be between 0 and 1.")
    if event == "completed" and progress_ratio < 0.8:
        raise ListeningEventError("A completed story must reach at least 80% progress.")

    story_entry = episode_story_entry(episode_id, story_id, database)
    if story_entry is None:
        raise ListeningEventError("Published episode or story was not found.")

    document = {
        "eventId": event_id,
        "userId": user_id,
        "episodeId": episode_id,
        "storyId": story_id,
        "event": event,
        "progressRatio": progress_ratio,
        "category": story_entry.get("category", ""),
        "topics": list(story_entry.get("topics") or []),
        "subcategories": list(story_entry.get("subcategories") or []),
        "createdAt": datetime.now(timezone.utc).isoformat(),
    }
    try:
        database.listening_events.insert_one(document)
        return {"accepted": True, "duplicate": False, "event": document}
    except DuplicateKeyError:
        existing = database.listening_events.find_one(
            {"userId": user_id, "eventId": event_id}, {"_id": 0}
        )
        return {"accepted": True, "duplicate": True, "event": existing or document}


def learned_scores(database: Any, user_id: str) -> dict[str, int]:
    """Return category/subcategory scores as completed minus skipped."""
    scores: dict[str, int] = {}
    if database is None:
        return scores
    for event in database.listening_events.find({"userId": user_id}, {"_id": 0}):
        delta = 1 if event.get("event") == "completed" else -1
        topics, subcategories = entry_tags(event)
        for tag in topics | subcategories:
            scores[tag] = scores.get(tag, 0) + delta
    return scores
