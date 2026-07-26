"""Structured output models shared by every story-generation mode."""
from __future__ import annotations

from typing import Literal

from pydantic import BaseModel, Field, root_validator

from taxonomy import SUGGESTED_INTERESTS

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


class InteractionOption(BaseModel):
    id: Literal["a", "b"]
    text: str


class StoryInteraction(BaseModel):
    id: str
    beatId: Literal["hook", "what-happened", "why-it-matters"]
    type: Literal["prediction_poll", "impact_poll"]
    question: str
    options: list[InteractionOption] = Field(min_items=2, max_items=2)
    correctOptionId: Literal["a", "b"] | None = None
    revealText: str


class StoryClassification(BaseModel):
    category: Literal["Technology", "Sports", "Business", "Politics", "Entertainment", "Science", "Lifestyle"]
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
    selectedFormat: Literal[
        "solo-hot-take", "two-person-banter", "dramatized-pov", "group-chat-meltdown", "fourth-wall", "game-show-round"
    ]
    performanceMode: Literal[
        "character-dialogue", "solo-character-hot-take", "first-person-pov", "group-chat-voices", "fourth-wall-solo", "game-show-ensemble"
    ]
    castMode: Literal["story_duo", "recurring_duo", "solo_host", "pov_lead", "group_chat", "game_show"]
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
    interactions: list[StoryInteraction] = Field(default_factory=list, max_items=1)
    exit: str
