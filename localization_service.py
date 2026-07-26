"""On-demand localized copies of a published canonical episode run."""
from __future__ import annotations

import json
from pathlib import Path
import secrets
import shutil
from typing import Any

from openai import OpenAI

from audio_workflow import prepare_story_audio
from publication_store import set_localized_run
from story_generator import MODEL


BASE_DIR = Path(__file__).resolve().parent
SCRIPTS_DIR = BASE_DIR / "scripts"
LANGUAGE_LOCALES = {"english": "en-IN", "hindi": "hi-IN", "marathi": "mr-IN", "bengali": "bn-IN", "tamil": "ta-IN", "kannada": "kn-IN", "spanish": "es-ES", "mandarin": "zh-CN", "german": "de-DE", "french": "fr-FR", "japanese": "ja-JP", "bhojpuri": "bho-IN"}


def locale_for_language(language: str) -> str:
    return LANGUAGE_LOCALES.get(language.casefold(), "en-IN")


def prepare_localized_episode(episode: dict[str, Any], language: str) -> str:
    locale = locale_for_language(language)
    if locale == "en-IN":
        return str(episode["runId"])
    source_run = str(episode["runId"])
    source_dir = SCRIPTS_DIR / source_run
    run_id = f"{source_run[:10]}_{locale.replace('-', '')}{secrets.token_hex(3)}"
    target_dir = SCRIPTS_DIR / run_id
    target_dir.mkdir(parents=True, exist_ok=False)
    if (source_dir / "images").is_dir():
        shutil.copytree(source_dir / "images", target_dir / "images")

    source_manifest = _read_json(source_dir / "manifest.json")
    target_entries = []
    for entry in source_manifest.get("scripts", []):
        script_path = BASE_DIR / str(entry["scriptPath"])
        payload = _read_json(script_path)
        _translate_story(payload["story"], language)
        _replace_run_paths(payload, source_run, run_id)
        target_path = target_dir / script_path.name
        _write_json(target_path, payload)
        updated_entry = dict(entry)
        updated_entry["scriptPath"] = f"scripts/{run_id}/{target_path.name}"
        target_entries.append(updated_entry)
    target_manifest = dict(source_manifest)
    target_manifest.update({"runId": run_id, "language": locale, "localizedFrom": source_run, "scripts": target_entries})
    _write_json(target_dir / "manifest.json", target_manifest)
    prepare_story_audio(run_id)
    set_localized_run(str(episode["episodeId"]), locale, run_id, "ready")
    return run_id


def _translate_story(story: dict[str, Any], language: str) -> None:
    lines = []
    for beat_index, beat in enumerate(story.get("beats", [])):
        for line_index, line in enumerate(beat.get("lines", [])):
            lines.append({"key": f"{beat_index}:{line_index}", "text": line.get("text", "")})
    response = OpenAI().chat.completions.create(
        model=MODEL,
        response_format={"type": "json_object"},
        messages=[
            {"role": "system", "content": f"Translate dialogue into natural {language}. Preserve facts, humor, emotional beats, speaker identities, and short sentence rhythm. Return JSON {{'lines': [{{'key': string, 'text': string}}]}} only."},
            {"role": "user", "content": json.dumps({"lines": lines}, ensure_ascii=False)},
        ],
    )
    translated = json.loads(response.choices[0].message.content or "{}")
    by_key = {item.get("key"): item.get("text") for item in translated.get("lines", []) if isinstance(item, dict)}
    for beat_index, beat in enumerate(story.get("beats", [])):
        for line_index, line in enumerate(beat.get("lines", [])):
            line["text"] = by_key.get(f"{beat_index}:{line_index}") or line.get("text", "")
    for cast_member in story.get("cast", []):
        cast_member["language"] = language


def _replace_run_paths(value: Any, old_run: str, new_run: str) -> Any:
    if isinstance(value, dict):
        for key, item in value.items():
            value[key] = _replace_run_paths(item, old_run, new_run)
    elif isinstance(value, list):
        for index, item in enumerate(value):
            value[index] = _replace_run_paths(item, old_run, new_run)
    elif isinstance(value, str):
        return value.replace(f"scripts/{old_run}/", f"scripts/{new_run}/")
    return value


def _read_json(path: Path) -> dict[str, Any]:
    with path.open("r", encoding="utf-8") as input_file:
        return json.load(input_file)


def _write_json(path: Path, payload: dict[str, Any]) -> None:
    with path.open("w", encoding="utf-8") as output_file:
        json.dump(payload, output_file, ensure_ascii=False, indent=2)
        output_file.write("\n")
