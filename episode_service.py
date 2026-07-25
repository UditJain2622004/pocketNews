"""Episode selection and composition for independently generated story modules."""
from __future__ import annotations

from typing import Iterable

from news_adapter import NewsArticle


STORY_FORMATS = (
    "solo-hot-take",
    "two-person-banter",
    "dramatized-pov",
)


def supported_story_formats() -> tuple[str, ...]:
    return STORY_FORMATS


def select_articles(
    articles: Iterable[NewsArticle], interests: list[str], story_count: int
) -> list[NewsArticle]:
    requested = set(interests)
    candidates = [article for article in articles if requested.intersection(article.categories)] or list(articles)
    selected: list[NewsArticle] = []
    used_categories: set[str] = set()

    for article in candidates:
        category = _primary_category(article.categories)
        if category not in used_categories:
            selected.append(article)
            used_categories.add(category)
        if len(selected) == story_count:
            return selected

    for article in candidates:
        if article not in selected:
            selected.append(article)
        if len(selected) == story_count:
            break
    return selected


def compose_episode(
    stories: list[dict[str, object]],
    interests: list[str],
    cadence: str,
    language: str,
) -> dict[str, object]:
    return {
        "title": _episode_title(interests),
        "cadence": cadence,
        "language": language,
        "interests": interests,
        "intro": "Your quick news scene is ready. Pick a story, or press play and let the plot thicken.",
        "outro": "That is the update. Knowledge acquired, endless scrolling postponed.",
        "storyCount": len(stories),
        "estimatedDurationSeconds": sum(story["durationSeconds"] for story in stories),
        "stories": stories,
        "playbackPlan": _build_playback_plan(stories),
    }


def story_format_for_index(index: int) -> str:
    return STORY_FORMATS[index % len(STORY_FORMATS)]


def _build_playback_plan(stories: list[dict[str, object]]) -> list[dict[str, object]]:
    plan: list[dict[str, object]] = []
    previous_story: dict[str, object] | None = None
    for story in stories:
        entry = story["entry"]
        is_related = previous_story is not None and story["category"] == previous_story["category"]
        entry_variant = "direct" if previous_story is None else "afterRelated" if is_related else "afterUnrelated"
        plan.append(
            {
                "storyId": story["storyId"],
                "titleCueBeatId": "title-cue",
                "entryVariant": entry_variant,
                "entryText": entry[entry_variant],
                "skipEntryText": entry["direct"],
            }
        )
        previous_story = story
    return plan


def _primary_category(categories: list[str]) -> str:
    return next((category for category in categories if category != "top"), "top")


def _episode_title(interests: list[str]) -> str:
    focus = " + ".join(item.title() for item in interests[:2] if item != "top") or "Today"
    return f"{focus} in motion"
