'use client';

import Link from 'next/link';
import { useLocale } from 'next-intl';
import { Headphones } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { CapsuleStatusBadge } from '@/components/capsules/shared/CapsuleStatusBadge';
import { CapsuleTypeBadge } from '@/components/capsules/shared/CapsuleTypeBadge';
import { routes } from '@/lib/routes';
import type { CapsuleDto } from '@/lib/api/capsule.api';

/** Format duration in seconds to m:ss */
function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = String(seconds % 60).padStart(2, '0');
  return `${m}:${s} min`;
}

interface CapsuleCardProps {
  capsule: CapsuleDto;
}

export function CapsuleCard({ capsule }: CapsuleCardProps) {
  const locale = useLocale();

  return (
    <Link href={routes.capsuleDetail(locale, capsule.id)}>
      <Card className="hover:border-primary cursor-pointer transition-colors">
        <CardContent className="flex flex-col gap-3 p-4">
          {/* Title and status */}
          <div className="flex items-start justify-between gap-2">
            <h2 className="text-foreground line-clamp-2 text-sm font-semibold">{capsule.title}</h2>
            <CapsuleStatusBadge status={capsule.status} />
          </div>

          {/* Type badge */}
          <div className="flex items-center gap-2">
            <CapsuleTypeBadge type={capsule.type} />
          </div>

          {/* Sector name */}
          {capsule.sectorName && (
            <p className="text-muted-foreground truncate text-xs">{capsule.sectorName}</p>
          )}

          {/* Footer: duration + date */}
          <div className="flex items-center justify-between">
            {capsule.durationSeconds ? (
              <div className="text-muted-foreground flex items-center gap-1 text-xs">
                <Headphones className="h-3 w-3" />
                {formatDuration(capsule.durationSeconds)}
              </div>
            ) : (
              <span />
            )}
            <p className="text-muted-foreground text-xs">
              {new Date(capsule.createdAt).toLocaleDateString()}
            </p>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
