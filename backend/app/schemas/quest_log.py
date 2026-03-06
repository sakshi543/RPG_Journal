from __future__ import annotations

import uuid
from datetime import date, datetime

from pydantic import BaseModel, ConfigDict, Field


class QuestLogPublic(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    quest_id: uuid.UUID
    user_id: uuid.UUID
    date: date
    location_name: str | None
    location_lat: float | None
    location_lng: float | None
    notes: str | None
    mood: int = Field(ge=1, le=5)
    xp_earned: int
    tags: list[str]
    is_capsule: bool
    capsule_open_date: date | None
    capsule_opened: bool
    created_at: datetime


class SealedLogPublic(BaseModel):
    id: uuid.UUID
    is_sealed: bool = True
    opens_on: date


class QuestLogUpdate(BaseModel):
    notes: str | None = None
    mood: int | None = Field(default=None, ge=1, le=5)
    tags: list[str] | None = None

