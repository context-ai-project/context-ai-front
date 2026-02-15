/**
 * Admin API client
 * Handles user management operations (admin only)
 */

import { apiClient } from './client';

// ── Response types ──────────────────────────────────────────────────────────

/** Admin user response from backend */
export interface AdminUserResponse {
  id: string;
  auth0UserId: string;
  email: string;
  name: string;
  isActive: boolean;
  roles: string[];
  sectorIds: string[];
  createdAt: string;
  lastLoginAt: string | null;
}

// ── Query keys (for TanStack Query integration if needed) ────────────────────

export const adminKeys = {
  users: ['admin', 'users'] as const,
  userDetail: (id: string) => ['admin', 'users', id] as const,
};

// ── API functions ───────────────────────────────────────────────────────────

export const adminApi = {
  /**
   * List all users with optional search
   */
  listUsers: async (search?: string): Promise<AdminUserResponse[]> => {
    const params = search ? `?search=${encodeURIComponent(search)}` : '';
    return apiClient.get<AdminUserResponse[]>(`/admin/users${params}`);
  },

  /**
   * Get a single user by ID
   */
  getUser: async (id: string): Promise<AdminUserResponse> => {
    return apiClient.get<AdminUserResponse>(`/admin/users/${encodeURIComponent(id)}`);
  },

  /**
   * Update a user's role
   */
  updateUserRole: async (userId: string, role: string): Promise<AdminUserResponse> => {
    return apiClient.patch<AdminUserResponse>(`/admin/users/${encodeURIComponent(userId)}/role`, {
      role,
    });
  },

  /**
   * Toggle user active/inactive status
   */
  toggleUserStatus: async (userId: string, isActive: boolean): Promise<AdminUserResponse> => {
    return apiClient.patch<AdminUserResponse>(`/admin/users/${encodeURIComponent(userId)}/status`, {
      isActive,
    });
  },

  /**
   * Update user-sector associations
   */
  updateUserSectors: async (userId: string, sectorIds: string[]): Promise<AdminUserResponse> => {
    return apiClient.patch<AdminUserResponse>(
      `/admin/users/${encodeURIComponent(userId)}/sectors`,
      { sectorIds },
    );
  },
};
