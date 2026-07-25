"""Cache-first filesystem workflow for PocketNews narration audio."""
from __future__ import annotations

from concurrent.futures import ThreadPoolExecutor, as_completed
import hashlib
import json
import os
from pathlib import Path
import re
from typing import Any
import wave

from audio_generator import AUDIO_MODEL, AUDIO_VOICES, generate_story_line


BASE_DIR = Path(__file__).resolve().parent
SCRIPTS_DIR = BASE_DIR / "scripts"
MAX_PARALLEL_REQUESTS = max(1, int(os.getenv("OPENAI_MAX_PARALLEL_REQUESTS", "4")))


class AudioWorkflowInputError(ValueError):
    pass


def prepare_story_audio(run_id: str, article_ids: list[str] | None = None) -> dict[str, object]:
    run_dir = _run_directory(run_id)
    run_manifest = _read_json(run_dir / "manifest.json")
    scripts = run_manifest.get("scripts")
    if not isinstance(scripts, list):
        raise AudioWorkflowInputError("The script run does not contain a script manifest.")

    requested_ids = set(article_ids or [])
    available_ids = {str(item.get("articleId")) for item in scripts if isinstance(item, dict)}
    unknown_ids = requested_ids - available_ids
    if unknown_ids:
        raise AudioWorkflowInputError(f"Unknown article IDs for this run: {', '.join(sorted(unknown_ids))}")

    selected_scripts = [
        item for item in scripts
        if isinstance(item, dict) and (not requested_ids or str(item.get("articleId")) in requested_ids)
    ]
    language = str(run_manifest.get("language") or "en-IN")
    failures: list[dict[str, str]] = []
    manifests: list[dict[str, object]] = []
    clips_generated = 0
    clips_reused = 0

    with ThreadPoolExecutor(max_workers=MAX_PARALLEL_REQUESTS) as executor:
        futures = {}
        for script_entry in selected_scripts:
            article_id = str(script_entry.get("articleId") or "")
            try:
                script_path = _script_path(run_dir, str(script_entry.get("scriptPath") or ""))
                futures[executor.submit(_prepare_script_audio, run_dir, script_path, article_id or script_path.stem, language)] = article_id or script_path.stem
            except Exception as error:
                failures.append({"articleId": article_id, "error": str(error)})

        for future in as_completed(futures):
            article_id = futures[future]
            try:
                result = future.result()
                clips_generated += result["clipsGenerated"]
                clips_reused += result["clipsReused"]
                failures.extend(result["failures"])
                manifests.append(result["manifest"])
            except Exception as error:
                failures.append(
                    {
                        "articleId": article_id,
                        "error": str(error),
                    }
                )

    manifests.sort(key=lambda item: str(item["articleId"]))

    return {
        "runId": run_id,
        "articlesRequested": len(selected_scripts),
        "audioStoriesReady": sum(1 for item in manifests if not item["failures"]),
        "clipsGenerated": clips_generated,
        "clipsReused": clips_reused,
        "manifests": manifests,
        "failures": failures,
    }


def media_file(run_id: str, media_path: str) -> Path:
    run_dir = _run_directory(run_id)
    target = (run_dir / media_path).resolve()
    if not target.is_file() or run_dir not in target.parents:
        raise AudioWorkflowInputError("Media file not found.")
    return target


def _prepare_script_audio(
    run_dir: Path,
    script_path: Path,
    article_id: str,
    language: str,
) -> dict[str, Any]:
    run_id = run_dir.name
    script = _read_json(script_path)
    story = script.get("story")
    if not isinstance(story, dict):
        raise AudioWorkflowInputError("Script does not contain a story module.")

    beats = story.get("beats")
    cast = story.get("cast")
    if not isinstance(beats, list) or not isinstance(cast, list):
        raise AudioWorkflowInputError("Story module does not contain cast and beats.")

    voice_assignments = _voice_assignments(article_id, cast)
    audio_dir = run_dir / "audio" / _safe_filename(script_path.stem)
    manifest_path = audio_dir / "manifest.json"
    previous_manifest = _read_json(manifest_path) if manifest_path.is_file() else {}
    previous_clips = {
        str(item.get("clipId")): item
        for item in previous_manifest.get("clips", [])
        if isinstance(item, dict)
    }

    clips: list[dict[str, object]] = []
    failures: list[dict[str, str]] = []
    clips_generated = 0
    clips_reused = 0

    for beat in beats:
        if not isinstance(beat, dict):
            continue
        beat_id = str(beat.get("id") or "beat")
        for line_index, line in enumerate(beat.get("lines") or []):
            if not isinstance(line, dict):
                continue
            speaker = str(line.get("speaker") or "")
            text = str(line.get("text") or "").strip()
            if not text:
                continue

            clip_id = f"{beat_id}-{line_index}"
            line_hash = _line_hash(text, speaker, language, voice_assignments.get(speaker, ""))
            clip_path = audio_dir / _safe_filename(beat_id) / f"{line_index}.wav"
            previous = previous_clips.get(clip_id, {})
            if previous.get("lineHash") == line_hash and clip_path.is_file():
                clips_reused += 1
                clips.append(_clip_record(run_id, clip_id, beat_id, line_index, speaker, clip_path, line_hash))
                continue

            cast_member = next((item for item in cast if isinstance(item, dict) and item.get("id") == speaker), {})
            voice_profile = str(cast_member.get("voiceProfile") or "natural news narration")
            try:
                audio_bytes = generate_story_line(text, voice_assignments.get(speaker, AUDIO_VOICES[0]), voice_profile, language)
                clip_path.parent.mkdir(parents=True, exist_ok=True)
                clip_path.write_bytes(audio_bytes)
                clips_generated += 1
                clips.append(_clip_record(run_id, clip_id, beat_id, line_index, speaker, clip_path, line_hash))
            except Exception as error:
                failures.append(
                    {
                        "articleId": article_id,
                        "beatId": beat_id,
                        "lineIndex": str(line_index),
                        "speaker": speaker,
                        "error": str(error),
                    }
                )

    manifest = {
        "articleId": article_id,
        "scriptPath": _relative(script_path),
        "language": language,
        "model": AUDIO_MODEL,
        "voiceAssignments": voice_assignments,
        "clips": clips,
        "failures": failures,
    }
    _write_json(manifest_path, manifest)
    return {
        "clipsGenerated": clips_generated,
        "clipsReused": clips_reused,
        "failures": failures,
        "manifest": {
            "articleId": article_id,
            "manifestPath": _relative(manifest_path),
            "manifestUrl": _media_url(run_id, manifest_path, run_dir),
            "failures": failures,
        },
    }


def _clip_record(
    run_id: str,
    clip_id: str,
    beat_id: str,
    line_index: int,
    speaker: str,
    clip_path: Path,
    line_hash: str,
) -> dict[str, object]:
    return {
        "clipId": clip_id,
        "beatId": beat_id,
        "lineIndex": line_index,
        "speaker": speaker,
        "path": _relative(clip_path),
        "url": _media_url(run_id, clip_path, _run_directory(run_id)),
        "durationSeconds": _duration_seconds(clip_path),
        "lineHash": line_hash,
    }


def _voice_assignments(article_id: str, cast: list[object]) -> dict[str, str]:
    members = [item for item in cast if isinstance(item, dict) and item.get("id")]
    offset = int(hashlib.sha256(article_id.encode("utf-8")).hexdigest(), 16) % len(AUDIO_VOICES)
    return {
        str(member["id"]): AUDIO_VOICES[(offset + index) % len(AUDIO_VOICES)]
        for index, member in enumerate(members)
    }


def _line_hash(text: str, speaker: str, language: str, voice: str) -> str:
    value = f"{AUDIO_MODEL}|{language}|{speaker}|{voice}|{text}"
    return hashlib.sha256(value.encode("utf-8")).hexdigest()


def _duration_seconds(path: Path) -> float:
    with wave.open(str(path), "rb") as audio_file:
        return round(audio_file.getnframes() / audio_file.getframerate(), 3)


def _run_directory(run_id: str) -> Path:
    if not re.fullmatch(r"\d{4}-\d{2}-\d{2}_[A-Za-z0-9]+", run_id):
        raise AudioWorkflowInputError("runId is invalid.")
    run_dir = (SCRIPTS_DIR / run_id).resolve()
    if not run_dir.is_dir():
        raise AudioWorkflowInputError("Script run not found.")
    return run_dir


def _script_path(run_dir: Path, relative_path: str) -> Path:
    path = (BASE_DIR / relative_path).resolve()
    if not path.is_file() or run_dir not in path.parents:
        raise AudioWorkflowInputError("Script file not found.")
    return path


def _media_url(run_id: str, path: Path, run_dir: Path) -> str:
    return f"/api/media/{run_id}/{path.relative_to(run_dir).as_posix()}"


def _read_json(path: Path) -> dict[str, Any]:
    with path.open("r", encoding="utf-8") as input_file:
        payload = json.load(input_file)
    if not isinstance(payload, dict):
        raise AudioWorkflowInputError("Expected a JSON object.")
    return payload


def _write_json(path: Path, payload: dict[str, object]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("w", encoding="utf-8") as output_file:
        json.dump(payload, output_file, ensure_ascii=False, indent=2)
        output_file.write("\n")


def _safe_filename(value: str) -> str:
    return re.sub(r"[^A-Za-z0-9._-]+", "_", value).strip("._") or "story"


def _relative(path: Path) -> str:
    return path.relative_to(BASE_DIR).as_posix()
