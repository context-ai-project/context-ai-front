# Performance — Context.ai Frontend

## Overview

The application leverages Next.js 16 App Router features and React 19 optimizations to deliver fast page loads and responsive interactions. This document covers the performance strategies implemented in the codebase.

## Server Components (Default)

All pages and layouts are **React Server Components** by default, which means:

- **Zero JS shipped** for static layouts and pages
- **Server-side rendering** without hydration overhead
- **Streaming** — Content renders progressively as data becomes available

Only components that need interactivity use `'use client'`, minimizing the client-side JavaScript bundle.

### Example: Chat Page

```typescript
// src/app/[locale]/(protected)/chat/page.tsx (Server Component)
export const dynamic = 'force-dynamic';

export default async function ChatPage() {
  return <ChatContainer />;  // Only ChatContainer is a client component
}
```

## Next.js Standalone Output

The production build uses **standalone output** for Docker deployments:

- Only necessary server files are copied to the final image
- No `node_modules` in production (dependencies are bundled)
- Image size reduced to **~150–250 MB** (vs. ~1 GB with full `node_modules`)

## Image Optimization

### OptimizedImage Component

`src/components/ui/OptimizedImage.tsx` wraps `next/image` with:

| Feature | Implementation |
|---------|---------------|
| **Lazy loading** | Default `loading="lazy"` (non-priority images) |
| **Blur placeholder** | SVG base64 placeholder shown during load |
| **Error fallback** | Falls back to `/images/placeholder.png` on error |
| **Aspect ratio** | CSS aspect-ratio classes prevent layout shift |
| **Opacity transition** | Smooth fade-in on load (`transition-opacity duration-300`) |

```tsx
<OptimizedImage
  src="/logo.png"
  alt="Company logo"
  width={200}
  height={200}
  aspectRatio="square"     // Prevents CLS
  priority={false}          // Lazy load below the fold
/>
```

**Priority images** (above the fold) skip the blur placeholder and load immediately:

```tsx
<OptimizedImage src="/hero.png" alt="Hero" priority />
```

## Data Fetching & Caching (TanStack Query)

### Default Cache Configuration

```typescript
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000,        // Data is fresh for 1 minute
      gcTime: 5 * 60 * 1000,       // Garbage collect after 5 minutes
      retry: 1,                     // Retry once on failure
      refetchOnWindowFocus: false,  // Don't refetch on tab switch
    },
  },
});
```

### Benefits

- **Deduplication**: Multiple components requesting the same data share a single request
- **Background refetching**: Stale data is shown immediately while fresh data loads
- **Cache invalidation**: Surgical invalidation via hierarchical query keys

```typescript
// Only invalidate conversations for a specific user
queryClient.invalidateQueries({ queryKey: chatKeys.conversations(userId) });
```

## State Management Performance

### Zustand Selector Hooks

Zustand stores expose **individual selector hooks** to minimize re-renders:

```typescript
// ✅ Good: Only re-renders when messages change
const messages = useMessages();

// ❌ Bad: Re-renders on ANY store change
const store = useChatStore();
const messages = store.messages;
```

Each selector hook subscribes to only one slice of state, preventing unnecessary re-renders of sibling components.

### Message Validation

The chat store validates messages before adding to prevent invalid state:

```typescript
addMessage: (message) => set((state) => {
  if (!message || !message.id || !message.role || !message.content) {
    return state; // No state update = no re-render
  }
  return { messages: [...state.messages, message] };
}),
```

## Network Performance

### API Client Timeout

All API requests have a **30-second timeout** with abort controller:

```typescript
const API_CONFIG = {
  timeout: 30000, // 30 seconds
};
```

Token fetch has a separate **5-second timeout** to prevent blocking the main request.

### Request Cancellation

Components can pass an `AbortSignal` to cancel in-flight requests (e.g., on unmount):

```typescript
const controller = new AbortController();
apiClient.get('/endpoint', { signal: controller.signal });

// On cleanup
controller.abort();
```

## CSS Performance

### Tailwind CSS v4

- **PostCSS-based** — No separate config file, CSS-only configuration
- **JIT compiler** — Only generates CSS classes that are actually used
- **No runtime CSS-in-JS** — Zero JavaScript overhead for styling

### Class Name Utility

The `cn()` utility uses `clsx` + `tailwind-merge` for efficient class composition without duplicates:

```typescript
import { cn } from '@/lib/utils';

cn('px-4 py-2', 'px-6')  // → 'px-6 py-2' (px-4 is merged, not duplicated)
```

## Rendering Performance

### Force Dynamic Rendering

Protected pages use `force-dynamic` to ensure fresh auth checks:

```typescript
export const dynamic = 'force-dynamic';
export const revalidate = 0;
```

### Locale-Based Re-mounting

The protected layout uses `key={locale}` on store providers to force a clean re-mount when the language changes, preventing stale state:

```tsx
<UserStoreProvider key={locale}>
  <ChatStoreProvider>
    {children}
  </ChatStoreProvider>
</UserStoreProvider>
```

## Caching Headers

The middleware disables caching for all pages to ensure authenticated content is never stale:

```typescript
response.headers.set('Cache-Control', 'no-store, must-revalidate');
response.headers.set('Pragma', 'no-cache');
response.headers.set('Expires', '0');
```

## Docker Health Check

The production container includes a health check that runs every 30 seconds:

```dockerfile
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD node -e "require('http').get('http://127.0.0.1:3000/', ...)"
```

## Performance Monitoring

### Sentry Integration

`@sentry/nextjs` is configured for production error and performance monitoring:

- **Error tracking**: Unhandled exceptions and component errors via `ErrorBoundary`
- **Source maps**: Uploaded during build for readable stack traces

### Next.js Telemetry

Next.js telemetry is disabled in Docker builds:

```dockerfile
ENV NEXT_TELEMETRY_DISABLED=1
```

## Best Practices

| Practice | Implementation |
|----------|---------------|
| Server Components by default | Only add `'use client'` when needed |
| Minimize client JS | Extract static parts to Server Components |
| Use selector hooks | `useMessages()` instead of `useChatStore()` |
| Lazy load below-fold images | `priority={false}` on `OptimizedImage` |
| Cache API responses | TanStack Query with `staleTime: 60s` |
| Cancel unused requests | Pass `AbortSignal` to API calls |
| Avoid layout shifts | Use `aspectRatio` on images |
| Debounce search inputs | Prevent excessive API calls |

