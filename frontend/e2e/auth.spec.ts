import { test, expect } from '@playwright/test';
import { LoginPage } from './pages/LoginPage';
import { loginViaApi } from './helpers/auth';

test.describe('Authentication flows', () => {
  test('super_admin login redirects to /super-admin', async ({ page, request }) => {
    await loginViaApi(page, request, 'admin@nexastack.com', 'Admin@123');
    await page.goto('/home');
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveURL(/\/super-admin/);
  });

  test('franchise_owner login redirects to /franchise', async ({ page, request }) => {
    await loginViaApi(page, request, 'franchise@nexastack.com', 'Franchise@123');
    await page.goto('/home');
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveURL(/\/franchise/);
  });

  test('customer login redirects to /dashboard', async ({ page, request }) => {
    await loginViaApi(page, request, 'customer1@example.com', 'Customer@123');
    await page.goto('/home');
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveURL(/\/dashboard/);
  });

  test('wrong password shows error message', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login('admin@nexastack.com', 'WrongPassword');
    await expect(page.locator('[data-testid="login-error"]')).toBeVisible();
    await expect(page.locator('[data-testid="login-error"]')).toContainText(/invalid/i);
  });

  test('logout works — clears session and returns to login', async ({ page, request }) => {
    await loginViaApi(page, request, 'customer1@example.com', 'Customer@123');
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');

    // Click the logout button in the sidebar
    await page.locator('[data-testid="logout-btn"]').click();
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveURL(/\/login/);
  });
});
