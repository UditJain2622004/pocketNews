"""AI-selected story format for varied episode pacing."""
from story_generation.mode_registry import StoryMode


MODE = StoryMode(
    id="mix",
    display_name="AI mix",
    order=40,
    prompt_fragment="""
This is AI MIX mode. Decide which one format best fits this specific article before writing: solo-hot-take,
two-person-banter, dramatized-pov, group-chat-meltdown, fourth-wall, or game-show-round. Make the choice from the
news itself, not by rotating formats. Use solo hot take for a sharp personal reaction or comic scramble; banter for a
natural clash or negotiation; POV for an intimate unfolding impact; group chat for a shared panic or social ripple;
fourth wall when recruiting the listener makes the moment funnier or more personal; and game show only when a genuine
high-pressure choice can carry the fact. Spread choices across an episode when articles support it, but never force
variety over the strongest scene.

After choosing, obey exactly one of these contracts:
- solo-hot-take: exactly one original cast member; selectedFormat=solo-hot-take; performanceMode=solo-character-hot-take;
  castMode=solo_host. The character acts through an immediate problem alone, with a clear emotional arc and no reply.
- two-person-banter: exactly two cast members; selectedFormat=two-person-banter; performanceMode=character-dialogue;
  castMode=recurring_duo only when requested, otherwise story_duo. The two characters need conflicting wants and
  consequential back-and-forth rather than alternating facts.
- dramatized-pov: one lead and at most one supporting cast member; selectedFormat=dramatized-pov;
  performanceMode=first-person-pov; castMode=pov_lead. The lead speaks at least 70 percent of lines and the support,
  if any, creates pressure rather than banter.
- group-chat-meltdown: exactly three original cast members; selectedFormat=group-chat-meltdown;
  performanceMode=group-chat-voices; castMode=group_chat. Give them contrasting reactions to one shared problem.
- fourth-wall: exactly one original cast member; selectedFormat=fourth-wall; performanceMode=fourth-wall-solo;
  castMode=solo_host. The character speaks directly to the listener from inside a real immediate scene.
- game-show-round: exactly three original cast members; selectedFormat=game-show-round;
  performanceMode=game-show-ensemble; castMode=game_show. It is a high-pressure story scene, not a trivia quiz.

For any selected format, make its cast, voice profiles, visual bible, and every line consistent with that choice.
""".strip(),
)
