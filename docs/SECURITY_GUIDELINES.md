# Security Guidelines — Context.ai Frontend

## Overview

The frontend follows a defense-in-depth approach aligned with OWASP guidelines. Security is enforced through authentication, input validation, secure token handling, HTTP headers, and code quality tools.

## Authentication Security

### Token Storage

| ✅ Do | ❌ Don't |
|-------|---------|
| Store tokens in server-side JWT session (NextAuth) | Store tokens in `localStorage` |
| Use HTTP-only cookies for session | Store tokens in `sessionStorage` |
| Access tokens via `useSession()` or server `auth()` | Expose tokens in client-side JavaScript |

### Token Flow

```
Auth0 → access_token → NextAuth JWT callback → encrypted session cookie
                                                        ↓
Client request → GET /api/auth/token → token from session → Authorization header
```

Tokens never appear in:
- URL parameters
- Client-side storage (localStorage/sessionStorage)
- Console logs (except development warnings)

### Session Configuration

```typescript
// src/auth.ts
session: {
  strategy: 'jwt',  // JWT-based sessions (no database needed)
},
```

## Input Validation

### Client-Side Validation with Zod

All external data is validated before use:

```typescript
import { z } from 'zod';

// Validate backend responses
const userSyncResponseSchema = z.object({
  id: z.string().uuid(),
});

const parsed = userSyncResponseSchema.safeParse(rawData);
if (!parsed.success) {
  console.error('Invalid response:', parsed.error.format());
}
```

### Message Validation in Stores

The chat store validates messages before adding them:

```typescript
addMessage: (message) =>
  set((state) => {
    if (!message || !message.id || !message.role || !message.content) {
      console.warn('Attempted to add invalid message:', message);
      return state; // Don't update state
    }
    return { messages: [...state.messages, message] };
  }),
```

### URL Parameter Encoding

All user-provided values in URLs are encoded:

```typescript
const params = new URLSearchParams({
  userId: encodeURIComponent(userId),
});
```

## Content Security

### Markdown Rendering

The `MarkdownRenderer` component renders user/AI content safely:

- **Links**: All external links open with `target="_blank" rel="noopener noreferrer"` to prevent `window.opener` attacks
- **Code blocks**: Rendered via `react-syntax-highlighter` (no `dangerouslySetInnerHTML`)
- **HTML**: `react-markdown` does not render raw HTML by default — only Markdown syntax

```typescript
// Safe link rendering
a: ({ href, children }) => (
  <a
    href={href}
    target="_blank"
    rel="noopener noreferrer"
  >
    {children}
  </a>
),
```

### No `dangerouslySetInnerHTML`

The codebase does not use `dangerouslySetInnerHTML`. All content is rendered through React's built-in XSS protection or through `react-markdown`.

## HTTP Security Headers

The middleware sets cache-control headers to prevent sensitive data caching:

```typescript
// middleware.ts
response.headers.set('Cache-Control', 'no-store, must-revalidate');
response.headers.set('Pragma', 'no-cache');
response.headers.set('Expires', '0');
```

## Environment Variable Security

### Server-Only Variables

Sensitive variables (`AUTH0_CLIENT_SECRET`, `INTERNAL_API_KEY`, `AUTH_SECRET`) are:

- Only accessible server-side via `process.env`
- Never prefixed with `NEXT_PUBLIC_` (which would expose them to the client)
- Validated on server startup via `validateEnvironment()`

### Build-Time Safety

Docker builds use **placeholder values** for server secrets:

```dockerfile
ARG AUTH_SECRET=build-placeholder
ARG AUTH0_CLIENT_SECRET=build-placeholder
```

Real values are injected at **runtime** via environment variables, never baked into the image.

## API Security

### Internal API Key

Backend-to-backend calls (user sync) use a dedicated API key:

```typescript
headers: {
  'Content-Type': 'application/json',
  'X-Internal-API-Key': process.env.INTERNAL_API_KEY,
},
```

This key is:
- Server-only (not in client bundle)
- Validated as required on startup
- Different from Auth0 tokens

### Error Information Disclosure

The error handler provides user-friendly messages without leaking internal details:

```typescript
// User sees: "Server error. Please try again later."
// Not: "TypeError: Cannot read property 'id' of undefined at line 42"
```

Development mode shows additional error details in the `ErrorBoundary` component (`process.env.NODE_ENV === 'development'`).

## Dependency Security

### Automated Auditing

```bash
# Manual audit
pnpm audit

# Pre-push hook (automatic)
pnpm audit --audit-level=high
```

### Snyk Integration

The CI pipeline includes Snyk security scanning for known vulnerabilities in dependencies.

## Code Quality Security

### ESLint Rules

| Rule | Purpose |
|------|---------|
| `sonarjs/cognitive-complexity: 15` | Prevents overly complex code that's harder to audit |
| `@typescript-eslint/no-explicit-any: warn` | Discourages `any` type which bypasses type safety |
| `jsx-a11y/*` | Prevents common accessibility issues |

### Pre-Commit Hooks

All code changes go through:

1. **ESLint** — Catches security-related patterns
2. **Prettier** — Consistent formatting reduces diff noise
3. **TypeScript** — Type checking catches potential runtime errors

### Pre-Push Hooks

```bash
pnpm type-check           # TypeScript compilation
pnpm lint                  # Full ESLint check
pnpm audit --audit-level=high  # Dependency vulnerabilities
```

## E2E Test Auth Bypass

For Playwright E2E tests, authentication is bypassed via `E2E_BYPASS_AUTH=true`. This flag:

- Is **only** checked in non-production code (`src/lib/test-auth.ts`)
- Is set in the Playwright config's `webServer.command`
- Should **never** be set in production deployments

## Security Checklist

- [ ] No tokens in `localStorage` or `sessionStorage`
- [ ] All user input validated with Zod
- [ ] External links use `rel="noopener noreferrer"`
- [ ] No `dangerouslySetInnerHTML` usage
- [ ] Server secrets not prefixed with `NEXT_PUBLIC_`
- [ ] `pnpm audit` passes with no high/critical vulnerabilities
- [ ] Error messages don't leak internal details
- [ ] URL parameters are encoded
- [ ] E2E_BYPASS_AUTH is not set in production

