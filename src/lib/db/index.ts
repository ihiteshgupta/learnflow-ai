// Stub database module - will be replaced with actual Drizzle setup
// This provides the interface expected by the AI modules

import type { Course, Module, Lesson, User, UserProfile, AISession, AIMessage } from './schema';

type CourseWithRelations = Course & { modules: (Module & { lessons: Lesson[] })[] };
type LessonWithRelations = Lesson & { module: Module & { course: Course; courseId: string } };

// Placeholder - actual connection will be established when DATABASE_URL is configured
const db = {
  query: {
    courses: {
      findFirst: async (_opts?: unknown): Promise<CourseWithRelations | null> => null,
      findMany: async (_opts?: unknown): Promise<Course[]> => [],
    },
    users: {
      findFirst: async (_opts?: unknown): Promise<User | null> => null,
    },
    userProfiles: {
      findFirst: async (_opts?: unknown): Promise<UserProfile | null> => null,
    },
    lessons: {
      findFirst: async (_opts?: unknown): Promise<LessonWithRelations | null> => null,
    },
    aiSessions: {
      findFirst: async (_opts?: unknown): Promise<AISession | null> => null,
    },
  },
  insert: (_table: unknown) => ({
    values: (_values: unknown) => ({
      returning: async (): Promise<{ id: string }[]> => [{ id: crypto.randomUUID() }],
    }),
  }),
};

export { db };
export * from './schema';
