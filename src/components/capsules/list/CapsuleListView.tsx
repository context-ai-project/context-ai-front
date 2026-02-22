'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { useLocale } from 'next-intl';
import { Plus, Headphones } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { CapsuleStatusBadge } from '@/components/capsules/shared/CapsuleStatusBadge';
import { CapsuleTypeBadge } from '@/components/capsules/shared/CapsuleTypeBadge';
import { capsuleApi, type CapsuleDto } from '@/lib/api/capsule.api';
import { routes } from '@/lib/routes';
import { useSession } from 'next-auth/react';
import { getUserRole } from '@/lib/utils/get-user-role';
import { hasPermission, CAN_CREATE_CAPSULES } from '@/constants/permissions';

export function CapsuleListView() {
  const t = useTranslations('capsules');
  const locale = useLocale();
  const { data: session } = useSession();
  const [capsules, setCapsules] = useState<CapsuleDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const userRole = getUserRole(session?.user?.roles);
  const canCreate = hasPermission(userRole, CAN_CREATE_CAPSULES);

  useEffect(() => {
    capsuleApi
      .listCapsules({ limit: 50 })
      .then((res) => {
        setCapsules(res.data);
        setIsLoading(false);
      })
      .catch(() => setIsLoading(false));
  }, []);

  return (
    <div className="flex flex-1 flex-col gap-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-foreground text-2xl font-bold">{t('list.title')}</h1>
        </div>
        {canCreate && (
          <Link href={routes.capsuleCreate(locale)}>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              {t('create')}
            </Button>
          </Link>
        )}
      </div>

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
            <Link key={capsule.id} href={routes.capsuleDetail(locale, capsule.id)}>
              <Card className="hover:border-primary cursor-pointer transition-colors">
                <CardContent className="flex flex-col gap-2 p-4">
                  <div className="flex items-start justify-between gap-2">
                    <h2 className="text-foreground line-clamp-2 text-sm font-semibold">
                      {capsule.title}
                    </h2>
                    <CapsuleStatusBadge status={capsule.status} />
                  </div>
                  <div className="flex items-center gap-2">
                    <CapsuleTypeBadge type={capsule.type} />
                  </div>
                  {capsule.durationSeconds && (
                    <p className="text-muted-foreground text-xs">
                      {Math.floor(capsule.durationSeconds / 60)}:
                      {String(capsule.durationSeconds % 60).padStart(2, '0')} min
                    </p>
                  )}
                  <p className="text-muted-foreground text-xs">
                    {new Date(capsule.createdAt).toLocaleDateString()}
                  </p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
