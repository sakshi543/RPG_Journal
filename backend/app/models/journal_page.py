from __future__ import annotations

import uuid
from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, String, UniqueConstraint
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base_class import Base, utcnow
from app.models.enums import JournalLayoutTemplate
from app.models.pg_enums import JOURNAL_LAYOUT_TEMPLATE_ENUM


class JournalPage(Base):
    __tablename__ = "journal_pages"
    __table_args__ = (UniqueConstraint("quest_log_id", name="uq_journal_pages_log"),)

    quest_log_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("quest_logs.id", ondelete="CASCADE"), index=True, nullable=False)

    layout_template: Mapped[JournalLayoutTemplate] = mapped_column(
        JOURNAL_LAYOUT_TEMPLATE_ENUM,
        default=JournalLayoutTemplate.freeform,
        nullable=False,
    )
    sticker_data: Mapped[list[dict]] = mapped_column(JSONB, default=list, nullable=False)
    text_blocks: Mapped[list[dict]] = mapped_column(JSONB, default=list, nullable=False)
    background_color: Mapped[str] = mapped_column(String(16), default="#1E1E40", nullable=False)

    exported_image_url: Mapped[str | None] = mapped_column(String(2048), nullable=True)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow, onupdate=utcnow, nullable=False)

