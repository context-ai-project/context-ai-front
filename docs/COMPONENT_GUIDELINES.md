# Component Guidelines — Context.ai Frontend

## Overview

Components follow a structured organization pattern based on feature domains, with shared primitives provided by shadcn/ui and Radix UI. All components are **functional** (no class components except `ErrorBoundary`), use TypeScript interfaces for props, and include JSDoc documentation.

## Directory Structure

```
src/components/
├── chat/                    # Chat feature
│   ├── __tests__/           # Co-located tests
│   ├── ChatContainer.tsx    # Main container (state + logic)
│   ├── MessageList.tsx      # Message rendering
│   ├── MessageInput.tsx     # Input with validation
│   ├── MarkdownRenderer.tsx # Markdown rendering with syntax highlighting
│   ├── SourceCard.tsx       # RAG source citation card
│   ├── SourceList.tsx       # List of sources
│   ├── EmptyState.tsx       # No-messages state
│   ├── ErrorState.tsx       # Error display
│   ├── MessageSkeleton.tsx  # Loading skeleton
│   ├── SuggestedQuestions.tsx # Quick-start suggestions
│   └── TypingIndicator.tsx  # Typing animation
├── dashboard/               # Dashboard feature
│   ├── __tests__/
│   └── app-sidebar.tsx      # Sidebar navigation
├── knowledge/               # Knowledge management feature
├── landing/                 # Landing page sections
│   ├── __tests__/
│   ├── HeroSection.tsx
│   ├── FeaturesSection.tsx
│   ├── HowItWorksSection.tsx
│   ├── UseCasesSection.tsx
│   ├── CtaFooter.tsx
│   └── LandingNavbar.tsx
├── shared/                  # Cross-feature shared components
│   ├── __tests__/
│   ├── ErrorBoundary.tsx    # React Error Boundary
│   ├── LanguageSelector.tsx # i18n language switcher
│   ├── Navbar.tsx           # Navigation bar
│   └── UserAvatar.tsx       # User avatar display
├── user/                    # User-related components
│   ├── __tests__/
│   ├── UserProfile.tsx
│   ├── SectorSelector.tsx
│   └── LogoutButton.tsx
├── providers/               # React context providers
└── ui/                      # shadcn/ui primitives (auto-generated)
    ├── button.tsx
    ├── card.tsx
    ├── dialog.tsx
    ├── input.tsx
    ├── OptimizedImage.tsx   # Custom optimized image wrapper
    ├── sidebar.tsx
    ├── skeleton.tsx
    ├── toast.tsx
    └── ...
```

## Component Categories

| Category | When to Use | Example |
|----------|-------------|---------|
| **Feature** | Domain-specific UI for a single feature | `ChatContainer`, `HeroSection` |
| **Shared** | Reused across multiple features | `ErrorBoundary`, `Navbar` |
| **User** | User identity and session | `UserProfile`, `SectorSelector` |
| **UI** | Low-level primitives (shadcn/ui) | `Button`, `Card`, `Dialog` |
| **Providers** | React Context wrappers | `QueryProvider` |

## Component Structure

Every component follows this internal order:

```typescript
'use client'; // Only if needed

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { cn } from '@/lib/utils';

/**
 * Brief description of the component
 *
 * @example
 * ```tsx
 * <ComponentName prop1="value" onAction={handler} />
 * ```
 */
interface ComponentNameProps {
  prop1: string;
  onAction?: () => void;
  className?: string;
}

export function ComponentName({ prop1, onAction, className }: ComponentNameProps) {
  // 1. Hooks (useState, useEffect, custom hooks)
  const [state, setState] = useState();
  const { data: session } = useSession();

  // 2. Queries / Mutations (TanStack Query)
  // const { data } = useQuery({ ... });

  // 3. Event handlers
  const handleAction = () => { /* ... */ };

  // 4. Effects
  useEffect(() => { /* ... */ }, []);

  // 5. Early returns (loading, error, empty)
  if (!session) return null;

  // 6. Render
  return (
    <div className={cn('base-classes', className)}>
      {/* content */}
    </div>
  );
}
```

## Server vs Client Components

### Default: Server Components

Pages and layouts are Server Components by default. They can:

- Access server-side data (auth, database)
- Use `async/await`
- Cannot use hooks, event handlers, or browser APIs

```typescript
// src/app/[locale]/(protected)/chat/page.tsx
export const dynamic = 'force-dynamic';

export default async function ChatPage() {
  return <ChatContainer />;  // Delegates to client component
}
```

### Client Components (`'use client'`)

Add `'use client'` directive when the component needs:

- React hooks (`useState`, `useEffect`, `useSession`)
- Event handlers (`onClick`, `onSubmit`)
- Browser APIs (`window`, `document`, `sessionStorage`)
- Zustand stores or TanStack Query

```typescript
'use client';

export function ChatContainer() {
  const { messages } = useChatStore();
  // ...
}
```

## Props Conventions

### Interface Naming

```typescript
// Pattern: ComponentName + Props
interface MessageInputProps {
  onSendMessage: (message: string) => void;
  onClearConversation: () => void;
}
```

### Common Optional Props

```typescript
interface ComponentProps {
  className?: string;      // Tailwind class override
  'data-testid'?: string;  // Testing identifier
  children?: ReactNode;    // Composition
}
```

### Callback Naming

| Prefix | Usage |
|--------|-------|
| `on` | Callback props from parent: `onSendMessage`, `onChange` |
| `handle` | Internal event handlers: `handleSubmit`, `handleClick` |

## Styling with Tailwind CSS

### `cn()` Utility

Use `cn()` (from `@/lib/utils`) for conditional and composable class names:

```typescript
import { cn } from '@/lib/utils';

<div className={cn(
  'flex items-center gap-4',           // Base classes
  'rounded-lg border border-gray-200', // Visual
  isActive && 'bg-blue-50',            // Conditional
  className                             // Override from parent
)}>
```

### shadcn/ui Usage

```typescript
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardContent } from '@/components/ui/card';

<Button variant="outline" size="lg">Click me</Button>

<Card>
  <CardHeader>Title</CardHeader>
  <CardContent>Content</CardContent>
</Card>
```

## Error Handling

### ErrorBoundary

Wrap feature sections with `ErrorBoundary` to catch rendering errors:

```typescript
import { ErrorBoundary } from '@/components/shared/ErrorBoundary';

<ErrorBoundary fallback={<CustomFallback />} onReset={handleRetry}>
  <ChatContainer />
</ErrorBoundary>
```

The `ErrorBoundary` provides:

- Visual error display with "Try Again" and "Reload Page" buttons
- Error logging via `logError()` (integrated with Sentry)
- Development-only stack trace details

### Error State Pattern

```typescript
// Inline error
<ErrorState error={errorMessage} onDismiss={() => setError(null)} variant="inline" />

// Full-page error
<ErrorState error={errorMessage} onDismiss={handleRetry} />
```

## Testing Convention

Every component group should have:

1. **Functional tests** (`ComponentName.test.tsx`) — Rendering, interaction, state
2. **Accessibility tests** (`feature-a11y.test.tsx`) — vitest-axe validation
3. **Keyboard tests** (when applicable) — Keyboard navigation

Tests live in `__tests__/` subdirectories co-located with their components.

## Best Practices

1. **Keep components under 200 lines** — Extract sub-components if larger
2. **Single responsibility** — One component, one purpose
3. **Extract logic to hooks** — Business logic belongs in custom hooks
4. **Use composition** — Prefer children/slots over deep prop drilling
5. **Memoize expensive computations** — Use `useMemo` for derived data
6. **Memoize callbacks** — Use `useCallback` when passing to child components
7. **Handle all states** — Loading, error, empty, and success states
8. **Include JSDoc** — Document public components and non-obvious props

