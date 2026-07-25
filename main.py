import os
import sys
from pathlib import Path
from typing import List, Optional

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException, Query
from pydantic import BaseModel

from audio_workflow import AudioWorkflowInputError, media_file, prepare_story_audio
from episode_service import compose_episode, select_articles, story_format_for_index, supported_story_formats
from news_adapter import load_mock_articles
from story_generator import StoryGenerationError, generate_story
from workflow_service import WorkflowInputError, run_script_workflow

sys.path.append(os.path.dirname(os.path.abspath(__file__)))
from multilingual.translator import translate_text

BASE_DIR = Path(__file__).resolve().parent
load_dotenv(BASE_DIR / ".env")
NEWS_FEED_PATH = BASE_DIR / "news_format.json"

app = FastAPI(
    title="PocketNews API",
    description="Multilingual, AI-generated news episode API.",
    version="0.5.0",
)


class TranslationRequest(BaseModel):
    text: str
    languages: List[str]


class ScriptWorkflowRequest(BaseModel):
    date: Optional[str] = None
    language: str = "en-IN"


class AudioWorkflowRequest(BaseModel):
    runId: str
    articleIds: Optional[List[str]] = None


@app.post("/translate")
def translate(req: TranslationRequest):
    return translate_text(req.text, req.languages)


@app.get("/")
def read_root() -> dict[str, str]:
    return {
        "message": "PocketNews API is running.",
        "docs_url": "/docs",
        "workflow_url": "/api/workflows/generate-scripts",
        "audio_workflow_url": "/api/workflows/generate-audio",
    }


@app.get("/api/health")
def health_check() -> dict[str, str]:
    return {"status": "healthy", "service": "PocketNews API"}


@app.get("/api/news")
def get_news() -> dict[str, object]:
    return {"articles": [article.to_dict() for article in _load_articles()]}


@app.get("/api/stories/{article_id}")
def get_story(
    article_id: str,
    language: str = Query("en-IN", description="Requested narration language locale"),
    story_format: str = Query("auto", description="auto, solo-hot-take, two-person-banter, or dramatized-pov"),
) -> dict[str, object]:
    article = next((item for item in _load_articles() if item.id == article_id), None)
    if article is None:
        raise HTTPException(status_code=404, detail="News article not found.")
    return _generate_or_raise(article, _resolve_story_format(story_format, 0), language)


@app.get("/api/episodes")
def get_episode(
    interests: str = Query("top", description="Comma-separated interests, for example politics,business"),
    cadence: str = Query("daily", pattern="^(daily|weekly|monthly)$"),
    language: str = Query("en-IN", description="Requested narration language locale"),
    story_count: int = Query(3, ge=2, le=5),
) -> dict[str, object]:
    selected_interests = [item.strip().lower() for item in interests.split(",") if item.strip()]
    articles = select_articles(_load_articles(), selected_interests or ["top"], story_count)
    stories = [
        _generate_or_raise(article, story_format_for_index(index), language)
        for index, article in enumerate(articles)
    ]
    return compose_episode(stories, selected_interests or ["top"], cadence, language)


@app.post("/api/workflows/generate-scripts")
def generate_scripts(request: ScriptWorkflowRequest) -> dict[str, object]:
    try:
        return run_script_workflow(request.date, request.language)
    except WorkflowInputError as error:
        raise HTTPException(status_code=422, detail=str(error)) from error


@app.post("/api/workflows/generate-audio")
def generate_audio(request: AudioWorkflowRequest) -> dict[str, object]:
    try:
        return prepare_story_audio(request.runId, request.articleIds)
    except AudioWorkflowInputError as error:
        raise HTTPException(status_code=422, detail=str(error)) from error


@app.get("/api/media/{run_id}/{media_path:path}")
def get_media(run_id: str, media_path: str):
    try:
        from fastapi.responses import FileResponse

        return FileResponse(media_file(run_id, media_path))
    except AudioWorkflowInputError as error:
        raise HTTPException(status_code=404, detail=str(error)) from error


def _load_articles():
    try:
        return load_mock_articles(NEWS_FEED_PATH)
    except (OSError, ValueError) as error:
        raise HTTPException(status_code=500, detail="Unable to load the news feed.") from error


def _resolve_story_format(requested_format: str, index: int) -> str:
    if requested_format == "auto":
        return story_format_for_index(index)
    if requested_format not in supported_story_formats():
        raise HTTPException(
            status_code=422,
            detail={"message": "Unsupported story format.", "supportedFormats": supported_story_formats()},
        )
    return requested_format


def _generate_or_raise(article, story_format: str, language: str) -> dict[str, object]:
    try:
        return generate_story(article, story_format, language)
    except StoryGenerationError as error:
        raise HTTPException(status_code=502, detail=str(error)) from error
