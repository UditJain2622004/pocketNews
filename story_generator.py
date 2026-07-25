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
CAST_MODES = ("auto", "story_duo", "recurring_duo")
VISUAL_STYLES = ("animated", "live_action")
_STORY_CACHE: dict[str, dict[str, object]] = {}
_CACHE_LOCK = Lock()


class StoryGenerationError(RuntimeError):
    pass


class VoiceCharacter(BaseModel):
    id: str
    role: str
    voiceProfile: str
    language: str
    visualIdentity: str


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
    scenePrompt: str
    continuityNotes: str
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


class CreativeDirection(BaseModel):
    genre: str
    dramaticPremise: str
    performanceMode: Literal["character-dialogue", "multi-character-self-talk"]
    castMode: Literal["story_duo", "recurring_duo"]
    visualStyle: Literal["animated", "live_action"]


class VisualBible(BaseModel):
    setting: str
    colorAndLighting: str
    recurringProps: list[str] = Field(min_items=1, max_items=4)
    storyArc: str
    referenceImagePrompt: str


class GeneratedStory(BaseModel):
    title: str
    skipLabel: str
    classification: StoryClassification
    creativeDirection: CreativeDirection
    visualBible: VisualBible
    cast: list[VoiceCharacter]
    beats: list[StoryBeat]
    exit: str


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

    story = generated.dict()
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
    return f"""
You write one accurate, cinematic fictional short-film scene that carries a news story.
Return only the structured story required by the schema.

Target narration language: {language}
Required format: {story_format}
Requested cast mode: {cast_mode}
Requested visual style: {visual_style}

Classify the story using exactly one category and one or two subcategories from this fixed taxonomy:
{taxonomy_prompt()}

Rules:
- Use only facts in the supplied article. Do not add claims, quotes, dates, motives, or outcomes.
- This must feel like a miniature movie, not a news bulletin, explainer, reporter script, or article summary.
- Reveal the news through a fictional dramatic situation: a discovery, disagreement, chase for an answer, emotional turn, mystery, or escalating consequence.
- Choose a genre that makes the story compelling: comedy, drama, mystery, thriller, emotional drama, light horror, or another suitable genre. Treat sensitive events with appropriate care.
- Make the entertainment come from fictional framing, action, and reactions, never invented facts.
- Do not imitate any real person's voice or write generated dialogue as a quote from a real person.
- Use two or more original fictional performers only. Every spoken line must name a speaker from cast.
- If requested cast mode is auto, choose either a custom two-character scene or multi-character self-talk. If story_duo, create exactly two new fictional characters. If recurring_duo, use exactly Mira and Kabir: Mira is an impulsive, sharp-eyed Indian creative strategist with a cropped black bob, amber jacket, and silver ear cuff; Kabir is a calm, deadpan Indian systems thinker with close-cropped hair, round glasses, and a forest-green overshirt. Preserve these names, personalities, and visual identities.
- creativeDirection.visualStyle must exactly equal the requested visual style. creativeDirection.castMode must be story_duo or recurring_duo, never auto.
- No detached narrator is allowed. Every fact must surface through character dialogue, self-talk, discovery, or visible consequence.
- The title-cue beat must be first. Its first line must start with "Quick story:" and clearly name the news item so it can be skipped.
- Return exactly five beats in this order: title-cue, hook, what-happened, why-it-matters, takeaway.
- Make the complete scene about 45 to 90 seconds. Keep spoken lines short and natural for text-to-speech.
- Build a visual bible that fixes character appearance, wardrobe, setting, props, color/lighting, and story arc for the entire scene. The reference image prompt must establish every recurring character together in the core location.
- Every beat must be a consecutive shot in one continuous scene. Include a scene prompt and continuity notes explaining what must remain from the previous shot and what advances.
- Each beat image prompt needs subject, action, setting, camera, lighting, mood, the recurring visual details, caption-safe upper-third space, and "no text, logos, or watermark".
- For animated style, use editorial animated-film imagery. For live_action style, use fictional actors and clearly cinematic staging, never fake documentary evidence. Avoid depicting real public figures performing unverified actions.
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


def _validate_creative_options(cast_mode: str, visual_style: str) -> None:
    if cast_mode not in CAST_MODES:
        raise StoryGenerationError(f"Unsupported cast mode. Use one of: {', '.join(CAST_MODES)}.")
    if visual_style not in VISUAL_STYLES:
        raise StoryGenerationError(f"Unsupported visual style. Use one of: {', '.join(VISUAL_STYLES)}.")
