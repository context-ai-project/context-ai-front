import { adminApi, adminKeys, type AdminUserResponse } from '../admin.api';
import { apiClient } from '../client';

// Mock the API client
vi.mock('../client', () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
}));

const mockGet = vi.mocked(apiClient.get);
const mockPatch = vi.mocked(apiClient.patch);

const mockUser: AdminUserResponse = {
  id: 'user-uuid-1',
  auth0UserId: 'auth0|abc123',
  email: 'admin@example.com',
  name: 'Admin User',
  isActive: true,
  roles: ['admin'],
  sectorIds: ['sector-1'],
  createdAt: '2025-01-01T00:00:00Z',
  lastLoginAt: '2025-06-01T00:00:00Z',
};

describe('Admin API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ── adminKeys ──────────────────────────────────────────────────────────────

  describe('adminKeys', () => {
    it('should define users key', () => {
      expect(adminKeys.users).toEqual(['admin', 'users']);
    });

    it('should define userDetail key', () => {
      expect(adminKeys.userDetail('id-1')).toEqual(['admin', 'users', 'id-1']);
    });
  });

  // ── listUsers ──────────────────────────────────────────────────────────────

  describe('listUsers', () => {
    it('should list users without search', async () => {
      mockGet.mockResolvedValueOnce([mockUser]);

      const result = await adminApi.listUsers();

      expect(mockGet).toHaveBeenCalledWith('/admin/users');
      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('Admin User');
    });

    it('should list users with search', async () => {
      mockGet.mockResolvedValueOnce([]);

      await adminApi.listUsers('john');

      expect(mockGet).toHaveBeenCalledWith('/admin/users?search=john');
    });

    it('should encode special characters in search', async () => {
      mockGet.mockResolvedValueOnce([]);

      await adminApi.listUsers('john doe & co');

      expect(mockGet).toHaveBeenCalledWith('/admin/users?search=john%20doe%20%26%20co');
    });
  });

  // ── getUser ────────────────────────────────────────────────────────────────

  describe('getUser', () => {
    it('should get user by ID', async () => {
      mockGet.mockResolvedValueOnce(mockUser);

      const result = await adminApi.getUser('user-uuid-1');

      expect(mockGet).toHaveBeenCalledWith('/admin/users/user-uuid-1');
      expect(result.id).toBe('user-uuid-1');
    });
  });

  // ── updateUserRole ─────────────────────────────────────────────────────────

  describe('updateUserRole', () => {
    it('should update user role', async () => {
      const updated = { ...mockUser, roles: ['manager'] };
      mockPatch.mockResolvedValueOnce(updated);

      const result = await adminApi.updateUserRole('user-uuid-1', 'manager');

      expect(mockPatch).toHaveBeenCalledWith('/admin/users/user-uuid-1/role', {
        role: 'manager',
      });
      expect(result.roles).toEqual(['manager']);
    });
  });

  // ── toggleUserStatus ───────────────────────────────────────────────────────

  describe('toggleUserStatus', () => {
    it('should toggle user status', async () => {
      const updated = { ...mockUser, isActive: false };
      mockPatch.mockResolvedValueOnce(updated);

      const result = await adminApi.toggleUserStatus('user-uuid-1', false);

      expect(mockPatch).toHaveBeenCalledWith('/admin/users/user-uuid-1/status', {
        isActive: false,
      });
      expect(result.isActive).toBe(false);
    });
  });

  // ── updateUserSectors ──────────────────────────────────────────────────────

  describe('updateUserSectors', () => {
    it('should update user sectors', async () => {
      const updated = { ...mockUser, sectorIds: ['sector-1', 'sector-2'] };
      mockPatch.mockResolvedValueOnce(updated);

      const result = await adminApi.updateUserSectors('user-uuid-1', ['sector-1', 'sector-2']);

      expect(mockPatch).toHaveBeenCalledWith('/admin/users/user-uuid-1/sectors', {
        sectorIds: ['sector-1', 'sector-2'],
      });
      expect(result.sectorIds).toEqual(['sector-1', 'sector-2']);
    });

    it('should handle empty sectors', async () => {
      const updated = { ...mockUser, sectorIds: [] };
      mockPatch.mockResolvedValueOnce(updated);

      const result = await adminApi.updateUserSectors('user-uuid-1', []);

      expect(mockPatch).toHaveBeenCalledWith('/admin/users/user-uuid-1/sectors', {
        sectorIds: [],
      });
      expect(result.sectorIds).toEqual([]);
    });
  });
});
