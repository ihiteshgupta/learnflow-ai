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
      avatarDataUrl: z.string().max(500000).optional(), // Base64 avatar, max ~375KB image
      bio: z.string().max(500).optional(),
      preferences: z.object({
        theme: z.enum(['light', 'dark', 'system']).optional(),
        notifications: z.boolean().optional(),
        emailDigest: z.enum(['daily', 'weekly', 'never']).optional(),
      }).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      // Build the update object
      const updateData: Record<string, unknown> = {
        updatedAt: new Date(),
      };

      if (input.name !== undefined) {
        updateData.name = input.name;
      }
      if (input.avatarUrl !== undefined) {
        updateData.avatarUrl = input.avatarUrl;
      }

      // Handle bio, avatarDataUrl, and other preferences by merging with existing
      if (input.bio !== undefined || input.avatarDataUrl !== undefined || input.preferences !== undefined) {
        const existing = await ctx.db.query.users.findFirst({
          where: eq(users.id, ctx.user.id),
          columns: { preferences: true },
        });

        const currentPrefs = (existing?.preferences as Record<string, unknown>) || {};
        updateData.preferences = {
          ...currentPrefs,
          ...(input.preferences || {}),
          ...(input.bio !== undefined ? { bio: input.bio } : {}),
          ...(input.avatarDataUrl !== undefined ? { avatarDataUrl: input.avatarDataUrl } : {}),
        };
      }

      const [updated] = await ctx.db
        .update(users)
        .set(updateData)
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

  deleteAccount: protectedProcedure
    .input(z.object({
      confirmEmail: z.string().email(),
    }))
    .mutation(async ({ ctx, input }) => {
      // Verify email matches for safety
      const user = await ctx.db.query.users.findFirst({
        where: eq(users.id, ctx.user.id),
        columns: { email: true },
      });

      if (!user || user.email !== input.confirmEmail) {
        throw new Error('Email confirmation does not match your account email');
      }

      // Delete user profile first (foreign key constraint)
      await ctx.db.delete(userProfiles).where(eq(userProfiles.userId, ctx.user.id));

      // Delete the user account
      await ctx.db.delete(users).where(eq(users.id, ctx.user.id));

      return { success: true };
    }),
});
