/**
 * Knowledge API client
 * Handles document listing, upload, and management operations.
 *
 * Uses the centralised `apiClient` for auth, timeout, and error handling
 * (eliminates the duplicate `getAccessToken` that was defined here — CS-01).
 */

import { z } from 'zod';
import { apiClient } from './client';

/** Supported source types for document upload */
export type SourceType = 'PDF' | 'MARKDOWN' | 'URL';

/** Knowledge source status from backend */
export type SourceStatus = 'PENDING' | 'PROCESSING' | 'PROCESSED' | 'COMPLETED' | 'FAILED';

/** DTO for a knowledge source (document) returned from the API */
export interface KnowledgeSourceDto {
  id: string;
  title: string;
  sectorId: string;
  sourceType: SourceType;
  status: SourceStatus;
  metadata: Record<string, unknown> | null;
  createdAt: string;
  updatedAt: string;
}

/** DTO for document upload request */
export interface UploadDocumentDto {
  file: File;
  title: string;
  sectorId: string;
  sourceType: SourceType;
  metadata?: Record<string, string>;
}

/** Zod schema for validating upload document response */
export const uploadDocumentResponseSchema = z.object({
  sourceId: z.string(),
  title: z.string(),
  sectorId: z.string(),
  sourceType: z.string(),
  status: z.string(),
  totalFragments: z.number(),
  processingTimeMs: z.number(),
});

/** Response from document upload */
export type UploadDocumentResponse = z.infer<typeof uploadDocumentResponseSchema>;

/** DTO for a knowledge source detail (with content and fragment count) */
export interface KnowledgeSourceDetailDto extends KnowledgeSourceDto {
  content: string;
  fragmentCount: number;
}

/** Response from source deletion */
export interface DeleteSourceResponse {
  sourceId: string;
  deletedFragments: number;
  vectorsDeleted: boolean;
}

/**
 * Knowledge API functions
 *
 * All methods delegate to `apiClient`, which handles authentication,
 * timeouts, and error mapping centrally.
 */
export const knowledgeApi = {
  /**
   * List all knowledge sources (documents).
   * Optionally filter by sectorId.
   */
  listDocuments: async (sectorId?: string): Promise<KnowledgeSourceDto[]> => {
    const params = sectorId ? `?sectorId=${encodeURIComponent(sectorId)}` : '';
    return apiClient.get<KnowledgeSourceDto[]>(`/knowledge/documents${params}`);
  },

  /**
   * Get a knowledge source detail by ID (includes content and fragment count).
   */
  getDocumentDetail: async (sourceId: string): Promise<KnowledgeSourceDetailDto> => {
    return apiClient.get<KnowledgeSourceDetailDto>(
      `/knowledge/documents/${encodeURIComponent(sourceId)}`,
    );
  },

  /**
   * Upload a document to the knowledge base.
   * Uses multipart/form-data via `apiClient.postFormData`.
   * Response is validated with Zod.
   */
  uploadDocument: async (dto: UploadDocumentDto): Promise<UploadDocumentResponse> => {
    const formData = new FormData();
    formData.append('file', dto.file);
    formData.append('title', dto.title);
    formData.append('sectorId', dto.sectorId);
    formData.append('sourceType', dto.sourceType);

    if (dto.metadata) {
      formData.append('metadata', JSON.stringify(dto.metadata));
    }

    const rawData: unknown = await apiClient.postFormData('/knowledge/documents/upload', formData);

    const parsed = uploadDocumentResponseSchema.safeParse(rawData);
    if (!parsed.success) {
      throw new Error(`Invalid upload response: ${parsed.error.message}`);
    }
    return parsed.data;
  },

  /**
   * Delete a source from the knowledge base.
   */
  deleteSource: async (sourceId: string, sectorId: string): Promise<DeleteSourceResponse> => {
    return apiClient.delete<DeleteSourceResponse>(
      `/knowledge/documents/${encodeURIComponent(sourceId)}?sectorId=${encodeURIComponent(sectorId)}`,
    );
  },
};
