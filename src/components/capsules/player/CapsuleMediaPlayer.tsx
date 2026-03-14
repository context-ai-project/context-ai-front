'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { capsuleApi } from '@/lib/api/capsule.api';

/**
 * Unified media player for capsule audio and video (CS-04).
 *
 * Replaces the near-identical CapsuleAudioPlayer and CapsuleVideoPlayer
 * with a single parametrized component.
 */

interface CapsuleMediaPlayerProps {
  capsuleId: string;
  type: 'audio' | 'video';
}

export function CapsuleMediaPlayer({ capsuleId, type }: CapsuleMediaPlayerProps) {
  const t = useTranslations('capsules.player');
  const [signedUrl, setSignedUrl] = useState<string | null>(null);
  const [isLoadingUrl, setIsLoadingUrl] = useState(true);

  useEffect(() => {
    capsuleApi
      .getDownloadUrl(capsuleId, type)
      .then(({ url }) => setSignedUrl(url))
      .catch(() => setSignedUrl(null))
      .finally(() => setIsLoadingUrl(false));
  }, [capsuleId, type]);

  const handleDownload = () => {
    if (signedUrl) window.open(signedUrl, '_blank');
  };

  const label = type === 'video' ? t('playVideo') : t('playAudio');
  const downloadLabel = type === 'video' ? t('downloadVideo') : t('download');
  const loadingLabel = `Loading ${type}…`;
  const unavailableLabel = `${type.charAt(0).toUpperCase() + type.slice(1)} not available.`;

  if (isLoadingUrl) {
    return (
      <Card>
        <CardContent className="p-4">
          <p className="text-muted-foreground text-sm">{loadingLabel}</p>
        </CardContent>
      </Card>
    );
  }

  if (!signedUrl) {
    return (
      <Card>
        <CardContent className="p-4">
          <p className="text-destructive text-sm">{unavailableLabel}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="flex flex-col gap-4 p-4">
        <p className="text-foreground text-sm font-medium">{label}</p>
        {type === 'video' ? (
          <video controls className="w-full rounded-lg" src={signedUrl}>
            <track kind="captions" />
          </video>
        ) : (
          <audio controls src={signedUrl} className="w-full">
            <track kind="captions" />
          </audio>
        )}
        <Button type="button" variant="outline" size="sm" onClick={handleDownload}>
          <Download className="mr-2 h-4 w-4" />
          {downloadLabel}
        </Button>
      </CardContent>
    </Card>
  );
}
