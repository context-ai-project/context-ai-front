import { test as base, expect } from '@playwright/test';
import { testUser } from '../fixtures/chat-data';

/**
 * Extended test fixture for E2E testing with authentication bypass
 *
 * Mocks the NextAuth session endpoint so that client-side `useSession()` calls
 * return a valid session. The server-side bypass is handled by E2E_BYPASS_AUTH env var.
 *
 * This is necessary because:
 * - Server-side: layout.tsx checks `isE2ETestMode()` and skips `auth()` redirect
 * - Client-side: `SessionProvider` fetches `/api/auth/session` — without this mock,
 *   `useSession()` returns null and all chat interactions fail
 */

/**
 * Mock session data matching the structure expected by NextAuth v5 SessionProvider.
 * Includes `roles: ['admin']` so that admin-only features (dashboard stats,
 * admin section, etc.) are visible during E2E testing.
 */
const mockSession = {
  user: {
    id: 'e2e-test-user-id',
    name: testUser.name,
    email: testUser.email,
    image: testUser.picture,
    roles: ['admin'],
  },
  accessToken: 'e2e-test-access-token',
  expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
};

/**
 * Custom test fixture that intercepts the NextAuth session endpoint
 * before each test, providing a valid mock session to all client components
 */
export const test = base.extend({
  page: async ({ page }, use) => {
    // Intercept NextAuth session endpoint to return mock session
    await page.route('**/api/auth/session', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockSession),
      });
    });

    // Also intercept the CSRF token endpoint to prevent auth errors
    await page.route('**/api/auth/csrf', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ csrfToken: 'e2e-test-csrf-token' }),
      });
    });

    // Intercept the token endpoint used by the API client
    await page.route('**/api/auth/token', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ accessToken: 'e2e-test-access-token' }),
      });
    });

    await use(page);
  },
});

export { expect };
