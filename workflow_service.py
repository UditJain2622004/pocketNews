"""Filesystem workflow for generating and persisting news story modules."""
from __future__ import annotations

from datetime import date, datetime, timezone
import json
from pathlib import Path
import re
import secrets
from typing import Any

from episode_service import story_format_for_index
from image_generator import generate_story_image
from news_adapter import NewsArticle, normalize_news_feed
from story_generator import generate_story


BASE_DIR = Path(__file__).resolve().parent
ARTICLES_DIR = BASE_DIR / "articles"
SCRIPTS_DIR = BASE_DIR / "scripts"


class WorkflowInputError(ValueError):
    pass


def run_script_workflow(run_date: str | None, language: str) -> dict[str, object]:
    selected_date = _resolve_date(run_date)
    input_dir = ARTICLES_DIR / selected_date.isoformat()
    if not input_dir.is_dir():
        raise WorkflowInputError(f"Article folder does not exist: articles/{selected_date.isoformat()}")

    run_id = f"{selected_date.isoformat()}_{secrets.token_hex(4)}"
    output_dir = SCRIPTS_DIR / run_id
    output_dir.mkdir(parents=True, exist_ok=False)

    failures: list[dict[str, str]] = []
    generated_scripts: list[dict[str, object]] = []
    articles_found = 0
    images_generated = 0
    generation_index = 0
    started_at = datetime.now(timezone.utc).isoformat()

    for source_file in sorted(input_dir.glob("*.json")):
        try:
            articles = _read_articles(source_file)
        except Exception as error:
            failures.append({"articleId": "", "sourceFile": _relative(source_file), "error": str(error)})
            continue

        for article in articles:
            articles_found += 1
            try:
                story = generate_story(article, story_format_for_index(generation_index), language)
                image_paths, image_failures = _generate_story_images(
                    output_dir, article, source_file, story
                )
                images_generated += len(image_paths)
                failures.extend(image_failures)
                script_path = _write_story(output_dir, article, source_file, story)
                generated_scripts.append(
                    {
                        "articleId": article.id,
                        "sourceFile": _relative(source_file),
                        "scriptPath": _relative(script_path),
                        "imagePaths": image_paths,
                    }
                )
            except Exception as error:
                failures.append(
                    {
                        "articleId": article.id,
                        "sourceFile": _relative(source_file),
                        "error": str(error),
                    }
                )
            finally:
                generation_index += 1

    manifest = {
        "runId": run_id,
        "runDate": selected_date.isoformat(),
        "language": language,
        "startedAt": started_at,
        "articlesFound": articles_found,
        "scriptsGenerated": len(generated_scripts),
        "imagesGenerated": images_generated,
        "scripts": generated_scripts,
        "failures": failures,
    }
    manifest_path = output_dir / "manifest.json"
    _write_json(manifest_path, manifest)

    return {
        "runId": run_id,
        "outputPath": _relative(output_dir),
        "articlesFound": articles_found,
        "scriptsGenerated": len(generated_scripts),
        "imagesGenerated": images_generated,
        "failures": failures,
    }


def _resolve_date(run_date: str | None) -> date:
    if not run_date:
        return date.today()
    try:
        return date.fromisoformat(run_date)
    except ValueError as error:
        raise WorkflowInputError("date must use YYYY-MM-DD format.") from error


def _read_articles(source_file: Path) -> list[NewsArticle]:
    with source_file.open("r", encoding="utf-8-sig") as input_file:
        payload: Any = json.load(input_file)
    if isinstance(payload, list):
        payload = {"results": payload}
    if not isinstance(payload, dict):
        raise WorkflowInputError("Article file must contain a JSON object or array.")
    if not any(isinstance(payload.get(field), list) for field in ("results", "articles", "items", "data")):
        payload = {"results": [payload]}
    return normalize_news_feed(payload)


def _write_story(
    output_dir: Path,
    article: NewsArticle,
    source_file: Path,
    story: dict[str, object],
) -> Path:
    filename = _safe_filename(article.id) + ".json"
    output_path = output_dir / filename
    if output_path.exists():
        filename = f"{_safe_filename(source_file.stem)}_{filename}"
        output_path = output_dir / filename

    _write_json(
        output_path,
        {
            "article": article.to_dict(),
            "sourceFile": _relative(source_file),
            "story": story,
        },
    )
    return output_path


def _generate_story_images(
    output_dir: Path,
    article: NewsArticle,
    source_file: Path,
    story: dict[str, object],
) -> tuple[list[str], list[dict[str, str]]]:
    image_paths: list[str] = []
    failures: list[dict[str, str]] = []
    image_dir = output_dir / "images" / _safe_filename(source_file.stem) / _safe_filename(article.id)

    beats = story.get("beats")
    if not isinstance(beats, list):
        raise WorkflowInputError("Generated story does not contain visual beats.")

    for beat in beats:
        if not isinstance(beat, dict):
            continue
        beat_id = str(beat.get("id") or "visual")
        visual = beat.get("visual")
        if not isinstance(visual, dict):
            continue

        try:
            image_bytes = generate_story_image(str(visual.get("imagePrompt") or ""))
            image_path = image_dir / f"{_safe_filename(beat_id)}.png"
            image_path.parent.mkdir(parents=True, exist_ok=True)
            image_path.write_bytes(image_bytes)
            relative_path = _relative(image_path)
            visual["imagePath"] = relative_path
            image_paths.append(relative_path)
        except Exception as error:
            visual["imagePath"] = None
            failures.append(
                {
                    "articleId": article.id,
                    "sourceFile": _relative(source_file),
                    "beatId": beat_id,
                    "error": str(error),
                }
            )

    return image_paths, failures


def _write_json(path: Path, payload: dict[str, object]) -> None:
    with path.open("w", encoding="utf-8") as output_file:
        json.dump(payload, output_file, ensure_ascii=False, indent=2)
        output_file.write("\n")


def _safe_filename(value: str) -> str:
    return re.sub(r"[^A-Za-z0-9._-]+", "_", value).strip("._") or "article"


def _relative(path: Path) -> str:
    return path.relative_to(BASE_DIR).as_posix()


