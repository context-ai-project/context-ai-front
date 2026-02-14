import { syncUserWithBackend, extractProfileData } from '../sync-user';

// Silence console in tests
vi.spyOn(console, 'warn').mockImplementation(() => {});
const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

// We mock fetch per-test to avoid pollution
const originalFetch = global.fetch;

describe('syncUserWithBackend', () => {
  const validProfile = {
    sub: 'auth0|123456',
    email: 'test@example.com',
    name: 'Test User',
  };

  let savedApiKey: string | undefined;
  let savedApiUrl: string | undefined;

  beforeEach(() => {
    vi.clearAllMocks();
    savedApiKey = process.env.INTERNAL_API_KEY;
    savedApiUrl = process.env.NEXT_PUBLIC_API_URL;
    process.env.NEXT_PUBLIC_API_URL = 'http://localhost:3001/api/v1';
    process.env.INTERNAL_API_KEY = 'test-api-key';
  });

  afterEach(() => {
    global.fetch = originalFetch;
    if (savedApiKey !== undefined) {
      process.env.INTERNAL_API_KEY = savedApiKey;
    } else {
      delete process.env.INTERNAL_API_KEY;
    }
    if (savedApiUrl !== undefined) {
      process.env.NEXT_PUBLIC_API_URL = savedApiUrl;
    } else {
      delete process.env.NEXT_PUBLIC_API_URL;
    }
  });

  it('should return null if sub is missing', async () => {
    const result = await syncUserWithBackend({ sub: null, email: 'e@e.com', name: 'N' });
    expect(result).toBeNull();
  });

  it('should return null if email is missing', async () => {
    const result = await syncUserWithBackend({ sub: 'auth0|1', email: null, name: 'N' });
    expect(result).toBeNull();
  });

  it('should return null if name is missing', async () => {
    const result = await syncUserWithBackend({ sub: 'auth0|1', email: 'e@e.com', name: null });
    expect(result).toBeNull();
  });

  it('should return null if INTERNAL_API_KEY is not configured', async () => {
    delete process.env.INTERNAL_API_KEY;

    const result = await syncUserWithBackend(validProfile);

    expect(result).toBeNull();
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      expect.stringContaining('INTERNAL_API_KEY is not configured'),
    );
  });

  it('should sync user and return id and roles on success', async () => {
    const mockId = '550e8400-e29b-41d4-a716-446655440000';
    const mockResponse = { id: mockId, roles: ['admin'] };

    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockResponse),
    });

    const result = await syncUserWithBackend(validProfile);

    expect(result).toEqual({ id: mockId, roles: ['admin'] });
    expect(global.fetch).toHaveBeenCalledWith(
      'http://localhost:3001/api/v1/users/sync',
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          'X-Internal-API-Key': 'test-api-key',
        }),
      }),
    );
  });

  it('should return roles as empty array when not present in response', async () => {
    const mockId = '660e8400-e29b-41d4-a716-446655440001';
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ id: mockId }),
    });

    const result = await syncUserWithBackend(validProfile);

    expect(result).toEqual({ id: mockId, roles: [] });
  });

  it('should return null on invalid response format', async () => {
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ notAnId: 'bad' }),
    });

    const result = await syncUserWithBackend(validProfile);

    expect(result).toBeNull();
  });

  it('should return null on non-ok response', async () => {
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: false,
      status: 500,
      statusText: 'Internal Server Error',
      text: () => Promise.resolve('Server error'),
    });

    const result = await syncUserWithBackend(validProfile);

    expect(result).toBeNull();
  });

  it('should return null on fetch error', async () => {
    global.fetch = vi.fn().mockRejectedValueOnce(new Error('Network error'));

    const result = await syncUserWithBackend(validProfile);

    expect(result).toBeNull();
  });
});

describe('extractProfileData', () => {
  it('should extract profile data with all fields', () => {
    const result = extractProfileData({
      picture: 'https://example.com/pic.jpg',
      sub: 'auth0|123',
      email: 'test@example.com',
      name: 'Test User',
    });

    expect(result).toEqual({
      picture: 'https://example.com/pic.jpg',
      sub: 'auth0|123',
      email: 'test@example.com',
      name: 'Test User',
    });
  });

  it('should handle null fields', () => {
    const result = extractProfileData({
      sub: null,
      email: null,
      name: null,
    });

    expect(result).toEqual({
      picture: undefined,
      sub: undefined,
      email: undefined,
      name: undefined,
    });
  });

  it('should handle missing optional fields', () => {
    const result = extractProfileData({});

    expect(result).toEqual({
      picture: undefined,
      sub: undefined,
      email: undefined,
      name: undefined,
    });
  });
});
