import os
import sys
from fastapi import FastAPI
from pydantic import BaseModel
from typing import List

# Ensure the parent directory is in path so we can import translator
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
from multilingual.translator import translate_text

app = FastAPI(
    title="PocketNews API",
    description="A basic FastAPI application with Multilingual Translation API support",
    version="0.2.0"
)

class TranslationRequest(BaseModel):
    text: str
    languages: List[str]

@app.post("/translate")
def translate(req: TranslationRequest):
    return translate_text(req.text, req.languages)

@app.get("/api/health")
def health_check():
    return {"status": "healthy", "service": "PocketNews API"}

@app.get("/")
def read_root():
    return {
        "message": "Welcome to the PocketNews Multilingual Translation API",
        "docs_url": "/docs",
        "health_check_url": "/api/health"
    }
