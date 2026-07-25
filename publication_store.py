"""MongoDB catalog for workflow execution and published episode runs."""
from __future__ import annotations

from datetime import datetime, timezone
import json
from pathlib import Path
from typing import Any
from uuid import uuid4

from auth.database import db
from personalization_service import select_personalized_stories


BASE_DIR = Path(__file__).resolve().parent
PERSONALIZED_STORY_LIMIT = 4


def start_workflow(cadence: str, period_start: str, period_end: str) -> str:
    if db is None:
        raise RuntimeError("MongoDB is required for scheduled episode publishing.")
    workflow_id = uuid4().hex
    db.workflow_runs.update_one(
        {"cadence": cadence, "periodStart": period_start, "periodEnd": period_end},
        {"$setOnInsert": {"workflowId": workflow_id, "createdAt": _now()}, "$set": {"status": "running", "updatedAt": _now()}},
        upsert=True,
    )
    record = db.workflow_runs.find_one({"cadence": cadence, "periodStart": period_start, "periodEnd": period_end})
    return str(record["workflowId"])


def complete_workflow(workflow_id: str, result: dict[str, Any], status: str = "completed") -> None:
    if db is None:
        return
    db.workflow_runs.update_one(
        {"workflowId": workflow_id},
        {"$set": {"status": status, "result": result, "updatedAt": _now(), "completedAt": _now()}},
    )


def fail_workflow(workflow_id: str, error: str) -> None:
    complete_workflow(workflow_id, {"error": error}, status="failed")


def workflow_status(workflow_id: str) -> dict[str, Any] | None:
    if db is None:
        return None
    record = db.workflow_runs.find_one({"workflowId": workflow_id}, {"_id": 0})
    return record


def publish_episode(cadence: str, run_id: str, period_start: str, period_end: str) -> dict[str, Any]:
    if db is None:
        raise RuntimeError("MongoDB is required for episode publishing.")
    manifest = _read_json(BASE_DIR / "scripts" / run_id / "manifest.json")
    entries = []
    categories: set[str] = set()
    for entry in manifest.get("scripts", []):
        if not isinstance(entry, dict):
            continue
        script = _read_json(BASE_DIR / str(entry["scriptPath"]))
        story = script.get("story", {})
        category = str(story.get("category") or story.get("classification", {}).get("category") or "")
        categories.add(category)
        entries.append(_enrich_entry({**entry, "category": category, "title": story.get("title", "Untitled story")}, story))
    episode_id = f"{cadence}-{run_id}"
    document = {
        "episodeId": episode_id,
        "cadence": cadence,
        "runId": run_id,
        "periodStart": period_start,
        "periodEnd": period_end,
        "language": manifest.get("language", "en-IN"),
        "categories": sorted(category for category in categories if category),
        "scripts": entries,
        "status": "published",
        "publishedAt": _now(),
    }
    db.episodes.update_one({"episodeId": episode_id}, {"$set": document}, upsert=True)
    return document


def list_episodes(
    user_topics: list[str],
    user_subtopics: list[str] | None = None,
    learned_scores: dict[str, int] | None = None,
) -> list[dict[str, Any]]:
    if db is None:
        return []
    episodes = list(db.episodes.find({"status": "published"}, {"_id": 0}).sort("publishedAt", -1))
    for episode in episodes:
        entries = [_enrich_entry(entry) for entry in episode.get("scripts", [])]
        _, personalization = select_personalized_stories(
            entries, user_topics, user_subtopics or [], learned_scores
        )
        episode["matchScore"] = personalization["matchScore"]
        episode["matchingStoryCount"] = personalization["matchingStoryCount"]
        episode["hasExplorationStory"] = personalization["hasExplorationStory"]
    return sorted(episodes, key=lambda item: (item["matchScore"], item.get("publishedAt", "")), reverse=True)


def episode_playback(
    episode_id: str,
    user_topics: list[str],
    user_subtopics: list[str] | None = None,
    learned_scores: dict[str, int] | None = None,
) -> dict[str, Any] | None:
    if db is None:
        return None
    episode = db.episodes.find_one({"episodeId": episode_id, "status": "published"}, {"_id": 0})
    if not episode:
        return None
    entries = [_enrich_entry(entry) for entry in episode.get("scripts", [])]
    selected, personalization = select_personalized_stories(
        entries, user_topics, user_subtopics or [], learned_scores
    )
    # Keep the exploration item visible even when the legacy playback limit
    # would otherwise truncate the final item in the selected list.
    if personalization["hasExplorationStory"] and len(selected) > PERSONALIZED_STORY_LIMIT:
        episode["scripts"] = (
            selected[:PERSONALIZED_STORY_LIMIT - 1] + [selected[-1]]
        )
    else:
        episode["scripts"] = selected[:PERSONALIZED_STORY_LIMIT]
    episode.update(personalization)
    episode["storyLimit"] = PERSONALIZED_STORY_LIMIT
    return episode


def episode_story_entry(
    episode_id: str,
    story_id: str,
    database: Any | None = None,
) -> dict[str, Any] | None:
    """Return one enriched story entry for authenticated feedback validation."""
    database = database if database is not None else db
    if database is None:
        return None
    episode = database.episodes.find_one(
        {"episodeId": episode_id, "status": "published"},
        {"_id": 0, "scripts": 1},
    )
    if not episode:
        return None
    for entry in episode.get("scripts", []):
        enriched = _enrich_entry(entry)
        if str(enriched.get("storyId") or "") == story_id:
            return enriched
    return None


def set_localized_run(episode_id: str, locale: str, run_id: str, status: str) -> None:
    if db is not None:
        db.episodes.update_one({"episodeId": episode_id}, {"$set": {f"localizedRuns.{locale}": {"runId": run_id, "status": status, "updatedAt": _now()}}})


def setup_publication_indexes() -> None:
    if db is None:
        return
    db.workflow_runs.create_index([("cadence", 1), ("periodStart", 1), ("periodEnd", 1)], unique=True)
    db.workflow_runs.create_index("workflowId", unique=True)
    db.episodes.create_index("episodeId", unique=True)
    db.episodes.create_index([("publishedAt", -1), ("cadence", 1)])


def _read_json(path: Path) -> dict[str, Any]:
    with path.open("r", encoding="utf-8") as input_file:
        payload = json.load(input_file)
    if not isinstance(payload, dict):
        raise ValueError(f"Expected JSON object: {path}")
    return payload


def _enrich_entry(entry: dict[str, Any], story: dict[str, Any] | None = None) -> dict[str, Any]:
    """Add story tags to new and legacy published episode entries."""
    enriched = dict(entry)
    story_payload = story or {}
    if not story_payload and entry.get("scriptPath"):
        try:
            script = _read_json(BASE_DIR / str(entry["scriptPath"]))
            story_payload = script.get("story", {})
        except (OSError, ValueError, KeyError):
            story_payload = {}
    classification = story_payload.get("classification") or {}
    if not enriched.get("storyId"):
        enriched["storyId"] = story_payload.get("storyId") or entry.get("storyId")
    if not enriched.get("title"):
        enriched["title"] = story_payload.get("title", "Untitled story")
    if not enriched.get("category"):
        enriched["category"] = story_payload.get("category") or classification.get("category", "")
    if not enriched.get("topics"):
        enriched["topics"] = story_payload.get("topics", [])
    if not enriched.get("subcategories"):
        enriched["subcategories"] = classification.get("subcategories", [])
    return enriched


def _now() -> str:
    return datetime.now(timezone.utc).isoformat()
