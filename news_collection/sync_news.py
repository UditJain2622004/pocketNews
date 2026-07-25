import os
import json
import asyncio
from datetime import datetime
from .rss_service import fetch_google_news_rss
from .taxonomy import NEWS_TAXONOMY

async def run_news_sync():
    """
    Perform a complete news sync for all registered categories in NEWS_TAXONOMY.
    Save results locally in a structured directory hierarchy under 'News/DD/MM/YYYY/'.
    """
    print(f"[{datetime.now()}] Starting news sync...")
    
    # 1. Determine local date string (formatted as DD_MM_YYYY)
    now = datetime.now()
    date_str = now.strftime("%d_%m_%Y")
    
    # Base directory relative to project root
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    target_dir = os.path.join(base_dir, "News", date_str)
    
    # Ensure target directory exists
    os.makedirs(target_dir, exist_ok=True)

    print(f"[{datetime.now()}] Target folder created: {target_dir}")
    
    sync_summary = {}
    
    # 2. Iterate through all taxonomy categories and fetch
    for category_key, category_meta in NEWS_TAXONOMY.items():
        print(f"[{datetime.now()}] Fetching news for: {category_key} ({category_meta['name']})...")
        try:
            res = await fetch_google_news_rss(category=category_key)
            if res.get("status") == "success":
                results = res.get("results", [])
                
                # Write to local file: News/DD/MM/YYYY/category_key.json
                file_path = os.path.join(target_dir, f"{category_key}.json")
                with open(file_path, "w", encoding="utf-8") as f:
                    json.dump(res, f, ensure_ascii=False, indent=2)
                    
                print(f"[{datetime.now()}] Successfully saved {len(results)} articles to {file_path}")
                sync_summary[category_key] = {
                    "status": "success",
                    "articles_count": len(results),
                    "file_path": file_path
                }
            else:
                error_msg = res.get("message", "Unknown error")
                print(f"[{datetime.now()}] Failed to fetch {category_key}: {error_msg}")
                sync_summary[category_key] = {
                    "status": "failed",
                    "error": error_msg
                }
        except Exception as e:
            print(f"[{datetime.now()}] Exception occurred syncing {category_key}: {str(e)}")
            sync_summary[category_key] = {
                "status": "error",
                "error": str(e)
            }
            
    print(f"[{datetime.now()}] News sync complete.")
    return sync_summary

if __name__ == "__main__":
    # Allow execution directly as a CLI script
    asyncio.run(run_news_sync())
