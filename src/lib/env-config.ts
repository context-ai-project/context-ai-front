/**
 * Environment Configuration — Runtime-safe access to environment variables
 *
 * Server-side variables are read from process.env at runtime (works in Docker).
 * Client-side NEXT_PUBLIC_* variables are inlined at build time by Next.js.
 * For Docker runtime injection, the entrypoint script replaces the build-time
 * placeholder with the real value in the generated JS bundles.
 */

/* ------------------------------------------------------------------ */
/*  Type definitions                                                   */
/* ------------------------------------------------------------------ */

/** Server-side environment variable names */
type ServerEnvKey =
  | 'AUTH0_CLIENT_ID'
  | 'AUTH0_CLIENT_SECRET'
  | 'AUTH0_ISSUER'
  | 'AUTH0_AUDIENCE'
  | 'AUTH_SECRET'
  | 'AUTH0_SECRET'
  | 'AUTH0_BASE_URL'
  | 'AUTH0_ISSUER_BASE_URL'
  | 'INTERNAL_API_KEY'
  | 'NODE_ENV';

/** Client-side (NEXT_PUBLIC_*) environment variable names */
type PublicEnvKey = 'NEXT_PUBLIC_API_URL';

/* ------------------------------------------------------------------ */
/*  Server environment                                                 */
/* ------------------------------------------------------------------ */

/**
 * Read a server-side environment variable at runtime.
 * Throws if the variable is required and missing.
 *
 * @param key     - Environment variable name
 * @param options - `required` defaults to true; set `fallback` for a default
 */
export function getServerEnv(
  key: ServerEnvKey,
  options?: { required?: boolean; fallback?: string },
): string {
  const { required = true, fallback } = options ?? {};
  const value = process.env[key] ?? fallback;

  if (required && !value) {
    throw new Error(
      `[env-config] Missing required server environment variable: ${key}. ` +
        'Check your .env.local or Docker environment configuration.',
    );
  }

  return value ?? '';
}

/* ------------------------------------------------------------------ */
/*  Public / client environment                                        */
/* ------------------------------------------------------------------ */

/**
 * The build-time placeholder used in the Dockerfile.
 * The Docker entrypoint replaces every occurrence of this string
 * in the built JS bundles with the real runtime value.
 */
const RUNTIME_PLACEHOLDER = '__NEXT_PUBLIC_API_URL_PLACEHOLDER__';

/**
 * Read a public (NEXT_PUBLIC_*) environment variable.
 *
 * Works both server-side (process.env) and client-side (inlined at build or
 * replaced at container startup via the entrypoint script).
 */
export function getPublicEnv(key: PublicEnvKey): string {
  // Static map ensures Next.js bundler can inline the values at build time.
  // Dynamic access like process.env[key] would NOT be inlined and would
  // resolve to undefined in client-side code.
  const PUBLIC_ENV_MAP: Record<PublicEnvKey, string | undefined> = {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  };

  const value = PUBLIC_ENV_MAP[key] ?? '';

  // If the value still contains the placeholder, the entrypoint script
  // did not run or the variable was not set — fall back to defaults.
  if (value.includes(RUNTIME_PLACEHOLDER) || value === '') {
    return getPublicEnvDefaults(key);
  }

  return value;
}

/** Sensible defaults for each public key */
function getPublicEnvDefaults(key: PublicEnvKey): string {
  const defaults: Record<PublicEnvKey, string> = {
    NEXT_PUBLIC_API_URL: 'http://localhost:3001/api/v1',
  };
  return defaults[key];
}

/* ------------------------------------------------------------------ */
/*  Validation (server-side only — call from instrumentation.ts)       */
/* ------------------------------------------------------------------ */

interface EnvRule {
  key: string;
  required: boolean;
  pattern?: RegExp;
  description: string;
}

/** Rules applied in production/staging; development is more relaxed */
const SERVER_ENV_RULES: EnvRule[] = [
  {
    key: 'AUTH0_CLIENT_ID',
    required: true,
    description: 'Auth0 application client ID',
  },
  {
    key: 'AUTH0_CLIENT_SECRET',
    required: true,
    description: 'Auth0 application client secret',
  },
  {
    key: 'AUTH0_ISSUER',
    required: true,
    pattern: /^https:\/\/.+/,
    description: 'Auth0 issuer URL (e.g. https://tenant.auth0.com)',
  },
  {
    key: 'AUTH_SECRET',
    required: true,
    description: 'NextAuth.js session encryption secret',
  },
  {
    key: 'INTERNAL_API_KEY',
    required: true,
    description: 'Internal API key for backend-to-backend calls',
  },
  {
    key: 'NEXT_PUBLIC_API_URL',
    required: true,
    pattern: /^https?:\/\/.+/,
    description: 'Public API base URL (e.g. https://api.context-ai.com/v1)',
  },
];

interface ValidationError {
  key: string;
  message: string;
}

/**
 * Validate that all required environment variables are present and well-formed.
 *
 * Call this once during server startup (e.g. in `instrumentation.ts`).
 * In development mode, warnings are logged instead of throwing.
 */
export function validateEnvironment(): void {
  const isDev = process.env.NODE_ENV === 'development';
  const isTest = process.env.NODE_ENV === 'test';

  // Skip validation in test environment
  if (isTest) return;

  const errors: ValidationError[] = [];

  for (const rule of SERVER_ENV_RULES) {
    const value = process.env[rule.key];

    if (rule.required && !value) {
      errors.push({
        key: rule.key,
        message: `Missing required variable: ${rule.description}`,
      });
      continue;
    }

    if (value && rule.pattern && !rule.pattern.test(value)) {
      errors.push({
        key: rule.key,
        message: `Invalid format for ${rule.description}. Expected pattern: ${rule.pattern}`,
      });
    }
  }

  if (errors.length === 0) return;

  const report = errors.map((e) => `  ✗ ${e.key}: ${e.message}`).join('\n');

  if (isDev) {
    console.warn(
      `[env-config] ⚠️  Environment validation warnings (${errors.length}):\n${report}\n` +
        'Some features may not work correctly. See .env.example for reference.',
    );
  } else {
    throw new Error(
      `[env-config] ❌ Environment validation failed (${errors.length} errors):\n${report}\n` +
        'Fix the missing/invalid variables before starting the application.',
    );
  }
}
