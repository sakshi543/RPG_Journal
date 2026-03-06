export const LEVEL_THRESHOLDS = [0, 100, 250, 500, 1000, 2000, 4000, 8000, 16000, 32000];

export function calculateLevel(totalXp: number) {
  for (let level = 0; level < LEVEL_THRESHOLDS.length; level++) {
    const threshold = LEVEL_THRESHOLDS[level];
    if (totalXp < threshold) return level;
  }
  return LEVEL_THRESHOLDS.length;
}

export function xpToNextLevel(totalXp: number) {
  const level = calculateLevel(totalXp);
  const currentThreshold = level > 0 ? LEVEL_THRESHOLDS[level - 1] : 0;
  const nextThreshold = level < LEVEL_THRESHOLDS.length ? LEVEL_THRESHOLDS[level] : null;
  const xpInLevel = totalXp - currentThreshold;
  const xpNeeded = nextThreshold !== null ? nextThreshold - currentThreshold : null;
  return { level, xpInLevel, xpNeeded, currentThreshold, nextThreshold };
}

