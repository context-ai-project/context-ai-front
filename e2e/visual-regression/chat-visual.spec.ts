import { test, expect } from '../setup/auth-fixture';
import { mockChatAPIResponse } from '../helpers/chat-helpers';
import { mockChatResponses, testMessages } from '../fixtures/chat-data';

/**
 * Visual Regression Tests — Chat Page
 *
 * Captures baseline screenshots for the chat interface in various states:
 * empty state, with messages, with sources, loading, and error.
 * Uses auth fixture to bypass authentication.
 *
 * Run: pnpm test:e2e:visual
 * Update baselines: pnpm test:e2e:visual:update
 */

const LOCALE = 'en';
const CHAT_URL = `/${LOCALE}/chat`;

test.describe('Visual — Chat Empty State (Desktop)', () => {
  test('empty state screenshot', async ({ page }) => {
    await page.goto(CHAT_URL);
    await page.waitForLoadState('networkidle');

    await expect(page).toHaveScreenshot('chat-empty-state.png', {
      fullPage: true,
    });
  });

  test('message input area', async ({ page }) => {
    await page.goto(CHAT_URL);
    await page.waitForLoadState('networkidle');

    const inputArea = page.getByTestId('message-input').locator('..');
    await expect(inputArea).toHaveScreenshot('chat-input-area.png');
  });
});

test.describe('Visual — Chat With Messages (Desktop)', () => {
  test('chat with user and assistant messages', async ({ page }) => {
    await page.goto(CHAT_URL);
    await page.waitForLoadState('networkidle');

    // Mock API and send a message
    await mockChatAPIResponse(page, mockChatResponses.vacationPolicy);

    const input = page.getByTestId('message-input');
    await input.fill(testMessages.simple);
    await page.getByTestId('send-button').click();

    // Wait for assistant response
    await page.waitForFunction(
      (selector) => document.querySelectorAll(selector).length > 0,
      '[data-testid="assistant-message"]',
      { timeout: 10000 },
    );

    // Let rendering settle
    await page.waitForTimeout(500);

    await expect(page).toHaveScreenshot('chat-with-messages.png', {
      fullPage: true,
    });
  });

  test('assistant message with sources', async ({ page }) => {
    await page.goto(CHAT_URL);
    await page.waitForLoadState('networkidle');

    await mockChatAPIResponse(page, mockChatResponses.vacationPolicy);

    const input = page.getByTestId('message-input');
    await input.fill(testMessages.simple);
    await page.getByTestId('send-button').click();

    // Wait for sources to appear
    await page.waitForFunction(
      (selector) => document.querySelectorAll(selector).length > 0,
      '[data-testid="source-card"]',
      { timeout: 10000 },
    );

    await page.waitForTimeout(500);

    const assistantMessage = page.getByTestId('assistant-message').first();
    await expect(assistantMessage).toHaveScreenshot('chat-assistant-with-sources.png');
  });
});

test.describe('Visual — Chat (Mobile)', () => {
  test.use({ viewport: { width: 375, height: 812 } });

  test('mobile empty state', async ({ page }) => {
    await page.goto(CHAT_URL);
    await page.waitForLoadState('networkidle');

    await expect(page).toHaveScreenshot('chat-mobile-empty.png', {
      fullPage: true,
    });
  });

  test('mobile with messages', async ({ page }) => {
    await page.goto(CHAT_URL);
    await page.waitForLoadState('networkidle');

    await mockChatAPIResponse(page, mockChatResponses.vacationPolicy);

    const input = page.getByTestId('message-input');
    await input.fill(testMessages.simple);
    await page.getByTestId('send-button').click();

    await page.waitForFunction(
      (selector) => document.querySelectorAll(selector).length > 0,
      '[data-testid="assistant-message"]',
      { timeout: 10000 },
    );

    await page.waitForTimeout(500);

    await expect(page).toHaveScreenshot('chat-mobile-with-messages.png', {
      fullPage: true,
    });
  });
});

test.describe('Visual — Chat Error State', () => {
  test('error state after API failure', async ({ page }) => {
    await page.goto(CHAT_URL);
    await page.waitForLoadState('networkidle');

    // Mock API error
    await page.route('**/interaction/query', async (route) => {
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Internal Server Error' }),
      });
    });

    const input = page.getByTestId('message-input');
    await input.fill(testMessages.simple);
    await page.getByTestId('send-button').click();

    // Wait for error state to appear
    await page.waitForSelector('[data-testid="error-state"]', { timeout: 10000 });
    await page.waitForTimeout(500);

    await expect(page).toHaveScreenshot('chat-error-state.png', {
      fullPage: true,
    });
  });
});

