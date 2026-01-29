import { z } from 'zod';
import { router, protectedProcedure, adminProcedure } from '../trpc';
import {
  userProfiles,
  xpTransactions,
  streakHistory,
  progress,
  courseProgress,
  enrollments,
  users,
  courses,
} from '@/lib/db/schema';
import { eq, and, gte, desc, sql } from 'drizzle-orm';
import { subDays, startOfDay, format } from 'date-fns';

export const analyticsRouter = router({
  // Get personal learning stats
  getPersonalStats: protectedProcedure.query(async ({ ctx }) => {
    const profile = await ctx.db.query.userProfiles.findFirst({
      where: eq(userProfiles.userId, ctx.user.id),
    });

    // Get enrolled tracks count
    const trackEnrollments = await ctx.db.query.enrollments.findMany({
      where: eq(enrollments.userId, ctx.user.id),
    });

    // Get course progress
    const courseProgressData = await ctx.db.query.courseProgress.findMany({
      where: eq(courseProgress.userId, ctx.user.id),
    });

    // Get completed lessons count
    const completedLessons = await ctx.db
      .select({ count: sql<number>`count(*)::int` })
      .from(progress)
      .where(and(
        eq(progress.userId, ctx.user.id),
        eq(progress.status, 'completed')
      ));

    // Get total XP earned
    const totalXpEarned = await ctx.db
      .select({ total: sql<number>`COALESCE(sum(amount), 0)::int` })
      .from(xpTransactions)
      .where(eq(xpTransactions.userId, ctx.user.id));

    // Get completed courses
    const completedCourses = courseProgressData.filter(cp => cp.status === 'completed').length;

    return {
      totalXp: profile?.totalXp ?? 0,
      currentStreak: profile?.currentStreak ?? 0,
      longestStreak: profile?.longestStreak ?? 0,
      level: profile?.level ?? 1,
      enrolledTracks: trackEnrollments.length,
      coursesInProgress: courseProgressData.filter(cp => cp.status === 'in_progress').length,
      completedCourses,
      completedLessons: completedLessons[0]?.count ?? 0,
      totalXpEarned: totalXpEarned[0]?.total ?? 0,
      completionRate: courseProgressData.length > 0
        ? Math.round((completedCourses / courseProgressData.length) * 100)
        : 0,
    };
  }),

  // Get learning activity timeline
  getLearningTimeline: protectedProcedure
    .input(z.object({
      days: z.number().min(7).max(90).default(30),
    }))
    .query(async ({ ctx, input }) => {
      const startDate = subDays(new Date(), input.days);

      // Get XP earned per day
      const xpHistory = await ctx.db.query.xpTransactions.findMany({
        where: and(
          eq(xpTransactions.userId, ctx.user.id),
          gte(xpTransactions.createdAt, startDate)
        ),
        orderBy: [desc(xpTransactions.createdAt)],
      });

      // Get streak history
      const streaks = await ctx.db.query.streakHistory.findMany({
        where: and(
          eq(streakHistory.userId, ctx.user.id),
          gte(streakHistory.date, startDate)
        ),
        orderBy: [desc(streakHistory.date)],
      });

      // Get lessons completed per day
      const lessonsCompleted = await ctx.db.query.progress.findMany({
        where: and(
          eq(progress.userId, ctx.user.id),
          eq(progress.status, 'completed'),
          gte(progress.completedAt, startDate)
        ),
      });

      // Group by day
      const dailyData: Record<string, { xp: number; lessons: number; streak: number }> = {};

      // Initialize all days
      for (let i = 0; i < input.days; i++) {
        const day = format(subDays(new Date(), i), 'yyyy-MM-dd');
        dailyData[day] = { xp: 0, lessons: 0, streak: 0 };
      }

      // Populate XP data
      xpHistory.forEach(tx => {
        const day = format(tx.createdAt, 'yyyy-MM-dd');
        if (dailyData[day]) {
          dailyData[day].xp += tx.amount;
        }
      });

      // Populate lessons data
      lessonsCompleted.forEach(lp => {
        if (lp.completedAt) {
          const day = format(lp.completedAt, 'yyyy-MM-dd');
          if (dailyData[day]) {
            dailyData[day].lessons += 1;
          }
        }
      });

      // Populate streak data
      streaks.forEach(s => {
        const day = format(s.date, 'yyyy-MM-dd');
        if (dailyData[day]) {
          dailyData[day].streak = s.streakCount;
        }
      });

      // Convert to array sorted by date
      const timeline = Object.entries(dailyData)
        .map(([date, data]) => ({ date, ...data }))
        .sort((a, b) => a.date.localeCompare(b.date));

      return {
        timeline,
        summary: {
          totalXp: xpHistory.reduce((sum, tx) => sum + tx.amount, 0),
          totalLessons: lessonsCompleted.length,
          activeDays: Object.values(dailyData).filter(d => d.xp > 0 || d.lessons > 0).length,
        },
      };
    }),

  // Get course completion progress
  getCourseProgress: protectedProcedure.query(async ({ ctx }) => {
    const courseProgressData = await ctx.db.query.courseProgress.findMany({
      where: eq(courseProgress.userId, ctx.user.id),
      with: {
        course: true,
      },
    });

    return courseProgressData.map(cp => ({
      courseId: cp.courseId,
      courseName: cp.course?.name ?? 'Unknown Course',
      startedAt: cp.startedAt,
      completedAt: cp.completedAt,
      progress: cp.progressPercent ?? 0,
      completedLessons: cp.completedLessons ?? 0,
      totalLessons: cp.totalLessons ?? 0,
      isCompleted: cp.status === 'completed',
    }));
  }),

  // Get skill progress by track/category
  getSkillProgress: protectedProcedure.query(async ({ ctx }) => {
    const profile = await ctx.db.query.userProfiles.findFirst({
      where: eq(userProfiles.userId, ctx.user.id),
    });

    const trackEnrollments = await ctx.db.query.enrollments.findMany({
      where: eq(enrollments.userId, ctx.user.id),
      with: {
        track: true,
      },
    });

    // Group by track
    const trackProgress: Record<string, { total: number; completed: number; status: string }> = {};

    trackEnrollments.forEach(e => {
      const trackName = e.track?.name ?? 'Other';
      trackProgress[trackName] = {
        total: 1,
        completed: e.completedAt ? 1 : 0,
        status: e.status,
      };
    });

    return {
      skills: trackProgress,
      skillMap: profile?.skillMap ?? {},
    };
  }),

  // Admin: Get platform-wide stats
  getPlatformStats: adminProcedure.query(async ({ ctx }) => {
    const totalUsers = await ctx.db
      .select({ count: sql<number>`count(*)::int` })
      .from(users);

    const totalCourses = await ctx.db
      .select({ count: sql<number>`count(*)::int` })
      .from(courses);

    const totalEnrollments = await ctx.db
      .select({ count: sql<number>`count(*)::int` })
      .from(enrollments);

    const activeToday = await ctx.db
      .select({ count: sql<number>`count(*)::int` })
      .from(userProfiles)
      .where(gte(userProfiles.lastActiveAt, startOfDay(new Date())));

    const activeThisWeek = await ctx.db
      .select({ count: sql<number>`count(*)::int` })
      .from(userProfiles)
      .where(gte(userProfiles.lastActiveAt, subDays(new Date(), 7)));

    return {
      totalUsers: totalUsers[0]?.count ?? 0,
      totalCourses: totalCourses[0]?.count ?? 0,
      totalEnrollments: totalEnrollments[0]?.count ?? 0,
      activeToday: activeToday[0]?.count ?? 0,
      activeThisWeek: activeThisWeek[0]?.count ?? 0,
    };
  }),

  // Admin: Get user growth over time
  getUserGrowth: adminProcedure
    .input(z.object({
      days: z.number().min(7).max(365).default(30),
    }))
    .query(async ({ ctx, input }) => {
      const startDate = subDays(new Date(), input.days);

      const signups = await ctx.db
        .select({
          date: sql<string>`DATE(${users.createdAt})`,
          count: sql<number>`count(*)::int`,
        })
        .from(users)
        .where(gte(users.createdAt, startDate))
        .groupBy(sql`DATE(${users.createdAt})`)
        .orderBy(sql`DATE(${users.createdAt})`);

      return {
        signups,
        totalNewUsers: signups.reduce((sum, s) => sum + s.count, 0),
      };
    }),

  // Admin: Get course popularity
  getCoursePopularity: adminProcedure
    .input(z.object({
      limit: z.number().min(1).max(50).default(10),
    }))
    .query(async ({ ctx, input }) => {
      const popular = await ctx.db
        .select({
          courseId: courseProgress.courseId,
          enrollments: sql<number>`count(*)::int`,
        })
        .from(courseProgress)
        .groupBy(courseProgress.courseId)
        .orderBy(desc(sql`count(*)`))
        .limit(input.limit);

      // Get course details
      const courseIds = popular.map(p => p.courseId);
      if (courseIds.length === 0) {
        return [];
      }

      const courseDetails = await ctx.db.query.courses.findMany({
        where: sql`${courses.id} IN (${sql.join(courseIds.map(id => sql`${id}`), sql`, `)})`,
      });

      const courseMap = new Map(courseDetails.map(c => [c.id, c]));

      return popular.map(p => ({
        courseId: p.courseId,
        courseName: courseMap.get(p.courseId)?.name ?? 'Unknown',
        enrollments: p.enrollments,
      }));
    }),
});
