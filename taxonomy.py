"""Editorial taxonomy used for every generated PocketNews story."""

SUGGESTED_INTERESTS = {
    "Technology": ["Artificial Intelligence", "Web Development", "Mobile Applications", "Cybersecurity", "Blockchain"],
    "Sports": ["Cricket", "Football", "Basketball", "Tennis", "Athletics"],
    "Business": ["Finance", "Stocks", "Real Estate", "Startups", "Cryptocurrency"],
    "Entertainment": ["Movies", "Music", "Gaming", "Celebrity News", "Television"],
    "Science": ["Space Exploration", "Physics", "Biology", "Environment", "Medicine"],
    "Lifestyle": ["Health & Fitness", "Travel", "Food & Cooking", "Fashion", "DIY"],
}


def taxonomy_prompt() -> str:
    return "\n".join(
        f"- {category}: {', '.join(subcategories)}"
        for category, subcategories in SUGGESTED_INTERESTS.items()
    )
