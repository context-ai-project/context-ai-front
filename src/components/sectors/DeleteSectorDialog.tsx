'use client';

import { useTranslations } from 'next-intl';
import { Trash2, AlertTriangle, FileText } from 'lucide-react';
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
import { useDeleteSector } from '@/stores/sector.store';

interface DeleteSectorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sector: Sector | null;
  onSuccess?: () => void;
}

/**
 * Delete sector confirmation dialog
 *
 * Rules:
 * - Cannot delete a sector that has associated documents (documentCount > 0)
 * - Shows a warning with document count when deletion is blocked
 * - Shows a destructive confirmation when deletion is allowed
 */
export function DeleteSectorDialog({
  open,
  onOpenChange,
  sector,
  onSuccess,
}: DeleteSectorDialogProps) {
  const t = useTranslations('sectors.delete');
  const deleteSector = useDeleteSector();

  if (!sector) return null;

  const hasDocuments = sector.documentCount > 0;

  const handleDelete = async () => {
    try {
      const success = await deleteSector(sector.id);
      if (success) {
        onSuccess?.();
      }
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
            <div className="bg-destructive/10 flex h-10 w-10 items-center justify-center rounded-full">
              {hasDocuments ? (
                <AlertTriangle className="text-destructive h-5 w-5" />
              ) : (
                <Trash2 className="text-destructive h-5 w-5" />
              )}
            </div>
            <AlertDialogTitle>{t('title')}</AlertDialogTitle>
          </div>

          {hasDocuments ? (
            <div className="border-destructive/20 bg-destructive/5 mt-2 flex items-start gap-3 rounded-md border p-4">
              <FileText className="text-destructive mt-0.5 h-5 w-5 shrink-0" />
              <AlertDialogDescription className="text-destructive">
                {t('hasDocuments', { count: sector.documentCount })}
              </AlertDialogDescription>
            </div>
          ) : (
            <AlertDialogDescription>{t('message', { name: sector.name })}</AlertDialogDescription>
          )}
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel asChild>
            <Button variant="outline">{t('cancel')}</Button>
          </AlertDialogCancel>

          {!hasDocuments && (
            <AlertDialogAction asChild>
              <Button variant="destructive" onClick={handleDelete}>
                <Trash2 className="mr-2 h-4 w-4" />
                {t('confirm')}
              </Button>
            </AlertDialogAction>
          )}
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
