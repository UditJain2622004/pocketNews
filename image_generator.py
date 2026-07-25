"""OpenAI image generation for persisted story visuals."""
from __future__ import annotations

import base64
import os
from pathlib import Path

from dotenv import load_dotenv
from openai import OpenAI


BASE_DIR = Path(__file__).resolve().parent
load_dotenv(BASE_DIR / ".env")
IMAGE_MODEL = "gpt-image-2"


class ImageGenerationError(RuntimeError):
    pass


def generate_story_image(image_prompt: str) -> bytes:
    if not os.getenv("OPENAI_API_KEY"):
        raise ImageGenerationError("OPENAI_API_KEY is not configured.")

    prompt = (
        "Create a portrait 2:3 cinematic still for a funny, engaging news story. "
        "Keep it visually clear, dramatic, and suitable as a video companion. "
        "Do not add captions, headlines, logos, or readable text.\n\n"
        f"Scene direction: {image_prompt}"
    )
    try:
        result = OpenAI().images.generate(
            model=IMAGE_MODEL,
            prompt=prompt,
            size="1024x1536",
            quality="medium",
        )
        image_base64 = result.data[0].b64_json
        if not image_base64:
            raise ImageGenerationError("OpenAI returned no image data.")
        return base64.b64decode(image_base64)
    except ImageGenerationError:
        raise
    except Exception as error:
        raise ImageGenerationError("OpenAI image generation request failed.") from error
