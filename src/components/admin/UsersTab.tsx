'use client';

import { useState, useMemo, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { Search, UserPlus, MoreHorizontal } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { getUserInitials } from '@/lib/utils/get-user-initials';
import type { AdminUserResponse } from '@/lib/api/admin.api';
import { ChangeRoleDialog } from './ChangeRoleDialog';
import { ToggleUserStatusDialog } from './ToggleUserStatusDialog';

/** Role → badge variant mapping */
const ROLE_BADGE_VARIANTS: Record<string, 'default' | 'secondary'> = {
  admin: 'default',
  manager: 'secondary',
  user: 'secondary',
};

interface UsersTabProps {
  users: AdminUserResponse[];
  isLoading: boolean;
  error: string | null;
  onUserUpdated: (user: AdminUserResponse) => void;
}

type DialogType = 'role' | 'status' | null;

/**
 * Users management tab
 * Displays a searchable table of all users with role/status management
 */
export function UsersTab({ users, isLoading, error, onUserUpdated }: UsersTabProps) {
  const t = useTranslations('admin');

  const [search, setSearch] = useState('');
  const [activeDialog, setActiveDialog] = useState<DialogType>(null);
  const [selectedUser, setSelectedUser] = useState<AdminUserResponse | null>(null);

  // Filter users by search
  const filteredUsers = useMemo(() => {
    if (!search.trim()) return users;
    const query = search.toLowerCase();
    return users.filter(
      (u) => u.name.toLowerCase().includes(query) || u.email.toLowerCase().includes(query),
    );
  }, [users, search]);

  const openRoleDialog = useCallback((user: AdminUserResponse) => {
    setSelectedUser(user);
    setActiveDialog('role');
  }, []);

  const openStatusDialog = useCallback((user: AdminUserResponse) => {
    setSelectedUser(user);
    setActiveDialog('status');
  }, []);

  const closeDialog = useCallback(() => {
    setActiveDialog(null);
    setSelectedUser(null);
  }, []);

  const getPrimaryRole = (roles: string[]): string => {
    if (roles.length === 0) return 'user';
    return roles[0];
  };

  return (
    <>
      {/* Search + Invite */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 sm:max-w-xs">
          <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
          <Input
            placeholder={t('search.placeholder')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
            aria-label={t('search.placeholder')}
          />
        </div>
        <Button className="gap-2" disabled>
          <UserPlus className="h-4 w-4" />
          {t('inviteUser')}
        </Button>
      </div>

      {/* Error banner */}
      {error && (
        <div className="border-destructive/30 bg-destructive/5 text-destructive mb-4 rounded-md border p-3 text-sm">
          {error}
        </div>
      )}

      {/* Loading state */}
      {isLoading && users.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="border-muted border-t-primary h-8 w-8 animate-spin rounded-full border-4" />
          <p className="text-muted-foreground mt-4 text-sm">{t('loading')}</p>
        </div>
      )}

      {/* Empty / no results */}
      {!isLoading && filteredUsers.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <p className="text-muted-foreground text-sm">{t('noResults')}</p>
        </div>
      )}

      {/* Users table */}
      {filteredUsers.length > 0 && (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-border border-b text-left">
                    <th className="text-muted-foreground px-5 py-3 font-medium">
                      {t('table.user')}
                    </th>
                    <th className="text-muted-foreground px-5 py-3 font-medium">
                      {t('table.role')}
                    </th>
                    <th className="text-muted-foreground px-5 py-3 font-medium">
                      {t('table.status')}
                    </th>
                    <th className="text-muted-foreground px-5 py-3 font-medium">
                      {t('table.joined')}
                    </th>
                    <th className="text-muted-foreground px-5 py-3 font-medium">
                      <span className="sr-only">{t('table.actions')}</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user) => {
                    const role = getPrimaryRole(user.roles);
                    return (
                      <tr key={user.id} className="border-border/50 border-b last:border-0">
                        {/* User info */}
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8">
                              <AvatarFallback className="bg-primary/10 text-primary text-xs">
                                {getUserInitials(user.name)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="text-foreground font-medium">{user.name}</div>
                              <div className="text-muted-foreground text-xs">{user.email}</div>
                            </div>
                          </div>
                        </td>

                        {/* Role */}
                        <td className="px-5 py-3">
                          <Badge
                            variant={ROLE_BADGE_VARIANTS[role] ?? 'secondary'}
                            className="text-xs capitalize"
                          >
                            {t(`roles.${role}` as Parameters<typeof t>[0])}
                          </Badge>
                        </td>

                        {/* Status */}
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-2">
                            <div
                              className={`h-2 w-2 rounded-full ${
                                user.isActive ? 'bg-green-500' : 'bg-muted-foreground'
                              }`}
                            />
                            <span className="text-muted-foreground text-sm capitalize">
                              {user.isActive ? t('status.active') : t('status.inactive')}
                            </span>
                          </div>
                        </td>

                        {/* Joined */}
                        <td className="text-muted-foreground px-5 py-3">
                          {new Date(user.createdAt).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </td>

                        {/* Actions */}
                        <td className="px-5 py-3">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                aria-label={t('actions.userActions')}
                              >
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => openRoleDialog(user)}>
                                {t('actions.changeRole')}
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => openStatusDialog(user)}>
                                {user.isActive ? t('actions.deactivate') : t('actions.activate')}
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Change role dialog */}
      <ChangeRoleDialog
        open={activeDialog === 'role'}
        onOpenChange={(open) => !open && closeDialog()}
        user={selectedUser}
        onSuccess={onUserUpdated}
      />

      {/* Toggle status dialog */}
      <ToggleUserStatusDialog
        open={activeDialog === 'status'}
        onOpenChange={(open) => !open && closeDialog()}
        user={selectedUser}
        onSuccess={onUserUpdated}
      />
    </>
  );
}
