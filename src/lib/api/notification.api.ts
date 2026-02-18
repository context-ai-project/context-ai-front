/**
 * Notification API client
 * Handles in-app notification operations
 */

import { apiClient } from './client';

// ── Response types ─────────────────────────────────────────────────────────

/** Notification type enum (mirrors backend) */
export type NotificationType =
  | 'invitation_sent'
  | 'invitation_accepted'
  | 'invitation_expired'
  | 'invitation_revoked'
  | 'new_document'
  | 'document_updated'
  | 'document_deleted'
  | 'sector_created'
  | 'sector_updated'
  | 'sector_deleted'
  | 'user_role_changed'
  | 'user_status_changed';

/** Notification response from backend */
export interface NotificationResponse {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  readAt: string | null;
  createdAt: string;
}

// ── Query keys (for TanStack Query integration if needed) ────────────────

export const notificationKeys = {
  all: ['notifications'] as const,
  unreadCount: ['notifications', 'unread-count'] as const,
};

// ── API functions ────────────────────────────────────────────────────────

export const notificationApi = {
  /**
   * Get current user's notifications
   */
  getNotifications: async (limit?: number): Promise<NotificationResponse[]> => {
    const params = limit ? `?limit=${limit}` : '';
    return apiClient.get<NotificationResponse[]>(`/notifications${params}`);
  },

  /**
   * Get unread notification count
   */
  getUnreadCount: async (): Promise<{ count: number }> => {
    return apiClient.get<{ count: number }>('/notifications/unread-count');
  },

  /**
   * Mark a specific notification as read
   */
  markAsRead: async (notificationId: string): Promise<{ message: string }> => {
    return apiClient.patch<{ message: string }>(
      `/notifications/${encodeURIComponent(notificationId)}/read`,
    );
  },

  /**
   * Mark all notifications as read
   */
  markAllAsRead: async (): Promise<{ message: string }> => {
    return apiClient.patch<{ message: string }>('/notifications/mark-all-read');
  },
};
