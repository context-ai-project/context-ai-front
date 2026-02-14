import { knowledgeApi } from '../knowledge.api';
import type {
  KnowledgeSourceDto,
  UploadDocumentResponse,
  DeleteSourceResponse,
} from '../knowledge.api';

// Mock global fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('knowledgeApi', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Mock token fetch (first call to /api/auth/token)
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ accessToken: 'test-token' }),
    });
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

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockDocs),
      });

      const result = await knowledgeApi.listDocuments();

      expect(result).toEqual(mockDocs);
      expect(mockFetch).toHaveBeenCalledTimes(2);
      // Second call should be to knowledge/documents
      const secondCall = mockFetch.mock.calls[1];
      expect(secondCall[0]).toContain('/knowledge/documents');
      expect(secondCall[0]).not.toContain('sectorId');
    });

    it('should pass sectorId as query parameter', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve([]),
      });

      await knowledgeApi.listDocuments('sector-123');

      const secondCall = mockFetch.mock.calls[1];
      expect(secondCall[0]).toContain('?sectorId=sector-123');
    });

    it('should throw on non-ok response', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        json: () => Promise.resolve({ message: 'DB error' }),
      });

      await expect(knowledgeApi.listDocuments()).rejects.toThrow('DB error');
    });

    it('should throw generic error when response has no message', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        json: () => Promise.reject(new Error('parse error')),
      });

      await expect(knowledgeApi.listDocuments()).rejects.toThrow(
        'Failed to load documents: 500 Internal Server Error',
      );
    });

    it('should include Authorization header with token', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve([]),
      });

      await knowledgeApi.listDocuments();

      const secondCall = mockFetch.mock.calls[1];
      expect(secondCall[1].headers.Authorization).toBe('Bearer test-token');
    });
  });

  describe('getDocumentDetail', () => {
    it('should fetch document detail by sourceId', async () => {
      const mockDetail = {
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

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockDetail),
      });

      const result = await knowledgeApi.getDocumentDetail('doc-1');

      expect(result).toEqual(mockDetail);
      const secondCall = mockFetch.mock.calls[1];
      expect(secondCall[0]).toContain('/knowledge/documents/doc-1');
    });

    it('should throw on non-ok response', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found',
        json: () => Promise.resolve({ message: 'Source not found' }),
      });

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

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const file = new File(['content'], 'test.pdf', { type: 'application/pdf' });
      const result = await knowledgeApi.uploadDocument({
        file,
        title: 'Test Doc',
        sectorId: 'sector-1',
        sourceType: 'PDF',
      });

      expect(result).toEqual(mockResponse);
      const secondCall = mockFetch.mock.calls[1];
      expect(secondCall[0]).toContain('/knowledge/documents/upload');
      expect(secondCall[1].method).toBe('POST');
      expect(secondCall[1].body).toBeInstanceOf(FormData);
    });

    it('should include metadata when provided', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            sourceId: 's1',
            title: 'T',
            sectorId: 's',
            sourceType: 'PDF',
            status: 'COMPLETED',
            totalFragments: 1,
            processingTimeMs: 100,
          }),
      });

      const file = new File(['content'], 'test.pdf', { type: 'application/pdf' });
      await knowledgeApi.uploadDocument({
        file,
        title: 'T',
        sectorId: 's',
        sourceType: 'PDF',
        metadata: { author: 'Test' },
      });

      const secondCall = mockFetch.mock.calls[1];
      const formData = secondCall[1].body as FormData;
      expect(formData.get('metadata')).toBe(JSON.stringify({ author: 'Test' }));
    });

    it('should throw on non-ok response', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        statusText: 'Bad Request',
        json: () => Promise.resolve({ message: 'Invalid file type' }),
      });

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

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const result = await knowledgeApi.deleteSource('doc-1', 'sector-1');

      expect(result).toEqual(mockResponse);
      const secondCall = mockFetch.mock.calls[1];
      expect(secondCall[0]).toContain('/knowledge/documents/doc-1');
      expect(secondCall[0]).toContain('sectorId=sector-1');
      expect(secondCall[1].method).toBe('DELETE');
    });

    it('should throw on non-ok response', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found',
        json: () => Promise.resolve({ message: 'Source not found' }),
      });

      await expect(knowledgeApi.deleteSource('missing-id', 'sector-1')).rejects.toThrow(
        'Source not found',
      );
    });
  });

  describe('getAccessToken', () => {
    it('should handle token fetch failure gracefully', async () => {
      // Reset mocks to set up a failing token request
      mockFetch.mockReset();

      // Token fetch fails
      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: () => Promise.resolve({}),
      });

      // Documents fetch succeeds
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve([]),
      });

      const result = await knowledgeApi.listDocuments();

      expect(result).toEqual([]);
      // No Authorization header should be sent
      const secondCall = mockFetch.mock.calls[1];
      expect(secondCall[1].headers.Authorization).toBeUndefined();
    });
  });
});
