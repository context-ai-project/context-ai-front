'use client';

import { useTranslations } from 'next-intl';
import { Trash2 } from 'lucide-react';
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
import { capsuleApi, type CapsuleDto } from '@/lib/api/capsule.api';

interface DeleteCapsuleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  capsule: CapsuleDto | null;
  onSuccess?: () => void;
}

/**
 * Delete capsule confirmation dialog.
 *
 * Calls DELETE /capsules/:id (soft-delete / archive) and notifies the parent
 * via onSuccess so it can remove the capsule from the list.
 */
export function DeleteCapsuleDialog({
  open,
  onOpenChange,
  capsule,
  onSuccess,
}: DeleteCapsuleDialogProps) {
  const t = useTranslations('capsules.delete');

  if (!capsule) return null;

  const handleDelete = async () => {
    try {
      await capsuleApi.deleteCapsule(capsule.id);
      onSuccess?.();
    } catch {
      // Error is surfaced by the API client; dialog still closes
    }
    onOpenChange(false);
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <div className="flex items-center gap-3">
            <div className="bg-destructive/10 flex h-10 w-10 items-center justify-center rounded-full">
              <Trash2 className="text-destructive h-5 w-5" />
            </div>
            <AlertDialogTitle>{t('title')}</AlertDialogTitle>
          </div>
          <AlertDialogDescription>{t('message', { name: capsule.title })}</AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel asChild>
            <Button variant="outline">{t('cancel')}</Button>
          </AlertDialogCancel>
          <AlertDialogAction asChild>
            <Button variant="destructive" onClick={handleDelete}>
              <Trash2 className="mr-2 h-4 w-4" />
              {t('confirm')}
            </Button>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
