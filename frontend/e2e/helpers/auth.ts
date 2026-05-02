import { Page, APIRequestContext } from '@playwright/test';

interface LoginResponse {
  access_token: string;
  refresh_token: string;
}

/**
 * Login via API, inject tokens, then wait for AuthContext to fully resolve
 * before returning. This prevents tests from racing against the /auth/me call.
 */
export async function loginViaApi(
  page: Page,
  request: APIRequestContext,
  email: string,
  password: string
) {
  const formData = new URLSearchParams();
  formData.append('username', email);
  formData.append('password', password);

  const resp = await request.post('http://localhost:8000/api/v1/auth/login', {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    data: formData.toString(),
  });

  const tokens = (await resp.json()) as LoginResponse;

  // Navigate to root first so the origin is set for localStorage
  await page.goto('/');
  await page.waitForLoadState('domcontentloaded');

  // Inject tokens
  await page.evaluate(
    ({ accessToken, refreshToken }) => {
      localStorage.setItem('access_token', accessToken);
      localStorage.setItem('refresh_token', refreshToken);
    },
    { accessToken: tokens.access_token, refreshToken: tokens.refresh_token }
  );

  // Navigate to /home which triggers the RoleRedirect component.
  // It waits for AuthContext.isLoading=false, then redirects to the role dashboard.
  // Waiting for this redirect guarantees auth is fully resolved before the test proceeds.
  await page.goto('/home');
  await page.waitForURL(/\/(super-admin|franchise|dashboard)/, { timeout: 20000 });
}
