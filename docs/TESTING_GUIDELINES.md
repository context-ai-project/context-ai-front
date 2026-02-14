# Testing Guidelines — Context.ai Frontend

## Overview

The project uses a **two-tier testing strategy**:

| Layer | Framework | Scope | Location |
|-------|-----------|-------|----------|
| **Unit / Component** | Vitest + Testing Library + vitest-axe | Components, hooks, stores, API clients | `src/**/__tests__/` |
| **End-to-End** | Playwright | Full user flows, visual regression | `e2e/` |

## Unit & Component Tests (Vitest)

### Configuration

File: `vitest.config.ts`

```typescript
export default defineConfig({
  test: {
    globals: true,           // No need to import describe/it/expect
    environment: 'jsdom',    // Browser-like environment
    setupFiles: ['./src/test/setup.ts'],
    include: ['src/**/*.test.{ts,tsx}'],
    exclude: ['node_modules', '.next', 'e2e', 'tests'],
    css: false,              // Skip CSS processing
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov'],
      include: ['src/components/**', 'src/lib/**', 'src/stores/**'],
      exclude: ['src/components/ui/**', 'src/**/*.test.*', 'src/test/**', 'src/app/**'],
      thresholds: {
        statements: 80,
        branches: 80,
        functions: 80,
        lines: 80,
      },
    },
  },
  resolve: {
    alias: { '@': path.resolve(__dirname, './src') },
  },
});
```

### Coverage Thresholds

| Metric | Minimum |
|--------|---------|
| Statements | 80% |
| Branches | 80% |
| Functions | 80% |
| Lines | 80% |

**Note**: `src/components/ui/` (shadcn primitives) and `src/app/` (pages/layouts) are excluded from coverage.

### Test Setup (`src/test/setup.ts`)

The setup file provides global mocks for Next.js and browser APIs:

| Mock | What it provides |
|------|-----------------|
| `next/navigation` | `useRouter()`, `usePathname()`, `useSearchParams()` |
| `next-auth/react` | `useSession()` with mock authenticated user, `SessionProvider` |
| `next-intl` | `useTranslations()` returns key as value, `useLocale()` returns `'en'` |
| `window.matchMedia` | Media query mock (always returns `matches: false`) |
| `IntersectionObserver` | Mock class for Next.js `<Link>` prefetching |
| `ResizeObserver` | Mock class for Radix UI / Floating UI |
| `Element.scrollIntoView` | No-op mock for scroll operations |

### File Naming Convention

```
src/components/chat/
├── ChatContainer.tsx
├── __tests__/
│   ├── ChatContainer.test.tsx       # Functional tests
│   ├── chat-a11y.test.tsx           # Accessibility tests
│   └── keyboard-navigation.test.tsx  # Keyboard interaction tests
```

- **Functional tests**: `ComponentName.test.tsx`
- **Accessibility tests**: `feature-a11y.test.tsx`
- **Keyboard tests**: `keyboard-navigation.test.tsx`

### Writing Tests

#### Component Test Example

```typescript
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ChatContainer } from '../ChatContainer';

// Wrap with required providers
function renderWithProviders(ui: React.ReactElement) {
  return render(
    <SessionProvider>
      <ChatStoreProvider>
        {ui}
      </ChatStoreProvider>
    </SessionProvider>
  );
}

describe('ChatContainer', () => {
  it('should render empty state when no messages', () => {
    renderWithProviders(<ChatContainer />);
    expect(screen.getByText(/welcome/i)).toBeInTheDocument();
  });

  it('should send message on submit', async () => {
    const user = userEvent.setup();
    renderWithProviders(<ChatContainer />);

    const input = screen.getByRole('textbox');
    await user.type(input, 'Hello');
    await user.keyboard('{Enter}');

    expect(screen.getByText('Hello')).toBeInTheDocument();
  });
});
```

#### Store Test Example

```typescript
import { renderHook, act } from '@testing-library/react';
import { ChatStoreProvider, useChatStore } from '../chat.store';

describe('Chat Store', () => {
  it('should add message', () => {
    const { result } = renderHook(() => useChatStore(), {
      wrapper: ChatStoreProvider,
    });

    act(() => {
      result.current.addMessage(mockMessage);
    });

    expect(result.current.messages).toHaveLength(1);
  });
});
```

#### Accessibility Test Example

```typescript
import { render } from '@testing-library/react';
import { axe } from 'vitest-axe';

describe('Chat Accessibility', () => {
  it('should have no accessibility violations', async () => {
    const { container } = render(<ChatContainer />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
```

### Running Unit Tests

```bash
pnpm test              # Run all unit tests
pnpm test:watch        # Watch mode
pnpm test:coverage     # With coverage report
pnpm test:ui           # Vitest interactive UI
```

## End-to-End Tests (Playwright)

### Configuration

File: `playwright.config.ts`

```typescript
export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
  },
  expect: {
    toHaveScreenshot: {
      maxDiffPixelRatio: 0.05,
      animations: 'disabled',
      caret: 'hide',
    },
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
  ],
  webServer: {
    command: 'E2E_BYPASS_AUTH=true ... pnpm dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },
});
```

### E2E Test Structure

```
e2e/
├── auth/                    # Authentication flow tests
├── chat/                    # Chat interaction tests
├── dashboard/               # Dashboard tests
├── landing/                 # Landing page tests
├── navigation/              # Responsive navigation tests
├── visual-regression/       # Screenshot comparison tests
├── fixtures/                # Test data and mock responses
├── helpers/                 # Reusable test helper functions
└── __snapshots__/           # Visual regression baselines
```

### Auth Bypass for E2E

Playwright tests run with `E2E_BYPASS_AUTH=true`, which skips the `auth()` check in the protected layout. This allows tests to access protected pages without Auth0 login.

### Visual Regression

Snapshots are organized by browser project:

```
e2e/__snapshots__/{projectName}/{testFilePath}/{arg}{ext}
```

### Running E2E Tests

```bash
pnpm test:e2e              # Run all E2E tests
pnpm test:e2e:ui           # Playwright UI mode (recommended for dev)
pnpm test:e2e:debug        # Debug mode with inspector
pnpm test:e2e:visual       # Visual regression tests only
pnpm test:e2e:visual:update # Update visual snapshots
```

## Test Categories

| Category | What to test | Example |
|----------|-------------|---------|
| **Rendering** | Component renders correctly with given props | "renders empty state when no messages" |
| **Interaction** | User events trigger correct behavior | "sends message on Enter key" |
| **State** | Store actions update state correctly | "addMessage increases messages length" |
| **API** | API client formats requests correctly | "sendMessage posts to /interaction/query" |
| **Error handling** | Errors are caught and displayed | "shows error message on API failure" |
| **Accessibility** | No WCAG violations | "has no axe violations" |
| **Keyboard** | All interactions work via keyboard | "navigates messages with arrow keys" |

## Running All Tests

```bash
pnpm test:all    # Runs Vitest + Playwright sequentially
```

## Best Practices

1. **Test behavior, not implementation** — Test what the user sees and does
2. **Use Testing Library queries** — Prefer `getByRole`, `getByText` over `getByTestId`
3. **Co-locate tests** — Keep `__tests__/` next to the components they test
4. **One assertion per concept** — Each `it()` should test one specific behavior
5. **Mock at boundaries** — Mock API calls, not internal functions
6. **Include a11y tests** — Every component group should have accessibility tests
7. **Keep E2E tests focused** — Test critical user journeys, not every edge case

