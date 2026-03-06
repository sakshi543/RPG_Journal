from __future__ import annotations

import uuid
from datetime import datetime

from sqlalchemy import Boolean, DateTime, ForeignKey, Integer, String, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base_class import Base, utcnow
from app.models.enums import Category, Difficulty, QuestType
from app.models.pg_enums import CATEGORY_ENUM, DIFFICULTY_ENUM, QUEST_TYPE_ENUM


class Quest(Base):
    __tablename__ = "quests"

    user_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), index=True, nullable=False)

    title: Mapped[str] = mapped_column(String(160), nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)

    category: Mapped[Category] = mapped_column(CATEGORY_ENUM, nullable=False)
    difficulty: Mapped[Difficulty] = mapped_column(DIFFICULTY_ENUM, nullable=False)
    xp_reward: Mapped[int] = mapped_column(Integer, nullable=False)

    quest_type: Mapped[QuestType] = mapped_column(QUEST_TYPE_ENUM, nullable=False)
    progress_target: Mapped[int | None] = mapped_column(Integer, nullable=True)
    progress_current: Mapped[int] = mapped_column(Integer, default=0, nullable=False)

    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    is_completed: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    completed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow, onupdate=utcnow, nullable=False)

