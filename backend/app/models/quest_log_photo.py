from __future__ import annotations

import uuid

from sqlalchemy import ForeignKey, Integer, String
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base_class import Base


class QuestLogPhoto(Base):
    __tablename__ = "quest_log_photos"

    quest_log_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("quest_logs.id", ondelete="CASCADE"), index=True, nullable=False
    )
    url: Mapped[str] = mapped_column(String(2048), nullable=False)
    thumbnail_url: Mapped[str] = mapped_column(String(2048), nullable=False)
    order_index: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
