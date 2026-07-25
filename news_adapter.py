"""Boundary between an upstream news provider and PocketNews' internal format.

Only the constants below should need changing when a provider changes field names.
"""
from __future__ import annotations
from dataclasses import asdict, dataclass
from html import unescape
import json
from pathlib import Path
import re
from typing import Any
from urllib.parse import urlparse

# Provider-specific field names live in one place so the episode code never relies
# on a particular vendor's response shape.
FEED_LIST_FIELDS = ("results", "articles", "items", "data")
NEWS_FIELD_MAP = {
    "id": ("article_id", "id", "uuid"),
    "title": ("title", "headline", "name"),
    "summary": ("description", "summary", "excerpt", "snippet"),
    "full_text": ("full_text", "content", "article_body", "body", "text"),
    "url": ("link", "url", "web_url", "article_url"),
    "language": ("language", "lang"),
    "categories": ("category", "categories", "topics", "section"),
    "published_at": ("pubDate", "published_at", "publishedAt", "date"),
}
UNAVAILABLE_ARTICLE_TEXT = {"only available in paid plans", "unavailable", "n/a"}

@dataclass(frozen=True)
class NewsArticle:
    id: str
    title: str
    summary: str
    full_text: str
    url: str
    language: str
    categories: list[str]
    published_at: str | None
    source_name: str

    def to_dict(self) -> dict[str, Any]:
        return asdict(self)

    @property
    def best_available_text(self) -> str:
        return self.full_text or self.summary or self.title

def load_mock_articles(feed_path: Path) -> list[NewsArticle]:
    with feed_path.open("r", encoding="utf-8") as feed_file:
        payload = json.load(feed_file)
    return normalize_news_feed(payload)

def normalize_news_feed(payload: dict[str, Any]) -> list[NewsArticle]:
    raw_articles = _find_articles(payload)
    return [normalize_article(raw_article, index) for index, raw_article in enumerate(raw_articles)]

def normalize_article(raw_article: dict[str, Any], index: int = 0) -> NewsArticle:
    title = _clean_text(_first_value(raw_article, "title")) or "Untitled news update"
    summary = _clean_text(_first_value(raw_article, "summary"))
    full_text = _clean_text(_first_value(raw_article, "full_text"))
    if full_text.lower() in UNAVAILABLE_ARTICLE_TEXT:
        full_text = ""
    url = _clean_text(_first_value(raw_article, "url"))
    categories = _normalise_categories(_first_value(raw_article, "categories"))
    article_id = _clean_text(_first_value(raw_article, "id")) or f"article-{index}"
    return NewsArticle(
        id=article_id, title=title, summary=summary, full_text=full_text, url=url,
        language=_clean_text(_first_value(raw_article, "language")) or "english",
        categories=categories or ["top"], published_at=_clean_text(_first_value(raw_article, "published_at")) or None,
        source_name=_source_name(url),
    )

def _find_articles(payload: dict[str, Any]) -> list[dict[str, Any]]:
    for field_name in FEED_LIST_FIELDS:
        value = payload.get(field_name)
        if isinstance(value, list):
            return [article for article in value if isinstance(article, dict)]
    raise ValueError("The news response does not contain an article list.")

def _first_value(raw_article: dict[str, Any], internal_name: str) -> Any:
    for field_name in NEWS_FIELD_MAP[internal_name]:
        value = raw_article.get(field_name)
        if value is not None and value != "":
            return value
    return ""

def _normalise_categories(value: Any) -> list[str]:
    values = [value] if isinstance(value, str) else value if isinstance(value, list) else []
    return [str(item).strip().lower() for item in values if str(item).strip()]

def _clean_text(value: Any) -> str:
    if not isinstance(value, str):
        return ""
    text = unescape(value).strip()
    try:
        text = text.encode("latin-1").decode("utf-8")
    except (UnicodeEncodeError, UnicodeDecodeError):
        pass
    return re.sub(r"\s+", " ", text)

def _source_name(url: str) -> str:
    hostname = urlparse(url).hostname or "Source"
    return hostname.removeprefix("www.")
