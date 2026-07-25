import unittest

from news_adapter import normalize_news_feed


class NewsAdapterTests(unittest.TestCase):
    def test_prefers_full_text_and_normalizes_external_fields(self):
        feed = {"articles": [{"id": "demo-1", "headline": "A headline", "excerpt": "A short summary", "body": "The full article text.", "url": "https://news.example.com/a-story", "categories": ["Technology"]}]}
        article = normalize_news_feed(feed)[0]
        self.assertEqual(article.id, "demo-1")
        self.assertEqual(article.title, "A headline")
        self.assertEqual(article.full_text, "The full article text.")
        self.assertEqual(article.categories, ["technology"])
        self.assertEqual(article.source_name, "news.example.com")

    def test_uses_summary_when_content_is_a_provider_placeholder(self):
        feed = {"results": [{"article_id": "demo-2", "title": "A story", "description": "Useful summary.", "content": "ONLY AVAILABLE IN PAID PLANS", "category": ["top"]}]}
        article = normalize_news_feed(feed)[0]
        self.assertEqual(article.full_text, "")
        self.assertEqual(article.best_available_text, "Useful summary.")


if __name__ == "__main__":
    unittest.main()
