# State Management — Context.ai Frontend

## Overview

The application uses a **three-tier state strategy** that separates concerns by state origin and scope:

| Tier | Tool | When to Use |
|------|------|-------------|
| **Local State** | `useState` | UI toggles, form inputs, component-specific state |
| **Global Client State** | Zustand | Cross-component state: chat messages, user/sector data |
| **Server State** | TanStack Query | API data fetching, caching, background refetching |

## Zustand Stores

### Architecture: SSR-Safe Context Pattern

Zustand stores use a **Context + Factory** pattern for Next.js App Router SSR compatibility. Instead of global singleton stores, each store:

1. Creates a store instance via a factory function
2. Provides it through React Context
3. Exposes individual selector hooks to minimize re-renders

```
createStore() → Context.Provider → useStore(context, selector)
```

This ensures each server request gets its own store instance, preventing data leaks between users.

### Chat Store (`stores/chat.store.tsx`)

Manages the chat conversation state.

**State:**

| Field | Type | Description |
|-------|------|-------------|
| `messages` | `MessageDto[]` | All messages in current conversation |
| `conversationId` | `string \| null` | Current conversation ID (null = new conversation) |
| `isLoading` | `boolean` | Whether a query is in progress |
| `error` | `string \| null` | Current error message |

**Actions:**

| Action | Description |
|--------|-------------|
| `addMessage(msg)` | Add single message (validates before adding) |
| `addMessages(user, assistant)` | Add user + assistant messages atomically |
| `setMessages(msgs)` | Replace entire messages array |
| `setConversationId(id)` | Set/clear conversation ID |
| `setLoading(bool)` | Set loading state |
| `setError(msg)` | Set error and stop loading |
| `clearMessages()` | Clear messages array |
| `clearError()` | Clear error state |
| `reset()` | Reset all state to initial values |

**Selector Hooks (prevent unnecessary re-renders):**

```typescript
// Each hook subscribes to only one slice of state
useMessages()          // Only re-renders when messages change
useConversationId()    // Only re-renders when conversationId changes
useIsLoading()         // Only re-renders when isLoading changes
useError()             // Only re-renders when error changes

// Action hooks (stable references, never cause re-renders)
useAddMessage()
useSetConversationId()
useSetLoading()
useSetError()
useClearMessages()
useResetChat()
useAddMessages()
useClearError()
useSetMessages()

// Full store access (re-renders on any change — use sparingly)
useChatStore()
```

**Provider placement:** `(protected)/layout.tsx` — Only available in authenticated routes.

### User Store (`stores/user.store.tsx`)

Manages user session data and sector selection.

**State:**

| Field | Type | Description |
|-------|------|-------------|
| `currentSectorId` | `string \| null` | Currently selected sector |
| `sectors` | `Array<{id, name}>` | Available sectors |

**Actions:**

| Action | Description |
|--------|-------------|
| `setCurrentSectorId(id)` | Select a sector |
| `setSectors(sectors)` | Set available sectors list |
| `clearUserData()` | Reset to initial state |

**Persistence:** The User Store persists `currentSectorId` to `sessionStorage`:

- On mount: reads from `sessionStorage.getItem('user-storage')`
- On change: subscribes to store and writes `currentSectorId` to `sessionStorage`
- Only persists when `currentSectorId` actually changes (optimized)

**Selector Hooks:**

```typescript
useCurrentSectorId()    // Get current sector ID
useSectors()            // Get sectors list
useSetCurrentSectorId() // Action: set sector
useSetSectors()         // Action: set sectors list
useClearUserData()      // Action: clear all user data
```

**Provider placement:** `(protected)/layout.tsx` — Uses `key={locale}` to force re-mount on language change.

## TanStack Query

### Configuration (`lib/providers/query-provider.tsx`)

```typescript
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000,        // Data fresh for 1 minute
      gcTime: 5 * 60 * 1000,       // Garbage collect after 5 minutes
      retry: 1,                     // Retry once on failure
      refetchOnWindowFocus: false,  // Don't refetch on tab switch
    },
  },
});
```

### Query Keys (`lib/api/chat.api.ts`)

Query keys follow a hierarchical pattern for efficient cache invalidation:

```typescript
export const chatKeys = {
  all: ['chat'] as const,
  conversations: (userId: string) => ['chat', 'conversations', userId] as const,
  conversation: (id: string) => ['chat', 'conversation', id] as const,
  messages: (conversationId: string) => ['chat', 'messages', conversationId] as const,
};
```

**Invalidation example:**

```typescript
// Invalidate all chat data
queryClient.invalidateQueries({ queryKey: chatKeys.all });

// Invalidate specific conversation
queryClient.invalidateQueries({ queryKey: chatKeys.conversation(id) });
```

### Provider Placement

`QueryProvider` wraps the entire locale layout (`[locale]/layout.tsx`), so it's available on all pages including public ones.

## When to Use Each Tier

### ✅ Use `useState` for:

- Modal open/close state
- Form input values
- Dropdown/accordion expanded state
- Temporary UI state (hover, focus)

### ✅ Use Zustand for:

- Chat messages and conversation state
- User sector selection (persisted to sessionStorage)
- Any state shared between sibling components
- State that needs to survive page navigation within the protected area

### ✅ Use TanStack Query for:

- API data fetching (conversations list, user data)
- Data that should be cached and deduplicated
- Background refetching of stale data
- Optimistic updates with rollback

### ❌ Anti-patterns:

- Don't put API data in Zustand — use TanStack Query instead
- Don't use Zustand for UI-only state — use `useState`
- Don't access stores outside their Provider — will throw error
- Don't use `useChatStore()` (full store) when a selector hook exists

## Adding a New Store

1. Create `stores/feature.store.tsx`:

```typescript
'use client';

import { createContext, useContext, useState, type ReactNode } from 'react';
import { createStore, useStore } from 'zustand';

interface FeatureState {
  data: string | null;
  setData: (data: string) => void;
}

type FeatureStore = ReturnType<typeof createFeatureStore>;

const createFeatureStore = () =>
  createStore<FeatureState>()((set) => ({
    data: null,
    setData: (data) => set({ data }),
  }));

const FeatureStoreContext = createContext<FeatureStore | null>(null);

export function FeatureStoreProvider({ children }: { children: ReactNode }) {
  const [store] = useState(createFeatureStore);
  return <FeatureStoreContext.Provider value={store}>{children}</FeatureStoreContext.Provider>;
}

function useFeatureStoreContext() {
  const store = useContext(FeatureStoreContext);
  if (!store) throw new Error('useFeatureStore must be used within FeatureStoreProvider');
  return store;
}

export const useFeatureData = () => {
  const store = useFeatureStoreContext();
  return useStore(store, (s) => s.data);
};

export const useSetFeatureData = () => {
  const store = useFeatureStoreContext();
  return useStore(store, (s) => s.setData);
};
```

2. Add the provider to the appropriate layout
3. Create tests in `stores/__tests__/feature.store.test.tsx`

