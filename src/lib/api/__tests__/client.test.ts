import { apiClient, APIError } from '../client';

/**
 * Mock global fetch using vi.stubGlobal for proper cleanup
 */
const mockFetch = vi.fn();
vi.stubGlobal('fetch', mockFetch);

/** Reusable test token */
const TEST_TOKEN = 'test-token';
/** Reusable JSON content-type header */
const JSON_HEADERS = { 'Content-Type': 'application/json' };
/** Common test endpoint path */
const TEST_ENDPOINT = '/test-endpoint';

describe('API Client', () => {
  beforeEach(() => {
    mockFetch.mockReset();
  });

  /**
   * Create a successful auth token Response
   */
  function authTokenResponse(): Response {
    return new Response(JSON.stringify({ accessToken: TEST_TOKEN }), {
      status: 200,
      headers: JSON_HEADERS,
    });
  }

  /**
   * Helper to mock a successful auth token response followed by an API response
   */
  function mockAuthAndApiResponse(apiResponse: unknown, status = 200) {
    mockFetch.mockResolvedValueOnce(authTokenResponse());
    mockFetch.mockResolvedValueOnce(
      new Response(JSON.stringify(apiResponse), {
        status,
        headers: JSON_HEADERS,
      }),
    );
  }

  /**
   * Helper to mock auth token failure
   */
  function mockAuthFailureAndApiResponse(apiResponse: unknown, status = 200) {
    mockFetch.mockResolvedValueOnce(new Response('Unauthorized', { status: 401 }));
    mockFetch.mockResolvedValueOnce(
      new Response(JSON.stringify(apiResponse), {
        status,
        headers: JSON_HEADERS,
      }),
    );
  }

  describe('GET requests', () => {
    it('should make a GET request with auth token', async () => {
      const responseData = { id: '1', name: 'Test' };
      mockAuthAndApiResponse(responseData);

      const result = await apiClient.get(TEST_ENDPOINT);

      expect(result).toEqual(responseData);
      expect(mockFetch).toHaveBeenCalledTimes(2);

      // Check API call has Authorization header
      const apiCall = mockFetch.mock.calls[1];
      expect(apiCall[1].headers['Authorization']).toBe(`Bearer ${TEST_TOKEN}`);
      expect(apiCall[1].method).toBe('GET');
    });

    it('should prepend base URL for relative paths', async () => {
      mockAuthAndApiResponse({ data: 'test' });

      await apiClient.get('/test');

      const apiCallUrl = mockFetch.mock.calls[1][0];
      expect(apiCallUrl).toContain('/test');
    });

    it('should use absolute URL as-is', async () => {
      mockAuthAndApiResponse({ data: 'test' });

      await apiClient.get('https://external-api.com/data');

      const apiCallUrl = mockFetch.mock.calls[1][0];
      expect(apiCallUrl).toBe('https://external-api.com/data');
    });

    it('should work without auth token', async () => {
      const responseData = { id: '1', name: 'Test' };
      mockAuthFailureAndApiResponse(responseData);

      const result = await apiClient.get(TEST_ENDPOINT);

      expect(result).toEqual(responseData);
      // Check no Authorization header
      const apiCall = mockFetch.mock.calls[1];
      expect(apiCall[1].headers['Authorization']).toBeUndefined();
    });
  });

  describe('POST requests', () => {
    it('should make a POST request with body', async () => {
      const requestData = { message: 'hello' };
      const responseData = { success: true };
      mockAuthAndApiResponse(responseData);

      const result = await apiClient.post(TEST_ENDPOINT, requestData);

      expect(result).toEqual(responseData);
      const apiCall = mockFetch.mock.calls[1];
      expect(apiCall[1].method).toBe('POST');
      expect(apiCall[1].body).toBe(JSON.stringify(requestData));
    });

    it('should include Content-Type application/json header', async () => {
      mockAuthAndApiResponse({ success: true });

      await apiClient.post('/test', { data: 'test' });

      const apiCall = mockFetch.mock.calls[1];
      expect(apiCall[1].headers['Content-Type']).toBe('application/json');
    });
  });

  describe('PUT requests', () => {
    it('should make a PUT request with body', async () => {
      const requestData = { name: 'updated' };
      const responseData = { id: '1', name: 'updated' };
      mockAuthAndApiResponse(responseData);

      const result = await apiClient.put(TEST_ENDPOINT, requestData);

      expect(result).toEqual(responseData);
      const apiCall = mockFetch.mock.calls[1];
      expect(apiCall[1].method).toBe('PUT');
      expect(apiCall[1].body).toBe(JSON.stringify(requestData));
    });
  });

  describe('DELETE requests', () => {
    it('should make a DELETE request', async () => {
      const responseData = { success: true };
      mockAuthAndApiResponse(responseData);

      const result = await apiClient.delete(TEST_ENDPOINT);

      expect(result).toEqual(responseData);
      const apiCall = mockFetch.mock.calls[1];
      expect(apiCall[1].method).toBe('DELETE');
    });

    it('should handle 204 No Content response', async () => {
      mockFetch.mockResolvedValueOnce(authTokenResponse());
      mockFetch.mockResolvedValueOnce(new Response(null, { status: 204 }));

      const result = await apiClient.delete(TEST_ENDPOINT);
      expect(result).toBeUndefined();
    });
  });

  describe('Error Handling', () => {
    it('should throw APIError for HTTP errors', async () => {
      mockFetch.mockResolvedValueOnce(authTokenResponse());
      mockFetch.mockResolvedValueOnce(
        new Response(JSON.stringify({ message: 'Not Found' }), {
          status: 404,
          statusText: 'Not Found',
          headers: JSON_HEADERS,
        }),
      );

      await expect(apiClient.get('/not-found')).rejects.toThrow(APIError);

      try {
        mockFetch.mockResolvedValueOnce(authTokenResponse());
        mockFetch.mockResolvedValueOnce(
          new Response(JSON.stringify({ message: 'Not Found' }), {
            status: 404,
            statusText: 'Not Found',
            headers: JSON_HEADERS,
          }),
        );

        await apiClient.get('/not-found');
      } catch (error) {
        expect(error).toBeInstanceOf(APIError);
        expect((error as APIError).status).toBe(404);
        expect((error as APIError).message).toBe('Not Found');
      }
    });

    it('should throw APIError with status text when no error body', async () => {
      mockFetch.mockResolvedValueOnce(authTokenResponse());
      mockFetch.mockResolvedValueOnce(
        new Response('Server Error', {
          status: 500,
          statusText: 'Internal Server Error',
        }),
      );

      try {
        await apiClient.get('/server-error');
      } catch (error) {
        expect(error).toBeInstanceOf(APIError);
        expect((error as APIError).status).toBe(500);
      }
    });

    it('should throw APIError with status 408 for timeout', async () => {
      mockFetch.mockResolvedValueOnce(authTokenResponse());

      // API call aborts — use Error with name='AbortError' (DOMException may
      // not behave identically across jsdom versions)
      const abortError = new Error('Aborted');
      abortError.name = 'AbortError';
      mockFetch.mockRejectedValueOnce(abortError);

      try {
        await apiClient.get('/slow-endpoint');
      } catch (error) {
        expect(error).toBeInstanceOf(APIError);
        expect((error as APIError).status).toBe(408);
        expect((error as APIError).message).toBe('Request timeout');
      }
    });

    it('should throw APIError for network errors', async () => {
      // Auth token fails with network error
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      // API call also fails
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      try {
        await apiClient.get('/any-endpoint');
      } catch (error) {
        expect(error).toBeInstanceOf(APIError);
        expect((error as APIError).status).toBe(0);
      }
    });
  });
});
