import { describe, it, expect, vi, beforeEach } from 'vitest';
import { capsuleApi, capsuleKeys } from '../capsule.api';
import { apiClient } from '../client';

vi.mock('../client', () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
}));

const mockGet = vi.mocked(apiClient.get);
const mockPost = vi.mocked(apiClient.post);
const mockPatch = vi.mocked(apiClient.patch);
const mockDelete = vi.mocked(apiClient.delete);

describe('Capsule API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('capsuleKeys', () => {
    it('defines all key', () => {
      expect(capsuleKeys.all).toEqual(['capsules']);
    });
    it('defines list key with params', () => {
      expect(capsuleKeys.list({ page: 1, sectorId: 's1' })).toEqual([
        'capsules',
        'list',
        { page: 1, sectorId: 's1' },
      ]);
    });
    it('defines detail key', () => {
      expect(capsuleKeys.detail('cap-1')).toEqual(['capsules', 'cap-1']);
    });
    it('defines status key', () => {
      expect(capsuleKeys.status('cap-1')).toEqual(['capsules', 'cap-1', 'status']);
    });
    it('defines voices key', () => {
      expect(capsuleKeys.voices()).toEqual(['capsules', 'voices']);
    });
    it('defines quota key', () => {
      expect(capsuleKeys.quota()).toEqual(['capsules', 'quota']);
    });
  });

  describe('listCapsules', () => {
    it('calls GET /capsules with query string', async () => {
      const data = { data: [], total: 0, page: 1, limit: 20 };
      mockGet.mockResolvedValueOnce(data);
      await capsuleApi.listCapsules({ page: 1, limit: 10, sectorId: 's1' });
      expect(mockGet).toHaveBeenCalledWith('/capsules?page=1&limit=10&sectorId=s1');
    });
    it('calls GET /capsules with no params', async () => {
      mockGet.mockResolvedValueOnce({ data: [], total: 0, page: 1, limit: 20 });
      await capsuleApi.listCapsules();
      expect(mockGet).toHaveBeenCalledWith('/capsules');
    });
  });

  describe('getCapsule', () => {
    it('calls GET /capsules/:id', async () => {
      const capsule = {
        id: 'cap-1',
        title: 'Test',
        sectorId: 's1',
        type: 'AUDIO',
        status: 'DRAFT',
        createdBy: 'u',
        createdAt: '',
        updatedAt: '',
      };
      mockGet.mockResolvedValueOnce(capsule);
      const result = await capsuleApi.getCapsule('cap-1');
      expect(mockGet).toHaveBeenCalledWith('/capsules/cap-1');
      expect(result).toEqual(capsule);
    });
  });

  describe('createCapsule', () => {
    it('calls POST /capsules with dto', async () => {
      const dto = {
        title: 'Capsule',
        sectorId: 's1',
        type: 'AUDIO' as const,
        sourceIds: ['doc-1'],
      };
      const created = {
        id: 'cap-1',
        ...dto,
        status: 'DRAFT',
        createdBy: 'u',
        createdAt: '',
        updatedAt: '',
      };
      mockPost.mockResolvedValueOnce(created);
      const result = await capsuleApi.createCapsule(dto);
      expect(mockPost).toHaveBeenCalledWith('/capsules', dto);
      expect(result.id).toBe('cap-1');
    });
  });

  describe('updateCapsule', () => {
    it('calls PATCH /capsules/:id with dto', async () => {
      const dto = { title: 'Updated', script: 'Script' };
      mockPatch.mockResolvedValueOnce({ id: 'cap-1', ...dto });
      await capsuleApi.updateCapsule('cap-1', dto);
      expect(mockPatch).toHaveBeenCalledWith('/capsules/cap-1', dto);
    });
  });

  describe('deleteCapsule', () => {
    it('calls DELETE /capsules/:id', async () => {
      mockDelete.mockResolvedValueOnce(undefined);
      await capsuleApi.deleteCapsule('cap-1');
      expect(mockDelete).toHaveBeenCalledWith('/capsules/cap-1');
    });
  });

  describe('generateScript', () => {
    it('calls POST generate-script with optional language', async () => {
      mockPost.mockResolvedValueOnce({ script: 'Generated script' });
      await capsuleApi.generateScript('cap-1', 'es-ES');
      expect(mockPost).toHaveBeenCalledWith('/capsules/cap-1/generate-script', {
        language: 'es-ES',
      });
    });
    it('calls POST generate-script without body when no language', async () => {
      mockPost.mockResolvedValueOnce({ script: 'Script' });
      await capsuleApi.generateScript('cap-1');
      expect(mockPost).toHaveBeenCalledWith('/capsules/cap-1/generate-script', {});
    });
  });

  describe('generateAudio', () => {
    it('calls POST generate with voiceId and 120s timeout', async () => {
      mockPost.mockResolvedValueOnce(undefined);
      await capsuleApi.generateAudio('cap-1', 'voice-1');
      expect(mockPost).toHaveBeenCalledWith(
        '/capsules/cap-1/generate',
        { voiceId: 'voice-1' },
        { timeout: 120_000 },
      );
    });
  });

  describe('getCapsuleStatus', () => {
    it('calls GET status', async () => {
      mockGet.mockResolvedValueOnce({
        capsuleId: 'cap-1',
        status: 'GENERATING_ASSETS',
        progress: 50,
      });
      const result = await capsuleApi.getCapsuleStatus('cap-1');
      expect(mockGet).toHaveBeenCalledWith('/capsules/cap-1/status');
      expect(result.status).toBe('GENERATING_ASSETS');
    });
  });

  describe('getDownloadUrl', () => {
    it('calls GET download/audio', async () => {
      mockGet.mockResolvedValueOnce({
        url: 'https://signed.url',
        expiresAt: '2025-01-01T00:00:00Z',
      });
      const result = await capsuleApi.getDownloadUrl('cap-1', 'audio');
      expect(mockGet).toHaveBeenCalledWith('/capsules/cap-1/download/audio');
      expect(result.url).toBe('https://signed.url');
    });
  });

  describe('publishCapsule', () => {
    it('calls POST publish', async () => {
      mockPost.mockResolvedValueOnce({ id: 'cap-1', status: 'ACTIVE' });
      await capsuleApi.publishCapsule('cap-1');
      expect(mockPost).toHaveBeenCalledWith('/capsules/cap-1/publish');
    });
  });

  describe('archiveCapsule', () => {
    it('calls POST archive', async () => {
      mockPost.mockResolvedValueOnce({ id: 'cap-1', status: 'ARCHIVED' });
      await capsuleApi.archiveCapsule('cap-1');
      expect(mockPost).toHaveBeenCalledWith('/capsules/cap-1/archive');
    });
  });

  describe('getQuota', () => {
    it('calls GET quota', async () => {
      mockGet.mockResolvedValueOnce({
        used: 1,
        limit: 10,
        remaining: 9,
        capsulesCost: 1,
        capsulesRemaining: 9,
      });
      const result = await capsuleApi.getQuota();
      expect(mockGet).toHaveBeenCalledWith('/capsules/quota');
      expect(result.remaining).toBe(9);
    });
  });

  describe('getVoices', () => {
    it('calls GET voices', async () => {
      mockGet.mockResolvedValueOnce([{ id: 'v1', name: 'Voice 1' }]);
      const result = await capsuleApi.getVoices();
      expect(mockGet).toHaveBeenCalledWith('/capsules/voices');
      expect(result).toHaveLength(1);
    });
  });

  describe('searchSharedVoices', () => {
    it('calls GET voices/search with query', async () => {
      mockGet.mockResolvedValueOnce([]);
      await capsuleApi.searchSharedVoices('spanish');
      expect(mockGet).toHaveBeenCalledWith('/capsules/voices/search?q=spanish');
    });
  });
});
