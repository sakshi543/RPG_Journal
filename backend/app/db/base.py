from app.db.base_class import Base

# Import all models here for Alembic autogeneration
from app.models.achievement import Achievement  # noqa: F401
from app.models.character_stat import CharacterStat  # noqa: F401
from app.models.journal_page import JournalPage  # noqa: F401
from app.models.quest import Quest  # noqa: F401
from app.models.quest_log import QuestLog  # noqa: F401
from app.models.quest_log_photo import QuestLogPhoto  # noqa: F401
from app.models.user import User  # noqa: F401
from app.models.user_achievement import UserAchievement  # noqa: F401

