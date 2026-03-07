'use client';

import { Headphones, Video, Layers } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';
import { useCapsuleType, useSetCapsuleType } from '@/stores/capsule.store';
import type { CapsuleType } from '@/lib/api/capsule.api';

interface TypeOption {
  value: CapsuleType;
  labelKey: 'typeAudio' | 'typeVideo' | 'typeBoth';
  Icon: React.ElementType;
  disabled: boolean;
}

const TYPE_OPTIONS: TypeOption[] = [
  { value: 'AUDIO', labelKey: 'typeAudio', Icon: Headphones, disabled: false },
  { value: 'VIDEO', labelKey: 'typeVideo', Icon: Video, disabled: true },
  { value: 'BOTH', labelKey: 'typeBoth', Icon: Layers, disabled: true },
];

export function CapsuleTypeSelector() {
  const t = useTranslations('capsules.wizard');
  const capsuleType = useCapsuleType();
  const setCapsuleType = useSetCapsuleType();

  return (
    <div>
      <p className="text-foreground mb-2 text-sm font-medium">{t('selectType')}</p>
      <div className="grid grid-cols-3 gap-3">
        {TYPE_OPTIONS.map(({ value, labelKey, Icon, disabled }) => (
          <button
            key={value}
            type="button"
            disabled={disabled}
            onClick={() => !disabled && setCapsuleType(value)}
            title={disabled ? 'Disponible próximamente' : undefined}
            className={cn(
              'flex flex-col items-center gap-2 rounded-lg border p-4 text-sm font-medium transition-colors',
              disabled
                ? 'cursor-not-allowed opacity-40'
                : 'hover:border-primary hover:bg-primary/5 cursor-pointer',
              capsuleType === value && !disabled
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
