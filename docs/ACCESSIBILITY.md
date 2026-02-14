# Accessibility (a11y) — Context.ai Frontend

## Overview

Context.ai follows **WCAG 2.1 Level AA** guidelines to ensure the application is usable by people with disabilities. Accessibility is enforced at three levels: development-time linting, automated testing, and manual code review.

## Enforcement Layers

| Layer | Tool | What it catches |
|-------|------|-----------------|
| **Linting** | `eslint-plugin-jsx-a11y` (via `next/core-web-vitals`) | Missing alt text, invalid ARIA, non-interactive roles |
| **Unit Testing** | `vitest-axe` | WCAG violations in rendered components |
| **E2E Testing** | Playwright | Full-page accessibility in real browsers |
| **Code Review** | Checklist (see below) | Keyboard navigation, focus management, color contrast |

## ESLint Rules

`jsx-a11y` is included automatically via `eslint-config-next/core-web-vitals`. The project adds a custom rule for Next.js `<Link>`:

```javascript
// eslint.config.mjs
'jsx-a11y/anchor-is-valid': [
  'error',
  {
    components: ['Link'],
    specialLink: ['hrefLeft', 'hrefRight'],
    aspects: ['invalidHref', 'preferButton'],
  },
],
```

## Accessibility Tests

### Test File Convention

Each component group has dedicated a11y tests:

```
src/components/
├── chat/__tests__/chat-a11y.test.tsx
├── landing/__tests__/landing-a11y.test.tsx
├── shared/__tests__/shared-a11y.test.tsx
└── user/__tests__/user-a11y.test.tsx
```

### Using vitest-axe

```typescript
import { render } from '@testing-library/react';
import { axe } from 'vitest-axe';

describe('Chat Accessibility', () => {
  it('should have no accessibility violations', async () => {
    const { container } = render(
      <Providers>
        <ChatContainer />
      </Providers>
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
```

### Keyboard Navigation Tests

```
src/components/chat/__tests__/keyboard-navigation.test.tsx
```

These tests verify that all interactive elements are reachable and operable via keyboard (Tab, Enter, Escape, Arrow keys).

## Translation Keys for Screen Readers

The `accessibility` namespace in message files provides ARIA labels:

```json
{
  "accessibility": {
    "skipToContent": "Skip to content",
    "menu": "Menu",
    "closeMenu": "Close menu",
    "openMenu": "Open menu",
    "loading": "Loading",
    "errorBoundary": "Error boundary"
  }
}
```

These are used with `useTranslations('accessibility')` to provide localized ARIA labels.

## Component Patterns

### Interactive Elements

```tsx
// ✅ Button with aria-label for icon-only buttons
<button
  aria-label="Close dialog"
  onClick={handleClose}
  className="focus:ring-2 focus:ring-blue-500"
>
  <X className="h-4 w-4" />
</button>

// ✅ Link opens in new tab with security attributes
<a
  href={url}
  target="_blank"
  rel="noopener noreferrer"
  className="text-blue-600 underline hover:text-blue-800"
>
  {text}
</a>
```

### Form Inputs

```tsx
// ✅ Textarea with accessible label and placeholder
<textarea
  aria-label={t('chat.placeholder')}
  placeholder={t('chat.placeholder')}
  onKeyDown={handleKeyDown}
/>
```

### Loading States

```tsx
// ✅ Loading indicator with aria-live for screen readers
<div aria-live="polite" aria-busy={isLoading}>
  {isLoading ? <MessageSkeleton /> : <MessageList />}
</div>
```

### Error Messages

```tsx
// ✅ Error with role="alert" for immediate screen reader announcement
<div role="alert" className="text-red-600">
  {errorMessage}
</div>
```

### Images

```tsx
// ✅ OptimizedImage always requires alt text
<OptimizedImage
  src="/logo.png"
  alt="Context.ai company logo"
  width={200}
  height={200}
/>
```

## Focus Management

### Visible Focus Indicators

All interactive elements have visible focus rings via Tailwind:

```tsx
className="focus:ring-2 focus:ring-blue-500 focus:outline-none"
```

shadcn/ui components include built-in focus styles via Radix UI primitives.

### Focus Trapping

Modal dialogs (shadcn/ui `Dialog`, `AlertDialog`, `Sheet`) automatically trap focus within the dialog and restore focus on close, powered by Radix UI.

### Skip Navigation

The accessibility translations include a "Skip to content" label for implementing skip navigation links.

## Semantic HTML

| Element | Usage |
|---------|-------|
| `<header>` | Page/section headers |
| `<nav>` | Navigation (sidebar, landing navbar) |
| `<main>` | Primary content area |
| `<article>` | Chat messages, knowledge cards |
| `<button>` | Clickable actions (never `<div onClick>`) |
| `<h1>`–`<h3>` | Heading hierarchy (maintained per page) |
| `<ul>`, `<ol>` | Lists (sources, features, navigation items) |

## Color Contrast

- **Text on background**: Minimum 4.5:1 ratio (WCAG AA)
- **Large text** (18px+): Minimum 3:1 ratio
- **Interactive elements**: Visible in both light themes
- **Error states**: Red text (`text-red-600`) on light backgrounds meets contrast requirements

## Checklist for Code Review

- [ ] All images have meaningful `alt` text
- [ ] Icon-only buttons have `aria-label`
- [ ] Form inputs have associated labels or `aria-label`
- [ ] Color is not the only indicator of state (use icons/text too)
- [ ] Focus order follows visual order
- [ ] Modals trap focus and restore on close
- [ ] Dynamic content updates use `aria-live` regions
- [ ] Error messages use `role="alert"`
- [ ] Keyboard navigation works for all interactive elements
- [ ] Headings follow a logical hierarchy (h1 → h2 → h3)

## Running Accessibility Checks

```bash
# Unit tests with vitest-axe
pnpm test

# Specific a11y test files
pnpm test -- --grep "a11y"

# E2E tests (includes visual and interaction checks)
pnpm test:e2e
```

