from __future__ import annotations

import enum


class Category(str, enum.Enum):
    Health = "Health"
    Knowledge = "Knowledge"
    Social = "Social"
    Adventure = "Adventure"
    Creativity = "Creativity"
    Wealth = "Wealth"


class Difficulty(str, enum.Enum):
    Easy = "Easy"
    Medium = "Medium"
    Hard = "Hard"
    Legendary = "Legendary"


class QuestType(str, enum.Enum):
    one_time = "one_time"
    repeatable = "repeatable"
    progress = "progress"


class JournalLayoutTemplate(str, enum.Enum):
    grid = "grid"
    polaroid = "polaroid"
    freeform = "freeform"


class AchievementConditionType(str, enum.Enum):
    quest_count = "quest_count"
    xp_total = "xp_total"
    streak_days = "streak_days"
    category_level = "category_level"
    locations_visited = "locations_visited"
    journal_count = "journal_count"
    capsule_opened = "capsule_opened"
    arc_completed = "arc_completed"

