import { test, expect } from '../setup/auth-fixture';

/**
 * E2E Tests for the Dashboard Page
 * Uses auth fixture to bypass authentication
 */

const LOCALE = 'en';
const DASHBOARD_URL = `/${LOCALE}/dashboard`;

test.describe('Dashboard Page — Content', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(DASHBOARD_URL);
    await page.waitForLoadState('networkidle');
  });

  test('should render the dashboard title and subtitle', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();
    await expect(page.getByText('Overview of your knowledge platform')).toBeVisible();
  });

  test('should render the stats cards', async ({ page }) => {
    // Total Queries
    await expect(page.getByText('Total Queries')).toBeVisible();
    await expect(page.getByText('1,247')).toBeVisible();

    // Total Documents
    await expect(page.getByText('Total Documents')).toBeVisible();
    await expect(page.getByText('156')).toBeVisible();

    // Active Users
    await expect(page.getByText('Active Users')).toBeVisible();
    await expect(page.getByText('24')).toBeVisible();

    // Accuracy Rate
    await expect(page.getByText('Accuracy Rate')).toBeVisible();
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

