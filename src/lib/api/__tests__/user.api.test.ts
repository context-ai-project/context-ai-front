import { userApi, type SyncUserDto, type UserResponseDto } from '../user.api';
import { apiClient } from '../client';

// Mock the API client
vi.mock('../client', () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
  APIError: class APIError extends Error {
    constructor(
      message: string,
      public status: number,
      public data?: unknown,
    ) {
      super(message);
      this.name = 'APIError';
    }
  },
}));

const mockPost = vi.mocked(apiClient.post);

describe('User API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('syncUser', () => {
    it('should sync user with backend and return user data', async () => {
      const syncDto: SyncUserDto = {
        auth0UserId: 'auth0|abc123',
        email: 'test@example.com',
        name: 'Test User',
      };

      const mockResponse: UserResponseDto = {
        id: 'uuid-internal-123',
        auth0UserId: 'auth0|abc123',
        email: 'test@example.com',
        name: 'Test User',
        isActive: true,
        createdAt: '2026-01-15T10:00:00Z',
        lastLoginAt: '2026-01-15T10:30:00Z',
      };

      mockPost.mockResolvedValueOnce(mockResponse);

      const result = await userApi.syncUser(syncDto);

      expect(mockPost).toHaveBeenCalledWith('/users/sync', syncDto);
      expect(result).toEqual(mockResponse);
      expect(result.id).toBe('uuid-internal-123');
    });

    it('should handle new user creation (lastLoginAt is null)', async () => {
      const syncDto: SyncUserDto = {
        auth0UserId: 'auth0|new-user',
        email: 'new@example.com',
        name: 'New User',
      };

      const mockResponse: UserResponseDto = {
        id: 'uuid-new-123',
        auth0UserId: 'auth0|new-user',
        email: 'new@example.com',
        name: 'New User',
        isActive: true,
        createdAt: '2026-02-11T14:00:00Z',
        lastLoginAt: null,
      };

      mockPost.mockResolvedValueOnce(mockResponse);

      const result = await userApi.syncUser(syncDto);

      expect(result.lastLoginAt).toBeNull();
      expect(result.isActive).toBe(true);
    });

    it('should propagate API errors', async () => {
      const syncDto: SyncUserDto = {
        auth0UserId: 'auth0|error',
        email: 'error@example.com',
        name: 'Error User',
      };

      mockPost.mockRejectedValueOnce(new Error('Server error'));

      await expect(userApi.syncUser(syncDto)).rejects.toThrow('Server error');
    });
  });
});
