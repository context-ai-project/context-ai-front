# Architecture — Context.ai Frontend

## Overview

Context.ai Frontend follows a **layered architecture** built on top of Next.js 16 App Router. The application separates concerns into clearly defined layers: routing/pages, components, state management, API communication, and shared utilities.

```
┌─────────────────────────────────────────────────────────┐
│                    Next.js App Router                     │
│  (Server Components, Layouts, Route Groups, Middleware)   │
├─────────────────────────────────────────────────────────┤
│                   Component Layer                        │
│  (Feature components, Shared components, UI primitives)  │
├──────────────────┬──────────────────────────────────────┤
│  State Layer     │         API Layer                     │
│  (Zustand stores)│  (apiClient, chat.api, user.api)     │
├──────────────────┴──────────────────────────────────────┤
│                  Shared Layer                            │
│  (Types, Constants, Hooks, Utils, Providers)             │
├─────────────────────────────────────────────────────────┤
│                  Infrastructure                          │
│  (Auth, i18n, Sentry, Environment Config)                │
└─────────────────────────────────────────────────────────┘
```

## Server vs Client Components

The application uses Next.js App Router's **React Server Components (RSC)** model:

| Type | Usage | Examples |
|------|-------|---------|
| **Server Components** (default) | Layouts, pages, data fetching, auth checks | `layout.tsx`, `page.tsx` |
| **Client Components** (`'use client'`) | Interactive UI, state, browser APIs | `ChatContainer`, stores, hooks |

### Key Principle

- **Pages** are Server Components that delegate interactivity to Client Components
- **Layouts** handle authentication checks and provider wrapping
- **Client Components** handle user interaction, state, and browser APIs

## Routing Architecture

### Route Groups

The App Router uses **route groups** (parentheses syntax) to organize routes without affecting the URL:

```
src/app/
├── [locale]/                    # Dynamic locale segment (es/en)
│   ├── (auth)/                 # Auth-related pages (no layout nesting)
│   │   ├── callback/
│   │   └── login/
│   ├── (protected)/            # Authenticated routes (shared layout with sidebar)
│   │   ├── chat/
│   │   ├── dashboard/
│   │   ├── knowledge/
│   │   └── layout.tsx          # Auth guard + sidebar + store providers
│   ├── auth/                   # NextAuth pages (signin, error)
│   ├── layout.tsx              # i18n + session + query providers
│   └── page.tsx                # Public landing page
├── api/
│   └── auth/                   # NextAuth API routes
├── layout.tsx                  # Root layout (HTML, body, globals.css)
└── globals.css                 # Tailwind CSS entry point
```

### Locale Routing

All user-facing routes are nested under `[locale]/`, handled by `next-intl` middleware:

```
/es/chat     → Spanish chat page
/en/chat     → English chat page
/es/dashboard → Spanish dashboard
```

### Authentication Guard

Authentication is enforced at the **layout level**, not per-page:

```
src/app/[locale]/(protected)/layout.tsx
  ↓
  1. Calls auth() (NextAuth server-side)
  2. If no session → redirect to /[locale]/auth/signin
  3. If authenticated → render sidebar + children
```

## Provider Hierarchy

Providers are layered in the following order:

```tsx
// Root Layout
<html>
  <body>
    // Locale Layout (src/app/[locale]/layout.tsx)
    <NextIntlClientProvider>        // i18n messages
      <SessionProvider>              // NextAuth session
        <QueryProvider>              // TanStack Query client
          // Protected Layout (src/app/[locale]/(protected)/layout.tsx)
          <UserStoreProvider>        // Zustand user state
            <ChatStoreProvider>      // Zustand chat state
              <SidebarProvider>      // UI sidebar state
                {children}
              </SidebarProvider>
            </ChatStoreProvider>
          </UserStoreProvider>
          <Toaster />                // Toast notifications
        </QueryProvider>
      </SessionProvider>
    </NextIntlClientProvider>
  </body>
</html>
```

## Component Architecture

### Component Categories

| Category | Path | Purpose |
|----------|------|---------|
| **Feature** | `components/chat/`, `components/landing/`, etc. | Feature-specific UI |
| **Shared** | `components/shared/` | Cross-feature components (Navbar, ErrorBoundary, LanguageSelector) |
| **User** | `components/user/` | User-related components (Profile, SectorSelector, Logout) |
| **UI** | `components/ui/` | shadcn/ui primitives (Button, Dialog, Card, etc.) |
| **Providers** | `components/providers/` | React context providers |

### Component Structure Convention

```
components/
├── chat/
│   ├── __tests__/              # Co-located tests
│   │   ├── ChatContainer.test.tsx
│   │   ├── chat-a11y.test.tsx  # Accessibility tests
│   │   └── ...
│   ├── ChatContainer.tsx       # Main container
│   ├── MessageList.tsx
│   ├── MessageInput.tsx
│   ├── MarkdownRenderer.tsx
│   └── ...
```

## State Management Architecture

The application uses a **three-tier state strategy**:

```
┌──────────────────────────────────────────────┐
│         1. Local State (useState)             │
│    UI toggles, form inputs, component state   │
├──────────────────────────────────────────────┤
│      2. Global Client State (Zustand)         │
│    Chat messages, user/sector selection        │
├──────────────────────────────────────────────┤
│    3. Server State (TanStack Query)           │
│    API data, caching, background refetching   │
└──────────────────────────────────────────────┘
```

### Zustand Stores (SSR-Safe Pattern)

Stores use the **Context + Factory** pattern for Next.js App Router SSR compatibility:

```
createStore() → Context.Provider → useStore(context, selector)
```

This ensures each request gets its own store instance on the server.

### TanStack Query Configuration

```typescript
// Default options
staleTime: 60 * 1000      // 1 minute
gcTime: 5 * 60 * 1000     // 5 minutes garbage collection
retry: 1                   // Single retry on failure
refetchOnWindowFocus: false // No automatic refetch
```

## API Layer

```
lib/api/
├── client.ts          # Base HTTP client with auth interceptor
├── chat.api.ts        # Chat endpoints + query keys
├── user.api.ts        # User sync endpoint
└── error-handler.ts   # APIError class, categorization, user-friendly messages
```

### Request Flow

```
Component → apiClient.post('/endpoint', data)
               ↓
         fetchWithInterceptors()
               ↓
         getAccessToken() ← GET /api/auth/token
               ↓
         fetch(url, { headers: { Authorization: Bearer token } })
               ↓
         Response → JSON parse / APIError
```

## Key Design Decisions

| Decision | Rationale |
|----------|-----------|
| **Server Components by default** | Reduces JS bundle size, enables server-side auth checks |
| **Zustand over Redux** | Minimal boilerplate, SSR-safe with Context pattern |
| **TanStack Query for API data** | Built-in caching, deduplication, background refetching |
| **Route groups for auth** | Clean URL structure, shared layouts per auth state |
| **Co-located tests** | Tests live next to components (`__tests__/` folders) |
| **next-intl for i18n** | Supports App Router, locale routing, server-side messages |
| **NextAuth.js v5** | First-class App Router support, JWT strategy, Auth0 provider |
| **Tailwind CSS v4** | PostCSS-based config, no `tailwind.config.ts` needed |

