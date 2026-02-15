'use client';

import { FileText } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { Sector } from '@/types/sector.types';
import { SectorIconRenderer } from './sector-icons';

interface SectorCardProps {
  sector: Sector;
  onClick: (sector: Sector) => void;
}

/**
 * Sector card component
 * Displays a sector summary in a clickable card.
 * Click opens the view/edit dialog.
 */
export function SectorCard({ sector, onClick }: SectorCardProps) {
  const t = useTranslations('sectors');
  const isActive = sector.status === 'active';

  const formattedDate = new Date(sector.updatedAt).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <Card
      className={cn(
        'group hover:border-primary/30 cursor-pointer transition-all hover:shadow-md',
        !isActive && 'opacity-60',
      )}
      onClick={() => onClick(sector)}
      role="button"
      tabIndex={0}
      aria-label={`${sector.name} — ${isActive ? t('active') : t('inactive')}`}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick(sector);
        }
      }}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          {/* Sector avatar/icon */}
          <div
            className={cn(
              'flex h-10 w-10 items-center justify-center rounded-lg transition-colors',
              isActive
                ? 'bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground'
                : 'bg-muted text-muted-foreground',
            )}
          >
            <SectorIconRenderer icon={sector.icon} className="h-5 w-5" />
          </div>

          {/* Status badge */}
          <Badge variant={isActive ? 'default' : 'secondary'} className="text-xs">
            {isActive ? t('active') : t('inactive')}
          </Badge>
        </div>

        <CardTitle className="mt-3 text-lg">{sector.name}</CardTitle>
        <CardDescription className="line-clamp-2 text-sm">{sector.description}</CardDescription>
      </CardHeader>

      <CardContent>
        <div className="text-muted-foreground flex gap-6 text-sm">
          <div className="flex items-center gap-1.5">
            <FileText className="h-4 w-4" />
            {t('documentCount', { count: sector.documentCount })}
          </div>
        </div>
        <p className="text-muted-foreground mt-3 text-xs">
          {t('updatedAt', { date: formattedDate })}
        </p>
      </CardContent>
    </Card>
  );
}
