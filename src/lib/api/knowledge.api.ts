/**
 * Knowledge API client
 * Handles document listing, upload, and management operations
 */

import { z } from 'zod';

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
 * Get access token for authenticated requests
 */
async function getAccessToken(): Promise<string | null> {
  try {
    const response = await fetch('/api/auth/token');
    if (!response.ok) return null;
    const data: { accessToken: string } = await response.json();
    return data.accessToken;
  } catch {
    return null;
  }
}

/** Base API URL */
const getBaseUrl = (): string => process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

/**
 * Knowledge API functions
 */
export const knowledgeApi = {
  /**
   * List all knowledge sources (documents)
   * Optionally filter by sectorId
   */
  listDocuments: async (sectorId?: string): Promise<KnowledgeSourceDto[]> => {
    const token = await getAccessToken();
    const params = sectorId ? `?sectorId=${encodeURIComponent(sectorId)}` : '';

    const response = await fetch(`${getBaseUrl()}/knowledge/documents${params}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });

    if (!response.ok) {
      const errorData: { message?: string } | null = await response.json().catch(() => null);
      throw new Error(
        errorData?.message || `Failed to load documents: ${response.status} ${response.statusText}`,
      );
    }

    return response.json();
  },

  /**
   * Get a knowledge source detail by ID (includes content and fragment count)
   */
  getDocumentDetail: async (sourceId: string): Promise<KnowledgeSourceDetailDto> => {
    const token = await getAccessToken();

    const response = await fetch(
      `${getBaseUrl()}/knowledge/documents/${encodeURIComponent(sourceId)}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      },
    );

    if (!response.ok) {
      const errorData: { message?: string } | null = await response.json().catch(() => null);
      throw new Error(
        errorData?.message || `Failed to load document: ${response.status} ${response.statusText}`,
      );
    }

    return response.json();
  },

  /**
   * Upload a document to the knowledge base
   * Uses multipart/form-data for file upload
   */
  uploadDocument: async (dto: UploadDocumentDto): Promise<UploadDocumentResponse> => {
    const token = await getAccessToken();

    const formData = new FormData();
    formData.append('file', dto.file);
    formData.append('title', dto.title);
    formData.append('sectorId', dto.sectorId);
    formData.append('sourceType', dto.sourceType);

    if (dto.metadata) {
      formData.append('metadata', JSON.stringify(dto.metadata));
    }

    const response = await fetch(`${getBaseUrl()}/knowledge/documents/upload`, {
      method: 'POST',
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: formData,
    });

    if (!response.ok) {
      const errorData: { message?: string } | null = await response.json().catch(() => null);
      throw new Error(
        errorData?.message || `Upload failed: ${response.status} ${response.statusText}`,
      );
    }

    const rawData: unknown = await response.json();
    const parsed = uploadDocumentResponseSchema.safeParse(rawData);
    if (!parsed.success) {
      throw new Error(`Invalid upload response: ${parsed.error.message}`);
    }
    return parsed.data;
  },

  /**
   * Delete a source from the knowledge base
   */
  deleteSource: async (sourceId: string, sectorId: string): Promise<DeleteSourceResponse> => {
    const token = await getAccessToken();

    const response = await fetch(
      `${getBaseUrl()}/knowledge/documents/${encodeURIComponent(sourceId)}?sectorId=${encodeURIComponent(sectorId)}`,
      {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      },
    );

    if (!response.ok) {
      const errorData: { message?: string } | null = await response.json().catch(() => null);
      throw new Error(
        errorData?.message || `Delete failed: ${response.status} ${response.statusText}`,
      );
    }

    return response.json();
  },
};
