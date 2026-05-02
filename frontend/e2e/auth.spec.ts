import { test, expect } from '@playwright/test';
import { LoginPage } from './pages/LoginPage';
import { loginViaApi } from './helpers/auth';

test.describe('Authentication flows', () => {
  test('super_admin login redirects to /super-admin', async ({ page, request }) => {
    await loginViaApi(page, request, 'admin@nexastack.com', 'Admin@123');
    await page.goto('/home');
    await expect(page).toHaveURL(/\/super-admin/, { timeout: 20000 });
  });

  test('franchise_owner login redirects to /franchise', async ({ page, request }) => {
    await loginViaApi(page, request, 'franchise@nexastack.com', 'Franchise@123');
    await page.goto('/home');
    await expect(page).toHaveURL(/\/franchise/, { timeout: 20000 });
  });

  test('customer login redirects to /dashboard', async ({ page, request }) => {
    await loginViaApi(page, request, 'customer1@example.com', 'Customer@123');
    await page.goto('/home');
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 20000 });
  });

  test('wrong password shows error message', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login('admin@nexastack.com', 'WrongPassword');
    await expect(page.locator('[data-testid="login-error"]')).toBeVisible({ timeout: 10000 });
  });

  test('logout works — clears session and returns to login', async ({ page, request }) => {
    await loginViaApi(page, request, 'customer1@example.com', 'Customer@123');
    await page.goto('/dashboard');
    // Wait for the sidebar to finish its spring animation before clicking
    await page.waitForSelector('[data-testid="logout-btn"]', { state: 'attached', timeout: 20000 });
    // Scroll into view then click — sidebar has many items so button may be off-screen
    await page.locator('[data-testid="logout-btn"]').scrollIntoViewIfNeeded();
    await page.locator('[data-testid="logout-btn"]').click();
    await expect(page).toHaveURL(/\/login/, { timeout: 15000 });
  });
});
