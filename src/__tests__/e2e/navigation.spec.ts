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
