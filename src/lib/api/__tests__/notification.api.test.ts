import { notificationApi, notificationKeys, type NotificationResponse } from '../notification.api';
import { apiClient } from '../client';

vi.mock('../client', () => ({
  apiClient: {
    get: vi.fn(),
    patch: vi.fn(),
  },
}));

const mockGet = vi.mocked(apiClient.get);
const mockPatch = vi.mocked(apiClient.patch);

const mockNotification: NotificationResponse = {
  id: 'notif-1',
  type: 'invitation.created',
  title: 'Invitation sent',
  message: 'Invitation for user@example.com',
  isRead: false,
  metadata: { email: 'user@example.com' },
  createdAt: '2026-01-01T00:00:00Z',
};

describe('notificationApi', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('notificationKeys', () => {
    it('should expose query keys', () => {
      expect(notificationKeys.all).toEqual(['notifications']);
      expect(notificationKeys.unreadCount).toEqual(['notifications', 'unread-count']);
    });
  });

  describe('getNotifications', () => {
    it('should request notifications with limit when provided', async () => {
      mockGet.mockResolvedValueOnce([mockNotification]);

      const result = await notificationApi.getNotifications(10);

      expect(mockGet).toHaveBeenCalledWith('/notifications?limit=10');
      expect(result).toEqual([mockNotification]);
    });

    it('should request notifications without query params by default', async () => {
      mockGet.mockResolvedValueOnce([]);

      await notificationApi.getNotifications();

      expect(mockGet).toHaveBeenCalledWith('/notifications');
    });
  });

  describe('getUnreadCount', () => {
    it('should request unread count', async () => {
      mockGet.mockResolvedValueOnce({ count: 3 });

      const result = await notificationApi.getUnreadCount();

      expect(mockGet).toHaveBeenCalledWith('/notifications/unread-count');
      expect(result.count).toBe(3);
    });
  });

  describe('markAsRead', () => {
    it('should encode notification id', async () => {
      mockPatch.mockResolvedValueOnce({ message: 'ok' });

      await notificationApi.markAsRead('notif 123');

      expect(mockPatch).toHaveBeenCalledWith('/notifications/notif%20123/read');
    });
  });

  describe('markAllAsRead', () => {
    it('should mark all notifications as read', async () => {
      mockPatch.mockResolvedValueOnce({ message: 'ok' });

      const result = await notificationApi.markAllAsRead();

      expect(mockPatch).toHaveBeenCalledWith('/notifications/mark-all-read');
      expect(result).toEqual({ message: 'ok' });
    });
  });
});
