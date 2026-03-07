'use client';

import { useTranslations } from 'next-intl';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useActiveSectors } from '@/stores/sector.store';
import type { CapsuleStatus, CapsuleType, ListCapsulesParams } from '@/lib/api/capsule.api';

const ALL = '__ALL__';

interface CapsuleFiltersProps {
  filters: ListCapsulesParams;
  onChange: (updated: Partial<ListCapsulesParams>) => void;
}

const STATUSES: CapsuleStatus[] = [
  'DRAFT',
  'GENERATING',
  'COMPLETED',
  'ACTIVE',
  'FAILED',
  'ARCHIVED',
];

const TYPES: CapsuleType[] = ['AUDIO', 'VIDEO', 'BOTH'];

export function CapsuleFilters({ filters, onChange }: CapsuleFiltersProps) {
  const t = useTranslations('capsules');
  const activeSectors = useActiveSectors();

  return (
    <div className="flex flex-wrap gap-3">
      {/* Search */}
      <div className="relative min-w-48 flex-1">
        <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
        <Input
          value={filters.search ?? ''}
          onChange={(e) => onChange({ search: e.target.value.trim() || undefined })}
          placeholder={t('list.search')}
          className="pl-9"
        />
      </div>

      {/* Sector filter */}
      <Select
        value={filters.sectorId ?? ALL}
        onValueChange={(v) => onChange({ sectorId: v === ALL ? undefined : v })}
      >
        <SelectTrigger className="w-44">
          <SelectValue placeholder={t('list.filterBySector')} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL}>{t('list.filterBySector')}</SelectItem>
          {activeSectors.map((s) => (
            <SelectItem key={s.id} value={s.id}>
              {s.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Status filter */}
      <Select
        value={filters.status ?? ALL}
        onValueChange={(v) => onChange({ status: v === ALL ? undefined : (v as CapsuleStatus) })}
      >
        <SelectTrigger className="w-40">
          <SelectValue placeholder={t('list.filterByStatus')} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL}>{t('list.filterByStatus')}</SelectItem>
          {STATUSES.map((s) => (
            <SelectItem key={s} value={s}>
              {t(`status.${s.toLowerCase() as Lowercase<CapsuleStatus>}`)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Type filter */}
      <Select
        value={filters.type ?? ALL}
        onValueChange={(v) => onChange({ type: v === ALL ? undefined : (v as CapsuleType) })}
      >
        <SelectTrigger className="w-40">
          <SelectValue placeholder={t('list.filterByType')} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL}>{t('list.filterByType')}</SelectItem>
          {TYPES.map((tp) => (
            <SelectItem key={tp} value={tp}>
              {t(`type.${tp.toLowerCase()}`)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
