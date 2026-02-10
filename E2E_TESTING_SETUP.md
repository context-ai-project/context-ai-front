# E2E Testing Setup - Context.ai Frontend

## Overview

This document describes the E2E testing setup for the Context.ai frontend using Playwright.

## Test Structure

```
e2e/
├── chat/
│   └── chat-flow.spec.ts        # Main chat flow E2E tests
├── fixtures/
│   └── chat-data.ts              # Test data and mock responses
└── helpers/
    └── chat-helpers.ts           # Reusable test helper functions
```

## Test Coverage

### Chat Flow Tests (e2e/chat/chat-flow.spec.ts)

#### 1. Basic Functionality
- ✅ Display empty state when no messages
- ✅ Send message and receive response
- ✅ Show typing indicator while waiting

#### 2. Sources Display
- ✅ Display sources with similarity scores
- ✅ Verify source card rendering

#### 3. Multiple Messages
- ✅ Handle multiple messages in conversation
- ✅ Maintain conversation history

#### 4. Markdown Rendering
- ✅ Render markdown content correctly
- ✅ Support bold, lists, links, code blocks

#### 5. Error Handling
- ✅ Display error state on API failure
- ✅ Handle network errors gracefully

#### 6. Clear Conversation
- ✅ Clear conversation and show empty state

#### 7. Input Validation
- ✅ Prevent sending empty messages
- ✅ Show character count and validate length

## Test Data IDs

All chat components now include `data-testid` attributes for reliable E2E testing:

| Component | Test ID | Location |
|-----------|---------|----------|
| Message Input | `message-input` | `MessageInput.tsx` |
| Send Button | `send-button` | `MessageInput.tsx` |
| Clear Button | `clear-button` | `MessageInput.tsx` |
| Message List | `message-list` | `MessageList.tsx` |
| User Message | `user-message` | `MessageList.tsx` |
| Assistant Message | `assistant-message` | `MessageList.tsx` |
| Markdown Content | `markdown-content` | `MarkdownRenderer.tsx` |
| Typing Indicator | `typing-indicator` | `TypingIndicator.tsx` |
| Source Card | `source-card` | `SourceCard.tsx` |
| Empty State | `empty-state` | `EmptyState.tsx` |
| Error State | `error-state` | `ErrorState.tsx` |

## Running Tests

### Install Browsers

```bash
pnpm exec playwright install
```

### Run All Tests

```bash
pnpm test
```

### Run Tests in UI Mode

```bash
pnpm test:ui
```

### Run Tests in Debug Mode

```bash
pnpm test:debug
```

### Run Specific Test File

```bash
pnpm test e2e/chat/chat-flow.spec.ts
```

### Run Tests in Specific Browser

```bash
pnpm test --project=chromium
pnpm test --project=firefox
pnpm test --project=webkit
```

## Test Helpers

### Navigation
- `navigateToChat(page)` - Navigate to chat page

### Message Actions
- `sendMessage(page, message)` - Send a message
- `waitForAssistantResponse(page, previousCount?, timeout?)` - Wait for response
- `getAllMessages(page)` - Get all messages
- `clearConversation(page)` - Clear conversation

### Verification
- `verifyEmptyState(page)` - Verify empty state is shown
- `verifyErrorState(page, expectedMessage?)` - Verify error state
- `verifyMarkdownRendering(page)` - Verify markdown elements
- `isTypingIndicatorVisible(page)` - Check typing indicator
- `getSourceCardsCount(page)` - Count source cards

### Mocking
- `mockChatAPIResponse(page, response)` - Mock successful API response
- `mockChatAPIError(page, statusCode, errorMessage)` - Mock API error

## Configuration

### Playwright Config (`playwright.config.ts`)

```typescript
{
  testDir: './e2e',
  baseURL: 'http://localhost:3000',
  fullyParallel: true,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    trace: 'on-first-retry',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
  ],
}
```

## Best Practices

### 1. Use Test IDs
Always use `data-testid` attributes instead of CSS selectors:

```typescript
// ✅ Good
await page.locator('[data-testid="send-button"]').click();

// ❌ Bad
await page.locator('.send-btn').click();
```

### 2. Wait for Network Idle
Always wait for network to be idle before assertions:

```typescript
await page.waitForLoadState('networkidle');
```

### 3. Mock API Responses
Mock API responses for predictable tests:

```typescript
await mockChatAPIResponse(page, mockResponses.vacationPolicy);
```

### 4. Use Helper Functions
Use helper functions for common operations:

```typescript
await sendMessage(page, 'Hello');
await waitForAssistantResponse(page);
```

### 5. Explicit Locale
Always navigate with explicit locale for i18n tests:

```typescript
await page.goto('http://localhost:3000/es/chat');
```

## CI/CD Integration

Tests run automatically on:
- Pull requests to `develop` and `main`
- Pushes to `develop` and `main`

### GitHub Actions Configuration

```yaml
- name: Install Playwright Browsers
  run: pnpm exec playwright install --with-deps chromium

- name: Run E2E Tests
  run: pnpm test --project=chromium
```

## Troubleshooting

### Tests Failing Locally

1. **Install browsers**: `pnpm exec playwright install`
2. **Start dev server**: `pnpm dev` (in another terminal)
3. **Check baseURL**: Ensure it matches your local server

### Flaky Tests

1. **Increase timeout**: Use `{ timeout: 10000 }` option
2. **Wait for elements**: Use `waitForSelector` before interactions
3. **Mock API**: Use mocked responses for consistency

### Debugging

1. **Run in UI mode**: `pnpm test:ui`
2. **Run in debug mode**: `pnpm test:debug`
3. **Take screenshots**: `await page.screenshot({ path: 'debug.png' })`

## Future Improvements

- [ ] Add visual regression testing
- [ ] Add accessibility testing (axe-core)
- [ ] Add performance testing
- [ ] Add mobile viewport tests
- [ ] Add authentication flow tests
- [ ] Add file upload tests
- [ ] Add internationalization tests

## References

- [Playwright Documentation](https://playwright.dev/)
- [Playwright Best Practices](https://playwright.dev/docs/best-practices)
- [Testing Library Principles](https://testing-library.com/docs/guiding-principles/)

