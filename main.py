import os
import sys
from pathlib import Path
from typing import List

from fastapi import FastAPI, HTTPException, Query
from pydantic import BaseModel

from episode_service import build_episode, build_story, supported_story_formats
from news_adapter import load_mock_articles

sys.path.append(os.path.dirname(os.path.abspath(__file__)))
from multilingual.translator import translate_text

BASE_DIR = Path(__file__).resolve().parent
NEWS_FEED_PATH = BASE_DIR / "news_format.json"

app = FastAPI(
    title="PocketNews API",
    description="Multilingual, AI-generated news episode API.",
    version="0.2.0",
)


class TranslationRequest(BaseModel):
    text: str
    languages: List[str]


@app.post("/translate")
def translate(req: TranslationRequest):
    return translate_text(req.text, req.languages)


@app.get("/")
def read_root() -> dict[str, str]:
    return {
        "message": "PocketNews API is running.",
        "docs_url": "/docs",
        "episode_url": "/api/episodes",
    }


@app.get("/api/health")
def health_check() -> dict[str, str]:
    return {"status": "healthy", "service": "PocketNews API"}


@app.get("/api/news")
def get_news() -> dict[str, object]:
    """Return the mock feed through the app's stable internal article shape."""
    try:
        articles = load_mock_articles(NEWS_FEED_PATH)
    except (OSError, ValueError) as error:
        raise HTTPException(status_code=500, detail="Unable to load the news feed.") from error
    return {"articles": [article.to_dict() for article in articles]}


@app.get("/api/stories/{article_id}")
def get_story(
    article_id: str,
    language: str = Query("en-IN", description="Requested narration language locale"),
    story_format: str = Query("auto", description="auto, solo-hot-take, two-person-banter, or dramatized-pov"),
) -> dict[str, object]:
    """Generate one reusable, independently skippable story module."""
    try:
        articles = load_mock_articles(NEWS_FEED_PATH)
    except (OSError, ValueError) as error:
        raise HTTPException(status_code=500, detail="Unable to load the news feed.") from error

    article = next((item for item in articles if item.id == article_id), None)
    if article is None:
        raise HTTPException(status_code=404, detail="News article not found.")

    selected_format = None if story_format == "auto" else story_format
    if selected_format and selected_format not in supported_story_formats():
        raise HTTPException(
            status_code=422,
            detail={"message": "Unsupported story format.", "supportedFormats": supported_story_formats()},
        )
    return build_story(article, 0, language, selected_format)

@app.get("/api/episodes")
def get_episode(
    interests: str = Query("top", description="Comma-separated interests, for example politics,business"),
    cadence: str = Query("daily", pattern="^(daily|weekly|monthly)$"),
    language: str = Query("en-IN", description="Requested narration language locale"),
    story_count: int = Query(3, ge=2, le=5),
) -> dict[str, object]:
    """Compose a personalized episode from reusable, independently skippable stories."""
    try:
        articles = load_mock_articles(NEWS_FEED_PATH)
    except (OSError, ValueError) as error:
        raise HTTPException(status_code=500, detail="Unable to load the news feed.") from error
    selected_interests = [item.strip().lower() for item in interests.split(",") if item.strip()]
    return build_episode(articles, selected_interests or ["top"], cadence, language, story_count)

