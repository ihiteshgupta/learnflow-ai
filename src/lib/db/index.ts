import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema/index';
import { env } from '../env';

// Use validated environment variable
const connectionString = env.DATABASE_URL || 'mock';

// Create a mock db for development without database
const createMockDb = () => ({
  query: {
    users: { findFirst: async () => null, findMany: async () => [] },
    userProfiles: { findFirst: async () => null, findMany: async () => [] },
    domains: { findFirst: async () => null, findMany: async () => [] },
    tracks: { findFirst: async () => null, findMany: async () => [] },
    courses: { findFirst: async () => null, findMany: async () => [] },
    modules: { findFirst: async () => null, findMany: async () => [] },
    lessons: { findFirst: async () => null, findMany: async () => [] },
    enrollments: { findFirst: async () => null, findMany: async () => [] },
    progress: { findFirst: async () => null, findMany: async () => [] },
    achievements: { findFirst: async () => null, findMany: async () => [] },
    userAchievements: { findFirst: async () => null, findMany: async () => [] },
    xpTransactions: { findFirst: async () => null, findMany: async () => [] },
    streakHistory: { findFirst: async () => null, findMany: async () => [] },
    certifications: { findFirst: async () => null, findMany: async () => [] },
    assessments: { findFirst: async () => null, findMany: async () => [] },
    aiSessions: { findFirst: async () => null, findMany: async () => [] },
    aiMessages: { findFirst: async () => null, findMany: async () => [] },
    feedback: { findFirst: async () => null, findMany: async () => [] },
  },
  insert: () => ({ values: () => ({ returning: async () => [], onConflictDoUpdate: () => ({ returning: async () => [] }) }) }),
  update: () => ({ set: () => ({ where: () => ({ returning: async () => [] }) }) }),
  delete: () => ({ where: async () => {} }),
  execute: async () => [{}],
  select: () => ({ from: () => ({ orderBy: () => ({ limit: async () => [] }) }) }),
});

type DrizzleDB = ReturnType<typeof drizzle<typeof schema>>;

let db: DrizzleDB;

if (connectionString === 'mock') {
  console.warn('⚠️  Using mock database - data will not be persisted!');
  // Mock database for development without DATABASE_URL
   
  db = createMockDb() as unknown as DrizzleDB;
} else {
  const client = postgres(connectionString, {
    max: env.DATABASE_POOL_SIZE,
  });
  db = drizzle(client, { schema });
}

export { db };
export type Database = typeof db;

// Re-export all schema types
export * from './schema/index';
