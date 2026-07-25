"""OpenAI image generation for persisted story visuals."""
from __future__ import annotations

import base64
from contextlib import ExitStack
import os
from pathlib import Path
from typing import Iterable

from dotenv import load_dotenv
from openai import OpenAI


BASE_DIR = Path(__file__).resolve().parent
load_dotenv(BASE_DIR / ".env")
IMAGE_MODEL = "gpt-image-2"


class ImageGenerationError(RuntimeError):
    pass


def generate_story_reference(reference_prompt: str, story_context: str) -> bytes:
    return _generate_image(
        "Create one story reference frame. Establish the full cast together in one shared recurring location exactly as described. "
        "This must be one continuous camera shot, never a collage, split screen, diptych, triptych, storyboard, "
        "contact sheet, montage, or sequence of panels.\n\n"
        f"Story context: {story_context}\n\nReference direction: {reference_prompt}"
    )


def generate_story_image(
    image_prompt: str,
    story_context: str | None = None,
    reference_images: Iterable[Path] | None = None,
) -> bytes:
    if not os.getenv("OPENAI_API_KEY"):
        raise ImageGenerationError("OPENAI_API_KEY is not configured.")
    prompt = (
        "Create exactly one next consecutive shot from this fictional news movie. Preserve character identity, wardrobe, "
        "location, recurring props, and visual style from the supplied reference image(s). "
        "Show one moment, one camera view, and one continuous composition only. Never create a collage, split screen, "
        "diptych, triptych, storyboard, contact sheet, montage, or multiple frames in one image. "
        "Do not add captions, headlines, logos, or readable text.\n\n"
        f"Story context: {story_context or 'Use the supplied scene direction.'}\n\nScene direction: {image_prompt}"
    )
    references = [path for path in reference_images or [] if path.is_file()]
    if not references:
        return _generate_image(prompt)

    try:
        with ExitStack() as stack:
            image_files = [stack.enter_context(path.open("rb")) for path in references]
            result = OpenAI().images.edit(
                model=IMAGE_MODEL,
                image=image_files,
                prompt=prompt,
                size="1024x1536",
                quality="medium",
            )
        return _decode_image(result)
    except Exception as error:
        raise ImageGenerationError(f"OpenAI image edit request failed: {error}") from error


def _generate_image(prompt: str) -> bytes:
    if not os.getenv("OPENAI_API_KEY"):
        raise ImageGenerationError("OPENAI_API_KEY is not configured.")

    prompt = (
        "Create one portrait 2:3 cinematic still for a fictional news movie. "
        "Keep it visually clear, genre-faithful, dramatic, and suitable as a video companion. "
        "Use one moment, one camera view, and one continuous composition only. Never create a collage, split screen, "
        "diptych, triptych, storyboard, contact sheet, montage, or multiple frames in one image. "
        "Do not add captions, headlines, logos, or readable text.\n\n"
        f"Scene direction: {prompt}"
    )
    try:
        result = OpenAI().images.generate(
            model=IMAGE_MODEL,
            prompt=prompt,
            size="1024x1536",
            quality="medium",
        )
        return _decode_image(result)
    except ImageGenerationError:
        raise
    except Exception as error:
        raise ImageGenerationError(f"OpenAI image generation request failed: {error}") from error


def _decode_image(result) -> bytes:
    image_base64 = result.data[0].b64_json
    if not image_base64:
        raise ImageGenerationError("OpenAI returned no image data.")
    return base64.b64decode(image_base64)
