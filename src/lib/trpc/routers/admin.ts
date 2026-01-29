import { z } from 'zod';
import { router, protectedProcedure } from '../trpc';
import {
  users,
  courses,
  courseProgress,
  userProfiles,
  certifications,
  learningPaths,
  learningPathEnrollments,
  organizations,
  organizationMembers,
} from '@/lib/db/schema';
import { eq, desc, sql, count, and, gte, lt } from 'drizzle-orm';
import { TRPCError } from '@trpc/server';

// Helper to check admin role
function requireAdmin(role: string) {
  if (role !== 'admin') {
    throw new TRPCError({ code: 'FORBIDDEN', message: 'Admin access required' });
  }
}

export const adminRouter = router({
  // Get platform overview stats
  getStats: protectedProcedure.query(async ({ ctx }) => {
    requireAdmin(ctx.user.role);

    // Get total counts
    const [userCount] = await ctx.db.select({ count: count() }).from(users);
    const [courseCount] = await ctx.db.select({ count: count() }).from(courses);
    const [pathCount] = await ctx.db.select({ count: count() }).from(learningPaths);
    const [certCount] = await ctx.db.select({ count: count() }).from(certifications);

    // Get active enrollments (completed + in progress)
    const [activeEnrollments] = await ctx.db
      .select({ count: count() })
      .from(courseProgress)
      .where(eq(courseProgress.status, 'in_progress'));

    const [completedEnrollments] = await ctx.db
      .select({ count: count() })
      .from(courseProgress)
      .where(eq(courseProgress.status, 'completed'));

    // Get new users this week
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    const [newUsersThisWeek] = await ctx.db
      .select({ count: count() })
      .from(users)
      .where(gte(users.createdAt, oneWeekAgo));

    return {
      totalUsers: userCount?.count || 0,
      totalCourses: courseCount?.count || 0,
      totalPaths: pathCount?.count || 0,
      totalCertifications: certCount?.count || 0,
      activeEnrollments: activeEnrollments?.count || 0,
      completedEnrollments: completedEnrollments?.count || 0,
      newUsersThisWeek: newUsersThisWeek?.count || 0,
    };
  }),

  // Get recent activity
  getRecentActivity: protectedProcedure
    .input(z.object({ limit: z.number().min(1).max(50).default(10) }).optional())
    .query(async ({ ctx, input }) => {
      requireAdmin(ctx.user.role);

      // Get recent course completions
      const recentCompletions = await ctx.db.query.courseProgress.findMany({
        where: eq(courseProgress.status, 'completed'),
        orderBy: [desc(courseProgress.updatedAt)],
        limit: input?.limit || 10,
        with: {
          user: {
            columns: { id: true, name: true, email: true, avatarUrl: true },
          },
          course: {
            columns: { id: true, name: true },
          },
        },
      });

      return recentCompletions.map(c => ({
        type: 'course_completed' as const,
        userId: c.userId,
        user: c.user,
        course: c.course,
        timestamp: c.updatedAt,
      }));
    }),

  // ============ User Management ============

  // List users with pagination
  listUsers: protectedProcedure
    .input(z.object({
      search: z.string().optional(),
      role: z.enum(['user', 'admin']).optional(),
      limit: z.number().min(1).max(100).default(20),
      offset: z.number().min(0).default(0),
    }).optional())
    .query(async ({ ctx, input }) => {
      requireAdmin(ctx.user.role);

      const allUsers = await ctx.db.query.users.findMany({
        orderBy: [desc(users.createdAt)],
        limit: input?.limit || 20,
        offset: input?.offset || 0,
        with: {
          profile: true,
        },
      });

      // Filter by search if provided
      let filteredUsers = allUsers;
      if (input?.search) {
        const searchLower = input.search.toLowerCase();
        filteredUsers = allUsers.filter(u =>
          u.name?.toLowerCase().includes(searchLower) ||
          u.email?.toLowerCase().includes(searchLower)
        );
      }

      // Filter by role if provided
      if (input?.role) {
        filteredUsers = filteredUsers.filter(u => u.role === input.role);
      }

      return filteredUsers;
    }),

  // Get user details
  getUser: protectedProcedure
    .input(z.object({ userId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      requireAdmin(ctx.user.role);

      const user = await ctx.db.query.users.findFirst({
        where: eq(users.id, input.userId),
        with: {
          profile: true,
        },
      });

      if (!user) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'User not found' });
      }

      // Get user's course progress
      const progress = await ctx.db.query.courseProgress.findMany({
        where: eq(courseProgress.userId, input.userId),
        with: {
          course: {
            columns: { id: true, name: true },
          },
        },
      });

      // Get user's certifications
      const certs = await ctx.db.query.certifications.findMany({
        where: eq(certifications.userId, input.userId),
        with: {
          course: {
            columns: { id: true, name: true },
          },
        },
      });

      return {
        ...user,
        courseProgress: progress,
        certifications: certs,
      };
    }),

  // Update user role
  updateUserRole: protectedProcedure
    .input(z.object({
      userId: z.string().uuid(),
      role: z.enum(['user', 'admin']),
    }))
    .mutation(async ({ ctx, input }) => {
      requireAdmin(ctx.user.role);

      // Can't change own role
      if (input.userId === ctx.user.id) {
        throw new TRPCError({ code: 'BAD_REQUEST', message: 'Cannot change your own role' });
      }

      const [updated] = await ctx.db
        .update(users)
        .set({ role: input.role, updatedAt: new Date() })
        .where(eq(users.id, input.userId))
        .returning();

      if (!updated) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'User not found' });
      }

      return updated;
    }),

  // ============ Course Management ============

  // List all courses (including unpublished)
  listCourses: protectedProcedure
    .input(z.object({
      published: z.boolean().optional(),
      limit: z.number().min(1).max(100).default(20),
      offset: z.number().min(0).default(0),
    }).optional())
    .query(async ({ ctx, input }) => {
      requireAdmin(ctx.user.role);

      const filters = [];
      if (input?.published !== undefined) {
        filters.push(eq(courses.isPublished, input.published));
      }

      const allCourses = await ctx.db.query.courses.findMany({
        where: filters.length > 0 ? and(...filters) : undefined,
        orderBy: [desc(courses.createdAt)],
        limit: input?.limit || 20,
        offset: input?.offset || 0,
        with: {
          track: {
            columns: { id: true, name: true },
          },
          modules: {
            columns: { id: true },
          },
        },
      });

      // Get enrollment counts
      const courseIds = allCourses.map(c => c.id);
      const enrollmentCounts = await Promise.all(
        courseIds.map(async (courseId) => {
          const [result] = await ctx.db
            .select({ count: count() })
            .from(courseProgress)
            .where(eq(courseProgress.courseId, courseId));
          return { courseId, count: result?.count || 0 };
        })
      );

      const enrollmentMap = new Map(enrollmentCounts.map(e => [e.courseId, e.count]));

      return allCourses.map(course => ({
        ...course,
        moduleCount: course.modules.length,
        enrollmentCount: enrollmentMap.get(course.id) || 0,
      }));
    }),

  // Publish/unpublish course
  toggleCoursePublished: protectedProcedure
    .input(z.object({
      courseId: z.string().uuid(),
      isPublished: z.boolean(),
    }))
    .mutation(async ({ ctx, input }) => {
      requireAdmin(ctx.user.role);

      const [updated] = await ctx.db
        .update(courses)
        .set({ isPublished: input.isPublished })
        .where(eq(courses.id, input.courseId))
        .returning();

      if (!updated) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Course not found' });
      }

      return updated;
    }),

  // ============ Learning Path Management ============

  // List all learning paths (including unpublished)
  listPaths: protectedProcedure
    .input(z.object({
      published: z.boolean().optional(),
      limit: z.number().min(1).max(100).default(20),
      offset: z.number().min(0).default(0),
    }).optional())
    .query(async ({ ctx, input }) => {
      requireAdmin(ctx.user.role);

      const filters = [];
      if (input?.published !== undefined) {
        filters.push(eq(learningPaths.isPublished, input.published));
      }

      const paths = await ctx.db.query.learningPaths.findMany({
        where: filters.length > 0 ? and(...filters) : undefined,
        orderBy: [desc(learningPaths.createdAt)],
        limit: input?.limit || 20,
        offset: input?.offset || 0,
        with: {
          courses: {
            columns: { id: true },
          },
          enrollments: {
            columns: { id: true },
          },
        },
      });

      return paths.map(path => ({
        ...path,
        courseCount: path.courses.length,
        enrollmentCount: path.enrollments.length,
      }));
    }),

  // Toggle path published
  togglePathPublished: protectedProcedure
    .input(z.object({
      pathId: z.string().uuid(),
      isPublished: z.boolean(),
    }))
    .mutation(async ({ ctx, input }) => {
      requireAdmin(ctx.user.role);

      const [updated] = await ctx.db
        .update(learningPaths)
        .set({ isPublished: input.isPublished, updatedAt: new Date() })
        .where(eq(learningPaths.id, input.pathId))
        .returning();

      if (!updated) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Learning path not found' });
      }

      return updated;
    }),

  // Toggle path featured
  togglePathFeatured: protectedProcedure
    .input(z.object({
      pathId: z.string().uuid(),
      isFeatured: z.boolean(),
    }))
    .mutation(async ({ ctx, input }) => {
      requireAdmin(ctx.user.role);

      const [updated] = await ctx.db
        .update(learningPaths)
        .set({ isFeatured: input.isFeatured, updatedAt: new Date() })
        .where(eq(learningPaths.id, input.pathId))
        .returning();

      if (!updated) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Learning path not found' });
      }

      return updated;
    }),

  // ============ Organization Management ============

  // List all organizations
  listOrganizations: protectedProcedure
    .input(z.object({
      limit: z.number().min(1).max(100).default(20),
      offset: z.number().min(0).default(0),
    }).optional())
    .query(async ({ ctx, input }) => {
      requireAdmin(ctx.user.role);

      const orgs = await ctx.db.query.organizations.findMany({
        orderBy: [desc(organizations.createdAt)],
        limit: input?.limit || 20,
        offset: input?.offset || 0,
        with: {
          members: {
            columns: { id: true },
          },
          teams: {
            columns: { id: true },
          },
        },
      });

      return orgs.map(org => ({
        ...org,
        memberCount: org.members.length,
        teamCount: org.teams.length,
      }));
    }),

  // ============ Certification Management ============

  // List pending Gold certifications
  listPendingCertifications: protectedProcedure
    .input(z.object({
      limit: z.number().min(1).max(50).default(20),
    }).optional())
    .query(async ({ ctx, input }) => {
      requireAdmin(ctx.user.role);

      const pending = await ctx.db.query.certifications.findMany({
        where: and(
          eq(certifications.tier, 'gold'),
          eq(certifications.status, 'pending')
        ),
        orderBy: [desc(certifications.createdAt)],
        limit: input?.limit || 20,
        with: {
          user: {
            columns: { id: true, name: true, email: true, avatarUrl: true },
          },
          course: {
            columns: { id: true, name: true },
          },
        },
      });

      return pending;
    }),

  // Approve/reject Gold certification
  reviewCertification: protectedProcedure
    .input(z.object({
      certificationId: z.string().uuid(),
      action: z.enum(['approve', 'reject']),
      feedback: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      requireAdmin(ctx.user.role);

      const cert = await ctx.db.query.certifications.findFirst({
        where: eq(certifications.id, input.certificationId),
      });

      if (!cert) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Certification not found' });
      }

      if (cert.status !== 'pending') {
        throw new TRPCError({ code: 'BAD_REQUEST', message: 'Certification is not pending' });
      }

      const [updated] = await ctx.db
        .update(certifications)
        .set({
          status: input.action === 'approve' ? 'active' : 'rejected',
          issuedAt: input.action === 'approve' ? new Date() : null,
          reviewedBy: ctx.user.id,
          reviewFeedback: input.feedback,
        })
        .where(eq(certifications.id, input.certificationId))
        .returning();

      return updated;
    }),
});
