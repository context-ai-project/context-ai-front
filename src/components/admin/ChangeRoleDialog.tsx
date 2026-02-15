'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { adminApi, type AdminUserResponse } from '@/lib/api/admin.api';

/** Available roles for assignment */
const AVAILABLE_ROLES = ['admin', 'manager', 'user'] as const;

interface ChangeRoleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: AdminUserResponse | null;
  onSuccess: (user: AdminUserResponse) => void;
}

/**
 * Dialog for changing a user's role
 */
export function ChangeRoleDialog({ open, onOpenChange, user, onSuccess }: ChangeRoleDialogProps) {
  const t = useTranslations('admin');
  const [selectedRole, setSelectedRole] = useState<string>('');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize selected role when user changes
  const currentRole = user?.roles?.[0] ?? 'user';

  const handleSave = async () => {
    if (!user || !selectedRole) return;

    setIsSaving(true);
    setError(null);
    try {
      const updated = await adminApi.updateUserRole(user.id, selectedRole);
      onSuccess(updated);
      onOpenChange(false);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : t('roleChange.error');
      setError(message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('roleChange.title')}</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          <p className="text-muted-foreground text-sm">
            {t('roleChange.message', { name: user?.name ?? '' })}
          </p>

          <Select value={selectedRole || currentRole} onValueChange={setSelectedRole}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {AVAILABLE_ROLES.map((role) => (
                <SelectItem key={role} value={role}>
                  {t(`roles.${role}` as Parameters<typeof t>[0])}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {error && (
            <div className="border-destructive/30 bg-destructive/5 text-destructive rounded-md border p-2 text-sm">
              {error}
            </div>
          )}

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSaving}>
              {t('roleChange.cancel')}
            </Button>
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? '...' : t('roleChange.confirm')}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
