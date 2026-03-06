from __future__ import annotations

import uuid
from datetime import date

from sqlalchemy import Date, ForeignKey, Integer, UniqueConstraint
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base_class import Base
from app.models.enums import Category
from app.models.pg_enums import CATEGORY_ENUM


class CharacterStat(Base):
    __tablename__ = "character_stats"
    __table_args__ = (UniqueConstraint("user_id", "category", name="uq_character_stats_user_category"),)

    user_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), index=True, nullable=False)
    category: Mapped[Category] = mapped_column(CATEGORY_ENUM, nullable=False)

    total_xp: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    level: Mapped[int] = mapped_column(Integer, default=1, nullable=False)

    streak_count: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    longest_streak: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    last_active_date: Mapped[date | None] = mapped_column(Date, nullable=True)

    streak_freeze_count: Mapped[int] = mapped_column(Integer, default=0, nullable=False)

