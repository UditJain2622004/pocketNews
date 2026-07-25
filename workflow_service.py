"""Filesystem workflow for generating and persisting news story modules."""
from __future__ import annotations

from concurrent.futures import ThreadPoolExecutor, as_completed
from datetime import date, datetime, timezone
import json
import os
from pathlib import Path
import re
import secrets
from typing import Any

from audio_workflow import prepare_story_audio
from editorial_selection import select_story_candidates
from episode_title_generator import generate_episode_title
from episode_service import story_format_for_index, supported_story_formats
from news_adapter import NewsArticle, normalize_news_feed
from story_generator import CAST_MODES, VISUAL_STYLES, generate_story
from visual_story_service import generate_story_visuals


BASE_DIR = Path(__file__).resolve().parent
ARTICLES_DIR = BASE_DIR / "articles"
SCRIPTS_DIR = BASE_DIR / "scripts"
MAX_PARALLEL_REQUESTS = max(1, int(os.getenv("OPENAI_MAX_PARALLEL_REQUESTS", "6")))


class WorkflowInputError(ValueError):
    pass


def run_script_workflow(
    run_date: str | None,
    language: str,
    generate_images: bool = True,
    generate_audio: bool = True,
    cast_mode: str = "auto",
    visual_style: str = "animated",
    source_root: Path | None = None,
    input_dir: Path | None = None,
    cadence: str = "daily",
    max_articles_per_category: int | None = None,
    max_total_stories: int | None = None,
    three_images_per_story: bool = False,
    story_format: str = "auto",
) -> dict[str, object]:
    if cast_mode not in CAST_MODES:
        raise WorkflowInputError(f"Unsupported cast mode. Use one of: {', '.join(CAST_MODES)}.")
    if visual_style not in VISUAL_STYLES:
        raise WorkflowInputError(f"Unsupported visual style. Use one of: {', '.join(VISUAL_STYLES)}.")
    if story_format != "auto" and story_format not in supported_story_formats():
        raise WorkflowInputError(f"Unsupported story format. Use auto or one of: {', '.join(supported_story_formats())}.")
    selected_date = _resolve_date(run_date)
    resolved_input_dir = input_dir or (source_root or ARTICLES_DIR) / selected_date.isoformat()
    if not resolved_input_dir.is_dir():
        raise WorkflowInputError(f"Article folder does not exist: {resolved_input_dir}")

    run_id = f"{selected_date.isoformat()}_{secrets.token_hex(4)}"
    output_dir = SCRIPTS_DIR / run_id
    output_dir.mkdir(parents=True, exist_ok=False)

    failures: list[dict[str, str]] = []
    generated_scripts: list[dict[str, object]] = []
    articles_found = 0
    images_generated = 0
    started_at = datetime.now(timezone.utc).isoformat()
    article_jobs: list[tuple[int, NewsArticle, Path]] = []

    for source_file in sorted(path for path in resolved_input_dir.glob("*.json") if path.name != "manifest.json"):
        try:
            articles = _read_articles(source_file)
        except Exception as error:
            failures.append({"articleId": "", "sourceFile": _relative(source_file), "error": str(error)})
            continue

        for article in articles:
            articles_found += 1
            article_jobs.append((len(article_jobs), article, source_file))

    selected_jobs, selection = select_story_candidates(
        article_jobs, max_articles_per_category, max_total_stories
    )
    generated_stories = _generate_stories(selected_jobs, language, cast_mode, visual_style, story_format, failures)
    episode_title = generate_episode_title([story for _, _, _, story in generated_stories], cadence)
    image_paths = _generate_images(output_dir, generated_stories, failures, three_images_per_story) if generate_images else {}
    images_generated = sum(len(paths) for paths in image_paths.values())

    for index, article, source_file, story in generated_stories:
        script_path = _write_story(output_dir, article, source_file, story)
        generated_scripts.append(
            {
                "articleId": article.id,
                "sourceFile": _relative(source_file),
                "scriptPath": _relative(script_path),
                "imagePaths": image_paths.get(index, []),
            }
        )

    manifest = {
        "runId": run_id,
        "runDate": selected_date.isoformat(),
        "cadence": cadence,
        "episodeTitle": episode_title,
        "language": language,
        "startedAt": started_at,
        "articlesFound": articles_found,
        "articlesSelected": len(selected_jobs),
        "selection": selection,
        "scriptsGenerated": len(generated_scripts),
        "imagesGenerated": images_generated,
        "generateImages": generate_images,
        "threeImagesPerStory": three_images_per_story,
        "generateAudio": generate_audio,
        "castMode": cast_mode,
        "visualStyle": visual_style,
        "storyFormat": story_format,
        "scripts": generated_scripts,
        "failures": failures,
    }
    manifest_path = output_dir / "manifest.json"
    _write_json(manifest_path, manifest)

    audio_result: dict[str, object] | None = None
    if generate_audio and generated_scripts:
        try:
            audio_result = prepare_story_audio(run_id)
            failures.extend(audio_result["failures"])
        except Exception as error:
            failures.append({"articleId": "", "sourceFile": "", "error": str(error)})

    if audio_result is not None:
        manifest["audio"] = audio_result
    manifest["failures"] = failures
    _write_json(manifest_path, manifest)

    return {
        "runId": run_id,
        "cadence": cadence,
        "episodeTitle": episode_title,
        "outputPath": _relative(output_dir),
        "articlesFound": articles_found,
        "articlesSelected": len(selected_jobs),
        "selection": selection,
        "scriptsGenerated": len(generated_scripts),
        "imagesGenerated": images_generated,
        "generateImages": generate_images,
        "threeImagesPerStory": three_images_per_story,
        "generateAudio": generate_audio,
        "castMode": cast_mode,
        "visualStyle": visual_style,
        "storyFormat": story_format,
        "audio": audio_result,
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


def _generate_stories(
    article_jobs: list[tuple[int, NewsArticle, Path]],
    language: str,
    cast_mode: str,
    visual_style: str,
    story_format: str,
    failures: list[dict[str, str]],
) -> list[tuple[int, NewsArticle, Path, dict[str, object]]]:
    generated_stories: list[tuple[int, NewsArticle, Path, dict[str, object]]] = []
    with ThreadPoolExecutor(max_workers=MAX_PARALLEL_REQUESTS) as executor:
        futures = {
            executor.submit(
                generate_story,
                article,
                story_format_for_index(index) if story_format == "auto" else story_format,
                language,
                cast_mode,
                visual_style,
            ): (index, article, source_file)
            for index, article, source_file in article_jobs
        }
        for future in as_completed(futures):
            index, article, source_file = futures[future]
            try:
                generated_stories.append((index, article, source_file, future.result()))
            except Exception as error:
                failures.append(
                    {
                        "articleId": article.id,
                        "sourceFile": _relative(source_file),
                        "error": str(error),
                    }
                )
    return sorted(generated_stories, key=lambda item: item[0])


def _generate_images(
    output_dir: Path,
    generated_stories: list[tuple[int, NewsArticle, Path, dict[str, object]]],
    failures: list[dict[str, str]],
    three_images_per_story: bool,
) -> dict[int, list[str]]:
    image_paths: dict[int, list[str]] = {index: [] for index, _, _, _ in generated_stories}
    with ThreadPoolExecutor(max_workers=MAX_PARALLEL_REQUESTS) as executor:
        futures = {
            executor.submit(generate_story_visuals, output_dir, source_file, article.id, story, three_images_per_story): (index, article, source_file)
            for index, article, source_file, story in generated_stories
        }
        for future in as_completed(futures):
            index, article, source_file = futures[future]
            try:
                result = future.result()
                image_paths[index].extend(result["paths"])
                for failure in result.get("failures", []):
                    failures.append(
                        {
                            "articleId": article.id,
                            "sourceFile": _relative(source_file),
                            "beatId": str(failure.get("beatId") or "image"),
                            "error": str(failure.get("error") or "Image generation failed."),
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

    for paths in image_paths.values():
        paths.sort()
    return image_paths


def _write_json(path: Path, payload: dict[str, object]) -> None:
    with path.open("w", encoding="utf-8") as output_file:
        json.dump(payload, output_file, ensure_ascii=False, indent=2)
        output_file.write("\n")


def _safe_filename(value: str) -> str:
    return re.sub(r"[^A-Za-z0-9._-]+", "_", value).strip("._") or "article"


def _relative(path: Path) -> str:
    return path.relative_to(BASE_DIR).as_posix()


