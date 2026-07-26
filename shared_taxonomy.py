"""Canonical PocketNews taxonomy for profiles, collection, and story classification."""
from __future__ import annotations


PROFILE_TAXONOMY = {
    "Technology": [
        "Artificial Intelligence",
        "Apps & Gadgets",
        "Cybersecurity",
        "Startups & Innovation",
        "Space Tech",
    ],
    "Sports": ["Cricket", "Football", "Badminton", "Kabaddi", "Athletics"],
    "Business": [
        "Markets & Economy",
        "Startups",
        "Personal Finance",
        "Companies",
        "Crypto & Fintech",
    ],
    "Politics": [
        "Elections & Governance",
        "Policy & Laws",
        "Parliament & Parties",
        "Foreign Affairs",
        "State & Local Politics",
    ],
    "Entertainment": [
        "Movies & OTT",
        "Music",
        "Gaming",
        "Creators & Celebrity",
        "Television",
    ],
    "Science": [
        "Space Exploration",
        "Climate & Environment",
        "Health & Medicine",
        "Research & Discovery",
        "Biology",
    ],
    "Lifestyle": [
        "Health & Fitness",
        "Travel",
        "Food & Culture",
        "Fashion & Beauty",
        "Campus & Careers",
    ],
    "Politics": [
        "Elections",
        "Policy & Laws",
        "Government",
    ],
}

# Queries are deliberately simple: Google News adds the India constraint at fetch time.
COLLECTOR_TAXONOMY = {
    "technology": {
        "display": "Technology",
        "rss_topic": "TECHNOLOGY",
        "sub_topics": {
            "artificial_intelligence": {"display": "Artificial Intelligence", "query": "AI OR artificial intelligence OR machine learning"},
            "apps_gadgets": {"display": "Apps & Gadgets", "query": "apps OR smartphones OR gadgets OR mobile technology"},
            "cybersecurity": {"display": "Cybersecurity", "query": "cybersecurity OR data breach OR online security"},
            "startups_innovation": {"display": "Startups & Innovation", "query": "startups OR innovation OR venture capital"},
            "space_tech": {"display": "Space Tech", "query": "space technology OR satellite OR ISRO"},
        },
    },
    "sports": {
        "display": "Sports",
        "rss_topic": "SPORTS",
        "sub_topics": {
            "cricket": {"display": "Cricket", "query": "cricket"},
            "football": {"display": "Football", "query": "football"},
            "badminton": {"display": "Badminton", "query": "badminton"},
            "kabaddi": {"display": "Kabaddi", "query": "kabaddi"},
            "athletics": {"display": "Athletics", "query": "athletics OR track and field"},
        },
    },
    "business": {
        "display": "Business",
        "rss_topic": "BUSINESS",
        "sub_topics": {
            "markets_economy": {"display": "Markets & Economy", "query": "markets OR economy OR RBI"},
            "startups": {"display": "Startups", "query": "startups OR funding OR venture capital"},
            "personal_finance": {"display": "Personal Finance", "query": "personal finance OR mutual funds OR income tax"},
            "companies": {"display": "Companies", "query": "companies OR corporate earnings OR mergers"},
            "crypto_fintech": {"display": "Crypto & Fintech", "query": "fintech OR digital payments OR cryptocurrency"},
        },
    },
    "politics": {
        "display": "Politics",
        "rss_topic": "NATION",
        "sub_topics": {
            "elections_governance": {"display": "Elections & Governance", "query": "elections OR governance OR Election Commission"},
            "policy_laws": {"display": "Policy & Laws", "query": "government policy OR law OR legislation"},
            "parliament_parties": {"display": "Parliament & Parties", "query": "Parliament OR political parties OR Lok Sabha"},
            "foreign_affairs": {"display": "Foreign Affairs", "query": "foreign affairs OR diplomacy OR international relations"},
            "state_local_politics": {"display": "State & Local Politics", "query": "state government OR local politics OR chief minister"},
        },
    },
    "entertainment": {
        "display": "Entertainment",
        "rss_topic": "ENTERTAINMENT",
        "sub_topics": {
            "movies_ott": {"display": "Movies & OTT", "query": "movies OR OTT OR streaming"},
            "music": {"display": "Music", "query": "music OR concert OR album"},
            "gaming": {"display": "Gaming", "query": "gaming OR esports OR video games"},
            "creators_celebrity": {"display": "Creators & Celebrity", "query": "creators OR influencers OR celebrity"},
            "television": {"display": "Television", "query": "television OR TV series"},
        },
    },
    "science": {
        "display": "Science",
        "rss_topic": "SCIENCE",
        "sub_topics": {
            "space_exploration": {"display": "Space Exploration", "query": "space exploration OR ISRO OR rocket launch"},
            "climate_environment": {"display": "Climate & Environment", "query": "climate OR environment OR pollution"},
            "health_medicine": {"display": "Health & Medicine", "query": "health OR medicine OR medical research"},
            "research_discovery": {"display": "Research & Discovery", "query": "scientific research OR discovery"},
            "biology": {"display": "Biology", "query": "biology OR genetics OR wildlife science"},
        },
    },
    "lifestyle": {
        "display": "Lifestyle",
        "rss_topic": "HEALTH",
        "sub_topics": {
            "health_fitness": {"display": "Health & Fitness", "query": "fitness OR wellness OR mental health"},
            "travel": {"display": "Travel", "query": "travel OR tourism OR destinations"},
            "food_culture": {"display": "Food & Culture", "query": "food OR restaurants OR culture"},
            "fashion_beauty": {"display": "Fashion & Beauty", "query": "fashion OR beauty OR style"},
            "campus_careers": {"display": "Campus & Careers", "query": "campus OR college OR careers OR jobs"},
        },
    },
    "politics": {
        "display": "Politics",
        "rss_topic": "NATION",
        "sub_topics": {
            "elections": {"display": "Elections", "query": "elections OR voting OR polls"},
            "policy_laws": {"display": "Policy & Laws", "query": "policy OR parliament OR legislation OR laws"},
            "government": {"display": "Government", "query": "government OR cabinet OR prime minister OR state administration"},
        },
    },
}


def collector_key_for_display(category: str) -> str | None:
    normalized = category.strip().lower()
    return normalized if normalized in COLLECTOR_TAXONOMY else next(
        (key for key, value in COLLECTOR_TAXONOMY.items() if value["display"].lower() == normalized),
        None,
    )
