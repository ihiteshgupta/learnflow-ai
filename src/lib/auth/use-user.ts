'use client';

import { useSession } from 'next-auth/react';

// Demo user for unauthenticated beta users
const DEMO_USER_ID = 'demo-user-00000000-0000-0000-0000';

export interface User {
  id: string;
  name: string;
  email: string;
  isDemo: boolean;
}

export function useUser(): { user: User | null; isLoading: boolean } {
  const { data: session, status } = useSession();

  if (status === 'loading') {
    return { user: null, isLoading: true };
  }

  if (session?.user) {
    return {
      user: {
        id: session.user.id || DEMO_USER_ID,
        name: session.user.name || 'User',
        email: session.user.email || '',
        isDemo: false,
      },
      isLoading: false,
    };
  }

  // Return demo user for unauthenticated beta users
  return {
    user: {
      id: DEMO_USER_ID,
      name: 'Beta User',
      email: 'demo@dronacharya.app',
      isDemo: true,
    },
    isLoading: false,
  };
}

export function getUserId(): string {
  // This is a simple sync version for use in tRPC context headers
  // Will be replaced with proper session when user is logged in
  return DEMO_USER_ID;
}
