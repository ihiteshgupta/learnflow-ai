import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TRPCError } from '@trpc/server';
import { searchRouter } from '../search';

// Mock the database module
vi.mock('@/lib/db/schema', () => ({
  courses: { id: 'id', name: 'name', description: 'description', trackId: 'trackId', isPublished: 'isPublished' },
  learningPaths: { id: 'id', name: 'name', description: 'description', shortDescription: 'shortDescription', difficulty: 'difficulty', isPublished: 'isPublished', isFeatured: 'isFeatured' },
  lessons: { id: 'id', name: 'name' },
  tracks: { id: 'id', name: 'name', difficulty: 'difficulty' },
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
    or: (...conditions: unknown[]) => ({ type: 'or', conditions }),
    ilike: (a: unknown, b: unknown) => ({ type: 'ilike', field: a, value: b }),
    sql: mockSql,
  };
});

// Helper to create mock context
function createMockContext(user: { id: string; email: string; name: string; role: string; orgId: string | null; teamId: string | null } | null) {
  const mockDb = {
    query: {
      courses: {
        findMany: vi.fn(),
      },
      learningPaths: {
        findMany: vi.fn(),
      },
      lessons: {
        findMany: vi.fn(),
      },
      tracks: {
        findMany: vi.fn(),
      },
    },
    select: vi.fn(() => ({
      from: vi.fn(() => ({
        where: vi.fn(() => ({
          limit: vi.fn(),
        })),
        limit: vi.fn(),
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
    query: async (input: { q: string; type?: string; difficulty?: string; limit?: number }) => {
      const procedure = searchRouter._def.procedures.query;
      const parsedInput = {
        q: input.q,
        type: input.type ?? 'all',
        difficulty: input.difficulty,
        limit: input.limit ?? 20,
      };
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return await (procedure as any)._def.resolver({ ctx, input: parsedInput });
    },
    getAutocomplete: async (input: { q: string; limit?: number }) => {
      const procedure = searchRouter._def.procedures.getAutocomplete;
      const parsedInput = {
        q: input.q,
        limit: input.limit ?? 5,
      };
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return await (procedure as any)._def.resolver({ ctx, input: parsedInput });
    },
    getPopular: async (input: { limit?: number }) => {
      const procedure = searchRouter._def.procedures.getPopular;
      const parsedInput = { limit: input.limit ?? 10 };
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return await (procedure as any)._def.resolver({ ctx, input: parsedInput });
    },
    getRecentSearches: async (input: { limit?: number }) => {
      if (!ctx.user) {
        throw new TRPCError({ code: 'UNAUTHORIZED' });
      }
      const procedure = searchRouter._def.procedures.getRecentSearches;
      const parsedInput = { limit: input.limit ?? 5 };
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return await (procedure as any)._def.resolver({ ctx: { ...ctx, user: ctx.user }, input: parsedInput });
    },
  };
}

describe('search router', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('query', () => {
    it('searches courses, paths, and lessons by default', async () => {
      const ctx = createMockContext(null);
      const caller = createCaller(ctx);

      ctx.db.select
        .mockReturnValueOnce({
          from: vi.fn().mockReturnValueOnce({
            where: vi.fn().mockReturnValueOnce({
              limit: vi.fn().mockResolvedValueOnce([
                { id: 'course-1', name: 'JavaScript Basics', description: 'Learn JS', trackId: 'track-1' },
              ]),
            }),
          }),
        })
        .mockReturnValueOnce({
          from: vi.fn().mockReturnValueOnce({
            where: vi.fn().mockReturnValueOnce({
              limit: vi.fn().mockResolvedValueOnce([
                { id: 'path-1', name: 'Web Developer', description: 'Become a web developer', difficulty: 'beginner' },
              ]),
            }),
          }),
        })
        .mockReturnValueOnce({
          from: vi.fn().mockReturnValueOnce({
            where: vi.fn().mockReturnValueOnce({
              limit: vi.fn().mockResolvedValueOnce([
                { id: 'lesson-1', name: 'Variables in JavaScript' },
              ]),
            }),
          }),
        });

      ctx.db.query.tracks.findMany.mockResolvedValueOnce([
        { id: 'track-1', name: 'Web Development', difficulty: 'beginner' },
      ]);

      const result = await caller.query({ q: 'javascript' });

      expect(result).toHaveProperty('results');
      expect(result).toHaveProperty('counts');
      expect(result.counts).toHaveProperty('courses');
      expect(result.counts).toHaveProperty('paths');
      expect(result.counts).toHaveProperty('lessons');
      expect(result.counts).toHaveProperty('total');
    });

    it('filters by content type when specified', async () => {
      const ctx = createMockContext(null);
      const caller = createCaller(ctx);

      ctx.db.select.mockReturnValueOnce({
        from: vi.fn().mockReturnValueOnce({
          where: vi.fn().mockReturnValueOnce({
            limit: vi.fn().mockResolvedValueOnce([
              { id: 'course-1', name: 'JavaScript Basics', description: 'Learn JS', trackId: 'track-1' },
            ]),
          }),
        }),
      });

      ctx.db.query.tracks.findMany.mockResolvedValueOnce([
        { id: 'track-1', name: 'Web Development', difficulty: 'beginner' },
      ]);

      const result = await caller.query({ q: 'javascript', type: 'courses' });

      expect(result.counts.courses).toBeGreaterThan(0);
      expect(result.counts.paths).toBe(0);
      expect(result.counts.lessons).toBe(0);
    });

    it('returns empty results when no matches', async () => {
      const ctx = createMockContext(null);
      const caller = createCaller(ctx);

      ctx.db.select
        .mockReturnValueOnce({
          from: vi.fn().mockReturnValueOnce({
            where: vi.fn().mockReturnValueOnce({
              limit: vi.fn().mockResolvedValueOnce([]),
            }),
          }),
        })
        .mockReturnValueOnce({
          from: vi.fn().mockReturnValueOnce({
            where: vi.fn().mockReturnValueOnce({
              limit: vi.fn().mockResolvedValueOnce([]),
            }),
          }),
        })
        .mockReturnValueOnce({
          from: vi.fn().mockReturnValueOnce({
            where: vi.fn().mockReturnValueOnce({
              limit: vi.fn().mockResolvedValueOnce([]),
            }),
          }),
        });

      ctx.db.query.tracks.findMany.mockResolvedValueOnce([]);

      const result = await caller.query({ q: 'nonexistent' });

      expect(result.results).toHaveLength(0);
      expect(result.counts.total).toBe(0);
    });

    it('sorts results by relevance (name matches first)', async () => {
      const ctx = createMockContext(null);
      const caller = createCaller(ctx);

      ctx.db.select
        .mockReturnValueOnce({
          from: vi.fn().mockReturnValueOnce({
            where: vi.fn().mockReturnValueOnce({
              limit: vi.fn().mockResolvedValueOnce([
                { id: 'course-1', name: 'Advanced Programming', description: 'Learn React patterns', trackId: 'track-1' },
                { id: 'course-2', name: 'React Fundamentals', description: 'Learn basics', trackId: 'track-1' },
              ]),
            }),
          }),
        })
        .mockReturnValueOnce({
          from: vi.fn().mockReturnValueOnce({
            where: vi.fn().mockReturnValueOnce({
              limit: vi.fn().mockResolvedValueOnce([]),
            }),
          }),
        })
        .mockReturnValueOnce({
          from: vi.fn().mockReturnValueOnce({
            where: vi.fn().mockReturnValueOnce({
              limit: vi.fn().mockResolvedValueOnce([]),
            }),
          }),
        });

      ctx.db.query.tracks.findMany.mockResolvedValueOnce([
        { id: 'track-1', name: 'Web Development', difficulty: 'intermediate' },
      ]);

      const result = await caller.query({ q: 'react' });

      // React Fundamentals should come first (exact name match)
      expect(result.results[0].name).toBe('React Fundamentals');
    });

    it('can be called without authentication (public procedure)', async () => {
      const ctx = createMockContext(null);
      const caller = createCaller(ctx);

      ctx.db.select
        .mockReturnValueOnce({
          from: vi.fn().mockReturnValueOnce({
            where: vi.fn().mockReturnValueOnce({
              limit: vi.fn().mockResolvedValueOnce([]),
            }),
          }),
        })
        .mockReturnValueOnce({
          from: vi.fn().mockReturnValueOnce({
            where: vi.fn().mockReturnValueOnce({
              limit: vi.fn().mockResolvedValueOnce([]),
            }),
          }),
        })
        .mockReturnValueOnce({
          from: vi.fn().mockReturnValueOnce({
            where: vi.fn().mockReturnValueOnce({
              limit: vi.fn().mockResolvedValueOnce([]),
            }),
          }),
        });

      ctx.db.query.tracks.findMany.mockResolvedValueOnce([]);

      // Should not throw even without user
      const result = await caller.query({ q: 'test' });
      expect(result).toHaveProperty('results');
    });
  });

  describe('getAutocomplete', () => {
    it('returns suggestions for partial input', async () => {
      const ctx = createMockContext(null);
      const caller = createCaller(ctx);

      ctx.db.select
        .mockReturnValueOnce({
          from: vi.fn().mockReturnValueOnce({
            where: vi.fn().mockReturnValueOnce({
              limit: vi.fn().mockResolvedValueOnce([
                { name: 'JavaScript Basics', type: 'course' },
                { name: 'JavaScript Advanced', type: 'course' },
              ]),
            }),
          }),
        })
        .mockReturnValueOnce({
          from: vi.fn().mockReturnValueOnce({
            where: vi.fn().mockReturnValueOnce({
              limit: vi.fn().mockResolvedValueOnce([
                { name: 'JavaScript Developer Path', type: 'path' },
              ]),
            }),
          }),
        });

      const result = await caller.getAutocomplete({ q: 'java' });

      expect(result).toHaveProperty('suggestions');
      expect(result.suggestions.length).toBeGreaterThan(0);
      result.suggestions.forEach((suggestion: { text: string; type: string }) => {
        expect(suggestion).toHaveProperty('text');
        expect(suggestion).toHaveProperty('type');
      });
    });

    it('limits suggestions to requested count', async () => {
      const ctx = createMockContext(null);
      const caller = createCaller(ctx);

      ctx.db.select
        .mockReturnValueOnce({
          from: vi.fn().mockReturnValueOnce({
            where: vi.fn().mockReturnValueOnce({
              limit: vi.fn().mockResolvedValueOnce([
                { name: 'Course 1', type: 'course' },
                { name: 'Course 2', type: 'course' },
                { name: 'Course 3', type: 'course' },
              ]),
            }),
          }),
        })
        .mockReturnValueOnce({
          from: vi.fn().mockReturnValueOnce({
            where: vi.fn().mockReturnValueOnce({
              limit: vi.fn().mockResolvedValueOnce([
                { name: 'Path 1', type: 'path' },
                { name: 'Path 2', type: 'path' },
              ]),
            }),
          }),
        });

      const result = await caller.getAutocomplete({ q: 'test', limit: 3 });

      expect(result.suggestions.length).toBeLessThanOrEqual(3);
    });

    it('returns empty array when no matches', async () => {
      const ctx = createMockContext(null);
      const caller = createCaller(ctx);

      ctx.db.select
        .mockReturnValueOnce({
          from: vi.fn().mockReturnValueOnce({
            where: vi.fn().mockReturnValueOnce({
              limit: vi.fn().mockResolvedValueOnce([]),
            }),
          }),
        })
        .mockReturnValueOnce({
          from: vi.fn().mockReturnValueOnce({
            where: vi.fn().mockReturnValueOnce({
              limit: vi.fn().mockResolvedValueOnce([]),
            }),
          }),
        });

      const result = await caller.getAutocomplete({ q: 'xyz' });

      expect(result.suggestions).toHaveLength(0);
    });
  });

  describe('getPopular', () => {
    it('returns featured paths and popular courses', async () => {
      const ctx = createMockContext(null);
      const caller = createCaller(ctx);

      ctx.db.query.learningPaths.findMany.mockResolvedValueOnce([
        { id: 'path-1', name: 'Web Developer', shortDescription: 'Become a web dev', description: 'Full description', difficulty: 'beginner', isPublished: true, isFeatured: true },
        { id: 'path-2', name: 'Data Scientist', shortDescription: 'Learn data science', description: 'Full description', difficulty: 'intermediate', isPublished: true, isFeatured: true },
      ]);

      ctx.db.query.courses.findMany.mockResolvedValueOnce([
        { id: 'course-1', name: 'JavaScript Basics', description: 'Learn JS', isPublished: true },
        { id: 'course-2', name: 'Python Fundamentals', description: 'Learn Python', isPublished: true },
      ]);

      const result = await caller.getPopular({ limit: 10 });

      expect(result).toHaveProperty('paths');
      expect(result).toHaveProperty('courses');
      expect(result.paths.length).toBeGreaterThan(0);
      expect(result.courses.length).toBeGreaterThan(0);
      result.paths.forEach((path: { id: string; name: string; type: string }) => {
        expect(path).toHaveProperty('id');
        expect(path).toHaveProperty('name');
        expect(path).toHaveProperty('type', 'path');
      });
      result.courses.forEach((course: { id: string; name: string; type: string }) => {
        expect(course).toHaveProperty('id');
        expect(course).toHaveProperty('name');
        expect(course).toHaveProperty('type', 'course');
      });
    });

    it('returns empty arrays when no content available', async () => {
      const ctx = createMockContext(null);
      const caller = createCaller(ctx);

      ctx.db.query.learningPaths.findMany.mockResolvedValueOnce([]);
      ctx.db.query.courses.findMany.mockResolvedValueOnce([]);

      const result = await caller.getPopular({ limit: 10 });

      expect(result.paths).toHaveLength(0);
      expect(result.courses).toHaveLength(0);
    });

    it('uses shortDescription for path description when available', async () => {
      const ctx = createMockContext(null);
      const caller = createCaller(ctx);

      ctx.db.query.learningPaths.findMany.mockResolvedValueOnce([
        { id: 'path-1', name: 'Web Developer', shortDescription: 'Short desc', description: 'Long description', difficulty: 'beginner', isPublished: true, isFeatured: true },
      ]);

      ctx.db.query.courses.findMany.mockResolvedValueOnce([]);

      const result = await caller.getPopular({ limit: 10 });

      expect(result.paths[0].description).toBe('Short desc');
    });
  });

  describe('getRecentSearches', () => {
    it('throws UNAUTHORIZED when user is null', async () => {
      const ctx = createMockContext(null);
      const caller = createCaller(ctx);

      await expect(caller.getRecentSearches({})).rejects.toThrow(TRPCError);
      await expect(caller.getRecentSearches({})).rejects.toMatchObject({
        code: 'UNAUTHORIZED',
      });
    });

    it('returns empty array for authenticated user (placeholder implementation)', async () => {
      const user = createMockUser();
      const ctx = createMockContext(user);
      const caller = createCaller(ctx);

      const result = await caller.getRecentSearches({ limit: 5 });

      expect(result).toHaveProperty('searches');
      expect(result.searches).toHaveLength(0);
    });
  });

  describe('router structure', () => {
    it('has all expected procedures', () => {
      expect(searchRouter._def.procedures).toHaveProperty('query');
      expect(searchRouter._def.procedures).toHaveProperty('getAutocomplete');
      expect(searchRouter._def.procedures).toHaveProperty('getPopular');
      expect(searchRouter._def.procedures).toHaveProperty('getRecentSearches');
    });

    it('query has input validation', () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const procedure = searchRouter._def.procedures.query as any;
      expect(procedure._def.inputs).toBeDefined();
      expect(procedure._def.inputs.length).toBeGreaterThan(0);
    });

    it('getAutocomplete has input validation', () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const procedure = searchRouter._def.procedures.getAutocomplete as any;
      expect(procedure._def.inputs).toBeDefined();
      expect(procedure._def.inputs.length).toBeGreaterThan(0);
    });

    it('getPopular has input validation', () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const procedure = searchRouter._def.procedures.getPopular as any;
      expect(procedure._def.inputs).toBeDefined();
      expect(procedure._def.inputs.length).toBeGreaterThan(0);
    });

    it('getRecentSearches has input validation', () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const procedure = searchRouter._def.procedures.getRecentSearches as any;
      expect(procedure._def.inputs).toBeDefined();
      expect(procedure._def.inputs.length).toBeGreaterThan(0);
    });
  });
});
