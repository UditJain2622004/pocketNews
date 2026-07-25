"""Deterministic composition of shared rules and isolated mode inputs."""
from __future__ import annotations

from story_generation.mode_registry import get_mode
from story_generation.parameters.cast_modes import DEFINITION as CAST_MODE_PARAMETER
from story_generation.parameters.visual_styles import DEFINITION as VISUAL_STYLE_PARAMETER
from story_generation.shared_prompt import build_system_prompt


def system_prompt(story_format: str, language: str, cast_mode: str, visual_style: str) -> str:
    mode = get_mode(story_format)
    cast_prompt_line, visual_prompt_line = parameter_prompt_lines(cast_mode, visual_style)
    return build_system_prompt(
        story_format=story_format,
        language=language,
        cast_prompt_line=cast_prompt_line,
        visual_prompt_line=visual_prompt_line,
        mode_prompt_fragment=mode.prompt_fragment,
    )


def parameter_prompt_lines(cast_mode: str, visual_style: str) -> tuple[str, str]:
    return (
        CAST_MODE_PARAMETER.prompt_line(cast_mode),
        VISUAL_STYLE_PARAMETER.prompt_line(visual_style),
    )
