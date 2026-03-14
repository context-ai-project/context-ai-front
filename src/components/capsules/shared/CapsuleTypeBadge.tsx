'use client';

import { Headphones, Video } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import type { CapsuleType } from '@/lib/api/capsule.api';

interface CapsuleTypeBadgeProps {
  type: CapsuleType;
}

const TYPE_ICON: Record<CapsuleType, React.ElementType> = {
  AUDIO: Headphones,
  VIDEO: Video,
};

const TYPE_LABEL: Record<CapsuleType, string> = {
  AUDIO: 'Audio',
  VIDEO: 'Video',
};

export function CapsuleTypeBadge({ type }: CapsuleTypeBadgeProps) {
  const Icon = TYPE_ICON[type];

  return (
    <Badge variant="secondary" className="gap-1">
      <Icon className="h-3 w-3" />
      {TYPE_LABEL[type]}
    </Badge>
  );
}
