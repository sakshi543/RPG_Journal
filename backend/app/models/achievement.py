from __future__ import annotations

from sqlalchemy import Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base_class import Base
from app.models.enums import AchievementConditionType
from app.models.pg_enums import ACHIEVEMENT_CONDITION_TYPE_ENUM


class Achievement(Base):
    __tablename__ = "achievements"

    name: Mapped[str] = mapped_column(String(120), unique=True, index=True, nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    icon: Mapped[str] = mapped_column(String(64), nullable=False)

    condition_type: Mapped[AchievementConditionType] = mapped_column(
        ACHIEVEMENT_CONDITION_TYPE_ENUM, nullable=False
    )
    condition_value: Mapped[int] = mapped_column(Integer, nullable=False)
    condition_category: Mapped[str | None] = mapped_column(String(32), nullable=True)
    condition_difficulty: Mapped[str | None] = mapped_column(String(32), nullable=True)

    xp_reward: Mapped[int] = mapped_column(Integer, default=0, nullable=False)

