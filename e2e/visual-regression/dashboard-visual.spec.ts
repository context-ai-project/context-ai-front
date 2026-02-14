import { test, expect } from '../setup/auth-fixture';

/**
 * Visual Regression Tests — Dashboard Page
 *
 * Captures baseline screenshots for the authenticated dashboard.
 * Uses auth fixture to bypass authentication.
 *
 * Run: pnpm test:e2e:visual
 * Update baselines: pnpm test:e2e:visual:update
 */

const LOCALE = 'en';
const DASHBOARD_URL = `/${LOCALE}/dashboard`;

test.describe('Visual — Dashboard (Desktop)', () => {
  test('full page screenshot', async ({ page }) => {
    await page.goto(DASHBOARD_URL);
    await page.waitForLoadState('networkidle');

    await expect(page).toHaveScreenshot('dashboard-full.png', {
      fullPage: true,
    });
  });

  test('stats cards grid', async ({ page }) => {
    await page.goto(DASHBOARD_URL);
    await page.waitForLoadState('networkidle');

    const statsGrid = page.locator('.grid').first();
    await expect(statsGrid).toHaveScreenshot('dashboard-stats-grid.png');
  });

  test('sidebar navigation', async ({ page }) => {
    await page.goto(DASHBOARD_URL);
    await page.waitForLoadState('networkidle');

    const sidebar = page.locator('[data-sidebar]').first();
    await expect(sidebar).toHaveScreenshot('dashboard-sidebar.png');
  });
});

test.describe('Visual — Dashboard (Mobile)', () => {
  test.use({ viewport: { width: 375, height: 812 } });

  test('mobile dashboard screenshot', async ({ page }) => {
    await page.goto(DASHBOARD_URL);
    await page.waitForLoadState('networkidle');

    await expect(page).toHaveScreenshot('dashboard-mobile.png', {
      fullPage: true,
    });
  });
});

test.describe('Visual — Dashboard (Tablet)', () => {
  test.use({ viewport: { width: 768, height: 1024 } });

  test('tablet dashboard screenshot', async ({ page }) => {
    await page.goto(DASHBOARD_URL);
    await page.waitForLoadState('networkidle');

    await expect(page).toHaveScreenshot('dashboard-tablet.png', {
      fullPage: true,
    });
  });
});

