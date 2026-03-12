'use client';

import { useTranslations } from 'next-intl';
import { Loader2, Volume2, Upload, Image, Clapperboard } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import type { CapsuleStatus } from '@/lib/api/capsule.api';
import { useGenerationProgress, useCurrentCapsule } from '@/stores/capsule.store';

interface CapsuleGenerationProgressProps {
  status: CapsuleStatus;
}

function getVideoStageInfo(status: CapsuleStatus, progress: number, t: (key: string) => string) {
  if (status === 'RENDERING') return { Icon: Clapperboard, label: t('assemblingVideo') };
  if (progress < 40) return { Icon: Image, label: t('generatingImages') };
  if (progress < 80) return { Icon: Volume2, label: t('generatingAudio') };
  return { Icon: Upload, label: t('uploading') };
}

function getAudioStageInfo(progress: number, t: (key: string) => string) {
  if (progress >= 80) return { Icon: Upload, label: t('uploading') };
  return { Icon: Volume2, label: t('synthesizing') };
}

export function CapsuleGenerationProgress({ status }: CapsuleGenerationProgressProps) {
  const t = useTranslations('capsules.generation');
  const progress = useGenerationProgress();
  const capsule = useCurrentCapsule();

  if (status !== 'GENERATING_ASSETS' && status !== 'RENDERING') return null;

  const isVideo = capsule?.type === 'VIDEO';
  const { Icon, label } = isVideo
    ? getVideoStageInfo(status, progress, t)
    : getAudioStageInfo(progress, t);
  const hint = isVideo ? t('videoHint') : t('hint');

  return (
    <div className="flex flex-col items-center justify-center gap-4 py-8">
      <div className="bg-primary/10 flex h-14 w-14 items-center justify-center rounded-full">
        <Loader2 className="text-primary h-7 w-7 animate-spin" />
      </div>

      <div className="flex flex-col items-center gap-1">
        <p className="text-foreground text-sm font-medium">{t('title')}</p>
        <div className="text-muted-foreground flex items-center gap-1.5 text-xs">
          <Icon className="h-3.5 w-3.5" />
          {label}
        </div>
      </div>

      <div className="w-full max-w-xs">
        <Progress value={progress} className="h-2" />
        <p className="text-muted-foreground mt-1 text-center text-xs">{progress}%</p>
      </div>

      <p className="text-muted-foreground max-w-xs text-center text-xs">{hint}</p>
    </div>
  );
}
