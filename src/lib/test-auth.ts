/**
 * Test authentication bypass
 * ONLY for E2E testing in development environment
 *
 * This provides a mock session when E2E_BYPASS_AUTH is set to 'true'
 * This is a common pattern for E2E testing authenticated applications
 */

import type { Session } from 'next-auth';

/**
 * Check if we're in E2E test mode
 */
export function isE2ETestMode(): boolean {
  return process.env.E2E_BYPASS_AUTH === 'true';
}

/**
 * Get mock session for E2E tests
 */
export function getMockE2ESession(): Session {
  return {
    user: {
      id: 'e2e-test-user-id',
      name: 'E2E Test User',
      email: 'e2e-test@example.com',
      image: 'https://example.com/avatar.jpg',
    },
    accessToken: 'e2e-test-access-token',
    expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
  };
}

/**
 * Warning: Only enable E2E bypass in development/test environments
 */
if (isE2ETestMode() && process.env.NODE_ENV === 'production') {
  throw new Error('SECURITY ERROR: E2E_BYPASS_AUTH should never be enabled in production');
}
