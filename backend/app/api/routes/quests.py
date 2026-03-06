from __future__ import annotations

import uuid
from datetime import date as date_type, datetime, timedelta, timezone

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, get_db
from app.core.xp import XP_MAP, calculate_level
from app.models.character_stat import CharacterStat
from app.models.enums import Category, Difficulty, QuestType
from app.models.quest import Quest
from app.models.quest_log import QuestLog
from app.models.user import User
from app.schemas.quest import (
    QuestCompleteRequest,
    QuestCompleteResponse,
    QuestCreate,
    QuestPublic,
    QuestUpdate,
)
from app.schemas.quest_log import QuestLogPublic


router = APIRouter()


def today_utc() -> date_type:
    return datetime.now(timezone.utc).date()


@router.get("", response_model=list[QuestPublic])
def list_quests(
    category: Category | None = None,
    quest_type: QuestType | None = None,
    is_active: bool | None = None,
    is_completed: bool | None = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> list[QuestPublic]:
    stmt = select(Quest).where(Quest.user_id == current_user.id)
    if category is not None:
        stmt = stmt.where(Quest.category == category)
    if quest_type is not None:
        stmt = stmt.where(Quest.quest_type == quest_type)
    if is_active is not None:
        stmt = stmt.where(Quest.is_active == is_active)
    if is_completed is not None:
        stmt = stmt.where(Quest.is_completed == is_completed)

    quests = db.execute(stmt.order_by(Quest.created_at.desc())).scalars().all()
    return [QuestPublic.model_validate(q) for q in quests]


@router.post("", response_model=QuestPublic)
def create_quest(
    payload: QuestCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> QuestPublic:
    xp_reward = XP_MAP[payload.difficulty.value]
    quest = Quest(
        user_id=current_user.id,
        title=payload.title,
        description=payload.description,
        category=payload.category,
        difficulty=payload.difficulty,
        xp_reward=xp_reward,
        quest_type=payload.quest_type,
        progress_target=payload.progress_target if payload.quest_type == QuestType.progress else None,
        progress_current=0,
        is_active=True,
        is_completed=False,
    )
    db.add(quest)
    db.commit()
    db.refresh(quest)
    return QuestPublic.model_validate(quest)


@router.get("/{quest_id}", response_model=QuestPublic)
def get_quest(
    quest_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> QuestPublic:
    quest = db.get(Quest, quest_id)
    if not quest or quest.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Quest not found")
    return QuestPublic.model_validate(quest)


@router.put("/{quest_id}", response_model=QuestPublic)
def update_quest(
    quest_id: uuid.UUID,
    payload: QuestUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> QuestPublic:
    quest = db.get(Quest, quest_id)
    if not quest or quest.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Quest not found")

    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(quest, field, value)

    # keep xp_reward consistent with difficulty unless user didn't change it
    if payload.difficulty is not None:
        quest.xp_reward = XP_MAP[payload.difficulty.value]

    if payload.quest_type is not None and payload.quest_type != QuestType.progress:
        quest.progress_target = None

    db.add(quest)
    db.commit()
    db.refresh(quest)
    return QuestPublic.model_validate(quest)


@router.delete("/{quest_id}")
def delete_quest(
    quest_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> dict:
    quest = db.get(Quest, quest_id)
    if not quest or quest.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Quest not found")
    quest.is_active = False
    db.add(quest)
    db.commit()
    return {"ok": True}


@router.post("/{quest_id}/complete", response_model=QuestCompleteResponse)
def complete_quest(
    quest_id: uuid.UUID,
    payload: QuestCompleteRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> QuestCompleteResponse:
    quest: Quest | None = db.get(Quest, quest_id)
    if not quest or quest.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Quest not found")
    if not quest.is_active:
        raise HTTPException(status_code=400, detail="Quest is not active")
    if quest.quest_type == QuestType.one_time and quest.is_completed:
        raise HTTPException(status_code=400, detail="Quest already completed")

    today = today_utc()

    # Award XP
    xp_earned = quest.xp_reward

    # Update per-category stats (create lazily)
    stat_stmt = select(CharacterStat).where(
        CharacterStat.user_id == current_user.id, CharacterStat.category == quest.category
    )
    stat = db.execute(stat_stmt).scalar_one_or_none()
    if not stat:
        stat = CharacterStat(user_id=current_user.id, category=quest.category, total_xp=0, level=1)
        db.add(stat)
        db.flush()

    old_cat_level = stat.level
    stat.total_xp += xp_earned
    stat.level = calculate_level(stat.total_xp)

    # streak update (MVP, no freeze spend logic)
    if stat.last_active_date is None:
        stat.streak_count = 1
    else:
        yesterday = today - timedelta(days=1)
        if stat.last_active_date == yesterday:
            stat.streak_count += 1
        elif stat.last_active_date == today:
            # already active today in this category; keep streak
            stat.streak_count = max(stat.streak_count, 1)
        else:
            stat.streak_count = 1
    stat.last_active_date = today
    stat.longest_streak = max(stat.longest_streak, stat.streak_count)

    # update global user XP/level
    old_user_level = current_user.level
    current_user.total_xp += xp_earned
    current_user.level = calculate_level(current_user.total_xp)

    # quest completion state
    if quest.quest_type == QuestType.one_time:
        quest.is_completed = True
        quest.completed_at = datetime.now(timezone.utc)
    elif quest.quest_type == QuestType.progress:
        quest.progress_current += 1
        if quest.progress_target and quest.progress_current >= quest.progress_target:
            quest.is_completed = True
            quest.completed_at = datetime.now(timezone.utc)

    # create log
    log = QuestLog(
        quest_id=quest.id,
        user_id=current_user.id,
        date=today,
        location_name=payload.location_name,
        location_lat=payload.lat,
        location_lng=payload.lng,
        notes=payload.notes,
        mood=payload.mood,
        xp_earned=xp_earned,
        tags=payload.tags,
    )
    db.add(log)

    db.add_all([quest, stat, current_user])
    db.commit()
    db.refresh(log)

    leveled_up = current_user.level > old_user_level
    new_level = current_user.level if leveled_up else None

    # achievements are Phase 2+ (return shape now)
    return QuestCompleteResponse(
        quest_log=QuestLogPublic.model_validate(log),
        xp_earned=xp_earned,
        leveled_up=leveled_up,
        new_level=new_level,
        achievements_unlocked=[],
    )

