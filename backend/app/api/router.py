from fastapi import APIRouter

from app.api.routes import auth, character, journal, logs, quests


api_router = APIRouter()
api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(quests.router, prefix="/quests", tags=["quests"])
api_router.include_router(logs.router, prefix="/logs", tags=["logs"])
api_router.include_router(journal.router, prefix="/journal", tags=["journal"])
api_router.include_router(character.router, prefix="/character", tags=["character"])

