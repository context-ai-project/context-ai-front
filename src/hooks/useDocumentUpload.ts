/**
 * Custom hook for document upload form state and logic.
 *
 * Extracts the upload Data Clump (6 related useState + handlers)
 * from DocumentsView into a cohesive, reusable unit — fixes CS-07 & CS-08.
 */

import { useState, useCallback, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { knowledgeApi } from '@/lib/api/knowledge.api';
import type { KnowledgeSourceDto } from '@/lib/api/knowledge.api';
import { MAX_FILE_SIZE_BYTES, detectSourceType } from '@/lib/utils/file-detection';

// Re-export for consumers that used to import from this module
export { ACCEPTED_MIME_TYPES } from '@/lib/utils/file-detection';

/** Return type of the useDocumentUpload hook */
export interface UseDocumentUploadReturn {
  /** Selected file */
  file: File | null;
  /** Document title for upload */
  title: string;
  /** Target sector ID */
  sectorId: string;
  /** Whether an upload is in progress */
  isUploading: boolean;
  /** Upload error message, if any */
  error: string | null;
  /** Whether a drag is currently over the drop zone */
  isDragOver: boolean;
  /** Whether the form has all required fields filled */
  isFormValid: boolean;
  /** Ref for the hidden file input */
  fileRef: React.RefObject<HTMLInputElement | null>;
  /** Update the document title */
  setTitle: (title: string) => void;
  /** Update the target sector ID */
  setSectorId: (sectorId: string) => void;
  /** Handle file selection (from input or drop) */
  handleFileSelect: (file: File | null) => void;
  /** Handle drop event on the drop zone */
  handleDrop: (e: React.DragEvent<HTMLDivElement>) => void;
  /** Handle drag over event */
  handleDragOver: (e: React.DragEvent<HTMLDivElement>) => void;
  /** Handle drag leave event */
  handleDragLeave: (e: React.DragEvent<HTMLDivElement>) => void;
  /** Handle form submission — uploads the document and returns the new DTO */
  handleUpload: (e: React.FormEvent<HTMLFormElement>) => Promise<KnowledgeSourceDto | null>;
  /** Reset all form state (called when dialog closes) */
  resetForm: () => void;
}

/**
 * Hook that encapsulates all upload form state and handlers.
 *
 * @returns Upload form state and actions
 */
export function useDocumentUpload(): UseDocumentUploadReturn {
  const t = useTranslations('documents');

  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [sectorId, setSectorId] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const fileRef = useRef<HTMLInputElement>(null);

  const isFormValid = Boolean(file && title.trim() && sectorId);

  const resetForm = useCallback(() => {
    setFile(null);
    setTitle('');
    setSectorId('');
    setError(null);
    setIsDragOver(false);
    if (fileRef.current) fileRef.current.value = '';
  }, []);

  const handleFileSelect = useCallback(
    (selectedFile: File | null) => {
      setError(null);
      if (!selectedFile) {
        setFile(null);
        return;
      }
      if (selectedFile.size > MAX_FILE_SIZE_BYTES) {
        setError(t('uploadDialog.fileTooLarge'));
        return;
      }
      setFile(selectedFile);
      if (!title) {
        setTitle(selectedFile.name.replace(/\.[^.]+$/, ''));
      }
    },
    [title, t],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDragOver(false);
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile) handleFileSelect(droppedFile);
    },
    [handleFileSelect],
  );

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleUpload = useCallback(
    async (e: React.FormEvent<HTMLFormElement>): Promise<KnowledgeSourceDto | null> => {
      e.preventDefault();
      if (!file || !title.trim() || !sectorId) return null;

      setIsUploading(true);
      setError(null);

      try {
        const sourceType = detectSourceType(file);
        if (!sourceType) {
          setError(t('uploadDialog.allowedTypes'));
          setIsUploading(false);
          return null;
        }
        const response = await knowledgeApi.uploadDocument({
          file,
          title: title.trim(),
          sectorId,
          sourceType,
        });

        const newDoc: KnowledgeSourceDto = {
          id: response.sourceId,
          title: response.title,
          sectorId,
          sourceType,
          status: response.status === 'COMPLETED' ? 'PROCESSED' : 'PROCESSING',
          metadata: null,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        resetForm();
        return newDoc;
      } catch (err) {
        setError(err instanceof Error ? err.message : t('uploadDialog.error'));
        return null;
      } finally {
        setIsUploading(false);
      }
    },
    [file, title, sectorId, resetForm, t],
  );

  return {
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
  };
}
