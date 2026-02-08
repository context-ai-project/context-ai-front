import { type Page, expect } from '@playwright/test';
import { expectedUIElements } from '../fixtures/chat-data';

/**
 * Helper functions for E2E chat tests
 */

/**
 * Navigate to chat page and wait for it to load
 */
export async function navigateToChat(page: Page) {
  await page.goto('/chat');
  await page.waitForLoadState('networkidle');
}

/**
 * Send a message in the chat
 */
export async function sendMessage(page: Page, message: string) {
  const input = page.locator(expectedUIElements.messageInput);
  await input.fill(message);
  await page.locator(expectedUIElements.sendButton).click();
}

/**
 * Wait for assistant response to appear
 */
export async function waitForAssistantResponse(page: Page, timeout = 10000) {
  await page.locator(expectedUIElements.assistantMessage).first().waitFor({ timeout });
}

/**
 * Get all messages in the conversation
 */
export async function getAllMessages(page: Page) {
  const userMessages = await page.locator(expectedUIElements.userMessage).all();
  const assistantMessages = await page.locator(expectedUIElements.assistantMessage).all();

  return {
    userMessages,
    assistantMessages,
    total: userMessages.length + assistantMessages.length,
  };
}

/**
 * Check if typing indicator is visible
 */
export async function isTypingIndicatorVisible(page: Page): Promise<boolean> {
  return page.locator(expectedUIElements.typingIndicator).isVisible();
}

/**
 * Get source cards count
 */
export async function getSourceCardsCount(page: Page): Promise<number> {
  return page.locator(expectedUIElements.sourceCard).count();
}

/**
 * Verify markdown is rendered correctly
 */
export async function verifyMarkdownRendering(page: Page) {
  const markdownContent = page.locator(expectedUIElements.markdownContent).first();
  await expect(markdownContent).toBeVisible();

  // Check for common markdown elements
  const hasBold = await markdownContent.locator('strong').count();
  const hasLists = await markdownContent.locator('ul, ol').count();
  const hasLinks = await markdownContent.locator('a').count();

  return {
    hasBold: hasBold > 0,
    hasLists: hasLists > 0,
    hasLinks: hasLinks > 0,
  };
}

/**
 * Clear conversation
 */
export async function clearConversation(page: Page) {
  await page.locator(expectedUIElements.clearButton).click();
}

/**
 * Verify error state is displayed
 */
export async function verifyErrorState(page: Page, expectedMessage?: string) {
  const errorState = page.locator(expectedUIElements.errorState);
  await expect(errorState).toBeVisible();

  if (expectedMessage) {
    await expect(errorState).toContainText(expectedMessage);
  }
}

/**
 * Verify empty state is displayed
 */
export async function verifyEmptyState(page: Page) {
  const emptyState = page.locator(expectedUIElements.emptyState);
  await expect(emptyState).toBeVisible();
}

/**
 * Wait for network idle
 */
export async function waitForNetworkIdle(page: Page) {
  await page.waitForLoadState('networkidle');
}

/**
 * Take screenshot for debugging
 */
export async function takeDebugScreenshot(page: Page, name: string) {
  await page.screenshot({ path: `e2e/screenshots/${name}.png`, fullPage: true });
}

/**
 * Mock API response for testing
 */
export async function mockChatAPIResponse(page: Page, response: unknown) {
  await page.route('**/api/v1/interaction/query', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(response),
    });
  });
}

/**
 * Mock API error for testing
 */
export async function mockChatAPIError(page: Page, statusCode: number, errorMessage: string) {
  await page.route('**/api/v1/interaction/query', async (route) => {
    await route.fulfill({
      status: statusCode,
      contentType: 'application/json',
      body: JSON.stringify({ error: errorMessage }),
    });
  });
}

/**
 * Get character count from input
 */
export async function getMessageInputCharacterCount(page: Page): Promise<number> {
  const input = page.locator(expectedUIElements.messageInput);
  const value = await input.inputValue();
  return value.length;
}

/**
 * Verify loading states are working
 */
export async function verifyLoadingStates(page: Page) {
  // Send button should be disabled while loading
  const sendButton = page.locator(expectedUIElements.sendButton);
  await expect(sendButton).toBeDisabled();

  // Typing indicator should be visible
  await expect(page.locator(expectedUIElements.typingIndicator)).toBeVisible();
}

