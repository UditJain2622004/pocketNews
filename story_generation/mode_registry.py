"""Auto-discovered story-script mode definitions.

Contributor guide:
1. Add one new .py file under story_generation/modes/.
2. Export a MODE value using StoryMode with a unique id.
3. Keep mode-specific instructions in that file's prompt_fragment.
4. Do not edit the shared system prompt for a mode-only change.
5. Give the mode an explicit order if it participates in episode rotation,
   then add a registry test.
6. Keep the existing GeneratedStory schema unless a migration is approved.

Parameter families follow the same rule under story_generation/parameters/:
use a new module, do not reuse an existing value ID, and never silently change
an existing default or validation contract.
"""
from __future__ import annotations

import importlib
import pkgutil
from dataclasses import dataclass
from types import ModuleType


@dataclass(frozen=True)
class StoryMode:
    id: str
    display_name: str
    order: int
    prompt_fragment: str = ""


def _mode_modules() -> list[ModuleType]:
    import story_generation.modes as package

    return [
        importlib.import_module(module_info.name)
        for module_info in pkgutil.iter_modules(package.__path__, f"{package.__name__}.")
    ]


def discovered_modes() -> tuple[StoryMode, ...]:
    modes = [module.MODE for module in _mode_modules() if hasattr(module, "MODE")]
    return tuple(sorted(modes, key=lambda mode: (mode.order, mode.id)))


def supported_story_formats() -> tuple[str, ...]:
    return tuple(mode.id for mode in discovered_modes())


def mode_for_index(index: int) -> str:
    formats = supported_story_formats()
    if not formats:
        raise RuntimeError("No story-generation modes are registered.")
    return formats[index % len(formats)]


def get_mode(mode_id: str) -> StoryMode:
    for mode in discovered_modes():
        if mode.id == mode_id:
            return mode
    supported = ", ".join(supported_story_formats())
    raise ValueError(f"Unsupported story format. Use one of: {supported}.")
