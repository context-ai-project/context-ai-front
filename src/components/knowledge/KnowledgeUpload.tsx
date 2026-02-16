'use client';

import { useState, useCallback, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { useTranslations } from 'next-intl';
import { Upload, FileText, CheckCircle, AlertCircle, X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useActiveSectors } from '@/stores/sector.store';
import type { SourceType } from '@/lib/api/knowledge.api';
import { useUploadDocument } from '@/hooks/useUploadDocument';
import { getUserRole } from '@/lib/utils/get-user-role';
import { hasPermission, CAN_UPLOAD } from '@/constants/permissions';
import {
  MAX_FILE_SIZE_BYTES,
  ACCEPTED_MIME_TYPES,
  detectSourceType,
} from '@/lib/utils/file-detection';
import { cn } from '@/lib/utils';

/**
 * Knowledge Upload component
 * Allows admin/manager users to upload documents to the knowledge base
 */
export function KnowledgeUpload() {
  const { data: session } = useSession();
  const t = useTranslations('knowledge.upload');
  const activeSectors = useActiveSectors();

  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [sectorId, setSectorId] = useState('');
  const [sourceType, setSourceType] = useState<SourceType>('PDF');
  const [isDragOver, setIsDragOver] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // TanStack Query mutation for upload
  const {
    mutate: uploadDocument,
    isPending,
    isSuccess,
    isError,
    error,
    data: result,
    reset,
  } = useUploadDocument();

  // Check user role
  const userRole = getUserRole(session?.user?.roles);
  const hasUploadPermission = hasPermission(userRole, CAN_UPLOAD);

  const handleFileChange = useCallback(
    (selectedFile: File | null) => {
      setValidationError(null);
      reset();

      if (!selectedFile) {
        setFile(null);
        return;
      }

      // Validate file size
      if (selectedFile.size > MAX_FILE_SIZE_BYTES) {
        setValidationError(t('maxSize'));
        return;
      }

      // Detect source type via shared utility
      const detectedType = detectSourceType(selectedFile);
      if (!detectedType) {
        setValidationError(t('allowedTypes'));
        return;
      }
      setFile(selectedFile);
      setSourceType(detectedType);

      // Auto-fill title from file name if empty
      if (!title) {
        setTitle(selectedFile.name.replace(/\.[^.]+$/, ''));
      }
    },
    [t, title, reset],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDragOver(false);
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile) {
        handleFileChange(droppedFile);
      }
    },
    [handleFileChange],
  );

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !title || !sectorId) return;

    uploadDocument(
      { file, title, sectorId, sourceType },
      {
        onSuccess: () => {
          // Reset form after successful upload
          setFile(null);
          setTitle('');
          setSectorId('');
          if (fileInputRef.current) {
            fileInputRef.current.value = '';
          }
        },
      },
    );
  };

  const handleRemoveFile = () => {
    setFile(null);
    setValidationError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const isFormValid = file && title.trim() && sectorId;
  const displayError = validationError || (isError ? (error?.message ?? t('error')) : null);

  if (!hasUploadPermission) {
    return (
      <div className="flex h-full items-center justify-center p-8">
        <Card className="max-w-md">
          <CardHeader className="text-center">
            <AlertCircle className="text-muted-foreground mx-auto mb-2 h-12 w-12" />
            <CardTitle>{t('error')}</CardTitle>
            <CardDescription>{t('requiresPermission')}</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl p-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            {t('title')}
          </CardTitle>
          <CardDescription>{t('subtitle')}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Drag & Drop Zone */}
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onClick={() => fileInputRef.current?.click()}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') fileInputRef.current?.click();
              }}
              className={cn(
                'flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-8 transition-colors',
                isDragOver
                  ? 'border-primary bg-primary/5'
                  : 'border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/50',
                file && 'border-green-500/50 bg-green-50/50',
              )}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept={ACCEPTED_MIME_TYPES}
                className="hidden"
                onChange={(e) => handleFileChange(e.target.files?.[0] ?? null)}
              />

              {file ? (
                <div className="flex items-center gap-3">
                  <FileText className="h-8 w-8 text-green-600" />
                  <div>
                    <p className="text-sm font-medium">{t('fileSelected')}</p>
                    <p className="text-muted-foreground text-sm">{file.name}</p>
                    <p className="text-muted-foreground text-xs">
                      {(file.size / 1024).toFixed(1)} KB · {sourceType}
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveFile();
                    }}
                    aria-label="Remove file"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <>
                  <Upload className="text-muted-foreground mb-3 h-10 w-10" />
                  <p className="text-sm font-medium">
                    {isDragOver ? t('dropzoneActive') : t('dropzone')}
                  </p>
                  <p className="text-muted-foreground mt-1 text-xs">{t('allowedTypes')}</p>
                  <p className="text-muted-foreground text-xs">{t('maxSize')}</p>
                </>
              )}
            </div>

            {/* Document Title */}
            <div className="space-y-2">
              <label htmlFor="doc-title" className="text-sm font-medium">
                {t('documentTitle')}
              </label>
              <Input
                id="doc-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={t('documentTitlePlaceholder')}
                maxLength={255}
                disabled={isPending}
              />
            </div>

            {/* Sector Selection */}
            <div className="space-y-2">
              <label htmlFor="sector-select" className="text-sm font-medium">
                {t('sector')}
              </label>
              <Select value={sectorId} onValueChange={setSectorId} disabled={isPending}>
                <SelectTrigger id="sector-select">
                  <SelectValue placeholder={t('selectSector')} />
                </SelectTrigger>
                <SelectContent>
                  {activeSectors.map((sector) => (
                    <SelectItem key={sector.id} value={sector.id}>
                      {sector.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Source Type (auto-detected, shown as info) */}
            <div className="space-y-2">
              <label className="text-sm font-medium">{t('sourceType')}</label>
              <div className="bg-muted rounded-md px-3 py-2 text-sm">{sourceType}</div>
            </div>

            {/* Error Message */}
            {displayError && (
              <div className="flex items-center gap-2 rounded-md bg-red-50 p-3 text-sm text-red-700">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{displayError}</span>
              </div>
            )}

            {/* Success Message */}
            {isSuccess && result && (
              <div className="flex items-center gap-2 rounded-md bg-green-50 p-3 text-sm text-green-700">
                <CheckCircle className="h-4 w-4 shrink-0" />
                <span>
                  {t('success')}{' '}
                  {t('successDetails', {
                    fragments: result.totalFragments,
                    time: result.processingTimeMs,
                  })}
                </span>
              </div>
            )}

            {/* Submit Button */}
            <Button type="submit" className="w-full" size="lg" disabled={!isFormValid || isPending}>
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t('uploading')}
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  {t('uploadButton')}
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
