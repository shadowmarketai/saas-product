import { test, expect } from '@playwright/test';
import { loginViaApi } from './helpers/auth';

test.describe('Franchise Dashboard', () => {
  test.beforeEach(async ({ page, request }) => {
    await loginViaApi(page, request, 'franchise@nexastack.com', 'Franchise@123');
  });

  test('dashboard loads after franchise_owner login', async ({ page }) => {
    await page.goto('/franchise');
    await expect(page).toHaveURL(/\/franchise/);
    await expect(page.getByRole('heading').first()).toBeVisible({ timeout: 20000 });
  });

  test('can navigate to /franchise/vcards and see VCard list page', async ({ page }) => {
    await page.goto('/franchise/vcards');
    await expect(page).toHaveURL(/\/franchise\/vcards/);
    await page.waitForSelector('[data-testid="create-vcard-btn"]', { state: 'attached', timeout: 20000 });
    await expect(page.locator('[data-testid="create-vcard-btn"]')).toBeVisible({ timeout: 15000 });
  });

  test('can navigate to /franchise/websites and see MiniSite list', async ({ page }) => {
    await page.goto('/franchise/websites');
    await expect(page).toHaveURL(/\/franchise\/websites/);
    await expect(page.getByRole('heading').first()).toBeVisible({ timeout: 20000 });
  });
});
