# API Integration — Context.ai Frontend

## Overview

The frontend communicates with the backend (`context-ai-api`) via a centralized API client layer located in `src/lib/api/`. All requests are authenticated automatically with JWT tokens from the NextAuth session.

## Architecture

```
┌───────────────────┐     ┌──────────────────┐     ┌──────────────────┐
│   Component       │     │    API Client     │     │    Backend       │
│                   │     │  (lib/api/)       │     │  (context-ai-api)│
│ chatApi.send      │────▶│ fetchWithInter    │────▶│ POST /interaction│
│ Message(dto)      │     │ ceptors()         │     │ /query           │
│                   │◀────│                   │◀────│                  │
│ ChatResponseDto   │     │ JSON parse /      │     │ Response         │
│                   │     │ APIError          │     │                  │
└───────────────────┘     └──────────────────┘     └──────────────────┘
```

## File Structure

```
src/lib/api/
├── client.ts           # Base HTTP client with auth interceptor
├── chat.api.ts         # Chat/conversation endpoints + query keys
├── user.api.ts         # User sync endpoint
├── error-handler.ts    # APIError class, categorization, user-friendly messages
└── __tests__/
    ├── client.test.ts
    ├── chat.api.test.ts
    ├── user.api.test.ts
    └── error-handler.test.ts
```

## API Client (`client.ts`)

### Base Configuration

```typescript
const API_CONFIG = {
  baseURL: getPublicEnv('NEXT_PUBLIC_API_URL'), // e.g. http://localhost:3001/api/v1
  timeout: 30000, // 30 seconds
};
```

### Request Flow

Every request goes through `fetchWithInterceptors()`:

1. **Create abort controller** with timeout (default 30s)
2. **Get access token** via `GET /api/auth/token` (NextAuth route, 5s timeout)
3. **Set headers**: `Content-Type: application/json` + `Authorization: Bearer <token>`
4. **Execute fetch** with the composed URL and options
5. **Handle response**: Parse JSON on success, throw `APIError` on HTTP errors

### HTTP Methods

```typescript
export const apiClient = {
  get<T>(endpoint: string, options?): Promise<T>,
  post<T>(endpoint: string, data?, options?): Promise<T>,
  put<T>(endpoint: string, data?, options?): Promise<T>,
  delete<T>(endpoint: string, options?): Promise<T>,
};
```

**Usage example:**

```typescript
import { apiClient } from '@/lib/api/client';

// GET
const data = await apiClient.get<ConversationsListResponse>('/interaction/conversations?userId=xxx');

// POST
const response = await apiClient.post<ChatResponseDto>('/interaction/query', { query: 'hello' });

// DELETE (handles 204 No Content)
await apiClient.delete<void>('/interaction/conversations/uuid');
```

### Token Management

Tokens are retrieved client-side from a NextAuth API route:

```typescript
async function getAccessToken(timeout = 5000, signal?: AbortSignal): Promise<string | null> {
  const response = await fetch('/api/auth/token', { signal });
  if (!response.ok) return null;
  const data = await response.json();
  return data.accessToken;
}
```

If the token fetch fails, the request proceeds **without** an Authorization header (for public endpoints or graceful degradation).

### Timeout & Cancellation

- Default timeout: **30 seconds** per request
- Token fetch timeout: **5 seconds**
- External `AbortSignal` support: Pass `signal` via `options` to cancel from components
- On timeout: throws `APIError('Request timeout', 408)`

## Chat API (`chat.api.ts`)

### Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `sendMessage(dto)` | `POST /interaction/query` | Send message to RAG assistant |
| `getConversations(userId, opts?)` | `GET /interaction/conversations` | List user conversations |
| `getConversation(id, userId)` | `GET /interaction/conversations/:id` | Get conversation with messages |
| `deleteConversation(id, userId)` | `DELETE /interaction/conversations/:id` | Soft-delete conversation |

### Types

```typescript
// Request
interface ChatQueryDto {
  userId: string;
  conversationId?: string;
  sectorId: string;
  query: string;
}

// Response
interface ChatResponseDto {
  response: string;          // Assistant's answer
  conversationId: string;    // New or existing conversation ID
  sources: SourceFragment[]; // RAG source citations
  timestamp: string | Date;
}

// Source citation
interface SourceFragment {
  id: string;
  content: string;
  similarity: number;       // 0-1 relevance score
  sourceId: string;
  metadata?: Record<string, unknown>;
}
```

### Query Keys (TanStack Query)

```typescript
export const chatKeys = {
  all: ['chat'] as const,
  conversations: (userId: string) => ['chat', 'conversations', userId] as const,
  conversation: (id: string) => ['chat', 'conversation', id] as const,
  messages: (conversationId: string) => ['chat', 'messages', conversationId] as const,
};
```

## User API (`user.api.ts`)

### Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `syncUser(dto)` | `POST /users/sync` | Sync Auth0 user with backend |

### Types

```typescript
interface SyncUserDto {
  auth0UserId: string;  // "auth0|123456"
  email: string;
  name: string;
}

interface UserResponseDto {
  id: string;           // Internal UUID
  auth0UserId: string;
  email: string;
  name: string;
  isActive: boolean;
  createdAt: string;
  lastLoginAt: string | null;
}
```

**Note:** User sync is primarily called from the NextAuth JWT callback (`src/auth.ts`) using `INTERNAL_API_KEY`, not from the client-side API client.

## Error Handling (`error-handler.ts`)

### APIError Class

```typescript
class APIError extends Error {
  constructor(
    message: string,
    public status: number,   // HTTP status code (0 = network error)
    public data?: unknown,   // Raw error response from server
  ) { }
}
```

### Error Categorization

| Error Type | HTTP Status | User Message |
|------------|-------------|-------------|
| `NETWORK` | 0 | "Unable to connect to the server..." |
| `AUTH` | 401, 403 | "Authentication failed. Please sign in again." |
| `VALIDATION` | 400, 422 | Original error message or "Invalid input..." |
| `TIMEOUT` | 408 | "Request timed out. Please try again." |
| `SERVER` | 500+ | "Server error. Please try again later." |
| `UNKNOWN` | Other | "An unexpected error occurred." |

### Usage in Components

```typescript
import { getErrorMessage, logError } from '@/lib/api/error-handler';

try {
  const response = await chatApi.sendMessage(dto);
} catch (err) {
  logError(err, { context: 'ChatContainer.handleSendMessage' });
  setError(getErrorMessage(err));
}
```

### Utility Functions

| Function | Purpose |
|----------|---------|
| `categorizeError(error)` | Returns `ErrorType` enum based on status code |
| `getErrorMessage(error)` | Returns user-friendly string message |
| `isApiError(error)` | Type guard for `APIError` |
| `logError(error, context?)` | Logs to console in dev, Sentry in production |

## Backend API Base URL

The base URL is configured via `NEXT_PUBLIC_API_URL`:

| Environment | URL |
|-------------|-----|
| Development | `http://localhost:3001/api/v1` |
| Docker | Set via `NEXT_PUBLIC_API_URL` env var (runtime injected) |
| Production | `https://api.your-domain.com/v1` |

## Adding a New API Module

1. Create `src/lib/api/feature.api.ts`:

```typescript
import { apiClient } from './client';

export interface FeatureDto { /* ... */ }

export const featureKeys = {
  all: ['features'] as const,
  detail: (id: string) => ['features', id] as const,
};

export const featureApi = {
  getAll: () => apiClient.get<FeatureDto[]>('/features'),
  getById: (id: string) => apiClient.get<FeatureDto>(`/features/${id}`),
  create: (data: CreateFeatureDto) => apiClient.post<FeatureDto>('/features', data),
};
```

2. Create tests in `src/lib/api/__tests__/feature.api.test.ts`
3. Use in components via TanStack Query or direct calls

