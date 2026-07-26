import httpx
import feedparser
import urllib.parse
import hashlib
import re
import asyncio
import time
import calendar
from datetime import date as CalendarDate, datetime, timedelta, timezone
from zoneinfo import ZoneInfo
from bs4 import BeautifulSoup
from typing import Dict, Any, Optional, List, Union
from googlenewsdecoder import gnewsdecoder
from .taxonomy import NEWS_TAXONOMY

GOOGLE_NEWS_LANGUAGE = "en-IN"
GOOGLE_NEWS_COUNTRY = "IN"
GOOGLE_NEWS_EDITION = "IN:en"
INDIA_NEWS_TERM = "India"
INDIA_TIMEZONE = ZoneInfo("Asia/Kolkata")

# Topic Mapping for Google News India RSS (Fallback map)
TOPIC_MAP = {
    "world": "WORLD",
    "nation": "NATION",
    "national": "NATION",
    "india": "NATION",
    "business": "BUSINESS",
    "technology": "TECHNOLOGY",
    "tech": "TECHNOLOGY",
    "entertainment": "ENTERTAINMENT",
    "sports": "SPORTS",
    "science": "SCIENCE",
    "health": "HEALTH"
}

def clean_html(raw_html: Optional[str]) -> str:
    """
    Remove HTML tags from RSS description/summary.
    """
    if not raw_html:
        return ""
    # Strip HTML tags
    clean_text = re.sub(r'<[^>]*>', '', raw_html)
    # Decode common HTML entities
    clean_text = clean_text.replace("&nbsp;", " ").replace("&amp;", "&").replace("&quot;", '"')
    return clean_text.strip()

def parse_list_param(param: Any) -> List[str]:
    """
    Parse a query parameter which can be a single string, a comma-separated string,
    or a list of strings, returning a list of clean, lowercase tokens.
    """
    if not param:
        return []
    if isinstance(param, str):
        items = param.split(",")
    elif isinstance(param, list):
        items = []
        for p in param:
            if isinstance(p, str):
                items.extend(p.split(","))
    else:
        return []
    return [i.strip().lower() for i in items if i.strip()]

async def get_decoded_url(google_url: str) -> Optional[str]:
    """
    Asynchronously decode dynamic Google News URLs using a worker thread.
    """
    try:
        decoded = await asyncio.to_thread(gnewsdecoder, google_url)
        if decoded.get("status"):
            return decoded["decoded_url"]
    except Exception:
        pass
    return None

async def scrape_article_content(client: httpx.AsyncClient, google_url: str) -> Dict[str, str]:
    """
    Decode the Google News URL and scrape paragraph text from the original news article.
    """
    decoded_url = await get_decoded_url(google_url)
    if not decoded_url:
        return {"content": "", "decoded_url": ""}
        
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    }
    try:
        response = await client.get(decoded_url, headers=headers, timeout=2.0, follow_redirects=True)
        if response.status_code != 200:
            return {"content": "", "decoded_url": decoded_url}
        
        soup = BeautifulSoup(response.text, "html.parser")
        
        # Remove script, style, nav, footer, etc.
        for element in soup(["script", "style", "nav", "footer", "aside", "header"]):
            element.extract()
            
        # Try to find common article containers
        container = soup.find("article") or soup.find("main") or soup.find("div", class_=re.compile("article-body|post-body|entry-content|content-body", re.I))
        
        p_tags = []
        if container:
            p_tags = container.find_all("p")
        
        # Fallback to all <p> tags
        if not p_tags:
            p_tags = soup.find_all("p")
            
        paragraphs = []
        for p in p_tags:
            text = p.get_text().strip()
            # Filter out very short lines or cookie policy warnings
            if len(text) > 60 and "cookie" not in text.lower() and "subscribe" not in text.lower() and "sign in" not in text.lower():
                paragraphs.append(text)
                
        content = "\n\n".join(paragraphs) if paragraphs else ""
        return {"content": content, "decoded_url": decoded_url}
    except Exception:
        return {"content": "", "decoded_url": decoded_url}

async def fetch_google_news_rss(
    q: Optional[str] = None,
    category: Optional[Union[str, List[str]]] = None,
    sub_topic: Optional[Union[str, List[str]]] = None,
    micro_niche: Optional[Union[str, List[str]]] = None,
    article_date: Optional[CalendarDate] = None,
) -> Dict[str, Any]:
    """
    Fetch and parse India-focused news from Google News RSS feeds based on hierarchical taxonomy.
    Supports fetching and merging multiple sub-topics or micro-niches concurrently.
    When article_date is supplied, returns only articles published on that calendar date in Asia/Kolkata.
    """
    base_params = (
        f"hl={GOOGLE_NEWS_LANGUAGE}&gl={GOOGLE_NEWS_COUNTRY}&ceid={GOOGLE_NEWS_EDITION}"
    )
    
    # Parse inputs to normalized lists of strings
    categories = parse_list_param(category)
    sub_topics = parse_list_param(sub_topic)
    micro_niches = parse_list_param(micro_niche)
    
    # List of tuples containing (rss_url, feed_category_label)
    rss_urls = []
    
    # Search queries are constrained to the Indian edition and require India relevance.
    if article_date:
        search_filter = (
            f" after:{(article_date - timedelta(days=1)).isoformat()}"
            f" before:{(article_date + timedelta(days=1)).isoformat()}"
        )
    else:
        search_filter = " when:1d"

    def india_query(query: str) -> str:
        return f"({query}) {INDIA_NEWS_TERM}{search_filter}"

    def category_query(meta: Dict[str, Any]) -> str:
        queries = [
            str(subtopic["query"])
            for subtopic in meta.get("sub_topics", {}).values()
            if subtopic.get("query")
        ]
        return " OR ".join(queries) or str(meta.get("name", "news"))
    
    if q:
        query_str = india_query(q)
        encoded_query = urllib.parse.quote(query_str)
        rss_urls.append((f"https://news.google.com/rss/search?q={encoded_query}&{base_params}", "search"))
    elif micro_niches:
        # Fetch separate search feeds for each micro-niche to bypass parentheses limitation
        for niche in micro_niches:
            parent_query = ""
            for cat in categories:
                if cat in NEWS_TAXONOMY:
                    for sub in NEWS_TAXONOMY[cat]["sub_topics"]:
                        sub_meta = NEWS_TAXONOMY[cat]["sub_topics"][sub]
                        if niche in sub_meta["micro_niches"]:
                            parent_query = sub_meta["query"]
                            niche_query = sub_meta["micro_niches"][niche]["query"]
                            break
                    if parent_query:
                        break
            
            if parent_query:
                # Combine parent query and niche query flatly (implied AND)
                query_str = india_query(f"{parent_query} {niche_query}")
            else:
                query_str = india_query(niche)
            encoded_query = urllib.parse.quote(query_str)
            rss_urls.append((f"https://news.google.com/rss/search?q={encoded_query}&{base_params}", niche))
    elif sub_topics:
        # Fetch separate search feeds for each sub-topic concurrently
        for sub in sub_topics:
            found_query = None
            for cat in categories:
                if cat in NEWS_TAXONOMY and sub in NEWS_TAXONOMY[cat]["sub_topics"]:
                    found_query = NEWS_TAXONOMY[cat]["sub_topics"][sub]["query"]
                    break
            query_str = india_query(found_query if found_query else sub)
            encoded_query = urllib.parse.quote(query_str)
            rss_urls.append((f"https://news.google.com/rss/search?q={encoded_query}&{base_params}", sub))
    elif categories:
        # Use taxonomy searches rather than broad global topic feeds, so every category is India-focused.
        for cat in categories:
            if cat in NEWS_TAXONOMY:
                meta = NEWS_TAXONOMY[cat]
                query_str = india_query(category_query(meta))
                encoded_query = urllib.parse.quote(query_str)
                rss_urls.append((f"https://news.google.com/rss/search?q={encoded_query}&{base_params}", cat))
            elif cat in TOPIC_MAP:
                topic_code = TOPIC_MAP[cat]
                rss_urls.append((f"https://news.google.com/rss/headlines/section/topic/{topic_code}?{base_params}", cat))
            else:
                query_str = india_query(cat)
                encoded_query = urllib.parse.quote(query_str)
                rss_urls.append((f"https://news.google.com/rss/search?q={encoded_query}&{base_params}", cat))
    else:
        # Default: India National news
        rss_urls.append((f"https://news.google.com/rss/headlines/section/topic/NATION?{base_params}", "nation"))
            
    async with httpx.AsyncClient() as client:
        try:
            # 1. Concurrently fetch all RSS XML feeds
            feed_tasks = [client.get(url, timeout=10.0, follow_redirects=True) for url, _ in rss_urls]
            feed_responses = await asyncio.gather(*feed_tasks)
            
            results = []
            seen_ids = set()
            
            current_time = calendar.timegm(time.gmtime())
            
            # 2. Parse feeds, enforce the requested publication date, and merge entries cleanly.
            for idx, response in enumerate(feed_responses):
                response.raise_for_status()
                feed_category = rss_urls[idx][1]
                
                feed = feedparser.parse(response.content)
                for entry in feed.entries:
                    # A dated run is exact to the India calendar day; live requests keep the rolling 24-hour behavior.
                    if entry.get("published_parsed"):
                        entry_time = calendar.timegm(entry.published_parsed)
                        if article_date:
                            published_date = datetime.fromtimestamp(entry_time, timezone.utc).astimezone(INDIA_TIMEZONE).date()
                            if published_date != article_date:
                                continue
                        elif (current_time - entry_time) > 86400:
                            continue
                    elif article_date:
                        continue
                            
                    link = entry.get("link", "")
                    entry_id = entry.get("id") or entry.get("guid")
                    article_id = hashlib.md5(entry_id.encode()).hexdigest() if entry_id else hashlib.md5(link.encode()).hexdigest()
                    
                    if article_id in seen_ids:
                        continue
                    seen_ids.add(article_id)
                    
                    summary = clean_html(entry.get("summary") or entry.get("description"))
                    results.append({
                        "article_id": article_id,
                        "title": entry.get("title", "No Title"),
                        "link": link,
                        "description": summary,
                        "content": summary, # Default fallback
                        "language": "english",
                        "category": [feed_category]
                    })
                    
            # 3. Concurrently scrape the top 5 merged articles
            scrape_tasks = [scrape_article_content(client, res["link"]) for res in results[:5]]
            scraped_results = await asyncio.gather(*scrape_tasks)
            
            for idx, res_data in enumerate(scraped_results):
                content = res_data.get("content")
                decoded_url = res_data.get("decoded_url")
                
                if decoded_url:
                    results[idx]["link"] = decoded_url
                if content and len(content) > len(results[idx]["description"]):
                    results[idx]["content"] = content
                    
            return {
                "status": "success",
                "totalResults": len(results),
                "locale": {
                    "country": GOOGLE_NEWS_COUNTRY,
                    "language": GOOGLE_NEWS_LANGUAGE,
                    "edition": GOOGLE_NEWS_EDITION,
                    "relevanceTerm": INDIA_NEWS_TERM,
                },
                "articleDate": article_date.isoformat() if article_date else None,
                "results": results
            }
            
        except httpx.HTTPStatusError as e:
            return {
                "status": "error",
                "message": f"Google News RSS error: HTTP {response.status_code}",
                "results": []
            }
        except Exception as e:
            return {
                "status": "error",
                "message": f"Error fetching RSS news: {str(e)}",
                "results": []
            }
