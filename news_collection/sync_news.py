"""Archive the shared-profile news categories for scheduled workflows."""
from __future__ import annotations

import asyncio
from datetime import date, datetime, timezone
import json
from pathlib import Path

from .rss_service import fetch_google_news_rss
from .taxonomy import NEWS_TAXONOMY


BASE_DIR = Path(__file__).resolve().parent.parent
NEWS_DIR = BASE_DIR / "news" / "daily"


async def run_news_sync(run_date: date | None = None, categories: list[str] | None = None) -> dict[str, object]:
    selected_date = run_date or datetime.now().date()
    selected_categories = categories or list(NEWS_TAXONOMY)
    target_dir = NEWS_DIR / selected_date.isoformat()
    target_dir.mkdir(parents=True, exist_ok=True)
    started_at = datetime.now(timezone.utc).isoformat()
    results: dict[str, object] = {}

    for category in selected_categories:
        if category not in NEWS_TAXONOMY:
            results[category] = {"status": "error", "error": "Unsupported category."}
            continue
        try:
            response = await fetch_google_news_rss(category=category, article_date=selected_date)
            payload_path = target_dir / f"{category}.json"
            with payload_path.open("w", encoding="utf-8") as output_file:
                json.dump(response, output_file, ensure_ascii=False, indent=2)
                output_file.write("\n")
            results[category] = {
                "status": response.get("status", "error"),
                "articlesCount": len(response.get("results", [])),
                "path": str(payload_path.relative_to(BASE_DIR)).replace("\\", "/"),
                "error": response.get("message"),
            }
        except Exception as error:
            results[category] = {"status": "error", "articlesCount": 0, "error": str(error)}

    manifest = {
        "runDate": selected_date.isoformat(),
        "startedAt": started_at,
        "completedAt": datetime.now(timezone.utc).isoformat(),
        "articleDate": selected_date.isoformat(),
        "source": {
            "provider": "Google News RSS",
            "country": "IN",
            "language": "en-IN",
            "relevanceTerm": "India",
        },
        "categories": results,
    }
    with (target_dir / "manifest.json").open("w", encoding="utf-8") as output_file:
        json.dump(manifest, output_file, ensure_ascii=False, indent=2)
        output_file.write("\n")
    return manifest


if __name__ == "__main__":
    asyncio.run(run_news_sync())
