import { z } from 'zod';
import { router, protectedProcedure } from '../trpc';
import { users, userProfiles } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export const userRouter = router({
  getProfile: protectedProcedure.query(async ({ ctx }) => {
    const user = await ctx.db.query.users.findFirst({
      where: eq(users.id, ctx.user.id),
      with: {
        profile: true,
      },
    });

    return user;
  }),

  updateProfile: protectedProcedure
    .input(z.object({
      name: z.string().min(1).max(255).optional(),
      avatarUrl: z.string().url().optional(),
      preferences: z.object({
        theme: z.enum(['light', 'dark', 'system']).optional(),
        notifications: z.boolean().optional(),
        emailDigest: z.enum(['daily', 'weekly', 'never']).optional(),
      }).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const [updated] = await ctx.db
        .update(users)
        .set({
          name: input.name,
          avatarUrl: input.avatarUrl,
          preferences: input.preferences,
          updatedAt: new Date(),
        })
        .where(eq(users.id, ctx.user.id))
        .returning();

      return updated;
    }),

  updateLearningPreferences: protectedProcedure
    .input(z.object({
      learningStyle: z.enum(['visual', 'auditory', 'kinesthetic', 'reading']).optional(),
      gamificationMode: z.enum(['full', 'moderate', 'minimal', 'off']).optional(),
      studyPreferences: z.object({
        preferredTimes: z.array(z.string()).optional(),
        sessionDuration: z.number().min(5).max(120).optional(),
        interests: z.array(z.string()).optional(),
      }).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const [updated] = await ctx.db
        .update(userProfiles)
        .set({
          learningStyle: input.learningStyle,
          gamificationMode: input.gamificationMode,
          studyPreferences: input.studyPreferences,
        })
        .where(eq(userProfiles.userId, ctx.user.id))
        .returning();

      return updated;
    }),

  getSettings: protectedProcedure.query(async ({ ctx }) => {
    const profile = await ctx.db.query.userProfiles.findFirst({
      where: eq(userProfiles.userId, ctx.user.id),
    });

    return {
      gamificationMode: profile?.gamificationMode ?? 'full',
      learningStyle: profile?.learningStyle,
      studyPreferences: profile?.studyPreferences,
    };
  }),
});
