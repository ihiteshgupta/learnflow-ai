import { z } from 'zod';

const envSchema = z.object({
  // AI Model Configuration
  AI_MODEL_PRIMARY: z.string().default('claude-sonnet-4-20250514'),
  AI_MODEL_FALLBACK: z.string().default('gpt-4o'),
  ANTHROPIC_API_KEY: z.string().optional(),
  OPENAI_API_KEY: z.string().optional(),
  MAX_AI_REQUESTS_PER_MINUTE: z.coerce.number().default(60),

  // Qdrant Configuration
  QDRANT_URL: z.string().default('http://localhost:6333'),
  QDRANT_API_KEY: z.string().optional(),

  // Database
  DATABASE_URL: z.string().optional(),

  // App
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
});

function getEnv() {
  const parsed = envSchema.safeParse(process.env);

  if (!parsed.success) {
    console.error('Invalid environment variables:', parsed.error.flatten().fieldErrors);
    throw new Error('Invalid environment variables');
  }

  return parsed.data;
}

export const env = getEnv();

export type Env = z.infer<typeof envSchema>;
