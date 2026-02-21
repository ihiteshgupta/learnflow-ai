/**
 * Environment variable validation using Zod
 * Validates all required configuration at application startup
 * Fails fast with clear error messages for missing/invalid variables
 */

import { z } from 'zod';

const nodeEnv = process.env.NODE_ENV || 'development';
const isProduction = nodeEnv === 'production';
const isTest = nodeEnv === 'test';
const skipValidation = process.env.SKIP_ENV_VALIDATION === 'true';

/**
 * Base schema - common fields for all environments
 */
const baseSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  NEXT_PUBLIC_APP_URL: z.string().url().optional().default('http://localhost:3000'),
  AI_MODEL_PRIMARY: z.string().default('gpt-4o'),
  AI_MODEL_FALLBACK: z.string().default('gpt-4o'),
  DATABASE_POOL_SIZE: z.coerce.number().positive().max(100).default(10),
  MAX_AI_REQUESTS_PER_MINUTE: z.coerce.number().positive().max(1000).default(isProduction ? 30 : 60),
  ENABLE_GAMIFICATION: z.enum(['true', 'false']).default('true').transform((val) => val === 'true'),
  ENABLE_AI_PROCTORING: z.enum(['true', 'false']).default(isProduction ? 'true' : 'false').transform((val) => val === 'true'),
});

/**
 * Development schema - lenient, allows optional/mock values
 */
const developmentSchema = baseSchema.extend({
  DATABASE_URL: z.string().optional(),
  REDIS_URL: z.string().optional(),
  NEXTAUTH_SECRET: z.string().optional(),
  NEXTAUTH_URL: z.string().url().optional().default('http://localhost:3000'),
  AZURE_OPENAI_API_KEY: z.string().default(''),
  AZURE_OPENAI_ENDPOINT: z.string().default('http://localhost'),
  AZURE_OPENAI_DEPLOYMENT_NAME: z.string().default('gpt-4o'),
  AZURE_OPENAI_EMBEDDINGS_DEPLOYMENT: z.string().default('text-embedding-3-large'),
  AZURE_OPENAI_API_VERSION: z.string().default('2024-12-01-preview'),
  CHROMADB_URL: z.string().default('http://localhost:8000'),
  PISTON_URL: z.string().optional(),
});

/**
 * Production schema - strict, all critical vars required
 */
const productionSchema = baseSchema.extend({
  // Database (CRITICAL - Required in production)
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required in production').refine(
    (val) => val.startsWith('postgres://') || val.startsWith('postgresql://'),
    { message: 'DATABASE_URL must be a valid PostgreSQL connection string' }
  ),

  // Redis (CRITICAL - Required for rate limiting)
  REDIS_URL: z.string().min(1, 'REDIS_URL is required in production').refine(
    (val) => val.startsWith('redis://') || val.startsWith('rediss://'),
    { message: 'REDIS_URL must be a valid Redis connection string' }
  ),

  // Authentication (CRITICAL)
  NEXTAUTH_SECRET: z.string().min(32, 'NEXTAUTH_SECRET must be at least 32 characters in production'),
  NEXTAUTH_URL: z.string().url('NEXTAUTH_URL must be a valid URL in production'),

  // AI APIs (CRITICAL - Primary required)
  AZURE_OPENAI_API_KEY: z.string().min(1, 'AZURE_OPENAI_API_KEY is required in production'),
  AZURE_OPENAI_ENDPOINT: z.string().url('AZURE_OPENAI_ENDPOINT must be a valid URL in production'),
  AZURE_OPENAI_DEPLOYMENT_NAME: z.string().default('gpt-4o'),
  AZURE_OPENAI_EMBEDDINGS_DEPLOYMENT: z.string().default('text-embedding-3-large'),
  AZURE_OPENAI_API_VERSION: z.string().default('2024-12-01-preview'),
  CHROMADB_URL: z.string().url().default('http://localhost:8000'),

  // Code Sandbox (CRITICAL - Required for code execution)
  PISTON_URL: z.string().min(1, 'PISTON_URL is required in production').refine(
    (val) => val.startsWith('http://') || val.startsWith('https://'),
    { message: 'PISTON_URL must be a valid HTTP(S) URL' }
  ),
});

/**
 * Test schema - minimal requirements
 */
const testSchema = baseSchema.extend({
  DATABASE_URL: z.string().optional(),
  REDIS_URL: z.string().optional(),
  NEXTAUTH_SECRET: z.string().optional(),
  NEXTAUTH_URL: z.string().optional(),
  AZURE_OPENAI_API_KEY: z.string().optional().default(''),
  AZURE_OPENAI_ENDPOINT: z.string().optional().default('http://localhost'),
  AZURE_OPENAI_DEPLOYMENT_NAME: z.string().optional().default('gpt-4o'),
  AZURE_OPENAI_EMBEDDINGS_DEPLOYMENT: z.string().optional().default('text-embedding-3-large'),
  AZURE_OPENAI_API_VERSION: z.string().optional().default('2024-12-01-preview'),
  CHROMADB_URL: z.string().optional().default('http://localhost:8000'),
  PISTON_URL: z.string().optional(),
});

/**
 * Select schema based on environment
 */
const envSchema = isProduction
  ? productionSchema
  : isTest
    ? testSchema
    : developmentSchema;

/**
 * Validated and typed environment variables
 */
export type Env = z.infer<typeof envSchema>;

/**
 * Validates environment variables and returns typed config
 * Throws detailed error if validation fails
 *
 * Set SKIP_ENV_VALIDATION=true to skip validation during builds
 */
function validateEnv(): Env {
  // Skip validation if explicitly requested (useful for builds)
  if (skipValidation) {
    console.warn('⚠️  Environment validation skipped (SKIP_ENV_VALIDATION=true)');
    return process.env as unknown as Env;
  }

  try {
    // Parse and validate environment variables
    const validated = envSchema.parse(process.env);

    // Additional production-specific runtime checks
    // Only run these checks if we're actually running the app, not building
    if (validated.NODE_ENV === 'production' && process.env.NEXT_PHASE !== 'phase-production-build') {
      // In production, Zod has already validated all required fields
      // These are just additional sanity checks for common mistakes

      // Type guard: in production mode, required fields are guaranteed by schema
      const secret = validated.NEXTAUTH_SECRET as string;
      const dbUrl = validated.DATABASE_URL as string;
      const redisUrl = validated.REDIS_URL as string;

      // Ensure critical secrets are not default/weak values
      if (secret === 'your-secret-here' || secret.includes('change-this')) {
        throw new Error(
          'NEXTAUTH_SECRET must be a strong secret, not a default value'
        );
      }

      // Ensure database is not pointing to localhost
      if (dbUrl.includes('localhost') || dbUrl.includes('127.0.0.1')) {
        throw new Error(
          'DATABASE_URL must point to a production database, not localhost'
        );
      }

      // Ensure Redis is not localhost
      if (redisUrl.includes('localhost') || redisUrl.includes('127.0.0.1')) {
        throw new Error(
          'REDIS_URL must point to a production Redis instance, not localhost'
        );
      }
    }

    return validated;
  } catch (error) {
    if (error instanceof z.ZodError) {
      // Format Zod validation errors
      const errors = error.issues.map((err: z.ZodIssue) => {
        const path = err.path.join('.');
        return `  - ${path}: ${err.message}`;
      }).join('\n');

      throw new Error(
        `❌ Environment variable validation failed:\n\n${errors}\n\n` +
        `Please check your .env file and ensure all required variables are set.\n` +
        `See .env.example for reference.`
      );
    }
    throw error;
  }
}

/**
 * Validated environment configuration
 * Import this instead of process.env for type safety
 */
export const env = validateEnv();

/**
 * Check if running in production
 */
export { isProduction };

/**
 * Check if running in development
 */
export const isDevelopment = env.NODE_ENV === 'development';

/**
 * Check if running in test
 */
export { isTest };

/**
 * Helper to log environment configuration (safe for production)
 */
export function logEnvStatus(): void {
  console.log('🔧 Environment Configuration:');
  console.log(`  - Node Environment: ${env.NODE_ENV}`);
  console.log(`  - App URL: ${env.NEXT_PUBLIC_APP_URL || 'Not set'}`);
  console.log(`  - Database: ${env.DATABASE_URL ? env.DATABASE_URL.substring(0, 20) + '...' : '✗ Not configured'}`);
  console.log(`  - Redis: ${env.REDIS_URL ? env.REDIS_URL.substring(0, 20) + '...' : '✗ Not configured'}`);
  console.log(`  - Azure OpenAI API: ${env.AZURE_OPENAI_API_KEY ? '✓ Configured' : '✗ Missing'}`);
  console.log(`  - Azure OpenAI Endpoint: ${env.AZURE_OPENAI_ENDPOINT}`);
  console.log(`  - ChromaDB: ${env.CHROMADB_URL ? env.CHROMADB_URL.substring(0, 30) + '...' : '✗ Not configured'}`);
  console.log(`  - Gamification: ${env.ENABLE_GAMIFICATION ? 'Enabled' : 'Disabled'}`);
  console.log(`  - AI Rate Limit: ${env.MAX_AI_REQUESTS_PER_MINUTE} req/min`);
  console.log('');
}
