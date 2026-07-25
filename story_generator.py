"""OpenAI-backed generation of reusable PocketNews story modules."""
from __future__ import annotations

import copy
import hashlib
import os
from pathlib import Path
from threading import Lock
from typing import Literal

from dotenv import load_dotenv
from openai import OpenAI
from pydantic import BaseModel, Field, root_validator

from news_adapter import NewsArticle
from taxonomy import SUGGESTED_INTERESTS, taxonomy_prompt


BASE_DIR = Path(__file__).resolve().parent
load_dotenv(BASE_DIR / ".env")
MODEL = os.getenv("OPENAI_MODEL", "gpt-5.6")
_STORY_CACHE: dict[str, dict[str, object]] = {}
_CACHE_LOCK = Lock()


class StoryGenerationError(RuntimeError):
    pass


class VoiceCharacter(BaseModel):
    id: str
    role: str
    voiceProfile: str
    language: str


class StoryLine(BaseModel):
    speaker: str
    text: str


class VisualDirection(BaseModel):
    kind: Literal[
        "factual-visual",
        "cinematic-recreation",
        "funny-metaphor",
        "character-reaction",
        "summary-visual",
    ]
    durationSeconds: int = Field(ge=3, le=14)
    caption: str
    imagePrompt: str
    motion: Literal["hold", "slow push-in", "gentle pan"]


class StoryBeat(BaseModel):
    id: Literal["title-cue", "hook", "what-happened", "why-it-matters", "takeaway"]
    visual: VisualDirection
    lines: list[StoryLine]


class StoryClassification(BaseModel):
    category: Literal["Technology", "Sports", "Business", "Entertainment", "Science", "Lifestyle"]
    subcategories: list[str] = Field(min_items=1, max_items=2)

    @root_validator
    def validate_subcategories(cls, values):
        category = values.get("category")
        subcategories = values.get("subcategories") or []
        valid_subcategories = set(SUGGESTED_INTERESTS.get(category, []))
        invalid = [item for item in subcategories if item not in valid_subcategories]
        if invalid:
            raise ValueError(f"Invalid subcategories for {category}: {', '.join(invalid)}")
        return values


class GeneratedStory(BaseModel):
    title: str
    skipLabel: str
    classification: StoryClassification
    cast: list[VoiceCharacter]
    beats: list[StoryBeat]
    exit: str


def generate_story(
    article: NewsArticle,
    story_format: str,
    language: str,
) -> dict[str, object]:
    if not os.getenv("OPENAI_API_KEY"):
        raise StoryGenerationError("OPENAI_API_KEY is not configured.")

    article_text = article.best_available_text[:12000]
    cache_key = _cache_key(article, story_format, language)
    with _CACHE_LOCK:
        cached_story = _STORY_CACHE.get(cache_key)
    if cached_story is not None:
        return copy.deepcopy(cached_story)

    try:
        response = OpenAI().responses.parse(
            model=MODEL,
            input=[
                {"role": "system", "content": _system_prompt(story_format, language)},
                {"role": "user", "content": _article_prompt(article, article_text)},
            ],
            text_format=GeneratedStory,
        )
    except Exception as error:
        raise StoryGenerationError("OpenAI story generation request failed.") from error

    generated = response.output_parsed
    if generated is None:
        raise StoryGenerationError("OpenAI returned no structured story output.")

    story = generated.dict()
    story["storyId"] = article.id
    story["category"] = story["classification"]["category"]
    story["sourceCategory"] = _primary_category(article.categories)
    story["topics"] = article.categories
    story["format"] = story_format
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


def _cache_key(article: NewsArticle, story_format: str, language: str) -> str:
    source_hash = hashlib.sha256(article.best_available_text.encode("utf-8")).hexdigest()
    return f"{article.id}:{source_hash}:{story_format}:{language}:{MODEL}"


def _system_prompt(story_format: str, language: str) -> str:
    return f"""
You write one accurate, funny, cinematic news scene for an AI news episode.
Return only the structured story required by the schema.

Target narration language: {language}
Required format: {story_format}

Classify the story using exactly one category and one or two subcategories from this fixed taxonomy:
{taxonomy_prompt()}

Rules:
- Use only facts in the supplied article. Do not add claims, quotes, dates, motives, or outcomes.
- Make the entertainment come from framing and reactions, not invented facts.
- Do not imitate any real person's voice or write generated dialogue as a quote from a real person.
- Use original fictional performers only. Every spoken line must name a speaker from cast.
- The title-cue beat must be first. Its first line must start with "Quick story:" and clearly name the news item so it can be skipped.
- Return exactly five beats in this order: title-cue, hook, what-happened, why-it-matters, takeaway.
- Make the complete scene about 45 to 90 seconds. Keep spoken lines short and natural for text-to-speech.
- Each beat needs a cinematic vertical 9:16 image prompt with subject, action, setting, camera, lighting, mood, caption-safe upper-third space, and "no text, logos, or watermark".
- Generated visuals must be editorial illustrations, not fake documentary evidence. Avoid depicting real public figures performing unverified actions.
- The final takeaway must make sense even when this is the only story a listener hears.
""".strip()


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
