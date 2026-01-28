import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TRPCError } from '@trpc/server';
import { gamificationRouter } from '../gamification';

// Mock the database module
vi.mock('@/lib/db/schema', () => ({
  userProfiles: { userId: 'userId', totalXp: 'totalXp', level: 'level', currentStreak: 'currentStreak', longestStreak: 'longestStreak', lastActiveAt: 'lastActiveAt' },
  achievements: { id: 'id' },
  userAchievements: { userId: 'userId', achievementId: 'achievementId', earnedAt: 'earnedAt' },
  xpTransactions: { userId: 'userId', amount: 'amount', reason: 'reason', createdAt: 'createdAt' },
  streakHistory: { userId: 'userId', date: 'date', streakCount: 'streakCount' },
}));

vi.mock('drizzle-orm', () => ({
  eq: vi.fn((a, b) => ({ type: 'eq', field: a, value: b })),
  desc: vi.fn((field) => ({ type: 'desc', field })),
  and: vi.fn((...conditions) => ({ type: 'and', conditions })),
  gte: vi.fn((a, b) => ({ type: 'gte', field: a, value: b })),
  sql: vi.fn(),
}));

// Mock utility functions
vi.mock('@/lib/utils/streak-calculator', () => ({
  calculateStreak: vi.fn(() => 1),
  getStreakReward: vi.fn(() => ({ xp: 0, badge: null })),
}));

vi.mock('@/lib/utils/xp-calculator', () => ({
  calculateLevelFromXP: vi.fn(() => 1),
  getXPProgressInLevel: vi.fn(() => ({ current: 0, required: 50, percentage: 0 })),
}));

// Mock date-fns
vi.mock('date-fns', () => ({
  subDays: vi.fn((date, days) => new Date(date.getTime() - days * 24 * 60 * 60 * 1000)),
  startOfWeek: vi.fn(() => new Date('2024-01-01')),
  startOfMonth: vi.fn(() => new Date('2024-01-01')),
}));

// Helper to create mock context
function createMockContext(user: { id: string; email: string; name: string; role: string; orgId: string | null; teamId: string | null } | null) {
  const mockDb = {
    query: {
      userProfiles: {
        findFirst: vi.fn(),
        findMany: vi.fn(),
      },
      achievements: {
        findMany: vi.fn(),
      },
      userAchievements: {
        findMany: vi.fn(),
      },
      xpTransactions: {
        findMany: vi.fn(),
      },
    },
    insert: vi.fn(() => ({
      values: vi.fn(() => ({
        returning: vi.fn(),
      })),
    })),
    update: vi.fn(() => ({
      set: vi.fn(() => ({
        where: vi.fn(),
      })),
    })),
    select: vi.fn(() => ({
      from: vi.fn(() => ({
        orderBy: vi.fn(() => ({
          limit: vi.fn(),
        })),
      })),
    })),
  };

  return {
    db: mockDb,
    user,
  };
}

// Helper to create authenticated user
function createMockUser() {
  return {
    id: 'user-123',
    email: 'test@example.com',
    name: 'Test User',
    role: 'user',
    orgId: null,
    teamId: null,
  };
}

// Create a caller for the router
function createCaller(ctx: ReturnType<typeof createMockContext>) {
  // We need to create a test caller that mimics tRPC behavior
  // Since the router uses protectedProcedure, we need to simulate the middleware
  return {
    getProfile: async () => {
      if (!ctx.user) {
        throw new TRPCError({ code: 'UNAUTHORIZED' });
      }
      // Call the actual procedure with the context
      const procedure = gamificationRouter._def.procedures.getProfile;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return await (procedure as any)._def.resolver({ ctx: { ...ctx, user: ctx.user } });
    },
    checkStreak: async () => {
      if (!ctx.user) {
        throw new TRPCError({ code: 'UNAUTHORIZED' });
      }
      const procedure = gamificationRouter._def.procedures.checkStreak;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return await (procedure as any)._def.resolver({ ctx: { ...ctx, user: ctx.user } });
    },
    getLeaderboard: async (input: { scope?: 'global' | 'team' | 'organization'; period?: 'weekly' | 'monthly' | 'allTime'; limit?: number }) => {
      if (!ctx.user) {
        throw new TRPCError({ code: 'UNAUTHORIZED' });
      }
      const procedure = gamificationRouter._def.procedures.getLeaderboard;
      const parsedInput = {
        scope: input.scope ?? 'global',
        period: input.period ?? 'weekly',
        limit: input.limit ?? 50,
      };
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return await (procedure as any)._def.resolver({ ctx: { ...ctx, user: ctx.user }, input: parsedInput });
    },
    getAchievements: async () => {
      if (!ctx.user) {
        throw new TRPCError({ code: 'UNAUTHORIZED' });
      }
      const procedure = gamificationRouter._def.procedures.getAchievements;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return await (procedure as any)._def.resolver({ ctx: { ...ctx, user: ctx.user } });
    },
    getXPHistory: async (input: { days?: number }) => {
      if (!ctx.user) {
        throw new TRPCError({ code: 'UNAUTHORIZED' });
      }
      const procedure = gamificationRouter._def.procedures.getXPHistory;
      const parsedInput = { days: input.days ?? 30 };
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return await (procedure as any)._def.resolver({ ctx: { ...ctx, user: ctx.user }, input: parsedInput });
    },
  };
}

describe('gamification router', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('authorization', () => {
    it('getProfile throws UNAUTHORIZED when user is null', async () => {
      const ctx = createMockContext(null);
      const caller = createCaller(ctx);

      await expect(caller.getProfile()).rejects.toThrow(TRPCError);
      await expect(caller.getProfile()).rejects.toMatchObject({
        code: 'UNAUTHORIZED',
      });
    });

    it('checkStreak throws UNAUTHORIZED when user is null', async () => {
      const ctx = createMockContext(null);
      const caller = createCaller(ctx);

      await expect(caller.checkStreak()).rejects.toThrow(TRPCError);
      await expect(caller.checkStreak()).rejects.toMatchObject({
        code: 'UNAUTHORIZED',
      });
    });

    it('getLeaderboard throws UNAUTHORIZED when user is null', async () => {
      const ctx = createMockContext(null);
      const caller = createCaller(ctx);

      await expect(caller.getLeaderboard({})).rejects.toThrow(TRPCError);
      await expect(caller.getLeaderboard({})).rejects.toMatchObject({
        code: 'UNAUTHORIZED',
      });
    });

    it('getAchievements throws UNAUTHORIZED when user is null', async () => {
      const ctx = createMockContext(null);
      const caller = createCaller(ctx);

      await expect(caller.getAchievements()).rejects.toThrow(TRPCError);
      await expect(caller.getAchievements()).rejects.toMatchObject({
        code: 'UNAUTHORIZED',
      });
    });

    it('getXPHistory throws UNAUTHORIZED when user is null', async () => {
      const ctx = createMockContext(null);
      const caller = createCaller(ctx);

      await expect(caller.getXPHistory({})).rejects.toThrow(TRPCError);
      await expect(caller.getXPHistory({})).rejects.toMatchObject({
        code: 'UNAUTHORIZED',
      });
    });
  });

  describe('getProfile', () => {
    it('creates new profile if user has no profile', async () => {
      const user = createMockUser();
      const ctx = createMockContext(user);
      const caller = createCaller(ctx);

      const newProfile = {
        id: 'profile-1',
        userId: user.id,
        totalXp: 0,
        level: 1,
        currentStreak: 0,
        longestStreak: 0,
        lastActiveAt: null,
      };

      // First query returns null (no profile)
      ctx.db.query.userProfiles.findFirst.mockResolvedValueOnce(null);
      // Insert returns new profile
      ctx.db.insert.mockReturnValueOnce({
        values: vi.fn().mockReturnValueOnce({
          returning: vi.fn().mockResolvedValueOnce([newProfile]),
        }),
      });

      const result = await caller.getProfile();

      expect(ctx.db.query.userProfiles.findFirst).toHaveBeenCalled();
      expect(ctx.db.insert).toHaveBeenCalled();
      expect(result).toHaveProperty('levelProgress');
    });

    it('returns existing profile with achievements and xp history', async () => {
      const user = createMockUser();
      const ctx = createMockContext(user);
      const caller = createCaller(ctx);

      const existingProfile = {
        id: 'profile-1',
        userId: user.id,
        totalXp: 1500,
        level: 6,
        currentStreak: 5,
        longestStreak: 10,
        lastActiveAt: new Date(),
      };

      ctx.db.query.userProfiles.findFirst.mockResolvedValueOnce(existingProfile);
      ctx.db.query.userAchievements.findMany.mockResolvedValueOnce([]);
      ctx.db.query.xpTransactions.findMany.mockResolvedValueOnce([]);

      const result = await caller.getProfile();

      expect(ctx.db.query.userProfiles.findFirst).toHaveBeenCalled();
      expect(ctx.db.query.userAchievements.findMany).toHaveBeenCalled();
      expect(ctx.db.query.xpTransactions.findMany).toHaveBeenCalled();
      expect(result).toHaveProperty('totalXp', 1500);
      expect(result).toHaveProperty('level');
      expect(result).toHaveProperty('levelProgress');
      expect(result).toHaveProperty('achievements');
      expect(result).toHaveProperty('recentXP');
    });
  });

  describe('checkStreak', () => {
    it('throws NOT_FOUND if profile does not exist', async () => {
      const user = createMockUser();
      const ctx = createMockContext(user);
      const caller = createCaller(ctx);

      ctx.db.query.userProfiles.findFirst.mockResolvedValueOnce(null);

      await expect(caller.checkStreak()).rejects.toThrow(TRPCError);
      await expect(caller.checkStreak()).rejects.toMatchObject({
        code: 'NOT_FOUND',
      });
    });

    it('returns streak info when profile exists', async () => {
      const user = createMockUser();
      const ctx = createMockContext(user);
      const caller = createCaller(ctx);

      const profile = {
        id: 'profile-1',
        userId: user.id,
        totalXp: 100,
        level: 2,
        currentStreak: 3,
        longestStreak: 5,
        lastActiveAt: new Date(),
      };

      ctx.db.query.userProfiles.findFirst.mockResolvedValue(profile);
      ctx.db.update.mockReturnValue({
        set: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue(undefined),
        }),
      });
      ctx.db.insert.mockReturnValue({
        values: vi.fn().mockResolvedValue(undefined),
      });

      const result = await caller.checkStreak();

      expect(result).toHaveProperty('streak');
      expect(result).toHaveProperty('streakChanged');
      expect(result).toHaveProperty('streakIncreased');
      expect(result).toHaveProperty('reward');
    });
  });

  describe('getLeaderboard', () => {
    it('returns leaderboard with user rank', async () => {
      const user = createMockUser();
      const ctx = createMockContext(user);
      const caller = createCaller(ctx);

      const leaderboardData = [
        { userId: 'other-1', totalXp: 5000, level: 10, currentStreak: 15 },
        { userId: user.id, totalXp: 3000, level: 8, currentStreak: 5 },
        { userId: 'other-2', totalXp: 1000, level: 5, currentStreak: 2 },
      ];

      ctx.db.select.mockReturnValueOnce({
        from: vi.fn().mockReturnValueOnce({
          orderBy: vi.fn().mockReturnValueOnce({
            limit: vi.fn().mockResolvedValueOnce(leaderboardData),
          }),
        }),
      });

      const result = await caller.getLeaderboard({ scope: 'global', period: 'weekly', limit: 50 });

      expect(result).toHaveProperty('leaderboard');
      expect(result).toHaveProperty('userRank');
      expect(result.leaderboard).toHaveLength(3);
      expect(result.userRank).toBe(2); // User is in second position
    });

    it('returns null userRank when user not in leaderboard', async () => {
      const user = createMockUser();
      const ctx = createMockContext(user);
      const caller = createCaller(ctx);

      const leaderboardData = [
        { userId: 'other-1', totalXp: 5000, level: 10, currentStreak: 15 },
        { userId: 'other-2', totalXp: 3000, level: 8, currentStreak: 5 },
      ];

      ctx.db.select.mockReturnValueOnce({
        from: vi.fn().mockReturnValueOnce({
          orderBy: vi.fn().mockReturnValueOnce({
            limit: vi.fn().mockResolvedValueOnce(leaderboardData),
          }),
        }),
      });

      const result = await caller.getLeaderboard({});

      expect(result.userRank).toBeNull();
    });
  });

  describe('getAchievements', () => {
    it('returns all achievements with earned status', async () => {
      const user = createMockUser();
      const ctx = createMockContext(user);
      const caller = createCaller(ctx);

      const allAchievements = [
        { id: 'ach-1', name: 'First Steps', description: 'Complete first lesson', xpReward: 100 },
        { id: 'ach-2', name: 'Week Warrior', description: '7 day streak', xpReward: 500 },
      ];

      const earnedAchievements = [
        { achievementId: 'ach-1', userId: user.id, earnedAt: new Date() },
      ];

      ctx.db.query.achievements.findMany.mockResolvedValueOnce(allAchievements);
      ctx.db.query.userAchievements.findMany.mockResolvedValueOnce(earnedAchievements);

      const result = await caller.getAchievements();

      expect(result).toHaveLength(2);
      expect(result[0]).toHaveProperty('earned', true);
      expect(result[0]).toHaveProperty('earnedAt');
      expect(result[1]).toHaveProperty('earned', false);
      expect(result[1].earnedAt).toBeUndefined();
    });
  });

  describe('getXPHistory', () => {
    it('returns XP transactions grouped by day', async () => {
      const user = createMockUser();
      const ctx = createMockContext(user);
      const caller = createCaller(ctx);

      const transactions = [
        { id: 'tx-1', userId: user.id, amount: 100, reason: 'lesson_complete', createdAt: new Date('2024-01-15T10:00:00Z') },
        { id: 'tx-2', userId: user.id, amount: 50, reason: 'quiz_pass', createdAt: new Date('2024-01-15T14:00:00Z') },
        { id: 'tx-3', userId: user.id, amount: 75, reason: 'streak_bonus', createdAt: new Date('2024-01-14T09:00:00Z') },
      ];

      ctx.db.query.xpTransactions.findMany.mockResolvedValueOnce(transactions);

      const result = await caller.getXPHistory({ days: 30 });

      expect(result).toHaveProperty('transactions');
      expect(result).toHaveProperty('dailyTotals');
      expect(result).toHaveProperty('totalEarned');
      expect(result.transactions).toHaveLength(3);
      expect(result.totalEarned).toBe(225);
      expect(result.dailyTotals['2024-01-15']).toBe(150); // 100 + 50
      expect(result.dailyTotals['2024-01-14']).toBe(75);
    });

    it('returns empty results when no XP history', async () => {
      const user = createMockUser();
      const ctx = createMockContext(user);
      const caller = createCaller(ctx);

      ctx.db.query.xpTransactions.findMany.mockResolvedValueOnce([]);

      const result = await caller.getXPHistory({ days: 7 });

      expect(result.transactions).toHaveLength(0);
      expect(result.totalEarned).toBe(0);
      expect(Object.keys(result.dailyTotals)).toHaveLength(0);
    });
  });

  describe('router structure', () => {
    it('has all expected procedures', () => {
      expect(gamificationRouter._def.procedures).toHaveProperty('getProfile');
      expect(gamificationRouter._def.procedures).toHaveProperty('checkStreak');
      expect(gamificationRouter._def.procedures).toHaveProperty('getLeaderboard');
      expect(gamificationRouter._def.procedures).toHaveProperty('getAchievements');
      expect(gamificationRouter._def.procedures).toHaveProperty('getXPHistory');
    });

    it('getLeaderboard has input validation', () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const procedure = gamificationRouter._def.procedures.getLeaderboard as any;
      expect(procedure._def.inputs).toBeDefined();
      expect(procedure._def.inputs.length).toBeGreaterThan(0);
    });

    it('getXPHistory has input validation', () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const procedure = gamificationRouter._def.procedures.getXPHistory as any;
      expect(procedure._def.inputs).toBeDefined();
      expect(procedure._def.inputs.length).toBeGreaterThan(0);
    });
  });
});
