"""News collector configuration derived from the shared profile taxonomy."""
from shared_taxonomy import COLLECTOR_TAXONOMY


NEWS_TAXONOMY = {
    key: {
        "name": value["display"],
        "rss_topic": value["rss_topic"],
        "sub_topics": {
            key: {
                "name": value["display"],
                "query": value["query"],
                "micro_niches": {},
            }
        },
    }
    for key, value in COLLECTOR_TAXONOMY.items()
}
