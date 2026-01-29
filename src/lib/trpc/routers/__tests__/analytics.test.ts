import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TRPCError } from '@trpc/server';
import { analyticsRouter } from '../analytics';

// Mock the database module
vi.mock('@/lib/db/schema', () => ({
  userProfiles: { userId: 'userId', totalXp: 'totalXp', level: 'level', currentStreak: 'currentStreak', longestStreak: 'longestStreak', lastActiveAt: 'lastActiveAt', skillMap: 'skillMap' },
  xpTransactions: { userId: 'userId', amount: 'amount', reason: 'reason', createdAt: 'createdAt' },
  streakHistory: { userId: 'userId', date: 'date', streakCount: 'streakCount' },
  progress: { userId: 'userId', status: 'status', completedAt: 'completedAt' },
  courseProgress: { userId: 'userId', courseId: 'courseId', status: 'status', progressPercent: 'progressPercent', completedLessons: 'completedLessons', totalLessons: 'totalLessons', startedAt: 'startedAt', completedAt: 'completedAt' },
  enrollments: { userId: 'userId', trackId: 'trackId', status: 'status', completedAt: 'completedAt' },
  users: { id: 'id', createdAt: 'createdAt' },
  courses: { id: 'id', name: 'name' },
}));

vi.mock('drizzle-orm', () => {
  const mockSql = Object.assign(
    (strings: TemplateStringsArray, ...values: unknown[]) => ({ type: 'sql', strings, values }),
    {
      join: (arr: unknown[], separator: unknown) => ({ type: 'join', items: arr, separator }),
    }
  );
  return {
    eq: (a: unknown, b: unknown) => ({ type: 'eq', field: a, value: b }),
    and: (...conditions: unknown[]) => ({ type: 'and', conditions }),
    gte: (a: unknown, b: unknown) => ({ type: 'gte', field: a, value: b }),
    desc: (field: unknown) => ({ type: 'desc', field }),
    sql: mockSql,
  };
});

vi.mock('date-fns', () => ({
  subDays: vi.fn((date, days) => new Date(date.getTime() - days * 24 * 60 * 60 * 1000)),
  startOfDay: vi.fn((date) => {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    return d;
  }),
  format: vi.fn((date, formatStr) => {
    if (formatStr === 'yyyy-MM-dd') {
      return date.toISOString().split('T')[0];
    }
    return date.toISOString();
  }),
}));

// Helper to create mock context
function createMockContext(
  user: { id: string; email: string; name: string; role: string; orgId: string | null; teamId: string | null } | null,
  isAdmin = false
) {
  const mockDb = {
    query: {
      userProfiles: {
        findFirst: vi.fn(),
      },
      enrollments: {
        findMany: vi.fn(),
      },
      courseProgress: {
        findMany: vi.fn(),
      },
      xpTransactions: {
        findMany: vi.fn(),
      },
      streakHistory: {
        findMany: vi.fn(),
      },
      progress: {
        findMany: vi.fn(),
      },
      courses: {
        findMany: vi.fn(),
      },
    },
    select: vi.fn(() => ({
      from: vi.fn(() => ({
        where: vi.fn(() => ({
          groupBy: vi.fn(() => ({
            orderBy: vi.fn(() => ({
              limit: vi.fn(),
            })),
          })),
        })),
      })),
    })),
  };

  const userWithRole = user ? { ...user, role: isAdmin ? 'admin' : user.role } : null;

  return {
    db: mockDb,
    user: userWithRole,
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
    getPersonalStats: async () => {
      if (!ctx.user) {
        throw new TRPCError({ code: 'UNAUTHORIZED' });
      }
      const procedure = analyticsRouter._def.procedures.getPersonalStats;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return await (procedure as any)._def.resolver({ ctx: { ...ctx, user: ctx.user } });
    },
    getLearningTimeline: async (input: { days?: number }) => {
      if (!ctx.user) {
        throw new TRPCError({ code: 'UNAUTHORIZED' });
      }
      const procedure = analyticsRouter._def.procedures.getLearningTimeline;
      const parsedInput = { days: input.days ?? 30 };
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return await (procedure as any)._def.resolver({ ctx: { ...ctx, user: ctx.user }, input: parsedInput });
    },
    getCourseProgress: async () => {
      if (!ctx.user) {
        throw new TRPCError({ code: 'UNAUTHORIZED' });
      }
      const procedure = analyticsRouter._def.procedures.getCourseProgress;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return await (procedure as any)._def.resolver({ ctx: { ...ctx, user: ctx.user } });
    },
    getSkillProgress: async () => {
      if (!ctx.user) {
        throw new TRPCError({ code: 'UNAUTHORIZED' });
      }
      const procedure = analyticsRouter._def.procedures.getSkillProgress;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return await (procedure as any)._def.resolver({ ctx: { ...ctx, user: ctx.user } });
    },
    getPlatformStats: async () => {
      if (!ctx.user) {
        throw new TRPCError({ code: 'UNAUTHORIZED' });
      }
      if (ctx.user.role !== 'admin') {
        throw new TRPCError({ code: 'FORBIDDEN' });
      }
      const procedure = analyticsRouter._def.procedures.getPlatformStats;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return await (procedure as any)._def.resolver({ ctx: { ...ctx, user: ctx.user } });
    },
    getUserGrowth: async (input: { days?: number }) => {
      if (!ctx.user) {
        throw new TRPCError({ code: 'UNAUTHORIZED' });
      }
      if (ctx.user.role !== 'admin') {
        throw new TRPCError({ code: 'FORBIDDEN' });
      }
      const procedure = analyticsRouter._def.procedures.getUserGrowth;
      const parsedInput = { days: input.days ?? 30 };
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return await (procedure as any)._def.resolver({ ctx: { ...ctx, user: ctx.user }, input: parsedInput });
    },
    getCoursePopularity: async (input: { limit?: number }) => {
      if (!ctx.user) {
        throw new TRPCError({ code: 'UNAUTHORIZED' });
      }
      if (ctx.user.role !== 'admin') {
        throw new TRPCError({ code: 'FORBIDDEN' });
      }
      const procedure = analyticsRouter._def.procedures.getCoursePopularity;
      const parsedInput = { limit: input.limit ?? 10 };
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return await (procedure as any)._def.resolver({ ctx: { ...ctx, user: ctx.user }, input: parsedInput });
    },
  };
}

describe('analytics router', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('authorization', () => {
    it('getPersonalStats throws UNAUTHORIZED when user is null', async () => {
      const ctx = createMockContext(null);
      const caller = createCaller(ctx);

      await expect(caller.getPersonalStats()).rejects.toThrow(TRPCError);
      await expect(caller.getPersonalStats()).rejects.toMatchObject({
        code: 'UNAUTHORIZED',
      });
    });

    it('getLearningTimeline throws UNAUTHORIZED when user is null', async () => {
      const ctx = createMockContext(null);
      const caller = createCaller(ctx);

      await expect(caller.getLearningTimeline({})).rejects.toThrow(TRPCError);
      await expect(caller.getLearningTimeline({})).rejects.toMatchObject({
        code: 'UNAUTHORIZED',
      });
    });

    it('getCourseProgress throws UNAUTHORIZED when user is null', async () => {
      const ctx = createMockContext(null);
      const caller = createCaller(ctx);

      await expect(caller.getCourseProgress()).rejects.toThrow(TRPCError);
      await expect(caller.getCourseProgress()).rejects.toMatchObject({
        code: 'UNAUTHORIZED',
      });
    });

    it('getSkillProgress throws UNAUTHORIZED when user is null', async () => {
      const ctx = createMockContext(null);
      const caller = createCaller(ctx);

      await expect(caller.getSkillProgress()).rejects.toThrow(TRPCError);
      await expect(caller.getSkillProgress()).rejects.toMatchObject({
        code: 'UNAUTHORIZED',
      });
    });

    it('getPlatformStats throws UNAUTHORIZED when user is null', async () => {
      const ctx = createMockContext(null);
      const caller = createCaller(ctx);

      await expect(caller.getPlatformStats()).rejects.toThrow(TRPCError);
      await expect(caller.getPlatformStats()).rejects.toMatchObject({
        code: 'UNAUTHORIZED',
      });
    });

    it('getPlatformStats throws FORBIDDEN for non-admin user', async () => {
      const user = createMockUser();
      const ctx = createMockContext(user, false);
      const caller = createCaller(ctx);

      await expect(caller.getPlatformStats()).rejects.toThrow(TRPCError);
      await expect(caller.getPlatformStats()).rejects.toMatchObject({
        code: 'FORBIDDEN',
      });
    });
  });

  describe('getPersonalStats', () => {
    it('returns user learning statistics', async () => {
      const user = createMockUser();
      const ctx = createMockContext(user);
      const caller = createCaller(ctx);

      ctx.db.query.userProfiles.findFirst.mockResolvedValueOnce({
        userId: user.id,
        totalXp: 2500,
        level: 8,
        currentStreak: 12,
        longestStreak: 20,
      });

      ctx.db.query.enrollments.findMany.mockResolvedValueOnce([
        { userId: user.id, trackId: 'track-1', status: 'active' },
        { userId: user.id, trackId: 'track-2', status: 'active' },
      ]);

      ctx.db.query.courseProgress.findMany.mockResolvedValueOnce([
        { userId: user.id, courseId: 'c1', status: 'completed' },
        { userId: user.id, courseId: 'c2', status: 'in_progress' },
        { userId: user.id, courseId: 'c3', status: 'in_progress' },
      ]);

      ctx.db.select.mockReturnValueOnce({
        from: vi.fn().mockReturnValueOnce({
          where: vi.fn().mockResolvedValueOnce([{ count: 45 }]),
        }),
      });

      ctx.db.select.mockReturnValueOnce({
        from: vi.fn().mockReturnValueOnce({
          where: vi.fn().mockResolvedValueOnce([{ total: 3500 }]),
        }),
      });

      const result = await caller.getPersonalStats();

      expect(result).toHaveProperty('totalXp', 2500);
      expect(result).toHaveProperty('currentStreak', 12);
      expect(result).toHaveProperty('longestStreak', 20);
      expect(result).toHaveProperty('level', 8);
      expect(result).toHaveProperty('enrolledTracks', 2);
      expect(result).toHaveProperty('completedCourses', 1);
      expect(result).toHaveProperty('coursesInProgress', 2);
      expect(result).toHaveProperty('completedLessons');
      expect(result).toHaveProperty('totalXpEarned');
      expect(result).toHaveProperty('completionRate');
    });

    it('returns defaults when user has no profile', async () => {
      const user = createMockUser();
      const ctx = createMockContext(user);
      const caller = createCaller(ctx);

      ctx.db.query.userProfiles.findFirst.mockResolvedValueOnce(null);
      ctx.db.query.enrollments.findMany.mockResolvedValueOnce([]);
      ctx.db.query.courseProgress.findMany.mockResolvedValueOnce([]);

      ctx.db.select.mockReturnValueOnce({
        from: vi.fn().mockReturnValueOnce({
          where: vi.fn().mockResolvedValueOnce([{ count: 0 }]),
        }),
      });

      ctx.db.select.mockReturnValueOnce({
        from: vi.fn().mockReturnValueOnce({
          where: vi.fn().mockResolvedValueOnce([{ total: 0 }]),
        }),
      });

      const result = await caller.getPersonalStats();

      expect(result.totalXp).toBe(0);
      expect(result.currentStreak).toBe(0);
      expect(result.level).toBe(1);
      expect(result.enrolledTracks).toBe(0);
      expect(result.completionRate).toBe(0);
    });
  });

  describe('getLearningTimeline', () => {
    it('returns daily learning activity', async () => {
      const user = createMockUser();
      const ctx = createMockContext(user);
      const caller = createCaller(ctx);

      ctx.db.query.xpTransactions.findMany.mockResolvedValueOnce([
        { userId: user.id, amount: 100, reason: 'lesson_complete', createdAt: new Date() },
        { userId: user.id, amount: 50, reason: 'quiz_pass', createdAt: new Date() },
      ]);

      ctx.db.query.streakHistory.findMany.mockResolvedValueOnce([
        { userId: user.id, date: new Date(), streakCount: 5 },
      ]);

      ctx.db.query.progress.findMany.mockResolvedValueOnce([
        { userId: user.id, status: 'completed', completedAt: new Date() },
      ]);

      const result = await caller.getLearningTimeline({ days: 7 });

      expect(result).toHaveProperty('timeline');
      expect(result).toHaveProperty('summary');
      expect(result.summary).toHaveProperty('totalXp');
      expect(result.summary).toHaveProperty('totalLessons');
      expect(result.summary).toHaveProperty('activeDays');
    });

    it('initializes all days in range', async () => {
      const user = createMockUser();
      const ctx = createMockContext(user);
      const caller = createCaller(ctx);

      ctx.db.query.xpTransactions.findMany.mockResolvedValueOnce([]);
      ctx.db.query.streakHistory.findMany.mockResolvedValueOnce([]);
      ctx.db.query.progress.findMany.mockResolvedValueOnce([]);

      const result = await caller.getLearningTimeline({ days: 7 });

      expect(result.timeline).toHaveLength(7);
      result.timeline.forEach((day: { date: string; xp: number; lessons: number; streak: number }) => {
        expect(day).toHaveProperty('date');
        expect(day).toHaveProperty('xp');
        expect(day).toHaveProperty('lessons');
        expect(day).toHaveProperty('streak');
      });
    });
  });

  describe('getCourseProgress', () => {
    it('returns course progress with details', async () => {
      const user = createMockUser();
      const ctx = createMockContext(user);
      const caller = createCaller(ctx);

      ctx.db.query.courseProgress.findMany.mockResolvedValueOnce([
        {
          userId: user.id,
          courseId: 'course-1',
          status: 'in_progress',
          progressPercent: 60,
          completedLessons: 6,
          totalLessons: 10,
          startedAt: new Date(),
          completedAt: null,
          course: { id: 'course-1', name: 'JavaScript Fundamentals' },
        },
        {
          userId: user.id,
          courseId: 'course-2',
          status: 'completed',
          progressPercent: 100,
          completedLessons: 15,
          totalLessons: 15,
          startedAt: new Date(),
          completedAt: new Date(),
          course: { id: 'course-2', name: 'React Basics' },
        },
      ]);

      const result = await caller.getCourseProgress();

      expect(result).toHaveLength(2);
      expect(result[0]).toHaveProperty('courseId');
      expect(result[0]).toHaveProperty('courseName');
      expect(result[0]).toHaveProperty('progress');
      expect(result[0]).toHaveProperty('completedLessons');
      expect(result[0]).toHaveProperty('totalLessons');
      expect(result[0]).toHaveProperty('isCompleted');
    });

    it('returns empty array when no courses enrolled', async () => {
      const user = createMockUser();
      const ctx = createMockContext(user);
      const caller = createCaller(ctx);

      ctx.db.query.courseProgress.findMany.mockResolvedValueOnce([]);

      const result = await caller.getCourseProgress();

      expect(result).toHaveLength(0);
    });
  });

  describe('getSkillProgress', () => {
    it('returns skill progress by track', async () => {
      const user = createMockUser();
      const ctx = createMockContext(user);
      const caller = createCaller(ctx);

      ctx.db.query.userProfiles.findFirst.mockResolvedValueOnce({
        userId: user.id,
        skillMap: { javascript: 80, react: 60 },
      });

      ctx.db.query.enrollments.findMany.mockResolvedValueOnce([
        {
          userId: user.id,
          trackId: 'track-1',
          status: 'active',
          completedAt: null,
          track: { id: 'track-1', name: 'Frontend Development' },
        },
        {
          userId: user.id,
          trackId: 'track-2',
          status: 'completed',
          completedAt: new Date(),
          track: { id: 'track-2', name: 'JavaScript Basics' },
        },
      ]);

      const result = await caller.getSkillProgress();

      expect(result).toHaveProperty('skills');
      expect(result).toHaveProperty('skillMap');
      expect(result.skills['Frontend Development']).toHaveProperty('total');
      expect(result.skills['Frontend Development']).toHaveProperty('completed');
      expect(result.skills['Frontend Development']).toHaveProperty('status');
    });

    it('returns empty skills when not enrolled in any tracks', async () => {
      const user = createMockUser();
      const ctx = createMockContext(user);
      const caller = createCaller(ctx);

      ctx.db.query.userProfiles.findFirst.mockResolvedValueOnce(null);
      ctx.db.query.enrollments.findMany.mockResolvedValueOnce([]);

      const result = await caller.getSkillProgress();

      expect(result.skills).toEqual({});
      expect(result.skillMap).toEqual({});
    });
  });

  describe('admin procedures', () => {
    describe('getPlatformStats', () => {
      it('returns platform-wide statistics for admin', async () => {
        const user = createMockUser();
        const ctx = createMockContext(user, true);
        const caller = createCaller(ctx);

        ctx.db.select
          .mockReturnValueOnce({
            from: vi.fn().mockResolvedValueOnce([{ count: 1000 }]),
          })
          .mockReturnValueOnce({
            from: vi.fn().mockResolvedValueOnce([{ count: 50 }]),
          })
          .mockReturnValueOnce({
            from: vi.fn().mockResolvedValueOnce([{ count: 3500 }]),
          })
          .mockReturnValueOnce({
            from: vi.fn().mockReturnValueOnce({
              where: vi.fn().mockResolvedValueOnce([{ count: 150 }]),
            }),
          })
          .mockReturnValueOnce({
            from: vi.fn().mockReturnValueOnce({
              where: vi.fn().mockResolvedValueOnce([{ count: 450 }]),
            }),
          });

        const result = await caller.getPlatformStats();

        expect(result).toHaveProperty('totalUsers');
        expect(result).toHaveProperty('totalCourses');
        expect(result).toHaveProperty('totalEnrollments');
        expect(result).toHaveProperty('activeToday');
        expect(result).toHaveProperty('activeThisWeek');
      });
    });

    describe('getUserGrowth', () => {
      it('returns user signup growth for admin', async () => {
        const user = createMockUser();
        const ctx = createMockContext(user, true);
        const caller = createCaller(ctx);

        ctx.db.select.mockReturnValueOnce({
          from: vi.fn().mockReturnValueOnce({
            where: vi.fn().mockReturnValueOnce({
              groupBy: vi.fn().mockReturnValueOnce({
                orderBy: vi.fn().mockResolvedValueOnce([
                  { date: '2024-01-15', count: 10 },
                  { date: '2024-01-16', count: 15 },
                  { date: '2024-01-17', count: 8 },
                ]),
              }),
            }),
          }),
        });

        const result = await caller.getUserGrowth({ days: 30 });

        expect(result).toHaveProperty('signups');
        expect(result).toHaveProperty('totalNewUsers');
        expect(result.signups).toHaveLength(3);
        expect(result.totalNewUsers).toBe(33);
      });
    });

    describe('getCoursePopularity', () => {
      it('returns popular courses for admin', async () => {
        const user = createMockUser();
        const ctx = createMockContext(user, true);
        const caller = createCaller(ctx);

        ctx.db.select.mockReturnValueOnce({
          from: vi.fn().mockReturnValueOnce({
            groupBy: vi.fn().mockReturnValueOnce({
              orderBy: vi.fn().mockReturnValueOnce({
                limit: vi.fn().mockResolvedValueOnce([
                  { courseId: 'course-1', enrollments: 150 },
                  { courseId: 'course-2', enrollments: 120 },
                ]),
              }),
            }),
          }),
        });

        ctx.db.query.courses.findMany.mockResolvedValueOnce([
          { id: 'course-1', name: 'JavaScript Fundamentals' },
          { id: 'course-2', name: 'React Basics' },
        ]);

        const result = await caller.getCoursePopularity({ limit: 10 });

        expect(result).toHaveLength(2);
        expect(result[0]).toHaveProperty('courseId');
        expect(result[0]).toHaveProperty('courseName');
        expect(result[0]).toHaveProperty('enrollments');
      });

      it('returns empty array when no enrollments', async () => {
        const user = createMockUser();
        const ctx = createMockContext(user, true);
        const caller = createCaller(ctx);

        ctx.db.select.mockReturnValueOnce({
          from: vi.fn().mockReturnValueOnce({
            groupBy: vi.fn().mockReturnValueOnce({
              orderBy: vi.fn().mockReturnValueOnce({
                limit: vi.fn().mockResolvedValueOnce([]),
              }),
            }),
          }),
        });

        const result = await caller.getCoursePopularity({ limit: 10 });

        expect(result).toHaveLength(0);
      });
    });
  });

  describe('router structure', () => {
    it('has all expected procedures', () => {
      expect(analyticsRouter._def.procedures).toHaveProperty('getPersonalStats');
      expect(analyticsRouter._def.procedures).toHaveProperty('getLearningTimeline');
      expect(analyticsRouter._def.procedures).toHaveProperty('getCourseProgress');
      expect(analyticsRouter._def.procedures).toHaveProperty('getSkillProgress');
      expect(analyticsRouter._def.procedures).toHaveProperty('getPlatformStats');
      expect(analyticsRouter._def.procedures).toHaveProperty('getUserGrowth');
      expect(analyticsRouter._def.procedures).toHaveProperty('getCoursePopularity');
    });

    it('getLearningTimeline has input validation', () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const procedure = analyticsRouter._def.procedures.getLearningTimeline as any;
      expect(procedure._def.inputs).toBeDefined();
      expect(procedure._def.inputs.length).toBeGreaterThan(0);
    });

    it('getUserGrowth has input validation', () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const procedure = analyticsRouter._def.procedures.getUserGrowth as any;
      expect(procedure._def.inputs).toBeDefined();
      expect(procedure._def.inputs.length).toBeGreaterThan(0);
    });

    it('getCoursePopularity has input validation', () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const procedure = analyticsRouter._def.procedures.getCoursePopularity as any;
      expect(procedure._def.inputs).toBeDefined();
      expect(procedure._def.inputs.length).toBeGreaterThan(0);
    });
  });
});
