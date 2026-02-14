import { test, expect } from '@playwright/test';

/**
 * E2E Tests for Authentication Pages
 * Tests the sign-in and error pages
 */

const LOCALE = 'en';
const SIGNIN_URL = `/${LOCALE}/auth/signin`;
const AUTH_ERROR_URL = `/${LOCALE}/auth/error`;

test.describe('Sign In Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(SIGNIN_URL);
    await page.waitForLoadState('networkidle');
  });

  test('should render the sign-in card with logo and description', async ({ page }) => {
    await expect(page.getByText('Welcome to Context.ai')).toBeVisible();
    await expect(
      page.getByText('Sign in to your account to access your knowledge management dashboard'),
    ).toBeVisible();
  });

  test('should render the Auth0 sign-in button', async ({ page }) => {
    const signInButton = page.getByRole('button', { name: /Sign In with Auth0/i });
    await expect(signInButton).toBeVisible();
    await expect(signInButton).toBeEnabled();
  });

  test('should have centered layout', async ({ page }) => {
    const card = page.locator('.max-w-md');
    await expect(card).toBeVisible();
  });
});

test.describe('Auth Error Page', () => {
  test('should display default error message when no error type', async ({ page }) => {
    await page.goto(AUTH_ERROR_URL);
    await page.waitForLoadState('networkidle');

    await expect(page.getByText('Authentication Error')).toBeVisible();
    await expect(page.getByText('An error occurred during authentication.')).toBeVisible();
  });

  test('should display AccessDenied error message', async ({ page }) => {
    await page.goto(`${AUTH_ERROR_URL}?error=AccessDenied`);
    await page.waitForLoadState('networkidle');

    await expect(page.getByText('Authentication Error')).toBeVisible();
    await expect(page.getByText('You do not have permission to sign in.')).toBeVisible();
  });

  test('should display Configuration error message', async ({ page }) => {
    await page.goto(`${AUTH_ERROR_URL}?error=Configuration`);
    await page.waitForLoadState('networkidle');

    await expect(
      page.getByText('There is a problem with the server configuration.'),
    ).toBeVisible();
  });

  test('should display Verification error message', async ({ page }) => {
    await page.goto(`${AUTH_ERROR_URL}?error=Verification`);
    await page.waitForLoadState('networkidle');

    await expect(
      page.getByText('The verification token has expired or has already been used.'),
    ).toBeVisible();
  });

  test('should have Try Again link pointing to signin', async ({ page }) => {
    await page.goto(AUTH_ERROR_URL);
    await page.waitForLoadState('networkidle');

    const tryAgainLink = page.getByRole('link', { name: 'Try Again' });
    await expect(tryAgainLink).toBeVisible();
    await tryAgainLink.click();
    await page.waitForLoadState('networkidle');

    await expect(page).toHaveURL(new RegExp(SIGNIN_URL));
  });

  test('should have Go Home link pointing to landing page', async ({ page }) => {
    await page.goto(AUTH_ERROR_URL);
    await page.waitForLoadState('networkidle');

    const goHomeLink = page.getByRole('link', { name: 'Go Home' });
    await expect(goHomeLink).toBeVisible();
    await goHomeLink.click();
    await page.waitForLoadState('networkidle');

    await expect(page).toHaveURL(new RegExp(`/${LOCALE}`));
  });
});

