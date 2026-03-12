'use client';

import { Headphones, Video } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';
import { useCapsuleType, useSetCapsuleType } from '@/stores/capsule.store';
import type { CapsuleType } from '@/lib/api/capsule.api';

interface TypeOption {
  value: CapsuleType;
  labelKey: 'typeAudio' | 'typeVideo';
  Icon: React.ElementType;
}

const TYPE_OPTIONS: TypeOption[] = [
  { value: 'AUDIO', labelKey: 'typeAudio', Icon: Headphones },
  { value: 'VIDEO', labelKey: 'typeVideo', Icon: Video },
];

export function CapsuleTypeSelector() {
  const t = useTranslations('capsules.wizard');
  const capsuleType = useCapsuleType();
  const setCapsuleType = useSetCapsuleType();

  return (
    <div>
      <p className="text-foreground mb-2 text-sm font-medium">{t('selectType')}</p>
      <div className="grid grid-cols-2 gap-3">
        {TYPE_OPTIONS.map(({ value, labelKey, Icon }) => (
          <button
            key={value}
            type="button"
            onClick={() => setCapsuleType(value)}
            className={cn(
              'flex flex-col items-center gap-2 rounded-lg border p-4 text-sm font-medium transition-colors',
              'hover:border-primary hover:bg-primary/5 cursor-pointer',
              capsuleType === value
                ? 'border-primary bg-primary/10 text-primary'
                : 'border-border text-foreground',
            )}
          >
            <Icon className="h-6 w-6" />
            {t(labelKey)}
          </button>
        ))}
      </div>
    </div>
  );
}
