"""Generate a compact, cinematic title for a completed episode run."""
from __future__ import annotations

import os
import re
from typing import Any

from openai import OpenAI

from story_generator import MODEL


def generate_episode_title(stories: list[dict[str, Any]], cadence: str) -> str:
    fallback = _fallback_title(stories, cadence)
    if not stories or not os.getenv("OPENAI_API_KEY"):
        return fallback

    outline = [
        {
            "title": story.get("title", ""),
            "category": story.get("category") or story.get("classification", {}).get("category", ""),
            "premise": story.get("creativeDirection", {}).get("dramaticPremise", ""),
        }
        for story in stories
    ]
    try:
        response = OpenAI().responses.create(
            model=MODEL,
            input=(
                "Name this PocketNews cinematic news episode. Return only one short, memorable title, "
                "4 to 8 words. It should feel like a movie title, be accurate to the combined stories, "
                "and avoid generic words such as 'brief', 'recap', 'daily', or 'news'.\n\n"
                f"Cadence: {cadence}\nStories: {outline}"
            ),
        )
        title = _clean_title(response.output_text)
        return title or fallback
    except Exception:
        return fallback


def _fallback_title(stories: list[dict[str, Any]], cadence: str) -> str:
    first_title = str(stories[0].get("title") or "").strip() if stories else ""
    return first_title or f"{cadence.title()} Edition"


def _clean_title(value: str | None) -> str:
    title = re.sub(r"\s+", " ", (value or "").strip().strip("\"'`"))
    return title[:100]
