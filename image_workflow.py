"""Cache-first image generation for saved PocketNews script runs."""
from __future__ import annotations

from concurrent.futures import ThreadPoolExecutor, as_completed
import json
import os
from pathlib import Path
import re
from typing import Any

from visual_story_service import generate_story_visuals


BASE_DIR = Path(__file__).resolve().parent
SCRIPTS_DIR = BASE_DIR / "scripts"
MAX_PARALLEL_REQUESTS = max(1, int(os.getenv("OPENAI_MAX_PARALLEL_REQUESTS", "6")))


class ImageWorkflowInputError(ValueError):
    pass


def prepare_story_images(folder_name: str) -> dict[str, object]:
    run_dir = _run_directory(folder_name)
    run_manifest_path = run_dir / "manifest.json"
    run_manifest = _read_json(run_manifest_path)
    script_entries = run_manifest.get("scripts")
    if not isinstance(script_entries, list):
        raise ImageWorkflowInputError("The script run does not contain a script manifest.")

    loaded_scripts: list[tuple[dict[str, object], Path, dict[str, Any]]] = []
    failures: list[dict[str, str]] = []
    for entry in script_entries:
        if not isinstance(entry, dict):
            continue
        article_id = str(entry.get("articleId") or "")
        try:
            script_path = _script_path(run_dir, str(entry.get("scriptPath") or ""))
            loaded_scripts.append((entry, script_path, _read_json(script_path)))
        except Exception as error:
            failures.append({"articleId": article_id, "error": str(error)})

    images_generated = 0
    images_reused = 0
    with ThreadPoolExecutor(max_workers=MAX_PARALLEL_REQUESTS) as executor:
        futures = {
            executor.submit(_prepare_saved_story_images, run_dir, entry, script_path, script): (entry, script_path, script)
            for entry, script_path, script in loaded_scripts
        }
        for future in as_completed(futures):
            entry, script_path, script = futures[future]
            article_id = str(entry.get("articleId") or script_path.stem)
            try:
                result = future.result()
                entry["imagePaths"] = result["paths"]
                images_generated += result["generated"]
                images_reused += result["reused"]
                failures.extend(
                    {
                        "articleId": article_id,
                        "beatId": str(failure.get("beatId") or "image"),
                        "error": str(failure.get("error") or "Image generation failed."),
                    }
                    for failure in result.get("failures", [])
                )
                _write_json(script_path, script)
            except Exception as error:
                failures.append(
                    {
                        "articleId": article_id,
                        "error": str(error),
                    }
                )

    run_manifest["imagesGenerated"] = images_generated + images_reused
    run_manifest["imagePreparation"] = {
        "imagesGenerated": images_generated,
        "imagesReused": images_reused,
        "failures": failures,
    }
    _write_json(run_manifest_path, run_manifest)

    return {
        "folderName": folder_name,
        "scriptsFound": len(loaded_scripts),
        "imagesGenerated": images_generated,
        "imagesReused": images_reused,
        "failures": failures,
    }


def _prepare_saved_story_images(
    run_dir: Path,
    entry: dict[str, object],
    script_path: Path,
    script: dict[str, Any],
) -> dict[str, object]:
    story = script.get("story")
    if not isinstance(story, dict):
        raise ImageWorkflowInputError("Script does not contain a story module.")
    article = script.get("article")
    article_id = str(article.get("id") or entry.get("articleId") or script_path.stem) if isinstance(article, dict) else script_path.stem
    return generate_story_visuals(run_dir, str(script.get("sourceFile") or "uncategorized"), article_id, story)


def _run_directory(folder_name: str) -> Path:
    if not re.fullmatch(r"\d{4}-\d{2}-\d{2}_[A-Za-z0-9]+", folder_name):
        raise ImageWorkflowInputError("folderName is invalid.")
    run_dir = (SCRIPTS_DIR / folder_name).resolve()
    if not run_dir.is_dir():
        raise ImageWorkflowInputError("Script folder not found.")
    return run_dir


def _script_path(run_dir: Path, relative_path: str) -> Path:
    path = (BASE_DIR / relative_path).resolve()
    if not path.is_file() or run_dir not in path.parents:
        raise ImageWorkflowInputError("Script file not found.")
    return path


def _read_json(path: Path) -> dict[str, Any]:
    with path.open("r", encoding="utf-8") as input_file:
        payload = json.load(input_file)
    if not isinstance(payload, dict):
        raise ImageWorkflowInputError("Expected a JSON object.")
    return payload


def _write_json(path: Path, payload: dict[str, object]) -> None:
    with path.open("w", encoding="utf-8") as output_file:
        json.dump(payload, output_file, ensure_ascii=False, indent=2)
        output_file.write("\n")


def _safe_filename(value: str) -> str:
    return re.sub(r"[^A-Za-z0-9._-]+", "_", value).strip("._") or "story"


def _relative(path: Path) -> str:
    return path.relative_to(BASE_DIR).as_posix()
