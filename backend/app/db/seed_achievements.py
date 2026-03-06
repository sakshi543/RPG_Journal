"""Seed default achievements on first run."""
from __future__ import annotations

from sqlalchemy import select

from app.db.session import SessionLocal
from app.models.achievement import Achievement
from app.models.enums import AchievementConditionType


SEED_ACHIEVEMENTS = [
    {"name": "First Quest", "description": "Complete your first quest", "condition_type": AchievementConditionType.quest_count, "condition_value": 1, "xp_reward": 20, "icon": "⚔️"},
    {"name": "Centurion", "description": "Complete 100 quests", "condition_type": AchievementConditionType.quest_count, "condition_value": 100, "xp_reward": 200, "icon": "🏛️"},
    {"name": "Explorer", "description": "Visit 10 different locations", "condition_type": AchievementConditionType.locations_visited, "condition_value": 10, "xp_reward": 80, "icon": "🌍"},
    {"name": "Bookworm", "description": "Complete 10 Knowledge quests", "condition_type": AchievementConditionType.quest_count, "condition_value": 10, "condition_category": "Knowledge", "xp_reward": 50, "icon": "📚"},
    {"name": "Warrior", "description": "Complete 10 Health quests", "condition_type": AchievementConditionType.quest_count, "condition_value": 10, "condition_category": "Health", "xp_reward": 50, "icon": "💪"},
    {"name": "On Fire", "description": "7-day streak", "condition_type": AchievementConditionType.streak_days, "condition_value": 7, "xp_reward": 100, "icon": "🔥"},
    {"name": "Unstoppable", "description": "30-day streak", "condition_type": AchievementConditionType.streak_days, "condition_value": 30, "xp_reward": 300, "icon": "⚡"},
    {"name": "Legendary", "description": "Complete a Legendary quest", "condition_type": AchievementConditionType.quest_count, "condition_value": 1, "condition_difficulty": "Legendary", "xp_reward": 150, "icon": "👑"},
    {"name": "Memory Keeper", "description": "Create 20 journal entries", "condition_type": AchievementConditionType.journal_count, "condition_value": 20, "xp_reward": 60, "icon": "📔"},
    {"name": "Time Traveller", "description": "Open a time capsule", "condition_type": AchievementConditionType.capsule_opened, "condition_value": 1, "xp_reward": 100, "icon": "⏳"},
    {"name": "Champion", "description": "Reach level 5 in any category", "condition_type": AchievementConditionType.category_level, "condition_value": 5, "xp_reward": 120, "icon": "🏆"},
    {"name": "Arc Finisher", "description": "Complete a quest arc", "condition_type": AchievementConditionType.arc_completed, "condition_value": 1, "xp_reward": 150, "icon": "📖"},
]


def seed_achievements() -> None:
    db = SessionLocal()
    try:
        existing = db.execute(select(Achievement)).scalars().first()
        if existing:
            return
        for a in SEED_ACHIEVEMENTS:
            ach = Achievement(
                name=a["name"],
                description=a["description"],
                icon=a["icon"],
                condition_type=a["condition_type"],
                condition_value=a["condition_value"],
                condition_category=a.get("condition_category"),
                condition_difficulty=a.get("condition_difficulty"),
                xp_reward=a["xp_reward"],
            )
            db.add(ach)
        db.commit()
    finally:
        db.close()
