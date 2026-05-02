import { test, expect } from '@playwright/test';
import { loginViaApi } from './helpers/auth';

test.describe('WhatsApp Chatbot page', () => {
  test('customer can navigate to chatbot page', async ({ page, request }) => {
    await loginViaApi(page, request, 'customer1@example.com', 'Customer@123');
    await page.goto('/dashboard/chatbot');
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveURL(/\/dashboard\/chatbot/);
    await expect(page.getByRole('heading').first()).toBeVisible({ timeout: 15000 });
  });
});
