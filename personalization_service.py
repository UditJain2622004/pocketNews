"""Small deterministic rules for user-specific episode ordering."""
from __future__ import annotations

from typing import Any, Iterable


def normalize_values(values: Iterable[Any] | None) -> set[str]:
    if isinstance(values, str):
        values = [values]
    return {
        str(value).strip().casefold()
        for value in (values or [])
        if str(value).strip()
    }


def entry_tags(entry: dict[str, Any]) -> tuple[set[str], set[str]]:
    topics = normalize_values(entry.get("topics"))
    category = str(entry.get("category") or "").strip()
    if category:
        topics.add(category.casefold())
    subcategories = normalize_values(entry.get("subcategories"))
    return topics, subcategories


def learned_score_for_entry(entry: dict[str, Any], learned_scores: dict[str, int] | None) -> int:
    scores = learned_scores or {}
    topics, subcategories = entry_tags(entry)
    return sum(scores.get(tag, 0) for tag in topics | subcategories)


def _entry_match(
    entry: dict[str, Any],
    explicit_topics: set[str],
    explicit_subtopics: set[str],
) -> tuple[bool, int, int]:
    topics, subcategories = entry_tags(entry)
    topic_match = int(bool(topics & explicit_topics))
    subtopic_match = int(bool(subcategories & explicit_subtopics))
    return bool(topic_match or subtopic_match), topic_match, subtopic_match


def select_personalized_stories(
    entries: list[dict[str, Any]],
    user_topics: Iterable[Any] | None,
    user_subtopics: Iterable[Any] | None,
    learned_scores: dict[str, int] | None = None,
) -> tuple[list[dict[str, Any]], dict[str, Any]]:
    """Select matching stories plus one deterministic exploration story.

    Explicit profile interests are the hard match. Learned scores only affect
    ordering and which non-matching story becomes the exploration item.
    """
    explicit_topics = normalize_values(user_topics)
    explicit_subtopics = normalize_values(user_subtopics)
    if not explicit_topics and not explicit_subtopics:
        return list(entries), {
            "matchScore": 0,
            "matchingStoryCount": 0,
            "hasExplorationStory": False,
        }

    matching: list[tuple[tuple[int, int, int, int], dict[str, Any]]] = []
    exploration: list[tuple[tuple[int, int], dict[str, Any]]] = []
    for index, entry in enumerate(entries):
        matches, topic_match, subtopic_match = _entry_match(entry, explicit_topics, explicit_subtopics)
        learned_score = learned_score_for_entry(entry, learned_scores)
        if matches:
            # Explicit topic match outranks subtopic match, then behavior,
            # then the original publication order for stable results.
            matching.append(((topic_match, subtopic_match, learned_score, -index), entry))
        else:
            exploration.append(((learned_score, -index), entry))

    if not matching:
        return list(entries), {
            "matchScore": 0,
            "matchingStoryCount": 0,
            "hasExplorationStory": False,
        }

    matching.sort(key=lambda item: item[0], reverse=True)
    selected = [entry for _, entry in matching]
    learned_boost = max(
        0,
        sum(learned_score_for_entry(entry, learned_scores) for _, entry in matching),
    )
    exploration_story = None
    if exploration:
        exploration.sort(key=lambda item: item[0], reverse=True)
        exploration_story = exploration[0][1]
        selected.append(exploration_story)

    return selected, {
        "matchScore": len(matching) + learned_boost,
        "matchingStoryCount": len(matching),
        "hasExplorationStory": exploration_story is not None,
    }
