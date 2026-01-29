import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { router, protectedProcedure } from '../trpc';
import { notifications, notificationPreferences, NOTIFICATION_TYPES } from '@/lib/db/schema';
import type { NotificationType, NotificationMetadata } from '@/lib/db/schema';
import { eq, and, desc, sql } from 'drizzle-orm';

export const notificationsRouter = router({
  // Get paginated notifications for the current user
  list: protectedProcedure
    .input(z.object({
      limit: z.number().min(1).max(100).default(20),
      cursor: z.string().uuid().optional(),
      unreadOnly: z.boolean().default(false),
    }))
    .query(async ({ ctx, input }) => {
      const conditions = [eq(notifications.userId, ctx.user.id)];

      if (input.unreadOnly) {
        conditions.push(eq(notifications.isRead, false));
      }

      const items = await ctx.db.query.notifications.findMany({
        where: and(...conditions),
        orderBy: [desc(notifications.createdAt)],
        limit: input.limit + 1,
      });

      let nextCursor: string | undefined;
      if (items.length > input.limit) {
        const lastItem = items.pop();
        nextCursor = lastItem?.id;
      }

      return {
        items,
        nextCursor,
      };
    }),

  // Get count of unread notifications
  getUnreadCount: protectedProcedure.query(async ({ ctx }) => {
    const result = await ctx.db
      .select({ count: sql<number>`count(*)::int` })
      .from(notifications)
      .where(and(
        eq(notifications.userId, ctx.user.id),
        eq(notifications.isRead, false)
      ));

    return { count: result[0]?.count ?? 0 };
  }),

  // Mark a single notification as read
  markAsRead: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const notification = await ctx.db.query.notifications.findFirst({
        where: and(
          eq(notifications.id, input.id),
          eq(notifications.userId, ctx.user.id)
        ),
      });

      if (!notification) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Notification not found' });
      }

      await ctx.db
        .update(notifications)
        .set({ isRead: true, readAt: new Date() })
        .where(eq(notifications.id, input.id));

      return { success: true };
    }),

  // Mark all notifications as read
  markAllAsRead: protectedProcedure.mutation(async ({ ctx }) => {
    await ctx.db
      .update(notifications)
      .set({ isRead: true, readAt: new Date() })
      .where(and(
        eq(notifications.userId, ctx.user.id),
        eq(notifications.isRead, false)
      ));

    return { success: true };
  }),

  // Delete a notification
  delete: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const notification = await ctx.db.query.notifications.findFirst({
        where: and(
          eq(notifications.id, input.id),
          eq(notifications.userId, ctx.user.id)
        ),
      });

      if (!notification) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Notification not found' });
      }

      await ctx.db
        .delete(notifications)
        .where(eq(notifications.id, input.id));

      return { success: true };
    }),

  // Get notification preferences
  getPreferences: protectedProcedure.query(async ({ ctx }) => {
    const prefs = await ctx.db.query.notificationPreferences.findMany({
      where: eq(notificationPreferences.userId, ctx.user.id),
    });

    // Return all notification types with their preferences
    const prefsMap = new Map(prefs.map(p => [p.type, p]));

    return NOTIFICATION_TYPES.map(type => ({
      type,
      inApp: prefsMap.get(type)?.inApp ?? true,
      email: prefsMap.get(type)?.email ?? false,
      push: prefsMap.get(type)?.push ?? false,
    }));
  }),

  // Update notification preferences
  updatePreferences: protectedProcedure
    .input(z.object({
      type: z.enum(NOTIFICATION_TYPES),
      inApp: z.boolean().optional(),
      email: z.boolean().optional(),
      push: z.boolean().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { type, ...updates } = input;

      // Upsert the preference
      await ctx.db
        .insert(notificationPreferences)
        .values({
          userId: ctx.user.id,
          type,
          inApp: updates.inApp ?? true,
          email: updates.email ?? false,
          push: updates.push ?? false,
        })
        .onConflictDoUpdate({
          target: [notificationPreferences.userId, notificationPreferences.type],
          set: {
            ...updates,
            updatedAt: new Date(),
          },
        });

      return { success: true };
    }),

  // Create a notification (internal use or admin)
  create: protectedProcedure
    .input(z.object({
      userId: z.string().uuid(),
      type: z.enum(NOTIFICATION_TYPES),
      title: z.string().min(1).max(255),
      message: z.string().min(1),
      metadata: z.record(z.string(), z.unknown()).optional(),
      actionUrl: z.string().url().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      // Check if user has this notification type enabled
      const pref = await ctx.db.query.notificationPreferences.findFirst({
        where: and(
          eq(notificationPreferences.userId, input.userId),
          eq(notificationPreferences.type, input.type)
        ),
      });

      // Skip if user has disabled this notification type (default is enabled)
      if (pref && !pref.inApp) {
        return { created: false, reason: 'User disabled this notification type' };
      }

      const [notification] = await ctx.db
        .insert(notifications)
        .values({
          userId: input.userId,
          type: input.type,
          title: input.title,
          message: input.message,
          metadata: input.metadata as NotificationMetadata,
          actionUrl: input.actionUrl,
        })
        .returning();

      return { created: true, notification };
    }),
});

// Helper function to create notifications from other parts of the app
export async function createNotification(
  db: typeof import('@/lib/db').db,
  params: {
    userId: string;
    type: NotificationType;
    title: string;
    message: string;
    metadata?: NotificationMetadata;
    actionUrl?: string;
  }
) {
  // Check user preferences
  const pref = await db.query.notificationPreferences.findFirst({
    where: and(
      eq(notificationPreferences.userId, params.userId),
      eq(notificationPreferences.type, params.type)
    ),
  });

  if (pref && !pref.inApp) {
    return null;
  }

  const [notification] = await db
    .insert(notifications)
    .values({
      userId: params.userId,
      type: params.type,
      title: params.title,
      message: params.message,
      metadata: params.metadata,
      actionUrl: params.actionUrl,
    })
    .returning();

  return notification;
}
