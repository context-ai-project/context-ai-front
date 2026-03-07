'use client';

import { useTranslations } from 'next-intl';
import { Input } from '@/components/ui/input';
import { useCapsuleTitle, useSetCapsuleTitle } from '@/stores/capsule.store';

export function CapsuleTitleInput() {
  const t = useTranslations('capsules.wizard');
  const capsuleTitle = useCapsuleTitle();
  const setCapsuleTitle = useSetCapsuleTitle();

  return (
    <div>
      <label htmlFor="capsule-title" className="text-foreground mb-2 block text-sm font-medium">
        {t('capsuleTitle')}
      </label>
      <Input
        id="capsule-title"
        type="text"
        value={capsuleTitle}
        onChange={(e) => setCapsuleTitle(e.target.value)}
        placeholder={t('titlePlaceholder')}
        maxLength={255}
      />
    </div>
  );
}
