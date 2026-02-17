import { expect, test } from '@playwright/test';

test.describe('Smoke', () => {
  test('loads public landing and auth pages', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/Dronacharya/);
    await expect(page.getByRole('button', { name: /Start Learning Free/i })).toBeVisible();

    await page.goto('/auth/login');
    await expect(page.locator('form')).toBeVisible();

    await page.goto('/auth/register');
    await expect(page.locator('form')).toBeVisible();
  });

  test('redirects unauthenticated dashboard access to login', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/\/auth\/login/);
  });
});
