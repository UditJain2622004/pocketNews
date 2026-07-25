import os
import httpx
from typing import Dict, Any, Optional

# Base URL for NewsData.io API
NEWSDATA_BASE_URL = "https://newsdata.io/api/1/news"

def get_api_key() -> str:
    """
    Retrieve and validate the NewsData.io API key from environment variables.
    """
    api_key = os.getenv("NEWSDATA_API_KEY")
    if not api_key:
        raise ValueError(
            "NEWSDATA_API_KEY environment variable is not set. "
            "Please create a .env file containing NEWSDATA_API_KEY=your_api_key "
            "or set it in your environment."
        )
    return api_key

async def fetch_latest_news(
    q: Optional[str] = None,
    language: Optional[str] = "en",
    country: Optional[str] = "in",
    category: Optional[str] = None,
    page: Optional[str] = None,
    timeframe: Optional[str] = None
) -> Dict[str, Any]:
    """
    Fetch the latest news from NewsData.io.
    
    Args:
        q: Query search term (optional).
        language: Language of the articles (default: "en").
        country: Country code (default: "in" for India).
        category: News category (optional).
        page: Page ID for pagination (optional).
        timeframe: Timeframe in hours (1-48) or minutes (e.g. "30m", "2880m") (optional).
        
    Returns:
        A dictionary containing the JSON response from the API.
    """
    api_key = get_api_key()
    
    # Construct query parameters
    params: Dict[str, Any] = {
        "apikey": api_key
    }
    
    if q:
        params["q"] = q
    if language:
        params["language"] = language
    if country or country is None:
        params["country"] = country or "in"
    if category:
        params["category"] = category
    if page:
        params["page"] = page
    if timeframe:
        params["timeframe"] = timeframe
        
    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(NEWSDATA_BASE_URL, params=params, timeout=10.0)
            response.raise_for_status()
            data = response.json()
            
            # Filter results to include only requested fields:
            # title, article_id, link, description, content, language, category
            filtered_results = []
            for article in data.get("results", []):
                filtered_results.append({
                    "article_id": article.get("article_id"),
                    "title": article.get("title"),
                    "link": article.get("link"),
                    "description": article.get("description"),
                    "content": article.get("content"),
                    "language": article.get("language"),
                    "category": article.get("category")
                })
            
            data["results"] = filtered_results
            return data
        except httpx.HTTPStatusError as e:
            # Handle HTTP errors (e.g. invalid key, rate limit)
            try:
                error_detail = response.json()
            except ValueError:
                error_detail = response.text
            
            raise httpx.HTTPStatusError(
                message=f"NewsData.io API error: {response.status_code} - {error_detail}",
                request=e.request,
                response=e.response
            )
        except httpx.RequestError as e:
            # Handle network errors
            raise RuntimeError(f"Network error while connecting to NewsData.io: {e}")
