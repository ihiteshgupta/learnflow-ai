/**
 * Application startup validation
 * Runs environment validation and logs configuration status
 */

import { env, logEnvStatus, isProduction } from './env';

/**
 * Validate application startup requirements
 * Call this early in the application lifecycle
 */
export function validateStartup(): void {
  // Environment validation happens automatically when env module is imported
  // If we reach here, validation passed

  if (isProduction) {
    console.log('🚀 Starting Dronacharya in PRODUCTION mode');
  } else {
    console.log('🔧 Starting Dronacharya in DEVELOPMENT mode');
  }

  // Log configuration status
  logEnvStatus();

  // Validate critical services connectivity (in production)
  if (isProduction) {
    validateProductionReadiness();
  }
}

/**
 * Additional production readiness checks
 */
function validateProductionReadiness(): void {
  const warnings: string[] = [];

  // Check for weak/default secrets
  if (env.NEXTAUTH_SECRET && (
      env.NEXTAUTH_SECRET.includes('change-this') ||
      env.NEXTAUTH_SECRET.includes('secret-here'))) {
    warnings.push('⚠️  NEXTAUTH_SECRET appears to be a default value');
  }

  // Check for development URLs in production
  if (env.NEXT_PUBLIC_APP_URL && env.NEXT_PUBLIC_APP_URL.includes('localhost')) {
    warnings.push('⚠️  NEXT_PUBLIC_APP_URL points to localhost in production');
  }

  // Check database configuration
  if (env.DATABASE_URL && (env.DATABASE_URL.includes('localhost') || env.DATABASE_URL.includes('127.0.0.1'))) {
    warnings.push('⚠️  DATABASE_URL points to localhost in production');
  }

  // Check Redis configuration
  if (env.REDIS_URL && (env.REDIS_URL.includes('localhost') || env.REDIS_URL.includes('127.0.0.1'))) {
    warnings.push('⚠️  REDIS_URL points to localhost in production');
  }

  // Check if using TLS for Redis in production
  if (env.REDIS_URL && env.REDIS_URL.startsWith('redis://') && !env.REDIS_URL.includes('localhost')) {
    warnings.push('⚠️  Consider using rediss:// (TLS) for Redis in production');
  }

  // Display warnings
  if (warnings.length > 0) {
    console.warn('\n⚠️  Production Configuration Warnings:');
    warnings.forEach((warning) => console.warn(warning));
    console.warn('');
  }

  console.log('✅ Production readiness validation complete\n');
}

/**
 * Get sanitized environment summary for logging
 */
export function getEnvSummary(): Record<string, string> {
  return {
    nodeEnv: env.NODE_ENV,
    appUrl: env.NEXT_PUBLIC_APP_URL || 'Not set',
    database: env.DATABASE_URL ? env.DATABASE_URL.substring(0, 20) + '...' : 'Not configured',
    redis: env.REDIS_URL ? env.REDIS_URL.substring(0, 20) + '...' : 'Not configured',
    azureOpenAI: env.AZURE_OPENAI_API_KEY ? 'Configured' : 'Not configured',
    azureOpenAIEndpoint: env.AZURE_OPENAI_ENDPOINT ? env.AZURE_OPENAI_ENDPOINT.substring(0, 40) + '...' : 'Not configured',
    chromadb: env.CHROMADB_URL ? env.CHROMADB_URL.substring(0, 30) + '...' : 'Not configured',
    gamification: env.ENABLE_GAMIFICATION ? 'Enabled' : 'Disabled',
    aiRateLimit: `${env.MAX_AI_REQUESTS_PER_MINUTE} req/min`,
  };
}

// Run validation when module is imported
if (typeof window === 'undefined') {
  // Only run on server-side
  try {
    validateStartup();
  } catch (error) {
    console.error('❌ Startup validation failed:', error);
    // In production, fail fast
    if (isProduction) {
      process.exit(1);
    }
  }
}
