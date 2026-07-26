# Pocket News - Cinematic News Engine

Pocket News is an automated daily podcast and news brief generator.

---

### 🔴 The Problem
Traditional news feeds are dry, text-heavy, and passive. They struggle to engage modern, audio-first audiences, leading to rapid attention drop-offs.

### 🟢 The Solution
Pocket News curates daily headlines and morphs them into personalized, multi-character cinematic audio podcasts that keep listeners engaged.

### 🌟 Feature Highlights
* **Cinematic Scripts:** Converts headlines into multi-character audio dialogues with custom pacing.
* **Indian-Tuned Voices:** Integrates Sarvam AI (Arjun, Meera, Shreya, etc.) for natural Indian-accented narration, with OpenAI audio fallback.
* **Dynamic Background Music:** Mixes category-specific background loops (e.g. upbeat for Sports, drone for Politics, synthwave for Tech) into dialogue WAV files at offset-aligned generation time.
* **On-Demand Translations:** Translate scripts and voices on-the-fly into English, Hindi, Bhojpuri, Marathi, Bengali, Tamil, Kannada, Spanish, French, German, or Japanese.
* **Interactive Player:** Minimalist glassmorphism web interface featuring subtitles and a custom playback queue.

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