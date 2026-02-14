import { test, expect } from '../setup/auth-fixture';
import {
  navigateToChat,
  sendMessage,
  waitForAssistantResponse,
  getAllMessages,
  getSourceCardsCount,
  verifyMarkdownRendering,
  clearConversation,
  verifyEmptyState,
  mockChatAPIResponse,
  mockChatAPIError,
  verifyErrorState,
} from '../helpers/chat-helpers';
import { testMessages, mockChatResponses } from '../fixtures/chat-data';

/**
 * E2E Tests for Chat Flow
 * Issue #29: Tests complete chat functionality from user perspective
 */

test.describe('Chat Flow - Basic Functionality', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate with explicit English locale since EmptyState text is hardcoded in English
    await navigateToChat(page);
  });

  test('should display empty state when no messages', async ({ page }) => {
    await verifyEmptyState(page);
    await expect(page.locator('text=Welcome to Context.ai')).toBeVisible();
  });

  test('user can write message and receive response', async ({ page }) => {
    // Mock API response with correct ChatResponseDto format
    await mockChatAPIResponse(page, mockChatResponses.vacationPolicy);

    // Send message
    await sendMessage(page, testMessages.simple);

    // Verify user message appears (added optimistically before API call)
    await expect(page.getByTestId('user-message')).toContainText(testMessages.simple);

    // Wait for assistant response
    await waitForAssistantResponse(page);

    // Verify assistant message appears
    await expect(page.getByTestId('assistant-message')).toBeVisible();
  });

  test('should show typing indicator while waiting for response', async ({ page }) => {
    // Delay the API response to give time to check the typing indicator
    await page.route('**/interaction/query', async (route) => {
      await new Promise((resolve) => setTimeout(resolve, 2000));
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockChatResponses.vacationPolicy),
      });
    });

    await sendMessage(page, testMessages.simple);

    // Wait for typing indicator to appear using Playwright's built-in waiting
    await expect(page.getByTestId('typing-indicator')).toBeVisible({ timeout: 5000 });
  });
});

test.describe('Chat Flow - Sources Display', () => {
  test.beforeEach(async ({ page }) => {
    await navigateToChat(page);
  });

  test('sources should be displayed correctly with similarity scores', async ({ page }) => {
    await mockChatAPIResponse(page, mockChatResponses.vacationPolicy);

    await sendMessage(page, testMessages.simple);
    await waitForAssistantResponse(page);

    // Check sources are displayed
    const sourcesCount = await getSourceCardsCount(page);
    expect(sourcesCount).toBeGreaterThan(0);

    // Verify similarity scores (95% and 92% from mock data)
    await expect(page.locator('text=95%')).toBeVisible();
    await expect(page.locator('text=92%')).toBeVisible();
  });
});

test.describe('Chat Flow - Multiple Messages', () => {
  test.beforeEach(async ({ page }) => {
    await navigateToChat(page);
  });

  test('should handle multiple messages in conversation', async ({ page }) => {
    // Mock responses for multiple messages
    await mockChatAPIResponse(page, mockChatResponses.vacationPolicy);

    // Send first message
    await sendMessage(page, testMessages.simple);
    await waitForAssistantResponse(page);

    // Send second message
    await sendMessage(page, testMessages.complex);
    await waitForAssistantResponse(page, 1); // 1 assistant message already exists

    // Verify message count
    const messages = await getAllMessages(page);
    expect(messages.total).toBeGreaterThanOrEqual(4); // 2 user + 2 assistant
  });
});

test.describe('Chat Flow - Markdown Rendering', () => {
  test.beforeEach(async ({ page }) => {
    await navigateToChat(page);
  });

  test('markdown should be rendered correctly', async ({ page }) => {
    await mockChatAPIResponse(page, mockChatResponses.vacationPolicy);

    await sendMessage(page, testMessages.withMarkdown);
    await waitForAssistantResponse(page);

    const markdown = await verifyMarkdownRendering(page);
    expect(markdown.hasBold || markdown.hasLists || markdown.hasLinks).toBe(true);
  });
});

test.describe('Chat Flow - Error Handling', () => {
  test.beforeEach(async ({ page }) => {
    await navigateToChat(page);
  });

  test('should display error state on API failure', async ({ page }) => {
    await mockChatAPIError(page, 500, 'Internal Server Error');

    await sendMessage(page, testMessages.simple);

    await verifyErrorState(page);
  });

  test('should handle network errors', async ({ page }) => {
    await page.route('**/interaction/query', async (route) => {
      await route.abort('failed');
    });

    await sendMessage(page, testMessages.simple);

    await verifyErrorState(page);
  });
});

test.describe('Chat Flow - Clear Conversation', () => {
  test.beforeEach(async ({ page }) => {
    await navigateToChat(page);
  });

  test('should clear conversation when clear button is clicked', async ({ page }) => {
    await mockChatAPIResponse(page, mockChatResponses.vacationPolicy);

    await sendMessage(page, testMessages.simple);
    await waitForAssistantResponse(page);

    // Clear conversation
    await clearConversation(page);

    // Verify empty state is shown again
    await verifyEmptyState(page);
  });
});

test.describe('Chat Flow - Input Validation', () => {
  test.beforeEach(async ({ page }) => {
    await navigateToChat(page);
  });

  test('should not allow sending empty messages', async ({ page }) => {
    const sendButton = page.getByTestId('send-button');

    // Verify send button is disabled when input is empty
    await expect(sendButton).toBeDisabled();
  });

  test('should show character count and validate length', async ({ page }) => {
    const input = page.getByTestId('message-input');

    // Click to focus the textarea first (triggers onFocus -> isFocused = true)
    await input.click();

    // Fill the textarea with a long message
    await input.fill(testMessages.longMessage);

    // Re-click to ensure focus is maintained (counter only shows when isFocused && charCount > 0)
    await input.click();

    // Verify character limit is shown (text has spaces: "620 / 2000")
    await expect(page.getByText(/\d+\s*\/\s*2000/)).toBeVisible();
  });
});
