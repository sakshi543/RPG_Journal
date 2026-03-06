from __future__ import annotations

import uuid
from datetime import date

from sqlalchemy import Boolean, Date, Float, ForeignKey, Integer, String, Text
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base_class import Base


class QuestLog(Base):
    __tablename__ = "quest_logs"

    quest_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("quests.id", ondelete="CASCADE"), index=True, nullable=False)
    user_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), index=True, nullable=False)

    date: Mapped[date] = mapped_column(Date, nullable=False)

    location_name: Mapped[str | None] = mapped_column(String(160), nullable=True)
    location_lat: Mapped[float | None] = mapped_column(Float, nullable=True)
    location_lng: Mapped[float | None] = mapped_column(Float, nullable=True)

    notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    mood: Mapped[int] = mapped_column(Integer, nullable=False)
    xp_earned: Mapped[int] = mapped_column(Integer, nullable=False)

    tags: Mapped[list[str]] = mapped_column(JSONB, default=list, nullable=False)

    is_capsule: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    capsule_open_date: Mapped[date | None] = mapped_column(Date, nullable=True)
    capsule_opened: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)

