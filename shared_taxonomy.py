"""Single category source for collection, stories, and user preferences."""
from __future__ import annotations

PROFILE_TAXONOMY = {
    "Technology": ["Artificial Intelligence", "Web Development", "Mobile Applications", "Cybersecurity", "Blockchain"],
    "Sports": ["Cricket", "Football", "Basketball", "Tennis", "Athletics"],
    "Business": ["Finance", "Stocks", "Real Estate", "Startups", "Cryptocurrency"],
    "Entertainment": ["Movies", "Music", "Gaming", "Celebrity News", "Television"],
    "Science": ["Space Exploration", "Physics", "Biology", "Environment", "Medicine"],
    "Lifestyle": ["Health & Fitness", "Travel", "Food & Cooking", "Fashion", "DIY"],
}

COLLECTOR_TAXONOMY = {
    "technology": {"display": "Technology", "rss_topic": "TECHNOLOGY", "query": "technology OR AI OR cybersecurity"},
    "sports": {"display": "Sports", "rss_topic": "SPORTS", "query": "sports OR cricket OR football"},
    "business": {"display": "Business", "rss_topic": "BUSINESS", "query": "business OR markets OR finance"},
    "entertainment": {"display": "Entertainment", "rss_topic": "ENTERTAINMENT", "query": "entertainment OR movies OR music"},
    "science": {"display": "Science", "rss_topic": "SCIENCE", "query": "science OR space OR health research"},
    "lifestyle": {"display": "Lifestyle", "rss_topic": "HEALTH", "query": "lifestyle OR travel OR wellness"},
}


def collector_key_for_display(category: str) -> str | None:
    normalized = category.strip().lower()
    return normalized if normalized in COLLECTOR_TAXONOMY else next(
        (key for key, value in COLLECTOR_TAXONOMY.items() if value["display"].lower() == normalized),
        None,
    )
