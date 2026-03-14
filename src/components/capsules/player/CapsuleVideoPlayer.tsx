'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { capsuleApi } from '@/lib/api/capsule.api';

interface CapsuleVideoPlayerProps {
  capsuleId: string;
}

export function CapsuleVideoPlayer({ capsuleId }: CapsuleVideoPlayerProps) {
  const t = useTranslations('capsules.player');
  const [signedUrl, setSignedUrl] = useState<string | null>(null);
  const [isLoadingUrl, setIsLoadingUrl] = useState(true);

  useEffect(() => {
    capsuleApi
      .getDownloadUrl(capsuleId, 'video')
      .then(({ url }) => setSignedUrl(url))
      .catch(() => setSignedUrl(null))
      .finally(() => setIsLoadingUrl(false));
  }, [capsuleId]);

  const handleDownload = () => {
    if (signedUrl) window.open(signedUrl, '_blank');
  };

  if (isLoadingUrl) {
    return (
      <Card>
        <CardContent className="p-4">
          <p className="text-muted-foreground text-sm">Loading video…</p>
        </CardContent>
      </Card>
    );
  }

  if (!signedUrl) {
    return (
      <Card>
        <CardContent className="p-4">
          <p className="text-destructive text-sm">Video not available.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="flex flex-col gap-4 p-4">
        <p className="text-foreground text-sm font-medium">{t('playVideo')}</p>
        <video controls className="w-full rounded-lg" src={signedUrl}>
          <track kind="captions" />
        </video>
        <Button type="button" variant="outline" size="sm" onClick={handleDownload}>
          <Download className="mr-2 h-4 w-4" />
          {t('downloadVideo')}
        </Button>
      </CardContent>
    </Card>
  );
}
