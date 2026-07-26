import os
from datetime import datetime, timezone, timedelta
from typing import Any, List, Literal, Optional
from bson import ObjectId
from pydantic import BaseModel
from openai import OpenAI
from news_adapter import load_mock_articles
from auth.database import db

# Schemas
class AskStoryRequest(BaseModel):
    question: str

class ReactStoryRequest(BaseModel):
    episodeId: str
    reaction: Literal["useful", "surprising", "need_more_context", "i_disagree"]

class GameAnswer(BaseModel):
    questionId: str
    selectedOptionId: Literal["a", "b"]

class GameSubmission(BaseModel):
    challengeId: str
    answers: List[GameAnswer]
    prediction: Literal["a", "b"]

# Helper to find story context
def find_story(story_id: str) -> dict[str, Any] | None:
    if db is not None:
        episode = db.episodes.find_one({"scripts.storyId": story_id})
        if episode:
            for script_entry in episode.get("scripts", []):
                if script_entry.get("storyId") == story_id:
                    script_path = script_entry.get("scriptPath")
                    if script_path:
                        try:
                            from main import BASE_DIR
                            import json
                            with open(BASE_DIR / script_path, "r", encoding="utf-8") as f:
                                return json.load(f)
                        except Exception:
                            pass
                    return script_entry
    # Fallback to news_format.json articles
    try:
        from main import NEWS_FEED_PATH
        articles = load_mock_articles(NEWS_FEED_PATH)
        for art in articles:
            if art.id == story_id:
                return {
                    "storyId": art.id,
                    "title": art.title,
                    "category": art.categories[0] if art.categories else "News",
                    "sources": [{"name": art.source_name, "url": art.url, "publishedAt": art.published_at}],
                    "beats": [
                        {
                            "id": "what-happened",
                            "lines": [{"speaker": "Narrator", "text": art.best_available_text}]
                        }
                    ]
                }
    except Exception:
        pass
    return None

def find_story_text(story_id: str) -> str:
    script = find_story(story_id)
    if not script:
        return ""
    
    # Check if there is original news article details in the script
    article_data = script.get("article") or {}
    article_title = article_data.get("title") or ""
    article_summary = article_data.get("summary") or ""
    article_text = article_data.get("full_text") or ""
    
    story_data = script.get("story") or script
    beats = story_data.get("beats", [])
    lines = []
    for beat in beats:
        for line in beat.get("lines", []):
            lines.append(f"{line.get('speaker', 'Narrator')}: {line.get('text')}")
            
    sources = story_data.get("sources", [])
    sources_str = ", ".join([s.get("url") or s.get("name") or "" for s in sources if s.get("url") or s.get("name")])
    
    context = ""
    if article_title:
        context += f"Original News Article Headline: {article_title}\n"
    if article_summary:
        context += f"Original News Article Summary: {article_summary}\n"
    if article_text:
        context += f"Original News Article Full Text: {article_text}\n"
        
    context += f"Story Script Title: {story_data.get('title')}\nCategory: {story_data.get('category')}\nStory Script Dialogue/Conversation:\n" + "\n".join(lines) + f"\nSources: {sources_str}"
    return context

# LLM QA
def answer_story_question(story_id: str, question: str) -> str:
    context = find_story_text(story_id)
    if not context:
        return "Story details not found. Unable to answer."
    
    client = OpenAI()
    prompt = f"""
You are an AI news assistant. The user is asking a question about a news story.
Here is the news story details:
{context}

User Question: {question}

Answer the question accurately using ONLY the context provided above. Keep it concise, friendly, and in the language of the question (e.g. Hindi/Hinglish if asked in Hindi/Hinglish).
"""
    response = client.chat.completions.create(
        model=os.getenv("OPENAI_MODEL", "gpt-4o-mini"),
        messages=[
            {"role": "system", "content": "You are a helpful assistant."},
            {"role": "user", "content": prompt}
        ]
    )
    content = response.choices[0].message.content.strip()
    return content.replace("**", "")

# Personalized curiosity path details
def get_story_curiosity_path(story_id: str, path_type: str) -> str:
    context = find_story_text(story_id)
    if not context:
        return "Story details not found."
    
    client = OpenAI()
    
    instructions = {
        "summary": "Provide a concise 60-second summary of this story in simple English.",
        "why_it_matters": "Explain why this story matters to the reader personally in simple English.",
        "opposite_perspective": "Provide a different or opposite perspective/critique on the events in this story.",
        "next_update": "What is the expected next update or future outlook for this ongoing story?",
        "timeline": "Provide a chronological timeline of key events related to this story/event."
    }
    
    instruction = instructions.get(path_type, "Summarize this story.")
    if path_type == "timeline":
        prompt = f"""
Story/News details:
{context}

Instruction: Provide a chronological timeline of key real-world events, historical milestones, or background events related to the subject or topic of this news story.

CRITICAL RULES:
1. DO NOT make a timeline of the characters' conversation, script dialogue, or narrative flow in the story script (e.g. DO NOT use entries like "Before the proposed payment", "Immediately afterward", "During the discussion", "Following the warning", "Resolution").
2. Focus ONLY on the actual real-world news event, its historical context, key industry/technology milestones, or background timeline of the subject matter discussed (e.g. if the news is about a technology like Blockchain or UPI, or a company, or a law/policy, provide a timeline of key milestones/dates when relevant versions, features, or events occurred in the real world).
3. Use your broader knowledge about the topic/subject of the news to populate relevant historical milestones (specifying years/dates) even if they are not fully detailed in the short article text, so that the timeline is informative and educational.
4. Format: Each event must start with a bullet point and specify a year, date, or clear real-world timeframe (e.g. "- [Year/Date]: Event description"). Keep the list concise (3-5 items max).
"""
    else:
        prompt = f"""
Story details:
{context}

Instruction: {instruction}

Generate a concise, engaging response paragraph (3-4 sentences max) in simple English.
"""
    response = client.chat.completions.create(
        model=os.getenv("OPENAI_MODEL", "gpt-4o-mini"),
        messages=[
            {"role": "system", "content": "You are an expert news analyst."},
            {"role": "user", "content": prompt}
        ]
    )
    content = response.choices[0].message.content.strip()
    return content.replace("**", "")

# Daily News Challenge Game
def get_daily_challenge() -> dict[str, Any]:
    # Try fetching 3 stories from published episodes or mock articles
    stories_list = []
    if db is not None:
        episodes = list(db.episodes.find().sort("publishedAt", -1).limit(3))
        for ep in episodes:
            for script in ep.get("scripts", []):
                if script.get("storyId") not in [s["storyId"] for s in stories_list]:
                    stories_list.append(script)
                    if len(stories_list) >= 3:
                        break
            if len(stories_list) >= 3:
                break
                
    if len(stories_list) < 3:
        # Fallback to mock articles
        try:
            from main import NEWS_FEED_PATH
            articles = load_mock_articles(NEWS_FEED_PATH)
            for art in articles[:3]:
                stories_list.append({
                    "storyId": art.id,
                    "title": art.title,
                    "category": art.categories[0] if art.categories else "News"
                })
        except Exception:
            pass
            
    # Attempt to dynamically generate real questions using LLM based on story content
    questions = []
    try:
        import json
        stories_data = []
        for idx, story in enumerate(stories_list[:3]):
            story_id = story.get("storyId") or story.get("id")
            if story_id:
                content = find_story_text(story_id)
                stories_data.append({
                    "index": idx,
                    "title": story.get("title", ""),
                    "content": content
                })
        
        if len(stories_data) > 0:
            client = OpenAI()
            prompt = f"""
You are a quiz master. Create a multiple-choice question for each of the following news stories.
Each question must have exactly 2 options (a and b) and must be based on the actual facts/events in that specific story.
Do NOT create generic or placeholder questions. Make sure the questions and options test real comprehension of the story content.

Stories:
{json.dumps(stories_data, indent=2)}

Respond with a JSON object containing a "questions" key, which is a list of objects. Each object must have:
- index: the index of the story (0, 1, or 2)
- question: the multiple-choice question
- options: a list of two items:
  - {{"id": "a", "text": "option A text"}}
  - {{"id": "b", "text": "option B text"}}
- correctOptionId: "a" or "b" (whichever is the correct answer based on the story content)
"""
            response = client.chat.completions.create(
                model=os.getenv("OPENAI_MODEL", "gpt-4o-mini"),
                response_format={"type": "json_object"},
                messages=[
                    {"role": "system", "content": "You are a helpful quiz generator. Always output JSON."},
                    {"role": "user", "content": prompt}
                ]
            )
            res_data = json.loads(response.choices[0].message.content.strip())
            llm_questions = res_data.get("questions", [])
            for q_data in llm_questions:
                idx = q_data.get("index")
                if idx is not None and idx < len(stories_list):
                    questions.append({
                        "id": f"q{idx + 1}",
                        "storyId": stories_list[idx].get("storyId") or stories_list[idx].get("id"),
                        "question": q_data.get("question"),
                        "options": q_data.get("options"),
                        "correctOptionId": q_data.get("correctOptionId", "a")
                    })
    except Exception as e:
        print(f"Error generating daily challenge: {e}")
        questions = []

    if not questions:
        # Default mock questions to guarantee response
        questions = [
            {
                "id": "q1",
                "storyId": stories_list[0].get("storyId", "s1") if len(stories_list) > 0 else "s1",
                "question": f"Based on '{stories_list[0].get('title', 'Market Trends')}', what is the primary impact?",
                "options": [{"id": "a", "text": "Rapid valuation drop"}, {"id": "b", "text": "Regulatory clearance"}],
                "correctOptionId": "a"
            },
            {
                "id": "q2",
                "storyId": stories_list[1].get("storyId", "s2") if len(stories_list) > 1 else "s2",
                "question": f"Which entity is most affected in '{stories_list[1].get('title', 'Global Trade')}'?",
                "options": [{"id": "a", "text": "Local consumers"}, {"id": "b", "text": "Large corporations"}],
                "correctOptionId": "b"
            },
            {
                "id": "q3",
                "storyId": stories_list[2].get("storyId", "s3") if len(stories_list) > 2 else "s3",
                "question": f"What technology is highlighted in '{stories_list[2].get('title', 'AI Breakthrough')}'?",
                "options": [{"id": "a", "text": "Generative models"}, {"id": "b", "text": "Quantum computing"}],
                "correctOptionId": "a"
            }
        ]
    
    prediction = {
        "id": "pred",
        "question": "Will tech stocks see a recovery by the end of this week?",
        "options": [{"id": "a", "text": "Yes, recovery starts"}, {"id": "b", "text": "No, consolidation continues"}]
    }
    
    challenge_date = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    return {
        "challengeId": f"challenge-{challenge_date}",
        "questions": questions,
        "prediction": prediction
    }

def submit_challenge_answers(user_id: str, submission: GameSubmission) -> dict[str, Any]:
    if db is None:
        return {"status": "success", "correctCount": 3, "streak": 1, "newBadges": []}
        
    # Check correct answers
    challenge = get_daily_challenge()
    correct_map = {q["id"]: q["correctOptionId"] for q in challenge["questions"]}
    
    correct_count = 0
    categories_correct = []
    for ans in submission.answers:
        corr_id = correct_map.get(ans.questionId)
        if corr_id and ans.selectedOptionId == corr_id:
            correct_count += 1
            # Track category of correct answer
            story_id = next((q["storyId"] for q in challenge["questions"] if q["id"] == ans.questionId), None)
            if story_id:
                story_data = find_story(story_id)
                if story_data:
                    cat = story_data.get("category") or story_data.get("story", {}).get("category") or "News"
                    categories_correct.append(cat)
                    
    # Log user status
    user_status = db.user_game_status.find_one({"userId": user_id})
    if not user_status:
        user_status = {
            "userId": user_id,
            "streak": 0,
            "lastPlayed": "",
            "badges": [],
            "correctCounts": {}
        }
        
    last_played = user_status.get("lastPlayed", "")
    today_str = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    yesterday_str = (datetime.now(timezone.utc) - timedelta(days=1)).strftime("%Y-%m-%d")
    
    streak = user_status.get("streak", 0)
    if last_played == yesterday_str:
        streak += 1
    elif last_played == today_str:
        # Already played today, keep streak
        pass
    else:
        streak = 1
        
    # Update category correct counts
    corr_counts = user_status.get("correctCounts", {})
    for cat in categories_correct:
        corr_counts[cat] = corr_counts.get(cat, 0) + 1
        
    # Award badges
    new_badges = []
    existing_badges = user_status.get("badges", [])
    badge_rules = {
        "Tech Tracker": ("Technology", 3),
        "Market Mind": ("Business", 3),
        "World Watcher": ("Science", 3)
    }
    
    for badge, (cat_name, target) in badge_rules.items():
        if badge not in existing_badges and corr_counts.get(cat_name, 0) >= target:
            new_badges.append(badge)
            existing_badges.append(badge)
            
    db.user_game_status.update_one(
        {"userId": user_id},
        {
            "$set": {
                "streak": streak,
                "lastPlayed": today_str,
                "badges": existing_badges,
                "correctCounts": corr_counts
            }
        },
        upsert=True
    )
    
    return {
        "status": "success",
        "correctCount": correct_count,
        "streak": streak,
        "newBadges": new_badges,
        "allBadges": existing_badges
    }

# Mujhe Catch Up Karao Briefing
def get_catch_up_brief(user_id: str) -> dict[str, Any]:
    if db is None:
        return {"missedUpdates": 0, "summary": "No new updates since your last visit.", "stories": []}
        
    # Get user topics
    user = db.users.find_one({"_id": ObjectId(user_id)})
    if not user:
        return {"missedUpdates": 0, "summary": "User not found.", "stories": []}
        
    user_topics = user.get("topics", [])
    if not user_topics:
        user_topics = ["Technology", "Business"]
        
    # Find last listening event to determine when they were last active
    last_event = db.listening_events.find_one({"userId": user_id}, sort=[("createdAt", -1)])
    last_active = datetime.now(timezone.utc) - timedelta(days=3)
    if last_event and "createdAt" in last_event:
        try:
            last_active = datetime.fromisoformat(last_event["createdAt"].replace("Z", "+00:00"))
        except ValueError:
            pass
            
    # Find stories in preferred categories published since last_active
    recent_stories = []
    episodes = db.episodes.find({
        "publishedAt": {"$gt": last_active},
        "categories": {"$in": user_topics}
    }).sort("publishedAt", -1)
    
    for ep in episodes:
        for script in ep.get("scripts", []):
            cat = script.get("category") or script.get("story", {}).get("category") or ""
            if cat in user_topics and script.get("storyId") not in [s["storyId"] for s in recent_stories]:
                recent_stories.append({
                    "storyId": script["storyId"],
                    "title": script.get("title", "News Update"),
                    "category": cat,
                    "summary": script.get("story", {}).get("exit", "")
                })
                
    if not recent_stories:
        return {
            "missedUpdates": 0,
            "summary": "All up to date! You haven't missed any updates in your preferred topics.",
            "stories": []
        }
        
    # Generate catch-up summary via LLM
    titles_summary = "\n".join([f"- [{s['category']}] {s['title']}: {s['summary']}" for s in recent_stories[:5]])
    
    client = OpenAI()
    prompt = f"""
The user has missed some recent news updates in their favorite categories.
Here are the missed stories:
{titles_summary}

Write a quick, energetic, 4-line English catch-up greeting. Start with:
"You missed {len(recent_stories)} important updates in {user_topics[0]} and business. Listen to them in 4 minutes."
Give a very short bulleted outline of the key events.
"""
    response = client.chat.completions.create(
        model=os.getenv("OPENAI_MODEL", "gpt-4o-mini"),
        messages=[
            {"role": "system", "content": "You are a friendly audio show narrator."},
            {"role": "user", "content": prompt}
        ]
    )
    brief = response.choices[0].message.content.strip()
    
    return {
        "missedUpdates": len(recent_stories),
        "summary": brief,
        "stories": recent_stories
    }
