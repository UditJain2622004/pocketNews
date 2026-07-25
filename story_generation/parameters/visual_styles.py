"""Visual-style parameter family."""
from story_generation.parameter_registry import ParameterDefinition


DEFINITION = ParameterDefinition(
    name="visual_style",
    values=("animated", "live_action"),
    default="animated",
    prompt_line=lambda value: f"Requested visual style: {value}",
    error_label="visual style",
)

VISUAL_STYLES = DEFINITION.values
