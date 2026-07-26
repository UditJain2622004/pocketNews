"""News collector configuration derived from the shared profile taxonomy."""
from shared_taxonomy import COLLECTOR_TAXONOMY


NEWS_TAXONOMY = {
    key: {
        "name": value["display"],
        "rss_topic": value["rss_topic"],
        "sub_topics": {
            subtopic_key: {
                "name": subtopic["display"],
                "query": subtopic["query"],
                "micro_niches": {},
            }
            for subtopic_key, subtopic in value["sub_topics"].items()
        },
    }
    for key, value in COLLECTOR_TAXONOMY.items()
}
