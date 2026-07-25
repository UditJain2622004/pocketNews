"""AI-selected story format for varied episode pacing."""
from story_generation.mode_registry import StoryMode


MODE = StoryMode(
    id="mix",
    display_name="AI mix",
    order=40,
    prompt_fragment="""
This is AI MIX mode. Decide which one format best fits this specific article before writing: solo-hot-take,
two-person-banter, or dramatized-pov. Make the choice from the news itself, not by rotating formats. Use solo hot
take for a sharp personal reaction, comic scramble, or intimate realization; use two-person banter when the fact
naturally creates a clash, negotiation, or funny opposing response; use dramatized POV when the impact is strongest
from inside one person's unfolding experience. Spread choices across an episode when articles support it, but never
force variety over the strongest scene.

After choosing, obey exactly one of these contracts:
- solo-hot-take: exactly one original cast member; selectedFormat=solo-hot-take; performanceMode=solo-character-hot-take;
  castMode=solo_host. The character acts through an immediate problem alone, with a clear emotional arc and no reply.
- two-person-banter: exactly two cast members; selectedFormat=two-person-banter; performanceMode=character-dialogue;
  castMode=recurring_duo only when requested, otherwise story_duo. The two characters need conflicting wants and
  consequential back-and-forth rather than alternating facts.
- dramatized-pov: one lead and at most one supporting cast member; selectedFormat=dramatized-pov;
  performanceMode=first-person-pov; castMode=pov_lead. The lead speaks at least 70 percent of lines and the support,
  if any, creates pressure rather than banter.

For any selected format, make its cast, voice profiles, visual bible, and every line consistent with that choice.
""".strip(),
)
