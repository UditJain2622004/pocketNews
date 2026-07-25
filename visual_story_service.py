"""Ordered, continuity-aware visual generation for one saved story."""
from __future__ import annotations

from pathlib import Path
import re
from typing import Any

from image_generator import generate_story_image, generate_story_reference


BASE_DIR = Path(__file__).resolve().parent


def generate_story_visuals(
    output_dir: Path,
    source_file: str | Path,
    article_id: str,
    story: dict[str, Any],
) -> dict[str, object]:
    image_dir = output_dir / "images" / _safe_filename(Path(source_file).stem) / _safe_filename(article_id)
    beats = story.get("beats")
    if not isinstance(beats, list):
        raise ValueError("Story does not contain visual beats.")

    visual_bible = story.get("visualBible")
    if not isinstance(visual_bible, dict):
        return _generate_legacy_visuals(image_dir, beats)

    context = _story_context(story, visual_bible)
    reference_path = image_dir / "reference.png"
    generated = 0
    reused = 0
    failures: list[dict[str, str]] = []
    if not reference_path.is_file():
        try:
            reference_path.parent.mkdir(parents=True, exist_ok=True)
            reference_path.write_bytes(
                generate_story_reference(str(visual_bible.get("referenceImagePrompt") or ""), context)
            )
            generated += 1
        except Exception as error:
            visual_bible["referenceImageError"] = str(error)
            failures.append({"beatId": "reference", "error": str(error)})
    else:
        reused += 1

    has_reference = reference_path.is_file()
    if has_reference:
        visual_bible["referenceImagePath"] = _relative(reference_path)
    paths = [_relative(reference_path)] if has_reference else []
    previous_path: Path | None = reference_path if has_reference else None
    for beat in beats:
        if not isinstance(beat, dict) or not isinstance(beat.get("visual"), dict):
            continue
        visual = beat["visual"]
        beat_id = str(beat.get("id") or "visual")
        image_path = image_dir / f"{_safe_filename(beat_id)}.png"
        if not image_path.is_file():
            try:
                references = list(dict.fromkeys(
                    path for path in (reference_path, previous_path) if path is not None and path.is_file()
                ))
                image_path.write_bytes(
                    generate_story_image(
                        str(visual.get("scenePrompt") or visual.get("imagePrompt") or ""),
                        story_context=context,
                        reference_images=references,
                    )
                )
                generated += 1
            except Exception as error:
                visual["imageError"] = str(error)
                failures.append({"beatId": beat_id, "error": str(error)})
                continue
        else:
            reused += 1
        relative_path = _relative(image_path)
        visual["imagePath"] = relative_path
        paths.append(relative_path)
        previous_path = image_path

    return {"paths": paths, "generated": generated, "reused": reused, "failures": failures}


def _generate_legacy_visuals(image_dir: Path, beats: list[object]) -> dict[str, object]:
    paths: list[str] = []
    generated = 0
    reused = 0
    failures: list[dict[str, str]] = []
    for beat in beats:
        if not isinstance(beat, dict) or not isinstance(beat.get("visual"), dict):
            continue
        visual = beat["visual"]
        beat_id = str(beat.get("id") or "visual")
        image_path = image_dir / f"{_safe_filename(beat_id)}.png"
        if not image_path.is_file():
            try:
                image_path.parent.mkdir(parents=True, exist_ok=True)
                image_path.write_bytes(generate_story_image(str(visual.get("imagePrompt") or "")))
                generated += 1
            except Exception as error:
                visual["imageError"] = str(error)
                failures.append({"beatId": beat_id, "error": str(error)})
                continue
        else:
            reused += 1
        relative_path = _relative(image_path)
        visual["imagePath"] = relative_path
        paths.append(relative_path)
    return {"paths": paths, "generated": generated, "reused": reused, "failures": failures}


def _story_context(story: dict[str, Any], visual_bible: dict[str, Any]) -> str:
    direction = story.get("creativeDirection") if isinstance(story.get("creativeDirection"), dict) else {}
    cast = story.get("cast") if isinstance(story.get("cast"), list) else []
    cast_details = "; ".join(
        f"{member.get('id')}: {member.get('visualIdentity')}"
        for member in cast
        if isinstance(member, dict)
    )
    return (
        f"Title: {story.get('title')}. Genre: {direction.get('genre')}. "
        f"Premise: {direction.get('dramaticPremise')}. Visual style: {direction.get('visualStyle')}. "
        f"Setting: {visual_bible.get('setting')}. Color and lighting: {visual_bible.get('colorAndLighting')}. "
        f"Recurring props: {', '.join(visual_bible.get('recurringProps') or [])}. "
        f"Story arc: {visual_bible.get('storyArc')}. Characters: {cast_details}. "
        "Use this only for character and setting continuity; the supplied scene direction defines the one shot to create."
    )


def _safe_filename(value: str) -> str:
    return re.sub(r"[^A-Za-z0-9._-]+", "_", value).strip("._") or "story"


def _relative(path: Path) -> str:
    return path.relative_to(BASE_DIR).as_posix()
