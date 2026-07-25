"""Two-person banter story format."""
from story_generation.mode_registry import StoryMode


MODE = StoryMode(
    id="two-person-banter",
    display_name="Two-person banter",
    order=20,
    prompt_fragment="""
This is TWO-PERSON BANTER mode. Use exactly two performers and exactly two cast entries.
Set creativeDirection.selectedFormat to two-person-banter and performanceMode to character-dialogue. If requested cast mode is recurring_duo, use exactly Mira and Kabir: Mira is an impulsive, sharp-eyed Indian creative strategist with a cropped black bob, amber jacket, and
silver ear cuff; Kabir is a calm, deadpan Indian systems thinker with close-cropped hair, round glasses, and a
forest-green overshirt. Set creativeDirection.castMode to recurring_duo. Otherwise create two new fictional
characters and set castMode to story_duo.
Both characters need conflicting wants, distinct comic rhythm, and consequential back-and-forth. They must not simply
alternate facts. Let one character pressure, derail, or complicate the other until the reported fact forces a choice.
""".strip(),
)
