import asyncio
import os
from dotenv import load_dotenv
from newsdata_service import fetch_latest_news

# Load environment variables from a .env file if present
load_dotenv()

async def main():
    print("--- NewsData.io API Call Example ---")
    
    # Check if API key is configured
    api_key = os.getenv("NEWSDATA_API_KEY")
    if not api_key:
        print("[WARNING] NEWSDATA_API_KEY environment variable is not set.")
        print("Please configure your .env file or environment before running this script.")
        print("Example: set NEWSDATA_API_KEY=your_key_here")
        return

    # Prompt user for search query (or default)
    query = input("Enter a search topic (e.g., 'technology', or press Enter to fetch general news): ").strip()
    q = query if query else None

    # Fetch news
    print(f"\nFetching latest news for query: {q or 'general (none)'}...")
    try:
        data = await fetch_latest_news(q=q, language="en")
        
        # Display results
        status = data.get("status")
        total_results = data.get("totalResults", 0)
        print(f"Status: {status}")
        print(f"Total Results found: {total_results}")
        
        results = data.get("results", [])
        if not results:
            print("No articles found or API returned an empty list.")
            return

        print("\nTop Articles:")
        for idx, article in enumerate(results[:5], 1):
            title = article.get("title", "No Title")
            source = article.get("source_id", "Unknown Source")
            pub_date = article.get("pubDate", "Unknown Date")
            link = article.get("link", "#")
            print(f"\n{idx}. {title}")
            print(f"   Source: {source} | Published: {pub_date}")
            print(f"   URL: {link}")
            
    except Exception as e:
        print(f"\nAn error occurred: {e}")

if __name__ == "__main__":
    # Run the async main function
    asyncio.run(main())
