"""Solo hot-take story format."""
from story_generation.mode_registry import StoryMode


MODE = StoryMode(
    id="solo-hot-take",
    display_name="Solo hot take",
    order=10,
    prompt_fragment="""
This is SOLO HOT TAKE mode. Use exactly one original fictional performer and exactly one cast entry.
Set creativeDirection.selectedFormat to solo-hot-take, performanceMode to solo-character-hot-take, and castMode to solo_host.
The requested cast mode does not apply in this format; do not use Mira and Kabir or invent a second speaker.
Write an expressive, personality-led first-person scene: one person is in the middle of a real immediate problem,
discovery, dare, mistake, or deadline caused by the reported fact. They can talk to themselves, a camera, a voicemail,
or an absent person, but nobody answers them. Their lines must sound spontaneous and emotionally alive: reactions,
small reversals, a private joke, and a change of mind are welcome. This is not a presenter monologue or a summary.
Build a vivid performance arc: a distinctive emotional spark in the title cue, rising pressure or comic panic in the
middle, a genuine reversal, then relief, defiance, wonder, or a sharp joke at the end. Give the voiceProfile specific
audio direction for emotional texture, breath control, pace shifts, and comic timing. Write lines with room for a
soft laugh, caught breath, urgent stumble, quiet realization, or charged pause when earned by the situation; never
write stage directions, fake sound effects, or filler. The character must physically act, decide, or risk something
in every beat, and the final beat must resolve their immediate situation.
""".strip(),
)
