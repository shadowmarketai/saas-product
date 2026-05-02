import { test, expect } from '@playwright/test';
import { loginViaApi } from './helpers/auth';

test.describe('Billing & Subscription flow', () => {
  test.beforeEach(async ({ page, request }) => {
    await loginViaApi(page, request, 'customer1@example.com', 'Customer@123');
  });

  test('billing page loads with plans', async ({ page }) => {
    await page.goto('/dashboard/billing');
    await expect(page).toHaveURL(/\/dashboard\/billing/);
    await expect(page.locator('h1').first()).toBeVisible({ timeout: 20000 });
  });

  test('can subscribe to or view a plan', async ({ page }) => {
    await page.goto('/dashboard/billing');
    await expect(page).toHaveURL(/\/dashboard\/billing/);
    // Plans are rendered — either "Choose Plan" (new) or "Active" (already subscribed)
    const planBtn = page.getByRole('button', { name: /choose plan|active/i }).first();
    await planBtn.waitFor({ state: 'attached', timeout: 20000 });
    await expect(planBtn).toBeVisible({ timeout: 15000 });
  });
});
