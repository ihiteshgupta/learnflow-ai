import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  calculateStreak,
  shouldBreakStreak,
  getStreakFreeze,
  getStreakReward,
} from '../streak-calculator';

describe('streak-calculator', () => {
  describe('calculateStreak', () => {
    beforeEach(() => {
      // Mock time to 2024-01-15 12:00:00 UTC
      vi.useFakeTimers();
      vi.setSystemTime(new Date('2024-01-15T12:00:00.000Z'));
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('returns 1 for first activity (null lastActiveAt)', () => {
      const result = calculateStreak(null, 0);
      expect(result).toBe(1);
    });

    it('maintains streak when already active today', () => {
      const today = new Date('2024-01-15T08:00:00.000Z');
      const result = calculateStreak(today, 5);
      expect(result).toBe(5);
    });

    it('increments streak when last active yesterday', () => {
      const yesterday = new Date('2024-01-14T20:00:00.000Z');
      const result = calculateStreak(yesterday, 5);
      expect(result).toBe(6);
    });

    it('resets streak to 1 when gap is more than 1 day', () => {
      const twoDaysAgo = new Date('2024-01-13T12:00:00.000Z');
      const result = calculateStreak(twoDaysAgo, 10);
      expect(result).toBe(1);
    });

    it('resets streak to 1 when gap is a week', () => {
      const weekAgo = new Date('2024-01-08T12:00:00.000Z');
      const result = calculateStreak(weekAgo, 50);
      expect(result).toBe(1);
    });

    it('handles timezone correctly', () => {
      // 2024-01-15 12:00 UTC = 2024-01-15 07:00 EST
      // Yesterday in EST would be 2024-01-14
      const yesterdayEST = new Date('2024-01-14T10:00:00.000Z'); // Still Jan 14 in EST
      const result = calculateStreak(yesterdayEST, 3, 'America/New_York');
      expect(result).toBe(4);
    });

    it('handles activity at end of day correctly', () => {
      const lastNightLate = new Date('2024-01-14T23:59:00.000Z');
      const result = calculateStreak(lastNightLate, 7);
      expect(result).toBe(8);
    });

    it('handles activity at start of day correctly', () => {
      const todayEarly = new Date('2024-01-15T00:01:00.000Z');
      const result = calculateStreak(todayEarly, 7);
      expect(result).toBe(7);
    });

    it('returns 1 for first activity with any timezone', () => {
      const result = calculateStreak(null, 0, 'Asia/Tokyo');
      expect(result).toBe(1);
    });
  });

  describe('shouldBreakStreak', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('returns false for null lastActiveAt', () => {
      vi.setSystemTime(new Date('2024-01-15T12:00:00.000Z'));
      const result = shouldBreakStreak(null);
      expect(result).toBe(false);
    });

    it('returns false when last active today', () => {
      vi.setSystemTime(new Date('2024-01-15T12:00:00.000Z'));
      const today = new Date('2024-01-15T08:00:00.000Z');
      const result = shouldBreakStreak(today);
      expect(result).toBe(false);
    });

    it('returns false when last active yesterday', () => {
      vi.setSystemTime(new Date('2024-01-15T12:00:00.000Z'));
      const yesterday = new Date('2024-01-14T20:00:00.000Z');
      const result = shouldBreakStreak(yesterday);
      expect(result).toBe(false);
    });

    it('returns true when gap is more than 1 day', () => {
      vi.setSystemTime(new Date('2024-01-15T12:00:00.000Z'));
      const twoDaysAgo = new Date('2024-01-13T12:00:00.000Z');
      const result = shouldBreakStreak(twoDaysAgo);
      expect(result).toBe(true);
    });

    it('returns true when last active a week ago', () => {
      vi.setSystemTime(new Date('2024-01-15T12:00:00.000Z'));
      const weekAgo = new Date('2024-01-08T12:00:00.000Z');
      const result = shouldBreakStreak(weekAgo);
      expect(result).toBe(true);
    });

    describe('grace period (first 3 hours of day)', () => {
      it('returns false within grace period when last active yesterday', () => {
        // Set time to 2am - within grace period
        vi.setSystemTime(new Date('2024-01-15T02:00:00.000Z'));
        const yesterday = new Date('2024-01-14T20:00:00.000Z');
        const result = shouldBreakStreak(yesterday);
        expect(result).toBe(false);
      });

      it('returns false at exactly 2:59am when last active yesterday', () => {
        vi.setSystemTime(new Date('2024-01-15T02:59:00.000Z'));
        const yesterday = new Date('2024-01-14T20:00:00.000Z');
        const result = shouldBreakStreak(yesterday);
        expect(result).toBe(false);
      });

      it('returns false at 3am+ when last active yesterday (yesterday still counts)', () => {
        // At 3am, the grace period ends, but if last active yesterday,
        // it should still return false because yesterday is not before yesterday
        vi.setSystemTime(new Date('2024-01-15T03:00:00.000Z'));
        const yesterday = new Date('2024-01-14T20:00:00.000Z');
        const result = shouldBreakStreak(yesterday);
        expect(result).toBe(false);
      });

      it('returns true within grace period when last active 3+ days ago', () => {
        // Use a larger gap to avoid timezone edge cases
        vi.setSystemTime(new Date('2024-01-15T02:00:00.000Z'));
        const threeDaysAgo = new Date('2024-01-12T12:00:00.000Z');
        const result = shouldBreakStreak(threeDaysAgo);
        expect(result).toBe(true);
      });
    });
  });

  describe('getStreakFreeze', () => {
    it('uses freeze when available', () => {
      const result = getStreakFreeze(10, 2);
      expect(result).toEqual({
        newStreak: 10,
        freezesRemaining: 1,
        freezeUsed: true,
      });
    });

    it('maintains streak when freeze is used', () => {
      const result = getStreakFreeze(50, 1);
      expect(result).toEqual({
        newStreak: 50,
        freezesRemaining: 0,
        freezeUsed: true,
      });
    });

    it('resets streak when no freezes available', () => {
      const result = getStreakFreeze(25, 0);
      expect(result).toEqual({
        newStreak: 1,
        freezesRemaining: 0,
        freezeUsed: false,
      });
    });

    it('decrements freezes correctly', () => {
      const result = getStreakFreeze(5, 5);
      expect(result.freezesRemaining).toBe(4);
    });

    it('handles large streak values', () => {
      const result = getStreakFreeze(365, 1);
      expect(result).toEqual({
        newStreak: 365,
        freezesRemaining: 0,
        freezeUsed: true,
      });
    });

    it('handles streak of 1 with no freezes', () => {
      const result = getStreakFreeze(1, 0);
      expect(result).toEqual({
        newStreak: 1,
        freezesRemaining: 0,
        freezeUsed: false,
      });
    });
  });

  describe('getStreakReward', () => {
    it('returns week_warrior badge at 7 days', () => {
      const result = getStreakReward(7);
      expect(result).toEqual({
        xp: 500,
        badge: 'week_warrior',
      });
    });

    it('returns two_week_champion badge at 14 days', () => {
      const result = getStreakReward(14);
      expect(result).toEqual({
        xp: 1000,
        badge: 'two_week_champion',
      });
    });

    it('returns monthly_master badge at 30 days', () => {
      const result = getStreakReward(30);
      expect(result).toEqual({
        xp: 2500,
        badge: 'monthly_master',
      });
    });

    it('returns centurion badge at 100 days', () => {
      const result = getStreakReward(100);
      expect(result).toEqual({
        xp: 10000,
        badge: 'centurion',
      });
    });

    it('returns no reward for non-milestone days', () => {
      const nonMilestones = [1, 2, 6, 8, 13, 15, 29, 31, 99, 101, 200];

      for (const day of nonMilestones) {
        const result = getStreakReward(day);
        expect(result).toEqual({ xp: 0, badge: null });
      }
    });

    it('returns no reward for day 0', () => {
      const result = getStreakReward(0);
      expect(result).toEqual({ xp: 0, badge: null });
    });

    it('returns no reward for negative days', () => {
      const result = getStreakReward(-5);
      expect(result).toEqual({ xp: 0, badge: null });
    });
  });
});
