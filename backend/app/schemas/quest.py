from __future__ import annotations

import uuid
from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field

from app.models.enums import Category, Difficulty, QuestType
from app.schemas.quest_log import QuestLogPublic


class QuestCreate(BaseModel):
    title: str = Field(min_length=1, max_length=160)
    description: str | None = None
    category: Category
    difficulty: Difficulty
    quest_type: QuestType
    progress_target: int | None = Field(default=None, ge=1)


class QuestUpdate(BaseModel):
    title: str | None = Field(default=None, min_length=1, max_length=160)
    description: str | None = None
    category: Category | None = None
    difficulty: Difficulty | None = None
    quest_type: QuestType | None = None
    progress_target: int | None = Field(default=None, ge=1)
    is_active: bool | None = None


class QuestPublic(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    user_id: uuid.UUID
    title: str
    description: str | None
    category: Category
    difficulty: Difficulty
    xp_reward: int
    quest_type: QuestType
    progress_target: int | None
    progress_current: int
    is_active: bool
    is_completed: bool
    created_at: datetime
    updated_at: datetime
    completed_at: datetime | None


class QuestCompleteRequest(BaseModel):
    notes: str | None = None
    mood: int = Field(ge=1, le=5)
    location_name: str | None = None
    lat: float | None = None
    lng: float | None = None
    tags: list[str] = Field(default_factory=list)


class QuestCompleteResponse(BaseModel):
    quest_log: QuestLogPublic
    xp_earned: int
    leveled_up: bool
    new_level: int | None
    achievements_unlocked: list[dict] = Field(default_factory=list)

