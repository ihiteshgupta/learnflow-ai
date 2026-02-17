/**
 * Lightweight analytics abstraction.
 *
 * In development, events are logged to the console.
 * In production, this checks for a global `posthog` instance and forwards
 * events there if available. Otherwise events are silently dropped.
 *
 * TODO: Install posthog-js and switch to the PostHogProvider pattern for
 * full feature-flag and session-recording support.
 */

const isDev = process.env.NODE_ENV === 'development';

function getPostHog(): { capture: Function; identify: Function } | null {
  if (typeof window !== 'undefined' && (window as any).posthog) {
    return (window as any).posthog;
  }
  return null;
}

/**
 * Track a named event with optional properties.
 */
export function trackEvent(
  name: string,
  properties?: Record<string, unknown>,
): void {
  if (isDev) {
    console.log('[Analytics] trackEvent', name, properties ?? '');
    return;
  }

  const ph = getPostHog();
  if (ph) {
    ph.capture(name, properties);
  }
}

/**
 * Identify the current user for analytics attribution.
 */
export function identifyUser(
  userId: string,
  traits?: Record<string, unknown>,
): void {
  if (isDev) {
    console.log('[Analytics] identifyUser', userId, traits ?? '');
    return;
  }

  const ph = getPostHog();
  if (ph) {
    ph.identify(userId, traits);
  }
}

/**
 * Reset the current user (e.g. on logout).
 */
export function resetUser(): void {
  if (isDev) {
    console.log('[Analytics] resetUser');
    return;
  }

  const ph = getPostHog();
  if (ph && typeof (ph as any).reset === 'function') {
    (ph as any).reset();
  }
}
