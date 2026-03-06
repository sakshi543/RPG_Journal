from __future__ import annotations

from dataclasses import dataclass


XP_MAP: dict[str, int] = {
    "Easy": 10,
    "Medium": 30,
    "Hard": 80,
    "Legendary": 200,
}

LEVEL_THRESHOLDS: list[int] = [0, 100, 250, 500, 1000, 2000, 4000, 8000, 16000, 32000]

LEVEL_NAMES: dict[int, str] = {
    1: "The Novice",
    2: "The Wanderer",
    3: "The Seeker",
    4: "The Adventurer",
    5: "The Champion",
    6: "The Legend",
    7: "The Mythic",
    8: "The Archmage",
    9: "The Eternal",
    10: "The Legendary",
}


def calculate_level(total_xp: int) -> int:
    for level, threshold in enumerate(LEVEL_THRESHOLDS):
        if total_xp < threshold:
            return level
    return len(LEVEL_THRESHOLDS)


@dataclass(frozen=True)
class XpToNextLevel:
    level: int
    current_xp: int
    xp_in_level: int
    xp_needed: int | None
    progress_pct: float


def xp_to_next_level(total_xp: int) -> XpToNextLevel:
    level = calculate_level(total_xp)
    current_threshold = LEVEL_THRESHOLDS[level - 1] if level > 0 else 0
    next_threshold = LEVEL_THRESHOLDS[level] if level < len(LEVEL_THRESHOLDS) else None
    xp_needed = (next_threshold - current_threshold) if next_threshold is not None else None
    progress_pct = (
        ((total_xp - current_threshold) / (next_threshold - current_threshold) * 100)
        if next_threshold is not None
        else 100.0
    )
    return XpToNextLevel(
        level=level,
        current_xp=total_xp,
        xp_in_level=total_xp - current_threshold,
        xp_needed=xp_needed,
        progress_pct=progress_pct,
    )


def level_name(level: int) -> str:
    return LEVEL_NAMES.get(level, f"Level {level}")

