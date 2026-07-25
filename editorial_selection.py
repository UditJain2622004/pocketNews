"""Small, deterministic editorial selection pass for expensive story generation."""
from __future__ import annotations

from collections import defaultdict
import re
from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from news_adapter import NewsArticle


def select_story_candidates(
    jobs: list[tuple[int, "NewsArticle", object]],
    max_articles_per_category: int | None = None,
    max_total_stories: int | None = None,
) -> tuple[list[tuple[int, "NewsArticle", object]], dict[str, object]]:
    """Keep one strong representative for repeated coverage, then apply fair caps."""
    if max_articles_per_category is None and max_total_stories is None:
        return jobs, _selection_report(jobs, jobs, 0, 0, max_articles_per_category, max_total_stories)

    grouped: dict[str, list[tuple[int, NewsArticle, object]]] = defaultdict(list)
    seen_ids: set[str] = set()
    seen_headlines: dict[str, list[set[str]]] = defaultdict(list)
    duplicate_ids = 0
    clustered_articles = 0

    for job in jobs:
        _, article, source_file = job
        category = getattr(source_file, "stem", "uncategorized")
        if article.id in seen_ids:
            duplicate_ids += 1
            continue
        seen_ids.add(article.id)

        headline_tokens = _headline_tokens(article.title)
        if any(_similar_headline(headline_tokens, prior) for prior in seen_headlines[category]):
            clustered_articles += 1
            continue
        seen_headlines[category].append(headline_tokens)
        grouped[category].append(job)

    candidates = {
        category: stories[:max_articles_per_category] if max_articles_per_category is not None else stories
        for category, stories in grouped.items()
    }
    selected = _round_robin(candidates, max_total_stories)
    selected.sort(key=lambda item: item[0])
    return selected, _selection_report(
        jobs, selected, duplicate_ids, clustered_articles, max_articles_per_category, max_total_stories
    )


def _round_robin(grouped: dict[str, list[tuple[int, "NewsArticle", object]]], limit: int | None) -> list[tuple[int, "NewsArticle", object]]:
    selected: list[tuple[int, NewsArticle, object]] = []
    categories = sorted(grouped)
    index = 0
    while True:
        added = False
        for category in categories:
            stories = grouped[category]
            if index >= len(stories):
                continue
            if limit is not None and len(selected) >= limit:
                return selected
            selected.append(stories[index])
            added = True
        if not added:
            return selected
        index += 1


def _headline_tokens(title: str) -> set[str]:
    stop_words = {"a", "an", "and", "as", "at", "for", "from", "in", "of", "on", "the", "to", "with"}
    return {word for word in re.findall(r"[a-z0-9]+", title.lower()) if len(word) > 2 and word not in stop_words}


def _similar_headline(current: set[str], previous: set[str]) -> bool:
    if not current or not previous:
        return False
    overlap = len(current & previous) / min(len(current), len(previous))
    return overlap >= 0.7


def _selection_report(
    jobs: list[tuple[int, "NewsArticle", object]],
    selected: list[tuple[int, "NewsArticle", object]],
    duplicate_ids: int,
    clustered_articles: int,
    max_articles_per_category: int | None,
    max_total_stories: int | None,
) -> dict[str, object]:
    return {
        "articlesConsidered": len(jobs),
        "storiesSelected": len(selected),
        "duplicateIdsRemoved": duplicate_ids,
        "similarHeadlinesRemoved": clustered_articles,
        "maxArticlesPerCategory": max_articles_per_category,
        "maxTotalStories": max_total_stories,
    }
