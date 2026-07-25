"""Auto-discovered generation parameter definitions."""
from __future__ import annotations

import importlib
import pkgutil
from dataclasses import dataclass
from types import ModuleType
from typing import Callable


@dataclass(frozen=True)
class ParameterDefinition:
    name: str
    values: tuple[str, ...]
    default: str
    prompt_line: Callable[[str], str]
    error_label: str

    def validate(self, value: str) -> None:
        if value not in self.values:
            raise ValueError(f"Unsupported {self.error_label}. Use one of: {', '.join(self.values)}.")


def _parameter_modules() -> list[ModuleType]:
    import story_generation.parameters as package

    return [
        importlib.import_module(module_info.name)
        for module_info in pkgutil.iter_modules(package.__path__, f"{package.__name__}.")
    ]


def discovered_parameters() -> tuple[ParameterDefinition, ...]:
    return tuple(module.DEFINITION for module in _parameter_modules() if hasattr(module, "DEFINITION"))


def get_parameter(name: str) -> ParameterDefinition:
    for definition in discovered_parameters():
        if definition.name == name:
            return definition
    raise KeyError(f"Unknown story-generation parameter: {name}")


def validate_parameters(values: dict[str, str]) -> None:
    for name, value in values.items():
        get_parameter(name).validate(value)
