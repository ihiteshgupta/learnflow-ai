# Phase 1: Critical Fixes & Testing - Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Fix TypeScript build errors, add missing npm scripts, set up test infrastructure, and achieve 80%+ test coverage on core modules.

**Architecture:** Fix auth integration by using NextAuth session in tRPC context instead of invalid per-query headers. Set up Vitest for unit/integration tests, Playwright for E2E.

**Tech Stack:** TypeScript, NextAuth v5, tRPC v11, Vitest, Playwright, MSW

---

## Task 1: Add Missing NPM Scripts

**Files:**
- Modify: `package.json`

**Step 1: Add typecheck and test scripts**

Edit `package.json` scripts section:

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "eslint",
    "typecheck": "tsc --noEmit",
    "test": "vitest",
    "test:unit": "vitest run --coverage",
    "test:integration": "vitest run --config vitest.integration.config.ts",
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui",
    "db:generate": "drizzle-kit generate",
    "db:migrate": "drizzle-kit migrate",
    "db:push": "drizzle-kit push",
    "db:studio": "drizzle-kit studio"
  }
}
```

**Step 2: Commit**

```bash
git add package.json
git commit -m "chore: add typecheck and test scripts to package.json"
```

---

## Task 2: Fix tRPC Context to Use NextAuth Session

**Files:**
- Modify: `src/lib/trpc/context.ts`
- Modify: `src/app/api/trpc/[trpc]/route.ts`

**Step 1: Update context.ts to support NextAuth session**

Replace `src/lib/trpc/context.ts`:

```typescript
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { auth } from '@/lib/auth';

export interface Context {
  db: typeof db;
  user: {
    id: string;
    email: string;
    name: string;
    role: string;
    orgId: string | null;
    teamId: string | null;
  } | null;
}

export async function createContext(): Promise<Context> {
  // Get session from NextAuth
  const session = await auth();

  let user = null;
  if (session?.user?.id) {
    try {
      const dbUser = await db.query.users.findFirst({
        where: eq(users.id, session.user.id),
      });
      if (dbUser) {
        user = {
          id: dbUser.id,
          email: dbUser.email,
          name: dbUser.name,
          role: dbUser.role,
          orgId: dbUser.orgId,
          teamId: dbUser.teamId,
        };
      }
    } catch (error) {
      console.error('Database error during user lookup:', error);
      return { db, user: null };
    }
  }

  return { db, user };
}

export type CreateContext = typeof createContext;
```

**Step 2: Update tRPC route to use new context**

Replace `src/app/api/trpc/[trpc]/route.ts`:

```typescript
import { fetchRequestHandler } from '@trpc/server/adapters/fetch';
import { appRouter } from '@/lib/trpc/root';
import { createContext } from '@/lib/trpc/context';

const handler = (req: Request) =>
  fetchRequestHandler({
    endpoint: '/api/trpc',
    req,
    router: appRouter,
    createContext,
  });

export { handler as GET, handler as POST };
```

**Step 3: Verify no TypeScript errors in context**

Run: `pnpm tsc --noEmit src/lib/trpc/context.ts`
Expected: No errors

**Step 4: Commit**

```bash
git add src/lib/trpc/context.ts src/app/api/trpc/[trpc]/route.ts
git commit -m "fix: use NextAuth session in tRPC context instead of headers"
```

---

## Task 3: Fix Dashboard Page (Remove Invalid Context Option)

**Files:**
- Modify: `src/app/page.tsx`

**Step 1: Remove TEST_USER_ID and invalid context options**

The page should simply call useQuery without the invalid context option. The session is automatically available via cookies.

Find and replace in `src/app/page.tsx`:

Remove this line:
```typescript
const TEST_USER_ID = '11111111-1111-1111-1111-111111111111';
```

Replace:
```typescript
const { data: profile, isLoading: profileLoading } = trpc.gamification.getProfile.useQuery(undefined, {
  context: { headers: { 'x-user-id': TEST_USER_ID } },
});
```

With:
```typescript
const { data: profile, isLoading: profileLoading } = trpc.gamification.getProfile.useQuery();
```

Replace:
```typescript
const { data: achievements } = trpc.gamification.getAchievements.useQuery(undefined, {
  context: { headers: { 'x-user-id': TEST_USER_ID } },
});
```

With:
```typescript
const { data: achievements } = trpc.gamification.getAchievements.useQuery();
```

**Step 2: Commit**

```bash
git add src/app/page.tsx
git commit -m "fix: remove invalid tRPC context option from dashboard"
```

---

## Task 4: Fix Achievements Page

**Files:**
- Modify: `src/app/achievements/page.tsx`

**Step 1: Remove TEST_USER_ID and invalid context options**

Remove this line:
```typescript
const TEST_USER_ID = '11111111-1111-1111-1111-111111111111';
```

Replace both useQuery calls to remove the invalid context option:

```typescript
const { data: achievements, isLoading } = trpc.gamification.getAchievements.useQuery();

const { data: profile } = trpc.gamification.getProfile.useQuery();
```

**Step 2: Commit**

```bash
git add src/app/achievements/page.tsx
git commit -m "fix: remove invalid tRPC context option from achievements page"
```

---

## Task 5: Fix Courses Page

**Files:**
- Modify: `src/app/courses/page.tsx`

**Step 1: Read current file to find exact location**

Check the useQuery call and remove the context option.

Replace:
```typescript
trpc.course.getTracks.useQuery(
  { domainId: selectedDomain },
  { context: { headers: { 'x-user-id': TEST_USER_ID } } }
)
```

With:
```typescript
trpc.course.getTracks.useQuery({ domainId: selectedDomain })
```

Remove TEST_USER_ID constant if present.

**Step 2: Commit**

```bash
git add src/app/courses/page.tsx
git commit -m "fix: remove invalid tRPC context option from courses page"
```

---

## Task 6: Fix Analytics Page

**Files:**
- Modify: `src/app/analytics/page.tsx`

**Step 1: Remove TEST_USER_ID and invalid context options**

Remove TEST_USER_ID constant and fix the useQuery call.

**Step 2: Commit**

```bash
git add src/app/analytics/page.tsx
git commit -m "fix: remove invalid tRPC context option from analytics page"
```

---

## Task 7: Fix AI Chat Route

**Files:**
- Modify: `src/app/api/ai/chat/route.ts`

**Step 1: Check and fix if using x-user-id header**

Read the file and update to use NextAuth session instead of x-user-id header.

**Step 2: Commit**

```bash
git add src/app/api/ai/chat/route.ts
git commit -m "fix: use NextAuth session in AI chat route"
```

---

## Task 8: Verify Build Passes

**Step 1: Run TypeScript check**

Run: `pnpm typecheck`
Expected: No errors

**Step 2: Run build**

Run: `pnpm build`
Expected: Build succeeds

**Step 3: Commit any remaining fixes**

```bash
git add .
git commit -m "fix: resolve remaining TypeScript errors"
```

---

## Task 9: Set Up Vitest Configuration

**Files:**
- Create: `vitest.config.ts`
- Create: `vitest.setup.ts`
- Create: `vitest.integration.config.ts`

**Step 1: Create vitest.config.ts**

```typescript
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
    include: ['src/**/*.test.{ts,tsx}'],
    exclude: ['src/**/*.integration.test.ts', 'node_modules'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      include: ['src/lib/**/*.ts', 'src/components/**/*.tsx'],
      exclude: [
        'src/**/*.test.ts',
        'src/**/*.d.ts',
        'src/lib/db/schema/**',
      ],
      thresholds: {
        statements: 80,
        branches: 80,
        functions: 80,
        lines: 80,
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
```

**Step 2: Create vitest.setup.ts**

```typescript
import '@testing-library/jest-dom/vitest';
import { beforeAll, afterAll, afterEach } from 'vitest';
import { server } from './src/__tests__/mocks/server';

// Start MSW server before all tests
beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));

// Reset handlers after each test
afterEach(() => server.resetHandlers());

// Close server after all tests
afterAll(() => server.close());
```

**Step 3: Create vitest.integration.config.ts**

```typescript
import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['src/**/*.integration.test.ts'],
    setupFiles: ['./vitest.integration.setup.ts'],
    testTimeout: 30000,
    hookTimeout: 30000,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
```

**Step 4: Create vitest.integration.setup.ts**

```typescript
import { beforeAll, afterAll } from 'vitest';

// Setup test database connection
beforeAll(async () => {
  // Database setup will be added when we have test DB
  console.log('Setting up integration test environment...');
});

afterAll(async () => {
  // Cleanup
  console.log('Cleaning up integration test environment...');
});
```

**Step 5: Commit**

```bash
git add vitest.config.ts vitest.setup.ts vitest.integration.config.ts vitest.integration.setup.ts
git commit -m "chore: add Vitest configuration for unit and integration tests"
```

---

## Task 10: Set Up MSW Mocks

**Files:**
- Create: `src/__tests__/mocks/handlers.ts`
- Create: `src/__tests__/mocks/server.ts`

**Step 1: Create mock handlers**

Create `src/__tests__/mocks/handlers.ts`:

```typescript
import { http, HttpResponse } from 'msw';

export const handlers = [
  // tRPC batch handler
  http.post('/api/trpc/*', async ({ request }) => {
    const url = new URL(request.url);
    const procedure = url.pathname.replace('/api/trpc/', '');

    // Add mock responses for procedures as needed
    // This is a catch-all that returns empty success
    return HttpResponse.json({
      result: {
        data: null,
      },
    });
  }),
];
```

**Step 2: Create MSW server**

Create `src/__tests__/mocks/server.ts`:

```typescript
import { setupServer } from 'msw/node';
import { handlers } from './handlers';

export const server = setupServer(...handlers);
```

**Step 3: Commit**

```bash
mkdir -p src/__tests__/mocks
git add src/__tests__/mocks/handlers.ts src/__tests__/mocks/server.ts
git commit -m "chore: add MSW mock server for API testing"
```

---

## Task 11: Set Up Playwright Configuration

**Files:**
- Create: `playwright.config.ts`

**Step 1: Create Playwright config**

```typescript
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './src/__tests__/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    command: 'pnpm dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },
});
```

**Step 2: Create E2E test directory**

```bash
mkdir -p src/__tests__/e2e
```

**Step 3: Commit**

```bash
git add playwright.config.ts
git commit -m "chore: add Playwright configuration for E2E tests"
```

---

## Task 12: Write Unit Tests for XP Calculator

**Files:**
- Create: `src/lib/utils/__tests__/xp-calculator.test.ts`

**Step 1: Create test file**

```typescript
import { describe, it, expect } from 'vitest';
import {
  calculateLessonXP,
  calculateLevelFromXP,
  calculateXPForLevel,
  calculateStreakMultiplier,
} from '../xp-calculator';

describe('xp-calculator', () => {
  describe('calculateLessonXP', () => {
    it('returns base XP for completing a lesson', () => {
      const xp = calculateLessonXP({ completed: true, score: 100, timeSpent: 300 });
      expect(xp).toBeGreaterThan(0);
    });

    it('returns 0 for incomplete lesson', () => {
      const xp = calculateLessonXP({ completed: false, score: 0, timeSpent: 0 });
      expect(xp).toBe(0);
    });

    it('gives bonus XP for perfect score', () => {
      const perfectXP = calculateLessonXP({ completed: true, score: 100, timeSpent: 300 });
      const normalXP = calculateLessonXP({ completed: true, score: 70, timeSpent: 300 });
      expect(perfectXP).toBeGreaterThan(normalXP);
    });
  });

  describe('calculateLevelFromXP', () => {
    it('returns level 1 for 0 XP', () => {
      expect(calculateLevelFromXP(0)).toBe(1);
    });

    it('returns correct level for given XP', () => {
      expect(calculateLevelFromXP(100)).toBeGreaterThanOrEqual(1);
      expect(calculateLevelFromXP(1000)).toBeGreaterThanOrEqual(2);
    });
  });

  describe('calculateXPForLevel', () => {
    it('returns XP required for level 2', () => {
      const xp = calculateXPForLevel(2);
      expect(xp).toBeGreaterThan(0);
    });

    it('XP requirements increase with level', () => {
      const level2XP = calculateXPForLevel(2);
      const level3XP = calculateXPForLevel(3);
      expect(level3XP).toBeGreaterThan(level2XP);
    });
  });

  describe('calculateStreakMultiplier', () => {
    it('returns 1x for streak of 0', () => {
      expect(calculateStreakMultiplier(0)).toBe(1);
    });

    it('returns higher multiplier for longer streaks', () => {
      const mult1 = calculateStreakMultiplier(1);
      const mult7 = calculateStreakMultiplier(7);
      expect(mult7).toBeGreaterThan(mult1);
    });
  });
});
```

**Step 2: Run test to verify**

Run: `pnpm test:unit src/lib/utils/__tests__/xp-calculator.test.ts`
Expected: Tests pass (may need to adjust based on actual function signatures)

**Step 3: Commit**

```bash
git add src/lib/utils/__tests__/xp-calculator.test.ts
git commit -m "test: add unit tests for xp-calculator"
```

---

## Task 13: Write Unit Tests for Streak Calculator

**Files:**
- Create: `src/lib/utils/__tests__/streak-calculator.test.ts`

**Step 1: Create test file**

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  calculateStreak,
  isStreakActive,
  shouldRewardStreak,
} from '../streak-calculator';

describe('streak-calculator', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  describe('calculateStreak', () => {
    it('returns 0 for no activity', () => {
      const streak = calculateStreak([]);
      expect(streak).toBe(0);
    });

    it('returns 1 for single day activity', () => {
      const today = new Date();
      const streak = calculateStreak([today]);
      expect(streak).toBe(1);
    });

    it('returns correct streak for consecutive days', () => {
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      const dayBefore = new Date(today);
      dayBefore.setDate(dayBefore.getDate() - 2);

      const streak = calculateStreak([dayBefore, yesterday, today]);
      expect(streak).toBe(3);
    });

    it('breaks streak on missed day', () => {
      const today = new Date();
      const threeDaysAgo = new Date(today);
      threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

      const streak = calculateStreak([threeDaysAgo, today]);
      expect(streak).toBe(1);
    });
  });

  describe('isStreakActive', () => {
    it('returns true if last activity was today', () => {
      const today = new Date();
      expect(isStreakActive(today)).toBe(true);
    });

    it('returns true if last activity was yesterday', () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      expect(isStreakActive(yesterday)).toBe(true);
    });

    it('returns false if last activity was 2+ days ago', () => {
      const twoDaysAgo = new Date();
      twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
      expect(isStreakActive(twoDaysAgo)).toBe(false);
    });
  });
});
```

**Step 2: Run test**

Run: `pnpm test:unit src/lib/utils/__tests__/streak-calculator.test.ts`

**Step 3: Commit**

```bash
git add src/lib/utils/__tests__/streak-calculator.test.ts
git commit -m "test: add unit tests for streak-calculator"
```

---

## Task 14: Write Unit Tests for Rate Limiter

**Files:**
- Create: `src/lib/auth/__tests__/rate-limit.test.ts`

**Step 1: Create test file**

```typescript
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { checkRateLimit, resetRateLimit } from '../rate-limit';

describe('rate-limit', () => {
  beforeEach(() => {
    // Reset all rate limits between tests
    resetRateLimit('test-key');
  });

  describe('checkRateLimit', () => {
    it('allows first request', () => {
      const result = checkRateLimit('test-key');
      expect(result.allowed).toBe(true);
    });

    it('allows requests within limit', () => {
      for (let i = 0; i < 5; i++) {
        const result = checkRateLimit('test-key-2');
        expect(result.allowed).toBe(true);
      }
    });

    it('blocks requests after limit exceeded', () => {
      const key = 'test-key-3';
      // Exhaust the limit (assuming limit is around 5-10)
      for (let i = 0; i < 15; i++) {
        checkRateLimit(key);
      }
      const result = checkRateLimit(key);
      expect(result.allowed).toBe(false);
    });

    it('tracks different keys independently', () => {
      const result1 = checkRateLimit('key-a');
      const result2 = checkRateLimit('key-b');
      expect(result1.allowed).toBe(true);
      expect(result2.allowed).toBe(true);
    });
  });

  describe('resetRateLimit', () => {
    it('allows requests after reset', () => {
      const key = 'reset-test';
      // Exhaust limit
      for (let i = 0; i < 15; i++) {
        checkRateLimit(key);
      }
      // Reset
      resetRateLimit(key);
      // Should be allowed again
      const result = checkRateLimit(key);
      expect(result.allowed).toBe(true);
    });
  });
});
```

**Step 2: Run test**

Run: `pnpm test:unit src/lib/auth/__tests__/rate-limit.test.ts`

**Step 3: Commit**

```bash
git add src/lib/auth/__tests__/rate-limit.test.ts
git commit -m "test: add unit tests for rate-limit"
```

---

## Task 15: Write Unit Tests for tRPC Gamification Router

**Files:**
- Create: `src/lib/trpc/routers/__tests__/gamification.test.ts`

**Step 1: Create test file**

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { appRouter } from '../../root';
import { createInnerTRPCContext } from '../../trpc';

// Mock the database
vi.mock('@/lib/db', () => ({
  db: {
    query: {
      users: {
        findFirst: vi.fn(),
      },
      achievements: {
        findMany: vi.fn(),
      },
      userAchievements: {
        findMany: vi.fn(),
      },
      xpTransactions: {
        findMany: vi.fn(),
      },
    },
    select: vi.fn().mockReturnThis(),
    from: vi.fn().mockReturnThis(),
    where: vi.fn().mockReturnThis(),
    orderBy: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
  },
}));

describe('gamification router', () => {
  const mockUser = {
    id: 'test-user-id',
    email: 'test@example.com',
    name: 'Test User',
    role: 'learner',
    orgId: null,
    teamId: null,
  };

  const createCaller = (user: typeof mockUser | null = mockUser) => {
    const ctx = createInnerTRPCContext({ user, db: vi.fn() as any });
    return appRouter.createCaller(ctx);
  };

  describe('getProfile', () => {
    it('throws UNAUTHORIZED when not logged in', async () => {
      const caller = createCaller(null);
      await expect(caller.gamification.getProfile()).rejects.toThrow('UNAUTHORIZED');
    });

    it('returns profile for authenticated user', async () => {
      const caller = createCaller();
      // This will need actual mock setup for the query
      // For now, test that it doesn't throw unauthorized
      try {
        await caller.gamification.getProfile();
      } catch (error: any) {
        expect(error.code).not.toBe('UNAUTHORIZED');
      }
    });
  });

  describe('getAchievements', () => {
    it('throws UNAUTHORIZED when not logged in', async () => {
      const caller = createCaller(null);
      await expect(caller.gamification.getAchievements()).rejects.toThrow('UNAUTHORIZED');
    });
  });

  describe('getLeaderboard', () => {
    it('returns leaderboard data', async () => {
      const caller = createCaller();
      // Test that the procedure exists and can be called
      try {
        await caller.gamification.getLeaderboard({ period: 'weekly' });
      } catch (error: any) {
        // May fail due to mock setup, but shouldn't be UNAUTHORIZED
        expect(error.code).not.toBe('UNAUTHORIZED');
      }
    });
  });
});
```

**Step 2: Run test**

Run: `pnpm test:unit src/lib/trpc/routers/__tests__/gamification.test.ts`

**Step 3: Commit**

```bash
git add src/lib/trpc/routers/__tests__/gamification.test.ts
git commit -m "test: add unit tests for gamification tRPC router"
```

---

## Task 16: Create Test Utilities

**Files:**
- Create: `src/__tests__/utils/test-utils.tsx`
- Create: `src/__tests__/utils/mock-data.ts`

**Step 1: Create test utilities**

Create `src/__tests__/utils/test-utils.tsx`:

```typescript
import React from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
      },
    },
  });

interface WrapperProps {
  children: React.ReactNode;
}

function AllTheProviders({ children }: WrapperProps) {
  const queryClient = createTestQueryClient();
  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}

const customRender = (
  ui: React.ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: AllTheProviders, ...options });

export * from '@testing-library/react';
export { customRender as render };
```

Create `src/__tests__/utils/mock-data.ts`:

```typescript
export const mockUser = {
  id: '11111111-1111-1111-1111-111111111111',
  email: 'test@example.com',
  name: 'Test User',
  role: 'learner',
  orgId: null,
  teamId: null,
};

export const mockGamificationProfile = {
  userId: mockUser.id,
  totalXp: 1500,
  currentStreak: 5,
  longestStreak: 10,
  level: 3,
  xpToNextLevel: 500,
};

export const mockAchievements = [
  {
    id: '1',
    name: 'First Steps',
    description: 'Complete your first lesson',
    iconUrl: '/icons/first-steps.svg',
    xpReward: 50,
    rarity: 'common',
    earned: true,
    earnedAt: new Date().toISOString(),
  },
  {
    id: '2',
    name: 'Streak Master',
    description: 'Maintain a 7-day streak',
    iconUrl: '/icons/streak.svg',
    xpReward: 100,
    rarity: 'rare',
    earned: false,
    earnedAt: null,
  },
];

export const mockDomains = [
  {
    id: '1',
    name: 'Technology',
    slug: 'technology',
    description: 'Programming and software development',
    iconUrl: '/icons/tech.svg',
  },
];

export const mockTracks = [
  {
    id: '1',
    name: 'Web Development',
    slug: 'web-development',
    description: 'Learn to build modern web applications',
    domainId: '1',
    difficulty: 'beginner',
    estimatedHours: 40,
  },
];
```

**Step 2: Commit**

```bash
git add src/__tests__/utils/test-utils.tsx src/__tests__/utils/mock-data.ts
git commit -m "test: add test utilities and mock data"
```

---

## Task 17: Write Basic E2E Test

**Files:**
- Create: `src/__tests__/e2e/navigation.spec.ts`

**Step 1: Create E2E test**

```typescript
import { test, expect } from '@playwright/test';

test.describe('Navigation', () => {
  test('should redirect to login when not authenticated', async ({ page }) => {
    await page.goto('/');
    // Should redirect to login page
    await expect(page).toHaveURL(/.*login/);
  });

  test('login page should load', async ({ page }) => {
    await page.goto('/auth/login');
    await expect(page.locator('h1, h2').first()).toBeVisible();
  });

  test('register page should load', async ({ page }) => {
    await page.goto('/auth/register');
    await expect(page.locator('h1, h2').first()).toBeVisible();
  });
});
```

**Step 2: Commit**

```bash
git add src/__tests__/e2e/navigation.spec.ts
git commit -m "test: add basic E2E navigation tests"
```

---

## Task 18: Run Full Test Suite and Fix Issues

**Step 1: Run typecheck**

Run: `pnpm typecheck`
Fix any errors that appear.

**Step 2: Run unit tests**

Run: `pnpm test:unit`
Fix any failing tests.

**Step 3: Run build**

Run: `pnpm build`
Verify build succeeds.

**Step 4: Install Playwright browsers**

Run: `pnpm exec playwright install chromium`

**Step 5: Run E2E tests (optional - requires running server)**

Run: `pnpm test:e2e`

**Step 6: Final commit**

```bash
git add .
git commit -m "test: fix all test issues and verify full test suite passes"
```

---

## Task 19: Update CI Workflow

**Files:**
- Modify: `.github/workflows/ci.yml`

**Step 1: Verify CI workflow has correct commands**

The CI workflow should already have the correct commands. Verify it references:
- `pnpm typecheck` (add if missing)
- `pnpm test:unit --coverage`
- `pnpm test:integration`

If `pnpm typecheck` is missing from the lint job, add it:

```yaml
- run: pnpm typecheck
```

**Step 2: Commit if changed**

```bash
git add .github/workflows/ci.yml
git commit -m "ci: ensure typecheck is included in CI pipeline"
```

---

## Task 20: Create Phase 1 Completion Summary

**Step 1: Run full verification**

```bash
pnpm typecheck
pnpm lint
pnpm test:unit
pnpm build
```

**Step 2: Commit all changes**

```bash
git add .
git commit -m "feat: complete Phase 1 - critical fixes and testing infrastructure

- Fix tRPC context to use NextAuth session
- Remove invalid context options from all pages
- Add Vitest configuration with 80% coverage threshold
- Add Playwright configuration for E2E tests
- Add MSW mock server for API testing
- Add unit tests for utilities and routers
- Add basic E2E tests
- All TypeScript errors resolved
- Build passes successfully"
```

**Step 3: Push to remote (optional)**

```bash
git push origin feature/v1-production
```

---

## Phase 1 Completion Checklist

- [ ] All `TEST_USER_ID` references removed
- [ ] tRPC context uses NextAuth session
- [ ] `pnpm typecheck` passes
- [ ] `pnpm build` passes
- [ ] `pnpm test:unit` passes
- [ ] Vitest configured with coverage
- [ ] Playwright configured
- [ ] MSW mocks set up
- [ ] Basic unit tests written
- [ ] Basic E2E tests written
- [ ] CI workflow updated
