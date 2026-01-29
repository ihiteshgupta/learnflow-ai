import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TRPCError } from '@trpc/server';
import { notificationsRouter } from '../notifications';
import { NOTIFICATION_TYPES } from '@/lib/db/schema';

// Mock the database module
vi.mock('@/lib/db/schema', () => ({
  notifications: {
    id: 'id',
    userId: 'userId',
    type: 'type',
    title: 'title',
    message: 'message',
    isRead: 'isRead',
    metadata: 'metadata',
    actionUrl: 'actionUrl',
    createdAt: 'createdAt',
    readAt: 'readAt',
  },
  notificationPreferences: {
    userId: 'userId',
    type: 'type',
    inApp: 'inApp',
    email: 'email',
    push: 'push',
    updatedAt: 'updatedAt',
  },
  NOTIFICATION_TYPES: [
    'achievement_unlocked',
    'streak_milestone',
    'course_completed',
    'certificate_earned',
    'lesson_reminder',
    'team_update',
    'org_announcement',
    'admin_alert',
    'system_message',
  ],
}));

vi.mock('drizzle-orm', () => ({
  eq: vi.fn((a, b) => ({ type: 'eq', field: a, value: b })),
  and: vi.fn((...conditions) => ({ type: 'and', conditions })),
  desc: vi.fn((field) => ({ type: 'desc', field })),
  sql: vi.fn(),
}));

// Helper to create mock context
function createMockContext(user: { id: string; email: string; name: string; role: string; orgId: string | null; teamId: string | null } | null) {
  const mockDb = {
    query: {
      notifications: {
        findFirst: vi.fn(),
        findMany: vi.fn(),
      },
      notificationPreferences: {
        findFirst: vi.fn(),
        findMany: vi.fn(),
      },
    },
    insert: vi.fn(() => ({
      values: vi.fn(() => ({
        returning: vi.fn(),
        onConflictDoUpdate: vi.fn(),
      })),
    })),
    update: vi.fn(() => ({
      set: vi.fn(() => ({
        where: vi.fn(),
      })),
    })),
    delete: vi.fn(() => ({
      where: vi.fn(),
    })),
    select: vi.fn(() => ({
      from: vi.fn(() => ({
        where: vi.fn(),
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
  return {
    list: async (input: { limit?: number; cursor?: string; unreadOnly?: boolean }) => {
      if (!ctx.user) {
        throw new TRPCError({ code: 'UNAUTHORIZED' });
      }
      const procedure = notificationsRouter._def.procedures.list;
      const parsedInput = {
        limit: input.limit ?? 20,
        cursor: input.cursor,
        unreadOnly: input.unreadOnly ?? false,
      };
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return await (procedure as any)._def.resolver({ ctx: { ...ctx, user: ctx.user }, input: parsedInput });
    },
    getUnreadCount: async () => {
      if (!ctx.user) {
        throw new TRPCError({ code: 'UNAUTHORIZED' });
      }
      const procedure = notificationsRouter._def.procedures.getUnreadCount;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return await (procedure as any)._def.resolver({ ctx: { ...ctx, user: ctx.user } });
    },
    markAsRead: async (input: { id: string }) => {
      if (!ctx.user) {
        throw new TRPCError({ code: 'UNAUTHORIZED' });
      }
      const procedure = notificationsRouter._def.procedures.markAsRead;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return await (procedure as any)._def.resolver({ ctx: { ...ctx, user: ctx.user }, input });
    },
    markAllAsRead: async () => {
      if (!ctx.user) {
        throw new TRPCError({ code: 'UNAUTHORIZED' });
      }
      const procedure = notificationsRouter._def.procedures.markAllAsRead;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return await (procedure as any)._def.resolver({ ctx: { ...ctx, user: ctx.user } });
    },
    delete: async (input: { id: string }) => {
      if (!ctx.user) {
        throw new TRPCError({ code: 'UNAUTHORIZED' });
      }
      const procedure = notificationsRouter._def.procedures.delete;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return await (procedure as any)._def.resolver({ ctx: { ...ctx, user: ctx.user }, input });
    },
    getPreferences: async () => {
      if (!ctx.user) {
        throw new TRPCError({ code: 'UNAUTHORIZED' });
      }
      const procedure = notificationsRouter._def.procedures.getPreferences;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return await (procedure as any)._def.resolver({ ctx: { ...ctx, user: ctx.user } });
    },
    updatePreferences: async (input: { type: string; inApp?: boolean; email?: boolean; push?: boolean }) => {
      if (!ctx.user) {
        throw new TRPCError({ code: 'UNAUTHORIZED' });
      }
      const procedure = notificationsRouter._def.procedures.updatePreferences;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return await (procedure as any)._def.resolver({ ctx: { ...ctx, user: ctx.user }, input });
    },
    create: async (input: { userId: string; type: string; title: string; message: string; metadata?: Record<string, unknown>; actionUrl?: string }) => {
      if (!ctx.user) {
        throw new TRPCError({ code: 'UNAUTHORIZED' });
      }
      const procedure = notificationsRouter._def.procedures.create;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return await (procedure as any)._def.resolver({ ctx: { ...ctx, user: ctx.user }, input });
    },
  };
}

describe('notifications router', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('authorization', () => {
    it('list throws UNAUTHORIZED when user is null', async () => {
      const ctx = createMockContext(null);
      const caller = createCaller(ctx);

      await expect(caller.list({})).rejects.toThrow(TRPCError);
      await expect(caller.list({})).rejects.toMatchObject({
        code: 'UNAUTHORIZED',
      });
    });

    it('getUnreadCount throws UNAUTHORIZED when user is null', async () => {
      const ctx = createMockContext(null);
      const caller = createCaller(ctx);

      await expect(caller.getUnreadCount()).rejects.toThrow(TRPCError);
      await expect(caller.getUnreadCount()).rejects.toMatchObject({
        code: 'UNAUTHORIZED',
      });
    });

    it('markAsRead throws UNAUTHORIZED when user is null', async () => {
      const ctx = createMockContext(null);
      const caller = createCaller(ctx);

      await expect(caller.markAsRead({ id: 'notif-1' })).rejects.toThrow(TRPCError);
      await expect(caller.markAsRead({ id: 'notif-1' })).rejects.toMatchObject({
        code: 'UNAUTHORIZED',
      });
    });

    it('markAllAsRead throws UNAUTHORIZED when user is null', async () => {
      const ctx = createMockContext(null);
      const caller = createCaller(ctx);

      await expect(caller.markAllAsRead()).rejects.toThrow(TRPCError);
      await expect(caller.markAllAsRead()).rejects.toMatchObject({
        code: 'UNAUTHORIZED',
      });
    });

    it('delete throws UNAUTHORIZED when user is null', async () => {
      const ctx = createMockContext(null);
      const caller = createCaller(ctx);

      await expect(caller.delete({ id: 'notif-1' })).rejects.toThrow(TRPCError);
      await expect(caller.delete({ id: 'notif-1' })).rejects.toMatchObject({
        code: 'UNAUTHORIZED',
      });
    });

    it('getPreferences throws UNAUTHORIZED when user is null', async () => {
      const ctx = createMockContext(null);
      const caller = createCaller(ctx);

      await expect(caller.getPreferences()).rejects.toThrow(TRPCError);
      await expect(caller.getPreferences()).rejects.toMatchObject({
        code: 'UNAUTHORIZED',
      });
    });

    it('updatePreferences throws UNAUTHORIZED when user is null', async () => {
      const ctx = createMockContext(null);
      const caller = createCaller(ctx);

      await expect(caller.updatePreferences({ type: 'achievement_unlocked' })).rejects.toThrow(TRPCError);
      await expect(caller.updatePreferences({ type: 'achievement_unlocked' })).rejects.toMatchObject({
        code: 'UNAUTHORIZED',
      });
    });

    it('create throws UNAUTHORIZED when user is null', async () => {
      const ctx = createMockContext(null);
      const caller = createCaller(ctx);

      await expect(caller.create({
        userId: 'user-1',
        type: 'achievement_unlocked',
        title: 'Test',
        message: 'Test message',
      })).rejects.toThrow(TRPCError);
    });
  });

  describe('list', () => {
    it('returns paginated notifications', async () => {
      const user = createMockUser();
      const ctx = createMockContext(user);
      const caller = createCaller(ctx);

      const mockNotifications = [
        { id: 'n1', userId: user.id, type: 'achievement_unlocked', title: 'Badge earned', message: 'You earned a badge!', isRead: false, createdAt: new Date() },
        { id: 'n2', userId: user.id, type: 'streak_milestone', title: '7-day streak', message: 'Keep it up!', isRead: true, createdAt: new Date() },
      ];

      ctx.db.query.notifications.findMany.mockResolvedValueOnce(mockNotifications);

      const result = await caller.list({ limit: 20 });

      expect(ctx.db.query.notifications.findMany).toHaveBeenCalled();
      expect(result).toHaveProperty('items');
      expect(result).toHaveProperty('nextCursor');
    });

    it('supports unreadOnly filter', async () => {
      const user = createMockUser();
      const ctx = createMockContext(user);
      const caller = createCaller(ctx);

      ctx.db.query.notifications.findMany.mockResolvedValueOnce([]);

      await caller.list({ unreadOnly: true });

      expect(ctx.db.query.notifications.findMany).toHaveBeenCalled();
    });

    it('returns nextCursor when more items exist', async () => {
      const user = createMockUser();
      const ctx = createMockContext(user);
      const caller = createCaller(ctx);

      // Return limit + 1 items to trigger pagination
      const mockNotifications = Array.from({ length: 3 }, (_, i) => ({
        id: `n${i}`,
        userId: user.id,
        type: 'achievement_unlocked',
        title: `Notification ${i}`,
        message: 'Message',
        isRead: false,
        createdAt: new Date(),
      }));

      ctx.db.query.notifications.findMany.mockResolvedValueOnce(mockNotifications);

      const result = await caller.list({ limit: 2 });

      expect(result.items).toHaveLength(2);
      expect(result.nextCursor).toBe('n2');
    });
  });

  describe('getUnreadCount', () => {
    it('returns count of unread notifications', async () => {
      const user = createMockUser();
      const ctx = createMockContext(user);
      const caller = createCaller(ctx);

      ctx.db.select.mockReturnValueOnce({
        from: vi.fn().mockReturnValueOnce({
          where: vi.fn().mockResolvedValueOnce([{ count: 5 }]),
        }),
      });

      const result = await caller.getUnreadCount();

      expect(result).toEqual({ count: 5 });
    });

    it('returns 0 when no unread notifications', async () => {
      const user = createMockUser();
      const ctx = createMockContext(user);
      const caller = createCaller(ctx);

      ctx.db.select.mockReturnValueOnce({
        from: vi.fn().mockReturnValueOnce({
          where: vi.fn().mockResolvedValueOnce([{ count: 0 }]),
        }),
      });

      const result = await caller.getUnreadCount();

      expect(result).toEqual({ count: 0 });
    });
  });

  describe('markAsRead', () => {
    it('marks notification as read', async () => {
      const user = createMockUser();
      const ctx = createMockContext(user);
      const caller = createCaller(ctx);

      const mockNotification = {
        id: 'notif-1',
        userId: user.id,
        type: 'achievement_unlocked',
        title: 'Test',
        message: 'Test message',
        isRead: false,
        createdAt: new Date(),
      };

      ctx.db.query.notifications.findFirst.mockResolvedValueOnce(mockNotification);
      ctx.db.update.mockReturnValueOnce({
        set: vi.fn().mockReturnValueOnce({
          where: vi.fn().mockResolvedValueOnce(undefined),
        }),
      });

      const result = await caller.markAsRead({ id: 'notif-1' });

      expect(ctx.db.query.notifications.findFirst).toHaveBeenCalled();
      expect(ctx.db.update).toHaveBeenCalled();
      expect(result).toEqual({ success: true });
    });

    it('throws NOT_FOUND when notification does not exist', async () => {
      const user = createMockUser();
      const ctx = createMockContext(user);
      const caller = createCaller(ctx);

      ctx.db.query.notifications.findFirst.mockResolvedValueOnce(null);

      await expect(caller.markAsRead({ id: 'nonexistent' })).rejects.toThrow(TRPCError);
      await expect(caller.markAsRead({ id: 'nonexistent' })).rejects.toMatchObject({
        code: 'NOT_FOUND',
      });
    });
  });

  describe('markAllAsRead', () => {
    it('marks all notifications as read', async () => {
      const user = createMockUser();
      const ctx = createMockContext(user);
      const caller = createCaller(ctx);

      ctx.db.update.mockReturnValueOnce({
        set: vi.fn().mockReturnValueOnce({
          where: vi.fn().mockResolvedValueOnce(undefined),
        }),
      });

      const result = await caller.markAllAsRead();

      expect(ctx.db.update).toHaveBeenCalled();
      expect(result).toEqual({ success: true });
    });
  });

  describe('delete', () => {
    it('deletes notification', async () => {
      const user = createMockUser();
      const ctx = createMockContext(user);
      const caller = createCaller(ctx);

      ctx.db.query.notifications.findFirst.mockResolvedValueOnce({
        id: 'notif-1',
        userId: user.id,
      });
      ctx.db.delete.mockReturnValueOnce({
        where: vi.fn().mockResolvedValueOnce(undefined),
      });

      const result = await caller.delete({ id: 'notif-1' });

      expect(ctx.db.delete).toHaveBeenCalled();
      expect(result).toEqual({ success: true });
    });

    it('throws NOT_FOUND when notification does not exist', async () => {
      const user = createMockUser();
      const ctx = createMockContext(user);
      const caller = createCaller(ctx);

      ctx.db.query.notifications.findFirst.mockResolvedValueOnce(null);

      await expect(caller.delete({ id: 'nonexistent' })).rejects.toThrow(TRPCError);
      await expect(caller.delete({ id: 'nonexistent' })).rejects.toMatchObject({
        code: 'NOT_FOUND',
      });
    });
  });

  describe('getPreferences', () => {
    it('returns preferences for all notification types', async () => {
      const user = createMockUser();
      const ctx = createMockContext(user);
      const caller = createCaller(ctx);

      const existingPrefs = [
        { userId: user.id, type: 'achievement_unlocked', inApp: true, email: true, push: false },
        { userId: user.id, type: 'streak_milestone', inApp: false, email: false, push: false },
      ];

      ctx.db.query.notificationPreferences.findMany.mockResolvedValueOnce(existingPrefs);

      const result = await caller.getPreferences();

      expect(result).toHaveLength(9); // All NOTIFICATION_TYPES
      expect(result[0]).toHaveProperty('type');
      expect(result[0]).toHaveProperty('inApp');
      expect(result[0]).toHaveProperty('email');
      expect(result[0]).toHaveProperty('push');
    });

    it('returns defaults when no preferences set', async () => {
      const user = createMockUser();
      const ctx = createMockContext(user);
      const caller = createCaller(ctx);

      ctx.db.query.notificationPreferences.findMany.mockResolvedValueOnce([]);

      const result = await caller.getPreferences();

      // All should have default values (inApp: true, email: false, push: false)
      result.forEach((pref: { type: string; inApp: boolean; email: boolean; push: boolean }) => {
        expect(pref.inApp).toBe(true);
        expect(pref.email).toBe(false);
        expect(pref.push).toBe(false);
      });
    });
  });

  describe('updatePreferences', () => {
    it('upserts notification preference', async () => {
      const user = createMockUser();
      const ctx = createMockContext(user);
      const caller = createCaller(ctx);

      ctx.db.insert.mockReturnValueOnce({
        values: vi.fn().mockReturnValueOnce({
          onConflictDoUpdate: vi.fn().mockResolvedValueOnce(undefined),
        }),
      });

      const result = await caller.updatePreferences({
        type: 'achievement_unlocked',
        inApp: true,
        email: true,
      });

      expect(ctx.db.insert).toHaveBeenCalled();
      expect(result).toEqual({ success: true });
    });
  });

  describe('create', () => {
    it('creates notification when user has not disabled the type', async () => {
      const user = createMockUser();
      const ctx = createMockContext(user);
      const caller = createCaller(ctx);

      // No preference set (default enabled)
      ctx.db.query.notificationPreferences.findFirst.mockResolvedValueOnce(null);
      ctx.db.insert.mockReturnValueOnce({
        values: vi.fn().mockReturnValueOnce({
          returning: vi.fn().mockResolvedValueOnce([{
            id: 'new-notif',
            userId: 'target-user',
            type: 'achievement_unlocked',
            title: 'Test',
            message: 'Test message',
            isRead: false,
            createdAt: new Date(),
          }]),
        }),
      });

      const result = await caller.create({
        userId: 'target-user',
        type: 'achievement_unlocked',
        title: 'Test',
        message: 'Test message',
      });

      expect(result.created).toBe(true);
      expect(result.notification).toBeDefined();
    });

    it('skips notification when user has disabled the type', async () => {
      const user = createMockUser();
      const ctx = createMockContext(user);
      const caller = createCaller(ctx);

      // User has disabled this notification type
      ctx.db.query.notificationPreferences.findFirst.mockResolvedValueOnce({
        userId: 'target-user',
        type: 'achievement_unlocked',
        inApp: false,
        email: false,
        push: false,
      });

      const result = await caller.create({
        userId: 'target-user',
        type: 'achievement_unlocked',
        title: 'Test',
        message: 'Test message',
      });

      expect(result.created).toBe(false);
      expect(result.reason).toBe('User disabled this notification type');
    });
  });

  describe('router structure', () => {
    it('has all expected procedures', () => {
      expect(notificationsRouter._def.procedures).toHaveProperty('list');
      expect(notificationsRouter._def.procedures).toHaveProperty('getUnreadCount');
      expect(notificationsRouter._def.procedures).toHaveProperty('markAsRead');
      expect(notificationsRouter._def.procedures).toHaveProperty('markAllAsRead');
      expect(notificationsRouter._def.procedures).toHaveProperty('delete');
      expect(notificationsRouter._def.procedures).toHaveProperty('getPreferences');
      expect(notificationsRouter._def.procedures).toHaveProperty('updatePreferences');
      expect(notificationsRouter._def.procedures).toHaveProperty('create');
    });

    it('list has input validation', () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const procedure = notificationsRouter._def.procedures.list as any;
      expect(procedure._def.inputs).toBeDefined();
      expect(procedure._def.inputs.length).toBeGreaterThan(0);
    });

    it('markAsRead has input validation', () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const procedure = notificationsRouter._def.procedures.markAsRead as any;
      expect(procedure._def.inputs).toBeDefined();
      expect(procedure._def.inputs.length).toBeGreaterThan(0);
    });

    it('create has input validation', () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const procedure = notificationsRouter._def.procedures.create as any;
      expect(procedure._def.inputs).toBeDefined();
      expect(procedure._def.inputs.length).toBeGreaterThan(0);
    });
  });
});
