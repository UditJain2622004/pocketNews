import os
import sys
from pathlib import Path
from typing import List

from fastapi import FastAPI, HTTPException, Query
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel

from episode_service import build_episode
from news_adapter import load_mock_articles

sys.path.append(os.path.dirname(os.path.abspath(__file__)))
from multilingual.translator import translate_text

BASE_DIR = Path(__file__).resolve().parent
STATIC_DIR = BASE_DIR / "static"
NEWS_FEED_PATH = BASE_DIR / "news_format.json"

app = FastAPI(
    title="PocketNews API",
    description="Multilingual, visual AI news episode prototype.",
    version="0.2.0",
)
app.mount("/static", StaticFiles(directory=STATIC_DIR), name="static")


class TranslationRequest(BaseModel):
    text: str
    languages: List[str]


@app.post("/translate")
def translate(req: TranslationRequest):
    return translate_text(req.text, req.languages)


@app.get("/", include_in_schema=False)
def read_root() -> FileResponse:
    return FileResponse(STATIC_DIR / "index.html")


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
