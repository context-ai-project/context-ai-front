'use client';

import { useTranslations } from 'next-intl';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useActiveSectors } from '@/stores/sector.store';
import { useSelectedSectorId, useSetSelectedSectorId } from '@/stores/capsule.store';

export function CapsuleSectorSelect() {
  const t = useTranslations('capsules.wizard');
  const activeSectors = useActiveSectors();
  const selectedSectorId = useSelectedSectorId();
  const setSelectedSectorId = useSetSelectedSectorId();

  return (
    <div>
      <label className="text-foreground mb-2 block text-sm font-medium">{t('selectSector')}</label>
      <Select value={selectedSectorId ?? ''} onValueChange={setSelectedSectorId}>
        <SelectTrigger>
          <SelectValue placeholder={t('selectSector')} />
        </SelectTrigger>
        <SelectContent>
          {activeSectors.map((sector) => (
            <SelectItem key={sector.id} value={sector.id}>
              {sector.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
