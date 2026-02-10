import { test as base, expect } from '@playwright/test';

/**
 * Extended test fixture for E2E testing with authentication bypass
 * 
 * When E2E_BYPASS_AUTH=true is set, the application automatically provides
 * a mock session, so we don't need to mock authentication endpoints.
 * 
 * This fixture can be extended in the future for additional test setup.
 */

/**
 * Re-export base test with future extensibility
 * Currently no custom fixtures needed as authentication bypass handles everything
 */
export const test = base;

export { expect };

