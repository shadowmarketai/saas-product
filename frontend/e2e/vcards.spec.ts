import { test, expect } from '@playwright/test';
import { loginViaApi } from './helpers/auth';

test.describe('VCard creation flow (as customer)', () => {
  test.beforeEach(async ({ page, request }) => {
    await loginViaApi(page, request, 'customer1@example.com', 'Customer@123');
  });

  test('can create a VCard and see it in the list', async ({ page }) => {
    await page.goto('/dashboard/vcards');
    await page.waitForLoadState('networkidle');

    await page.locator('[data-testid="create-vcard-btn"]').click();
    await page.waitForLoadState('networkidle');

    await expect(page).toHaveURL(/vcards\/new|vcards\/\d+\/edit/);

    // Switch to Identity section
    await page.getByRole('button', { name: /identity/i }).click();
    await page.waitForLoadState('domcontentloaded');

    const nameInput = page.locator('[data-testid="vcard-name-input"]');
    await nameInput.waitFor({ state: 'visible' });
    await nameInput.fill('Test E2E Card');

    const titleInput = page.locator('input[placeholder="CEO & Founder"]');
    await titleInput.fill('Test Engineer');

    const saveBtn = page.locator('[data-testid="save-vcard-btn"]');
    await saveBtn.waitFor({ state: 'visible' });
    await saveBtn.click();

    await page.waitForURL(/vcards\/\d+\/edit/, { timeout: 10000 });
    await expect(page).toHaveURL(/vcards\/\d+\/edit/);

    await page.goto('/dashboard/vcards');
    await page.waitForLoadState('networkidle');

    // At least one vcard-item visible; use first() to avoid strict mode violation
    await expect(page.locator('[data-testid="vcard-item"]').first()).toBeVisible({ timeout: 10000 });
    await expect(
      page.locator('[data-testid="vcard-item"]').filter({ hasText: 'Test E2E Card' }).first()
    ).toBeVisible();
  });
});
