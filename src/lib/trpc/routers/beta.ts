import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { eq } from 'drizzle-orm';
import { router, publicProcedure, adminProcedure } from '../trpc';
import { betaInvites } from '@/lib/db/schema';

const betaCodeSchema = z.string().min(8).max(8);

function generateInviteCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  return Array.from({ length: 8 }, () =>
    chars[Math.floor(Math.random() * chars.length)],
  ).join('');
}

export const betaRouter = router({
  requestAccess: publicProcedure
    .input(z.object({ email: z.string().email() }))
    .mutation(async ({ ctx, input }) => {
      const [invite] = await ctx.db
        .insert(betaInvites)
        .values({
          email: input.email,
          status: 'pending',
        })
        .returning();

      return invite;
    }),

  validateCode: publicProcedure
    .input(z.object({ code: betaCodeSchema }))
    .query(async ({ ctx, input }) => {
      const invite = await ctx.db.query.betaInvites.findFirst({
        where: eq(betaInvites.code, input.code),
      });

      if (!invite || invite.status !== 'pending') {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Invite code not found or no longer valid',
        });
      }

      return { valid: true, email: invite.email };
    }),

  generateCodes: adminProcedure
    .input(z.object({ count: z.number().int().min(1).max(100).default(10) }))
    .mutation(async ({ ctx, input }) => {
      const codeSet = new Set<string>();
      while (codeSet.size < input.count) {
        codeSet.add(generateInviteCode());
      }

      const codes = Array.from(codeSet);

      const records = codes.map((code) => ({
        email: '',
        code,
        status: 'pending' as const,
      }));

      await ctx.db.insert(betaInvites).values(records);

      return { codes };
    }),
});
