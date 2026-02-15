'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { FileText, Upload, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import type { KnowledgeSourceDto } from '@/lib/api/knowledge.api';
import { useDocumentUpload, ACCEPTED_MIME_TYPES } from '@/hooks/useDocumentUpload';
import { useActiveSectors } from '@/stores/sector.store';

interface UploadDocumentDialogProps {
  /** Callback when a document is successfully uploaded */
  onDocumentUploaded: (doc: KnowledgeSourceDto) => void;
}

/**
 * Self-contained upload document dialog.
 * Owns its own open state and upload hook (CS-07 refactor).
 */
export function UploadDocumentDialog({ onDocumentUploaded }: UploadDocumentDialogProps) {
  const t = useTranslations('documents');
  const activeSectors = useActiveSectors();
  const [dialogOpen, setDialogOpen] = useState(false);

  // Destructure hook return so individual values are not tainted by the ref
  const {
    file,
    title,
    sectorId,
    isUploading,
    error,
    isDragOver,
    isFormValid,
    fileRef,
    setTitle,
    setSectorId,
    handleFileSelect,
    handleDrop,
    handleDragOver,
    handleDragLeave,
    handleUpload,
    resetForm,
  } = useDocumentUpload();

  const handleDialogChange = (isOpen: boolean) => {
    setDialogOpen(isOpen);
    if (!isOpen) {
      resetForm();
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    const newDoc = await handleUpload(e);
    if (newDoc) {
      onDocumentUploaded(newDoc);
      setDialogOpen(false);
    }
  };

  const triggerFileInput = () => {
    fileRef.current?.click();
  };

  return (
    <Dialog open={dialogOpen} onOpenChange={handleDialogChange}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Upload className="h-4 w-4" />
          {t('uploadButton')}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('uploadDialog.title')}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Document Title */}
          <div className="flex flex-col gap-2">
            <label htmlFor="doc-title" className="text-sm font-medium">
              {t('uploadDialog.documentTitle')}
            </label>
            <Input
              id="doc-title"
              name="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={t('uploadDialog.documentTitlePlaceholder')}
              maxLength={255}
              disabled={isUploading}
              required
            />
          </div>

          {/* Target Sector */}
          <div className="flex flex-col gap-2">
            <label htmlFor="doc-sector" className="text-sm font-medium">
              {t('uploadDialog.targetSector')}
            </label>
            <Select value={sectorId} onValueChange={setSectorId} disabled={isUploading}>
              <SelectTrigger id="doc-sector">
                <SelectValue placeholder={t('uploadDialog.selectSector')} />
              </SelectTrigger>
              <SelectContent>
                {activeSectors.map((s) => (
                  <SelectItem key={s.id} value={s.id}>
                    {s.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* File Drop Zone */}
          <div className="flex flex-col gap-2">
            <label htmlFor="doc-file" className="text-sm font-medium">
              {t('uploadDialog.file')}
            </label>
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onClick={triggerFileInput}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') triggerFileInput();
              }}
              role="button"
              tabIndex={0}
              className={cn(
                'flex cursor-pointer flex-col items-center gap-2 rounded-lg border-2 border-dashed p-6 text-center transition-colors',
                isDragOver
                  ? 'border-primary bg-primary/5'
                  : 'border-border hover:border-primary/50',
                file && 'border-green-500/50 bg-green-50/50',
              )}
            >
              <input
                ref={fileRef}
                id="doc-file"
                type="file"
                className="hidden"
                accept={ACCEPTED_MIME_TYPES}
                onChange={(e) => handleFileSelect(e.target.files?.[0] ?? null)}
              />

              {file ? (
                <div className="flex items-center gap-2">
                  <FileText className="h-6 w-6 text-green-600" />
                  <div>
                    <p className="text-sm font-medium">{file.name}</p>
                    <p className="text-muted-foreground text-xs">
                      {(file.size / 1024).toFixed(1)} KB
                    </p>
                  </div>
                </div>
              ) : (
                <>
                  <Upload className="text-muted-foreground h-8 w-8" />
                  <p className="text-muted-foreground text-sm">
                    {isDragOver ? t('uploadDialog.dropzoneActive') : t('uploadDialog.dropzoneText')}
                  </p>
                </>
              )}
            </div>
          </div>

          {/* Upload Error */}
          {error && (
            <div className="flex items-center gap-2 rounded-md bg-red-50 p-3 text-sm text-red-700">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Submit */}
          <Button type="submit" className="mt-2" disabled={!isFormValid || isUploading}>
            {isUploading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {t('uploadDialog.uploading')}
              </>
            ) : (
              t('uploadAndIndex')
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
