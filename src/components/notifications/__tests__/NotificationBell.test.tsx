import { render, screen, waitFor } from '@/test/test-utils';
import userEvent from '@testing-library/user-event';
import { NotificationBell } from '../NotificationBell';
import { notificationApi, type NotificationResponse } from '@/lib/api/notification.api';

vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => `notifications.${key}`,
  useLocale: () => 'en',
}));

vi.mock('@/lib/api/notification.api', () => ({
  notificationApi: {
    getNotifications: vi.fn(),
    getUnreadCount: vi.fn(),
    markAsRead: vi.fn(),
    markAllAsRead: vi.fn(),
  },
}));

const mockApi = vi.mocked(notificationApi);

const unreadNotification: NotificationResponse = {
  id: 'n-1',
  type: 'invitation.created',
  title: 'Invitation created',
  message: 'Invitation sent',
  isRead: false,
  metadata: { email: 'user@example.com' },
  createdAt: new Date().toISOString(),
};

describe('NotificationBell', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockApi.getUnreadCount.mockResolvedValue({ count: 0 });
    mockApi.getNotifications.mockResolvedValue([]);
    mockApi.markAsRead.mockResolvedValue({ message: 'ok' });
    mockApi.markAllAsRead.mockResolvedValue({ message: 'ok' });
  });

  it('should fetch unread count on mount and display badge', async () => {
    mockApi.getUnreadCount.mockResolvedValueOnce({ count: 3 });

    render(<NotificationBell />);

    await waitFor(() => {
      expect(mockApi.getUnreadCount).toHaveBeenCalled();
    });

    expect(screen.getByText('3')).toBeInTheDocument();
  });

  it('should open dropdown and fetch notifications list', async () => {
    mockApi.getUnreadCount.mockResolvedValueOnce({ count: 1 }).mockResolvedValueOnce({ count: 1 });
    mockApi.getNotifications.mockResolvedValueOnce([unreadNotification]);
    const user = userEvent.setup();

    render(<NotificationBell />);

    await user.click(screen.getByRole('button', { name: /title$/ }));

    await waitFor(() => {
      expect(mockApi.getNotifications).toHaveBeenCalledWith(10);
    });

    expect(screen.getByText('Invitation sent')).toBeInTheDocument();
  });

  it('should mark one notification as read', async () => {
    mockApi.getUnreadCount.mockResolvedValueOnce({ count: 1 }).mockResolvedValueOnce({ count: 1 });
    mockApi.getNotifications.mockResolvedValueOnce([unreadNotification]);
    const user = userEvent.setup();

    render(<NotificationBell />);
    await user.click(screen.getByRole('button', { name: /title$/ }));

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /markAsRead$/ })).toBeInTheDocument();
    });

    await user.click(screen.getByRole('button', { name: /markAsRead$/ }));

    await waitFor(() => {
      expect(mockApi.markAsRead).toHaveBeenCalledWith('n-1');
    });
  });

  it('should mark all notifications as read', async () => {
    mockApi.getUnreadCount.mockResolvedValueOnce({ count: 2 }).mockResolvedValueOnce({ count: 2 });
    mockApi.getNotifications.mockResolvedValueOnce([
      unreadNotification,
      { ...unreadNotification, id: 'n-2', title: 'Another', message: 'Another message' },
    ]);
    const user = userEvent.setup();

    render(<NotificationBell />);
    await user.click(screen.getByRole('button', { name: /title$/ }));

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /markAllRead$/ })).toBeInTheDocument();
    });

    await user.click(screen.getByRole('button', { name: /markAllRead$/ }));

    await waitFor(() => {
      expect(mockApi.markAllAsRead).toHaveBeenCalled();
    });
  });

  it('should fallback to backend title for unknown notification type', async () => {
    const user = userEvent.setup();
    mockApi.getUnreadCount.mockResolvedValueOnce({ count: 1 }).mockResolvedValueOnce({ count: 1 });
    mockApi.getNotifications.mockResolvedValueOnce([
      {
        ...unreadNotification,
        type: 'custom.unknown' as NotificationResponse['type'],
        title: 'Backend unknown title',
      },
    ]);

    render(<NotificationBell />);
    await user.click(screen.getByRole('button', { name: /title$/ }));

    await waitFor(() => {
      expect(screen.getByText('Backend unknown title')).toBeInTheDocument();
    });
  });

  it('should fallback to backend message when metadata is missing', async () => {
    const user = userEvent.setup();
    mockApi.getUnreadCount.mockResolvedValueOnce({ count: 1 }).mockResolvedValueOnce({ count: 1 });
    mockApi.getNotifications.mockResolvedValueOnce([
      {
        ...unreadNotification,
        metadata: null,
        message: 'Raw backend message',
      },
    ]);

    render(<NotificationBell />);
    await user.click(screen.getByRole('button', { name: /title$/ }));

    await waitFor(() => {
      expect(screen.getByText('Raw backend message')).toBeInTheDocument();
    });
  });

  it('should fallback to backend message when metadata parsing throws', async () => {
    const user = userEvent.setup();
    const badMetadata = new Proxy(
      {},
      {
        ownKeys() {
          throw new Error('metadata failure');
        },
      },
    ) as unknown as Record<string, unknown>;

    mockApi.getUnreadCount.mockResolvedValueOnce({ count: 1 }).mockResolvedValueOnce({ count: 1 });
    mockApi.getNotifications.mockResolvedValueOnce([
      {
        ...unreadNotification,
        metadata: badMetadata,
        message: 'Fallback from catch',
      },
    ]);

    render(<NotificationBell />);
    await user.click(screen.getByRole('button', { name: /title$/ }));

    await waitFor(() => {
      expect(screen.getByText('Fallback from catch')).toBeInTheDocument();
    });
  });
});
