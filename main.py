from pydantic import BaseModel
from fastapi import FastAPI, Query, BackgroundTasks
from dotenv import load_dotenv
from typing import List, Optional
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
from fastapi.middleware.cors import CORSMiddleware
from auth.database import setup_db_indexes
from auth.router import router as auth_router

app = FastAPI(
    title="PocketNews API",
    description="A basic FastAPI application with Multilingual Translation and Auth API support",
    version="0.3.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins for local development
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
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

# ==========================================
# NEWS COLLECTION & ARCHIVING APIS
# ==========================================

@app.get("/api/news/categories")
def get_categories():
    """
    Get the hierarchical news classification mapping (Macro Spheres -> Sub-Topics -> Micro-Niches).
    Allows frontend clients to discover available topics to build menus.
    """
    return NEWS_TAXONOMY

@app.get("/api/news")
async def get_news(
    q: Optional[str] = None,
    category: Optional[List[str]] = Query(None),
    sub_topic: Optional[List[str]] = Query(None),
    micro_niche: Optional[List[str]] = Query(None)
):
    """
    Retrieve live 24-hour news feeds dynamically from Google News RSS.
    Supports parallel querying and merging of multiple categories, sub-topics, or niches.
    """
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
    MANUAL SYNC TRIGGER:
    Manually triggers background news scraping for all registered categories.
    Stores files locally under the 'News/DD_MM_YYYY/' directory hierarchy in the background.
    """
    background_tasks.add_task(run_news_sync)
    return {
        "status": "sync_started",
        "message": "Bulk news scraping process initiated in the background.",
        "categories": list(NEWS_TAXONOMY.keys())
    }

@app.get("/api/news/local")
def get_local_archive(
    category: str,
    date: Optional[str] = None
):
    """
    RETRIEVE LOCAL NEWS ARCHIVE:
    Retrieve locally archived news JSON for a specific category and date.
    
    Parameters:
    - category: The news category (e.g. politics, sports, technology, business, pop_culture, world).
    - date: Date string formatted as DD_MM_YYYY (e.g. 25_07_2026). Defaults to today's local date.
    """
    import os
    import json
    from datetime import datetime
    from fastapi import HTTPException
    
    # Default to today's local date if not specified
    if not date:
        date = datetime.now().strftime("%d_%m_%Y")
        
    base_dir = os.path.dirname(os.path.abspath(__file__))
    file_path = os.path.join(base_dir, "News", date, f"{category.strip().lower()}.json")
    
    # Raise a 404 if the local file has not been created by sync script / manual trigger
    if not os.path.exists(file_path):
        raise HTTPException(
            status_code=404,
            detail=f"Local news archive not found for category '{category}' on date '{date}'"
        )
        
    try:
        with open(file_path, "r", encoding="utf-8") as f:
            data = json.load(f)
        return data
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error reading archive file: {str(e)}"
        )

@app.get("/")
def read_root():
    return {
        "message": "Welcome to the PocketNews Multilingual Translation API",
        "docs_url": "/docs",
        "health_check_url": "/api/health"
    }

