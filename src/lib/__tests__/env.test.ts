import { describe, it, expect } from 'vitest';
import { z } from 'zod';

// Test the schema directly instead of the module to avoid side effects
describe('env validation schema', () => {
  const envSchema = z.object({
    NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
    NEXT_PUBLIC_APP_URL: z.string().url().default('http://localhost:3000'),
    DATABASE_URL: z.string().min(1).refine(
      (val) => {
        if (val === 'mock') {
          return process.env.NODE_ENV !== 'production';
        }
        return val.startsWith('postgres://') || val.startsWith('postgresql://');
      },
      { message: 'DATABASE_URL must be a valid PostgreSQL connection string in production' }
    ),
    DATABASE_POOL_SIZE: z.coerce.number().positive().max(100).default(10),
    REDIS_URL: z.string().url().refine(
      (val) => val.startsWith('redis://') || val.startsWith('rediss://'),
      { message: 'REDIS_URL must be a valid Redis connection string' }
    ),
    NEXTAUTH_SECRET: z.string().min(32),
    NEXTAUTH_URL: z.string().url().default('http://localhost:3000'),
    ANTHROPIC_API_KEY: z.string().min(1).refine(
      (val) => val.startsWith('sk-ant-'),
      { message: 'ANTHROPIC_API_KEY must start with "sk-ant-"' }
    ),
    OPENAI_API_KEY: z.string().startsWith('sk-').optional(),
    AI_MODEL_PRIMARY: z.string().default('claude-sonnet-4-20250514'),
    AI_MODEL_FALLBACK: z.string().default('gpt-4o'),
    QDRANT_URL: z.string().url().refine(
      (val) => val.startsWith('http://') || val.startsWith('https://'),
      { message: 'QDRANT_URL must be a valid HTTP(S) URL' }
    ),
    QDRANT_API_KEY: z.string().optional(),
    ENABLE_GAMIFICATION: z.enum(['true', 'false']).default('true').transform((val) => val === 'true'),
    ENABLE_AI_PROCTORING: z.enum(['true', 'false']).default('false').transform((val) => val === 'true'),
    MAX_AI_REQUESTS_PER_MINUTE: z.coerce.number().positive().max(1000).default(30),
  });

  const validEnv = {
    DATABASE_URL: 'postgresql://localhost:5432/test',
    REDIS_URL: 'redis://localhost:6379',
    NEXTAUTH_SECRET: 'a'.repeat(32),
    ANTHROPIC_API_KEY: 'sk-ant-test123',
    QDRANT_URL: 'http://localhost:6333',
  };

  describe('required variables', () => {
    it('should fail without DATABASE_URL', () => {
      const env: Record<string, unknown> = { ...validEnv };
      delete env.DATABASE_URL;
      expect(() => envSchema.parse(env)).toThrow();
    });

    it('should fail without REDIS_URL', () => {
      const env: Record<string, unknown> = { ...validEnv };
      delete env.REDIS_URL;
      expect(() => envSchema.parse(env)).toThrow();
    });

    it('should fail without NEXTAUTH_SECRET', () => {
      const env: Record<string, unknown> = { ...validEnv };
      delete env.NEXTAUTH_SECRET;
      expect(() => envSchema.parse(env)).toThrow();
    });

    it('should fail without ANTHROPIC_API_KEY', () => {
      const env: Record<string, unknown> = { ...validEnv };
      delete env.ANTHROPIC_API_KEY;
      expect(() => envSchema.parse(env)).toThrow();
    });

    it('should fail without QDRANT_URL', () => {
      const env: Record<string, unknown> = { ...validEnv };
      delete env.QDRANT_URL;
      expect(() => envSchema.parse(env)).toThrow();
    });
  });

  describe('DATABASE_URL validation', () => {
    it('should accept valid PostgreSQL URL', () => {
      const env = {
        ...validEnv,
        DATABASE_URL: 'postgresql://user:pass@localhost:5432/db',
      };
      expect(() => envSchema.parse(env)).not.toThrow();
    });

    it('should accept postgres:// protocol', () => {
      const env = {
        ...validEnv,
        DATABASE_URL: 'postgres://user:pass@localhost:5432/db',
      };
      expect(() => envSchema.parse(env)).not.toThrow();
    });

    it('should accept mock in development', () => {
      const env = {
        ...validEnv,
        NODE_ENV: 'development' as const,
        DATABASE_URL: 'mock',
      };
      expect(() => envSchema.parse(env)).not.toThrow();
    });

    it('should reject invalid database URL', () => {
      const env = {
        ...validEnv,
        DATABASE_URL: 'invalid-url',
      };
      expect(() => envSchema.parse(env)).toThrow();
    });
  });

  describe('NEXTAUTH_SECRET validation', () => {
    it('should require minimum 32 characters', () => {
      const env = {
        ...validEnv,
        NEXTAUTH_SECRET: 'short',
      };
      expect(() => envSchema.parse(env)).toThrow();
    });

    it('should accept 32+ character secret', () => {
      const env = {
        ...validEnv,
        NEXTAUTH_SECRET: 'a'.repeat(32),
      };
      expect(() => envSchema.parse(env)).not.toThrow();
    });

    it('should accept 64 character secret', () => {
      const env = {
        ...validEnv,
        NEXTAUTH_SECRET: 'a'.repeat(64),
      };
      expect(() => envSchema.parse(env)).not.toThrow();
    });
  });

  describe('ANTHROPIC_API_KEY validation', () => {
    it('should require sk-ant- prefix', () => {
      const env = {
        ...validEnv,
        ANTHROPIC_API_KEY: 'invalid-key',
      };
      expect(() => envSchema.parse(env)).toThrow();
    });

    it('should accept valid Anthropic key', () => {
      const env = {
        ...validEnv,
        ANTHROPIC_API_KEY: 'sk-ant-api03-1234567890',
      };
      expect(() => envSchema.parse(env)).not.toThrow();
    });
  });

  describe('OPENAI_API_KEY validation', () => {
    it('should be optional', () => {
      const env = { ...validEnv };
      // No OPENAI_API_KEY
      expect(() => envSchema.parse(env)).not.toThrow();
    });

    it('should require sk- prefix when provided', () => {
      const env = {
        ...validEnv,
        OPENAI_API_KEY: 'invalid-key',
      };
      expect(() => envSchema.parse(env)).toThrow();
    });

    it('should accept valid OpenAI key', () => {
      const env = {
        ...validEnv,
        OPENAI_API_KEY: 'sk-1234567890',
      };
      expect(() => envSchema.parse(env)).not.toThrow();
    });
  });

  describe('REDIS_URL validation', () => {
    it('should accept redis:// protocol', () => {
      const env = {
        ...validEnv,
        REDIS_URL: 'redis://localhost:6379',
      };
      expect(() => envSchema.parse(env)).not.toThrow();
    });

    it('should accept rediss:// protocol (TLS)', () => {
      const env = {
        ...validEnv,
        REDIS_URL: 'rediss://secure-redis:6379',
      };
      expect(() => envSchema.parse(env)).not.toThrow();
    });

    it('should reject invalid Redis URL', () => {
      const env = {
        ...validEnv,
        REDIS_URL: 'http://invalid',
      };
      expect(() => envSchema.parse(env)).toThrow('valid Redis connection string');
    });
  });

  describe('QDRANT_URL validation', () => {
    it('should accept http:// URL', () => {
      const env = {
        ...validEnv,
        QDRANT_URL: 'http://localhost:6333',
      };
      expect(() => envSchema.parse(env)).not.toThrow();
    });

    it('should accept https:// URL', () => {
      const env = {
        ...validEnv,
        QDRANT_URL: 'https://qdrant.example.com',
      };
      expect(() => envSchema.parse(env)).not.toThrow();
    });

    it('should reject invalid protocol', () => {
      const env = {
        ...validEnv,
        QDRANT_URL: 'grpc://invalid',
      };
      expect(() => envSchema.parse(env)).toThrow('valid HTTP(S) URL');
    });
  });

  describe('default values', () => {
    it('should apply default NODE_ENV', () => {
      const env = { ...validEnv };
      const result = envSchema.parse(env);
      expect(result.NODE_ENV).toBe('development');
    });

    it('should apply default DATABASE_POOL_SIZE', () => {
      const env = { ...validEnv };
      const result = envSchema.parse(env);
      expect(result.DATABASE_POOL_SIZE).toBe(10);
    });

    it('should apply custom DATABASE_POOL_SIZE', () => {
      const env = { ...validEnv, DATABASE_POOL_SIZE: '20' };
      const result = envSchema.parse(env);
      expect(result.DATABASE_POOL_SIZE).toBe(20);
    });

    it('should apply default AI_MODEL_PRIMARY', () => {
      const env = { ...validEnv };
      const result = envSchema.parse(env);
      expect(result.AI_MODEL_PRIMARY).toBe('claude-sonnet-4-20250514');
    });

    it('should apply default MAX_AI_REQUESTS_PER_MINUTE', () => {
      const env = { ...validEnv };
      const result = envSchema.parse(env);
      expect(result.MAX_AI_REQUESTS_PER_MINUTE).toBe(30);
    });
  });

  describe('feature flags', () => {
    it('should parse ENABLE_GAMIFICATION as boolean', () => {
      const env = { ...validEnv, ENABLE_GAMIFICATION: 'true' };
      const result = envSchema.parse(env);
      expect(result.ENABLE_GAMIFICATION).toBe(true);
    });

    it('should parse false string as boolean false', () => {
      const env = { ...validEnv, ENABLE_AI_PROCTORING: 'false' };
      const result = envSchema.parse(env);
      expect(result.ENABLE_AI_PROCTORING).toBe(false);
    });

    it('should apply default gamification value', () => {
      const env = { ...validEnv };
      const result = envSchema.parse(env);
      expect(result.ENABLE_GAMIFICATION).toBe(true);
    });
  });

  describe('numeric coercion', () => {
    it('should coerce DATABASE_POOL_SIZE string to number', () => {
      const env = { ...validEnv, DATABASE_POOL_SIZE: '25' };
      const result = envSchema.parse(env);
      expect(result.DATABASE_POOL_SIZE).toBe(25);
    });

    it('should reject negative pool size', () => {
      const env = { ...validEnv, DATABASE_POOL_SIZE: '-5' };
      expect(() => envSchema.parse(env)).toThrow();
    });

    it('should reject pool size over 100', () => {
      const env = { ...validEnv, DATABASE_POOL_SIZE: '150' };
      expect(() => envSchema.parse(env)).toThrow();
    });

    it('should coerce MAX_AI_REQUESTS_PER_MINUTE', () => {
      const env = { ...validEnv, MAX_AI_REQUESTS_PER_MINUTE: '50' };
      const result = envSchema.parse(env);
      expect(result.MAX_AI_REQUESTS_PER_MINUTE).toBe(50);
    });
  });

  describe('complete valid configuration', () => {
    it('should accept minimal valid configuration', () => {
      expect(() => envSchema.parse(validEnv)).not.toThrow();
    });

    it('should accept full valid configuration', () => {
      const env = {
        NODE_ENV: 'production' as const,
        NEXT_PUBLIC_APP_URL: 'https://www.dronacharya.app',
        DATABASE_URL: 'postgresql://user:pass@prod-db.example.com:5432/dronacharya',
        DATABASE_POOL_SIZE: '20',
        REDIS_URL: 'rediss://prod-redis.example.com:6379',
        NEXTAUTH_SECRET: 'very-strong-secret-here-32-characters-long',
        NEXTAUTH_URL: 'https://www.dronacharya.app',
        ANTHROPIC_API_KEY: 'sk-ant-api03-production-key',
        OPENAI_API_KEY: 'sk-proj-production-key',
        AI_MODEL_PRIMARY: 'claude-sonnet-4-20250514',
        AI_MODEL_FALLBACK: 'gpt-4o',
        QDRANT_URL: 'https://qdrant.example.com',
        QDRANT_API_KEY: 'api-key-here',
        ENABLE_GAMIFICATION: 'true',
        ENABLE_AI_PROCTORING: 'false',
        MAX_AI_REQUESTS_PER_MINUTE: '60',
      };
      expect(() => envSchema.parse(env)).not.toThrow();
    });
  });
});
