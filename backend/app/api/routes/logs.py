from __future__ import annotations

import os
import uuid
from datetime import date as date_type, datetime, timezone

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile
from pydantic import BaseModel, Field
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, get_db
from app.models.quest_log import QuestLog
from app.models.quest_log_photo import QuestLogPhoto
from app.models.user import User
from app.schemas.quest_log import QuestLogPublic, QuestLogUpdate, SealedLogPublic


router = APIRouter()

UPLOADS_BASE = os.path.join(os.path.dirname(__file__), "..", "..", "uploads")


def today_utc() -> date_type:
    return datetime.now(timezone.utc).date()


@router.get("", response_model=list[QuestLogPublic])
def list_logs(
    quest_id: uuid.UUID | None = None,
    limit: int = 50,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> list[QuestLogPublic]:
    stmt = select(QuestLog).where(QuestLog.user_id == current_user.id)
    if quest_id:
        stmt = stmt.where(QuestLog.quest_id == quest_id)
    logs = db.execute(stmt.order_by(QuestLog.date.desc(), QuestLog.created_at.desc()).limit(limit)).scalars().all()
    # For MVP list, we return entries even if sealed; detail endpoint enforces sealed content.
    return [QuestLogPublic.model_validate(l) for l in logs]


@router.get("/{log_id}", response_model=QuestLogPublic | SealedLogPublic)
def get_log(
    log_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> QuestLogPublic | SealedLogPublic:
    log = db.get(QuestLog, log_id)
    if not log or log.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Log not found")

    if log.is_capsule and not log.capsule_opened:
        if not log.capsule_open_date:
            raise HTTPException(status_code=400, detail="Capsule has no open date")
        if log.capsule_open_date > today_utc():
            return SealedLogPublic(id=log.id, opens_on=log.capsule_open_date)
        # open automatically once date reached (MVP)
        log.capsule_opened = True
        db.add(log)
        db.commit()
        db.refresh(log)

    return QuestLogPublic.model_validate(log)


@router.put("/{log_id}", response_model=QuestLogPublic)
def update_log(
    log_id: uuid.UUID,
    payload: QuestLogUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> QuestLogPublic:
    log = db.get(QuestLog, log_id)
    if not log or log.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Log not found")

    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(log, field, value)

    db.add(log)
    db.commit()
    db.refresh(log)
    return QuestLogPublic.model_validate(log)


@router.delete("/{log_id}")
def delete_log(
    log_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> dict:
    log = db.get(QuestLog, log_id)
    if not log or log.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Log not found")
    db.delete(log)
    db.commit()
    return {"ok": True}


class SealCapsuleRequest(BaseModel):
    open_date: date_type = Field()


@router.post("/{log_id}/photos")
def upload_photo(
    log_id: uuid.UUID,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> dict:
    log = db.get(QuestLog, log_id)
    if not log or log.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Log not found")

    ext = os.path.splitext(file.filename or "img")[1] or ".jpg"
    if ext.lower() not in (".jpg", ".jpeg", ".png", ".gif", ".webp"):
        raise HTTPException(status_code=400, detail="Invalid image type")

    dir_path = os.path.join(UPLOADS_BASE, "quest_logs", str(log_id))
    os.makedirs(dir_path, exist_ok=True)
    name = f"{uuid.uuid4().hex}{ext}"
    path = os.path.join(dir_path, name)
    rel_url = f"/uploads/quest_logs/{log_id}/{name}"

    with open(path, "wb") as f:
        f.write(file.file.read())

    last_photo = db.execute(
        select(QuestLogPhoto).where(QuestLogPhoto.quest_log_id == log_id).order_by(QuestLogPhoto.order_index.desc()).limit(1)
    ).scalars().first()
    order_index = (last_photo.order_index + 1) if last_photo else 0

    photo = QuestLogPhoto(quest_log_id=log_id, url=rel_url, thumbnail_url=rel_url, order_index=order_index)
    db.add(photo)
    db.commit()
    db.refresh(photo)
    return {"id": str(photo.id), "url": rel_url, "thumbnail_url": rel_url}


@router.post("/{log_id}/capsule", response_model=QuestLogPublic)
def seal_capsule(
    log_id: uuid.UUID,
    payload: SealCapsuleRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> QuestLogPublic:
    log = db.get(QuestLog, log_id)
    if not log or log.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Log not found")
    if payload.open_date <= today_utc():
        raise HTTPException(status_code=400, detail="Open date must be in the future")

    log.is_capsule = True
    log.capsule_open_date = payload.open_date
    log.capsule_opened = False

    db.add(log)
    db.commit()
    db.refresh(log)
    return QuestLogPublic.model_validate(log)

