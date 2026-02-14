# Environment Variables — Context.ai Frontend

## Overview

Environment variables are managed through `src/lib/env-config.ts`, which provides:

- **Type-safe access** via `getServerEnv()` and `getPublicEnv()` functions
- **Runtime validation** on server startup via `instrumentation.ts`
- **Docker runtime injection** for `NEXT_PUBLIC_*` variables using placeholder replacement

## Variable Reference

### Authentication (Auth0 + NextAuth.js)

| Variable | Required | Side | Description |
|----------|----------|------|-------------|
| `AUTH0_CLIENT_ID` | ✅ | Server | Auth0 application client ID |
| `AUTH0_CLIENT_SECRET` | ✅ | Server | Auth0 application client secret |
| `AUTH0_ISSUER` | ✅ | Server | Auth0 issuer URL (e.g. `https://your-tenant.auth0.com`). Must start with `https://` |
| `AUTH0_AUDIENCE` | ❌ | Server | Auth0 API audience identifier (e.g. `http://localhost:3001`) |
| `AUTH_SECRET` | ✅ | Server | NextAuth.js session encryption secret. Generate with `openssl rand -hex 32` |
| `AUTH0_SECRET` | ❌ | Server | Legacy Auth0 secret (used by `auth0.config.ts`) |
| `AUTH0_BASE_URL` | ❌ | Server | Application base URL (e.g. `http://localhost:3000`) |
| `AUTH0_ISSUER_BASE_URL` | ❌ | Server | Auth0 issuer base URL (legacy config) |
| `NEXTAUTH_URL` | ❌ | Server | NextAuth.js base URL. Automatically inferred in most deployments |

### API Configuration

| Variable | Required | Side | Description |
|----------|----------|------|-------------|
| `NEXT_PUBLIC_API_URL` | ✅ | Client | Backend API base URL (e.g. `http://localhost:3001/api/v1`). Must start with `http://` or `https://` |
| `INTERNAL_API_KEY` | ✅ | Server | API key for backend-to-backend calls (user sync on login) |

### Monitoring

| Variable | Required | Side | Description |
|----------|----------|------|-------------|
| `NEXT_PUBLIC_SENTRY_DSN` | ❌ | Client | Sentry Data Source Name for error tracking |
| `SENTRY_AUTH_TOKEN` | ❌ | Server | Sentry authentication token for source maps upload |

### System

| Variable | Required | Side | Description |
|----------|----------|------|-------------|
| `NODE_ENV` | ❌ | Server | Environment mode (`development`, `production`, `test`). Defaults to `development` |

## Setup

### 1. Copy the example file

```bash
cp env.local.example .env.local
```

### 2. Fill in your values

```env
# Auth0 Configuration
AUTH0_CLIENT_ID='your-auth0-client-id'
AUTH0_CLIENT_SECRET='your-auth0-client-secret'
AUTH0_ISSUER='https://your-tenant.auth0.com'
AUTH0_AUDIENCE='http://localhost:3001'
AUTH_SECRET='generate-with-openssl-rand-hex-32'

# API Configuration
NEXT_PUBLIC_API_URL='http://localhost:3001/api/v1'
INTERNAL_API_KEY='your-internal-api-key'

# Sentry (Optional)
NEXT_PUBLIC_SENTRY_DSN=''
SENTRY_AUTH_TOKEN=''
```

### 3. Generate AUTH_SECRET

```bash
openssl rand -hex 32
```

## How It Works

### Server-Side Variables

Server-side variables are accessed via `getServerEnv()`:

```typescript
import { getServerEnv } from '@/lib/env-config';

const clientId = getServerEnv('AUTH0_CLIENT_ID');
const nodeEnv = getServerEnv('NODE_ENV', { required: false, fallback: 'development' });
```

- Read from `process.env` at **runtime** (works in Docker)
- Throws an error if `required: true` (default) and value is missing
- Supports optional `fallback` values

### Client-Side Variables (`NEXT_PUBLIC_*`)

Client-side variables are accessed via `getPublicEnv()`:

```typescript
import { getPublicEnv } from '@/lib/env-config';

const apiUrl = getPublicEnv('NEXT_PUBLIC_API_URL');
// Returns 'http://localhost:3001/api/v1' as default if not set
```

- **Build time**: Next.js inlines `NEXT_PUBLIC_*` values into the client bundle
- **Docker runtime**: The entrypoint script replaces the placeholder `__NEXT_PUBLIC_API_URL_PLACEHOLDER__` with the real value
- **Fallback**: If the placeholder is still present (entrypoint didn't run), defaults to `http://localhost:3001/api/v1`

### Validation on Startup

Environment validation runs **once** when the server starts, via `instrumentation.ts`:

```typescript
// src/instrumentation.ts
export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const { validateEnvironment } = await import('@/lib/env-config');
    validateEnvironment();
  }
}
```

**Behavior by environment:**

| Environment | Missing Required Variable |
|-------------|--------------------------|
| `development` | ⚠️ Warning logged (app continues) |
| `production` | ❌ Throws error (app won't start) |
| `test` | ⏭️ Validation skipped entirely |

### Validated Rules

| Variable | Pattern | Description |
|----------|---------|-------------|
| `AUTH0_CLIENT_ID` | — | Must be present |
| `AUTH0_CLIENT_SECRET` | — | Must be present |
| `AUTH0_ISSUER` | `/^https:\/\/.+/` | Must be a valid HTTPS URL |
| `AUTH_SECRET` | — | Must be present |
| `INTERNAL_API_KEY` | — | Must be present |
| `NEXT_PUBLIC_API_URL` | `/^https?:\/\/.+/` | Must be a valid HTTP(S) URL |

## Docker Runtime Injection

In Docker deployments, `NEXT_PUBLIC_API_URL` uses a placeholder strategy:

1. **Build time**: `NEXT_PUBLIC_API_URL=__NEXT_PUBLIC_API_URL_PLACEHOLDER__` is baked into the JS bundle
2. **Container startup**: `scripts/docker-entrypoint.sh` runs `sed` to replace the placeholder with the real value from the environment
3. **Result**: The same Docker image can serve different environments (dev, staging, production) without rebuilding

```bash
# Example: Running with different API URLs
docker run -e NEXT_PUBLIC_API_URL=https://api.staging.example.com/v1 context-ai-front
docker run -e NEXT_PUBLIC_API_URL=https://api.production.example.com/v1 context-ai-front
```

## Troubleshooting

| Symptom | Cause | Fix |
|---------|-------|-----|
| `Missing required server environment variable: X` | Variable not set | Add to `.env.local` |
| API calls go to `localhost:3001` in production | `NEXT_PUBLIC_API_URL` not set or entrypoint didn't run | Set env var and ensure Docker entrypoint runs |
| `[NextAuth] INTERNAL_API_KEY is not configured` | `INTERNAL_API_KEY` missing | Add to `.env.local` |
| Auth fails with `AUTH0_ISSUER` error | Invalid format (must be HTTPS URL) | Use format `https://tenant.auth0.com` |

