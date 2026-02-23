'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { useLocale } from 'next-intl';
import { Plus, Headphones } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { CapsuleCard } from './CapsuleCard';
import { CapsuleFilters } from './CapsuleFilters';
import { DeleteCapsuleDialog } from './DeleteCapsuleDialog';
import { capsuleApi, type CapsuleDto, type ListCapsulesParams } from '@/lib/api/capsule.api';
import { routes } from '@/lib/routes';
import { useSession } from 'next-auth/react';
import { getUserRole } from '@/lib/utils/get-user-role';
import { hasPermission, CAN_CREATE_CAPSULES, CAN_DELETE_CAPSULES } from '@/constants/permissions';

const DEFAULT_FILTERS: ListCapsulesParams = { limit: 50 };

export function CapsuleListView() {
  const t = useTranslations('capsules');
  const locale = useLocale();
  const { data: session } = useSession();
  const [capsules, setCapsules] = useState<CapsuleDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState<ListCapsulesParams>(DEFAULT_FILTERS);
  const [selectedCapsule, setSelectedCapsule] = useState<CapsuleDto | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const userRole = getUserRole(session?.user?.roles);
  const canCreate = hasPermission(userRole, CAN_CREATE_CAPSULES);
  const canDelete = hasPermission(userRole, CAN_DELETE_CAPSULES);
  // Managers and admins (those who can create) can also resume DRAFT/FAILED capsules
  const canResume = canCreate;

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setIsLoading(true);
      try {
        const res = await capsuleApi.listCapsules(filters);
        if (!cancelled) setCapsules(res.data);
      } catch {
        // leave list empty on error
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [filters]);

  const handleFilterChange = (updated: Partial<ListCapsulesParams>) => {
    setFilters((prev) => ({ ...prev, ...updated }));
  };

  const handleDeleteClick = (capsule: CapsuleDto) => {
    setSelectedCapsule(capsule);
    setDeleteDialogOpen(true);
  };

  const handleDeleteSuccess = () => {
    setCapsules((prev) => prev.filter((c) => c.id !== selectedCapsule?.id));
    setSelectedCapsule(null);
  };

  return (
    <div className="flex flex-1 flex-col gap-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-foreground text-2xl font-bold">{t('title')}</h1>
        {canCreate && (
          <Link href={routes.capsuleCreate(locale)}>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              {t('create')}
            </Button>
          </Link>
        )}
      </div>

      {/* Filters */}
      <CapsuleFilters filters={filters} onChange={handleFilterChange} />

      {/* Loading skeletons */}
      {isLoading && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="h-36 p-4" />
            </Card>
          ))}
        </div>
      )}

      {/* Empty state */}
      {!isLoading && capsules.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <Headphones className="text-muted-foreground mb-4 h-12 w-12" />
            <p className="text-muted-foreground text-sm">{t('list.empty')}</p>
            {canCreate && (
              <Link href={routes.capsuleCreate(locale)} className="mt-4">
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  {t('create')}
                </Button>
              </Link>
            )}
          </CardContent>
        </Card>
      )}

      {/* Capsule cards */}
      {!isLoading && capsules.length > 0 && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {capsules.map((capsule) => (
            <CapsuleCard
              key={capsule.id}
              capsule={capsule}
              canDelete={canDelete}
              canResume={canResume}
              onDelete={handleDeleteClick}
            />
          ))}
        </div>
      )}

      {/* Delete confirmation dialog */}
      <DeleteCapsuleDialog
        open={deleteDialogOpen}
        onOpenChange={(open) => {
          setDeleteDialogOpen(open);
          if (!open) setSelectedCapsule(null);
        }}
        capsule={selectedCapsule}
        onSuccess={handleDeleteSuccess}
      />
    </div>
  );
}
