import { describe, it, expect, beforeEach, afterAll, vi } from 'vitest';

/**
 * Helper to set NODE_ENV in tests.
 * process.env.NODE_ENV is typed as readonly in TypeScript,
 * so we use Object.defineProperty to override it safely in tests.
 */
function setNodeEnv(value: string): void {
  Object.defineProperty(process.env, 'NODE_ENV', {
    value,
    writable: true,
    configurable: true,
  });
}

describe('test-auth', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.resetModules();
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it('should return false for isE2ETestMode when E2E_BYPASS_AUTH is not set', async () => {
    delete process.env.E2E_BYPASS_AUTH;
    const { isE2ETestMode } = await import('../test-auth');
    expect(isE2ETestMode()).toBe(false);
  });

  it('should return true for isE2ETestMode when E2E_BYPASS_AUTH is "true"', async () => {
    process.env.E2E_BYPASS_AUTH = 'true';
    setNodeEnv('test');
    const { isE2ETestMode } = await import('../test-auth');
    expect(isE2ETestMode()).toBe(true);
  });

  it('should return a valid mock session from getMockE2ESession', async () => {
    // getMockE2ESession returns a static mock session regardless of env state
    const { getMockE2ESession } = await import('../test-auth');
    const session = getMockE2ESession();

    expect(session).toBeDefined();
    expect(session.user).toBeDefined();
    expect(session.user.id).toBe('e2e-test-user-id');
    expect(session.user.name).toBe('E2E Test User');
    expect(session.user.email).toBe('e2e-test@example.com');
    expect(session.user.image).toBe('https://example.com/avatar.jpg');
    expect(session.accessToken).toBe('e2e-test-access-token');
    expect(session.expires).toBeDefined();
  });

  it('should throw error when E2E bypass is enabled in production', async () => {
    process.env.E2E_BYPASS_AUTH = 'true';
    setNodeEnv('production');

    await expect(async () => {
      await import('../test-auth');
    }).rejects.toThrow('SECURITY ERROR: E2E_BYPASS_AUTH should never be enabled in production');
  });
});
