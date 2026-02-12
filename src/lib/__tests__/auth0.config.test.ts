import { describe, it, expect, beforeEach, vi } from 'vitest';

describe('auth0Config', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.resetModules();
    process.env = {
      ...originalEnv,
      AUTH0_SECRET: 'test-secret',
      AUTH0_BASE_URL: 'http://localhost:3000',
      AUTH0_ISSUER_BASE_URL: 'https://test.auth0.com',
      AUTH0_CLIENT_ID: 'test-client-id',
      AUTH0_CLIENT_SECRET: 'test-client-secret',
      AUTH0_AUDIENCE: 'https://api.test.com',
    };
  });

  it('should export auth0 config with correct values from environment', async () => {
    const { auth0Config } = await import('../auth0.config');

    expect(auth0Config).toBeDefined();
    expect(auth0Config.secret).toBe('test-secret');
    expect(auth0Config.baseURL).toBe('http://localhost:3000');
    expect(auth0Config.issuerBaseURL).toBe('https://test.auth0.com');
    expect(auth0Config.clientID).toBe('test-client-id');
    expect(auth0Config.clientSecret).toBe('test-client-secret');
    expect(auth0Config.audience).toBe('https://api.test.com');
    expect(auth0Config.scope).toBe('openid profile email');
  });
});
