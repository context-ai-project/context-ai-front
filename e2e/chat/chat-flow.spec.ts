import { test, expect } from '../setup/auth-fixture';
import {
  navigateToChat,
  sendMessage,
  waitForAssistantResponse,
  getAllMessages,
  isTypingIndicatorVisible,
  getSourceCardsCount,
  verifyMarkdownRendering,
  clearConversation,
  verifyEmptyState,
  mockChatAPIResponse,
  mockChatAPIError,
  verifyErrorState,
} from '../helpers/chat-helpers';
import { testMessages, mockResponses } from '../fixtures/chat-data';

/**
 * E2E Tests for Chat Flow
 * Issue #29: Tests complete chat functionality from user perspective
 */

test.describe('Chat Flow - Basic Functionality', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate with explicit Spanish locale for i18n-dependent assertions
    await page.goto('http://localhost:3000/es/chat');
    await page.waitForLoadState('networkidle');
  });

  test('should display empty state when no messages', async ({ page }) => {
    await verifyEmptyState(page);
    // Note: EmptyState text is currently hardcoded in English
    await expect(page.locator('text=Welcome to Context.ai')).toBeVisible();
  });

  test('user can write message and receive response', async ({ page }) => {
    // Mock API response
    await mockChatAPIResponse(page, {
      userMessage: {
        id: 'msg-1',
        conversationId: 'conv-1',
        role: 'user',
        content: testMessages.simple,
        createdAt: new Date().toISOString(),
      },
      assistantMessage: {
        id: 'msg-2',
        conversationId: 'conv-1',
        role: 'assistant',
        content: mockResponses.vacationPolicy.content,
        sourcesUsed: mockResponses.vacationPolicy.sources,
        createdAt: new Date().toISOString(),
      },
      conversationId: 'conv-1',
      sources: mockResponses.vacationPolicy.sources,
    });

    // Send message
    await sendMessage(page, testMessages.simple);

    // Verify user message appears
    await expect(page.getByTestId('user-message')).toContainText(testMessages.simple);

    // Wait for response
    await waitForAssistantResponse(page);

    // Verify assistant message appears
    await expect(page.getByTestId('assistant-message')).toBeVisible();
  });

  test('should show typing indicator while waiting for response', async ({ page }) => {
    // Delay the API response
    await page.route('**/api/v1/interaction/query', async (route) => {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      await route.fulfill({
        status: 200,
        body: JSON.stringify(mockResponses.vacationPolicy),
      });
    });

    await sendMessage(page, testMessages.simple);

    // Check typing indicator is visible
    const isVisible = await isTypingIndicatorVisible(page);
    expect(isVisible).toBe(true);
  });
});

test.describe('Chat Flow - Sources Display', () => {
  test.beforeEach(async ({ page }) => {
    await navigateToChat(page);
  });

  test('sources should be displayed correctly with similarity scores', async ({ page }) => {
    await mockChatAPIResponse(page, {
      userMessage: {
        id: 'msg-1',
        conversationId: 'conv-1',
        role: 'user',
        content: testMessages.simple,
        createdAt: new Date().toISOString(),
      },
      assistantMessage: {
        id: 'msg-2',
        conversationId: 'conv-1',
        role: 'assistant',
        content: mockResponses.vacationPolicy.content,
        sourcesUsed: mockResponses.vacationPolicy.sources,
        createdAt: new Date().toISOString(),
      },
      conversationId: 'conv-1',
      sources: mockResponses.vacationPolicy.sources,
    });

    await sendMessage(page, testMessages.simple);
    await waitForAssistantResponse(page);

    // Check sources are displayed
    const sourcesCount = await getSourceCardsCount(page);
    expect(sourcesCount).toBeGreaterThan(0);

    // Verify similarity scores
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
    await mockChatAPIResponse(page, mockResponses.vacationPolicy);

    // Send first message
    await sendMessage(page, testMessages.simple);
    await waitForAssistantResponse(page);

    // Send second message
    await sendMessage(page, testMessages.complex);
    await waitForAssistantResponse(page);

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
    await mockChatAPIResponse(page, {
      userMessage: {
        id: 'msg-1',
        conversationId: 'conv-1',
        role: 'user',
        content: testMessages.withMarkdown,
        createdAt: new Date().toISOString(),
      },
      assistantMessage: {
        id: 'msg-2',
        conversationId: 'conv-1',
        role: 'assistant',
        content: mockResponses.vacationPolicy.content,
        createdAt: new Date().toISOString(),
      },
      conversationId: 'conv-1',
      sources: [],
    });

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
    await page.route('**/api/v1/interaction/query', async (route) => {
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
    await mockChatAPIResponse(page, mockResponses.vacationPolicy);

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

    // Type a long message
    await input.fill(testMessages.longMessage);

    // Verify character limit is shown
    await expect(page.locator('text=/\\d+\\/2000/')).toBeVisible();
  });
});

