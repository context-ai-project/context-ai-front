'use client';

import { useTranslations } from 'next-intl';
import { Loader2 } from 'lucide-react';
import type { CapsuleStatus } from '@/lib/api/capsule.api';

interface CapsuleGenerationProgressProps {
  status: CapsuleStatus;
}

const STEP_LABELS: Record<string, string> = {
  SCRIPT: 'Generating script…',
  AUDIO: 'Synthesizing audio…',
};

export function CapsuleGenerationProgress({ status }: CapsuleGenerationProgressProps) {
  const t = useTranslations('capsules.wizard');

  if (status !== 'GENERATING') return null;

  return (
    <div className="flex flex-col items-center justify-center gap-3 py-8">
      <Loader2 className="text-primary h-8 w-8 animate-spin" />
      <p className="text-muted-foreground text-sm">{t('generatingAudio')}</p>
      <p className="text-muted-foreground text-xs">{STEP_LABELS['AUDIO']}</p>
    </div>
  );
}
