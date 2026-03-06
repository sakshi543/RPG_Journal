from __future__ import annotations

import uuid
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, get_db
from app.models.journal_page import JournalPage
from app.models.quest_log import QuestLog
from app.models.user import User
from app.schemas.journal import JournalPagePublic, JournalPageUpdate


router = APIRouter()


def today_utc():
    return datetime.now(timezone.utc).date()


@router.get("/{log_id}", response_model=JournalPagePublic)
def get_or_create_journal_page(
    log_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> JournalPagePublic:
    log = db.get(QuestLog, log_id)
    if not log or log.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Log not found")
    if log.is_capsule and not log.capsule_opened and log.capsule_open_date and log.capsule_open_date > today_utc():
        raise HTTPException(status_code=403, detail="This entry is sealed until its open date")

    stmt = select(JournalPage).where(JournalPage.quest_log_id == log.id)
    page = db.execute(stmt).scalar_one_or_none()
    if not page:
        page = JournalPage(quest_log_id=log.id)
        db.add(page)
        db.commit()
        db.refresh(page)

    return JournalPagePublic.model_validate(page)


@router.put("/{log_id}", response_model=JournalPagePublic)
def update_journal_page(
    log_id: uuid.UUID,
    payload: JournalPageUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> JournalPagePublic:
    log = db.get(QuestLog, log_id)
    if not log or log.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Log not found")
    if log.is_capsule and not log.capsule_opened and log.capsule_open_date and log.capsule_open_date > today_utc():
        raise HTTPException(status_code=403, detail="This entry is sealed until its open date")

    stmt = select(JournalPage).where(JournalPage.quest_log_id == log.id)
    page = db.execute(stmt).scalar_one_or_none()
    if not page:
        page = JournalPage(quest_log_id=log.id)
        db.add(page)
        db.flush()

    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(page, field, value)

    db.add(page)
    db.commit()
    db.refresh(page)
    return JournalPagePublic.model_validate(page)

