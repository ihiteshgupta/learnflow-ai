import { z } from 'zod';

const envSchema = z.object({
  // App
  NODE_ENV: z.enum(['development', 'staging', 'production']).default('development'),
  NEXT_PUBLIC_APP_URL: z.string().url().default('http://localhost:3000'),

  // Database
  DATABASE_URL: z.string().url(),
  DATABASE_POOL_SIZE: z.coerce.number().default(10),

  // Redis
  REDIS_URL: z.string().url(),

  // AI
  ANTHROPIC_API_KEY: z.string(),
  OPENAI_API_KEY: z.string().optional(),
  AI_MODEL_PRIMARY: z.string().default('claude-sonnet-4-20250514'),
  AI_MODEL_FALLBACK: z.string().default('gpt-4o'),

  // Vector DB
  QDRANT_URL: z.string().url(),
  QDRANT_API_KEY: z.string().optional(),

  // Auth
  NEXTAUTH_SECRET: z.string(),
  NEXTAUTH_URL: z.string().url().default('http://localhost:3000'),

  // Feature flags
  ENABLE_GAMIFICATION: z.coerce.boolean().default(true),
  ENABLE_AI_PROCTORING: z.coerce.boolean().default(false),
  MAX_AI_REQUESTS_PER_MINUTE: z.coerce.number().default(30),
});

export type Env = z.infer<typeof envSchema>;

function getEnv(): Env {
  const parsed = envSchema.safeParse(process.env);

  if (!parsed.success) {
    console.error('Invalid environment variables:', parsed.error.flatten().fieldErrors);
    throw new Error('Invalid environment variables');
  }

  return parsed.data;
}

export const env = getEnv();
