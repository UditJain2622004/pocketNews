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


def generate_story_line(
    text: str,
    voice: str,
    voice_profile: str,
    language: str,
    story_context: str,
) -> bytes:
    if not os.getenv("OPENAI_API_KEY"):
        raise AudioGenerationError("OPENAI_API_KEY is not configured.")

    instructions = (
        f"You are performing one line in a continuous {language} fictional news-story scene. "
        f"Character delivery direction: {voice_profile}. "
        "Use the full scene context below to preserve the character's emotional state, pace, "
        "relationships, and the scene's dramatic progression. "
        "The scene context is silent reference material: never speak, quote, or repeat it. "
        "Speak the target line exactly once. Never repeat a phrase, sentence, or the full line for emphasis. "
        "You may use a brief natural nonverbal performance beat such as a tiny breath, soft amused exhale, "
        "or thoughtful pause only when the character direction and wording clearly support it. Do not add words, "
        "sound effects, or introductions.\n\n"
        "PERFORMANCE EXAMPLE:\n"
        "Character direction: nervous but warm, becoming decisive.\n"
        "Target line: No. That sounded like a robot asking for directions.\n"
        "Performance: a small embarrassed breath before 'No', a short pause after it, then the target sentence "
        "once with a self-aware half-laugh. Do not say the line twice and do not add any new words.\n\n"
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
