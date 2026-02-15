'use client';

import { useState, useCallback, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { Search } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { getUserInitials } from '@/lib/utils/get-user-initials';
import { adminApi, type AdminUserResponse } from '@/lib/api/admin.api';
import type { Sector } from '@/types/sector.types';

interface PermissionsTabProps {
  users: AdminUserResponse[];
  sectors: Sector[];
  onUserUpdated: (user: AdminUserResponse) => void;
}

/**
 * Permissions tab showing a sector-access matrix
 * Each cell is a toggle controlling whether a user has access to a sector
 * Admin users always have access to all sectors
 */
export function PermissionsTab({ users, sectors, onUserUpdated }: PermissionsTabProps) {
  const t = useTranslations('admin');

  const [search, setSearch] = useState('');

  /** Track in-flight toggle requests to disable the switch while saving */
  const [pendingToggles, setPendingToggles] = useState<Set<string>>(new Set());

  const activeSectors = sectors.filter((s) => s.status === 'active');

  /** Filter users by name */
  const filteredUsers = useMemo(() => {
    if (!search.trim()) return users;
    const query = search.toLowerCase();
    return users.filter(
      (u) => u.name.toLowerCase().includes(query) || u.email.toLowerCase().includes(query),
    );
  }, [users, search]);

  /**
   * Toggle a user's access to a sector
   */
  const handleToggle = useCallback(
    async (user: AdminUserResponse, sectorId: string, grant: boolean) => {
      const key = `${user.id}-${sectorId}`;
      setPendingToggles((prev) => new Set(prev).add(key));

      try {
        const newSectorIds = grant
          ? [...user.sectorIds, sectorId]
          : user.sectorIds.filter((id) => id !== sectorId);

        const updated = await adminApi.updateUserSectors(user.id, newSectorIds);
        onUserUpdated(updated);
      } finally {
        setPendingToggles((prev) => {
          const next = new Set(prev);
          next.delete(key);
          return next;
        });
      }
    },
    [onUserUpdated],
  );

  const isAdmin = (user: AdminUserResponse): boolean => user.roles.includes('admin');

  return (
    <>
      {/* Header + Search */}
      <div className="mb-6">
        <h2 className="text-foreground text-lg font-semibold">{t('permissions.title')}</h2>
        <p className="text-muted-foreground mt-1 text-sm">{t('permissions.subtitle')}</p>
        <div className="relative mt-4 sm:max-w-xs">
          <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
          <Input
            placeholder={t('permissions.searchPlaceholder')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
            aria-label={t('permissions.searchPlaceholder')}
          />
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-border border-b text-left">
                  <th className="bg-background text-muted-foreground sticky left-0 z-10 px-5 py-3 font-medium">
                    {t('table.user')}
                  </th>
                  {activeSectors.map((sector) => (
                    <th
                      key={sector.id}
                      className="text-muted-foreground px-5 py-3 text-center font-medium"
                    >
                      {sector.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => {
                  const userIsAdmin = isAdmin(user);

                  return (
                    <tr key={user.id} className="border-border/50 border-b last:border-0">
                      {/* User cell */}
                      <td className="bg-background sticky left-0 z-10 px-5 py-3">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-7 w-7">
                            <AvatarFallback className="bg-primary/10 text-primary text-xs">
                              {getUserInitials(user.name)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex items-center gap-2">
                            <span className="text-foreground font-medium">{user.name}</span>
                            {userIsAdmin && (
                              <Badge variant="default" className="text-[10px]">
                                Admin
                              </Badge>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Sector toggles */}
                      {activeSectors.map((sector) => {
                        const hasAccess = userIsAdmin || user.sectorIds.includes(sector.id);
                        const toggleKey = `${user.id}-${sector.id}`;
                        const isPending = pendingToggles.has(toggleKey);

                        return (
                          <td key={sector.id} className="px-5 py-3 text-center">
                            <Switch
                              checked={hasAccess}
                              disabled={userIsAdmin || isPending}
                              onCheckedChange={(checked) => handleToggle(user, sector.id, checked)}
                              aria-label={t('permissions.toggleAccess', {
                                user: user.name,
                                sector: sector.name,
                              })}
                            />
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}

                {/* Empty state */}
                {filteredUsers.length === 0 && (
                  <tr>
                    <td
                      colSpan={activeSectors.length + 1}
                      className="text-muted-foreground px-5 py-12 text-center"
                    >
                      {t('noResults')}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </>
  );
}
