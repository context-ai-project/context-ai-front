/**
 * API Client Configuration
 * Base client for all API requests using native fetch
 */

/**
 * API client configuration
 */
const API_CONFIG = {
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1',
  timeout: 30000, // 30 seconds
};

/**
 * Custom API Error class
 */
export class APIError extends Error {
  constructor(
    message: string,
    public status: number,
    public data?: unknown,
  ) {
    super(message);
    this.name = 'APIError';
  }
}

/**
 * Request options interface
 */
interface RequestOptions extends RequestInit {
  timeout?: number;
}

/**
 * Retrieve the current access token used for authenticated API requests.
 *
 * @returns The access token string if available, `null` if a token could not be obtained.
 */
async function getAccessToken(): Promise<string | null> {
  try {
    const response = await fetch('/api/auth/token');
    if (!response.ok) return null;

    const data = await response.json();
    return data.accessToken;
  } catch (error) {
    console.error('Failed to get access token:', error);
    return null;
  }
}

/**
 * Performs an HTTP request with automatic token injection, JSON header merging, request timeout, and unified APIError handling.
 *
 * @param endpoint - Absolute URL or a path relative to the configured API base URL
 * @param options - Request init options extended with an optional `timeout` (milliseconds); provided headers are merged with the JSON `Content-Type` header
 * @returns The successful `Response` object
 * @throws APIError - Thrown for non-OK HTTP responses (contains `status` and optional `data` parsed from the response), with status `408` for request timeouts and status `0` for other network or unknown errors
 */
async function fetchWithInterceptors(
  endpoint: string,
  options: RequestOptions = {},
): Promise<Response> {
  const { timeout = API_CONFIG.timeout, ...fetchOptions } = options;

  // Add auth token
  const token = await getAccessToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  // Add existing headers
  if (fetchOptions.headers) {
    const existingHeaders = new Headers(fetchOptions.headers);
    existingHeaders.forEach((value, key) => {
      headers[key] = value;
    });
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // Create abort controller for timeout
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const url = endpoint.startsWith('http') ? endpoint : `${API_CONFIG.baseURL}${endpoint}`;

    const response = await fetch(url, {
      ...fetchOptions,
      headers,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    // Handle HTTP errors
    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new APIError(
        errorData?.message || `HTTP ${response.status}: ${response.statusText}`,
        response.status,
        errorData,
      );
    }

    return response;
  } catch (error) {
    clearTimeout(timeoutId);

    if (error instanceof APIError) {
      throw error;
    }

    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        throw new APIError('Request timeout', 408);
      }
      throw new APIError(error.message, 0);
    }

    throw new APIError('Unknown error', 0);
  }
}

/**
 * API Client with common HTTP methods
 */
export const apiClient = {
  /**
   * GET request
   */
  async get<T>(endpoint: string, options?: RequestOptions): Promise<T> {
    const response = await fetchWithInterceptors(endpoint, {
      ...options,
      method: 'GET',
    });
    return response.json();
  },

  /**
   * POST request
   */
  async post<T>(endpoint: string, data?: unknown, options?: RequestOptions): Promise<T> {
    const response = await fetchWithInterceptors(endpoint, {
      ...options,
      method: 'POST',
      body: JSON.stringify(data),
    });
    return response.json();
  },

  /**
   * PUT request
   */
  async put<T>(endpoint: string, data?: unknown, options?: RequestOptions): Promise<T> {
    const response = await fetchWithInterceptors(endpoint, {
      ...options,
      method: 'PUT',
      body: JSON.stringify(data),
    });
    return response.json();
  },

  /**
   * DELETE request
   */
  async delete<T>(endpoint: string, options?: RequestOptions): Promise<T> {
    const response = await fetchWithInterceptors(endpoint, {
      ...options,
      method: 'DELETE',
    });

    // Handle 204 No Content
    if (response.status === 204) {
      return undefined as T;
    }

    return response.json();
  },
};