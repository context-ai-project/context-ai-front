import { knowledgeApi } from '../knowledge.api';
import type {
  KnowledgeSourceDto,
  KnowledgeSourceDetailDto,
  UploadDocumentResponse,
  DeleteSourceResponse,
} from '../knowledge.api';
import { apiClient } from '../client';
import type { Mock } from 'vitest';

// Mock apiClient — knowledge.api now delegates all HTTP calls to it
vi.mock('../client', () => ({
  apiClient: {
    get: vi.fn(),
    delete: vi.fn(),
    postFormData: vi.fn(),
  },
}));

const mockGet = apiClient.get as Mock;
const mockDelete = apiClient.delete as Mock;
const mockPostFormData = apiClient.postFormData as Mock;

describe('knowledgeApi', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('listDocuments', () => {
    it('should fetch all documents without sectorId', async () => {
      const mockDocs: KnowledgeSourceDto[] = [
        {
          id: 'doc-1',
          title: 'Doc 1',
          sectorId: 'sector-1',
          sourceType: 'PDF',
          status: 'COMPLETED',
          metadata: null,
          createdAt: '2025-01-01T00:00:00Z',
          updatedAt: '2025-01-01T00:00:00Z',
        },
      ];

      mockGet.mockResolvedValueOnce(mockDocs);

      const result = await knowledgeApi.listDocuments();

      expect(result).toEqual(mockDocs);
      expect(mockGet).toHaveBeenCalledTimes(1);
      expect(mockGet).toHaveBeenCalledWith('/knowledge/documents');
    });

    it('should pass sectorId as query parameter', async () => {
      mockGet.mockResolvedValueOnce([]);

      await knowledgeApi.listDocuments('sector-123');

      expect(mockGet).toHaveBeenCalledWith('/knowledge/documents?sectorId=sector-123');
    });

    it('should propagate errors from apiClient', async () => {
      mockGet.mockRejectedValueOnce(new Error('DB error'));

      await expect(knowledgeApi.listDocuments()).rejects.toThrow('DB error');
    });

    it('should encode sectorId in query parameter', async () => {
      mockGet.mockResolvedValueOnce([]);

      await knowledgeApi.listDocuments('sector with spaces');

      expect(mockGet).toHaveBeenCalledWith('/knowledge/documents?sectorId=sector%20with%20spaces');
    });
  });

  describe('getDocumentDetail', () => {
    it('should fetch document detail by sourceId', async () => {
      const mockDetail: KnowledgeSourceDetailDto = {
        id: 'doc-1',
        title: 'Doc 1',
        sectorId: 'sector-1',
        sourceType: 'PDF',
        status: 'COMPLETED',
        content: 'Full content...',
        fragmentCount: 5,
        metadata: null,
        createdAt: '2025-01-01T00:00:00Z',
        updatedAt: '2025-01-01T00:00:00Z',
      };

      mockGet.mockResolvedValueOnce(mockDetail);

      const result = await knowledgeApi.getDocumentDetail('doc-1');

      expect(result).toEqual(mockDetail);
      expect(mockGet).toHaveBeenCalledWith('/knowledge/documents/doc-1');
    });

    it('should propagate errors from apiClient', async () => {
      mockGet.mockRejectedValueOnce(new Error('Source not found'));

      await expect(knowledgeApi.getDocumentDetail('missing-id')).rejects.toThrow(
        'Source not found',
      );
    });
  });

  describe('uploadDocument', () => {
    it('should upload document with multipart form data', async () => {
      const mockResponse: UploadDocumentResponse = {
        sourceId: 'new-source-1',
        title: 'Test Doc',
        sectorId: 'sector-1',
        sourceType: 'PDF',
        status: 'COMPLETED',
        totalFragments: 10,
        processingTimeMs: 500,
      };

      mockPostFormData.mockResolvedValueOnce(mockResponse);

      const file = new File(['content'], 'test.pdf', { type: 'application/pdf' });
      const result = await knowledgeApi.uploadDocument({
        file,
        title: 'Test Doc',
        sectorId: 'sector-1',
        sourceType: 'PDF',
      });

      expect(result).toEqual(mockResponse);
      expect(mockPostFormData).toHaveBeenCalledTimes(1);

      const [endpoint, formData] = mockPostFormData.mock.calls[0] as [string, FormData];
      expect(endpoint).toBe('/knowledge/documents/upload');
      expect(formData).toBeInstanceOf(FormData);
      expect(formData.get('title')).toBe('Test Doc');
      expect(formData.get('sectorId')).toBe('sector-1');
      expect(formData.get('sourceType')).toBe('PDF');
    });

    it('should include metadata when provided', async () => {
      mockPostFormData.mockResolvedValueOnce({
        sourceId: 's1',
        title: 'T',
        sectorId: 's',
        sourceType: 'PDF',
        status: 'COMPLETED',
        totalFragments: 1,
        processingTimeMs: 100,
      });

      const file = new File(['content'], 'test.pdf', { type: 'application/pdf' });
      await knowledgeApi.uploadDocument({
        file,
        title: 'T',
        sectorId: 's',
        sourceType: 'PDF',
        metadata: { author: 'Test' },
      });

      const [, formData] = mockPostFormData.mock.calls[0] as [string, FormData];
      expect(formData.get('metadata')).toBe(JSON.stringify({ author: 'Test' }));
    });

    it('should throw on invalid upload response (Zod validation)', async () => {
      // Return data missing required fields
      mockPostFormData.mockResolvedValueOnce({ sourceId: 's1' });

      const file = new File(['content'], 'test.pdf', { type: 'application/pdf' });
      await expect(
        knowledgeApi.uploadDocument({ file, title: 'T', sectorId: 's', sourceType: 'PDF' }),
      ).rejects.toThrow('Invalid upload response');
    });

    it('should propagate errors from apiClient', async () => {
      mockPostFormData.mockRejectedValueOnce(new Error('Invalid file type'));

      const file = new File(['content'], 'test.exe', { type: 'application/x-msdownload' });
      await expect(
        knowledgeApi.uploadDocument({ file, title: 'T', sectorId: 's', sourceType: 'PDF' }),
      ).rejects.toThrow('Invalid file type');
    });
  });

  describe('deleteSource', () => {
    it('should delete a document by sourceId and sectorId', async () => {
      const mockResponse: DeleteSourceResponse = {
        sourceId: 'doc-1',
        deletedFragments: 3,
        vectorsDeleted: true,
      };

      mockDelete.mockResolvedValueOnce(mockResponse);

      const result = await knowledgeApi.deleteSource('doc-1', 'sector-1');

      expect(result).toEqual(mockResponse);
      expect(mockDelete).toHaveBeenCalledWith('/knowledge/documents/doc-1?sectorId=sector-1');
    });

    it('should propagate errors from apiClient', async () => {
      mockDelete.mockRejectedValueOnce(new Error('Source not found'));

      await expect(knowledgeApi.deleteSource('missing-id', 'sector-1')).rejects.toThrow(
        'Source not found',
      );
    });
  });
});
