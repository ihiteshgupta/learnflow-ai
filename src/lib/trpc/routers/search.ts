import { z } from 'zod';
import { router, publicProcedure, protectedProcedure } from '../trpc';
import { courses, learningPaths, lessons, tracks } from '@/lib/db/schema';
import { eq, and, or, ilike, sql } from 'drizzle-orm';

export const searchRouter = router({
  // Full-text search across content
  query: publicProcedure
    .input(z.object({
      q: z.string().min(1).max(200),
      type: z.enum(['all', 'courses', 'paths', 'lessons']).default('all'),
      difficulty: z.enum(['beginner', 'intermediate', 'advanced', 'expert']).optional(),
      limit: z.number().min(1).max(50).default(20),
    }))
    .query(async ({ ctx, input }) => {
      const { q, type, difficulty, limit } = input;
      const searchTerm = `%${q.toLowerCase()}%`;

      const results: {
        courses: Array<{ id: string; name: string; description: string | null; trackName: string | null; type: 'course' }>;
        paths: Array<{ id: string; name: string; description: string | null; difficulty: string; type: 'path' }>;
        lessons: Array<{ id: string; name: string; type: 'lesson' }>;
      } = {
        courses: [],
        paths: [],
        lessons: [],
      };

      // Search courses
      if (type === 'all' || type === 'courses') {
        const courseConditions = [
          eq(courses.isPublished, true),
          or(
            ilike(courses.name, searchTerm),
            ilike(courses.description, searchTerm)
          ),
        ];

        const courseResults = await ctx.db
          .select({
            id: courses.id,
            name: courses.name,
            description: courses.description,
            trackId: courses.trackId,
          })
          .from(courses)
          .where(and(...courseConditions))
          .limit(limit);

        // Get track names for courses
        const trackIds = [...new Set(courseResults.map(c => c.trackId))];
        const trackData = trackIds.length > 0
          ? await ctx.db.query.tracks.findMany({
              where: sql`${tracks.id} IN (${sql.join(trackIds.map(id => sql`${id}`), sql`, `)})`,
            })
          : [];
        const trackMap = new Map(trackData.map(t => [t.id, t]));

        // Filter by difficulty (via track)
        results.courses = courseResults
          .filter(c => {
            if (!difficulty) return true;
            const track = trackMap.get(c.trackId);
            return track?.difficulty === difficulty;
          })
          .map(c => ({
            ...c,
            trackName: trackMap.get(c.trackId)?.name ?? null,
            type: 'course' as const,
          }));
      }

      // Search learning paths
      if (type === 'all' || type === 'paths') {
        const pathConditions = [
          eq(learningPaths.isPublished, true),
          or(
            ilike(learningPaths.name, searchTerm),
            ilike(learningPaths.description, searchTerm),
            ilike(learningPaths.shortDescription, searchTerm)
          ),
        ];

        if (difficulty) {
          pathConditions.push(eq(learningPaths.difficulty, difficulty));
        }

        const pathResults = await ctx.db
          .select({
            id: learningPaths.id,
            name: learningPaths.name,
            description: learningPaths.description,
            difficulty: learningPaths.difficulty,
          })
          .from(learningPaths)
          .where(and(...pathConditions))
          .limit(limit);

        results.paths = pathResults.map(p => ({ ...p, type: 'path' as const }));
      }

      // Search lessons
      if (type === 'all' || type === 'lessons') {
        const lessonResults = await ctx.db
          .select({
            id: lessons.id,
            name: lessons.name,
          })
          .from(lessons)
          .where(ilike(lessons.name, searchTerm))
          .limit(limit);

        results.lessons = lessonResults.map(l => ({ ...l, type: 'lesson' as const }));
      }

      // Combine and sort by relevance (simple: name matches first)
      const allResults = [
        ...results.courses,
        ...results.paths,
        ...results.lessons,
      ].sort((a, b) => {
        const aName = a.name;
        const bName = b.name;
        const aExact = aName.toLowerCase().includes(q.toLowerCase());
        const bExact = bName.toLowerCase().includes(q.toLowerCase());
        if (aExact && !bExact) return -1;
        if (!aExact && bExact) return 1;
        return 0;
      });

      return {
        results: allResults.slice(0, limit),
        counts: {
          courses: results.courses.length,
          paths: results.paths.length,
          lessons: results.lessons.length,
          total: allResults.length,
        },
      };
    }),

  // Get autocomplete suggestions
  getAutocomplete: publicProcedure
    .input(z.object({
      q: z.string().min(1).max(100),
      limit: z.number().min(1).max(10).default(5),
    }))
    .query(async ({ ctx, input }) => {
      const { q, limit } = input;
      const searchTerm = `${q.toLowerCase()}%`; // Prefix match for autocomplete

      // Get course name suggestions
      const courseSuggestions = await ctx.db
        .select({ name: courses.name, type: sql<string>`'course'` })
        .from(courses)
        .where(and(
          eq(courses.isPublished, true),
          ilike(courses.name, searchTerm)
        ))
        .limit(limit);

      // Get path name suggestions
      const pathSuggestions = await ctx.db
        .select({ name: learningPaths.name, type: sql<string>`'path'` })
        .from(learningPaths)
        .where(and(
          eq(learningPaths.isPublished, true),
          ilike(learningPaths.name, searchTerm)
        ))
        .limit(limit);

      // Combine and dedupe
      const suggestions = [...courseSuggestions, ...pathSuggestions]
        .slice(0, limit)
        .map(s => ({ text: s.name, type: s.type }));

      return { suggestions };
    }),

  // Get popular/trending content
  getPopular: publicProcedure
    .input(z.object({
      limit: z.number().min(1).max(20).default(10),
    }))
    .query(async ({ ctx, input }) => {
      // Get featured paths
      const featuredPaths = await ctx.db.query.learningPaths.findMany({
        where: and(
          eq(learningPaths.isPublished, true),
          eq(learningPaths.isFeatured, true)
        ),
        limit: Math.ceil(input.limit / 2),
      });

      // Get published courses
      const popularCourses = await ctx.db.query.courses.findMany({
        where: eq(courses.isPublished, true),
        limit: Math.ceil(input.limit / 2),
      });

      return {
        paths: featuredPaths.map(p => ({
          id: p.id,
          name: p.name,
          description: p.shortDescription || p.description,
          difficulty: p.difficulty,
          type: 'path' as const,
        })),
        courses: popularCourses.map(c => ({
          id: c.id,
          name: c.name,
          description: c.description,
          type: 'course' as const,
        })),
      };
    }),

  // Get recent searches (for logged-in users)
  getRecentSearches: protectedProcedure
    .input(z.object({
      limit: z.number().min(1).max(10).default(5),
    }))
    .query(async () => {
      // In a full implementation, we'd store search history
      // For now, return empty array - can be enhanced later
      return { searches: [] as string[] };
    }),
});
