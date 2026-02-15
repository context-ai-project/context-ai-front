'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { adminApi, type AdminUserResponse } from '@/lib/api/admin.api';

interface ToggleUserStatusDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: AdminUserResponse | null;
  onSuccess: (user: AdminUserResponse) => void;
}

/**
 * Dialog for activating or deactivating a user
 */
export function ToggleUserStatusDialog({
  open,
  onOpenChange,
  user,
  onSuccess,
}: ToggleUserStatusDialogProps) {
  const t = useTranslations('admin');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const willActivate = user ? !user.isActive : true;

  const handleConfirm = async () => {
    if (!user) return;

    setIsSaving(true);
    setError(null);
    try {
      const updated = await adminApi.toggleUserStatus(user.id, willActivate);
      onSuccess(updated);
      onOpenChange(false);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : t('statusChange.error');
      setError(message);
    } finally {
      setIsSaving(false);
    }
  };

  const title = willActivate ? t('statusChange.activateTitle') : t('statusChange.deactivateTitle');

  const message = willActivate
    ? t('statusChange.activateMessage', { name: user?.name ?? '' })
    : t('statusChange.deactivateMessage', { name: user?.name ?? '' });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          <p className="text-muted-foreground text-sm">{message}</p>

          {error && (
            <div className="border-destructive/30 bg-destructive/5 text-destructive rounded-md border p-2 text-sm">
              {error}
            </div>
          )}

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSaving}>
              {t('statusChange.cancel')}
            </Button>
            <Button
              variant={willActivate ? 'default' : 'destructive'}
              onClick={handleConfirm}
              disabled={isSaving}
            >
              {isSaving ? '...' : t('statusChange.confirm')}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
