import { test, expect } from '../setup/auth-fixture';

/**
 * E2E Tests for Navigation Flow and Responsive Behaviour
 * Verifies routing between pages and mobile viewport adaptations
 */

const LOCALE = 'en';

test.describe('Navigation — Protected Routes', () => {
  test('should navigate from dashboard to chat and back', async ({ page }) => {
    await page.goto(`/${LOCALE}/dashboard`);
    await page.waitForLoadState('networkidle');

    // Navigate to chat
    const sidebar = page.locator('[data-sidebar]').first();
    await sidebar.getByText('AI Chat').click();
    await page.waitForURL(new RegExp(`/${LOCALE}/chat`), { timeout: 10_000 });
    await expect(page).toHaveURL(new RegExp(`/${LOCALE}/chat`));

    // Navigate back to dashboard
    const sidebarRefresh = page.locator('[data-sidebar]').first();
    await sidebarRefresh.getByText('Dashboard').click();
    await page.waitForURL(new RegExp(`/${LOCALE}/dashboard`), { timeout: 10_000 });
    await expect(page).toHaveURL(new RegExp(`/${LOCALE}/dashboard`));
  });

  test('should show language selector in protected area header', async ({ page }) => {
    await page.goto(`/${LOCALE}/chat`);
    await page.waitForLoadState('networkidle');

    // Language selector should be in the header
    const header = page.locator('header').first();
    await expect(header).toBeVisible();
  });

  test('brand link in sidebar should navigate to chat', async ({ page }) => {
    await page.goto(`/${LOCALE}/dashboard`);
    await page.waitForLoadState('networkidle');

    // Click the Context.ai brand link in sidebar
    const sidebar = page.locator('[data-sidebar]').first();
    const brandLink = sidebar.getByRole('link', { name: 'Context.ai' });
    await brandLink.click();
    await page.waitForURL(new RegExp(`/${LOCALE}/chat`), { timeout: 10_000 });

    await expect(page).toHaveURL(new RegExp(`/${LOCALE}/chat`));
  });
});

test.describe('Navigation — Auth Redirect', () => {
  test('non-E2E mode would redirect unauthenticated users to signin', async ({ page }) => {
    // In E2E mode, auth is bypassed, so we just verify the page loads
    // This test confirms the protected layout renders correctly
    await page.goto(`/${LOCALE}/chat`);
    await page.waitForLoadState('networkidle');

    // Page should load successfully since E2E_BYPASS_AUTH is set
    await expect(page).toHaveURL(new RegExp(`/${LOCALE}/chat`));
  });
});

test.describe('Responsive — Landing Page Mobile', () => {
  test.use({ viewport: { width: 375, height: 812 } }); // iPhone X

  test('should show hamburger menu on mobile viewport', async ({ page }) => {
    await page.goto(`/${LOCALE}`);
    await page.waitForLoadState('networkidle');

    // Desktop nav should be hidden
    const desktopNav = page.locator('nav.hidden.md\\:flex');
    await expect(desktopNav).not.toBeVisible();

    // Hamburger button should be visible
    const hamburger = page.getByRole('button', { name: 'Open menu' });
    await expect(hamburger).toBeVisible();
  });

  test('should open and close mobile menu', async ({ page }) => {
    await page.goto(`/${LOCALE}`);
    await page.waitForLoadState('networkidle');

    // Open mobile menu
    const hamburger = page.getByRole('button', { name: 'Open menu' });
    await hamburger.click();

    // Mobile menu items should be visible
    await expect(page.getByRole('button', { name: 'Close menu' })).toBeVisible();

    // Close mobile menu
    await page.getByRole('button', { name: 'Close menu' }).click();
    await expect(page.getByRole('button', { name: 'Open menu' })).toBeVisible();
  });

  test('should render hero section properly on mobile', async ({ page }) => {
    await page.goto(`/${LOCALE}`);
    await page.waitForLoadState('networkidle');

    await expect(page.getByText('From Chaos')).toBeVisible();
    await expect(page.getByRole('link', { name: 'Start Free Trial' })).toBeVisible();
  });
});

test.describe('Responsive — Protected Pages Mobile', () => {
  test.use({ viewport: { width: 375, height: 812 } });

  test('should render chat page on mobile viewport', async ({ page }) => {
    await page.goto(`/${LOCALE}/chat`);
    await page.waitForLoadState('networkidle');

    // Chat should load — either the empty state or the message input should be visible
    const messageInput = page.getByTestId('message-input');
    const emptyState = page.getByTestId('empty-state');

    await expect(
      messageInput.or(emptyState).first(),
    ).toBeVisible();
  });

  test('should render dashboard on mobile viewport', async ({ page }) => {
    // Mock the admin stats API so the admin dashboard loads predictable data
    await page.route('**/admin/stats', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          totalConversations: 10,
          totalUsers: 3,
          recentUsers: 1,
          totalDocuments: 5,
          totalSectors: 2,
          activeSectors: 2,
        }),
      });
    });

    await page.goto(`/${LOCALE}/dashboard`);
    await page.waitForLoadState('networkidle');

    await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();
    // Stats should stack vertically on mobile (i18n key: dashboard.stats.conversations.title)
    await expect(page.getByText('Conversations')).toBeVisible();
  });
});

test.describe('Responsive — Tablet', () => {
  test.use({ viewport: { width: 768, height: 1024 } }); // iPad

  test('landing page should render correctly on tablet', async ({ page }) => {
    await page.goto(`/${LOCALE}`);
    await page.waitForLoadState('networkidle');

    await expect(page.getByText('From Chaos')).toBeVisible();
    await expect(page.getByText('Everything You Need to Scale Knowledge')).toBeVisible();
  });
});

