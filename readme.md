# Pocket News - Cinematic News Engine

Pocket News is an automated daily podcast and news brief generator that transforms flat news feeds into highly engaging, multi-sensory, and interactive audio-visual experiences.

---

### 🔴 The Problem
Traditional news feeds are dry, passive, and text-heavy. They struggle to hold the attention of modern, audio-first audiences, leading to low retention and engagement.

### 🟢 The Solution
Pocket News curates daily headlines and morphs them into highly personalized, multi-character cinematic audio dramas accompanied by AI-generated scenes, dynamic soundscapes, and on-demand interactive features.

---

### 🌟 Key Feature Highlights

* **Cinematic Story Generation:** Turns raw headlines into multi-character audio dialogues with natural pacing and distinct voice personalities.
* **Indian-Tuned Voice Cast:** Integrates Sarvam AI TTS (Arjun, Meera, Shreya, Shubh, Manan, Ishita) for authentic Indian-accented narration, with OpenAI audio fallback.
* **Dynamic Background Music:** Automatically overlays category-matched background loops (e.g. synthwave for Tech, upbeat for Sports, corporate drone for Politics) into narration clips at offset-aligned generation time.
* **Interactive AI Q&A ("Ask AI"):** An on-page Q&A sidebar that lets users ask custom questions about the current story and get real-time answers.
* **Personalized Curiosity Paths:** Lets listeners choose their depth of understanding for any story by selecting a path: *60s Summary*, *Why it matters*, *Critique (Opposite Perspective)*, or *Next Update*.
* **Chronological Event Timelines:** Reconstructs and visualizes dates and key progression events for each news story in a sleek visual timeline.
* **Prediction Challenges & Impact Polls:** Displays interactive pop-ups over the story image, letting users vote or predict outcomes to test their knowledge.
* **Engagement Reactions:** Listeners can react to stories (Useful 👍, Surprising 😮, Context 🤔, Disagree 👎) during playback.
* **On-Demand Translations:** Translate scripts and voices instantly into English, Hindi, Bhojpuri, Marathi, Bengali, Tamil, Kannada, Spanish, French, German, or Japanese.

---

## Prerequisites

Before starting, ensure you have:
1. **Node.js** (v18 or higher)
2. **Python** (v3.10 or higher)
3. **FFmpeg** (installed and added to system PATH, required for dynamic audio mixing)
4. **MongoDB** instance (or MongoDB Atlas connection)

---

## 1. Backend Setup (FastAPI)

1. **Navigate to project root:**
   ```bash
   cd PocketNews
   ```

2. **Create Python Virtual Environment:**
   - **Windows:**
     ```bash
     python -m venv .venv
     .venv\Scripts\activate
     ```
   - **macOS/Linux:**
     ```bash
     python3 -m venv .venv
     source .venv/bin/activate
     ```

3. **Install Dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

4. **Environment Configuration:**
   Create a `.env` file in the root directory:
   ```env
   MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/
   OPENAI_API_KEY=sk-proj-xxxx...
   SARVAM_API_KEY=sk_b3...
   NEWSDATA_API_KEY=pub_xxxx...
   AUDIO_SERVICE=openai
   ```

5. **Run Backend Server:**
   ```bash
   .venv\Scripts\uvicorn main:app --reload
   ```
   API docs are available at `http://127.0.0.1:8000/docs`.

---

## 2. Frontend Setup (React / Vite)

1. **Navigate to the frontend folder:**
   ```bash
   cd frontend
   ```

2. **Install Node Modules:**
   ```bash
   npm install
   ```

3. **Run the Development Server:**
   ```bash
   npm run dev
   ```
   Access the app at `http://localhost:5173`.