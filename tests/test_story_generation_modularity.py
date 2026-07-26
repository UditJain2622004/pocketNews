import pytest

from episode_service import story_format_for_index, supported_story_formats
from news_adapter import NewsArticle
from story_generation.mode_registry import StoryMode, discovered_modes
from story_generation.parameter_registry import discovered_parameters
from story_generation.parameters.cast_modes import CAST_MODES
from story_generation.parameters.visual_styles import VISUAL_STYLES
from story_generation.prompt_builder import system_prompt
from story_generation.service import _cache_key, _validate_creative_options


def test_current_modes_are_discovered_in_original_order():
    assert tuple(mode.id for mode in discovered_modes()) == (
        "solo-hot-take",
        "two-person-banter",
        "dramatized-pov",
        "mix",
    )
    assert supported_story_formats() == tuple(mode.id for mode in discovered_modes())
    assert [story_format_for_index(index) for index in range(4)] == [
        "solo-hot-take",
        "two-person-banter",
        "dramatized-pov",
        "mix",
    ]


def test_parameter_families_preserve_existing_values_and_defaults():
    definitions = {definition.name: definition for definition in discovered_parameters()}
    assert CAST_MODES == ("auto", "story_duo", "recurring_duo")
    assert VISUAL_STYLES == ("animated", "live_action")
    assert definitions["cast_mode"].default == "auto"
    assert definitions["visual_style"].default == "animated"


def test_parameter_validation_preserves_error_contract():
    with pytest.raises(Exception, match="Unsupported cast mode"):
        _validate_creative_options("unknown", "animated")
    with pytest.raises(Exception, match="Unsupported visual style"):
        _validate_creative_options("auto", "sketch")


@pytest.mark.parametrize("story_format", supported_story_formats())
@pytest.mark.parametrize("cast_mode", CAST_MODES)
@pytest.mark.parametrize("visual_style", VISUAL_STYLES)
@pytest.mark.parametrize("language", ["en-IN", "hi-IN"])
def test_prompt_contains_existing_contract(story_format, cast_mode, visual_style, language):
    prompt = system_prompt(story_format, language, cast_mode, visual_style)
    assert f"Target narration language: {language}" in prompt
    assert f"Required format: {story_format}" in prompt
    assert f"Requested cast mode: {cast_mode}" in prompt
    assert f"Requested visual style: {visual_style}" in prompt
    assert "Use only facts in the supplied article." in prompt
    assert "Return exactly five beats in this order" in prompt
    assert "Do not imitate any real person's voice" in prompt


def test_mode_prompt_fragment_is_isolated_from_shared_builder(monkeypatch):
    import story_generation.prompt_builder as prompt_builder

    monkeypatch.setattr(
        prompt_builder,
        "get_mode",
        lambda _: StoryMode("temporary-mode", "Temporary", 999, "Only for this temporary mode."),
    )
    prompt = prompt_builder.system_prompt("temporary-mode", "en-IN", "auto", "animated")
    assert "Mode-specific instructions:" in prompt
    assert "Only for this temporary mode." in prompt


def test_cache_key_changes_for_each_generation_parameter():
    article = NewsArticle(
        id="article-1",
        title="A headline",
        summary="A summary",
        full_text="Full source text",
        url="https://example.com/article-1",
        language="english",
        categories=["business"],
        published_at="2026-07-26T00:00:00Z",
        source_name="example.com",
    )
    base = _cache_key(article, "solo-hot-take", "en-IN", "auto", "animated")
    variants = [
        _cache_key(article, "two-person-banter", "en-IN", "auto", "animated"),
        _cache_key(article, "solo-hot-take", "hi-IN", "auto", "animated"),
        _cache_key(article, "solo-hot-take", "en-IN", "story_duo", "animated"),
        _cache_key(article, "solo-hot-take", "en-IN", "auto", "live_action"),
    ]
    assert len({base, *variants}) == 5
