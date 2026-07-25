from pydantic import BaseModel
from fastapi import FastAPI, Query, BackgroundTasks
from fastapi.responses import HTMLResponse
from dotenv import load_dotenv
from typing import List, Union, Optional
from news_collection import fetch_google_news_rss
from news_collection.taxonomy import NEWS_TAXONOMY
from news_collection.sync_news import run_news_sync
import os
import sys
# Load environment variables
load_dotenv()

# Ensure the parent directory is in path so we can import translator
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
from multilingual.translator import translate_text
from auth.database import setup_db_indexes
from auth.router import router as auth_router

app = FastAPI(
    title="PocketNews API",
    description="A basic FastAPI application with Multilingual Translation and Auth API support",
    version="0.3.0"
)

app.include_router(auth_router)

@app.on_event("startup")
def on_startup():
    setup_db_indexes()

class TranslationRequest(BaseModel):
    text: str
    languages: List[str]

@app.post("/translate")
def translate(req: TranslationRequest):
    return translate_text(req.text, req.languages)

@app.get("/api/health")
def health_check():
    return {"status": "healthy", "service": "PocketNews API"}

@app.get("/api/news/categories")
def get_categories():
    """
    Get the hierarchical news classification mapping (Macro Spheres -> Sub-Topics -> Micro-Niches).
    """
    return NEWS_TAXONOMY

@app.get("/api/news")
async def get_news(
    q: Optional[str] = None,
    category: Optional[Union[str, List[str]]] = Query(None),
    sub_topic: Optional[Union[str, List[str]]] = Query(None),
    micro_niche: Optional[Union[str, List[str]]] = Query(None)
):
    try:
        data = await fetch_google_news_rss(
            q=q,
            category=category,
            sub_topic=sub_topic,
            micro_niche=micro_niche
        )
        return data
    except Exception as e:
        from fastapi import HTTPException
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/news/sync")
def trigger_news_sync(background_tasks: BackgroundTasks):
    """
    Manually trigger background synchronization of latest news for all categories.
    """
    background_tasks.add_task(run_news_sync)
    return {
        "status": "sync_started",
        "message": "Bulk news scraping process initiated in the background.",
        "categories": list(NEWS_TAXONOMY.keys())
    }

@app.get("/")
def read_root():
    return {
        "message": "Welcome to the PocketNews Multilingual Translation API",
        "docs_url": "/docs",
        "health_check_url": "/api/health"
    }
