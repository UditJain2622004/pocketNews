"""Cast-mode parameter family."""
from story_generation.parameter_registry import ParameterDefinition


DEFINITION = ParameterDefinition(
    name="cast_mode",
    values=("auto", "story_duo", "recurring_duo"),
    default="auto",
    prompt_line=lambda value: f"Requested cast mode: {value}",
    error_label="cast mode",
)

CAST_MODES = DEFINITION.values
