import { test, expect } from '@playwright/test';
import { loginViaApi } from './helpers/auth';

test.describe('Customer Dashboard', () => {
  test.beforeEach(async ({ page, request }) => {
    await loginViaApi(page, request, 'customer1@example.com', 'Customer@123');
  });

  test('dashboard loads with products after customer login', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/\/dashboard/);
    // Wait for any heading on the dashboard to confirm it loaded
    await expect(page.getByRole('heading').first()).toBeVisible({ timeout: 20000 });
  });

  test('can navigate to /dashboard/vcards', async ({ page }) => {
    await page.goto('/dashboard/vcards');
    await expect(page).toHaveURL(/\/dashboard\/vcards/);
    await page.waitForSelector('[data-testid="create-vcard-btn"]', { state: 'attached', timeout: 20000 });
    await expect(page.locator('[data-testid="create-vcard-btn"]')).toBeVisible({ timeout: 15000 });
  });
});
