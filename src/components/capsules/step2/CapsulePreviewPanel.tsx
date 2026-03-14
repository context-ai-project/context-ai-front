'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Download, RefreshCw, Mic, Loader2, Video } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CapsuleGenerationProgress } from './CapsuleGenerationProgress';
import {
  useCurrentCapsule,
  useGenerationStatus,
  useIsGeneratingAudio,
  useCapsuleScript,
  useCapsuleError,
  useGenerateAudio,
} from '@/stores/capsule.store';
import { capsuleApi } from '@/lib/api/capsule.api';
import { formatDuration } from '@/lib/utils/format-duration';

export function CapsulePreviewPanel() {
  const t = useTranslations('capsules.wizard');
  const currentCapsule = useCurrentCapsule();
  const generationStatus = useGenerationStatus();
  const isGeneratingAudio = useIsGeneratingAudio();
  const script = useCapsuleScript();
  const error = useCapsuleError();
  const generateAudio = useGenerateAudio();

  const isVideo = currentCapsule?.type === 'VIDEO';

  const [signedAudioUrl, setSignedAudioUrl] = useState<string | null>(null);
  const [signedVideoUrl, setSignedVideoUrl] = useState<string | null>(null);
  const [isLoadingUrl, setIsLoadingUrl] = useState(false);

  useEffect(() => {
    const capsuleId = currentCapsule?.id;
    if (!capsuleId) return;

    async function fetchSignedUrls() {
      setIsLoadingUrl(true);
      try {
        if (currentCapsule?.audioUrl) {
          const { url } = await capsuleApi.getDownloadUrl(capsuleId!, 'audio');
          setSignedAudioUrl(url);
        }
        if (currentCapsule?.videoUrl) {
          const { url } = await capsuleApi.getDownloadUrl(capsuleId!, 'video');
          setSignedVideoUrl(url);
        }
      } catch {
        setSignedAudioUrl(null);
        setSignedVideoUrl(null);
      } finally {
        setIsLoadingUrl(false);
      }
    }

    fetchSignedUrls();
  }, [currentCapsule?.id, currentCapsule?.audioUrl, currentCapsule?.videoUrl]);

  const handleDownloadAudio = () => {
    if (signedAudioUrl) window.open(signedAudioUrl, '_blank');
  };

  const handleDownloadVideo = () => {
    if (signedVideoUrl) window.open(signedVideoUrl, '_blank');
  };

  if (
    isGeneratingAudio ||
    generationStatus === 'GENERATING_ASSETS' ||
    generationStatus === 'RENDERING'
  ) {
    return (
      <div className="flex h-full items-center justify-center p-6">
        <CapsuleGenerationProgress status={generationStatus ?? 'GENERATING_ASSETS'} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-4 p-6 text-center">
        <div className="text-destructive text-sm">{error}</div>
        <Button type="button" variant="outline" size="sm" onClick={generateAudio}>
          <RefreshCw className="mr-2 h-4 w-4" />
          {t('retry')}
        </Button>
      </div>
    );
  }

  if (isVideo && currentCapsule?.videoUrl) {
    return (
      <div className="flex h-full flex-col gap-4 p-6">
        <p className="text-foreground font-medium">{t('videoReady')}</p>

        {currentCapsule.durationSeconds != null && currentCapsule.durationSeconds > 0 && (
          <p className="text-muted-foreground text-sm">
            {t('duration')}: {formatDuration(currentCapsule.durationSeconds)}
          </p>
        )}

        {isLoadingUrl && (
          <div className="flex items-center gap-2 py-4">
            <Loader2 className="text-muted-foreground h-4 w-4 animate-spin" />
            <span className="text-muted-foreground text-sm">Loading video…</span>
          </div>
        )}
        {!isLoadingUrl && signedVideoUrl && (
          <video controls className="w-full rounded-lg" src={signedVideoUrl}>
            <track kind="captions" />
          </video>
        )}
        {!isLoadingUrl && !signedVideoUrl && (
          <p className="text-destructive text-sm">Could not load video preview.</p>
        )}

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleDownloadVideo}
          disabled={!signedVideoUrl}
        >
          <Download className="mr-2 h-4 w-4" />
          {t('downloadVideo')}
        </Button>
      </div>
    );
  }

  if (currentCapsule?.audioUrl) {
    return (
      <div className="flex h-full flex-col gap-4 p-6">
        <p className="text-foreground font-medium">{t('audioReady')}</p>

        {currentCapsule.durationSeconds != null && currentCapsule.durationSeconds > 0 && (
          <p className="text-muted-foreground text-sm">
            {t('duration')}: {formatDuration(currentCapsule.durationSeconds)}
          </p>
        )}

        {isLoadingUrl && (
          <div className="flex items-center gap-2 py-4">
            <Loader2 className="text-muted-foreground h-4 w-4 animate-spin" />
            <span className="text-muted-foreground text-sm">Loading audio…</span>
          </div>
        )}
        {!isLoadingUrl && signedAudioUrl && (
          <audio controls src={signedAudioUrl} className="w-full">
            <track kind="captions" />
          </audio>
        )}
        {!isLoadingUrl && !signedAudioUrl && (
          <p className="text-destructive text-sm">Could not load audio preview.</p>
        )}

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleDownloadAudio}
          disabled={!signedAudioUrl}
        >
          <Download className="mr-2 h-4 w-4" />
          {t('downloadAudio')}
        </Button>
      </div>
    );
  }

  if (script.trim().length > 0) {
    const PlaceholderIcon = isVideo ? Video : Mic;
    return (
      <div className="text-muted-foreground flex h-full flex-col items-center justify-center gap-3 p-6 text-center">
        <PlaceholderIcon className="h-12 w-12 opacity-30" />
        <p className="text-sm">Select a voice and generate to preview it here.</p>
      </div>
    );
  }

  const DefaultIcon = isVideo ? Video : Mic;
  return (
    <div className="text-muted-foreground flex h-full flex-col items-center justify-center gap-3 p-6 text-center">
      <DefaultIcon className="h-12 w-12 opacity-30" />
      <p className="text-sm">{t('previewPlaceholder')}</p>
    </div>
  );
}
