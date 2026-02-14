import { test, expect } from '@playwright/test';

/**
 * Visual Regression Tests — Authentication Pages
 *
 * Captures baseline screenshots for sign-in and error pages.
 *
 * Run: pnpm test:e2e:visual
 * Update baselines: pnpm test:e2e:visual:update
 */

const LOCALE = 'en';
const SIGNIN_URL = `/${LOCALE}/auth/signin`;
const AUTH_ERROR_URL = `/${LOCALE}/auth/error`;

test.describe('Visual — Sign In Page', () => {
  test('full page screenshot', async ({ page }) => {
    await page.goto(SIGNIN_URL);
    await page.waitForLoadState('networkidle');

    await expect(page).toHaveScreenshot('signin-full.png', {
      fullPage: true,
    });
  });

  test('sign-in card', async ({ page }) => {
    await page.goto(SIGNIN_URL);
    await page.waitForLoadState('networkidle');

    const card = page.locator('.max-w-md');
    await expect(card).toHaveScreenshot('signin-card.png');
  });
});

test.describe('Visual — Sign In Page (Mobile)', () => {
  test.use({ viewport: { width: 375, height: 812 } });

  test('mobile sign-in screenshot', async ({ page }) => {
    await page.goto(SIGNIN_URL);
    await page.waitForLoadState('networkidle');

    await expect(page).toHaveScreenshot('signin-mobile.png', {
      fullPage: true,
    });
  });
});

test.describe('Visual — Auth Error Page', () => {
  test('default error screenshot', async ({ page }) => {
    await page.goto(AUTH_ERROR_URL);
    await page.waitForLoadState('networkidle');

    await expect(page).toHaveScreenshot('auth-error-default.png', {
      fullPage: true,
    });
  });

  test('access denied error screenshot', async ({ page }) => {
    await page.goto(`${AUTH_ERROR_URL}?error=AccessDenied`);
    await page.waitForLoadState('networkidle');

    await expect(page).toHaveScreenshot('auth-error-access-denied.png', {
      fullPage: true,
    });
  });

  test('error card component', async ({ page }) => {
    await page.goto(AUTH_ERROR_URL);
    await page.waitForLoadState('networkidle');

    const card = page.locator('.max-w-md');
    await expect(card).toHaveScreenshot('auth-error-card.png');
  });
});

