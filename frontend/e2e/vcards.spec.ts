import { test, expect } from '@playwright/test';
import { loginViaApi } from './helpers/auth';

test.describe('VCard creation flow (as customer)', () => {
  test.beforeEach(async ({ page, request }) => {
    await loginViaApi(page, request, 'customer1@example.com', 'Customer@123');
  });

  test('can create a VCard and see it in the list', async ({ page }) => {
    await page.goto('/dashboard/vcards');
    await expect(page).toHaveURL(/\/dashboard\/vcards/);

    await page.waitForSelector('[data-testid="create-vcard-btn"]', { state: 'attached', timeout: 20000 });
    await page.locator('[data-testid="create-vcard-btn"]').click({ force: true });
    await expect(page).toHaveURL(/vcards\/new|vcards\/\d+\/edit/, { timeout: 15000 });

    await page.getByRole('button', { name: /identity/i }).click({ force: true });

    const nameInput = page.locator('[data-testid="vcard-name-input"]');
    await nameInput.waitFor({ state: 'visible', timeout: 15000 });
    await nameInput.fill('Test E2E Card');

    const titleInput = page.locator('input[placeholder="CEO & Founder"]');
    await titleInput.fill('Test Engineer');

    await page.locator('[data-testid="save-vcard-btn"]').click({ force: true });
    await page.waitForURL(/vcards\/\d+\/edit/, { timeout: 15000 });

    await page.goto('/dashboard/vcards');
    await page.waitForSelector('[data-testid="vcard-item"]', { state: 'attached', timeout: 15000 });
    await expect(
      page.locator('[data-testid="vcard-item"]').filter({ hasText: 'Test E2E Card' }).first()
    ).toBeVisible();
  });
});
