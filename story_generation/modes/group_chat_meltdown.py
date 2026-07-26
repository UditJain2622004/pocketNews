"""Fast three-character group-chat story format."""
from story_generation.mode_registry import StoryMode


MODE = StoryMode(
    id="group-chat-meltdown",
    display_name="Group chat meltdown",
    order=50,
    prompt_fragment="""
This is GROUP CHAT MELTDOWN mode. Use exactly three original fictional performers and exactly three cast entries.
Set creativeDirection.selectedFormat to group-chat-meltdown, performanceMode to group-chat-voices, and castMode to
group_chat. The requested cast mode does not apply; do not use Mira and Kabir.
The scene unfolds as an urgent, funny live group chat or call around one shared problem caused by the reported fact.
Each character has a different instinct: one overreacts, one grounds the facts, and one makes the situation worse or
finds the unexpected solution. Keep turns very short, overlapping in spirit without writing sound effects or stage
directions. The factual detail must flip their shared plan, and the final beat must land on a collective decision,
embarrassing reveal, or hard-won win. This is a scene, never a panel discussion.
""".strip(),
)
