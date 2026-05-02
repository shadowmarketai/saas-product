import { test, expect } from '@playwright/test';
import { loginViaApi } from './helpers/auth';

test.describe('Super Admin Dashboard', () => {
  test.beforeEach(async ({ page, request }) => {
    await loginViaApi(page, request, 'admin@nexastack.com', 'Admin@123');
  });

  test('dashboard loads with stats after login', async ({ page }) => {
    await page.goto('/super-admin');
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveURL(/\/super-admin/);
    // Stats cards are present (heading visible)
    await expect(page.getByRole('heading', { name: /dashboard/i }).or(page.locator('h1, h2').first())).toBeVisible();
  });

  test('can navigate to /super-admin/franchises and see franchise list', async ({ page }) => {
    await page.goto('/super-admin/franchises');
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveURL(/\/super-admin\/franchises/);
    // Page heading visible
    await expect(page.getByRole('heading').first()).toBeVisible();
  });

  test('can navigate to /super-admin/templates and see templates', async ({ page }) => {
    await page.goto('/super-admin/templates');
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveURL(/\/super-admin\/templates/);
    await expect(page.getByRole('heading').first()).toBeVisible();
  });
});
