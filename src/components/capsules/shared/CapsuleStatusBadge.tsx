'use client';

import { useTranslations } from 'next-intl';
import { Badge } from '@/components/ui/badge';
import type { CapsuleStatus } from '@/lib/api/capsule.api';

interface CapsuleStatusBadgeProps {
  status: CapsuleStatus;
}

const STATUS_VARIANT: Record<CapsuleStatus, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  DRAFT: 'outline',
  GENERATING_ASSETS: 'secondary',
  RENDERING: 'secondary',
  COMPLETED: 'default',
  ACTIVE: 'default',
  FAILED: 'destructive',
  ARCHIVED: 'outline',
};

const STATUS_KEY: Record<CapsuleStatus, string> = {
  DRAFT: 'draft',
  GENERATING_ASSETS: 'generatingAssets',
  RENDERING: 'rendering',
  COMPLETED: 'completed',
  ACTIVE: 'active',
  FAILED: 'failed',
  ARCHIVED: 'archived',
};

export function CapsuleStatusBadge({ status }: CapsuleStatusBadgeProps) {
  const t = useTranslations('capsules.status');

  return <Badge variant={STATUS_VARIANT[status]}>{t(STATUS_KEY[status])}</Badge>;
}
