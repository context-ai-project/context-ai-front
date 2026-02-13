# Authentication — Context.ai Frontend

## Overview

The application uses **NextAuth.js v5** (Auth.js) with the **Auth0 provider** for OAuth2/OIDC authentication. Tokens are managed server-side using JWT strategy, and the user is synchronized with the backend on first login.

## Architecture

```
┌─────────────┐     ┌──────────┐     ┌──────────────┐     ┌──────────────┐
│   Browser    │────▶│ NextAuth │────▶│    Auth0     │────▶│   Backend    │
│             │     │  (v5)    │     │  (OAuth2)    │     │  /users/sync │
│  Click      │     │          │     │              │     │              │
│  "Sign In"  │     │ JWT      │     │ access_token │     │ Internal UUID│
│             │◀────│ Session  │◀────│ id_token     │◀────│  returned    │
└─────────────┘     └──────────┘     └──────────────┘     └──────────────┘
```

## Authentication Flow

### 1. Login

```
User clicks "Sign In"
    ↓
Redirect to /api/auth/signin/auth0
    ↓
Auth0 Universal Login page
    ↓
User authenticates (email/password, social, etc.)
    ↓
Auth0 redirects to /api/auth/callback/auth0
    ↓
NextAuth JWT callback fires:
    1. Stores access_token, id_token from Auth0
    2. Stores user profile (sub, email, name, picture)
    3. POST /users/sync to backend (with INTERNAL_API_KEY)
    4. Receives internal UUID from backend
    5. Stores userId in JWT token
    ↓
NextAuth Session callback fires:
    1. Maps token.accessToken → session.accessToken
    2. Maps token.userId → session.user.id
    ↓
User redirected to /[locale]/dashboard
```

### 2. Authenticated API Requests

```
Client component calls apiClient.post('/interaction/query', data)
    ↓
fetchWithInterceptors() in client.ts
    ↓
GET /api/auth/token → extracts accessToken from session
    ↓
Request sent with Authorization: Bearer <token>
    ↓
Backend validates JWT with Auth0 JWKS
```

### 3. Logout

```
User clicks "Sign Out"
    ↓
Confirmation dialog
    ↓
signOut() from next-auth/react
    ↓
Session cleared, redirect to landing page
```

## Configuration

### Source File: `src/auth.ts`

```typescript
export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Auth0Provider({
      clientId: process.env.AUTH0_CLIENT_ID!,
      clientSecret: process.env.AUTH0_CLIENT_SECRET!,
      issuer: process.env.AUTH0_ISSUER!,
      authorization: {
        params: {
          scope: 'openid profile email',
          audience: process.env.AUTH0_AUDIENCE,
        },
      },
    }),
  ],
  session: { strategy: 'jwt' },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },
});
```

### Required Environment Variables

| Variable | Purpose |
|----------|---------|
| `AUTH0_CLIENT_ID` | Auth0 application client ID |
| `AUTH0_CLIENT_SECRET` | Auth0 application client secret |
| `AUTH0_ISSUER` | Auth0 tenant URL (e.g. `https://tenant.auth0.com`) |
| `AUTH0_AUDIENCE` | Auth0 API audience identifier |
| `AUTH_SECRET` | NextAuth.js session encryption secret |
| `INTERNAL_API_KEY` | API key for user sync with backend |

## User Sync with Backend

On first sign-in, the JWT callback synchronizes the Auth0 user with the backend:

```typescript
// Inside jwt callback
const response = await fetch(`${apiUrl}/users/sync`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-Internal-API-Key': process.env.INTERNAL_API_KEY,
  },
  body: JSON.stringify({
    auth0UserId: profile.sub,    // "auth0|123456"
    email: profile.email,
    name: profile.name,
  }),
});

// Response: { id: "internal-uuid-from-backend" }
// Stored as token.userId → session.user.id
```

The backend creates the user if new, or returns the existing internal UUID.

## Route Protection

### Server-Side (Layout Level)

Protected routes are guarded at the layout level in `src/app/[locale]/(protected)/layout.tsx`:

```typescript
export default async function ProtectedLayout({ children, params }) {
  const { locale } = await params;

  if (!isE2ETestMode()) {
    const session = await auth();
    if (!session) {
      redirect(`/${locale}/auth/signin`);
    }
  }

  return (
    <UserStoreProvider>
      <ChatStoreProvider>
        {children}
      </ChatStoreProvider>
    </UserStoreProvider>
  );
}
```

### Client-Side (Session Hook)

Components access session data via `useSession()` from `next-auth/react`:

```typescript
const { data: session, status } = useSession();
// status: 'loading' | 'authenticated' | 'unauthenticated'
// session.user.id → internal UUID
// session.accessToken → Auth0 JWT
```

Or via the custom `useCurrentUser()` hook:

```typescript
const { user, isAuthenticated, isLoading, currentSectorId } = useCurrentUser();
```

## Token Management

| Token | Storage | Lifetime | Purpose |
|-------|---------|----------|---------|
| Auth0 Access Token | JWT (server-side) | Auth0 configured | API authentication |
| Auth0 ID Token | JWT (server-side) | Auth0 configured | User identity |
| NextAuth Session Token | HTTP-only cookie | Session duration | Client session state |
| Internal User ID (UUID) | JWT claim `userId` | Session duration | Backend user identification |

## E2E Test Bypass

For Playwright E2E tests, authentication can be bypassed:

```typescript
// src/lib/test-auth.ts
export function isE2ETestMode(): boolean {
  return process.env.E2E_BYPASS_AUTH === 'true';
}
```

When `E2E_BYPASS_AUTH=true`, the protected layout skips the `auth()` check.

## Auth0 Setup Checklist

1. Create a **Regular Web Application** in [Auth0 Dashboard](https://manage.auth0.com/)
2. Configure **Allowed Callback URLs**: `http://localhost:3000/api/auth/callback/auth0`
3. Configure **Allowed Logout URLs**: `http://localhost:3000`
4. Configure **Allowed Web Origins**: `http://localhost:3000`
5. Create an **API** with the audience identifier matching `AUTH0_AUDIENCE`
6. Copy credentials to `.env.local`

## Custom Pages

| Page | Path | Purpose |
|------|------|---------|
| Sign In | `/[locale]/auth/signin` | Custom sign-in page with Auth0 button |
| Error | `/[locale]/auth/error` | Auth error display page |

## Troubleshooting

| Symptom | Cause | Fix |
|---------|-------|-----|
| Redirect loop on login | Missing `AUTH0_ISSUER` or wrong callback URL | Verify Auth0 configuration matches env vars |
| `Session created without userId` | `INTERNAL_API_KEY` not set or backend unreachable | Check env var and backend availability |
| `Failed to get access token` | Session expired or not authenticated | Re-login; check `AUTH_SECRET` consistency |
| 401 on API calls | Token expired or `AUTH0_AUDIENCE` mismatch | Verify audience matches backend config |

