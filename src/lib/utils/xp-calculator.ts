export interface XPMultipliers {
  isFirstAttempt?: boolean;
  streakDays?: number;
  isPerfectScore?: boolean;
  noHintsUsed?: boolean;
  underParTime?: boolean;
}

const BASE_XP: Record<string, number> = {
  lesson_complete: 50,
  quiz_pass: 100,
  challenge_complete: 150,
  module_complete: 300,
  bronze_cert: 500,
  silver_cert: 1000,
  gold_cert: 2500,
  peer_help: 75,
  streak_bonus: 25,
};

export function calculateXP(activity: string, multipliers: XPMultipliers): number {
  const baseXP = BASE_XP[activity] || 0;
  let totalMultiplier = 1;

  if (multipliers.isFirstAttempt) {
    totalMultiplier *= 1.25;
  }

  if (multipliers.streakDays && multipliers.streakDays > 0) {
    const streakBonus = Math.min(multipliers.streakDays, 30) * 0.01;
    totalMultiplier *= 1 + streakBonus;
  }

  if (multipliers.isPerfectScore) {
    totalMultiplier *= 1.5;
  }

  if (multipliers.noHintsUsed) {
    totalMultiplier *= 1.25;
  }

  if (multipliers.underParTime) {
    totalMultiplier *= 1.1;
  }

  // Cap at 3x
  totalMultiplier = Math.min(totalMultiplier, 3);

  return Math.round(baseXP * totalMultiplier);
}

export function calculateLevelFromXP(xp: number): number {
  // Exponential leveling curve
  // Level 1: 0, Level 10: 5000, Level 25: 25000, Level 50: 100000, Level 100: 500000
  if (xp <= 0) return 1;
  if (xp >= 500000) return 100;

  const level = Math.floor(Math.sqrt(xp / 50)) + 1;
  return Math.min(level, 100);
}

export function getXPForNextLevel(currentLevel: number): number {
  if (currentLevel >= 100) return 0;
  const nextLevel = currentLevel + 1;
  return nextLevel * nextLevel * 50;
}

export function getXPProgressInLevel(totalXP: number): { current: number; required: number; percentage: number } {
  const level = calculateLevelFromXP(totalXP);
  const currentLevelXP = (level - 1) * (level - 1) * 50;
  const nextLevelXP = level * level * 50;

  const current = totalXP - currentLevelXP;
  const required = nextLevelXP - currentLevelXP;
  const percentage = Math.round((current / required) * 100);

  return { current, required, percentage };
}
