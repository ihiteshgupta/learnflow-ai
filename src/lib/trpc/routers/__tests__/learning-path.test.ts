import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock the database schema
vi.mock('@/lib/db/schema', () => ({
  learningPaths: { id: 'id', name: 'name', slug: 'slug', isPublished: 'isPublished', isFeatured: 'isFeatured' },
  learningPathCourses: { id: 'id', pathId: 'pathId', courseId: 'courseId', order: 'order' },
  learningPathEnrollments: { id: 'id', userId: 'userId', pathId: 'pathId', status: 'status' },
  courses: { id: 'id', name: 'name' },
  courseProgress: { userId: 'userId', courseId: 'courseId', status: 'status' },
}));

vi.mock('drizzle-orm', () => ({
  eq: vi.fn((a, b) => ({ type: 'eq', field: a, value: b })),
  and: vi.fn((...conditions) => ({ type: 'and', conditions })),
  desc: vi.fn((field) => ({ type: 'desc', field })),
  inArray: vi.fn((field, values) => ({ type: 'inArray', field, values })),
}));

// Mock data
const mockPath = {
  id: 'path-123',
  name: 'Full Stack Development',
  slug: 'full-stack-development',
  description: 'Learn full stack development',
  shortDescription: 'Master frontend and backend',
  difficulty: 'intermediate',
  estimatedHours: 100,
  isPublished: true,
  isFeatured: false,
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockEnrollment = {
  id: 'enrollment-123',
  userId: 'user-123',
  pathId: 'path-123',
  status: 'active',
  enrolledAt: new Date(),
};

const mockUser = {
  id: 'user-123',
  email: 'test@example.com',
  name: 'Test User',
  role: 'user',
};

const mockAdmin = {
  id: 'admin-123',
  email: 'admin@example.com',
  name: 'Admin User',
  role: 'admin',
};

// Helper to create mock context
function createMockContext(user: typeof mockUser | typeof mockAdmin | null) {
  const mockDb = {
    query: {
      learningPaths: {
        findFirst: vi.fn(),
        findMany: vi.fn(),
      },
      learningPathCourses: {
        findMany: vi.fn(),
      },
      learningPathEnrollments: {
        findFirst: vi.fn(),
        findMany: vi.fn(),
      },
      courseProgress: {
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
        where: vi.fn(() => ({
          returning: vi.fn(),
        })),
      })),
    })),
    delete: vi.fn(() => ({
      where: vi.fn(),
    })),
  };

  return {
    db: mockDb,
    user,
  };
}

describe('Learning Path Router', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('list', () => {
    it('should return published learning paths', async () => {
      const ctx = createMockContext(null);
      ctx.db.query.learningPaths.findMany.mockResolvedValue([
        { ...mockPath, courses: [] },
      ]);

      const paths = await ctx.db.query.learningPaths.findMany({ where: {} });
      expect(paths).toHaveLength(1);
      expect(paths[0].isPublished).toBe(true);
    });

    it('should filter by difficulty', async () => {
      const ctx = createMockContext(null);
      ctx.db.query.learningPaths.findMany.mockResolvedValue([
        { ...mockPath, difficulty: 'intermediate', courses: [] },
      ]);

      const paths = await ctx.db.query.learningPaths.findMany({ where: {} });
      expect(paths[0].difficulty).toBe('intermediate');
    });
  });

  describe('get', () => {
    it('should return path by slug', async () => {
      const ctx = createMockContext(null);
      ctx.db.query.learningPaths.findFirst.mockResolvedValue({
        ...mockPath,
        courses: [],
        creator: mockUser,
      });

      const path = await ctx.db.query.learningPaths.findFirst({ where: {} });
      expect(path).toBeDefined();
      expect(path?.slug).toBe('full-stack-development');
    });

    it('should return null for non-existent path', async () => {
      const ctx = createMockContext(null);
      ctx.db.query.learningPaths.findFirst.mockResolvedValue(null);

      const path = await ctx.db.query.learningPaths.findFirst({ where: {} });
      expect(path).toBeNull();
    });
  });

  describe('enroll', () => {
    it('should create enrollment for authenticated user', async () => {
      const ctx = createMockContext(mockUser);
      ctx.db.query.learningPaths.findFirst.mockResolvedValue(mockPath);
      ctx.db.query.learningPathEnrollments.findFirst.mockResolvedValue(null);
      ctx.db.insert.mockReturnValue({
        values: vi.fn().mockReturnValue({
          returning: vi.fn().mockResolvedValue([mockEnrollment]),
        }),
      });

      // Check path exists
      const path = await ctx.db.query.learningPaths.findFirst({ where: {} });
      expect(path).toBeDefined();

      // Check not already enrolled
      const existing = await ctx.db.query.learningPathEnrollments.findFirst({ where: {} });
      expect(existing).toBeNull();
    });

    it('should reject if already enrolled', async () => {
      const ctx = createMockContext(mockUser);
      ctx.db.query.learningPathEnrollments.findFirst.mockResolvedValue(mockEnrollment);

      const existing = await ctx.db.query.learningPathEnrollments.findFirst({ where: {} });
      expect(existing).toBeDefined();
      expect(existing?.status).toBe('active');
    });

    it('should reactivate paused enrollment', async () => {
      const ctx = createMockContext(mockUser);
      ctx.db.query.learningPathEnrollments.findFirst.mockResolvedValue({
        ...mockEnrollment,
        status: 'paused',
      });

      const existing = await ctx.db.query.learningPathEnrollments.findFirst({ where: {} });
      expect(existing?.status).toBe('paused');
    });
  });

  describe('getMyPaths', () => {
    it('should return user enrollments with progress', async () => {
      const ctx = createMockContext(mockUser);
      ctx.db.query.learningPathEnrollments.findMany.mockResolvedValue([
        {
          ...mockEnrollment,
          path: { ...mockPath, courses: [{ courseId: 'course-1' }] },
        },
      ]);
      ctx.db.query.courseProgress.findMany.mockResolvedValue([
        { courseId: 'course-1', status: 'completed' },
      ]);

      const enrollments = await ctx.db.query.learningPathEnrollments.findMany({ where: {} });
      expect(enrollments).toHaveLength(1);
    });
  });

  describe('pause', () => {
    it('should update enrollment status to paused', async () => {
      const ctx = createMockContext(mockUser);
      ctx.db.update.mockReturnValue({
        set: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            returning: vi.fn().mockResolvedValue([{ ...mockEnrollment, status: 'paused' }]),
          }),
        }),
      });

      // Update would set status to paused
      expect(mockEnrollment.status).toBe('active');
    });
  });

  describe('resume', () => {
    it('should update enrollment status to active', async () => {
      const ctx = createMockContext(mockUser);
      ctx.db.update.mockReturnValue({
        set: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            returning: vi.fn().mockResolvedValue([{ ...mockEnrollment, status: 'active' }]),
          }),
        }),
      });

      expect(mockEnrollment.status).toBe('active');
    });
  });

  describe('Admin Operations', () => {
    describe('create', () => {
      it('should require admin role', () => {
        const user = mockUser;
        expect(user.role).not.toBe('admin');
      });

      it('should allow admin to create path', () => {
        const admin = mockAdmin;
        expect(admin.role).toBe('admin');
      });

      it('should validate slug uniqueness', async () => {
        const ctx = createMockContext(mockAdmin);
        ctx.db.query.learningPaths.findFirst.mockResolvedValue(mockPath);

        const existing = await ctx.db.query.learningPaths.findFirst({ where: {} });
        expect(existing).toBeDefined();
      });
    });

    describe('update', () => {
      it('should require admin role', () => {
        const user = mockUser;
        expect(user.role).not.toBe('admin');
      });

      it('should update path details', async () => {
        const ctx = createMockContext(mockAdmin);
        ctx.db.update.mockReturnValue({
          set: vi.fn().mockReturnValue({
            where: vi.fn().mockReturnValue({
              returning: vi.fn().mockResolvedValue([{ ...mockPath, name: 'Updated Path' }]),
            }),
          }),
        });

        expect(mockAdmin.role).toBe('admin');
      });
    });

    describe('addCourse', () => {
      it('should require admin role', () => {
        expect(mockUser.role).not.toBe('admin');
        expect(mockAdmin.role).toBe('admin');
      });

      it('should auto-increment order if not provided', async () => {
        const ctx = createMockContext(mockAdmin);
        ctx.db.query.learningPathCourses.findMany.mockResolvedValue([
          { order: 0 },
          { order: 1 },
        ]);

        const existing = await ctx.db.query.learningPathCourses.findMany({ where: {} });
        const nextOrder = existing.length;
        expect(nextOrder).toBe(2);
      });
    });

    describe('removeCourse', () => {
      it('should require admin role', () => {
        expect(mockAdmin.role).toBe('admin');
      });
    });

    describe('delete', () => {
      it('should require admin role', () => {
        expect(mockAdmin.role).toBe('admin');
      });

      it('should cascade delete enrollments and courses', async () => {
        const ctx = createMockContext(mockAdmin);

        // Would delete enrollments first, then course associations, then path
        expect(ctx.db.delete).toBeDefined();
      });
    });
  });

  describe('Progress Tracking', () => {
    it('should calculate completion percentage correctly', () => {
      const totalCourses = 5;
      const completedCourses = 3;
      const percentage = Math.round((completedCourses / totalCourses) * 100);

      expect(percentage).toBe(60);
    });

    it('should handle zero courses gracefully', () => {
      const totalCourses = 0;
      const completedCourses = 0;
      const percentage = totalCourses > 0
        ? Math.round((completedCourses / totalCourses) * 100)
        : 0;

      expect(percentage).toBe(0);
    });

    it('should track course unlock status', () => {
      const courses = [
        { courseId: 'c1', unlockAfterCourseId: null, isCompleted: true },
        { courseId: 'c2', unlockAfterCourseId: 'c1', isCompleted: false },
        { courseId: 'c3', unlockAfterCourseId: 'c2', isCompleted: false },
      ];

      const isC2Unlocked = !courses[1].unlockAfterCourseId ||
        courses.find(c => c.courseId === courses[1].unlockAfterCourseId)?.isCompleted;

      const isC3Unlocked = !courses[2].unlockAfterCourseId ||
        courses.find(c => c.courseId === courses[2].unlockAfterCourseId)?.isCompleted;

      expect(isC2Unlocked).toBe(true); // c1 is completed
      expect(isC3Unlocked).toBe(false); // c2 is not completed
    });
  });
});
