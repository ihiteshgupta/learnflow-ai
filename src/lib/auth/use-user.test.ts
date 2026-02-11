import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useUser, getUserId } from './use-user';

// Mock next-auth/react
const mockUseSession = vi.fn();
vi.mock('next-auth/react', () => ({
  useSession: () => mockUseSession(),
}));

const DEMO_USER_ID = 'demo-user-00000000-0000-0000-0000';

describe('useUser', () => {
  beforeEach(() => {
    mockUseSession.mockReset();
  });

  describe('when session is loading', () => {
    it('should return null user and loading true', () => {
      mockUseSession.mockReturnValue({
        data: null,
        status: 'loading',
      });

      const { result } = renderHook(() => useUser());

      expect(result.current.user).toBeNull();
      expect(result.current.isLoading).toBe(true);
    });
  });

  describe('when user is authenticated', () => {
    it('should return the authenticated user', () => {
      mockUseSession.mockReturnValue({
        data: {
          user: {
            id: 'real-user-123',
            name: 'Test User',
            email: 'test@example.com',
          },
        },
        status: 'authenticated',
      });

      const { result } = renderHook(() => useUser());

      expect(result.current.user).toEqual({
        id: 'real-user-123',
        name: 'Test User',
        email: 'test@example.com',
        isDemo: false,
      });
      expect(result.current.isLoading).toBe(false);
    });

    it('should use demo ID if user ID is missing', () => {
      mockUseSession.mockReturnValue({
        data: {
          user: {
            name: 'Test User',
            email: 'test@example.com',
          },
        },
        status: 'authenticated',
      });

      const { result } = renderHook(() => useUser());

      expect(result.current.user?.id).toBe(DEMO_USER_ID);
      expect(result.current.user?.isDemo).toBe(false);
    });
  });

  describe('when user is not authenticated', () => {
    it('should return demo user', () => {
      mockUseSession.mockReturnValue({
        data: null,
        status: 'unauthenticated',
      });

      const { result } = renderHook(() => useUser());

      expect(result.current.user).toEqual({
        id: DEMO_USER_ID,
        name: 'Beta User',
        email: 'demo@dronacharya.app',
        isDemo: true,
      });
      expect(result.current.isLoading).toBe(false);
    });
  });
});

describe('getUserId', () => {
  it('should return demo user ID', () => {
    const userId = getUserId();
    expect(userId).toBe(DEMO_USER_ID);
  });
});
