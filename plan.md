# LIFE RPG APP

## 1. PLAN

Build a full-stack web application called **Life RPG** — a quest tracking, journaling, and RPG progression system that turns a user's real life into an adventure game.

The app combines:
- **Real-Life Side Quests** — structured as RPG quests with difficulty and XP rewards
- **Scrapbook journaling** — every quest completion generates a rich visual log entry with photos, stickers, mood, and location
- **Character progression** — XP, levels, and skill categories that grow as the user completes quests
- **Long-term life narrative** — adventure map, monthly reviews, time capsule entries, achievements

The core user loop is: **Create Quest → Complete Quest → Log the Memory → Earn XP → Level Up**

---

## 1.1 IMPLEMENTATION NOTES & REQUIRED ADJUSTMENTS (MVP)

These are small spec tweaks to keep the first shippable version consistent and implementable.

- **Repo reality**: This repository starts empty (only `plan.md` + `README.md`). We will scaffold `backend/`, `frontend/`, and root `docker-compose.yml`.
- **User progression fields**: Add `User.total_xp` and `User.level` (global) as stored fields for fast dashboard reads. Global level uses the same `LEVEL_THRESHOLDS`.
- **Tags storage**: Store `QuestLog.tags` as **JSONB** (portable and flexible) rather than a strict ARRAY to simplify future tag metadata.
- **Achievement model vs seed list**: The seed list includes conditions that require extra fields not listed in the model.
  - Add optional `condition_category: str | None` (already planned)
  - Add optional `condition_difficulty: str | None` (needed for “Legendary”)
  - Expand `condition_type` enum to include: `journal_count`, `capsule_opened`, `arc_completed`
- **CharacterStat streak freeze**: Add `streak_freeze_count: int` (default 0). The “spend 50 XP” action is a Phase 3+ feature; MVP only stores the count.
- **Time capsule rule enforcement**: For sealed logs, the normal log detail endpoint must return only `{ is_sealed: true, opens_on: date }` until opened.
- **MVP scope**: Ship Phase 1 + the minimal journaling loop needed to feel “game-like”:
  - Auth, quest CRUD, quest completion → XP/level updates, QuestLog creation
  - Journal page persistence (`JournalPage`) with background + stickers + text blocks (no export in MVP)

---

## 2. TECH STACK

### Backend
| Tool | Purpose |
|------|---------|
| **FastAPI** | REST API framework |
| **PostgreSQL** | Primary relational database |
| **SQLAlchemy** | ORM |
| **Alembic** | Database migrations |
| **Redis** | Streak tracking, XP caching, session data |
| **Celery + Redis** | Background jobs (monthly reviews, capsule notifications) |
| **Cloudflare R2** | Photo/image object storage (S3-compatible) |
| **python-jose** | JWT authentication |
| **Pillow** | Server-side image thumbnail generation |
| **Pydantic v2** | Request/response validation |

### Frontend
| Tool | Purpose |
|------|---------|
| **Next.js 14 (App Router)** | React framework with SSR |
| **Tailwind CSS** | Utility-first styling |
| **Framer Motion** | Animations (XP bar fill, level-up screen, transitions) |
| **TanStack Query** | Server state management and data fetching |
| **Zustand** | Client state (active quest, XP counter, UI state) |
| **dnd-kit** | Drag-and-drop for scrapbook sticker editor |
| **Leaflet.js** | Interactive adventure map |
| **Recharts** | Character stat radar chart, XP progress graphs |
| **React Dropzone** | Photo upload UX |
| **date-fns** | Date formatting |

### Infrastructure
| Tool | Purpose |
|------|---------|
| **Docker + Docker Compose** | Local development environment |
| **Railway or Render** | FastAPI + PostgreSQL deployment |
| **Vercel** | Next.js frontend deployment |
| **GitHub Actions** | CI/CD pipeline |

---

## 3. DATABASE MODELS

Build the following SQLAlchemy models. Use UUIDs as primary keys throughout.

### User
```python
class User(Base):
    id: UUID (PK)
    email: str (unique)
    username: str (unique)
    hashed_password: str
    avatar_url: str | None
    created_at: datetime
    updated_at: datetime
```

### Quest
```python
class Quest(Base):
    id: UUID (PK)
    user_id: UUID (FK -> User)
    title: str
    description: str | None
    category: Enum["Health", "Knowledge", "Social", "Adventure", "Creativity", "Wealth"]
    difficulty: Enum["Easy", "Medium", "Hard", "Legendary"]
    xp_reward: int  # auto-set: Easy=10, Medium=30, Hard=80, Legendary=200
    quest_type: Enum["one_time", "repeatable", "progress"]
    progress_target: int | None  # for progress quests e.g. 10 cafes
    progress_current: int  # default 0
    arc_id: UUID | None (FK -> QuestArc)
    is_active: bool  # default True
    is_completed: bool  # default False
    created_at: datetime
    completed_at: datetime | None
```

### QuestLog
```python
class QuestLog(Base):
    id: UUID (PK)
    quest_id: UUID (FK -> Quest)
    user_id: UUID (FK -> User)
    date: date
    location_name: str | None
    location_lat: float | None
    location_lng: float | None
    notes: str | None
    mood: int  # 1-5 scale
    xp_earned: int
    tags: list[str]  # stored as ARRAY or JSON
    is_capsule: bool  # default False
    capsule_open_date: date | None
    capsule_opened: bool  # default False
    created_at: datetime
```

### QuestLogPhoto
```python
class QuestLogPhoto(Base):
    id: UUID (PK)
    quest_log_id: UUID (FK -> QuestLog)
    url: str  # R2 URL
    thumbnail_url: str
    order_index: int
    created_at: datetime
```

### CharacterStat
```python
class CharacterStat(Base):
    id: UUID (PK)
    user_id: UUID (FK -> User)
    category: Enum["Health", "Knowledge", "Social", "Adventure", "Creativity", "Wealth"]
    total_xp: int  # default 0
    level: int  # computed, stored for fast reads
    streak_count: int  # default 0
    longest_streak: int  # default 0
    last_active_date: date | None
    # UNIQUE constraint on (user_id, category)
```

### Achievement
```python
class Achievement(Base):
    id: UUID (PK)
    name: str
    description: str
    icon: str  # emoji or image URL
    condition_type: Enum["quest_count", "xp_total", "streak_days", "category_level", "locations_visited"]
    condition_value: int
    condition_category: str | None  # None = applies to all categories
    xp_reward: int
```

### UserAchievement
```python
class UserAchievement(Base):
    id: UUID (PK)
    user_id: UUID (FK -> User)
    achievement_id: UUID (FK -> Achievement)
    unlocked_at: datetime
    # UNIQUE constraint on (user_id, achievement_id)
```

### JournalPage
```python
class JournalPage(Base):
    id: UUID (PK)
    quest_log_id: UUID (FK -> QuestLog, unique)
    layout_template: Enum["grid", "polaroid", "freeform"]  # default "freeform"
    sticker_data: dict  # JSON: [{id, type, x, y, rotation, scale}]
    text_blocks: dict   # JSON: [{content, x, y, font, color, size}]
    background_color: str  # hex, default "1E1E40"
    exported_image_url: str | None
    updated_at: datetime
```

### QuestArc
```python
class QuestArc(Base):
    id: UUID (PK)
    user_id: UUID (FK -> User)
    title: str
    description: str | None
    bonus_xp: int  # awarded on full completion
    badge_icon: str  # emoji
    is_completed: bool
    created_at: datetime
```

### MonthlyReview
```python
class MonthlyReview(Base):
    id: UUID (PK)
    user_id: UUID (FK -> User)
    year: int
    month: int
    quests_completed: int
    xp_earned: int
    top_category: str
    favorite_quest_id: UUID | None
    longest_streak: int
    locations_visited: int
    summary_text: str  # auto-generated narrative
    created_at: datetime
    # UNIQUE constraint on (user_id, year, month)
```

---

## 4. XP & LEVELING LOGIC

### XP per difficulty
```python
XP_MAP = {
    "Easy": 10,
    "Medium": 30,
    "Hard": 80,
    "Legendary": 200
}
```

### Level thresholds (implement as a function)
```python
LEVEL_THRESHOLDS = [0, 100, 250, 500, 1000, 2000, 4000, 8000, 16000, 32000]

def calculate_level(total_xp: int) -> int:
    for level, threshold in enumerate(LEVEL_THRESHOLDS):
        if total_xp < threshold:
            return level  # level index
    return len(LEVEL_THRESHOLDS)  # max level

def xp_to_next_level(total_xp: int) -> dict:
    level = calculate_level(total_xp)
    current_threshold = LEVEL_THRESHOLDS[level - 1] if level > 0 else 0
    next_threshold = LEVEL_THRESHOLDS[level] if level < len(LEVEL_THRESHOLDS) else None
    return {
        "level": level,
        "current_xp": total_xp,
        "xp_in_level": total_xp - current_threshold,
        "xp_needed": (next_threshold - current_threshold) if next_threshold else None,
        "progress_pct": ((total_xp - current_threshold) / (next_threshold - current_threshold) * 100) if next_threshold else 100
    }
```

### Level names
```python
LEVEL_NAMES = {
    1: "The Novice", 2: "The Wanderer", 3: "The Seeker",
    4: "The Adventurer", 5: "The Champion", 6: "The Legend",
    7: "The Mythic", 8: "The Archmage", 9: "The Eternal", 10: "The Legendary"
}
```

### On quest completion — XP flow
1. Add `xp_reward` to `CharacterStat.total_xp` for the quest's category
2. Recalculate and update `CharacterStat.level`
3. Add `xp_reward` to a global `User.total_xp` (add this field)
4. Create a `QuestLog` entry
5. Check and unlock any newly earned achievements
6. Update streak: if `last_active_date` was yesterday → increment `streak_count`, else if > 1 day ago → reset to 1
7. Return a response that includes `{ leveled_up: bool, new_level: int | None, achievements_unlocked: list }`

---

## 5. API ENDPOINTS

All endpoints require JWT auth unless marked public. Base path: `/api/v1`

### Auth
```
POST   /auth/register          — { email, username, password } → { token, user }
POST   /auth/login             — { email, password } → { token, user }
GET    /auth/me                — current user profile
PUT    /auth/me                — update profile (username, avatar)
```

### Quests
```
GET    /quests                 — list quests (filter: category, type, is_active, is_completed)
POST   /quests                 — create quest
GET    /quests/{id}            — single quest detail
PUT    /quests/{id}            — update quest
DELETE /quests/{id}            — soft delete (set is_active=False)
POST   /quests/{id}/complete   — complete quest → triggers XP, log creation, achievement check
                                 body: { notes, mood, location_name, lat, lng, tags }
                                 returns: { quest_log, xp_earned, leveled_up, new_level, achievements_unlocked }
```

### Quest Logs
```
GET    /logs                   — paginated list (filter: quest_id, date_range, mood, tags)
GET    /logs/{id}              — single log with photos and journal page
PUT    /logs/{id}              — update notes, mood, tags
DELETE /logs/{id}              — delete log
POST   /logs/{id}/photos       — upload photos (multipart, max 10 per log)
DELETE /logs/{id}/photos/{photo_id}
POST   /logs/{id}/capsule      — seal as time capsule { open_date }
GET    /logs/capsules          — list all capsule entries (opened and sealed)
```

### Journal / Scrapbook
```
GET    /journal/{log_id}       — get journal page for a log (create if not exists)
PUT    /journal/{log_id}       — update sticker_data, text_blocks, layout, background
POST   /journal/{log_id}/export — render and save as image, return exported_image_url
```

### Character
```
GET    /character              — all stats across all categories + global level
GET    /character/{category}   — single category stats + level progression
GET    /character/overview     — dashboard summary (recent XP, active streaks, next level)
```

### Achievements
```
GET    /achievements           — all achievements with unlocked status and progress
GET    /achievements/recent    — last 5 unlocked
```

### Quest Arcs
```
GET    /arcs                   — list arcs
POST   /arcs                   — create arc
PUT    /arcs/{id}              — update arc
DELETE /arcs/{id}
POST   /arcs/{id}/quests/{quest_id}  — add quest to arc
DELETE /arcs/{id}/quests/{quest_id}  — remove quest from arc
```

### Map
```
GET    /map/pins               — all quest logs with coordinates { id, lat, lng, quest_title, category, date, mood }
GET    /map/pins?category=Adventure&date_from=2024-01-01
```

### Streaks
```
GET    /streaks                — all category streaks + global streak
```

### Monthly Review
```
GET    /reviews                — list all monthly reviews
GET    /reviews/{year}/{month} — get or generate review for that month
POST   /reviews/{year}/{month}/generate — force regenerate
```

### Daily Quest
```
GET    /daily-quest            — get today's random quest suggestion
POST   /daily-quest/accept     — create it as an actual quest in user's board
POST   /daily-quest/skip       — skip today's (once per day)
```

### Uploads
```
POST   /uploads/presign        — get presigned R2 URL for direct client upload
                                 body: { filename, content_type, context: "avatar"|"photo" }
                                 returns: { upload_url, public_url }
```

---

## 6. FRONTEND SCREENS & COMPONENTS

### Screen Map
| Route | Screen | Description |
|-------|--------|-------------|
| `/` | Dashboard | Active quests, XP bar, streaks, recent logs |
| `/quests` | Quest Board | All quests, filters, create button |
| `/quests/new` | Create Quest | Form to create new quest |
| `/quests/[id]` | Quest Detail | Quest info, history, complete button |
| `/complete/[id]` | Complete Quest | Log completion: mood, notes, location, photos |
| `/journal` | Journal Feed | Scrollable card feed of all quest logs |
| `/journal/[logId]` | Journal Page | Single log in scrapbook layout with sticker editor |
| `/character` | Character Sheet | All skill stats, level, radar chart |
| `/achievements` | Achievements | Locked/unlocked grid with progress |
| `/map` | Adventure Map | Leaflet map with quest pins |
| `/review/[year]/[month]` | Monthly Review | Auto-generated life summary |
| `/arcs` | Quest Arcs | Story arc management |
| `/settings` | Settings | Profile, notifications, streak freeze |

### Key Components to Build

**`<XPBar>`** — animated fill bar showing progress to next level. On level-up event, trigger full-screen celebration with Framer Motion (flash, confetti effect, level name display).

**`<QuestCard>`** — displays quest with category color, difficulty badge, XP reward, progress bar for progress-type quests. Click to expand/complete.

**`<StatRadar>`** — Recharts radar/spider chart with all 6 skill categories. Render on character screen.

**`<JournalCard>`** — photo thumbnail + mood emoji + location + notes preview. Used in the journal feed.

**`<StickerEditor>`** — built with dnd-kit. Stickers are draggable items on a canvas over the photo. Sticker types: emojis, decorative shapes, stamps. Save sticker positions to `sticker_data` JSON.

**`<AdventureMap>`** — Leaflet map centered on user's most common location. Pins colored by category. Click pin → show QuestLog preview popup.

**`<MoodPicker>`** — 5-option emoji selector (😔 😐 🙂 😄 🤩) that maps to values 1-5.

**`<StreakBadge>`** — flame icon + count. Shows per-category on dashboard, pulses if streak at risk (not yet active today).

**`<LevelUpOverlay>`** — full screen Framer Motion animation triggered when `leveled_up: true` returns from API. Shows new level name and XP gained.

**`<CapsuleCard>`** — sealed entries show a lock icon and countdown. On open date, they reveal with an animation.

---

## 7. FEATURES — DETAILED LOGIC

### Streak System
- A streak increments when the user completes any quest in a category on consecutive calendar days
- If the user misses a day, streak resets to 1 on next completion (not 0)
- Global streak tracks any quest completion regardless of category
- Show warning badge on dashboard if it's past 6pm and no quest completed today
- **Streak Freeze**: Users can spend 50 XP to protect a streak for 1 day. Store freeze count on `CharacterStat`

### Achievement System — Seed these 12 on first run:
```python
SEED_ACHIEVEMENTS = [
    { name: "First Quest", condition_type: "quest_count", condition_value: 1, xp_reward: 20, icon: "⚔️" },
    { name: "Centurion", condition_type: "quest_count", condition_value: 100, xp_reward: 200, icon: "🏛️" },
    { name: "Explorer", condition_type: "locations_visited", condition_value: 10, xp_reward: 80, icon: "🌍" },
    { name: "Bookworm", condition_type: "quest_count", condition_value: 10, condition_category: "Knowledge", xp_reward: 50, icon: "📚" },
    { name: "Warrior", condition_type: "quest_count", condition_value: 10, condition_category: "Health", xp_reward: 50, icon: "💪" },
    { name: "On Fire", condition_type: "streak_days", condition_value: 7, xp_reward: 100, icon: "🔥" },
    { name: "Unstoppable", condition_type: "streak_days", condition_value: 30, xp_reward: 300, icon: "⚡" },
    { name: "Legendary", condition_type: "quest_count", condition_value: 1, condition_difficulty: "Legendary", xp_reward: 150, icon: "👑" },
    { name: "Memory Keeper", condition_type: "journal_count", condition_value: 20, xp_reward: 60, icon: "📔" },
    { name: "Time Traveller", condition_type: "capsule_opened", condition_value: 1, xp_reward: 100, icon: "⏳" },
    { name: "Champion", condition_type: "category_level", condition_value: 5, xp_reward: 120, icon: "🏆" },
    { name: "Arc Finisher", condition_type: "arc_completed", condition_value: 1, xp_reward: 150, icon: "📖" },
]
```

### Time Capsule
- User seals a QuestLog entry with a future open date
- Celery beat task runs daily: query for capsules where `capsule_open_date <= today AND capsule_opened = False`
- Mark as opened, send in-app notification
- On the journal feed, sealed capsules show a locked UI; opened ones get a special "memory unlocked" reveal animation

### Daily Random Quest
- Maintain a seed list of ~50 spontaneous quest suggestions by category
- Each day, pick one pseudo-randomly (seeded by date so it's consistent for all users that day)
- User can accept (creates a real Easy quest) or skip once
- Store skip state in Redis with a 24h TTL key: `daily_skip:{user_id}:{date}`

### Offline Draft Saving (Frontend)
- On the Complete Quest form, auto-save form state to `localStorage` every 2 seconds
- Key: `draft_complete_{questId}`
- On page load, check for existing draft and restore it with a banner: "You have an unsaved draft — restore?"
- On successful submit, clear the draft key
- Photos: store photo File objects in a separate IndexedDB store (`life-rpg-drafts` database, `photos` object store) since localStorage can't handle binary
- On submit failure due to network error, show: "Saved offline. Will retry when connection returns." — set a flag in localStorage and retry on next page load/focus

### Monthly Review — Auto-generation logic
```python
async def generate_monthly_review(user_id, year, month):
    logs = get_logs_for_month(user_id, year, month)
    quests_completed = len(logs)
    xp_earned = sum(log.xp_earned for log in logs)
    category_counts = Counter(log.quest.category for log in logs)
    top_category = category_counts.most_common(1)[0][0]
    locations = {log.location_name for log in logs if log.location_name}
    moods = [log.mood for log in logs]
    avg_mood = sum(moods) / len(moods) if moods else 0
    favorite_quest = max(logs, key=lambda l: l.xp_earned, default=None)
    summary = build_narrative_text(quests_completed, xp_earned, top_category, locations)
    # save and return MonthlyReview
```

---

## 8. BUILD ORDER (follow strictly)

### Phase 1 — Foundation (build this first, don't skip ahead)
1. Docker Compose setup: FastAPI + PostgreSQL + Redis
2. All SQLAlchemy models + Alembic initial migration
3. JWT auth endpoints (register, login, /me)
4. Quest CRUD endpoints
5. Quest completion endpoint with XP calculation
6. CharacterStat update logic on completion
7. Next.js project scaffold with Tailwind
8. Auth pages (login, register)
9. Basic dashboard showing active quests
10. Quest board with create/complete flow

### Phase 2 — Core Loop
1. QuestLog creation on completion (with mood, notes, location)
2. Photo upload via R2 presigned URLs
3. Streak tracking logic
4. Character stats page with progress bars
5. Achievement seeding + unlock checking on completion
6. Journal feed (list of log cards)
7. Single journal page view

### Phase 3 — Polish
1. Framer Motion: XP bar animation, level-up overlay
2. Recharts radar chart on character screen
3. Leaflet.js adventure map with pins
4. Monthly review generation + screen
5. Offline draft saving (localStorage + IndexedDB for photos)
6. PWA manifest + service worker (Workbox)
7. Mobile-responsive design pass
8. Error states, loading skeletons throughout

### Phase 4 — Advanced
1. Scrapbook sticker editor with dnd-kit
2. Quest Arcs (creation, quest assignment, arc completion bonus)
3. Boss Quests (countdown timer, opt-in XP penalty)
4. Daily random quest system
5. Time Capsule (seal, Celery unlock job, reveal animation)
6. Monthly review shareable image export
7. Friend Guilds (shared quests, side-by-side log comparison)

---

## 9. DESIGN SYSTEM

### Colors
```css
--night:    #0D0D1A;   /* primary background */
--deep:     #12122B;   /* secondary background */
--card:     #1E1E40;   /* card backgrounds */
--purple:   #2D1B6B;   /* accents, headers */
--gold:     #F5A623;   /* primary accent, XP, highlights */
--amber:    #FF8C00;   /* secondary gold */
--red:      #E94560;   /* Health category, alerts */
--teal:     #0FB8AD;   /* Knowledge category */
--violet:   #8B5CF6;   /* Creativity category */
--mint:     #10B981;   /* Social category, success */
--muted:    #8892B0;   /* secondary text */
--offwhite: #F0F0FF;   /* body text */
```

### Category Colors
```
Health      → #E94560 (red)
Knowledge   → #0FB8AD (teal)
Adventure   → #F5A623 (gold)
Creativity  → #8B5CF6 (violet)
Social      → #10B981 (mint)
Wealth      → #FF8C00 (amber)
```

### Typography
- Headings: `Georgia` or `font-serif`
- Body: `Calibri` or `font-sans`
- Monospace labels (XP counts, level numbers): `font-mono`

### Design Rules
- Always dark background — never white UI
- Cards have a subtle `border: 1px solid rgba(255,255,255,0.08)` border
- Category color is always used as a left-border accent on cards for that category
- XP bars: dark track (`#2A2A50`) + colored fill
- Mobile-first: design all layouts for 375px width first, then scale up

---

## 10. ENVIRONMENT VARIABLES NEEDED

```env
# Backend
DATABASE_URL=postgresql://user:pass@localhost:5432/liferpg
REDIS_URL=redis://localhost:6379
SECRET_KEY=your-jwt-secret-256-bit
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=10080

# Cloudflare R2
R2_ACCOUNT_ID=
R2_ACCESS_KEY_ID=
R2_SECRET_ACCESS_KEY=
R2_BUCKET_NAME=liferpg-media
R2_PUBLIC_URL=https://your-r2-public-domain.com

# Celery
CELERY_BROKER_URL=redis://localhost:6379/1
CELERY_RESULT_BACKEND=redis://localhost:6379/2

# Frontend (.env.local)
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
NEXT_PUBLIC_MAP_TILE_URL=https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png
```

---

## 11. DOCKER COMPOSE (starter)

```yaml
version: "3.9"
services:
  db:
    image: postgres:15
    environment:
      POSTGRES_DB: liferpg
      POSTGRES_USER: liferpg
      POSTGRES_PASSWORD: liferpg
    ports: ["5432:5432"]
    volumes: [postgres_data:/var/lib/postgresql/data]

  redis:
    image: redis:7-alpine
    ports: ["6379:6379"]

  api:
    build: ./backend
    ports: ["8000:8000"]
    depends_on: [db, redis]
    environment:
      DATABASE_URL: postgresql://liferpg:liferpg@db:5432/liferpg
      REDIS_URL: redis://redis:6379
    volumes: [./backend:/app]
    command: uvicorn main:app --host 0.0.0.0 --port 8000 --reload

  celery:
    build: ./backend
    depends_on: [db, redis]
    command: celery -A tasks worker --loglevel=info

  celery-beat:
    build: ./backend
    depends_on: [db, redis]
    command: celery -A tasks beat --loglevel=info

  frontend:
    build: ./frontend
    ports: ["3000:3000"]
    depends_on: [api]
    volumes: [./frontend:/app]

volumes:
  postgres_data:
```

---

## 12. KEY BUSINESS RULES (enforce these throughout)

1. **XP is never deducted** — except the optional Boss Quest penalty which is strictly opt-in at quest creation time
2. **Repeatable quests** never set `is_completed = True` — they log each completion as a new QuestLog
3. **Progress quests** increment `progress_current` on each completion log. Set `is_completed = True` only when `progress_current >= progress_target`
4. **One QuestLog per completion** — even repeatable quests create a new log each time
5. **CharacterStat rows** are created automatically (one per category) when a user first earns XP in that category — do not create all 6 upfront
6. **Achievements** are checked after every quest completion — loop through all unearned achievements and check conditions
7. **Monthly reviews** are generated lazily (on first GET request for that month) and cached — never regenerated unless forced
8. **Time capsules**: sealed entries must not be readable via normal log endpoints until `capsule_open_date <= today`. Return `{ is_sealed: true, opens_on: date }` instead of content
9. **Photos** are always uploaded directly to R2 via presigned URL from the client — never proxied through the API server
10. **Offline drafts**: never block the user from navigating away — always auto-save silently

---

## 13. NICE-TO-HAVES (implement only after Phase 3 is fully complete)

- **NPC Mentors**: Each category has a character persona (The Warrior for Health, The Sage for Knowledge) with handcrafted flavor text reactions to level milestones. Store as static JSON config, no AI needed.
- **Seasonal XP Multipliers**: Config table — e.g. "January = Health quests give 1.5x XP". Check multiplier on quest completion.
- **Monthly review shareable card**: Render review as an HTML canvas image using `html2canvas`, allow download/share.
- **Lore Book**: Auto-stitch quest log notes into a monthly narrative paragraph using simple template strings (no AI required).

---

*This prompt was generated from a full architectural design session. Build Phase 1 first. Ship fast. The core loop must feel genuinely fun before any Phase 4 complexity is added.*

*⚔️ Level Up Your Life.*