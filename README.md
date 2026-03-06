# Life RPG (RPG Journal)

Turn your real-life side quests into an RPG: complete quests, earn XP, level up, and build a scrapbook-style journal entry for each completed quest.

## Run locally (Docker)

Prereqs:
- Docker Desktop

Start everything:

```bash
docker compose up --build
```

Then open:
- **Frontend**: `http://localhost:3000`
- **API docs**: `http://localhost:8000/docs`

## Repo layout

- `backend/`: FastAPI API, Postgres models + Alembic migrations, JWT auth
- `frontend/`: Next.js 14 (App Router) UI with Tailwind
- `docker-compose.yml`: local Postgres + Redis + API + Frontend

## Notes

- Default dev DB credentials are in `docker-compose.yml` and meant for local use only.