import { test, expect } from '@playwright/test';

/**
 * E2E Tests for the Landing Page
 * Tests the public-facing page at /{locale}
 */

const LOCALE = 'en';
const LANDING_URL = `/${LOCALE}`;
const SIGNIN_URL = `/${LOCALE}/auth/signin`;

test.describe('Landing Page — Content & Layout', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(LANDING_URL);
    await page.waitForLoadState('networkidle');
  });

  test('should render the navbar with brand logo and navigation links', async ({ page }) => {
    // Brand logo
    await expect(page.locator('header').getByText('Context.ai')).toBeVisible();

    // Navigation links (desktop)
    await expect(page.locator('nav').getByText('Features').first()).toBeVisible();
    await expect(page.locator('nav').getByText('How It Works').first()).toBeVisible();
    await expect(page.locator('nav').getByText('Use Cases').first()).toBeVisible();
  });

  test('should render the hero section with headline and CTAs', async ({ page }) => {
    // Hero headline
    await expect(page.getByText('From Chaos')).toBeVisible();
    await expect(page.getByText('to Context')).toBeVisible();

    // CTA buttons
    await expect(page.getByRole('link', { name: 'Start Free Trial' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'View Demo' })).toBeVisible();
  });

  test('should render hero stats bar', async ({ page }) => {
    await expect(page.getByText('92%')).toBeVisible();
    await expect(page.getByText('Query Resolution Rate')).toBeVisible();
    await expect(page.getByText('1.2K+')).toBeVisible();
  });

  test('should render the features section', async ({ page }) => {
    await expect(page.getByText('Everything You Need to Scale Knowledge')).toBeVisible();
    await expect(page.getByText('Knowledge Sectors')).toBeVisible();
    await expect(page.getByText('Multimodal Ingestion')).toBeVisible();
    await expect(page.getByText('AI-Powered Q&A')).toBeVisible();
  });

  test('should render the How It Works section', async ({ page }) => {
    await expect(page.getByText('How It Works').nth(0)).toBeVisible();
    await expect(page.getByText('Upload Your Knowledge')).toBeVisible();
    await expect(page.getByText('AI Indexes & Learns')).toBeVisible();
    await expect(page.getByText('Your Team Asks, AI Answers')).toBeVisible();
  });

  test('should render the Use Cases section', async ({ page }) => {
    await expect(page.getByText('Built for Real Startup Challenges')).toBeVisible();
    await expect(page.getByText('Autonomous Onboarding')).toBeVisible();
    await expect(page.getByText('Knowledge Retention')).toBeVisible();
  });

  test('should render the CTA section', async ({ page }) => {
    await expect(page.getByText('Ready to Stop Losing Knowledge?')).toBeVisible();
    await expect(page.getByRole('link', { name: 'Get Started Free' })).toBeVisible();
  });

  test('should render the footer with links and copyright', async ({ page }) => {
    const footer = page.locator('footer');
    await expect(footer).toBeVisible();
    await expect(footer.getByText('Context.ai', { exact: true })).toBeVisible();
    await expect(footer.getByText('2026 Context.ai. Built with purpose.')).toBeVisible();
  });
});

test.describe('Landing Page — Navigation & Links', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(LANDING_URL);
    await page.waitForLoadState('networkidle');
  });

  test('Sign In button should navigate to signin page', async ({ page }) => {
    // Click the first visible "Sign In" link
    const signInLinks = page.getByRole('link', { name: 'Sign In' });
    await signInLinks.first().click();
    await page.waitForLoadState('networkidle');

    await expect(page).toHaveURL(new RegExp(SIGNIN_URL));
  });

  test('Get Started button should navigate to signin page', async ({ page }) => {
    const getStartedLinks = page.getByRole('link', { name: 'Get Started' });
    await getStartedLinks.first().click();
    await page.waitForLoadState('networkidle');

    await expect(page).toHaveURL(new RegExp(SIGNIN_URL));
  });

  test('Start Free Trial CTA should navigate to signin page', async ({ page }) => {
    const ctaLink = page.getByRole('link', { name: 'Start Free Trial' });
    await ctaLink.click();
    await page.waitForLoadState('networkidle');

    await expect(page).toHaveURL(new RegExp(SIGNIN_URL));
  });

  test('anchor links should scroll to sections', async ({ page }) => {
    // Click "Features" nav link
    const featuresLink = page.locator('nav a[href="#features"]').first();
    await featuresLink.click();

    // URL should have #features hash
    await expect(page).toHaveURL(new RegExp('#features'));
  });
});

test.describe('Landing Page — Root URL Redirect', () => {
  test('root URL (/) should redirect to default locale', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Should redirect to /es (default locale)
    await expect(page).toHaveURL(/\/es/);
  });
});

