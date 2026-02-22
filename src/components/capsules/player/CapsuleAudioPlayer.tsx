'use client';

import { useTranslations } from 'next-intl';
import { Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { capsuleApi } from '@/lib/api/capsule.api';

interface CapsuleAudioPlayerProps {
  capsuleId: string;
  audioUrl: string;
}

export function CapsuleAudioPlayer({ capsuleId, audioUrl }: CapsuleAudioPlayerProps) {
  const t = useTranslations('capsules.player');

  const handleDownload = async () => {
    try {
      const { url } = await capsuleApi.getDownloadUrl(capsuleId, 'audio');
      window.open(url, '_blank');
    } catch {
      // silently ignored — use direct URL as fallback
      window.open(audioUrl, '_blank');
    }
  };

  return (
    <Card>
      <CardContent className="flex flex-col gap-4 p-4">
        <p className="text-foreground text-sm font-medium">{t('playAudio')}</p>
        <audio controls src={audioUrl} className="w-full">
          <track kind="captions" />
        </audio>
        <Button type="button" variant="outline" size="sm" onClick={handleDownload}>
          <Download className="mr-2 h-4 w-4" />
          {t('download')}
        </Button>
      </CardContent>
    </Card>
  );
}
