import { z } from 'zod';
import { desc } from 'drizzle-orm';
import { router, protectedProcedure } from '../trpc';
import { feedback } from '@/lib/db/schema';

export const feedbackRouter = router({
  submit: protectedProcedure
    .input(
      z.object({
        type: z.enum(['bug', 'feature', 'general']),
        message: z.string().min(10, 'Message must be at least 10 characters'),
        page: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const [record] = await ctx.db
        .insert(feedback)
        .values({
          userId: ctx.user.id,
          type: input.type,
          message: input.message,
          page: input.page ?? null,
        })
        .returning();

      return record;
    }),

  list: protectedProcedure.query(async ({ ctx }) => {
    const records = await ctx.db
      .select()
      .from(feedback)
      .orderBy(desc(feedback.createdAt))
      .limit(50);

    return records;
  }),
});
