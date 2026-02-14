#!/bin/sh
# ============================================
# Context.ai Frontend — Docker Entrypoint
# ============================================
# This script runs at container startup (before `node server.js`).
#
# 1. Validates that required environment variables are present.
# 2. Replaces the NEXT_PUBLIC_* build-time placeholders in the
#    generated JS bundles with the real runtime values so the same
#    Docker image can be deployed to any environment.
# 3. Starts the Next.js standalone server.
# ============================================

set -e

# ---- Colour helpers (ANSI, works in most terminals) ----
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Colour

echo "${GREEN}🚀 Context.ai Frontend — Starting up...${NC}"

# ---- 1. Validate required environment variables ----
MISSING=""

check_var() {
  eval val=\$$1
  if [ -z "$val" ]; then
    MISSING="${MISSING}\n  ✗ $1 — $2"
  fi
}

check_var AUTH0_CLIENT_ID       "Auth0 application client ID"
check_var AUTH0_CLIENT_SECRET   "Auth0 application client secret"
check_var AUTH0_ISSUER          "Auth0 issuer URL (https://tenant.auth0.com)"
check_var AUTH_SECRET           "NextAuth.js session encryption secret"
check_var INTERNAL_API_KEY      "Internal API key for backend user sync"
check_var NEXT_PUBLIC_API_URL   "Public API base URL (https://api.host/v1)"

if [ -n "$MISSING" ]; then
  echo "${RED}❌ Missing required environment variables:${NC}${MISSING}"
  echo ""
  echo "${YELLOW}💡 Provide them via docker-compose environment or docker run -e flags.${NC}"
  echo "${YELLOW}   See .env.example for the full list.${NC}"
  exit 1
fi

echo "${GREEN}  ✓ All required environment variables present${NC}"

# ---- 2. Runtime injection of NEXT_PUBLIC_* variables ----
# Next.js inlines NEXT_PUBLIC_* at build time. When we build the Docker image
# we use a known placeholder string. Here we replace it with the real value
# so the same image works across dev / staging / production.

PLACEHOLDER="__NEXT_PUBLIC_API_URL_PLACEHOLDER__"
REPLACEMENT="${NEXT_PUBLIC_API_URL}"

if [ -n "$REPLACEMENT" ]; then
  echo "${GREEN}  ✓ Injecting NEXT_PUBLIC_API_URL=${REPLACEMENT}${NC}"

  # Replace in all JS and JSON files within the .next directory
  find /app/.next -type f \( -name '*.js' -o -name '*.json' \) -exec \
    sed -i "s|${PLACEHOLDER}|${REPLACEMENT}|g" {} + 2>/dev/null || true
fi

echo "${GREEN}  ✓ Runtime environment injection complete${NC}"

# ---- 3. Start the server ----
echo "${GREEN}🟢 Starting Next.js server on port ${PORT:-3000}...${NC}"
exec node server.js


