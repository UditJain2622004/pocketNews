from pymongo.errors import DuplicateKeyError

from listening_service import record_listening_event, learned_scores
from personalization_service import select_personalized_stories


def _entries():
    return [
        {
            "storyId": "tech-1",
            "title": "AI update",
            "category": "Technology",
            "topics": ["technology"],
            "subcategories": ["Artificial Intelligence"],
        },
        {
            "storyId": "business-1",
            "title": "Market update",
            "category": "Business",
            "topics": ["business"],
            "subcategories": ["Finance"],
        },
        {
            "storyId": "sports-1",
            "title": "Sports update",
            "category": "Sports",
            "topics": ["sports"],
            "subcategories": ["Cricket"],
        },
    ]


def test_explicit_interest_is_primary_and_one_exploration_story_is_added():
    selected, metadata = select_personalized_stories(_entries(), ["Technology"], [], {})

    assert [entry["storyId"] for entry in selected] == ["tech-1", "business-1"]
    assert metadata == {"matchScore": 1, "matchingStoryCount": 1, "hasExplorationStory": True}


def test_subtopic_matches_and_learned_scores_affect_order_and_exploration():
    selected, _ = select_personalized_stories(
        _entries(), ["Technology"], ["Finance"], {"finance": 4, "sports": 2}
    )

    assert [entry["storyId"] for entry in selected] == ["tech-1", "business-1", "sports-1"]


def test_no_explicit_match_falls_back_to_full_episode_without_exploration():
    selected, metadata = select_personalized_stories(_entries(), ["Lifestyle"], [], {})

    assert [entry["storyId"] for entry in selected] == ["tech-1", "business-1", "sports-1"]
    assert metadata["hasExplorationStory"] is False


class FakeCollection:
    def __init__(self, documents=None):
        self.documents = list(documents or [])

    def find_one(self, query, projection=None):
        for document in self.documents:
            if all(document.get(key) == value for key, value in query.items()):
                return dict(document)
        return None

    def insert_one(self, document):
        if self.find_one({"userId": document["userId"], "eventId": document["eventId"]}):
            raise DuplicateKeyError("duplicate event")
        self.documents.append(dict(document))

    def find(self, query, projection=None):
        return [
            dict(document)
            for document in self.documents
            if all(document.get(key) == value for key, value in query.items())
        ]


class FakeDatabase:
    def __init__(self):
        self.episodes = FakeCollection([{
            "episodeId": "daily-1",
            "status": "published",
            "scripts": [_entries()[0]],
        }])
        self.listening_events = FakeCollection()


def test_listening_events_are_idempotent_and_update_learned_scores():
    database = FakeDatabase()
    first = record_listening_event(database, "user-1", "daily-1", "event-1", "tech-1", "completed", 1.0)
    duplicate = record_listening_event(database, "user-1", "daily-1", "event-1", "tech-1", "completed", 1.0)

    assert first["accepted"] is True
    assert duplicate["duplicate"] is True
    assert learned_scores(database, "user-1")["technology"] == 1


def test_completed_event_requires_eighty_percent_progress():
    database = FakeDatabase()
    try:
        record_listening_event(database, "user-1", "daily-1", "event-1", "tech-1", "completed", 0.79)
    except ValueError as error:
        assert "80%" in str(error)
    else:
        raise AssertionError("Expected low-progress completion to be rejected")
