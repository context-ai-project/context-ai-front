'use client';

import { useTranslations } from 'next-intl';
import { Loader2, Volume2, Upload } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import type { CapsuleStatus } from '@/lib/api/capsule.api';
import { useGenerationProgress } from '@/stores/capsule.store';

interface CapsuleGenerationProgressProps {
  status: CapsuleStatus;
}

export function CapsuleGenerationProgress({ status }: CapsuleGenerationProgressProps) {
  const t = useTranslations('capsules.generation');
  const progress = useGenerationProgress();

  if (status !== 'GENERATING') return null;

  const isUploading = progress >= 80;
  const Icon = isUploading ? Upload : Volume2;
  const label = isUploading ? t('uploading') : t('synthesizing');

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

      {/* Progress bar */}
      <div className="w-full max-w-xs">
        <Progress value={progress} className="h-2" />
        <p className="text-muted-foreground mt-1 text-center text-xs">{progress}%</p>
      </div>

      <p className="text-muted-foreground max-w-xs text-center text-xs">{t('hint')}</p>
    </div>
  );
}
