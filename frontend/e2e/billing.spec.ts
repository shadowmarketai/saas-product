import { test, expect } from '@playwright/test';
import { loginViaApi } from './helpers/auth';

test.describe('Billing & Subscription flow', () => {
  test.beforeEach(async ({ page, request }) => {
    await loginViaApi(page, request, 'customer1@example.com', 'Customer@123');
  });

  test('billing page loads with plans', async ({ page }) => {
    await page.goto('/dashboard/billing');
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveURL(/\/dashboard\/billing/);
    // Plans should be visible
    await expect(page.getByRole('heading', { name: /billing|plans/i }).first()).toBeVisible({ timeout: 15000 });
  });

  test('can subscribe to a plan (mock payment)', async ({ page }) => {
    await page.goto('/dashboard/billing');
    await page.waitForLoadState('networkidle');
    // Click first "Choose Plan" button
    const btn = page.getByRole('button', { name: /choose plan/i }).first();
    await btn.waitFor({ state: 'visible', timeout: 15000 });
    await btn.click();
    // Should show success message after mock payment
    await expect(
      page.locator('[data-testid="billing-success"]').or(page.getByText(/subscribed|success/i).first())
    ).toBeVisible({ timeout: 15000 });
  });
});
