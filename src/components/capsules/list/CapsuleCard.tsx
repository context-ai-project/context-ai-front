'use client';

import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import { Headphones, MoreVertical, Trash2, PlayCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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

/** Statuses that allow resuming the creation wizard */
const RESUMABLE_STATUSES = new Set(['DRAFT', 'FAILED']);

interface CapsuleCardProps {
  capsule: CapsuleDto;
  canDelete?: boolean;
  canResume?: boolean;
  onDelete?: (capsule: CapsuleDto) => void;
}

export function CapsuleCard({
  capsule,
  canDelete = false,
  canResume = false,
  onDelete,
}: CapsuleCardProps) {
  const locale = useLocale();
  const t = useTranslations('capsules');

  const isResumable = canResume && RESUMABLE_STATUSES.has(capsule.status);
  const showMenu = (canDelete && !!onDelete) || isResumable;

  return (
    <div className="group relative">
      <Link href={routes.capsuleDetail(locale, capsule.id)}>
        <Card className="hover:border-primary cursor-pointer transition-colors">
          <CardContent className="flex flex-col gap-3 p-4">
            {/* Title and status */}
            <div className="flex items-start justify-between gap-2">
              <h2 className="text-foreground line-clamp-2 text-sm font-semibold">
                {capsule.title}
              </h2>
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

      {/* Actions dropdown — only visible on hover for managers/admins */}
      {showMenu && (
        <div className="absolute top-2 right-2 opacity-0 transition-opacity group-hover:opacity-100">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="bg-background/80 h-7 w-7 rounded-full shadow-sm backdrop-blur-sm"
                onClick={(e) => e.preventDefault()}
              >
                <MoreVertical className="h-3.5 w-3.5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44">
              {isResumable && (
                <DropdownMenuItem asChild>
                  <Link
                    href={routes.capsuleResume(locale, capsule.id)}
                    className="flex items-center gap-2"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <PlayCircle className="h-4 w-4" />
                    {t('actions.resume')}
                  </Link>
                </DropdownMenuItem>
              )}
              {canDelete && onDelete && (
                <DropdownMenuItem
                  onClick={(e) => {
                    e.preventDefault();
                    onDelete(capsule);
                  }}
                  className="text-destructive focus:text-destructive gap-2"
                >
                  <Trash2 className="h-4 w-4" />
                  {t('delete.title')}
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}
    </div>
  );
}
