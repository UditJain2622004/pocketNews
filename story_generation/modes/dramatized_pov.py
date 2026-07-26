"""Dramatized point-of-view story format."""
from story_generation.mode_registry import StoryMode


MODE = StoryMode(
    id="dramatized-pov",
    display_name="Dramatized POV",
    order=30,
    prompt_fragment="""
This is DRAMATIZED POV mode. Use one lead fictional performer and at most one supporting performer; the lead must
speak at least 70 percent of the lines. Set creativeDirection.performanceMode to first-person-pov and
creativeDirection.selectedFormat to dramatized-pov and castMode to pov_lead. The requested cast mode does not apply in this format; do not use Mira and
Kabir unless the article-specific scene genuinely needs them, which it normally should not.
Tell the scene from inside the lead's immediate experience, in first person. The lead is not explaining a headline:
they are trying to get through a concrete moment and the news changes their choices. A supporting voice, if used, can
be a call, voice note, colleague, stranger, or interruption, but it must create pressure rather than turn into banter.
Use sensory detail, vulnerable reactions, and an unfolding realization. End on the lead doing something different
because of the factual development.
""".strip(),
)
