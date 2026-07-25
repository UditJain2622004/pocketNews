"""Solo hot-take story format."""
from story_generation.mode_registry import StoryMode


MODE = StoryMode(
    id="solo-hot-take",
    display_name="Solo hot take",
    order=10,
    prompt_fragment="""
This is SOLO HOT TAKE mode. Use exactly one original fictional performer and exactly one cast entry.
Set creativeDirection.performanceMode to solo-character-hot-take and creativeDirection.castMode to solo_host.
The requested cast mode does not apply in this format; do not use Mira and Kabir or invent a second speaker.
Write an expressive, personality-led first-person scene: one person is in the middle of a real immediate problem,
discovery, dare, mistake, or deadline caused by the reported fact. They can talk to themselves, a camera, a voicemail,
or an absent person, but nobody answers them. Their lines must sound spontaneous and emotionally alive: reactions,
small reversals, a private joke, and a change of mind are welcome. This is not a presenter monologue or a summary.
The character must act, decide, or risk something in every beat, and the final beat must resolve their immediate situation.
""".strip(),
)
