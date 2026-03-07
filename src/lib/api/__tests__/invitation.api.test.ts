import { invitationApi, invitationKeys, type InvitationResponse } from '../invitation.api';
import { apiClient } from '../client';

vi.mock('../client', () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
  },
}));

const mockGet = vi.mocked(apiClient.get);
const mockPost = vi.mocked(apiClient.post);
const mockPatch = vi.mocked(apiClient.patch);

const mockInvitation: InvitationResponse = {
  id: 'inv-1',
  email: 'user@example.com',
  status: 'pending',
  expiresAt: '2026-12-31T00:00:00Z',
  createdByUserId: 'admin-1',
  createdByName: 'Admin',
  sectorIds: ['sector-1'],
  acceptedAt: null,
  createdAt: '2026-01-01T00:00:00Z',
  updatedAt: '2026-01-01T00:00:00Z',
};

describe('invitationApi', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('invitationKeys', () => {
    it('should expose static and detail keys', () => {
      expect(invitationKeys.all).toEqual(['invitations']);
      expect(invitationKeys.detail('abc')).toEqual(['invitations', 'abc']);
    });
  });

  describe('createInvitation', () => {
    it('should create invitation with payload', async () => {
      mockPost.mockResolvedValueOnce(mockInvitation);

      const result = await invitationApi.createInvitation({
        email: 'user@example.com',
        name: 'User Test',
        sectorIds: ['sector-1'],
      });

      expect(mockPost).toHaveBeenCalledWith('/admin/invitations', {
        email: 'user@example.com',
        name: 'User Test',
        sectorIds: ['sector-1'],
      });
      expect(result).toEqual(mockInvitation);
    });
  });

  describe('listInvitations', () => {
    it('should list invitations', async () => {
      mockGet.mockResolvedValueOnce([mockInvitation]);

      const result = await invitationApi.listInvitations();

      expect(mockGet).toHaveBeenCalledWith('/admin/invitations');
      expect(result).toHaveLength(1);
    });
  });

  describe('revokeInvitation', () => {
    it('should revoke invitation with reason', async () => {
      mockPatch.mockResolvedValueOnce({ message: 'Revoked' });

      const result = await invitationApi.revokeInvitation('inv 1', 'No longer needed');

      expect(mockPatch).toHaveBeenCalledWith('/admin/invitations/inv%201/revoke', {
        reason: 'No longer needed',
      });
      expect(result).toEqual({ message: 'Revoked' });
    });

    it('should revoke invitation without reason', async () => {
      mockPatch.mockResolvedValueOnce({ message: 'Revoked' });

      await invitationApi.revokeInvitation('inv-2');

      expect(mockPatch).toHaveBeenCalledWith('/admin/invitations/inv-2/revoke', undefined);
    });
  });
});
