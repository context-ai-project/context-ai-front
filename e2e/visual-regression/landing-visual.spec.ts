import { test, expect } from '@playwright/test';

/**
 * Visual Regression Tests — Landing Page
 *
 * Captures baseline screenshots for the public landing page
 * and its major sections across desktop and mobile viewports.
 *
 * Run: pnpm test:e2e:visual
 * Update baselines: pnpm test:e2e:visual:update
 */

const LOCALE = 'en';
const LANDING_URL = `/${LOCALE}`;

test.describe('Visual — Landing Page (Desktop)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(LANDING_URL);
    await page.waitForLoadState('networkidle');
  });

  test('full page screenshot', async ({ page }) => {
    await expect(page).toHaveScreenshot('landing-full-page.png', {
      fullPage: true,
    });
  });

  test('navbar', async ({ page }) => {
    const navbar = page.locator('header').first();
    await expect(navbar).toHaveScreenshot('landing-navbar.png');
  });

  test('hero section', async ({ page }) => {
    const hero = page.locator('section').first();
    await expect(hero).toHaveScreenshot('landing-hero.png');
  });

  test('footer', async ({ page }) => {
    const footer = page.locator('footer');
    await expect(footer).toHaveScreenshot('landing-footer.png');
  });
});

test.describe('Visual — Landing Page (Mobile)', () => {
  test.use({ viewport: { width: 375, height: 812 } });

  test.beforeEach(async ({ page }) => {
    await page.goto(LANDING_URL);
    await page.waitForLoadState('networkidle');
  });

  test('full page mobile screenshot', async ({ page }) => {
    await expect(page).toHaveScreenshot('landing-mobile-full.png', {
      fullPage: true,
    });
  });

  test('mobile hamburger menu open', async ({ page }) => {
    const hamburger = page.getByRole('button', { name: 'Open menu' });
    await hamburger.click();

    // Wait for mobile menu to be visible (replaces fragile waitForTimeout)
    const closeButton = page.getByRole('button', { name: 'Close menu' });
    await expect(closeButton).toBeVisible();

    const header = page.locator('header').first();
    await expect(header).toHaveScreenshot('landing-mobile-menu-open.png');
  });
});

test.describe('Visual — Landing Page (Tablet)', () => {
  test.use({ viewport: { width: 768, height: 1024 } });

  test('full page tablet screenshot', async ({ page }) => {
    await page.goto(LANDING_URL);
    await page.waitForLoadState('networkidle');

    await expect(page).toHaveScreenshot('landing-tablet-full.png', {
      fullPage: true,
    });
  });
});

