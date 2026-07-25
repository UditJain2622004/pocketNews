"""Independent daily, weekly, and monthly publishing workflows."""
from __future__ import annotations

import asyncio
from datetime import date, datetime, timedelta
import json
from pathlib import Path
from typing import Literal

from news_adapter import normalize_news_feed
from news_collection.sync_news import NEWS_DIR, run_news_sync
from publication_store import complete_workflow, fail_workflow, publish_episode, start_workflow
from shared_taxonomy import COLLECTOR_TAXONOMY
from summary_generator import generate_category_summary
from workflow_service import run_script_workflow


BASE_DIR = Path(__file__).resolve().parent
SUMMARY_DIR = BASE_DIR / "summaries"
WorkflowMode = Literal["fetch_only", "generate_only", "full"]
DEFAULT_MAX_ARTICLES_PER_CATEGORY = 3
DEFAULT_MAX_TOTAL_STORIES = 12


def run_daily_workflow(
    run_date: str | None = None,
    categories: list[str] | None = None,
    mode: WorkflowMode = "full",
    generate_images: bool = True,
    generate_audio: bool = True,
    cast_mode: str = "auto",
    visual_style: str = "animated",
    language: str = "en-IN",
    max_articles_per_category: int | None = DEFAULT_MAX_ARTICLES_PER_CATEGORY,
    max_total_stories: int | None = DEFAULT_MAX_TOTAL_STORIES,
) -> dict[str, object]:
    selected_date = date.fromisoformat(run_date) if run_date else date.today()
    selected_categories = categories or list(COLLECTOR_TAXONOMY)
    workflow_id = start_workflow("daily", (selected_date - timedelta(days=1)).isoformat(), selected_date.isoformat())
    try:
        result: dict[str, object] = {"workflowId": workflow_id, "cadence": "daily", "date": selected_date.isoformat()}
        if mode in ("fetch_only", "full"):
            result["ingestion"] = asyncio.run(run_news_sync(selected_date, selected_categories))
        if mode in ("generate_only", "full"):
            generation = run_script_workflow(
                selected_date.isoformat(), language, generate_images, generate_audio, cast_mode, visual_style,
                source_root=NEWS_DIR, cadence="daily",
                max_articles_per_category=max_articles_per_category,
                max_total_stories=max_total_stories,
            )
            result["generation"] = generation
            result["episode"] = publish_episode("daily", str(generation["runId"]), (selected_date - timedelta(days=1)).isoformat(), selected_date.isoformat())
        complete_workflow(workflow_id, result)
        return result
    except Exception as error:
        fail_workflow(workflow_id, str(error))
        raise


def run_weekly_workflow(run_date: str | None = None) -> dict[str, object]:
    period_end = date.fromisoformat(run_date) if run_date else date.today()
    period_start = period_end - timedelta(days=7)
    workflow_id = start_workflow("weekly", period_start.isoformat(), period_end.isoformat())
    try:
        summary_dir = _build_summaries("weekly", period_start, period_end, _daily_articles(period_start, period_end))
        generation = run_script_workflow(
            period_end.isoformat(), "en-IN", True, True, source_root=None, input_dir=summary_dir, cadence="weekly",
        )
        result = {
            "workflowId": workflow_id,
            "cadence": "weekly",
            "periodStart": period_start.isoformat(),
            "periodEnd": period_end.isoformat(),
            "summaryPath": _relative(summary_dir),
            "generation": generation,
            "episode": publish_episode("weekly", str(generation["runId"]), period_start.isoformat(), period_end.isoformat()),
        }
        complete_workflow(workflow_id, result)
        return result
    except Exception as error:
        fail_workflow(workflow_id, str(error))
        raise


def run_monthly_workflow(run_date: str | None = None) -> dict[str, object]:
    period_end = date.fromisoformat(run_date) if run_date else date.today()
    period_start = period_end - timedelta(days=30)
    workflow_id = start_workflow("monthly", period_start.isoformat(), period_end.isoformat())
    try:
        summary_dir = _build_summaries("monthly", period_start, period_end, _weekly_summary_articles(period_start, period_end))
        generation = run_script_workflow(
            period_end.isoformat(), "en-IN", True, True, source_root=None, input_dir=summary_dir, cadence="monthly",
        )
        result = {
            "workflowId": workflow_id,
            "cadence": "monthly",
            "periodStart": period_start.isoformat(),
            "periodEnd": period_end.isoformat(),
            "summaryPath": _relative(summary_dir),
            "generation": generation,
            "episode": publish_episode("monthly", str(generation["runId"]), period_start.isoformat(), period_end.isoformat()),
        }
        complete_workflow(workflow_id, result)
        return result
    except Exception as error:
        fail_workflow(workflow_id, str(error))
        raise


def _daily_articles(period_start: date, period_end: date) -> dict[str, list[dict[str, str]]]:
    grouped = {category: [] for category in COLLECTOR_TAXONOMY}
    seen: set[str] = set()
    current = period_start
    while current < period_end:
        folder = NEWS_DIR / current.isoformat()
        for category in grouped:
            payload_path = folder / f"{category}.json"
            if not payload_path.is_file():
                continue
            for article in normalize_news_feed(_read_json(payload_path)):
                if article.id in seen:
                    continue
                seen.add(article.id)
                grouped[category].append({"id": article.id, "title": article.title, "source": article.source_name, "text": article.best_available_text})
        current += timedelta(days=1)
    return grouped


def _weekly_summary_articles(period_start: date, period_end: date) -> dict[str, list[dict[str, str]]]:
    grouped = {category: [] for category in COLLECTOR_TAXONOMY}
    for folder in (SUMMARY_DIR / "weekly").glob("*") if (SUMMARY_DIR / "weekly").is_dir() else []:
        try:
            folder_date = date.fromisoformat(folder.name)
        except ValueError:
            continue
        if not period_start <= folder_date < period_end:
            continue
        for category in grouped:
            summary_path = folder / f"{category}.json"
            if summary_path.is_file():
                payload = _read_json(summary_path)
                grouped[category].append({"id": str(payload["article_id"]), "title": str(payload["title"]), "source": "PocketNews weekly", "text": str(payload["content"])})
    return grouped


def _build_summaries(cadence: str, period_start: date, period_end: date, grouped: dict[str, list[dict[str, str]]]) -> Path:
    output_dir = SUMMARY_DIR / cadence / period_end.isoformat()
    output_dir.mkdir(parents=True, exist_ok=True)
    for category, articles in grouped.items():
        if not articles:
            continue
        summary = generate_category_summary(COLLECTOR_TAXONOMY[category]["display"], f"{period_start} to {period_end}", articles)
        payload = {
            "results": [{
                "article_id": f"{cadence}-{period_end.isoformat()}-{category}",
                "title": f"{COLLECTOR_TAXONOMY[category]['display']} {cadence.title()} Recap",
                "description": summary,
                "content": summary,
                "category": [COLLECTOR_TAXONOMY[category]["display"]],
                "language": "english",
                "source": "PocketNews summary",
            }],
            "periodStart": period_start.isoformat(),
            "periodEnd": period_end.isoformat(),
            "sourceArticleIds": [article["id"] for article in articles],
        }
        with (output_dir / f"{category}.json").open("w", encoding="utf-8") as output_file:
            json.dump(payload, output_file, ensure_ascii=False, indent=2)
            output_file.write("\n")
    return output_dir


def _read_json(path: Path) -> dict:
    with path.open("r", encoding="utf-8") as input_file:
        return json.load(input_file)


def _relative(path: Path) -> str:
    return path.relative_to(BASE_DIR).as_posix()
