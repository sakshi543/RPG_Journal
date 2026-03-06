from __future__ import annotations

from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, get_db
from app.models.character_stat import CharacterStat
from app.models.user import User
from app.schemas.character import CharacterOverview, CharacterStatPublic


router = APIRouter()


@router.get("", response_model=CharacterOverview)
def overview(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> CharacterOverview:
    stmt = select(CharacterStat).where(CharacterStat.user_id == current_user.id)
    stats = db.execute(stmt).scalars().all()
    return CharacterOverview(
        user_total_xp=current_user.total_xp,
        user_level=current_user.level,
        stats=[CharacterStatPublic.model_validate(s) for s in stats],
    )

