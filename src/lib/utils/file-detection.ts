/**
 * Shared file type detection and validation utilities.
 *
 * Centralises the logic duplicated in DocumentsView, KnowledgeUpload,
 * and useDocumentUpload (CS-06).
 */

import type { SourceType } from '@/lib/api/knowledge.api';

/** Maximum file size in bytes (10 MB) */
export const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024;

/** Accepted file extensions for the file input */
export const ACCEPTED_MIME_TYPES = '.pdf,.md,.txt';

/** File MIME-type to SourceType mapping */
const FILE_TYPE_MAP: Record<string, SourceType> = {
  'application/pdf': 'PDF',
  'text/markdown': 'MARKDOWN',
  'text/plain': 'MARKDOWN',
};

/**
 * Detect source type from a file's MIME type or extension.
 *
 * @param file - The file to detect the source type for
 * @returns The detected SourceType, or `null` when the type cannot be determined
 */
export function detectSourceType(file: File): SourceType | null {
  const mimeType = FILE_TYPE_MAP[file.type];
  if (mimeType) return mimeType;

  const ext = file.name.split('.').pop()?.toLowerCase();
  if (ext === 'pdf') return 'PDF';
  if (ext === 'md' || ext === 'txt') return 'MARKDOWN';

  return null;
}
