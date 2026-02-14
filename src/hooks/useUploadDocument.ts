'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { knowledgeApi } from '@/lib/api/knowledge.api';
import type { UploadDocumentDto, UploadDocumentResponse } from '@/lib/api/knowledge.api';

/**
 * TanStack Query mutation hook for uploading documents to the knowledge base.
 *
 * Encapsulates the upload API call, Zod-validated response,
 * and automatic cache invalidation on success.
 */
export function useUploadDocument() {
  const queryClient = useQueryClient();

  return useMutation<UploadDocumentResponse, Error, UploadDocumentDto>({
    mutationFn: (dto: UploadDocumentDto) => knowledgeApi.uploadDocument(dto),
    onSuccess: () => {
      // Invalidate the documents list so it refetches after upload
      queryClient.invalidateQueries({ queryKey: ['knowledgeDocuments'] });
    },
  });
}
