import { statsApi, type AdminStatsDto } from '../stats.api';
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

const mockStats: AdminStatsDto = {
  totalConversations: 150,
  totalUsers: 25,
  recentUsers: 5,
  totalDocuments: 200,
  totalSectors: 8,
  activeSectors: 6,
};

describe('Stats API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getAdminStats', () => {
    it('should fetch admin stats', async () => {
      mockGet.mockResolvedValueOnce(mockStats);

      const result = await statsApi.getAdminStats();

      expect(mockGet).toHaveBeenCalledWith('/admin/stats');
      expect(result).toEqual(mockStats);
      expect(result.totalConversations).toBe(150);
      expect(result.totalSectors).toBe(8);
    });

    it('should propagate errors', async () => {
      mockGet.mockRejectedValueOnce(new Error('Unauthorized'));

      await expect(statsApi.getAdminStats()).rejects.toThrow('Unauthorized');
    });
  });
});
