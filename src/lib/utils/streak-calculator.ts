import { startOfDay, subDays, isSameDay, isBefore } from 'date-fns';
import { toZonedTime } from 'date-fns-tz';

export function calculateStreak(
  lastActiveAt: Date | null,
  currentStreak: number,
  timezone: string = 'UTC'
): number {
  const now = new Date();
  const today = startOfDay(toZonedTime(now, timezone));
  const yesterday = subDays(today, 1);

  if (!lastActiveAt) {
    return 1; // First activity
  }

  const lastActiveDay = startOfDay(toZonedTime(lastActiveAt, timezone));

  if (isSameDay(lastActiveDay, today)) {
    // Already active today, maintain streak
    return currentStreak;
  }

  if (isSameDay(lastActiveDay, yesterday)) {
    // Active yesterday, continue streak
    return currentStreak + 1;
  }

  // Streak broken
  return 1;
}

export function shouldBreakStreak(lastActiveAt: Date | null): boolean {
  if (!lastActiveAt) return false;

  const now = new Date();
  const today = startOfDay(now);
  const yesterday = subDays(today, 1);
  const lastActiveDay = startOfDay(lastActiveAt);

  // Grace period: 3 hours into new day
  const graceHours = 3;
  const hoursIntoDay = now.getHours();

  if (hoursIntoDay < graceHours && isSameDay(lastActiveDay, yesterday)) {
    return false;
  }

  return isBefore(lastActiveDay, yesterday);
}

export function getStreakFreeze(
  currentStreak: number,
  freezesAvailable: number
): { newStreak: number; freezesRemaining: number; freezeUsed: boolean } {
  if (freezesAvailable > 0) {
    return {
      newStreak: currentStreak,
      freezesRemaining: freezesAvailable - 1,
      freezeUsed: true,
    };
  }

  return {
    newStreak: 1,
    freezesRemaining: 0,
    freezeUsed: false,
  };
}

export function getStreakReward(streakDays: number): { xp: number; badge: string | null } {
  if (streakDays === 7) {
    return { xp: 500, badge: 'week_warrior' };
  }
  if (streakDays === 14) {
    return { xp: 1000, badge: 'two_week_champion' };
  }
  if (streakDays === 30) {
    return { xp: 2500, badge: 'monthly_master' };
  }
  if (streakDays === 100) {
    return { xp: 10000, badge: 'centurion' };
  }
  return { xp: 0, badge: null };
}
