'use client';

import { useState, useCallback, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Mail, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { invitationApi } from '@/lib/api/invitation.api';
import type { Sector } from '@/types/sector.types';

/**
 * Validates email format using a simple check.
 * We avoid complex regex to prevent ReDoS vulnerabilities.
 */
function isValidEmail(email: string): boolean {
  const trimmed = email.trim();
  if (trimmed.length === 0 || trimmed.length > 254) return false;
  const atIndex = trimmed.indexOf('@');
  if (atIndex < 1) return false;
  const dotIndex = trimmed.lastIndexOf('.');
  return dotIndex > atIndex + 1 && dotIndex < trimmed.length - 1;
}

interface InviteUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sectors: Sector[];
  onSuccess?: () => void;
}

/**
 * Dialog for inviting a new user via email.
 * Allows selecting sectors to assign to the invited user.
 */
export function InviteUserDialog({
  open,
  onOpenChange,
  sectors,
  onSuccess,
}: InviteUserDialogProps) {
  const t = useTranslations('admin');

  const [email, setEmail] = useState('');
  const [selectedSectorIds, setSelectedSectorIds] = useState<string[]>([]);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Reset form when dialog opens/closes
  useEffect(() => {
    if (open) {
      setEmail('');
      setSelectedSectorIds([]);
      setError(null);
      setSuccessMessage(null);
    }
  }, [open]);

  const toggleSector = useCallback((sectorId: string) => {
    setSelectedSectorIds((prev) =>
      prev.includes(sectorId) ? prev.filter((id) => id !== sectorId) : [...prev, sectorId],
    );
  }, []);

  const handleSend = async () => {
    setError(null);
    setSuccessMessage(null);

    // Client-side validation
    if (!email.trim()) {
      setError(t('invite.errorInvalidEmail'));
      return;
    }
    if (!isValidEmail(email)) {
      setError(t('invite.errorInvalidEmail'));
      return;
    }

    setIsSending(true);
    try {
      await invitationApi.createInvitation({
        email: email.trim(),
        sectorIds: selectedSectorIds.length > 0 ? selectedSectorIds : undefined,
      });

      setSuccessMessage(t('invite.success', { email: email.trim() }));

      // Close dialog after brief delay to show success
      setTimeout(() => {
        onOpenChange(false);
        onSuccess?.();
      }, 1500);
    } catch (err: unknown) {
      if (err instanceof Error) {
        // Map known backend error messages
        if (err.message.includes('already exists')) {
          setError(t('invite.errorUserExists'));
        } else if (err.message.includes('pending invitation')) {
          setError(t('invite.errorPendingInvitation'));
        } else {
          setError(err.message);
        }
      } else {
        setError(t('invite.error'));
      }
    } finally {
      setIsSending(false);
    }
  };

  const activeSectors = sectors.filter((s) => s.status === 'active');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            {t('invite.title')}
          </DialogTitle>
          <DialogDescription>{t('invite.description')}</DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          {/* Email input */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="invite-email" className="text-sm font-medium">
              {t('invite.email')}
            </label>
            <Input
              id="invite-email"
              type="email"
              placeholder={t('invite.emailPlaceholder')}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isSending}
              autoFocus
            />
          </div>

          {/* Sector selection */}
          {activeSectors.length > 0 && (
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium">{t('invite.sectors')}</label>
              <div className="flex flex-wrap gap-2">
                {activeSectors.map((sector) => {
                  const isSelected = selectedSectorIds.includes(sector.id);
                  return (
                    <Badge
                      key={sector.id}
                      variant={isSelected ? 'default' : 'outline'}
                      className="cursor-pointer gap-1 px-3 py-1.5 text-sm transition-colors select-none"
                      onClick={() => !isSending && toggleSector(sector.id)}
                    >
                      {isSelected && <Check className="h-3 w-3" />}
                      {sector.name}
                    </Badge>
                  );
                })}
              </div>
            </div>
          )}

          {/* Success message */}
          {successMessage && (
            <div className="rounded-md border border-green-300 bg-green-50 p-2 text-sm text-green-700">
              {successMessage}
            </div>
          )}

          {/* Error message */}
          {error && (
            <div className="border-destructive/30 bg-destructive/5 text-destructive rounded-md border p-2 text-sm">
              {error}
            </div>
          )}

          {/* Action buttons */}
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSending}>
              {t('invite.cancel')}
            </Button>
            <Button onClick={handleSend} disabled={isSending || !email.trim()}>
              {isSending ? t('invite.sending') : t('invite.send')}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
