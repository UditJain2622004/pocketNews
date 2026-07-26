"""OpenAI and Sarvam AI audio generation for individual PocketNews story lines."""
from __future__ import annotations

import base64
import os
from pathlib import Path
import requests

from dotenv import load_dotenv
from openai import OpenAI


BASE_DIR = Path(__file__).resolve().parent
load_dotenv(BASE_DIR / ".env")
AUDIO_MODEL = "gpt-audio-1.5"
AUDIO_VOICES = ("alloy", "coral", "sage", "verse", "marin", "cedar")

# Sarvam AI Specific Voice Mappings & Locale Resolution
SARVAM_VOICES = {
    "alloy": "arjun",      # Male
    "coral": "meera",      # Female
    "sage": "shubh",       # Male
    "verse": "shreya",     # Female
    "marin": "manan",      # Male
    "cedar": "ishita",     # Female
}

LANGUAGE_TO_LOCALE = {
    "english": "en-IN",
    "en-in": "en-IN",
    "hindi": "hi-IN",
    "hi-in": "hi-IN",
    "marathi": "mr-IN",
    "mr-in": "mr-IN",
    "bengali": "bn-IN",
    "bn-in": "bn-IN",
    "tamil": "ta-IN",
    "ta-in": "ta-IN",
    "kannada": "kn-IN",
    "kn-in": "kn-IN",
}


class AudioGenerationError(RuntimeError):
    pass


def generate_story_line(
    text: str,
    voice: str,
    voice_profile: str,
    language: str,
    story_context: str,
) -> bytes:
    # Force reload environment variables to catch runtime .env updates
    load_dotenv(BASE_DIR / ".env", override=True)
    sarvam_key = os.getenv("SARVAM_API_KEY")
    
    # Resolve the language string/code to a supported Indian locale code
    locale = LANGUAGE_TO_LOCALE.get(str(language or "").lower())
    
    # Try Sarvam AI first for Indian locales if API key is provided
    if sarvam_key and locale:
        sarvam_voice = SARVAM_VOICES.get(voice, "meera")
        try:
            payload = {
                "text": text,
                "speaker": sarvam_voice,
                "target_language_code": locale,
                "model": "bulbul:v3",
                "pace": 1.0,
                "speech_sample_rate": 24000,
            }
            headers = {
                "api-subscription-key": sarvam_key,
                "Content-Type": "application/json",
            }
            response = requests.post(
                "https://api.sarvam.ai/text-to-speech",
                json=payload,
                headers=headers,
                timeout=30
            )
            if response.status_code == 200:
                res_data = response.json()
                if "audios" in res_data and len(res_data["audios"]) > 0:
                    return base64.b64decode(res_data["audios"][0])
                else:
                    print(f"Warning: Sarvam AI returned no audio array. Response: {res_data}")
            else:
                print(f"Warning: Sarvam AI error status {response.status_code}. Response: {response.text}")
        except Exception as e:
            print(f"Warning: Sarvam AI TTS request failed: {e}. Falling back to OpenAI.")

    # Fallback to OpenAI gpt-audio-1.5
    if not os.getenv("OPENAI_API_KEY"):
        raise AudioGenerationError("OPENAI_API_KEY is not configured.")

    instructions = (
        f"You are performing one line in a continuous {language} fictional news-story scene. "
        f"Character delivery direction: {voice_profile}. "
        "Perform it like an intimate, smart podcast drama rather than a neutral studio read. "
        "Use the full scene context below to preserve the character's emotional state, pace, "
        "relationships, and the scene's dramatic progression. "
        "The scene context is silent reference material: never speak, quote, or repeat it. "
        "Speak the target line exactly once. Never repeat a phrase, sentence, or the full line for emphasis. "
        "Let emotion be audible between the words: a tiny breath, soft amused exhale, swallowed laugh, "
        "brief disbelief, warmth, urgency, or a thoughtful pause when the character direction and wording support it. "
        "Use at most one subtle nonverbal performance beat for this line. Do not add words, sound effects, "
        "introductions, or extra dialogue.\n\n"
        "PERFORMANCE EXAMPLE:\n"
        "Character direction: nervous but warm, becoming decisive.\n"
        "Target line: No. That sounded like a robot asking for directions.\n"
        "Performance: a small embarrassed breath before 'No', a short pause after it, then the target sentence "
        "once with a self-aware half-laugh. Keep it conversational and emotionally present; do not say the line "
        "twice and do not add any new words.\n\n"
        f"SILENT SCENE CONTEXT:\n{story_context}"
    )
    try:
        response = OpenAI().chat.completions.create(
            model=AUDIO_MODEL,
            modalities=["text", "audio"],
            audio={"voice": voice, "format": "wav"},
            messages=[
                {"role": "system", "content": instructions},
                {"role": "user", "content": f"TARGET LINE TO SPEAK ONCE:\n{text}"},
            ],
        )
        audio = response.choices[0].message.audio
        if audio is None or not audio.data:
            raise AudioGenerationError("OpenAI returned no audio data.")
        return base64.b64decode(audio.data)
    except AudioGenerationError:
        raise
    except Exception as error:
        raise AudioGenerationError("OpenAI audio generation request failed.") from error
