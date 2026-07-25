"""Structured output models shared by every story-generation mode."""
from __future__ import annotations

from typing import Literal

from pydantic import BaseModel, Field, root_validator

from taxonomy import SUGGESTED_INTERESTS

MAX_STORY_DURATION_SECONDS = 70
MAX_STORY_SPOKEN_WORDS = 105


class VoiceCharacter(BaseModel):
    id: str
    role: str
    voiceProfile: str
    language: str
    visualIdentity: str


class StoryLine(BaseModel):
    speaker: str
    text: str


class VisualDirection(BaseModel):
    kind: Literal[
        "factual-visual",
        "cinematic-recreation",
        "funny-metaphor",
        "character-reaction",
        "summary-visual",
    ]
    durationSeconds: int = Field(ge=3, le=14)
    caption: str
    imagePrompt: str
    scenePrompt: str
    continuityNotes: str
    motion: Literal["hold", "slow push-in", "gentle pan"]


class StoryBeat(BaseModel):
    id: Literal["title-cue", "hook", "what-happened", "why-it-matters", "takeaway"]
    dramaticAction: str
    turningPoint: str
    visual: VisualDirection
    lines: list[StoryLine]


class StoryClassification(BaseModel):
    category: Literal["Technology", "Sports", "Business", "Entertainment", "Science", "Lifestyle"]
    subcategories: list[str] = Field(min_items=1, max_items=2)

    @root_validator(skip_on_failure=True)
    def validate_subcategories(cls, values):
        category = values.get("category")
        subcategories = values.get("subcategories") or []
        valid_subcategories = set(SUGGESTED_INTERESTS.get(category, []))
        invalid = [item for item in subcategories if item not in valid_subcategories]
        if invalid:
            raise ValueError(f"Invalid subcategories for {category}: {', '.join(invalid)}")
        return values


class CreativeDirection(BaseModel):
    genre: str
    dramaticPremise: str
    selectedFormat: Literal["solo-hot-take", "two-person-banter", "dramatized-pov"]
    performanceMode: Literal["character-dialogue", "solo-character-hot-take", "first-person-pov"]
    castMode: Literal["story_duo", "recurring_duo", "solo_host", "pov_lead"]
    visualStyle: Literal["animated", "live_action"]


class VisualBible(BaseModel):
    setting: str
    colorAndLighting: str
    recurringProps: list[str] = Field(min_items=1, max_items=4)
    storyArc: str
    referenceImagePrompt: str


class DramaticSpine(BaseModel):
    characterGoal: str
    obstacle: str
    newsCatalyst: str
    reversal: str
    costOfFailure: str
    emotionalTurn: str
    resolution: str


class GeneratedStory(BaseModel):
    title: str
    skipLabel: str
    classification: StoryClassification
    creativeDirection: CreativeDirection
    dramaticSpine: DramaticSpine
    visualBible: VisualBible
    cast: list[VoiceCharacter] = Field(min_items=1, max_items=3)
    beats: list[StoryBeat]
    exit: str

    @root_validator(skip_on_failure=True)
    def validate_story_length(cls, values):
        beats = values.get("beats") or []
        visual_duration = sum(beat.visual.durationSeconds for beat in beats)
        spoken_words = sum(
            len(line.text.split())
            for beat in beats
            for line in beat.lines
        )
        if visual_duration > MAX_STORY_DURATION_SECONDS:
            raise ValueError(f"Story visual duration must not exceed {MAX_STORY_DURATION_SECONDS} seconds.")
        if spoken_words > MAX_STORY_SPOKEN_WORDS:
            raise ValueError(f"Story dialogue must not exceed {MAX_STORY_SPOKEN_WORDS} words.")
        return values
