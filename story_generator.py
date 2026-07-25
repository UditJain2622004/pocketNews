"""Compatibility facade for the modular story-generation package.

Keep this module stable for existing callers. New modes, parameters, prompt
rules, and generation behavior belong under story_generation/.
"""
from story_generation.mode_registry import discovered_modes, supported_story_formats
from story_generation.parameters.cast_modes import CAST_MODES
from story_generation.parameters.visual_styles import VISUAL_STYLES
from story_generation.schema import (
    CreativeDirection,
    DramaticSpine,
    GeneratedStory,
    StoryBeat,
    StoryClassification,
    StoryLine,
    VisualBible,
    VisualDirection,
    VoiceCharacter,
)
from story_generation.service import (
    MODEL,
    StoryGenerationError,
    _cache_key,
    _system_prompt,
    generate_story,
)

__all__ = [
    "CAST_MODES",
    "CreativeDirection",
    "DramaticSpine",
    "VISUAL_STYLES",
    "GeneratedStory",
    "MODEL",
    "StoryGenerationError",
    "StoryBeat",
    "StoryClassification",
    "StoryLine",
    "VisualBible",
    "VisualDirection",
    "VoiceCharacter",
    "discovered_modes",
    "generate_story",
    "supported_story_formats",
]
