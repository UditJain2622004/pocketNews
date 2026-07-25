"""Editorial taxonomy used for every generated PocketNews story."""

from shared_taxonomy import PROFILE_TAXONOMY

SUGGESTED_INTERESTS = PROFILE_TAXONOMY


def taxonomy_prompt() -> str:
    return "\n".join(
        f"- {category}: {', '.join(subcategories)}"
        for category, subcategories in SUGGESTED_INTERESTS.items()
    )
