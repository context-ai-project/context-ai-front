import { sectorApi, sectorKeys } from '../sector.api';
import { apiClient } from '../client';
import type { Sector } from '@/types/sector.types';

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
const mockPost = vi.mocked(apiClient.post);
const mockPatch = vi.mocked(apiClient.patch);
const mockDelete = vi.mocked(apiClient.delete);

const rawSector = {
  id: 'sector-1',
  name: 'Human Resources',
  description: 'Policies and procedures',
  icon: 'users' as const,
  status: 'ACTIVE',
  documentCount: 10,
  createdAt: '2025-01-01T00:00:00Z',
  updatedAt: '2025-01-01T00:00:00Z',
};

const expectedSector: Sector = {
  id: 'sector-1',
  name: 'Human Resources',
  description: 'Policies and procedures',
  icon: 'users',
  status: 'active',
  documentCount: 10,
  createdAt: '2025-01-01T00:00:00Z',
  updatedAt: '2025-01-01T00:00:00Z',
};

describe('Sector API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('sectorKeys', () => {
    it('should define all key', () => {
      expect(sectorKeys.all).toEqual(['sectors']);
    });

    it('should define detail key', () => {
      expect(sectorKeys.detail('s1')).toEqual(['sectors', 's1']);
    });
  });

  describe('listSectors', () => {
    it('should list and normalize sectors', async () => {
      mockGet.mockResolvedValueOnce([rawSector]);

      const result = await sectorApi.listSectors();

      expect(mockGet).toHaveBeenCalledWith('/sectors');
      expect(result).toHaveLength(1);
      expect(result[0]).toEqual(expectedSector);
      expect(result[0].status).toBe('active');
    });
  });

  describe('getSector', () => {
    it('should get and normalize a sector', async () => {
      mockGet.mockResolvedValueOnce(rawSector);

      const result = await sectorApi.getSector('sector-1');

      expect(mockGet).toHaveBeenCalledWith('/sectors/sector-1');
      expect(result).toEqual(expectedSector);
    });
  });

  describe('createSector', () => {
    it('should create a sector', async () => {
      mockPost.mockResolvedValueOnce(rawSector);

      const result = await sectorApi.createSector({
        name: 'HR',
        description: 'Policies',
        icon: 'users',
      });

      expect(mockPost).toHaveBeenCalledWith('/sectors', {
        name: 'HR',
        description: 'Policies',
        icon: 'users',
      });
      expect(result.status).toBe('active');
    });
  });

  describe('updateSector', () => {
    it('should update a sector', async () => {
      mockPatch.mockResolvedValueOnce(rawSector);

      const result = await sectorApi.updateSector('sector-1', { name: 'HR Updated' });

      expect(mockPatch).toHaveBeenCalledWith('/sectors/sector-1', { name: 'HR Updated' });
      expect(result.status).toBe('active');
    });

    it('should strip status from update DTO', async () => {
      mockPatch.mockResolvedValueOnce(rawSector);

      await sectorApi.updateSector('sector-1', {
        name: 'Updated',
        description: 'New desc',
      });

      expect(mockPatch).toHaveBeenCalledWith('/sectors/sector-1', {
        name: 'Updated',
        description: 'New desc',
      });
    });
  });

  describe('deleteSector', () => {
    it('should delete a sector', async () => {
      const response = { id: 'sector-1', message: 'Deleted' };
      mockDelete.mockResolvedValueOnce(response);

      const result = await sectorApi.deleteSector('sector-1');

      expect(mockDelete).toHaveBeenCalledWith('/sectors/sector-1');
      expect(result).toEqual(response);
    });
  });

  describe('toggleStatus', () => {
    it('should toggle status and normalize response', async () => {
      mockPatch.mockResolvedValueOnce({
        id: 'sector-1',
        status: 'INACTIVE',
        message: 'Deactivated',
      });

      const result = await sectorApi.toggleStatus('sector-1');

      expect(mockPatch).toHaveBeenCalledWith('/sectors/sector-1/status');
      expect(result.status).toBe('inactive');
      expect(result.message).toBe('Deactivated');
    });
  });
});
