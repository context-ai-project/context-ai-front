import { apiClient } from './client';

export interface SyncUserDto {
  auth0UserId: string;
  email: string;
  name: string;
}

export interface UserResponseDto {
  id: string; // Internal UUID
  auth0UserId: string;
  email: string;
  name: string;
  isActive: boolean;
  createdAt: string;
  lastLoginAt: string | null;
}

/**
 * User API Client
 *
 * Handles user synchronization with the backend
 */
export const userApi = {
  /**
   * Sync user from Auth0 to backend
   * Creates or updates user and returns internal UUID
   */
  syncUser: async (dto: SyncUserDto): Promise<UserResponseDto> => {
    return apiClient.post<UserResponseDto>('/users/sync', dto);
  },
};
