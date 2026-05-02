import { Page, APIRequestContext } from '@playwright/test';

interface LoginResponse {
  access_token: string;
  refresh_token: string;
}

/**
 * Login via API and inject tokens into localStorage.
 * Call this in beforeEach for fast auth without UI login flow.
 */
export async function loginViaApi(
  page: Page,
  request: APIRequestContext,
  email: string,
  password: string
) {
  // Hit backend directly with OAuth2 form data
  const formData = new URLSearchParams();
  formData.append('username', email);
  formData.append('password', password);

  const resp = await request.post('http://localhost:8000/api/v1/auth/login', {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    data: formData.toString(),
  });

  const tokens = (await resp.json()) as LoginResponse;

  // Navigate to app root first so origin is set, then inject tokens
  await page.goto('/');
  await page.evaluate(
    ({ accessToken, refreshToken }) => {
      localStorage.setItem('access_token', accessToken);
      localStorage.setItem('refresh_token', refreshToken);
    },
    { accessToken: tokens.access_token, refreshToken: tokens.refresh_token }
  );
}
