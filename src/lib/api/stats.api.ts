/**
 * Admin stats API client
 * Fetches platform-wide statistics for the admin dashboard
 */

import { apiClient } from './client';

/**
 * Admin dashboard statistics DTO
 * Matches the backend AdminStatsDto
 */
export interface AdminStatsDto {
  totalConversations: number;
  totalUsers: number;
  recentUsers: number;
  totalDocuments: number;
  totalSectors: number;
  activeSectors: number;
}

/**
 * Stats API functions
 */
export const statsApi = {
  /**
   * Get admin dashboard statistics
   * Requires admin role
   */
  getAdminStats: async (): Promise<AdminStatsDto> => {
    return apiClient.get<AdminStatsDto>('/admin/stats');
  },
};
