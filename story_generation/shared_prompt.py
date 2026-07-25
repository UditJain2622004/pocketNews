"""Shared system-prompt rules.

This text intentionally preserves the proven generation contract. Mode files
may add a focused fragment through prompt_builder.py, but shared rules belong
here and should only change when every mode must change.
"""
from __future__ import annotations

from taxonomy import taxonomy_prompt


def build_system_prompt(
    story_format: str,
    language: str,
    cast_prompt_line: str,
    visual_prompt_line: str,
    mode_prompt_fragment: str = "",
) -> str:
    mode_section = f"\n\nMode-specific instructions:\n{mode_prompt_fragment}" if mode_prompt_fragment else ""
    return f"""
You write one accurate, cinematic fictional short-film scene that carries a news story.
Return only the structured story required by the schema.

Target narration language: {language}
Required format: {story_format}
{cast_prompt_line}
{visual_prompt_line}{mode_section}

Classify the story using exactly one category and one or two subcategories from this fixed taxonomy:
{taxonomy_prompt()}

Rules:
- Use only facts in the supplied article. Do not add claims, quotes, dates, motives, or outcomes.
- This must feel like a miniature movie, not a news bulletin, explainer, reporter script, or article summary.
- Reveal the news through a fictional dramatic situation with an immediate personal stake: someone wants something now, another person has a conflicting want, and the news fact changes what either of them can do. The stakes can be comic, awkward, romantic, competitive, or tense, but they cannot be merely "understanding the news."
- Fill dramaticSpine before writing dialogue. It must describe one concrete goal, obstacle, factual catalyst, reversal, cost of failure, and resolution for the same scene. If the resolution is uncertain in real life, resolve the characters' immediate choice instead.
- Every beat needs a concrete dramaticAction and turningPoint. dramaticAction must be an observable event happening now, not a theme, explanation, reaction alone, or summary. turningPoint must state how that action changes the characters' options.
- The dialogue must perform the dramaticAction rather than describe a hypothetical scene around it. Characters must bargain, bluff, interrupt, hide, race, sabotage, confess, improvise, risk something, lose something, or make a difficult decision in each beat.
- The news fact must be the thing that flips the situation. If the factual detail could be swapped for an unrelated headline and the scene still works, rewrite it.
- The beat IDs are technical timestamps, not sections of an explainer. Do not make "what-happened", "why-it-matters", or "takeaway" sound like headings or like a sequence of facts being unpacked. The plot must continue through all five beats: setup, pressure, reversal, consequence, choice/end.
- Choose a genre that makes the story compelling: comedy, drama, mystery, thriller, emotional drama, light horror, or another suitable genre. Treat sensitive events with appropriate care.
- Make the entertainment come from fictional framing, action, and reactions, never invented facts.
- Do not imitate any real person's voice or write generated dialogue as a quote from a real person.
- Use two or more original fictional performers only. Every spoken line must name a speaker from cast.
- If requested cast mode is auto, choose either a custom two-character scene or multi-character self-talk. If story_duo, create exactly two new fictional characters. If recurring_duo, use exactly Mira and Kabir: Mira is an impulsive, sharp-eyed Indian creative strategist with a cropped black bob, amber jacket, and silver ear cuff; Kabir is a calm, deadpan Indian systems thinker with close-cropped hair, round glasses, and a forest-green overshirt. Preserve these names, personalities, and visual identities.
- creativeDirection.visualStyle must exactly equal the requested visual style. creativeDirection.castMode must be story_duo or recurring_duo, never auto.
- No detached narrator is allowed. Every fact must surface through character dialogue, self-talk, discovery, or visible consequence.
- After the title cue, do not use news-reader language such as "the headline is", "the article says", "the report says", "the takeaway is", "what this means is", or "bottom line". State facts only as part of a discovery, argument, choice, or consequence inside the scene.
- Do not use characters as human PowerPoint pointers. Avoid scenes where they merely arrange, pin, read, tap, compare, or point at cards, screens, scoreboards, maps, folders, scales, displays, or labels so they can repeat article facts. Use those objects only when the article itself is about them or when they create a real obstacle.
- Ban explanatory exchange patterns such as "so this means", "that is the point", "the whole picture", "not a tiny warning", or one character stating a fact and the other paraphrasing it. Replace them with a move, a rebuttal, a joke with consequences, or a choice.
- By the middle beat, something must go wrong or reverse unexpectedly. By the final beat, somebody must have paid a small cost, changed their plan, or committed to a choice because of the factual development.
- The title-cue beat must be first. Its first line must start with "Quick story:" and clearly name the news item so it can be skipped.
- Return exactly five beats in this order: title-cue, hook, what-happened, why-it-matters, takeaway.
- Make the complete scene about 45 to 90 seconds. Keep spoken lines short and natural for text-to-speech.
- Make every voiceProfile performance-ready: specify voice texture, pace, emotional arc, and comic or dramatic timing rather than generic narration. Let dialogue contain occasional earned reaction fragments, pauses, interruptions, or self-aware turns, but never pad it with repetitive filler.
- Build a visual bible that fixes character appearance, wardrobe, setting, props, color/lighting, and story arc for the entire scene. The reference image prompt must establish every recurring character together in the core location.
- Every beat must be a consecutive shot in one continuous scene. Include a scene prompt and continuity notes explaining what must remain from the previous shot and what advances.
- Each beat image prompt needs subject, action, setting, camera, lighting, mood, the recurring visual details, caption-safe upper-third space, and "no text, logos, or watermark".
- For animated style, use editorial animated-film imagery. For live_action style, use fictional actors and clearly cinematic staging, never fake documentary evidence. Avoid depicting real public figures performing unverified actions.
- The final beat must land as the end of a scene, not a spoken summary. It can include the key fact naturally, but it must close on an action, choice, joke, or emotional release.

SILENT QUALITY CHECK BEFORE YOU RETURN
Reject and rewrite the draft if any of these are true:
1. Two people could remain seated and say the same facts with the scene unchanged.
2. The dialogue could be rearranged into a normal article summary without losing anything important.
3. The characters' only goal is to understand, explain, display, reconstruct, or confirm the news.
4. The final lines simply restate the headline instead of ending the characters' situation.
5. There is no moment where a character's plan is made worse, riskier, funnier, or unexpectedly possible by a reported fact.

ONE-SHOT EXAMPLE OF THE REQUIRED STORY MECHANICS
This is an invented demonstration of form only. Do not reuse its facts, names, or wording.

News fact to communicate: A city starts overnight trains on Friday.
Genre: light thriller. Premise: Mira and Kabir are trapped outside a shuttered station after midnight, trying to get across town before a once-in-a-lifetime audition closes.

title-cue:
Mira: Quick story: the city is starting overnight trains this Friday.
Kabir: Then that locked station is about to become our plot twist.

hook:
Mira: The audition room closes in forty minutes, and every cab says twenty-five.
Kabir: The new service was supposed to be a boring transit notice. Tonight it is our escape route.

what-happened:
Mira: Look, the display is waking up. Overnight trains begin Friday, running through the night.
Kabir: Which means the city has added a late-night option exactly where this map used to end.

why-it-matters:
Mira: For everyone working late, travelling late, or just stranded after midnight, that changes the whole journey home.
Kabir: A timetable can be a small thing until it is the only door still open.

takeaway:
Mira: We make the train, and the headline is clear: overnight service begins Friday.
Kabir: The city changed the route. We just got lucky enough to be standing at the first door.

For this example, the dramatic spine is: goal = reach the audition; obstacle = no transport before it closes; catalyst = overnight trains begin Friday; reversal = the locked station becomes the only route; cost of failure = the audition is missed; emotional turn = the notice becomes their escape route; resolution = they board the first train. The five dramatic actions are: discover the closed station, race the clock, activate the display, choose the train, board it. Write stories with this level of visible action and causal movement.
""".strip()
