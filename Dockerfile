# ============================================
# Context.ai Frontend — Multi-stage Dockerfile
# ============================================
# Optimised for production using Next.js standalone output.
# Final image ≈ 150-250 MB (Alpine + standalone server).
# ============================================

# --------------- Base ---------------
FROM node:22-alpine AS base

RUN corepack enable && corepack prepare pnpm@latest --activate
ENV NEXT_TELEMETRY_DISABLED=1

# --------------- Stage 1: Dependencies ---------------
FROM base AS deps

WORKDIR /app

COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

# --------------- Stage 2: Build ---------------
FROM base AS builder

WORKDIR /app

# Copy dependencies
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build-time environment variables
# These are baked into the client bundle; runtime secrets use NEXT_PUBLIC_* or server-only env
ARG AUTH_SECRET=build-placeholder
ARG AUTH0_CLIENT_ID=build-placeholder
ARG AUTH0_CLIENT_SECRET=build-placeholder
ARG AUTH0_ISSUER=https://build.auth0.com
ARG AUTH0_AUDIENCE=http://localhost:3001
ARG NEXTAUTH_URL=http://localhost:3000

ENV AUTH_SECRET=${AUTH_SECRET}
ENV AUTH0_CLIENT_ID=${AUTH0_CLIENT_ID}
ENV AUTH0_CLIENT_SECRET=${AUTH0_CLIENT_SECRET}
ENV AUTH0_ISSUER=${AUTH0_ISSUER}
ENV AUTH0_AUDIENCE=${AUTH0_AUDIENCE}
ENV NEXTAUTH_URL=${NEXTAUTH_URL}

RUN pnpm build

# --------------- Stage 3: Runner ---------------
FROM node:22-alpine AS runner

LABEL maintainer="Context.ai Team"
LABEL description="Context.ai Frontend — Next.js standalone production server"

WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Create non-root user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copy public assets
COPY --from=builder /app/public ./public

# Copy standalone server + static files (owned by nextjs)
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

# Health check — standalone server serves the app on /
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD node -e "require('http').get('http://127.0.0.1:3000/', r => process.exit(r.statusCode < 400 ? 0 : 1)).on('error', () => process.exit(1))"

CMD ["node", "server.js"]

