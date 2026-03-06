from __future__ import annotations

import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.api.router import api_router
from app.core.config import get_settings
from app.db.base import Base  # noqa: F401
from app.db.session import engine

UPLOADS_DIR = os.path.join(os.path.dirname(__file__), "..", "uploads")
os.makedirs(UPLOADS_DIR, exist_ok=True)


def create_app() -> FastAPI:
    settings = get_settings()
    app = FastAPI(title="Life RPG API", version="0.1.0")

    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origin_list,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    app.include_router(api_router, prefix="/api/v1")
    app.mount("/uploads", StaticFiles(directory=UPLOADS_DIR), name="uploads")
    return app


app = create_app()


@app.on_event("startup")
def _startup() -> None:
    import time

    last_err: Exception | None = None
    for _ in range(30):
        try:
            Base.metadata.create_all(bind=engine)
            from app.db.seed_achievements import seed_achievements
            seed_achievements()
            return
        except Exception as e:  # pragma: no cover
            last_err = e
            time.sleep(1)
    if last_err:
        raise last_err

