'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Video, AlertTriangle } from 'lucide-react';
import { capsuleApi, type CapsuleQuotaDto } from '@/lib/api/capsule.api';
import { cn } from '@/lib/utils';

const WARNING_THRESHOLD = 0.8;

export function CapsuleVideoQuota() {
  const t = useTranslations('capsules.quota');
  const [quota, setQuota] = useState<CapsuleQuotaDto | null>(null);

  useEffect(() => {
    capsuleApi
      .getQuota()
      .then(setQuota)
      .catch(() => setQuota(null));
  }, []);

  if (!quota) return null;

  const usageRatio = quota.used / quota.limit;
  const isWarning = usageRatio >= WARNING_THRESHOLD && usageRatio < 1;
  const isExhausted = quota.remaining <= 0;

  return (
    <div
      className={cn(
        'flex items-center gap-2 rounded-lg border px-3 py-2 text-xs',
        isExhausted && 'border-destructive/50 bg-destructive/5 text-destructive',
        !isExhausted &&
          isWarning &&
          'border-yellow-500/50 bg-yellow-500/5 text-yellow-700 dark:text-yellow-400',
        !isExhausted && !isWarning && 'border-border bg-muted/30 text-muted-foreground',
      )}
    >
      {isExhausted ? (
        <AlertTriangle className="h-3.5 w-3.5 flex-shrink-0" />
      ) : (
        <Video className="h-3.5 w-3.5 flex-shrink-0" />
      )}
      <span>
        {isExhausted ? t('exhausted') : t('used', { used: quota.used, limit: quota.limit })}
      </span>
    </div>
  );
}
