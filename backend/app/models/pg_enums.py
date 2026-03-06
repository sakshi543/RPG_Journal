from __future__ import annotations

from sqlalchemy import Enum

from app.models.enums import (
    AchievementConditionType,
    Category,
    Difficulty,
    JournalLayoutTemplate,
    QuestType,
)


CATEGORY_ENUM = Enum(Category, name="category")
DIFFICULTY_ENUM = Enum(Difficulty, name="difficulty")
QUEST_TYPE_ENUM = Enum(QuestType, name="quest_type")
JOURNAL_LAYOUT_TEMPLATE_ENUM = Enum(JournalLayoutTemplate, name="journal_layout_template")
ACHIEVEMENT_CONDITION_TYPE_ENUM = Enum(AchievementConditionType, name="achievement_condition_type")

