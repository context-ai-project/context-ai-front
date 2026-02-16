import { test, expect } from '../setup/auth-fixture';

/**
 * E2E Tests for the Dashboard Page
 * Uses auth fixture to bypass authentication.
 *
 * The mock session includes `roles: ['admin']` so the admin stats view is shown.
 * The admin stats API (`/admin/stats`) is mocked to return predictable data.
 */

const LOCALE = 'en';
const DASHBOARD_URL = `/${LOCALE}/dashboard`;

/** Mock data returned by the admin stats API */
const MOCK_ADMIN_STATS = {
  totalConversations: 1247,
  totalUsers: 24,
  recentUsers: 5,
  totalDocuments: 156,
  totalSectors: 4,
  activeSectors: 3,
};

test.describe('Dashboard Page — Content', () => {
  test.beforeEach(async ({ page }) => {
    // Mock the admin stats API so the component renders predictable values
    await page.route('**/admin/stats', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(MOCK_ADMIN_STATS),
      });
    });

    await page.goto(DASHBOARD_URL);
    await page.waitForLoadState('networkidle');
  });

  test('should render the dashboard title and subtitle', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();
    await expect(page.getByText('Overview of your knowledge platform')).toBeVisible();
  });

  test('should render the stats cards', async ({ page }) => {
    // Conversations (i18n key: dashboard.stats.conversations.title)
    await expect(page.getByText('Conversations')).toBeVisible();
    await expect(page.getByText('1,247')).toBeVisible();

    // Documents (i18n key: dashboard.stats.documents.title)
    await expect(page.getByText('Documents')).toBeVisible();
    await expect(page.getByText('156')).toBeVisible();

    // Users (i18n key: dashboard.stats.users.title)
    await expect(page.getByText('Users')).toBeVisible();
    await expect(page.getByText('24', { exact: true })).toBeVisible();

    // Sectors (i18n key: dashboard.stats.sectors.title)
    await expect(page.getByText('Sectors')).toBeVisible();
  });

  test('should render the "Coming Soon" placeholder', async ({ page }) => {
    await expect(page.getByText('More Insights Coming Soon')).toBeVisible();
    await expect(
      page.getByText("We're working on detailed analytics and reporting features"),
    ).toBeVisible();
  });
});

test.describe('Dashboard Page — Sidebar Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(DASHBOARD_URL);
    await page.waitForLoadState('networkidle');
  });

  test('sidebar should show Dashboard and AI Chat links', async ({ page }) => {
    const sidebar = page.locator('[data-sidebar]').first();
    await expect(sidebar.getByText('Dashboard')).toBeVisible();
    await expect(sidebar.getByText('AI Chat')).toBeVisible();
  });

  test('should navigate to chat page when AI Chat is clicked', async ({ page }) => {
    const sidebar = page.locator('[data-sidebar]').first();
    await sidebar.getByText('AI Chat').click();
    await page.waitForLoadState('networkidle');

    await expect(page).toHaveURL(new RegExp(`/${LOCALE}/chat`));
  });

  test('should show Context.ai brand in sidebar header', async ({ page }) => {
    const sidebar = page.locator('[data-sidebar]').first();
    await expect(sidebar.getByText('Context.ai')).toBeVisible();
  });
});

