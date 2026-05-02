import { test, expect } from '@playwright/test';
import { loginViaApi } from './helpers/auth';

test.describe('Customer Dashboard', () => {
  test.beforeEach(async ({ page, request }) => {
    await loginViaApi(page, request, 'customer1@example.com', 'Customer@123');
  });

  test('dashboard loads with products after customer login', async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveURL(/\/dashboard/);
    await expect(page.locator('[data-testid="dashboard"]')).toBeVisible({ timeout: 15000 });
  });

  test('can navigate to /dashboard/vcards', async ({ page }) => {
    await page.goto('/dashboard/vcards');
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveURL(/\/dashboard\/vcards/);
    await expect(page.locator('[data-testid="create-vcard-btn"]')).toBeVisible({ timeout: 15000 });
  });
});
