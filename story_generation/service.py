"""OpenAI-backed story generation orchestration and compatibility behavior."""
from __future__ import annotations

import copy
import hashlib
import os
from pathlib import Path
from threading import Lock

from dotenv import load_dotenv
from openai import OpenAI

from news_adapter import NewsArticle
from story_generation.parameter_registry import validate_parameters
from story_generation.prompt_builder import system_prompt
from story_generation.schema import GeneratedStory


BASE_DIR = Path(__file__).resolve().parent.parent
load_dotenv(BASE_DIR / ".env")
MODEL = os.getenv("OPENAI_MODEL", "gpt-5.6")
_STORY_CACHE: dict[str, dict[str, object]] = {}
_CACHE_LOCK = Lock()


class StoryGenerationError(RuntimeError):
    pass


def generate_story(
    article: NewsArticle,
    story_format: str,
    language: str,
    cast_mode: str = "auto",
    visual_style: str = "animated",
) -> dict[str, object]:
    if not os.getenv("OPENAI_API_KEY"):
        raise StoryGenerationError("OPENAI_API_KEY is not configured.")

    article_text = article.best_available_text[:12000]
    _validate_creative_options(cast_mode, visual_style)
    cache_key = _cache_key(article, story_format, language, cast_mode, visual_style)
    with _CACHE_LOCK:
        cached_story = _STORY_CACHE.get(cache_key)
    if cached_story is not None:
        return copy.deepcopy(cached_story)

    try:
        response = OpenAI().responses.parse(
            model=MODEL,
            input=[
                {"role": "system", "content": _system_prompt(story_format, language, cast_mode, visual_style)},
                {"role": "user", "content": _article_prompt(article, article_text)},
            ],
            text_format=GeneratedStory,
        )
    except Exception as error:
        raise StoryGenerationError("OpenAI story generation request failed.") from error

    generated = response.output_parsed
    if generated is None:
        raise StoryGenerationError("OpenAI returned no structured story output.")

    story = _repair_generated_text(generated.dict())
    story["storyId"] = article.id
    story["category"] = story["classification"]["category"]
    story["sourceCategory"] = _primary_category(article.categories)
    story["topics"] = article.categories
    story["format"] = story_format
    story["requestedCastMode"] = cast_mode
    story["requestedVisualStyle"] = visual_style
    story["sources"] = [{"name": article.source_name, "url": article.url, "publishedAt": article.published_at}]
    story["durationSeconds"] = sum(beat["visual"]["durationSeconds"] for beat in story["beats"])
    story["entry"] = {
        "direct": _title_cue(story["title"]),
        "afterRelated": f"Staying with this thread: {story['title']}.",
        "afterUnrelated": f"Different kind of plot twist: {story['title']}.",
    }
    with _CACHE_LOCK:
        _STORY_CACHE[cache_key] = copy.deepcopy(story)
    return story


def _cache_key(
    article: NewsArticle,
    story_format: str,
    language: str,
    cast_mode: str,
    visual_style: str,
) -> str:
    source_hash = hashlib.sha256(article.best_available_text.encode("utf-8")).hexdigest()
    return f"{article.id}:{source_hash}:{story_format}:{language}:{cast_mode}:{visual_style}:{MODEL}"


def _system_prompt(story_format: str, language: str, cast_mode: str, visual_style: str) -> str:
    return system_prompt(story_format, language, cast_mode, visual_style)


def _article_prompt(article: NewsArticle, article_text: str) -> str:
    return f"""
Create a story from this source material.

Article ID: {article.id}
Headline: {article.title}
Source categories: {", ".join(article.categories)}
Source: {article.source_name}
Published: {article.published_at or "not supplied"}
Article text:
{article_text}
""".strip()


def _primary_category(categories: list[str]) -> str:
    return next((category for category in categories if category != "top"), "top")


def _title_cue(title: str) -> str:
    return f"Quick story: {title}."


def _validate_creative_options(cast_mode: str, visual_style: str) -> None:
    try:
        validate_parameters({"cast_mode": cast_mode, "visual_style": visual_style})
    except ValueError as error:
        raise StoryGenerationError(str(error)) from error


def _repair_generated_text(value: object) -> object:
    if isinstance(value, dict):
        return {key: _repair_generated_text(item) for key, item in value.items()}
    if isinstance(value, list):
        return [_repair_generated_text(item) for item in value]
    if not isinstance(value, str) or not any(marker in value for marker in ("Ã", "â")):
        return value
    try:
        return value.encode("latin-1").decode("utf-8")
    except UnicodeError:
        return value
