'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { ArrowLeft, PlayCircle } from 'lucide-react';
import Link from 'next/link';
import { useLocale } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { CapsuleStatusBadge } from '@/components/capsules/shared/CapsuleStatusBadge';
import { CapsuleTypeBadge } from '@/components/capsules/shared/CapsuleTypeBadge';
import { CapsuleAudioPlayer } from './CapsuleAudioPlayer';
import { DeleteCapsuleDialog } from '@/components/capsules/list/DeleteCapsuleDialog';
import { capsuleApi, type CapsuleDto } from '@/lib/api/capsule.api';
import { routes } from '@/lib/routes';
import { useSession } from 'next-auth/react';
import { getUserRole } from '@/lib/utils/get-user-role';
import { hasPermission, CAN_CREATE_CAPSULES, CAN_DELETE_CAPSULES } from '@/constants/permissions';

interface CapsulePlayerViewProps {
  capsuleId: string;
}

/** Format duration in seconds to m:ss */
function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = String(seconds % 60).padStart(2, '0');
  return `${m}:${s} min`;
}

export function CapsulePlayerView({ capsuleId }: CapsulePlayerViewProps) {
  const t = useTranslations('capsules');
  const locale = useLocale();
  const { data: session } = useSession();
  const [capsule, setCapsule] = useState<CapsuleDto | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isActing, setIsActing] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const userRole = getUserRole(session?.user?.roles);
  const canManage = hasPermission(userRole, CAN_CREATE_CAPSULES);
  const canDelete = hasPermission(userRole, CAN_DELETE_CAPSULES);

  useEffect(() => {
    capsuleApi
      .getCapsule(capsuleId)
      .then((data) => {
        setCapsule(data);
        setIsLoading(false);
      })
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : 'Failed to load capsule.');
        setIsLoading(false);
      });
  }, [capsuleId]);

  const handlePublish = async () => {
    if (!capsule) return;
    setIsActing(true);
    try {
      const updated = await capsuleApi.publishCapsule(capsule.id);
      setCapsule(updated);
    } catch {
      // silently ignored
    } finally {
      setIsActing(false);
    }
  };

  const handleArchive = async () => {
    if (!capsule) return;
    setIsActing(true);
    try {
      const updated = await capsuleApi.archiveCapsule(capsule.id);
      setCapsule(updated);
    } catch {
      // silently ignored
    } finally {
      setIsActing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-1 items-center justify-center p-6">
        <p className="text-muted-foreground text-sm">Loading…</p>
      </div>
    );
  }

  if (error || !capsule) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4 p-6">
        <p className="text-destructive text-sm">{error ?? 'Capsule not found.'}</p>
        <Link href={routes.capsules(locale)}>
          <Button variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col gap-6 p-6">
      {/* Breadcrumb */}
      <Link
        href={routes.capsules(locale)}
        className="text-muted-foreground hover:text-foreground flex items-center gap-1.5 text-sm transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        {t('list.title')}
      </Link>

      {/* Title + badges + management actions */}
      <div className="flex flex-col gap-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <CapsuleStatusBadge status={capsule.status} />
            <CapsuleTypeBadge type={capsule.type} />
          </div>
          {(canManage || canDelete) && (
            <div className="flex items-center gap-2">
              {canManage && (capsule.status === 'DRAFT' || capsule.status === 'FAILED') && (
                <Link href={routes.capsuleResume(locale, capsule.id)}>
                  <Button size="sm" variant="outline" disabled={isActing}>
                    <PlayCircle className="mr-2 h-4 w-4" />
                    {t('actions.resume')}
                  </Button>
                </Link>
              )}
              {canManage && capsule.status === 'COMPLETED' && (
                <Button size="sm" onClick={handlePublish} disabled={isActing}>
                  {t('actions.publish')}
                </Button>
              )}
              {canManage && (capsule.status === 'ACTIVE' || capsule.status === 'COMPLETED') && (
                <Button size="sm" variant="outline" onClick={handleArchive} disabled={isActing}>
                  {t('actions.archive')}
                </Button>
              )}
              {canDelete && (
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => setDeleteDialogOpen(true)}
                  disabled={isActing}
                >
                  {t('actions.delete')}
                </Button>
              )}
            </div>
          )}
        </div>
        <h1 className="text-foreground text-2xl font-bold">{capsule.title}</h1>
      </div>

      {/* Audio player — audioUrl holds the GCS storage path; signed URL fetched inside component */}
      {capsule.audioUrl && <CapsuleAudioPlayer capsuleId={capsule.id} />}

      {/* Metadata */}
      <Card>
        <CardContent className="grid grid-cols-2 gap-4 p-4 text-sm">
          {capsule.sectorName && (
            <div>
              <p className="text-muted-foreground text-xs">{t('player.sector')}</p>
              <p className="text-foreground font-medium">{capsule.sectorName}</p>
            </div>
          )}
          {capsule.durationSeconds && (
            <div>
              <p className="text-muted-foreground text-xs">{t('player.duration')}</p>
              <p className="text-foreground font-medium">
                {formatDuration(capsule.durationSeconds)}
              </p>
            </div>
          )}
          <div>
            <p className="text-muted-foreground text-xs">{t('player.createdAt')}</p>
            <p className="text-foreground font-medium">
              {new Date(capsule.createdAt).toLocaleDateString()}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Delete confirmation dialog */}
      <DeleteCapsuleDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        capsule={capsule}
        onSuccess={() => {
          // Navigate back to the list after deletion
          window.location.href = routes.capsules(locale);
        }}
      />
    </div>
  );
}
