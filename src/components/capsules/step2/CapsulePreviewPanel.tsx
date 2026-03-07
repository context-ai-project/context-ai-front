'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Download, RefreshCw, Mic, Loader2 } from 'lucide-react';
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

/** Format duration in seconds to m:ss */
function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = String(seconds % 60).padStart(2, '0');
  return `${m}:${s} min`;
}

export function CapsulePreviewPanel() {
  const t = useTranslations('capsules.wizard');
  const currentCapsule = useCurrentCapsule();
  const generationStatus = useGenerationStatus();
  const isGeneratingAudio = useIsGeneratingAudio();
  const script = useCapsuleScript();
  const error = useCapsuleError();
  const generateAudio = useGenerateAudio();

  // Signed URL for the audio player — audioUrl is a GCS storage path, not a playable URL
  const [signedUrl, setSignedUrl] = useState<string | null>(null);
  const [isLoadingUrl, setIsLoadingUrl] = useState(false);

  // Fetch a signed URL whenever the capsule has an audioUrl
  useEffect(() => {
    const capsuleId = currentCapsule?.id;
    const audioUrl = currentCapsule?.audioUrl;

    if (!capsuleId || !audioUrl) {
      return;
    }

    async function fetchSignedUrl() {
      setIsLoadingUrl(true);
      try {
        const { url } = await capsuleApi.getDownloadUrl(capsuleId!, 'audio');
        setSignedUrl(url);
      } catch {
        setSignedUrl(null);
      } finally {
        setIsLoadingUrl(false);
      }
    }

    fetchSignedUrl();
  }, [currentCapsule?.id, currentCapsule?.audioUrl]);

  const handleDownload = () => {
    if (signedUrl) window.open(signedUrl, '_blank');
  };

  // Generating audio
  if (isGeneratingAudio || generationStatus === 'GENERATING') {
    return (
      <div className="flex h-full items-center justify-center p-6">
        <CapsuleGenerationProgress status="GENERATING" />
      </div>
    );
  }

  // Error state
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

  // Audio ready — use signed URL for playback
  if (currentCapsule?.audioUrl) {
    return (
      <div className="flex h-full flex-col gap-4 p-6">
        <p className="text-foreground font-medium">{t('audioReady')}</p>

        {/* Duration from backend metadata */}
        {currentCapsule.durationSeconds != null && currentCapsule.durationSeconds > 0 && (
          <p className="text-muted-foreground text-sm">
            {t('duration')}: {formatDuration(currentCapsule.durationSeconds)}
          </p>
        )}

        {/* Audio player with signed URL */}
        {isLoadingUrl && (
          <div className="flex items-center gap-2 py-4">
            <Loader2 className="text-muted-foreground h-4 w-4 animate-spin" />
            <span className="text-muted-foreground text-sm">Loading audio…</span>
          </div>
        )}
        {!isLoadingUrl && signedUrl && (
          <audio controls src={signedUrl} className="w-full">
            <track kind="captions" />
          </audio>
        )}
        {!isLoadingUrl && !signedUrl && (
          <p className="text-destructive text-sm">Could not load audio preview.</p>
        )}

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleDownload}
          disabled={!signedUrl}
        >
          <Download className="mr-2 h-4 w-4" />
          {t('downloadAudio')}
        </Button>
      </div>
    );
  }

  // Script written but no audio yet
  if (script.trim().length > 0) {
    return (
      <div className="text-muted-foreground flex h-full flex-col items-center justify-center gap-3 p-6 text-center">
        <Mic className="h-12 w-12 opacity-30" />
        <p className="text-sm">Select a voice and generate the audio to preview it here.</p>
      </div>
    );
  }

  // Default placeholder
  return (
    <div className="text-muted-foreground flex h-full flex-col items-center justify-center gap-3 p-6 text-center">
      <Mic className="h-12 w-12 opacity-30" />
      <p className="text-sm">{t('previewPlaceholder')}</p>
    </div>
  );
}
