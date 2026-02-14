import { getServerEnv, getPublicEnv, validateEnvironment } from '../env-config';

/** Helper: set env var bypassing readonly TS types */
function setEnv(key: string, value: string): void {
  (process.env as Record<string, string | undefined>)[key] = value;
}

/** Helper: delete env var bypassing readonly TS types */
function delEnv(key: string): void {
  delete (process.env as Record<string, string | undefined>)[key];
}

describe('env-config', () => {
  const originalEnv = { ...process.env };

  afterEach(() => {
    // Restore original env vars
    process.env = { ...originalEnv } as NodeJS.ProcessEnv;
  });

  // ─── getServerEnv ──────────────────────────────────────────────
  describe('getServerEnv', () => {
    it('should return the value of an existing env variable', () => {
      setEnv('AUTH0_CLIENT_ID', 'test-client-id');
      expect(getServerEnv('AUTH0_CLIENT_ID')).toBe('test-client-id');
    });

    it('should throw when required variable is missing', () => {
      delEnv('AUTH0_CLIENT_ID');
      expect(() => getServerEnv('AUTH0_CLIENT_ID')).toThrow(
        '[env-config] Missing required server environment variable: AUTH0_CLIENT_ID',
      );
    });

    it('should return fallback when variable is missing and fallback is provided', () => {
      delEnv('AUTH0_CLIENT_ID');
      expect(getServerEnv('AUTH0_CLIENT_ID', { fallback: 'default-value' })).toBe('default-value');
    });

    it('should return empty string when not required and missing with no fallback', () => {
      delEnv('AUTH0_CLIENT_ID');
      expect(getServerEnv('AUTH0_CLIENT_ID', { required: false })).toBe('');
    });

    it('should not throw when required=false and variable is missing', () => {
      delEnv('AUTH0_ISSUER');
      expect(() => getServerEnv('AUTH0_ISSUER', { required: false })).not.toThrow();
    });

    it('should prioritize env value over fallback', () => {
      setEnv('AUTH0_CLIENT_SECRET', 'actual-secret');
      expect(getServerEnv('AUTH0_CLIENT_SECRET', { fallback: 'fallback-secret' })).toBe(
        'actual-secret',
      );
    });

    it('should default required to true when no options provided', () => {
      delEnv('AUTH_SECRET');
      expect(() => getServerEnv('AUTH_SECRET')).toThrow();
    });

    it('should read NODE_ENV', () => {
      setEnv('NODE_ENV', 'production');
      expect(getServerEnv('NODE_ENV')).toBe('production');
    });
  });

  // ─── getPublicEnv ──────────────────────────────────────────────
  describe('getPublicEnv', () => {
    it('should return the value of an existing public env variable', () => {
      setEnv('NEXT_PUBLIC_API_URL', 'https://api.example.com/v1');
      expect(getPublicEnv('NEXT_PUBLIC_API_URL')).toBe('https://api.example.com/v1');
    });

    it('should return default when variable is empty', () => {
      setEnv('NEXT_PUBLIC_API_URL', '');
      expect(getPublicEnv('NEXT_PUBLIC_API_URL')).toBe('http://localhost:3001/api/v1');
    });

    it('should return default when variable is undefined', () => {
      delEnv('NEXT_PUBLIC_API_URL');
      expect(getPublicEnv('NEXT_PUBLIC_API_URL')).toBe('http://localhost:3001/api/v1');
    });

    it('should return default when variable contains the runtime placeholder', () => {
      setEnv('NEXT_PUBLIC_API_URL', '__NEXT_PUBLIC_API_URL_PLACEHOLDER__');
      expect(getPublicEnv('NEXT_PUBLIC_API_URL')).toBe('http://localhost:3001/api/v1');
    });

    it('should return actual value when it does not contain placeholder', () => {
      setEnv('NEXT_PUBLIC_API_URL', 'https://prod-api.com/api/v1');
      expect(getPublicEnv('NEXT_PUBLIC_API_URL')).toBe('https://prod-api.com/api/v1');
    });
  });

  // ─── validateEnvironment ───────────────────────────────────────
  describe('validateEnvironment', () => {
    it('should skip validation in test environment', () => {
      setEnv('NODE_ENV', 'test');
      expect(() => validateEnvironment()).not.toThrow();
    });

    it('should throw in production when required vars are missing', () => {
      setEnv('NODE_ENV', 'production');
      delEnv('AUTH0_CLIENT_ID');
      delEnv('AUTH0_CLIENT_SECRET');
      delEnv('AUTH0_ISSUER');
      delEnv('AUTH_SECRET');
      delEnv('INTERNAL_API_KEY');
      delEnv('NEXT_PUBLIC_API_URL');

      expect(() => validateEnvironment()).toThrow('[env-config] ❌ Environment validation failed');
    });

    it('should warn in development when required vars are missing', () => {
      setEnv('NODE_ENV', 'development');
      delEnv('AUTH0_CLIENT_ID');
      delEnv('AUTH0_CLIENT_SECRET');
      delEnv('AUTH0_ISSUER');
      delEnv('AUTH_SECRET');
      delEnv('INTERNAL_API_KEY');
      delEnv('NEXT_PUBLIC_API_URL');

      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      expect(() => validateEnvironment()).not.toThrow();
      expect(warnSpy).toHaveBeenCalledWith(
        expect.stringContaining('[env-config] ⚠️  Environment validation warnings'),
      );

      warnSpy.mockRestore();
    });

    it('should pass validation when all required vars are set', () => {
      setEnv('NODE_ENV', 'production');
      setEnv('AUTH0_CLIENT_ID', 'client-id');
      setEnv('AUTH0_CLIENT_SECRET', 'client-secret');
      setEnv('AUTH0_ISSUER', 'https://tenant.auth0.com');
      setEnv('AUTH_SECRET', 'session-secret');
      setEnv('INTERNAL_API_KEY', 'internal-key');
      setEnv('NEXT_PUBLIC_API_URL', 'https://api.example.com/v1');

      expect(() => validateEnvironment()).not.toThrow();
    });

    it('should detect invalid format for AUTH0_ISSUER', () => {
      setEnv('NODE_ENV', 'production');
      setEnv('AUTH0_CLIENT_ID', 'client-id');
      setEnv('AUTH0_CLIENT_SECRET', 'client-secret');
      setEnv('AUTH0_ISSUER', 'not-a-url');
      setEnv('AUTH_SECRET', 'session-secret');
      setEnv('INTERNAL_API_KEY', 'internal-key');
      setEnv('NEXT_PUBLIC_API_URL', 'https://api.example.com/v1');

      expect(() => validateEnvironment()).toThrow('Invalid format');
    });

    it('should detect invalid format for NEXT_PUBLIC_API_URL', () => {
      setEnv('NODE_ENV', 'production');
      setEnv('AUTH0_CLIENT_ID', 'client-id');
      setEnv('AUTH0_CLIENT_SECRET', 'client-secret');
      setEnv('AUTH0_ISSUER', 'https://tenant.auth0.com');
      setEnv('AUTH_SECRET', 'session-secret');
      setEnv('INTERNAL_API_KEY', 'internal-key');
      setEnv('NEXT_PUBLIC_API_URL', 'not-a-url');

      expect(() => validateEnvironment()).toThrow('Invalid format');
    });
  });
});
