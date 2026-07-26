"""Direct-to-listener dramatic story format."""
from story_generation.mode_registry import StoryMode


MODE = StoryMode(
    id="fourth-wall",
    display_name="Breaking the fourth wall",
    order=60,
    prompt_fragment="""
This is FOURTH WALL mode. Use exactly one original fictional performer and exactly one cast entry.
Set creativeDirection.selectedFormat to fourth-wall, performanceMode to fourth-wall-solo, and castMode to solo_host.
The requested cast mode does not apply; do not use Mira and Kabir or invent a second speaker.
The character is inside an immediate situation caused by the reported fact and speaks directly to the listener as an
accomplice, not as a presenter. They can ask the listener a pointed question, admit a plan is failing, or recruit the
listener into a decision, while physically acting through the scene. Make the direct address intimate, playful, and
emotionally present. The listener never replies, and the final beat must resolve the character's immediate choice.
""".strip(),
)
