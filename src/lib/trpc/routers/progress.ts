import { z } from 'zod';
import { router, protectedProcedure } from '../trpc';
import { progress, userProfiles, xpTransactions } from '@/lib/db/schema';
import { eq, and, sql } from 'drizzle-orm';
import { calculateXP } from '@/lib/utils/xp-calculator';

export const progressRouter = router({
  updateProgress: protectedProcedure
    .input(z.object({
      lessonId: z.string().uuid(),
      status: z.enum(['in_progress', 'completed']),
      score: z.number().min(0).max(100).optional(),
      timeSpent: z.number().min(0),
      hintsUsed: z.number().min(0).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      // Get existing progress
      const existing = await ctx.db.query.progress.findFirst({
        where: and(
          eq(progress.userId, ctx.user.id),
          eq(progress.lessonId, input.lessonId)
        ),
      });

      const isFirstCompletion = !existing || existing.status !== 'completed';

      // Update progress
      const [updated] = await ctx.db
        .insert(progress)
        .values({
          userId: ctx.user.id,
          lessonId: input.lessonId,
          status: input.status,
          score: input.score,
          timeSpentSeconds: input.timeSpent,
          completedAt: input.status === 'completed' ? new Date() : null,
          metadata: { hintsUsed: input.hintsUsed },
        })
        .onConflictDoUpdate({
          target: [progress.userId, progress.lessonId],
          set: {
            status: input.status,
            score: input.score,
            timeSpentSeconds: sql`${progress.timeSpentSeconds} + ${input.timeSpent}`,
            attempts: sql`${progress.attempts} + 1`,
            completedAt: input.status === 'completed' ? new Date() : progress.completedAt,
            updatedAt: new Date(),
          },
        })
        .returning();

      // Award XP if completed for first time
      if (input.status === 'completed' && isFirstCompletion) {
        const profile = await ctx.db.query.userProfiles.findFirst({
          where: eq(userProfiles.userId, ctx.user.id),
        });

        const xpAmount = calculateXP('lesson_complete', {
          isFirstAttempt: !existing,
          streakDays: profile?.currentStreak || 0,
          isPerfectScore: input.score === 100,
          noHintsUsed: (input.hintsUsed || 0) === 0,
        });

        // Record XP transaction
        await ctx.db.insert(xpTransactions).values({
          userId: ctx.user.id,
          amount: xpAmount,
          reason: 'lesson_complete',
          sourceType: 'lesson',
          sourceId: input.lessonId,
        });

        // Update user profile
        await ctx.db
          .update(userProfiles)
          .set({
            totalXp: sql`${userProfiles.totalXp} + ${xpAmount}`,
            lastActiveAt: new Date(),
          })
          .where(eq(userProfiles.userId, ctx.user.id));
      }

      return updated;
    }),

  getStats: protectedProcedure.query(async ({ ctx }) => {
    const [stats] = await ctx.db.execute(sql`
      SELECT
        COUNT(*) FILTER (WHERE status = 'completed') as completed_lessons,
        SUM(time_spent_seconds) as total_time_seconds,
        AVG(score) FILTER (WHERE score IS NOT NULL) as avg_score,
        COUNT(DISTINCT DATE(completed_at)) as active_days
      FROM progress
      WHERE user_id = ${ctx.user.id}
    `);

    const profile = await ctx.db.query.userProfiles.findFirst({
      where: eq(userProfiles.userId, ctx.user.id),
    });

    return {
      completedLessons: Number(stats?.completed_lessons || 0),
      totalTimeSeconds: Number(stats?.total_time_seconds || 0),
      avgScore: Number(stats?.avg_score || 0),
      activeDays: Number(stats?.active_days || 0),
      level: profile?.level || 1,
      totalXp: profile?.totalXp || 0,
      currentStreak: profile?.currentStreak || 0,
    };
  }),

  getHistory: protectedProcedure
    .input(z.object({
      limit: z.number().min(1).max(100).default(20),
      offset: z.number().min(0).default(0),
    }))
    .query(async ({ ctx, input }) => {
      const history = await ctx.db.query.progress.findMany({
        where: eq(progress.userId, ctx.user.id),
        orderBy: (progress, { desc }) => [desc(progress.updatedAt)],
        limit: input.limit,
        offset: input.offset,
        with: {
          lesson: {
            with: {
              module: {
                with: {
                  course: true,
                },
              },
            },
          },
        },
      });

      return history;
    }),
});
