NEWS_TAXONOMY = {
    "technology": {
        "name": "Technology",
        "rss_topic": "TECHNOLOGY",
        "sub_topics": {
            "ai": {
                "name": "Artificial Intelligence",
                "query": '"Artificial Intelligence" OR "AI"',
                "micro_niches": {
                    "llms": {"name": "LLMs", "query": 'LLMs OR "Large Language Models"'},
                    "robotics": {"name": "Humanoid Robotics", "query": '"humanoid robotics" OR "humanoid robot"'},
                    "chips": {"name": "Chips", "query": 'semiconductors OR microchips OR "computer chips"'}
                }
            }
        }
    },
    "business": {
        "name": "Business & Finance",
        "rss_topic": "BUSINESS",
        "sub_topics": {
            "crypto": {
                "name": "Crypto & Web3",
                "query": 'crypto OR cryptocurrency OR "web3"',
                "micro_niches": {
                    "bitcoin": {"name": "Bitcoin", "query": 'Bitcoin OR BTC'},
                    "defi": {"name": "DeFi", "query": 'DeFi OR "decentralized finance"'},
                    "regulation": {"name": "Regulation", "query": '"crypto regulation" OR "SEC crypto"'}
                }
            }
        }
    },
    "world": {
        "name": "World News",
        "rss_topic": "WORLD",
        "sub_topics": {
            "geopolitics": {
                "name": "Geopolitics",
                "query": 'geopolitics OR geopolitical',
                "micro_niches": {
                    "middle_east": {"name": "Middle East", "query": '"Middle East" OR "Gaza" OR "Israel"'},
                    "eu_policy": {"name": "EU Policy", "query": '"European Union" OR "EU policy" OR "Brussels"'},
                    "elections": {"name": "Elections", "query": 'elections OR election OR voting'}
                }
            }
        }
    },
    "pop_culture": {
        "name": "Pop Culture",
        "rss_topic": "ENTERTAINMENT",
        "sub_topics": {
            "cinema": {
                "name": "Cinema & Hollywood",
                "query": 'cinema OR Hollywood OR movies',
                "micro_niches": {
                    "box_office": {"name": "Box Office", "query": '"box office" OR "movie collection"'},
                    "anime": {"name": "Anime", "query": 'anime OR manga'},
                    "marvel": {"name": "Marvel", "query": 'Marvel OR MCU OR "Marvel Studios"'}
                }
            }
        }
    },
    "politics": {
        "name": "Politics",
        "rss_topic": "NATION",
        "sub_topics": {
            "indian_politics": {
                "name": "Indian Politics",
                "query": '"Indian politics" OR "BJP" OR "Congress" OR "parliament"',
                "micro_niches": {
                    "elections": {"name": "Elections", "query": 'elections OR polls OR voting'},
                    "parliament": {"name": "Parliament", "query": '"Lok Sabha" OR "Rajya Sabha" OR "parliament session"'},
                    "coalition": {"name": "Coalition Politics", "query": '"NDA" OR "INDIA bloc" OR "coalition govt"'}
                }
            },
            "global_politics": {
                "name": "Global Politics",
                "query": '"global politics" OR "international relations" OR "foreign policy"',
                "micro_niches": {
                    "us_elections": {"name": "US Elections", "query": '"US presidential election" OR "Trump" OR "Harris" OR "Democrats"'},
                    "alliances": {"name": "Geopolitical Alliances", "query": 'NATO OR G20 OR BRICS OR Quad'},
                    "trade_policy": {"name": "Trade Policy", "query": 'tariffs OR "trade war" OR "trade barriers"'}
                }
            }
        }
    },
    "sports": {
        "name": "Sports",
        "rss_topic": "SPORTS",
        "sub_topics": {
            "cricket": {
                "name": "Cricket",
                "query": 'cricket OR ICC OR "T20" OR "IPL"',
                "micro_niches": {
                    "ipl": {"name": "IPL", "query": '"IPL" OR "Indian Premier League"'},
                    "t20": {"name": "T20", "query": '"T20" OR "T20 World Cup"'},
                    "test_cricket": {"name": "Test Cricket", "query": '"Test cricket" OR "WTC"'}
                }
            },
            "football": {
                "name": "Football",
                "query": 'football OR soccer OR FIFA OR UEFA',
                "micro_niches": {
                    "premier_league": {"name": "Premier League", "query": '"Premier League" OR "EPL"'},
                    "champions_league": {"name": "Champions League", "query": '"Champions League" OR "UEFA"'},
                    "world_cup": {"name": "World Cup", "query": '"World Cup" OR "FIFA World Cup"'}
                }
            }
        }
    }
}


