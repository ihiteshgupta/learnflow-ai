import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { router, protectedProcedure } from '../trpc';
import { userProfiles, userAchievements, xpTransactions, streakHistory } from '@/lib/db/schema';
import { eq, desc, and, gte, sql } from 'drizzle-orm';
import { calculateStreak, getStreakReward } from '@/lib/utils/streak-calculator';
import { calculateLevelFromXP, getXPProgressInLevel } from '@/lib/utils/xp-calculator';
import { subDays, startOfWeek, startOfMonth } from 'date-fns';

export const gamificationRouter = router({
  getProfile: protectedProcedure.query(async ({ ctx }) => {
    const profile = await ctx.db.query.userProfiles.findFirst({
      where: eq(userProfiles.userId, ctx.user.id),
    });

    if (!profile) {
      // Create profile if doesn't exist
      const [newProfile] = await ctx.db
        .insert(userProfiles)
        .values({ userId: ctx.user.id })
        .returning();

      return {
        ...newProfile,
        levelProgress: getXPProgressInLevel(0),
      };
    }

    const earnedAchievements = await ctx.db.query.userAchievements.findMany({
      where: eq(userAchievements.userId, ctx.user.id),
      with: { achievement: true },
    });

    const recentXP = await ctx.db.query.xpTransactions.findMany({
      where: eq(xpTransactions.userId, ctx.user.id),
      orderBy: [desc(xpTransactions.createdAt)],
      limit: 10,
    });

    return {
      ...profile,
      level: calculateLevelFromXP(profile.totalXp),
      levelProgress: getXPProgressInLevel(profile.totalXp),
      achievements: earnedAchievements,
      recentXP,
    };
  }),

  checkStreak: protectedProcedure.mutation(async ({ ctx }) => {
    const profile = await ctx.db.query.userProfiles.findFirst({
      where: eq(userProfiles.userId, ctx.user.id),
    });

    if (!profile) {
      throw new TRPCError({ code: 'NOT_FOUND', message: 'Profile not found' });
    }

    const newStreak = calculateStreak(
      profile.lastActiveAt,
      profile.currentStreak
    );

    const streakChanged = newStreak !== profile.currentStreak;
    const streakIncreased = newStreak > profile.currentStreak;

    // Update streak
    await ctx.db
      .update(userProfiles)
      .set({
        currentStreak: newStreak,
        longestStreak: sql`GREATEST(${userProfiles.longestStreak}, ${newStreak})`,
        lastActiveAt: new Date(),
      })
      .where(eq(userProfiles.userId, ctx.user.id));

    // Record streak history
    await ctx.db.insert(streakHistory).values({
      userId: ctx.user.id,
      date: new Date(),
      streakCount: newStreak,
    });

    // Award streak rewards
    let reward = null;
    if (streakIncreased) {
      const streakReward = getStreakReward(newStreak);
      if (streakReward.xp > 0) {
        await ctx.db.insert(xpTransactions).values({
          userId: ctx.user.id,
          amount: streakReward.xp,
          reason: `streak_${newStreak}_days`,
        });

        await ctx.db
          .update(userProfiles)
          .set({
            totalXp: sql`${userProfiles.totalXp} + ${streakReward.xp}`,
          })
          .where(eq(userProfiles.userId, ctx.user.id));

        reward = streakReward;
      }
    }

    return {
      streak: newStreak,
      streakChanged,
      streakIncreased,
      reward,
    };
  }),

  getLeaderboard: protectedProcedure
    .input(z.object({
      scope: z.enum(['global', 'team', 'organization']).default('global'),
      period: z.enum(['weekly', 'monthly', 'allTime']).default('weekly'),
      limit: z.number().min(1).max(100).default(50),
    }))
    .query(async ({ ctx, input }) => {
      const _periodStart = input.period === 'weekly'
        ? startOfWeek(new Date())
        : input.period === 'monthly'
        ? startOfMonth(new Date())
        : new Date(0);

      // For now, simplified global leaderboard
      const leaderboard = await ctx.db
        .select({
          userId: userProfiles.userId,
          totalXp: userProfiles.totalXp,
          level: userProfiles.level,
          currentStreak: userProfiles.currentStreak,
        })
        .from(userProfiles)
        .orderBy(desc(userProfiles.totalXp))
        .limit(input.limit);

      // Find current user's rank
      const userRank = leaderboard.findIndex((l) => l.userId === ctx.user.id) + 1;

      return {
        leaderboard,
        userRank: userRank > 0 ? userRank : null,
      };
    }),

  getAchievements: protectedProcedure.query(async ({ ctx }) => {
    const allAchievements = await ctx.db.query.achievements.findMany();

    const earned = await ctx.db.query.userAchievements.findMany({
      where: eq(userAchievements.userId, ctx.user.id),
    });

    const earnedIds = new Set(earned.map((e) => e.achievementId));

    return allAchievements.map((a) => ({
      ...a,
      earned: earnedIds.has(a.id),
      earnedAt: earned.find((e) => e.achievementId === a.id)?.earnedAt,
    }));
  }),

  getXPHistory: protectedProcedure
    .input(z.object({
      days: z.number().min(1).max(90).default(30),
    }))
    .query(async ({ ctx, input }) => {
      const startDate = subDays(new Date(), input.days);

      const history = await ctx.db.query.xpTransactions.findMany({
        where: and(
          eq(xpTransactions.userId, ctx.user.id),
          gte(xpTransactions.createdAt, startDate)
        ),
        orderBy: [desc(xpTransactions.createdAt)],
      });

      // Group by day
      const byDay: Record<string, number> = {};
      history.forEach((h) => {
        const day = h.createdAt.toISOString().split('T')[0];
        byDay[day] = (byDay[day] || 0) + h.amount;
      });

      return {
        transactions: history,
        dailyTotals: byDay,
        totalEarned: history.reduce((sum, h) => sum + h.amount, 0),
      };
    }),
});
