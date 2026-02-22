/**
 * Invitation API client
 * Handles invitation management operations (admin only)
 */

import { apiClient } from './client';

// ── Request types ──────────────────────────────────────────────────────────

/** DTO for creating a new invitation */
export interface CreateInvitationDto {
  email: string;
  name: string;
  sectorIds?: string[];
}

// ── Response types ─────────────────────────────────────────────────────────

/** Invitation status enum (mirrors backend) */
export type InvitationStatus = 'pending' | 'accepted' | 'expired' | 'revoked';

/** Invitation response from backend */
export interface InvitationResponse {
  id: string;
  email: string;
  status: InvitationStatus;
  expiresAt: string;
  createdByUserId: string;
  createdByName: string;
  sectorIds: string[];
  acceptedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

// ── Query keys (for TanStack Query integration if needed) ────────────────

export const invitationKeys = {
  all: ['invitations'] as const,
  detail: (id: string) => ['invitations', id] as const,
};

// ── API functions ────────────────────────────────────────────────────────

export const invitationApi = {
  /**
   * Create a new invitation (admin only)
   * Sends an invitation email to the specified user
   */
  createInvitation: async (dto: CreateInvitationDto): Promise<InvitationResponse> => {
    return apiClient.post<InvitationResponse>('/admin/invitations', dto);
  },

  /**
   * List all invitations (admin only)
   */
  listInvitations: async (): Promise<InvitationResponse[]> => {
    return apiClient.get<InvitationResponse[]>('/admin/invitations');
  },

  /**
   * Revoke a pending invitation (admin only)
   */
  revokeInvitation: async (id: string, reason?: string): Promise<{ message: string }> => {
    return apiClient.patch<{ message: string }>(
      `/admin/invitations/${encodeURIComponent(id)}/revoke`,
      reason ? { reason } : undefined,
    );
  },
};
