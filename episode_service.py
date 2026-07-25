"""Reusable story-module creation and personalized episode composition."""
from __future__ import annotations
import re
from typing import Iterable
from news_adapter import NewsArticle

CATEGORY_DETAILS = {
    "politics": {"label": "Politics", "image": "https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?auto=format&fit=crop&w=1200&q=85", "color": "coral"},
    "business": {"label": "Business", "image": "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=1200&q=85", "color": "gold"},
    "sports": {"label": "Sports", "image": "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=1200&q=85", "color": "mint"},
    "entertainment": {"label": "Entertainment", "image": "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=1200&q=85", "color": "pink"},
    "technology": {"label": "Technology", "image": "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=85", "color": "blue"},
    "world": {"label": "World", "image": "https://images.unsplash.com/photo-1521295121783-8a321d551ad2?auto=format&fit=crop&w=1200&q=85", "color": "violet"},
    "top": {"label": "Top story", "image": "https://images.unsplash.com/photo-1504711434969-e33886168f5?auto=format&fit=crop&w=1200&q=85", "color": "coral"},
}
CASTS = {
    "solo-hot-take": [{"id": "nova", "role": "host", "voiceProfile": "bright, quick, playful", "language": "en-IN"}],
    "two-person-banter": [{"id": "maya", "role": "explainer", "voiceProfile": "warm, nimble, conversational", "language": "en-IN"}, {"id": "leo", "role": "skeptical friend", "voiceProfile": "dry humor, curious", "language": "en-IN"}],
    "dramatized-pov": [{"id": "scene-guide", "role": "fictional scene guide", "voiceProfile": "cinematic, amused, precise", "language": "en-IN"}],
}

def build_episode(articles: list[NewsArticle], interests: list[str], cadence: str, language: str, story_count: int) -> dict[str, object]:
    selected = _select_articles(articles, interests, story_count)
    stories = [build_story(article, index, language) for index, article in enumerate(selected)]
    return {"title": _episode_title(interests), "cadence": cadence, "language": language, "interests": interests,
            "intro": "Your quick news scene is ready. Pick a story, or press play and let the plot thicken.",
            "outro": "That is the update. Knowledge acquired, endless scrolling postponed.",
            "storyCount": len(stories), "estimatedDurationSeconds": sum(story["durationSeconds"] for story in stories), "stories": stories}

def build_story(article: NewsArticle, index: int, language: str) -> dict[str, object]:
    category = _primary_category(article.categories)
    details = CATEGORY_DETAILS[category]
    story_format = ("solo-hot-take", "two-person-banter", "dramatized-pov")[index % 3]
    summary = _story_summary(article.best_available_text, article.title)
    beats = _build_beats(article, summary, category, details, story_format)
    source = {"name": article.source_name, "url": article.url, "publishedAt": article.published_at}
    return {"storyId": article.id, "title": article.title, "skipLabel": f"{details['label']}: {article.title}",
            "category": category, "topics": article.categories, "durationSeconds": sum(beat["visual"]["durationSeconds"] for beat in beats),
            "sources": [source], "format": story_format, "cast": [{**member, "language": language} for member in CASTS[story_format]],
            "entry": {"direct": f"Quick story: {article.title}.", "afterRelated": f"Staying on {details['label'].lower()}, {article.title}.", "afterUnrelated": f"Different kind of plot twist: {article.title}."},
            "beats": beats, "exit": f"Bottom line: {article.title}"}

def _build_beats(article: NewsArticle, summary: str, category: str, details: dict[str, str], story_format: str) -> list[dict[str, object]]:
    prompt_base = (f"Vertical 9:16 cinematic editorial-comedy visual about {details['label'].lower()} news. Story context: {article.title}. "
                   "Dramatic film lighting, premium contemporary setting, clear upper-third negative space for a caption, no text, logos, watermarks, fake screenshots, or realistic portrayal of a public figure doing an unverified action.")
    if story_format == "two-person-banter":
        fact_lines = [{"speaker": "leo", "text": "Okay, what happened this time?"}, {"speaker": "maya", "text": summary}]
        hook_lines = [{"speaker": "leo", "text": "This has strong 'someone opened the plot-twist tab' energy."}]
    elif story_format == "dramatized-pov":
        fact_lines = [{"speaker": "scene-guide", "text": summary}]
        hook_lines = [{"speaker": "scene-guide", "text": "Welcome to the scene where one headline changes the room."}]
    else:
        fact_lines = [{"speaker": "nova", "text": summary}]
        hook_lines = [{"speaker": "nova", "text": "This is one of those updates that makes the group chat suddenly become economists."}]
    return [
        {"id": "title-cue", "kind": "title-cue", "visual": _visual("title-visual", 4, f"{details['label']} story", prompt_base + " Establishing scene.", details), "lines": _title_lines(story_format, article.title)},
        {"id": "hook", "kind": "hook", "visual": _visual("character-reaction", 5, "The plot thickens", prompt_base + " A fictional young adult reacts with amused disbelief.", details), "lines": hook_lines},
        {"id": "what-happened", "kind": "what-happened", "visual": _visual("factual-visual", 5, article.title, prompt_base + " Use a grounded relevant place, object, or map.", details), "lines": fact_lines},
        {"id": "why-it-matters", "kind": "why-it-matters", "visual": _visual("funny-metaphor", 6, "Why it matters", prompt_base + " Use a clear, funny visual metaphor that supports the reported facts.", details), "lines": _impact_lines(story_format, category)},
        {"id": "takeaway", "kind": "takeaway", "visual": _visual("summary-visual", 4, "The takeaway", prompt_base + " A memorable, optimistic closing frame.", details), "lines": _takeaway_lines(story_format, article.title)},
    ]

def _visual(kind: str, duration: int, caption: str, prompt: str, details: dict[str, str]) -> dict[str, object]:
    return {"kind": kind, "durationSeconds": duration, "caption": caption, "imageUrl": details["image"], "imagePrompt": prompt, "motion": "slow push-in" if kind != "character-reaction" else "gentle pan", "tone": details["color"]}

def _title_lines(story_format: str, title: str) -> list[dict[str, str]]:
    speaker = "maya" if story_format == "two-person-banter" else "scene-guide" if story_format == "dramatized-pov" else "nova"
    return [{"speaker": speaker, "text": f"Quick story: {title}."}]

def _impact_lines(story_format: str, category: str) -> list[dict[str, str]]:
    label = CATEGORY_DETAILS[category]["label"].lower()
    if story_format == "two-person-banter":
        return [{"speaker": "leo", "text": "And why should I care before my next snack break?"}, {"speaker": "maya", "text": f"Because this is the kind of {label} move that can shape what happens next, not just today's headline."}]
    speaker = "scene-guide" if story_format == "dramatized-pov" else "nova"
    return [{"speaker": speaker, "text": f"Why it matters: this is a live {label} story, so the next move is worth watching."}]

def _takeaway_lines(story_format: str, title: str) -> list[dict[str, str]]:
    speaker = "maya" if story_format == "two-person-banter" else "scene-guide" if story_format == "dramatized-pov" else "nova"
    return [{"speaker": speaker, "text": f"The clean takeaway: {title}. Consider the plot officially in motion."}]

def _select_articles(articles: Iterable[NewsArticle], interests: list[str], story_count: int) -> list[NewsArticle]:
    requested = set(interests)
    candidates = [article for article in articles if requested.intersection(article.categories)] or list(articles)
    selected, used_categories = [], set()
    for article in candidates:
        primary = _primary_category(article.categories)
        if primary not in used_categories:
            selected.append(article); used_categories.add(primary)
        if len(selected) == story_count: return selected
    for article in candidates:
        if article not in selected: selected.append(article)
        if len(selected) == story_count: break
    return selected

def _primary_category(categories: list[str]) -> str:
    return next((category for category in categories if category in CATEGORY_DETAILS and category != "top"), "top")

def _story_summary(text: str, fallback: str) -> str:
    text = re.sub(r"\s+", " ", text).strip().split(" The post ", 1)[0]
    sentence = re.split(r"(?<=[.!?])\s+", text, maxsplit=1)[0] or fallback
    return sentence if len(sentence) <= 290 else sentence[:287].rsplit(" ", 1)[0] + "..."

def _episode_title(interests: list[str]) -> str:
    focus = " + ".join(item.title() for item in interests[:2] if item != "top") or "Today"
    return f"{focus} in motion"
