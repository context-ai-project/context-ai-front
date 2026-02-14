'use client';

import { useState, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { Loader2, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { knowledgeApi } from '@/lib/api/knowledge.api';
import type { KnowledgeSourceDto } from '@/lib/api/knowledge.api';

interface DeleteDocumentDialogProps {
  document: KnowledgeSourceDto | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDeleted: (documentId: string) => void;
}

/**
 * DeleteDocumentDialog
 * Confirmation dialog to delete a knowledge source.
 * Calls the API to delete the document and its vector embeddings.
 */
export function DeleteDocumentDialog({
  document,
  open,
  onOpenChange,
  onDeleted,
}: DeleteDocumentDialogProps) {
  const t = useTranslations('documents.deleteConfirm');

  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const handleDelete = useCallback(async () => {
    if (!document) return;

    setIsDeleting(true);
    setDeleteError(null);

    try {
      await knowledgeApi.deleteSource(document.id, document.sectorId);
      onDeleted(document.id);
      onOpenChange(false);
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : t('error'));
    } finally {
      setIsDeleting(false);
    }
  }, [document, onDeleted, onOpenChange, t]);

  const handleOpenChange = useCallback(
    (nextOpen: boolean) => {
      if (!isDeleting) {
        onOpenChange(nextOpen);
        if (!nextOpen) setDeleteError(null);
      }
    },
    [isDeleting, onOpenChange],
  );

  if (!document) return null;

  return (
    <AlertDialog open={open} onOpenChange={handleOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <AlertTriangle className="text-destructive h-5 w-5" />
            {t('title')}
          </AlertDialogTitle>
          <AlertDialogDescription>{t('message', { title: document.title })}</AlertDialogDescription>
        </AlertDialogHeader>

        {deleteError && (
          <div className="rounded-md bg-red-50 p-3 text-sm text-red-700">{deleteError}</div>
        )}

        <AlertDialogFooter>
          <Button variant="outline" onClick={() => handleOpenChange(false)} disabled={isDeleting}>
            {t('cancel')}
          </Button>
          <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
            {isDeleting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {t('deleting')}
              </>
            ) : (
              t('confirm')
            )}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
