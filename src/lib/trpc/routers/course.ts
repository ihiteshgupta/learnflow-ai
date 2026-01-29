import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { router, protectedProcedure, publicProcedure } from '../trpc';
import { tracks, courses, lessons, enrollments, progress } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';

export const courseRouter = router({
  getDomains: publicProcedure.query(async ({ ctx }) => {
    return ctx.db.query.domains.findMany({
      orderBy: (domains, { asc }) => [asc(domains.order)],
    });
  }),

  getTracks: protectedProcedure
    .input(z.object({
      domainId: z.string().uuid().optional(),
    }).optional())
    .query(async ({ ctx, input }) => {
      const tracksData = await ctx.db.query.tracks.findMany({
        where: input?.domainId ? eq(tracks.domainId, input.domainId) : undefined,
        with: {
          domain: true,
          courses: {
            with: {
              modules: true,
            },
          },
        },
      });

      const userEnrollments = await ctx.db.query.enrollments.findMany({
        where: eq(enrollments.userId, ctx.user.id),
      });

      return tracksData.map((track) => ({
        ...track,
        enrollment: userEnrollments.find((e) => e.trackId === track.id),
        totalModules: track.courses.reduce((acc, c) => acc + c.modules.length, 0),
        totalCourses: track.courses.length,
      }));
    }),

  getTrack: protectedProcedure
    .input(z.object({ trackId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const track = await ctx.db.query.tracks.findFirst({
        where: eq(tracks.id, input.trackId),
        with: {
          domain: true,
          courses: {
            orderBy: (courses, { asc }) => [asc(courses.order)],
            with: {
              modules: {
                orderBy: (modules, { asc }) => [asc(modules.order)],
              },
            },
          },
        },
      });

      if (!track) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Track not found' });
      }

      const enrollment = await ctx.db.query.enrollments.findFirst({
        where: and(
          eq(enrollments.userId, ctx.user.id),
          eq(enrollments.trackId, input.trackId)
        ),
      });

      return { ...track, enrollment };
    }),

  getCourse: protectedProcedure
    .input(z.object({ courseId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const course = await ctx.db.query.courses.findFirst({
        where: eq(courses.id, input.courseId),
        with: {
          track: true,
          modules: {
            orderBy: (modules, { asc }) => [asc(modules.order)],
            with: {
              lessons: {
                orderBy: (lessons, { asc }) => [asc(lessons.order)],
              },
            },
          },
        },
      });

      if (!course) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Course not found' });
      }

      // Get all lesson IDs for this course
      const lessonIds = course.modules.flatMap((m) => m.lessons.map((l) => l.id));

      // Get user progress
      const userProgress = await ctx.db.query.progress.findMany({
        where: and(
          eq(progress.userId, ctx.user.id),
        ),
      });

      const completedLessons = userProgress.filter(
        (p) => p.status === 'completed' && lessonIds.includes(p.lessonId)
      ).length;

      return {
        ...course,
        progress: userProgress.filter((p) => lessonIds.includes(p.lessonId)),
        completionPercentage: lessonIds.length > 0
          ? Math.round((completedLessons / lessonIds.length) * 100)
          : 0,
      };
    }),

  getLesson: protectedProcedure
    .input(z.object({ lessonId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const lesson = await ctx.db.query.lessons.findFirst({
        where: eq(lessons.id, input.lessonId),
        with: {
          module: {
            with: {
              course: {
                with: {
                  track: true,
                },
              },
            },
          },
        },
      });

      if (!lesson) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Lesson not found' });
      }

      // Get or create progress
      let userProgress = await ctx.db.query.progress.findFirst({
        where: and(
          eq(progress.userId, ctx.user.id),
          eq(progress.lessonId, input.lessonId)
        ),
      });

      if (!userProgress) {
        const [newProgress] = await ctx.db
          .insert(progress)
          .values({
            userId: ctx.user.id,
            lessonId: input.lessonId,
            status: 'in_progress',
          })
          .returning();
        userProgress = newProgress;
      }

      return { lesson, progress: userProgress };
    }),

  enroll: protectedProcedure
    .input(z.object({
      trackId: z.string().uuid(),
      targetDate: z.date().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const existing = await ctx.db.query.enrollments.findFirst({
        where: and(
          eq(enrollments.userId, ctx.user.id),
          eq(enrollments.trackId, input.trackId)
        ),
      });

      if (existing) {
        throw new TRPCError({ code: 'CONFLICT', message: 'Already enrolled in this track' });
      }

      const [enrollment] = await ctx.db
        .insert(enrollments)
        .values({
          userId: ctx.user.id,
          trackId: input.trackId,
          targetDate: input.targetDate,
        })
        .returning();

      return enrollment;
    }),

  unenroll: protectedProcedure
    .input(z.object({ trackId: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db
        .delete(enrollments)
        .where(and(
          eq(enrollments.userId, ctx.user.id),
          eq(enrollments.trackId, input.trackId)
        ));

      return { success: true };
    }),

  completeLesson: protectedProcedure
    .input(z.object({ lessonId: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      // Update or insert progress record
      const existing = await ctx.db.query.progress.findFirst({
        where: and(
          eq(progress.userId, ctx.user.id),
          eq(progress.lessonId, input.lessonId)
        ),
      });

      if (existing && existing.status === 'completed') {
        return { success: true, alreadyCompleted: true };
      }

      if (existing) {
        await ctx.db
          .update(progress)
          .set({
            status: 'completed',
            completedAt: new Date(),
            updatedAt: new Date(),
          })
          .where(eq(progress.id, existing.id));
      } else {
        await ctx.db.insert(progress).values({
          userId: ctx.user.id,
          lessonId: input.lessonId,
          status: 'completed',
          completedAt: new Date(),
        });
      }

      return { success: true, alreadyCompleted: false };
    }),
});
