# AI News Episodes - Feature Requirements

## 1. Product Summary

AI News Episodes turns current news into short, entertaining audio-visual story scenes. It is designed for people who do not want to read many separate articles but still want to understand what happened and why it matters.

The experience should feel closer to watching a funny, dramatic, fast-moving mini movie than listening to an article or a conventional news podcast. Humor, characters, and visual storytelling make the news engaging; factual reporting, source attribution, and clear context keep it trustworthy.

## 2. Product Goals

- Deliver a personalised sequence of relevant news stories based on a user's interests and recap preference.
- Make news easy and enjoyable to follow through short AI-written scenes with natural voice narration.
- Support multiple storytelling formats, from a single energetic narrator to multi-character dialogue.
- Present one relevant visual at a time so the episode works as a lightweight video experience as well as audio.
- Let listeners skip an entire story without disrupting playback or leaving a confusing narration gap.
- Reuse a generated story across users who share relevant interests instead of generating a complete episode from scratch for every user.

## 3. Non-Goals for the Hackathon

- Building a full production news ingestion, fact-checking, or publishing system.
- Generating a fully bespoke long-form episode script for each individual user.
- Creating a social network, comments system, or live breaking-news service.
- Perfectly matching real people’s likenesses or voices.

Mocked, trusted news data is acceptable for the first version.

## 4. Core User Experience

1. A user chooses interests, preferred language, and recap frequency (daily, weekly, or monthly).
2. The platform selects relevant prepared news story modules.
3. A lightweight episode composer orders the selected stories and selects suitable openings and transitions.
4. The user plays a continuous audio-visual episode.
5. Each story starts with a concise spoken title cue so the user knows what it covers and can skip it immediately.
6. During narration, images change in sync with the story’s beats.
7. Skipping moves directly to the next story’s self-contained entry, without an awkward or unfinished transition.

## 5. Content Model

### 5.1 Story Module

Every news item is authored or generated as an independent story module. The same module can be included in many episodes.

Each module must include:

- A plain-language `title` and `skipLabel` that clearly identify the news item.
- Category, topics, duration, publication date, and source metadata.
- The verified facts and the "why it matters" takeaway.
- A storytelling format and cast.
- A direct entry plus optional entry variants for a related or unrelated preceding story.
- A sequence of timed narrative beats, each with spoken lines and a visual instruction.
- A concise, self-contained ending.

Stories must not rely on another story having played. They must not use references such as "as we just discussed" or leave questions that are only resolved in another story.

### 5.2 Episode Composition

An episode is a composition of existing story modules, not a newly generated monolithic script.

The composer is responsible for:

- Selecting stories that match the user’s interests and recap period.
- Avoiding duplicate topics and overly similar story formats in sequence.
- Ordering stories into an engaging flow.
- Choosing a short episode opening and closing.
- Selecting an entry variant based on the previous story, or using `direct` after a skip.
- Optionally inserting a very short continuity line between stories.

The continuity line should guide the viewer into the next scene without becoming a conventional podcast host. Example: "Different kind of chaos now: the chip industry."

### 5.3 Story Beat Structure

Each story should generally follow this beat structure:

1. **Title cue** - States exactly what the story covers and is suitable as a skip point.
2. **Hook** - Opens with the funniest, most surprising, or most emotionally immediate angle.
3. **What happened** - Communicates the important reported facts.
4. **Why it matters** - Explains relevance through relatable language, characters, or a visual metaphor.
5. **Takeaway** - Lands the main point in one memorable line.

Not every beat needs equal duration. A typical hackathon story should be approximately 45 to 90 seconds.

## 6. Storytelling Formats

The system should support a small set of repeatable formats. All formats must communicate the same factual story, with the format acting as the entertainment layer.

- **Solo hot take:** One energetic voice gives a quick, humorous explanation.
- **Two-person banter:** An explainer and a curious or skeptical character trade short lines. This is the preferred format for complex topics.
- **Three-character mini-scene:** A brief dialogue for stories that benefit from contrasting viewpoints. Use sparingly to keep the audio easy to follow.
- **Dramatized POV:** A fictional performer tells the story from a relevant point of view, such as a founder, consumer, or even an object involved in the news.
- **Group-chat / voice-note scene:** Short reactions from fictional characters, grounded by a line that explains the facts.

The tone may be witty, dramatic, conversational, or playful. Jokes must frame or react to facts; they must not alter, exaggerate, or obscure the factual claim.

## 7. Voice Narration Requirements

The script format must be directly usable by a voice model.

- Every spoken line has an explicit speaker identifier.
- Every speaker has an original synthetic voice profile, language, and performance style.
- Spoken text contains only speakable dialogue. Sound effects, camera notes, visual directions, citations, and timing metadata are stored separately.
- Lines should be short enough for natural timing and clear speaker changes.
- The system may use music or sound effects, but spoken facts must remain intelligible.
- A story must include a direct-entry version that works after a user skips another story.

The product must not imitate a real person’s voice or present AI-generated lines as if a real person said them. For a real person in the news, use an original performer in a clearly labelled dramatized POV, or use neutral narration.

## 8. Visual Storytelling Requirements

Each narrative beat includes a visual payload that can produce or select the image displayed during its audio.

### 8.1 Visual Direction

The default presentation is vertical 9:16 for mobile viewing. The desired style is cinematic editorial comedy:

- Dramatic lighting, intentional camera angles, and film-like composition.
- Funny but comprehensible visual metaphors that reinforce the spoken line.
- Vivid, believable colour and contemporary settings.
- Clear negative space in the upper portion of the image for UI captions.
- No generated text, fake screenshots, watermarks, or logos within images.

### 8.2 Visual Modes

- **Factual visual:** A relevant place, object, map, chart, or sourced image that provides context.
- **Cinematic recreation:** An illustrative scene that makes an event emotionally understandable.
- **Funny metaphor:** An absurd but clear image that pays off a joke or explains impact.
- **Character reaction:** A consistent fictional character reacting to the event in a scene.
- **Summary visual:** A memorable closing image that reinforces the takeaway.

Generated visuals must not look like evidence of a real person performing an unverified action. For stories involving real public figures, prefer sourced imagery or symbolic/editorial visuals. The UI should identify generated images as AI visual illustrations where appropriate.

### 8.3 Beat-Level Image Instructions

Every beat should carry:

- `kind`: the visual mode.
- `durationSeconds`: how long it remains visible.
- `caption`: optional UI caption, separate from the generated image.
- `imagePrompt`: a detailed image-generation instruction based on the exact spoken beat.
- `motion`: an optional simple motion instruction, such as slow push-in, pan, or hold.

An image prompt should specify the subject, action, emotional or comedic intent, setting, camera framing, lighting, colour mood, caption-safe negative space, and image restrictions. Example:

> Vertical 9:16 cinematic editorial-comedy scene. A young adult sits in a parked modern electric car, cautiously hopeful while holding a calculator beside a visibly shrinking pile of bills. Warm sunrise through the windshield, contemporary Indian city, shallow depth of field, premium film-still composition, upper-third negative space for caption. No text, logos, or watermark.

## 9. Suggested Story Data Contract

```json
{
  "storyId": "india-ev-policy-2026-07-25",
  "title": "India's EV Push Just Got Faster",
  "skipLabel": "India's EV policy update",
  "category": "technology",
  "topics": ["electric vehicles", "India", "policy"],
  "durationSeconds": 65,
  "sources": [
    {
      "name": "Trusted News Source",
      "url": "https://example.com/article",
      "publishedAt": "2026-07-25T08:00:00Z"
    }
  ],
  "format": "two-person-banter",
  "cast": [
    {
      "id": "maya",
      "role": "explainer",
      "voiceProfile": "warm, quick, conversational",
      "language": "en-IN"
    },
    {
      "id": "dev",
      "role": "skeptical friend",
      "voiceProfile": "dry humour, curious, energetic",
      "language": "en-IN"
    }
  ],
  "entry": {
    "direct": "Quick story: India's EV policy just changed.",
    "afterRelated": "Staying with the future-of-transport theme, India's EV policy just changed.",
    "afterUnrelated": "Different kind of update now: India's EV policy just changed."
  },
  "beats": [
    {
      "id": "title",
      "visual": {
        "kind": "factual-visual",
        "durationSeconds": 4,
        "caption": "India's EV policy update",
        "imagePrompt": "Vertical 9:16 dramatic editorial view of modern electric cars in an Indian city at sunrise, clean upper third for caption, no text or logos.",
        "motion": "slow push-in"
      },
      "lines": [
        {
          "speaker": "maya",
          "text": "Quick story: India's EV policy just changed."
        }
      ]
    },
    {
      "id": "why-it-matters",
      "visual": {
        "kind": "funny-metaphor",
        "durationSeconds": 6,
        "caption": "What it could mean for buyers",
        "imagePrompt": "Vertical 9:16 cinematic editorial-comedy scene of an EV buyer watching a dramatically oversized pile of bills shrink beside a calculator, warm morning light, contemporary city setting, premium film-still composition, upper-third negative space, no text, logos, or watermark.",
        "motion": "slow push-in"
      },
      "lines": [
        {
          "speaker": "dev",
          "text": "Translation: buying an EV may require slightly less emotional damage to your bank account."
        },
        {
          "speaker": "maya",
          "text": "The change could make electric vehicles more accessible by..."
        }
      ]
    }
  ],
  "exit": "Bottom line: India's EV transition just got a stronger push."
}
```

## 10. Personalisation Requirements

- Users can select one or more interests such as technology, business, sports, entertainment, science, politics, or world news.
- Users can choose a daily, weekly, or monthly recap cadence.
- Users can select a language for narration and on-screen captions.
- Personalisation selects and orders existing story modules; it does not require unique source reporting or a fully unique story script for every user.
- The final story selection should feel balanced, varied, and relevant rather than being a long list from a single topic.

## 11. Trust and Safety Requirements

- Every story retains source name, URL, and publication timestamp.
- The product clearly separates factual reporting from commentary, jokes, and dramatization.
- The script must preserve factual accuracy and not invent material claims.
- Generated visuals and AI dramatizations must not be presented as authentic documentary footage or quotations.
- The interface should make it easy to inspect the underlying source for a story.

## 12. Hackathon Success Criteria

The prototype is successful when a user can:

- Choose interests and receive a short tailored episode made from mocked news stories.
- Watch or listen to at least two distinct story formats.
- Understand what each story is about before deciding to skip it.
- Skip a story and hear the next one begin naturally.
- See visuals change in meaningful sync with narration.
- View the source information for each story.
