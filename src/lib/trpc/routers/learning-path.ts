import { z } from 'zod';
import { router, protectedProcedure, publicProcedure } from '../trpc';
import {
  learningPaths,
  learningPathCourses,
  learningPathEnrollments,
  courses,
  courseProgress,
} from '@/lib/db/schema';
import { eq, and, desc, sql, count, inArray } from 'drizzle-orm';
import { TRPCError } from '@trpc/server';

export const learningPathRouter = router({
  // List all published learning paths
  list: publicProcedure
    .input(z.object({
      difficulty: z.enum(['beginner', 'intermediate', 'advanced', 'expert']).optional(),
      featured: z.boolean().optional(),
      limit: z.number().min(1).max(50).default(20),
      offset: z.number().min(0).default(0),
    }).optional())
    .query(async ({ ctx, input }) => {
      const filters = [];
      filters.push(eq(learningPaths.isPublished, true));

      if (input?.difficulty) {
        filters.push(eq(learningPaths.difficulty, input.difficulty));
      }
      if (input?.featured) {
        filters.push(eq(learningPaths.isFeatured, true));
      }

      const paths = await ctx.db.query.learningPaths.findMany({
        where: and(...filters),
        orderBy: [desc(learningPaths.isFeatured), desc(learningPaths.createdAt)],
        limit: input?.limit || 20,
        offset: input?.offset || 0,
        with: {
          courses: {
            orderBy: (lpc, { asc }) => [asc(lpc.order)],
            with: {
              course: {
                columns: { id: true, name: true },
              },
            },
          },
        },
      });

      return paths.map(path => ({
        ...path,
        courseCount: path.courses.length,
      }));
    }),

  // Get learning path by ID or slug
  get: publicProcedure
    .input(z.object({
      id: z.string().uuid().optional(),
      slug: z.string().optional(),
    }).refine(data => data.id || data.slug, {
      message: 'Either id or slug must be provided',
    }))
    .query(async ({ ctx, input }) => {
      const path = await ctx.db.query.learningPaths.findFirst({
        where: input.id
          ? eq(learningPaths.id, input.id)
          : eq(learningPaths.slug, input.slug!),
        with: {
          creator: {
            columns: { id: true, name: true, avatarUrl: true },
          },
          courses: {
            orderBy: (lpc, { asc }) => [asc(lpc.order)],
            with: {
              course: {
                with: {
                  modules: {
                    columns: { id: true, name: true },
                  },
                },
              },
            },
          },
        },
      });

      if (!path) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Learning path not found' });
      }

      return path;
    }),

  // Get featured learning paths
  getFeatured: publicProcedure
    .input(z.object({ limit: z.number().min(1).max(10).default(4) }).optional())
    .query(async ({ ctx, input }) => {
      return ctx.db.query.learningPaths.findMany({
        where: and(
          eq(learningPaths.isPublished, true),
          eq(learningPaths.isFeatured, true)
        ),
        limit: input?.limit || 4,
        with: {
          courses: {
            columns: { id: true },
          },
        },
      });
    }),

  // Enroll in learning path
  enroll: protectedProcedure
    .input(z.object({ pathId: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      // Check if path exists and is published
      const path = await ctx.db.query.learningPaths.findFirst({
        where: and(
          eq(learningPaths.id, input.pathId),
          eq(learningPaths.isPublished, true)
        ),
      });

      if (!path) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Learning path not found' });
      }

      // Check if already enrolled
      const existing = await ctx.db.query.learningPathEnrollments.findFirst({
        where: and(
          eq(learningPathEnrollments.userId, ctx.user.id),
          eq(learningPathEnrollments.pathId, input.pathId)
        ),
      });

      if (existing) {
        // Reactivate if paused
        if (existing.status === 'paused') {
          const [updated] = await ctx.db
            .update(learningPathEnrollments)
            .set({ status: 'active', lastActivityAt: new Date() })
            .where(eq(learningPathEnrollments.id, existing.id))
            .returning();
          return updated;
        }
        throw new TRPCError({ code: 'CONFLICT', message: 'Already enrolled in this path' });
      }

      // Create enrollment
      const [enrollment] = await ctx.db
        .insert(learningPathEnrollments)
        .values({
          userId: ctx.user.id,
          pathId: input.pathId,
        })
        .returning();

      return enrollment;
    }),

  // Get user's enrolled paths with progress
  getMyPaths: protectedProcedure.query(async ({ ctx }) => {
    const enrollments = await ctx.db.query.learningPathEnrollments.findMany({
      where: eq(learningPathEnrollments.userId, ctx.user.id),
      orderBy: [desc(learningPathEnrollments.lastActivityAt)],
      with: {
        path: {
          with: {
            courses: {
              orderBy: (lpc, { asc }) => [asc(lpc.order)],
              with: {
                course: {
                  columns: { id: true, name: true },
                },
              },
            },
          },
        },
      },
    });

    // Get course progress for all courses in enrolled paths
    const allCourseIds = enrollments.flatMap(e =>
      e.path.courses.map(c => c.courseId)
    );

    const progress = allCourseIds.length > 0
      ? await ctx.db.query.courseProgress.findMany({
          where: and(
            eq(courseProgress.userId, ctx.user.id),
            inArray(courseProgress.courseId, allCourseIds)
          ),
        })
      : [];

    type CourseProgressItem = { courseId: string; status: string };
    const progressMap = new Map(progress.map((p: CourseProgressItem) => [p.courseId, p]));

    return enrollments.map(enrollment => {
      const courseCount = enrollment.path.courses.length;
      const completedCount = enrollment.path.courses.filter(c => {
        const p = progressMap.get(c.courseId) as CourseProgressItem | undefined;
        return p?.status === 'completed';
      }).length;

      return {
        ...enrollment,
        progress: {
          completedCourses: completedCount,
          totalCourses: courseCount,
          percentage: courseCount > 0 ? Math.round((completedCount / courseCount) * 100) : 0,
        },
      };
    });
  }),

  // Get progress for a specific path
  getProgress: protectedProcedure
    .input(z.object({ pathId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const enrollment = await ctx.db.query.learningPathEnrollments.findFirst({
        where: and(
          eq(learningPathEnrollments.userId, ctx.user.id),
          eq(learningPathEnrollments.pathId, input.pathId)
        ),
        with: {
          path: {
            with: {
              courses: {
                orderBy: (lpc, { asc }) => [asc(lpc.order)],
                with: {
                  course: true,
                },
              },
            },
          },
        },
      });

      if (!enrollment) {
        return null;
      }

      // Get progress for each course
      const courseIds = enrollment.path.courses.map(c => c.courseId);
      const progress = courseIds.length > 0
        ? await ctx.db.query.courseProgress.findMany({
            where: and(
              eq(courseProgress.userId, ctx.user.id),
              inArray(courseProgress.courseId, courseIds)
            ),
          })
        : [];

      type CourseProgressEntry = { courseId: string; status: string };
      const progressMap = new Map(progress.map((p: CourseProgressEntry) => [p.courseId, p]));

      const coursesWithProgress = enrollment.path.courses.map(lpc => {
        const courseProg = progressMap.get(lpc.courseId) as CourseProgressEntry | undefined;
        const unlockProg = progressMap.get(lpc.unlockAfterCourseId || '') as CourseProgressEntry | undefined;
        const isUnlocked = !lpc.unlockAfterCourseId || unlockProg?.status === 'completed';

        return {
          ...lpc,
          progress: courseProg || null,
          isUnlocked,
          isCompleted: courseProg?.status === 'completed',
        };
      });

      const completedCount = coursesWithProgress.filter(c => c.isCompleted).length;

      return {
        enrollment,
        courses: coursesWithProgress,
        summary: {
          completedCourses: completedCount,
          totalCourses: coursesWithProgress.length,
          percentage: coursesWithProgress.length > 0
            ? Math.round((completedCount / coursesWithProgress.length) * 100)
            : 0,
        },
      };
    }),

  // Pause enrollment
  pause: protectedProcedure
    .input(z.object({ pathId: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const [updated] = await ctx.db
        .update(learningPathEnrollments)
        .set({ status: 'paused' })
        .where(and(
          eq(learningPathEnrollments.userId, ctx.user.id),
          eq(learningPathEnrollments.pathId, input.pathId)
        ))
        .returning();

      if (!updated) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Enrollment not found' });
      }

      return updated;
    }),

  // Resume enrollment
  resume: protectedProcedure
    .input(z.object({ pathId: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const [updated] = await ctx.db
        .update(learningPathEnrollments)
        .set({ status: 'active', lastActivityAt: new Date() })
        .where(and(
          eq(learningPathEnrollments.userId, ctx.user.id),
          eq(learningPathEnrollments.pathId, input.pathId)
        ))
        .returning();

      if (!updated) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Enrollment not found' });
      }

      return updated;
    }),

  // Unenroll from path
  unenroll: protectedProcedure
    .input(z.object({ pathId: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db
        .delete(learningPathEnrollments)
        .where(and(
          eq(learningPathEnrollments.userId, ctx.user.id),
          eq(learningPathEnrollments.pathId, input.pathId)
        ));

      return { success: true };
    }),

  // ============ Admin Operations ============

  // Create learning path (admin only)
  create: protectedProcedure
    .input(z.object({
      name: z.string().min(3).max(255),
      slug: z.string().min(3).max(255).regex(/^[a-z0-9-]+$/),
      description: z.string().optional(),
      shortDescription: z.string().max(500).optional(),
      difficulty: z.enum(['beginner', 'intermediate', 'advanced', 'expert']).default('beginner'),
      estimatedHours: z.number().min(1).optional(),
      imageUrl: z.string().url().optional(),
      tags: z.array(z.string()).optional(),
      outcomes: z.array(z.string()).optional(),
      prerequisites: z.array(z.string()).optional(),
      targetAudience: z.string().max(255).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      // Check admin role
      if (ctx.user.role !== 'admin') {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Admin access required' });
      }

      // Check slug uniqueness
      const existing = await ctx.db.query.learningPaths.findFirst({
        where: eq(learningPaths.slug, input.slug),
      });

      if (existing) {
        throw new TRPCError({ code: 'CONFLICT', message: 'Slug already exists' });
      }

      const [path] = await ctx.db
        .insert(learningPaths)
        .values({
          ...input,
          createdBy: ctx.user.id,
        })
        .returning();

      return path;
    }),

  // Update learning path (admin only)
  update: protectedProcedure
    .input(z.object({
      id: z.string().uuid(),
      name: z.string().min(3).max(255).optional(),
      description: z.string().optional(),
      shortDescription: z.string().max(500).optional(),
      difficulty: z.enum(['beginner', 'intermediate', 'advanced', 'expert']).optional(),
      estimatedHours: z.number().min(1).optional(),
      imageUrl: z.string().url().optional(),
      tags: z.array(z.string()).optional(),
      outcomes: z.array(z.string()).optional(),
      prerequisites: z.array(z.string()).optional(),
      targetAudience: z.string().max(255).optional(),
      isPublished: z.boolean().optional(),
      isFeatured: z.boolean().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      if (ctx.user.role !== 'admin') {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Admin access required' });
      }

      const { id, ...data } = input;

      const [updated] = await ctx.db
        .update(learningPaths)
        .set({ ...data, updatedAt: new Date() })
        .where(eq(learningPaths.id, id))
        .returning();

      if (!updated) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Learning path not found' });
      }

      return updated;
    }),

  // Add course to path (admin only)
  addCourse: protectedProcedure
    .input(z.object({
      pathId: z.string().uuid(),
      courseId: z.string().uuid(),
      order: z.number().min(0).optional(),
      isOptional: z.boolean().optional(),
      unlockAfterCourseId: z.string().uuid().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      if (ctx.user.role !== 'admin') {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Admin access required' });
      }

      // Get current max order if not provided
      let order = input.order;
      if (order === undefined) {
        const existing = await ctx.db.query.learningPathCourses.findMany({
          where: eq(learningPathCourses.pathId, input.pathId),
        });
        order = existing.length;
      }

      const [added] = await ctx.db
        .insert(learningPathCourses)
        .values({
          pathId: input.pathId,
          courseId: input.courseId,
          order,
          isOptional: input.isOptional ?? false,
          unlockAfterCourseId: input.unlockAfterCourseId,
        })
        .returning();

      return added;
    }),

  // Remove course from path (admin only)
  removeCourse: protectedProcedure
    .input(z.object({
      pathId: z.string().uuid(),
      courseId: z.string().uuid(),
    }))
    .mutation(async ({ ctx, input }) => {
      if (ctx.user.role !== 'admin') {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Admin access required' });
      }

      await ctx.db
        .delete(learningPathCourses)
        .where(and(
          eq(learningPathCourses.pathId, input.pathId),
          eq(learningPathCourses.courseId, input.courseId)
        ));

      return { success: true };
    }),

  // Reorder courses in path (admin only)
  reorderCourses: protectedProcedure
    .input(z.object({
      pathId: z.string().uuid(),
      courseOrders: z.array(z.object({
        courseId: z.string().uuid(),
        order: z.number().min(0),
      })),
    }))
    .mutation(async ({ ctx, input }) => {
      if (ctx.user.role !== 'admin') {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Admin access required' });
      }

      // Update each course order
      await Promise.all(
        input.courseOrders.map(({ courseId, order }) =>
          ctx.db
            .update(learningPathCourses)
            .set({ order })
            .where(and(
              eq(learningPathCourses.pathId, input.pathId),
              eq(learningPathCourses.courseId, courseId)
            ))
        )
      );

      return { success: true };
    }),

  // Delete learning path (admin only)
  delete: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      if (ctx.user.role !== 'admin') {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Admin access required' });
      }

      // Delete enrollments first
      await ctx.db
        .delete(learningPathEnrollments)
        .where(eq(learningPathEnrollments.pathId, input.id));

      // Delete course associations
      await ctx.db
        .delete(learningPathCourses)
        .where(eq(learningPathCourses.pathId, input.id));

      // Delete path
      await ctx.db
        .delete(learningPaths)
        .where(eq(learningPaths.id, input.id));

      return { success: true };
    }),
});
