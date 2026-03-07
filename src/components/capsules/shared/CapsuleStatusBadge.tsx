'use client';

import { useTranslations } from 'next-intl';
import { Badge } from '@/components/ui/badge';
import type { CapsuleStatus } from '@/lib/api/capsule.api';

interface CapsuleStatusBadgeProps {
  status: CapsuleStatus;
}

const STATUS_VARIANT: Record<CapsuleStatus, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  DRAFT: 'outline',
  GENERATING: 'secondary',
  COMPLETED: 'default',
  ACTIVE: 'default',
  FAILED: 'destructive',
  ARCHIVED: 'outline',
};

export function CapsuleStatusBadge({ status }: CapsuleStatusBadgeProps) {
  const t = useTranslations('capsules.status');

  return (
    <Badge variant={STATUS_VARIANT[status]}>
      {t(status.toLowerCase() as Lowercase<CapsuleStatus>)}
    </Badge>
  );
}
