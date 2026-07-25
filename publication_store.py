"""MongoDB catalog for workflow execution and published episode runs."""
from __future__ import annotations

from datetime import datetime, timezone
import json
from pathlib import Path
import shutil
from typing import Any
from uuid import uuid4

from auth.database import db
from personalization_service import select_personalized_stories


BASE_DIR = Path(__file__).resolve().parent
PERSONALIZED_STORY_LIMIT = 4
SCRIPTS_DIR = BASE_DIR / "scripts"


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
    cover_path = next(
        (
            path
            for entry in entries
            for path in entry.get("imagePaths", [])
            if isinstance(path, str)
        ),
        "",
    )
    category_label = " & ".join(sorted(category for category in categories if category)[:2]) or "News"
    document = {
        "episodeId": episode_id,
        "cadence": cadence,
        "runId": run_id,
        "periodStart": period_start,
        "periodEnd": period_end,
        "language": manifest.get("language", "en-IN"),
        "categories": sorted(category for category in categories if category),
        "title": f"{cadence.title()} Brief: {category_label}",
        "coverPath": cover_path,
        "scripts": entries,
        "status": "published",
        "publishedAt": _now(),
    }
    db.episodes.update_one({"episodeId": episode_id}, {"$set": document}, upsert=True)
    return document


def backfill_complete_episodes() -> dict[str, Any]:
    """Publish legacy script runs only when every story has usable audio and visuals."""
    if db is None:
        raise RuntimeError("MongoDB is required for episode publishing.")

    published: list[dict[str, str]] = []
    skipped: list[dict[str, str]] = []
    for run_dir in sorted(path for path in SCRIPTS_DIR.iterdir() if path.is_dir()):
        try:
            manifest = _read_json(run_dir / "manifest.json")
            reason = _missing_media_reason(run_dir, manifest)
            if reason:
                skipped.append({"runId": run_dir.name, "reason": reason})
                continue

            run_date = str(manifest.get("runDate") or run_dir.name.split("_", 1)[0])
            cadence = str(manifest.get("cadence") or "daily")
            episode = publish_episode(cadence, run_dir.name, run_date, run_date)
            published.append({"runId": run_dir.name, "episodeId": str(episode["episodeId"])})
        except Exception as error:
            skipped.append({"runId": run_dir.name, "reason": str(error)})
    return {"published": published, "skipped": skipped}


def list_published_episodes() -> list[dict[str, Any]]:
    if db is None:
        raise RuntimeError("MongoDB is required for episode publishing.")
    return list(
        db.episodes.find(
            {"status": "published"},
            {"_id": 0, "episodeId": 1, "runId": 1, "title": 1, "cadence": 1, "periodEnd": 1},
        ).sort("publishedAt", -1)
    )


def delete_published_episode(episode_id: str) -> dict[str, str]:
    if db is None:
        raise RuntimeError("MongoDB is required for episode publishing.")
    episode = db.episodes.find_one({"episodeId": episode_id}, {"_id": 0, "runId": 1, "localizedRuns": 1})
    if not episode:
        raise KeyError("Episode was not found.")

    run_id = str(episode.get("runId") or "")
    localized = episode.get("localizedRuns") if isinstance(episode.get("localizedRuns"), dict) else {}
    run_ids = [run_id, *(str(item.get("runId") or "") for item in localized.values() if isinstance(item, dict))]
    for candidate in set(filter(None, run_ids)):
        run_dir = (SCRIPTS_DIR / candidate).resolve()
        if run_dir.parent != SCRIPTS_DIR.resolve():
            raise ValueError("Episode run folder is invalid.")
        if run_dir.exists():
            shutil.rmtree(run_dir)
    db.episodes.delete_one({"episodeId": episode_id})
    return {"episodeId": episode_id, "runId": run_id, "status": "deleted"}


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


def _missing_media_reason(run_dir: Path, manifest: dict[str, Any]) -> str | None:
    scripts = manifest.get("scripts")
    if not isinstance(scripts, list) or not scripts:
        return "No generated scripts."
    for entry in scripts:
        if not isinstance(entry, dict):
            return "Invalid script manifest entry."
        article_id = str(entry.get("articleId") or "")
        image_paths = entry.get("imagePaths")
        if not isinstance(image_paths, list) or not any(_run_file_exists(run_dir, path) for path in image_paths):
            return f"Story {article_id} has no generated visual assets."

        audio_manifest = run_dir / "audio" / article_id / "manifest.json"
        if not audio_manifest.is_file():
            return f"Story {article_id} has no audio manifest."
        audio = _read_json(audio_manifest)
        clips = audio.get("clips")
        if audio.get("failures") or not isinstance(clips, list) or not clips:
            return f"Story {article_id} has incomplete audio."
        if any(not isinstance(clip, dict) or not _run_file_exists(run_dir, clip.get("path")) for clip in clips):
            return f"Story {article_id} has missing audio clips."
    return None


def _run_file_exists(run_dir: Path, relative_path: object) -> bool:
    if not isinstance(relative_path, str) or not relative_path:
        return False
    path = Path(relative_path)
    resolved = path.resolve() if path.is_absolute() else (BASE_DIR / path).resolve()
    return resolved.is_file() and resolved.is_relative_to(run_dir.resolve())


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
