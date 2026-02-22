'use client';

import { useTranslations } from 'next-intl';
import { Download, RefreshCw, Mic } from 'lucide-react';
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

export function CapsulePreviewPanel() {
  const t = useTranslations('capsules.wizard');
  const currentCapsule = useCurrentCapsule();
  const generationStatus = useGenerationStatus();
  const isGeneratingAudio = useIsGeneratingAudio();
  const script = useCapsuleScript();
  const error = useCapsuleError();
  const generateAudio = useGenerateAudio();

  const handleDownload = async () => {
    if (!currentCapsule?.id) return;
    try {
      const { url } = await capsuleApi.getDownloadUrl(currentCapsule.id, 'audio');
      window.open(url, '_blank');
    } catch {
      // Error is handled by the store
    }
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

  // Audio ready
  if (currentCapsule?.audioUrl) {
    return (
      <div className="flex h-full flex-col gap-4 p-6">
        <p className="text-foreground font-medium">{t('audioReady')}</p>
        <audio controls src={currentCapsule.audioUrl} className="w-full">
          <track kind="captions" />
        </audio>
        <Button type="button" variant="outline" size="sm" onClick={handleDownload}>
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
