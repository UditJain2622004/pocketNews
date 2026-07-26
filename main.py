import os
import sys
from pathlib import Path
from typing import List, Literal, Optional
from uuid import uuid4

from dotenv import load_dotenv
from fastapi import BackgroundTasks, Depends, FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from pydantic import BaseModel, Field
from bson import ObjectId

from audio_workflow import AudioWorkflowInputError, media_file, prepare_story_audio
from episode_service import compose_episode, select_articles, story_format_for_index, supported_story_formats
from image_workflow import ImageWorkflowInputError, prepare_story_images
from news_adapter import load_mock_articles
from story_generator import CAST_MODES, VISUAL_STYLES, StoryGenerationError, generate_story
from workflow_service import WorkflowInputError, run_script_workflow
from auth.database import setup_db_indexes
from auth.database import db
from auth.router import get_current_user_id, router as auth_router
from automated_workflows import run_daily_workflow
from localization_service import locale_for_language, prepare_localized_episode
from publication_store import backfill_complete_episodes, delete_published_episode, episode_playback, list_episodes, list_published_episodes, publish_local_run, set_localized_run, setup_publication_indexes, workflow_status
from listening_service import ListeningEventError, learned_scores as get_learned_scores, record_listening_event as store_listening_event
from transition_audio_service import prepare_episode_bridges
from scheduler_service import start_scheduler, stop_scheduler
from news_collection import fetch_google_news_rss
from news_collection.sync_news import run_news_sync
from news_collection.taxonomy import NEWS_TAXONOMY

sys.path.append(os.path.dirname(os.path.abspath(__file__)))
from multilingual.translator import translate_text
from interactive_service import (
    AskStoryRequest,
    ReactStoryRequest,
    GameSubmission,
    answer_story_question,
    get_story_curiosity_path,
    get_daily_challenge,
    submit_challenge_answers,
    get_catch_up_brief,
)

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
ADMIN_TASKS: dict[str, dict[str, object]] = {}


@app.on_event("startup")
def on_startup() -> None:
    setup_db_indexes()
    setup_publication_indexes()
    start_scheduler()


@app.on_event("shutdown")
def on_shutdown() -> None:
    stop_scheduler()


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


class ListeningEventRequest(BaseModel):
    eventId: str = Field(..., min_length=1, max_length=200)
    storyId: str = Field(..., min_length=1, max_length=200)
    event: Literal["completed", "skipped"]
    progressRatio: float = Field(default=0.0, ge=0.0, le=1.0)


class EpisodeBridgeRequest(BaseModel):
    runId: str
    storyIds: List[str]


class AdminDailyWorkflowRequest(BaseModel):
    runDate: Optional[str] = None
    categories: Optional[List[str]] = None
    mode: Literal["fetch_only", "generate_only", "full"] = "full"
    generateImages: bool = True
    generateAudio: bool = True
    castMode: str = "auto"
    visualStyle: str = "animated"
    language: str = "en-IN"
    maxArticlesPerCategory: Optional[int] = Field(default=3, ge=1)
    maxTotalStories: Optional[int] = Field(default=12, ge=1)
    threeImagesPerStory: bool = False
    storyFormat: str = "mix"


class PublishLocalEpisodeRequest(BaseModel):
    folderName: str = Field(..., min_length=1)


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

    archive_date = date or datetime.now().date().isoformat()
    archive_path = BASE_DIR / "news" / "daily" / archive_date / f"{category.strip().lower()}.json"
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


@app.post("/api/admin/workflows/daily")
def start_admin_daily_workflow(request: AdminDailyWorkflowRequest, background_tasks: BackgroundTasks) -> dict[str, object]:
    task_id = uuid4().hex
    ADMIN_TASKS[task_id] = {"taskId": task_id, "status": "queued"}

    def run_task() -> None:
        ADMIN_TASKS[task_id] = {"taskId": task_id, "status": "running"}
        try:
            result = run_daily_workflow(
                request.runDate, request.categories, request.mode, request.generateImages,
                request.generateAudio, request.castMode, request.visualStyle, request.language,
                request.maxArticlesPerCategory, request.maxTotalStories,
                request.threeImagesPerStory,
                request.storyFormat,
            )
            ADMIN_TASKS[task_id] = {"taskId": task_id, "status": "completed", "result": result}
        except Exception as error:
            ADMIN_TASKS[task_id] = {"taskId": task_id, "status": "failed", "error": str(error)}

    background_tasks.add_task(run_task)
    return ADMIN_TASKS[task_id]


@app.get("/api/admin/workflows/{workflow_id}")
def get_admin_workflow_status(workflow_id: str) -> dict[str, object]:
    if workflow_id in ADMIN_TASKS:
        return ADMIN_TASKS[workflow_id]
    record = workflow_status(workflow_id)
    if record is None:
        raise HTTPException(status_code=404, detail="Workflow was not found.")
    return record


@app.post("/api/admin/episodes/backfill")
def backfill_historical_episodes() -> dict[str, object]:
    try:
        return backfill_complete_episodes()
    except RuntimeError as error:
        raise HTTPException(status_code=503, detail=str(error)) from error


@app.post("/api/admin/episodes/publish")
def publish_local_episode(request: PublishLocalEpisodeRequest) -> dict[str, object]:
    try:
        return publish_local_run(request.folderName)
    except FileNotFoundError as error:
        raise HTTPException(status_code=404, detail=str(error)) from error
    except (RuntimeError, ValueError) as error:
        raise HTTPException(status_code=400, detail=str(error)) from error


@app.get("/api/admin/episodes")
def get_admin_episodes() -> dict[str, object]:
    try:
        return {"episodes": list_published_episodes()}
    except RuntimeError as error:
        raise HTTPException(status_code=503, detail=str(error)) from error


@app.delete("/api/admin/episodes/{episode_id}")
def delete_admin_episode(episode_id: str) -> dict[str, str]:
    try:
        return delete_published_episode(episode_id)
    except KeyError as error:
        raise HTTPException(status_code=404, detail=str(error)) from error
    except (RuntimeError, ValueError) as error:
        raise HTTPException(status_code=400, detail=str(error)) from error


@app.get("/api/dashboard/episodes")
def get_dashboard_episodes(user_id: str = Depends(get_current_user_id)) -> dict[str, object]:
    if db is None:
        raise HTTPException(status_code=503, detail="Database connection is unavailable.")
    user = db.users.find_one({"_id": ObjectId(user_id)})
    if not user:
        raise HTTPException(status_code=404, detail="User was not found.")
    scores = get_learned_scores(db, user_id)
    return {
        "episodes": list_episodes(
            user.get("topics", []), user.get("subtopics", []), scores
        )
    }


@app.get("/api/episodes/{episode_id}/playback")
def get_published_episode_playback(
    episode_id: str,
    background_tasks: BackgroundTasks,
    language: Optional[str] = Query(None),
    user_id: str = Depends(get_current_user_id)
) -> dict[str, object]:
    if db is None:
        raise HTTPException(status_code=503, detail="Database connection is unavailable.")
    user = db.users.find_one({"_id": ObjectId(user_id)})
    if not user:
        raise HTTPException(status_code=404, detail="User was not found.")
    
    # If a language query parameter is provided, use it and persist it in user's profile
    if language and language != user.get("language"):
        db.users.update_one({"_id": ObjectId(user_id)}, {"$set": {"language": language}})
        profile_language = language
    else:
        profile_language = str(user.get("language") or "English")

    scores = get_learned_scores(db, user_id)
    episode = episode_playback(
        episode_id, user.get("topics", []), user.get("subtopics", []), scores
    )
    if episode is None:
        raise HTTPException(status_code=404, detail="Published episode was not found.")
    
    locale = locale_for_language(profile_language)
    localized = episode.get("localizedRuns", {}).get(locale) if isinstance(episode.get("localizedRuns"), dict) else None
    if locale != "en-IN" and isinstance(localized, dict) and localized.get("status") == "ready":
        episode["runId"] = localized["runId"]
        episode["playbackStatus"] = "ready"
        episode["localizedStatus"] = "ready"
    elif locale != "en-IN":
        if not isinstance(localized, dict) or localized.get("status") != "preparing":
            set_localized_run(episode_id, locale, "", "preparing")
            background_tasks.add_task(prepare_localized_episode, episode, profile_language)
        episode["playbackStatus"] = "preparing"
        episode["localizedStatus"] = "canonical_fallback"
    else:
        episode["playbackStatus"] = "ready"
        episode["localizedStatus"] = "canonical"
    episode["requestedLanguage"] = profile_language
    return episode


@app.post("/api/episodes/{episode_id}/bridges")
def generate_episode_bridges(episode_id: str, request: EpisodeBridgeRequest, user_id: str = Depends(get_current_user_id)) -> dict[str, object]:
    if not request.storyIds:
        return {"runId": request.runId, "bridges": []}
    try:
        return prepare_episode_bridges(request.runId, request.storyIds)
    except ValueError as error:
        raise HTTPException(status_code=400, detail=str(error)) from error


@app.post("/api/episodes/{episode_id}/events")
def post_episode_event(
    episode_id: str,
    request: ListeningEventRequest,
    user_id: str = Depends(get_current_user_id),
) -> dict[str, object]:
    if db is None:
        raise HTTPException(status_code=503, detail="Database connection is unavailable.")
    try:
        user_object_id = ObjectId(user_id)
    except Exception as error:
        raise HTTPException(status_code=401, detail="Invalid authenticated user.") from error
    if not db.users.find_one({"_id": user_object_id}, {"_id": 1}):
        raise HTTPException(status_code=404, detail="User was not found.")
    try:
        return store_listening_event(
            db,
            user_id,
            episode_id,
            request.eventId,
            request.storyId,
            request.event,
            request.progressRatio,
        )
    except ListeningEventError as error:
        raise HTTPException(status_code=422, detail=str(error)) from error


@app.get("/api/stories/{article_id}")
def get_story(
    article_id: str,
    language: str = Query("en-IN", description="Requested narration language locale"),
    story_format: str = Query("mix", description="mix, auto, solo-hot-take, two-person-banter, dramatized-pov, group-chat-meltdown, fourth-wall, or game-show-round"),
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


from datetime import datetime, timezone
from interactive_service import find_story

# Interactive endpoints
@app.post("/api/stories/{story_id}/ask")
def ask_story_endpoint(story_id: str, request: AskStoryRequest):
    return {"answer": answer_story_question(story_id, request.question)}

@app.get("/api/stories/{story_id}/path")
def story_path_endpoint(story_id: str, path_type: str = Query(...)):
    return {"content": get_story_curiosity_path(story_id, path_type)}

@app.get("/api/game/challenge")
def game_challenge_endpoint():
    return get_daily_challenge()

@app.post("/api/game/submit")
def game_submit_endpoint(request: GameSubmission, user_id: str = Depends(get_current_user_id)):
    return submit_challenge_answers(user_id, request)

@app.get("/api/dashboard/catch-up")
def dashboard_catch_up_endpoint(user_id: str = Depends(get_current_user_id)):
    return get_catch_up_brief(user_id)

@app.post("/api/stories/{story_id}/react")
def react_story_endpoint(story_id: str, request: ReactStoryRequest, user_id: str = Depends(get_current_user_id)):
    if db is None:
        return {"status": "success"}
    db.story_reactions.update_one(
        {"userId": user_id, "storyId": story_id},
        {"$set": {"episodeId": request.episodeId, "reaction": request.reaction, "createdAt": datetime.now(timezone.utc).isoformat()}},
        upsert=True
    )
    # Personalize user topic score if reaction is "useful"
    if request.reaction in ("useful", "surprising"):
        story_data = find_story(story_id)
        if story_data:
            cat = story_data.get("category") or story_data.get("story", {}).get("category") or "News"
            db.users.update_one(
                {"_id": ObjectId(user_id)},
                {"$addToSet": {"topics": cat}} # Add category to user preferences if found useful
            )
    return {"status": "success"}

# Developing Stories endpoints
class FollowTopicRequest(BaseModel):
    topic: str

@app.post("/api/topics/follow")
def follow_topic_endpoint(request: FollowTopicRequest, user_id: str = Depends(get_current_user_id)):
    if db is None:
         return {"status": "success"}
    db.users.update_one(
        {"_id": ObjectId(user_id)},
        {"$addToSet": {"followed_topics": request.topic}}
    )
    return {"status": "success", "followed": True}

@app.get("/api/topics/followed")
def get_followed_topics_endpoint(user_id: str = Depends(get_current_user_id)):
    if db is None:
         return {"topics": []}
    user = db.users.find_one({"_id": ObjectId(user_id)})
    return {"topics": user.get("followed_topics", []) if user else []}

@app.get("/api/topics/{topic}/timeline")
def get_topic_timeline_endpoint(topic: str):
    timeline = []
    if db is not None:
        episodes = db.episodes.find({"categories": topic}).sort("publishedAt", -1)
        for ep in episodes:
            for script in ep.get("scripts", []):
                cat = script.get("category") or script.get("story", {}).get("category") or ""
                if cat.lower() == topic.lower():
                    timeline.append({
                        "storyId": script["storyId"],
                        "title": script.get("title", "News Update"),
                        "date": ep.get("publishedAt", "").strftime("%Y-%m-%d") if isinstance(ep.get("publishedAt"), datetime) else ep.get("publishedAt", ""),
                        "summary": script.get("story", {}).get("exit", "")
                    })
    # If timeline is empty, populate from mock articles matching the category
    if not timeline:
        try:
            articles = _load_articles()
            for art in articles:
                if any(t.lower() == topic.lower() for t in art.categories):
                    timeline.append({
                        "storyId": art.id,
                        "title": art.title,
                        "date": art.published_at or "2026-07-26",
                        "summary": art.best_available_text[:120] + "..."
                    })
        except Exception:
            pass
    return {"timeline": timeline}
