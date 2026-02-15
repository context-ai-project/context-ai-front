'use client';

import { useTranslations } from 'next-intl';
import { Power, ShieldOff } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import type { Sector } from '@/types/sector.types';
import { useToggleSectorStatus } from '@/stores/sector.store';

interface ToggleStatusDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sector: Sector | null;
  onSuccess?: () => void;
}

/**
 * Dialog to confirm activating or deactivating a sector
 *
 * When deactivated, the sector becomes inaccessible to all users.
 */
export function ToggleStatusDialog({
  open,
  onOpenChange,
  sector,
  onSuccess,
}: ToggleStatusDialogProps) {
  const t = useTranslations('sectors.status');
  const toggleSectorStatus = useToggleSectorStatus();

  if (!sector) return null;

  const isCurrentlyActive = sector.status === 'active';

  const handleToggle = async () => {
    try {
      await toggleSectorStatus(sector.id);
      onSuccess?.();
    } catch {
      // Error is set in the store
    }
    onOpenChange(false);
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <div className="flex items-center gap-3">
            <div
              className={`flex h-10 w-10 items-center justify-center rounded-full ${
                isCurrentlyActive ? 'bg-warning/10' : 'bg-primary/10'
              }`}
            >
              {isCurrentlyActive ? (
                <ShieldOff className="text-warning h-5 w-5" />
              ) : (
                <Power className="text-primary h-5 w-5" />
              )}
            </div>
            <AlertDialogTitle>
              {isCurrentlyActive ? t('deactivateTitle') : t('activateTitle')}
            </AlertDialogTitle>
          </div>
          <AlertDialogDescription>
            {isCurrentlyActive
              ? t('deactivateMessage', { name: sector.name })
              : t('activateMessage', { name: sector.name })}
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel asChild>
            <Button variant="outline">{t('cancel')}</Button>
          </AlertDialogCancel>
          <AlertDialogAction asChild>
            <Button variant={isCurrentlyActive ? 'secondary' : 'default'} onClick={handleToggle}>
              {isCurrentlyActive ? (
                <ShieldOff className="mr-2 h-4 w-4" />
              ) : (
                <Power className="mr-2 h-4 w-4" />
              )}
              {t('confirm')}
            </Button>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
