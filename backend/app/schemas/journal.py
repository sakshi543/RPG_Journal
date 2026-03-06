from __future__ import annotations

import uuid
from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field

from app.models.enums import JournalLayoutTemplate


class JournalPagePublic(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    quest_log_id: uuid.UUID
    layout_template: JournalLayoutTemplate
    sticker_data: list[dict]
    text_blocks: list[dict]
    background_color: str
    exported_image_url: str | None
    created_at: datetime
    updated_at: datetime


class JournalPageUpdate(BaseModel):
    layout_template: JournalLayoutTemplate | None = None
    sticker_data: list[dict] | None = None
    text_blocks: list[dict] | None = None
    background_color: str | None = Field(default=None, max_length=16)

