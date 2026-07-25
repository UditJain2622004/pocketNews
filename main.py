import os
import sys
from pathlib import Path
from typing import List, Literal, Optional

from dotenv import load_dotenv
from fastapi import BackgroundTasks, FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from pydantic import BaseModel

from audio_workflow import AudioWorkflowInputError, media_file, prepare_story_audio
from episode_service import compose_episode, select_articles, story_format_for_index, supported_story_formats
from image_workflow import ImageWorkflowInputError, prepare_story_images
from news_adapter import load_mock_articles
from story_generator import CAST_MODES, VISUAL_STYLES, StoryGenerationError, generate_story
from workflow_service import WorkflowInputError, run_script_workflow
from auth.database import setup_db_indexes
from auth.router import router as auth_router
from news_collection import fetch_google_news_rss
from news_collection.sync_news import run_news_sync
from news_collection.taxonomy import NEWS_TAXONOMY

sys.path.append(os.path.dirname(os.path.abspath(__file__)))
from multilingual.translator import translate_text

BASE_DIR = Path(__file__).resolve().parent
load_dotenv(BASE_DIR / ".env")
NEWS_FEED_PATH = BASE_DIR / "news_format.json"
EPISODE_PLAYER_PATH = BASE_DIR / "episode_player.html"

app = FastAPI(
    title="PocketNews API",
    description="Multilingual, AI-generated news episode API.",
    version="0.5.0",
)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(auth_router)


@app.on_event("startup")
def on_startup() -> None:
    setup_db_indexes()


class TranslationRequest(BaseModel):
    text: str
    languages: List[str]


class ScriptWorkflowRequest(BaseModel):
    date: Optional[str] = None
    language: str = "en-IN"


class AudioWorkflowRequest(BaseModel):
    runId: str
    articleIds: Optional[List[str]] = None


class MediaWorkflowRequest(BaseModel):
    folderName: str
    generate: Literal["images", "audio", "both"]


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
        "media_workflow_url": "/api/workflows/generate-media",
    }


@app.get("/api/health")
def health_check() -> dict[str, str]:
    return {"status": "healthy", "service": "PocketNews API"}


@app.get("/episode-player")
def episode_player():
    return FileResponse(EPISODE_PLAYER_PATH)


@app.get("/api/news")
def get_news() -> dict[str, object]:
    return {"articles": [article.to_dict() for article in _load_articles()]}


@app.get("/api/news/categories")
def get_news_categories() -> dict[str, object]:
    return NEWS_TAXONOMY


@app.get("/api/news/live")
async def get_live_news(
    q: Optional[str] = None,
    category: Optional[List[str]] = Query(None),
    sub_topic: Optional[List[str]] = Query(None),
    micro_niche: Optional[List[str]] = Query(None),
) -> dict[str, object]:
    try:
        return await fetch_google_news_rss(
            q=q,
            category=category,
            sub_topic=sub_topic,
            micro_niche=micro_niche,
        )
    except Exception as error:
        raise HTTPException(status_code=500, detail=str(error)) from error


@app.post("/api/news/sync")
def trigger_news_sync(background_tasks: BackgroundTasks) -> dict[str, object]:
    background_tasks.add_task(run_news_sync)
    return {
        "status": "sync_started",
        "message": "Bulk news scraping process initiated in the background.",
        "categories": list(NEWS_TAXONOMY.keys()),
    }


@app.get("/api/news/local")
def get_local_archive(category: str, date: Optional[str] = None) -> dict[str, object]:
    from datetime import datetime
    import json

    archive_date = date or datetime.now().strftime("%d_%m_%Y")
    archive_path = BASE_DIR / "News" / archive_date / f"{category.strip().lower()}.json"
    if not archive_path.is_file():
        raise HTTPException(
            status_code=404,
            detail=f"Local news archive not found for category '{category}' on date '{archive_date}'",
        )
    try:
        with archive_path.open("r", encoding="utf-8") as input_file:
            payload = json.load(input_file)
        if not isinstance(payload, dict):
            raise ValueError("Expected a JSON object.")
        return payload
    except (OSError, ValueError, json.JSONDecodeError) as error:
        raise HTTPException(status_code=500, detail=f"Error reading archive file: {error}") from error


@app.get("/api/stories/{article_id}")
def get_story(
    article_id: str,
    language: str = Query("en-IN", description="Requested narration language locale"),
    story_format: str = Query("auto", description="auto, solo-hot-take, two-person-banter, or dramatized-pov"),
    cast_mode: str = Query("auto", description="auto, story_duo, or recurring_duo"),
    visual_style: str = Query("animated", description="animated or live_action"),
) -> dict[str, object]:
    _validate_creative_query(cast_mode, visual_style)
    article = next((item for item in _load_articles() if item.id == article_id), None)
    if article is None:
        raise HTTPException(status_code=404, detail="News article not found.")
    return _generate_or_raise(article, _resolve_story_format(story_format, 0), language, cast_mode, visual_style)


@app.get("/api/episodes")
def get_episode(
    interests: str = Query("top", description="Comma-separated interests, for example politics,business"),
    cadence: str = Query("daily", pattern="^(daily|weekly|monthly)$"),
    language: str = Query("en-IN", description="Requested narration language locale"),
    story_count: int = Query(3, ge=2, le=5),
    cast_mode: str = Query("auto", description="auto, story_duo, or recurring_duo"),
    visual_style: str = Query("animated", description="animated or live_action"),
) -> dict[str, object]:
    _validate_creative_query(cast_mode, visual_style)
    selected_interests = [item.strip().lower() for item in interests.split(",") if item.strip()]
    articles = select_articles(_load_articles(), selected_interests or ["top"], story_count)
    stories = [
        _generate_or_raise(article, story_format_for_index(index), language, cast_mode, visual_style)
        for index, article in enumerate(articles)
    ]
    return compose_episode(stories, selected_interests or ["top"], cadence, language)


@app.post("/api/workflows/generate-scripts")
def generate_scripts(
    request: ScriptWorkflowRequest,
    generate_images: bool = Query(True, description="Generate and save story images"),
    generate_audio: bool = Query(True, description="Generate and save narration audio"),
    cast_mode: str = Query("auto", description="auto, story_duo, or recurring_duo"),
    visual_style: str = Query("animated", description="animated or live_action"),
) -> dict[str, object]:
    try:
        _validate_creative_query(cast_mode, visual_style)
        return run_script_workflow(
            request.date,
            request.language,
            generate_images=generate_images,
            generate_audio=generate_audio,
            cast_mode=cast_mode,
            visual_style=visual_style,
        )
    except WorkflowInputError as error:
        raise HTTPException(status_code=422, detail=str(error)) from error


@app.post("/api/workflows/generate-audio")
def generate_audio(request: AudioWorkflowRequest) -> dict[str, object]:
    try:
        return prepare_story_audio(request.runId, request.articleIds)
    except AudioWorkflowInputError as error:
        raise HTTPException(status_code=422, detail=str(error)) from error


@app.post("/api/workflows/generate-media")
def generate_media(request: MediaWorkflowRequest) -> dict[str, object]:
    result: dict[str, object] = {"folderName": request.folderName, "generate": request.generate}
    try:
        if request.generate in ("images", "both"):
            result["images"] = prepare_story_images(request.folderName)
        if request.generate in ("audio", "both"):
            result["audio"] = prepare_story_audio(request.folderName)
        return result
    except (ImageWorkflowInputError, AudioWorkflowInputError) as error:
        raise HTTPException(status_code=422, detail=str(error)) from error


@app.get("/api/media/{run_id}/{media_path:path}")
def get_media(run_id: str, media_path: str):
    try:
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


def _generate_or_raise(
    article,
    story_format: str,
    language: str,
    cast_mode: str = "auto",
    visual_style: str = "animated",
) -> dict[str, object]:
    try:
        return generate_story(article, story_format, language, cast_mode, visual_style)
    except StoryGenerationError as error:
        raise HTTPException(status_code=502, detail=str(error)) from error


def _validate_creative_query(cast_mode: str, visual_style: str) -> None:
    if cast_mode not in CAST_MODES:
        raise HTTPException(status_code=422, detail={"message": "Unsupported cast mode.", "supportedCastModes": CAST_MODES})
    if visual_style not in VISUAL_STYLES:
        raise HTTPException(status_code=422, detail={"message": "Unsupported visual style.", "supportedVisualStyles": VISUAL_STYLES})
