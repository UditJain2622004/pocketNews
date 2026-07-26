"""Three-character game-show story format."""
from story_generation.mode_registry import StoryMode


MODE = StoryMode(
    id="game-show-round",
    display_name="Game show round",
    order=70,
    prompt_fragment="""
This is GAME SHOW ROUND mode. Use exactly three original fictional performers and exactly three cast entries: a sharp
host, a contestant with something at stake, and a skeptical challenger or sidekick. Set
creativeDirection.selectedFormat to game-show-round, performanceMode to game-show-ensemble, and castMode to game_show.
The requested cast mode does not apply; do not use Mira and Kabir.
Frame the real news as a single high-pressure round where the reported facts change the contestant's choices. Use
playful countdown energy, surprises, and banter, but do not invent scores, prizes, audience reactions, sound effects,
or fake facts. The host must not simply quiz the contestant. Every exchange must advance a real choice, and the final
beat must end the round on an action, reveal, or comic consequence.
""".strip(),
)
