from __future__ import annotations

import uuid
from datetime import date, datetime

from pydantic import BaseModel, ConfigDict

from app.models.enums import Category


class CharacterStatPublic(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    user_id: uuid.UUID
    category: Category
    total_xp: int
    level: int
    streak_count: int
    longest_streak: int
    last_active_date: date | None
    streak_freeze_count: int
    created_at: datetime


class CharacterOverview(BaseModel):
    user_total_xp: int
    user_level: int
    stats: list[CharacterStatPublic]

