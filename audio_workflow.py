"""Cache-first filesystem workflow for PocketNews narration audio."""
from __future__ import annotations

from concurrent.futures import ThreadPoolExecutor, as_completed
import hashlib
import io
import json
import os
from pathlib import Path
import re
import struct
from typing import Any
import wave

from pydub import AudioSegment
from audio_generator import AUDIO_MODEL, AUDIO_VOICES, generate_story_line


BASE_DIR = Path(__file__).resolve().parent
SCRIPTS_DIR = BASE_DIR / "scripts"
MAX_PARALLEL_REQUESTS = max(1, int(os.getenv("OPENAI_MAX_PARALLEL_REQUESTS", "6")))
AUDIO_PROMPT_VERSION = "story-context-v4-podcast"
MAX_CLIP_DURATION_SECONDS = 60


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
    story_duration_ms = 0

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
            story_context = _story_audio_context(story, beat_id, line_index)
            line_hash = _line_hash(
                text,
                speaker,
                language,
                voice_assignments.get(speaker, ""),
                story_context,
            )
            clip_path = audio_dir / _safe_filename(beat_id) / f"{line_index}.wav"
            previous = previous_clips.get(clip_id, {})
            if previous.get("lineHash") == line_hash and clip_path.is_file():
                clips_reused += 1
                record = _clip_record(run_id, clip_id, beat_id, line_index, speaker, clip_path, line_hash)
                clips.append(record)
                story_duration_ms += int(record.get("durationSeconds", 0.0) * 1000)
                continue

            cast_member = next((item for item in cast if isinstance(item, dict) and item.get("id") == speaker), {})
            voice_profile = str(cast_member.get("voiceProfile") or "natural news narration")
            try:
                audio_bytes = generate_story_line(
                    text,
                    voice_assignments.get(speaker, AUDIO_VOICES[0]),
                    voice_profile,
                    language,
                    story_context,
                )
                
                # Dynamic Background Music Mixing
                category = str(story.get("category") or story.get("classification", {}).get("category") or "lifestyle")
                audio_bytes = _mix_background_music(audio_bytes, category, story_duration_ms)

                clip_path.parent.mkdir(parents=True, exist_ok=True)
                clip_path.write_bytes(audio_bytes)
                clips_generated += 1
                
                record = _clip_record(run_id, clip_id, beat_id, line_index, speaker, clip_path, line_hash)
                clips.append(record)
                story_duration_ms += int(record.get("durationSeconds", 0.0) * 1000)
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


def _line_hash(text: str, speaker: str, language: str, voice: str, story_context: str) -> str:
    value = f"{AUDIO_MODEL}|{AUDIO_PROMPT_VERSION}|{language}|{speaker}|{voice}|{story_context}|{text}"
    return hashlib.sha256(value.encode("utf-8")).hexdigest()


def _story_audio_context(story: dict[str, Any], target_beat_id: str, target_line_index: int) -> str:
    creative_direction = story.get("creativeDirection")
    dramatic_spine = story.get("dramaticSpine")
    context_lines = [
        f"Title: {story.get('title') or 'Untitled story'}",
        f"Genre: {creative_direction.get('genre') if isinstance(creative_direction, dict) else 'cinematic news story'}",
        f"Premise: {creative_direction.get('dramaticPremise') if isinstance(creative_direction, dict) else ''}",
    ]
    if isinstance(dramatic_spine, dict):
        context_lines.extend(
            [
                f"Character goal: {dramatic_spine.get('characterGoal') or ''}",
                f"Obstacle: {dramatic_spine.get('obstacle') or ''}",
                f"News catalyst: {dramatic_spine.get('newsCatalyst') or ''}",
                f"Emotional turn: {dramatic_spine.get('emotionalTurn') or ''}",
                f"Resolution: {dramatic_spine.get('resolution') or ''}",
            ]
        )

    for beat in story.get("beats") or []:
        if not isinstance(beat, dict):
            continue
        context_lines.append(f"[{beat.get('id') or 'beat'}] Action: {beat.get('dramaticAction') or ''}")
        for line_index, line in enumerate(beat.get("lines") or []):
            if beat.get("id") == target_beat_id and line_index == target_line_index:
                continue
            if isinstance(line, dict) and line.get("text"):
                context_lines.append(f"{line.get('speaker') or 'Speaker'}: {line['text']}")
    return "\n".join(context_lines)


def _duration_seconds(path: Path) -> float:
    with wave.open(str(path), "rb") as audio_file:
        frame_rate = audio_file.getframerate()
        frame_size = audio_file.getnchannels() * audio_file.getsampwidth()
        frame_count = _wav_data_size(path)
        if frame_count is None:
            frame_count = audio_file.getnframes() * frame_size
    duration = frame_count / (frame_rate * frame_size)
    return round(duration, 3) if 0 < duration <= MAX_CLIP_DURATION_SECONDS else 0.0


def _wav_data_size(path: Path) -> int | None:
    """Read the actual data chunk size when a WAV header uses an unknown-length marker."""
    with path.open("rb") as audio_file:
        if audio_file.read(12)[0:4] != b"RIFF":
            return None
        while True:
            chunk_header = audio_file.read(8)
            if len(chunk_header) != 8:
                return None
            chunk_id, declared_size = struct.unpack("<4sI", chunk_header)
            if chunk_id == b"data":
                if declared_size == 0xFFFFFFFF:
                    return path.stat().st_size - audio_file.tell()
                return declared_size
            audio_file.seek(declared_size + (declared_size % 2), 1)


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


_MUSIC_CACHE: dict[str, AudioSegment] = {}

CATEGORY_MUSIC_MAP = {
    "technology": "tech_ambient.mp3",
    "sports": "upbeat_groove.mp3",
    "entertainment": "upbeat_groove.mp3",
    "politics": "corporate_drone.mp3",
    "business": "corporate_drone.mp3",
    "science": "science_space.mp3",
    "lifestyle": "lofi_relax.mp3",
}


def _mix_background_music(speech_bytes: bytes, category: str, offset_ms: int) -> bytes:
    music_dir = Path("d:/2026/PocketNews/music")
    music_file = CATEGORY_MUSIC_MAP.get(category.lower(), "lofi_relax.mp3")
    music_path = music_dir / music_file

    if not music_path.is_file():
        return speech_bytes

    try:
        speech_segment = AudioSegment.from_file(io.BytesIO(speech_bytes), format="wav")
        speech_len_ms = len(speech_segment)

        path_str = str(music_path)
        if path_str not in _MUSIC_CACHE:
            _MUSIC_CACHE[path_str] = AudioSegment.from_file(music_path, format="mp3")

        music_segment = _MUSIC_CACHE[path_str]
        music_len_ms = len(music_segment)

        start_pos = offset_ms % music_len_ms
        end_pos = start_pos + speech_len_ms

        music_slice = music_segment[start_pos:end_pos]
        if len(music_slice) < speech_len_ms:
            music_slice += music_segment[0:(speech_len_ms - len(music_slice))]

        music_slice = music_slice - 24

        mixed = music_slice.overlay(speech_segment)

        out_buf = io.BytesIO()
        mixed.export(out_buf, format="wav")
        return out_buf.getvalue()
    except Exception as e:
        print(f"Warning: Background music mix failed: {e}")
        return speech_bytes
