# Docker Deployment — Context.ai Frontend

## Overview

The frontend uses a **multi-stage Dockerfile** optimized for production. The final image is based on `node:22-alpine` with Next.js **standalone output**, resulting in an image size of approximately 150–250 MB.

A key feature is **runtime environment injection**: the same Docker image can be deployed to any environment (dev, staging, production) without rebuilding, thanks to a placeholder replacement strategy for `NEXT_PUBLIC_*` variables.

## Dockerfile Stages

```
┌─────────────────────────────────────────┐
│  Stage 1: base                          │
│  node:22-alpine + pnpm                  │
├─────────────────────────────────────────┤
│  Stage 2: deps                          │
│  pnpm install --frozen-lockfile         │
├─────────────────────────────────────────┤
│  Stage 3: builder                       │
│  Copy deps + source → pnpm build        │
│  NEXT_PUBLIC_API_URL = placeholder      │
├─────────────────────────────────────────┤
│  Stage 4: runner                        │
│  node:22-alpine (clean)                 │
│  Copy standalone + static + entrypoint  │
│  Non-root user (nextjs:1001)            │
│  HEALTHCHECK + ENTRYPOINT               │
└─────────────────────────────────────────┘
```

### Stage Details

| Stage | Purpose | Key Actions |
|-------|---------|-------------|
| `base` | Shared Node.js base | Enable pnpm, disable telemetry |
| `deps` | Install dependencies | `pnpm install --frozen-lockfile` |
| `builder` | Build application | Copy source, set build-time env vars, `pnpm build` |
| `runner` | Production server | Alpine + standalone output, non-root user, health check |

## Build-Time vs Runtime Variables

| Variable | Build Time | Runtime | Strategy |
|----------|-----------|---------|----------|
| `AUTH_SECRET` | Placeholder | Real value via `-e` | Server-only, not in bundle |
| `AUTH0_CLIENT_ID` | Placeholder | Real value via `-e` | Server-only, not in bundle |
| `AUTH0_CLIENT_SECRET` | Placeholder | Real value via `-e` | Server-only, not in bundle |
| `AUTH0_ISSUER` | `https://build.auth0.com` | Real value via `-e` | Server-only |
| `NEXT_PUBLIC_API_URL` | `__NEXT_PUBLIC_API_URL_PLACEHOLDER__` | Replaced by entrypoint | Client-side, in JS bundle |

### How Runtime Injection Works

1. **Build time**: `NEXT_PUBLIC_API_URL` is set to `__NEXT_PUBLIC_API_URL_PLACEHOLDER__` and baked into the JS bundles
2. **Container startup**: `docker-entrypoint.sh` runs before `node server.js`:
   ```bash
   find /app/.next -type f \( -name '*.js' -o -name '*.json' \) -exec \
     sed -i "s|__NEXT_PUBLIC_API_URL_PLACEHOLDER__|${NEXT_PUBLIC_API_URL}|g" {} +
   ```
3. **Result**: The client-side code uses the real API URL without rebuilding

## Entrypoint Script

`scripts/docker-entrypoint.sh` performs three tasks:

### 1. Validate Required Variables

```bash
check_var AUTH0_CLIENT_ID       "Auth0 application client ID"
check_var AUTH0_CLIENT_SECRET   "Auth0 application client secret"
check_var AUTH0_ISSUER          "Auth0 issuer URL"
check_var AUTH_SECRET           "NextAuth.js session encryption secret"
check_var INTERNAL_API_KEY      "Internal API key for backend user sync"
check_var NEXT_PUBLIC_API_URL   "Public API base URL"
```

If any required variable is missing, the container exits with error code 1.

### 2. Inject NEXT_PUBLIC_* Variables

Replaces placeholders in all `.js` and `.json` files under `.next/`.

### 3. Start Server

```bash
exec node server.js
```

## Building the Image

```bash
# Build
docker build -t context-ai-front .

# Build with custom tag
docker build -t context-ai-front:v1.0.0 .
```

## Running the Container

### Development

```bash
docker run -p 3000:3000 \
  -e AUTH0_CLIENT_ID=your-client-id \
  -e AUTH0_CLIENT_SECRET=your-client-secret \
  -e AUTH0_ISSUER=https://your-tenant.auth0.com \
  -e AUTH0_AUDIENCE=http://localhost:3001 \
  -e AUTH_SECRET=$(openssl rand -hex 32) \
  -e INTERNAL_API_KEY=your-api-key \
  -e NEXT_PUBLIC_API_URL=http://localhost:3001/api/v1 \
  context-ai-front
```

### Docker Compose Example

```yaml
version: '3.8'

services:
  frontend:
    build: ./context-ai-front
    ports:
      - '3000:3000'
    environment:
      - AUTH0_CLIENT_ID=${AUTH0_CLIENT_ID}
      - AUTH0_CLIENT_SECRET=${AUTH0_CLIENT_SECRET}
      - AUTH0_ISSUER=${AUTH0_ISSUER}
      - AUTH0_AUDIENCE=${AUTH0_AUDIENCE}
      - AUTH_SECRET=${AUTH_SECRET}
      - INTERNAL_API_KEY=${INTERNAL_API_KEY}
      - NEXT_PUBLIC_API_URL=http://backend:3001/api/v1
    depends_on:
      - backend
    healthcheck:
      test: ['CMD', 'node', '-e', "require('http').get('http://127.0.0.1:3000/', r => process.exit(r.statusCode < 400 ? 0 : 1)).on('error', () => process.exit(1))"]
      interval: 30s
      timeout: 5s
      start_period: 10s
      retries: 3

  backend:
    build: ./context-ai-api
    ports:
      - '3001:3001'
    # ... backend configuration
```

## Health Check

The Dockerfile includes a built-in health check:

```dockerfile
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD node -e "require('http').get('http://127.0.0.1:3000/', r => \
    process.exit(r.statusCode < 400 ? 0 : 1)).on('error', () => process.exit(1))"
```

| Parameter | Value |
|-----------|-------|
| Interval | 30 seconds |
| Timeout | 5 seconds |
| Start period | 10 seconds |
| Retries | 3 |

## Security

| Measure | Implementation |
|---------|---------------|
| Non-root user | `nextjs:nodejs` (UID 1001, GID 1001) |
| Minimal image | Alpine-based, standalone output only |
| No dev dependencies | Only production build artifacts copied |
| Environment validation | Entrypoint checks required vars before starting |
| No secrets in image | All secrets passed at runtime via environment |

## Troubleshooting

| Symptom | Cause | Fix |
|---------|-------|-----|
| Container exits immediately | Missing required env var | Check entrypoint output for `❌ Missing required environment variables` |
| API calls still go to placeholder | Entrypoint didn't run | Ensure `ENTRYPOINT` is not overridden, and `NEXT_PUBLIC_API_URL` is set |
| Permission denied on startup | Wrong file permissions | Ensure `docker-entrypoint.sh` has execute permission (`chmod +x`) |
| Health check failing | App not ready within start period | Increase `start_period` or check for startup errors |

