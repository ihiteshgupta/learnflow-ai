'use client';

import { createContext, useContext, useCallback, type ReactNode } from 'react';
import { trackEvent, identifyUser, resetUser } from '@/lib/analytics/tracker';

interface AnalyticsContextValue {
  track: (name: string, properties?: Record<string, unknown>) => void;
  identify: (userId: string, traits?: Record<string, unknown>) => void;
  reset: () => void;
}

const AnalyticsContext = createContext<AnalyticsContextValue>({
  track: trackEvent,
  identify: identifyUser,
  reset: resetUser,
});

export function useAnalytics() {
  return useContext(AnalyticsContext);
}

/**
 * Wraps the application with analytics context.
 *
 * Currently delegates to the lightweight tracker. When PostHog is installed,
 * swap this for the PostHogProvider-based implementation.
 */
export function AnalyticsProvider({ children }: { children: ReactNode }) {
  const track = useCallback(
    (name: string, properties?: Record<string, unknown>) => {
      trackEvent(name, properties);
    },
    [],
  );

  const identify = useCallback(
    (userId: string, traits?: Record<string, unknown>) => {
      identifyUser(userId, traits);
    },
    [],
  );

  const reset = useCallback(() => {
    resetUser();
  }, []);

  return (
    <AnalyticsContext.Provider value={{ track, identify, reset }}>
      {children}
    </AnalyticsContext.Provider>
  );
}
