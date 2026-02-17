/**
 * Lightweight error reporting wrapper.
 *
 * In development, errors are logged to the console with optional context.
 * In production, this is a no-op placeholder until a real error tracking
 * service (e.g. Sentry) is wired in.
 *
 * TODO: Integrate @sentry/nextjs when ready:
 *   import * as Sentry from '@sentry/nextjs';
 *   Sentry.captureException(error, { extra: context });
 */

const isDev = process.env.NODE_ENV === 'development';

/**
 * Report an error to the configured error tracking service.
 * Falls back to console.error in development.
 */
export function captureException(
  error: Error,
  context?: Record<string, unknown>,
): void {
  if (isDev) {
    console.error('[ErrorReporting]', error.message, {
      error,
      ...(context ? { context } : {}),
    });
    return;
  }

  // Production: silently swallow for now.
  // When Sentry is installed, replace this block:
  // Sentry.captureException(error, { extra: context });
}

/**
 * Set user context for error reports.
 *
 * TODO: Wire to Sentry.setUser when integrated.
 */
export function setUser(user: { id: string; email?: string } | null): void {
  if (isDev && user) {
    console.debug('[ErrorReporting] setUser', user.id);
  }
}
