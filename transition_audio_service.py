"""Generate and cache short audio bridges between ordered episode stories."""
from __future__ import annotations

from concurrent.futures import ThreadPoolExecutor, as_completed
import hashlib
import json
from pathlib import Path
import re
import wave
from typing import Any

from audio_generator import AUDIO_VOICES, generate_story_line


BASE_DIR = Path(__file__).resolve().parent
SCRIPTS_DIR = BASE_DIR / "scripts"
MAX_CLIP_DURATION_SECONDS = 60


def prepare_episode_bridges(run_id: str, story_ids: list[str]) -> dict[str, object]:
    run_dir = _run_dir(run_id)
    manifest = _read_json(run_dir / "manifest.json")
    stories = _ordered_stories(run_dir, manifest, story_ids)
    language = str(manifest.get("language") or "en-IN")
    requests = []
    for index in range(1, len(stories)):
        previous, current = stories[index - 1], stories[index]
        related = previous["category"] == current["category"]
        entry = current["entry"]
        text = str(entry.get("afterRelated" if related else "afterUnrelated") or "").strip()
        if text:
            requests.append((previous, current, text))

    bridges: list[dict[str, object]] = []
    with ThreadPoolExecutor(max_workers=min(3, len(requests) or 1)) as executor:
        futures = {executor.submit(_prepare_bridge, run_dir, run_id, previous, current, text, language): (previous, current) for previous, current, text in requests}
        for future in as_completed(futures):
            previous, current = futures[future]
            try:
                bridges.append(future.result())
            except Exception:
                continue
    bridges.sort(key=lambda bridge: story_ids.index(str(bridge["beforeStoryId"])))
    return {"runId": run_id, "bridges": bridges}


def _prepare_bridge(run_dir: Path, run_id: str, previous: dict[str, Any], current: dict[str, Any], text: str, language: str) -> dict[str, object]:
    bridge_id = hashlib.sha256(f"{previous['storyId']}:{current['storyId']}:{text}".encode("utf-8")).hexdigest()[:16]
    path = run_dir / "transitions" / f"{bridge_id}.wav"
    if not path.is_file():
        path.parent.mkdir(parents=True, exist_ok=True)
        audio = generate_story_line(
            text,
            AUDIO_VOICES[0],
            "warm, quick cinematic host; a brief connective thought with a natural conversational handoff",
            language,
            f"Bridge from '{previous['title']}' to '{current['title']}'. Say only this transition once: {text}",
        )
        path.write_bytes(audio)
    relative_path = path.relative_to(run_dir).as_posix()
    return {
        "afterStoryId": previous["storyId"],
        "beforeStoryId": current["storyId"],
        "text": text,
        "speaker": "StoryCast",
        "url": f"/api/media/{run_id}/{relative_path}",
        "durationSeconds": _duration_seconds(path),
    }


def _ordered_stories(run_dir: Path, manifest: dict[str, Any], story_ids: list[str]) -> list[dict[str, Any]]:
    by_id: dict[str, dict[str, Any]] = {}
    for item in manifest.get("scripts", []):
        if not isinstance(item, dict):
            continue
        script_path = BASE_DIR / str(item.get("scriptPath") or "")
        if not script_path.is_file():
            continue
        story = _read_json(script_path).get("story", {})
        story_id = str(story.get("storyId") or item.get("articleId") or "")
        if story_id:
            by_id[story_id] = {
                "storyId": story_id,
                "title": str(story.get("title") or "Untitled story"),
                "category": str(story.get("category") or story.get("classification", {}).get("category") or ""),
                "entry": story.get("entry") if isinstance(story.get("entry"), dict) else {},
            }
    return [by_id[story_id] for story_id in story_ids if story_id in by_id]


def _run_dir(run_id: str) -> Path:
    if not re.fullmatch(r"\d{4}-\d{2}-\d{2}_[A-Za-z0-9]+", run_id):
        raise ValueError("runId is invalid.")
    path = (SCRIPTS_DIR / run_id).resolve()
    if not path.is_dir() or path.parent != SCRIPTS_DIR.resolve():
        raise ValueError("Script run was not found.")
    return path


def _read_json(path: Path) -> dict[str, Any]:
    with path.open("r", encoding="utf-8") as input_file:
        payload = json.load(input_file)
    return payload if isinstance(payload, dict) else {}


def _duration_seconds(path: Path) -> float:
    try:
        with wave.open(str(path), "rb") as audio_file:
            duration = audio_file.getnframes() / audio_file.getframerate()
            return round(duration, 3) if 0 < duration <= MAX_CLIP_DURATION_SECONDS else 0.0
    except (wave.Error, OSError, ZeroDivisionError):
        return 0.0
