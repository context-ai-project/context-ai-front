/**
 * Notification API client
 * Handles in-app notification operations
 */

import { apiClient } from './client';

// ── Response types ─────────────────────────────────────────────────────────

/** Notification type enum (mirrors backend NotificationType) */
export type NotificationType =
  | 'invitation.created'
  | 'invitation.accepted'
  | 'invitation.expired'
  | 'user.activated'
  | 'document.processed'
  | 'document.failed';

/** Notification metadata from backend */
export interface NotificationMetadata {
  invitationId?: string;
  email?: string;
  name?: string;
  role?: string;
  userId?: string;
  [key: string]: unknown;
}

/** Notification response from backend */
export interface NotificationResponse {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  isRead: boolean;
  metadata?: NotificationMetadata | null;
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
