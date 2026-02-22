'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { Bell, Check, CheckCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { notificationApi, type NotificationResponse } from '@/lib/api/notification.api';

/** Polling interval for fetching unread count (60 seconds) */
const POLL_INTERVAL_MS = 60_000;

/** Maximum number of notifications to display */
const MAX_NOTIFICATIONS = 10;

/**
 * Calculate relative time string from a date
 */
function getTimeAgo(
  dateStr: string,
  t: ReturnType<typeof useTranslations<'notifications'>>,
): string {
  const now = Date.now();
  const date = new Date(dateStr).getTime();
  const diffMs = now - date;

  const minutes = Math.floor(diffMs / 60_000);
  const hours = Math.floor(diffMs / 3_600_000);
  const days = Math.floor(diffMs / 86_400_000);

  if (minutes < 1) return t('timeAgo.justNow');
  if (minutes < 60) return t('timeAgo.minutesAgo', { count: minutes });
  if (hours < 24) return t('timeAgo.hoursAgo', { count: hours });
  return t('timeAgo.daysAgo', { count: days });
}

/**
 * Maps backend notification type (dot-separated) to i18n key (camelCase).
 * next-intl does not allow dots in JSON keys, so we convert them here.
 */
const TYPE_TO_I18N_KEY: Record<string, string> = {
  'invitation.created': 'invitationCreated',
  'invitation.accepted': 'invitationAccepted',
  'invitation.expired': 'invitationExpired',
  'user.activated': 'userActivated',
  'document.processed': 'documentProcessed',
  'document.failed': 'documentFailed',
};

/**
 * NotificationBell
 *
 * Displays a bell icon in the header with an unread count badge.
 * Opens a dropdown with recent notifications and actions to mark as read.
 * Translates notification content based on type + metadata using i18n.
 */
export function NotificationBell() {
  const t = useTranslations('notifications');

  const [notifications, setNotifications] = useState<NotificationResponse[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  /**
   * Get translated title for a notification.
   * Falls back to the backend-provided title if no translation exists.
   */
  const getTitle = useCallback(
    (notification: NotificationResponse): string => {
      const i18nKey = TYPE_TO_I18N_KEY[notification.type];
      if (i18nKey) {
        try {
          return t(`types.${i18nKey}.title`);
        } catch {
          return notification.title;
        }
      }
      return notification.title;
    },
    [t],
  );

  /**
   * Get translated message for a notification.
   * Interpolates metadata values (name, email, role, etc.)
   * Falls back to the backend-provided message if no translation exists
   * or if required interpolation parameters are missing.
   */
  const getMessage = useCallback(
    (notification: NotificationResponse): string => {
      const i18nKey = TYPE_TO_I18N_KEY[notification.type];
      if (!i18nKey || !notification.metadata) {
        return notification.message;
      }

      try {
        const params: Record<string, string> = {};
        for (const [key, value] of Object.entries(notification.metadata)) {
          if (typeof value === 'string') {
            params[key] = value;
          }
        }

        // Provide fallback for common params that may be missing in older notifications
        params.name = params.name ?? params.email ?? '—';
        params.email = params.email ?? '—';
        params.role = params.role ?? '—';

        const result = t(`types.${i18nKey}.message`, params);

        // next-intl returns the key path when translation fails silently
        if (result.startsWith('notifications.types.')) {
          return notification.message;
        }

        return result;
      } catch {
        return notification.message;
      }
    },
    [t],
  );

  // Fetch unread count (lightweight, for polling)
  const fetchUnreadCount = useCallback(async () => {
    try {
      const { count } = await notificationApi.getUnreadCount();
      setUnreadCount(count);
    } catch {
      // Silently fail — notification count is non-critical
    }
  }, []);

  // Fetch full notification list (when dropdown opens)
  const fetchNotifications = useCallback(async () => {
    setIsLoading(true);
    try {
      const [data, { count }] = await Promise.all([
        notificationApi.getNotifications(MAX_NOTIFICATIONS),
        notificationApi.getUnreadCount(),
      ]);
      setNotifications(data);
      setUnreadCount(count);
    } catch {
      // Silently fail
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Poll unread count on mount and periodically
  useEffect(() => {
    fetchUnreadCount();
    pollRef.current = setInterval(fetchUnreadCount, POLL_INTERVAL_MS);
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [fetchUnreadCount]);

  // Fetch full list when dropdown opens
  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
    }
  }, [isOpen, fetchNotifications]);

  // Mark a single notification as read
  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await notificationApi.markAsRead(notificationId);
      setNotifications((prev) =>
        prev.map((n) => (n.id === notificationId ? { ...n, isRead: true } : n)),
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch {
      // Silently fail
    }
  };

  // Mark all as read
  const handleMarkAllAsRead = async () => {
    try {
      await notificationApi.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch {
      // Silently fail
    }
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative h-9 w-9" aria-label={t('title')}>
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <span className="bg-destructive text-destructive-foreground absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[10px] font-bold">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-80 p-0">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3">
          <h3 className="text-sm font-semibold">{t('title')}</h3>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="text-muted-foreground h-auto gap-1 px-2 py-1 text-xs"
              onClick={handleMarkAllAsRead}
            >
              <CheckCheck className="h-3 w-3" />
              {t('markAllRead')}
            </Button>
          )}
        </div>

        <Separator />

        {/* Notification list */}
        <ScrollArea className="max-h-[300px]">
          {isLoading && notifications.length === 0 && (
            <div className="flex items-center justify-center py-8">
              <div className="border-muted border-t-primary h-5 w-5 animate-spin rounded-full border-2" />
            </div>
          )}

          {!isLoading && notifications.length === 0 && (
            <div className="text-muted-foreground py-8 text-center text-sm">{t('empty')}</div>
          )}

          {notifications.map((notification) => {
            const isUnread = !notification.isRead;
            return (
              <div
                key={notification.id}
                className={`flex items-start gap-3 px-4 py-3 transition-colors ${
                  isUnread ? 'bg-accent/50' : ''
                }`}
              >
                {/* Unread dot */}
                <div className="mt-1.5 flex-shrink-0">
                  {isUnread ? (
                    <div className="bg-primary h-2 w-2 rounded-full" />
                  ) : (
                    <div className="h-2 w-2" />
                  )}
                </div>

                {/* Content — translated based on type + metadata */}
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{getTitle(notification)}</p>
                  <p className="text-muted-foreground line-clamp-2 text-xs">
                    {getMessage(notification)}
                  </p>
                  <p className="text-muted-foreground mt-1 text-[10px]">
                    {getTimeAgo(notification.createdAt, t)}
                  </p>
                </div>

                {/* Mark as read button */}
                {isUnread && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 flex-shrink-0"
                    onClick={() => handleMarkAsRead(notification.id)}
                    aria-label={t('markAsRead')}
                  >
                    <Check className="h-3 w-3" />
                  </Button>
                )}
              </div>
            );
          })}
        </ScrollArea>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
