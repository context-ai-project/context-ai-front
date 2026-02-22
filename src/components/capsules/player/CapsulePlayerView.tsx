'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { ArrowLeft, Download } from 'lucide-react';
import Link from 'next/link';
import { useLocale } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { CapsuleStatusBadge } from '@/components/capsules/shared/CapsuleStatusBadge';
import { CapsuleTypeBadge } from '@/components/capsules/shared/CapsuleTypeBadge';
import { capsuleApi, type CapsuleDto } from '@/lib/api/capsule.api';
import { routes } from '@/lib/routes';

interface CapsulePlayerViewProps {
  capsuleId: string;
}

export function CapsulePlayerView({ capsuleId }: CapsulePlayerViewProps) {
  const t = useTranslations('capsules');
  const locale = useLocale();
  const [capsule, setCapsule] = useState<CapsuleDto | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  const handleDownload = async () => {
    if (!capsule?.id) return;
    try {
      const { url } = await capsuleApi.getDownloadUrl(capsule.id, 'audio');
      window.open(url, '_blank');
    } catch {
      // silently ignored
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

      {/* Title and badges */}
      <div className="flex flex-col gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <CapsuleStatusBadge status={capsule.status} />
          <CapsuleTypeBadge type={capsule.type} />
        </div>
        <h1 className="text-foreground text-2xl font-bold">{capsule.title}</h1>
      </div>

      {/* Audio player */}
      {capsule.audioUrl && (
        <Card>
          <CardContent className="flex flex-col gap-4 p-4">
            <p className="text-foreground text-sm font-medium">{t('player.playAudio')}</p>
            <audio controls src={capsule.audioUrl} className="w-full">
              <track kind="captions" />
            </audio>
            <Button type="button" variant="outline" size="sm" onClick={handleDownload}>
              <Download className="mr-2 h-4 w-4" />
              {t('player.download')}
            </Button>
          </CardContent>
        </Card>
      )}

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
                {Math.floor(capsule.durationSeconds / 60)}:
                {String(capsule.durationSeconds % 60).padStart(2, '0')} min
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
    </div>
  );
}
