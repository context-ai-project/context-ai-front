'use client';

import { useState, useEffect, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { Users, ShieldCheck } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { adminApi, type AdminUserResponse } from '@/lib/api/admin.api';
import { sectorApi } from '@/lib/api/sector.api';
import type { Sector } from '@/types/sector.types';
import { UsersTab } from './UsersTab';
import { PermissionsTab } from './PermissionsTab';

/**
 * Main admin view with Users and Permissions tabs
 * Follows the prototype layout from context-ai-prototype
 */
export function AdminView() {
  const t = useTranslations('admin');

  const [users, setUsers] = useState<AdminUserResponse[]>([]);
  const [sectors, setSectors] = useState<Sector[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [usersData, sectorsData] = await Promise.all([
        adminApi.listUsers(),
        sectorApi.listSectors(),
      ]);
      setUsers(usersData);
      setSectors(sectorsData);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : t('error');
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, [t]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  /**
   * Update a single user in the local state after a mutation
   */
  const handleUserUpdated = useCallback((updated: AdminUserResponse) => {
    setUsers((prev) => prev.map((u) => (u.id === updated.id ? updated : u)));
  }, []);

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-foreground text-2xl font-bold">{t('title')}</h1>
        <p className="text-muted-foreground mt-1 text-sm">{t('subtitle')}</p>
      </div>

      <Tabs defaultValue="users">
        <TabsList className="mb-6">
          <TabsTrigger value="users" className="gap-2">
            <Users className="h-4 w-4" />
            {t('tabs.users')}
          </TabsTrigger>
          <TabsTrigger value="permissions" className="gap-2">
            <ShieldCheck className="h-4 w-4" />
            {t('tabs.permissions')}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="users">
          <UsersTab
            users={users}
            sectors={sectors}
            isLoading={isLoading}
            error={error}
            onUserUpdated={handleUserUpdated}
            onInviteSent={fetchData}
          />
        </TabsContent>

        <TabsContent value="permissions">
          <PermissionsTab users={users} sectors={sectors} onUserUpdated={handleUserUpdated} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
