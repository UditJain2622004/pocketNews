"""OpenAI audio generation for individual PocketNews story lines."""
from __future__ import annotations

import base64
import os
from pathlib import Path

from dotenv import load_dotenv
from openai import OpenAI


BASE_DIR = Path(__file__).resolve().parent
load_dotenv(BASE_DIR / ".env")
AUDIO_MODEL = "gpt-audio-1.5"
AUDIO_VOICES = ("alloy", "coral", "sage", "verse", "marin", "cedar")


class AudioGenerationError(RuntimeError):
    pass


def generate_story_line(text: str, voice: str, voice_profile: str, language: str) -> bytes:
    if not os.getenv("OPENAI_API_KEY"):
        raise AudioGenerationError("OPENAI_API_KEY is not configured.")

    instructions = (
        f"Speak only this exact {language} news-story line. "
        f"Delivery direction: {voice_profile}. "
        "Sound expressive, cinematic, and lightly funny where the wording supports it. "
        "Do not add any words, sound effects, or introductions."
    )
    try:
        response = OpenAI().chat.completions.create(
            model=AUDIO_MODEL,
            modalities=["text", "audio"],
            audio={"voice": voice, "format": "wav"},
            messages=[
                {"role": "system", "content": instructions},
                {"role": "user", "content": text},
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
