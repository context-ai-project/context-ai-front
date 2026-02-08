/**
 * API Client Configuration
 * Base client for all API requests using native fetch
 */

import { APIError } from '@/lib/api/error-handler';
export { APIError };

/**
 * API client configuration
 */
const API_CONFIG = {
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1',
  timeout: 30000, // 30 seconds
};

/**
 * Request options interface
 */
interface RequestOptions extends RequestInit {
  timeout?: number;
}

/**
 * Get access token from Auth0
 *
 * @param timeout - Optional timeout in milliseconds (default: 5000ms)
 * @param signal - Optional AbortSignal for cancellation
 * @returns Access token or null if failed
 */
async function getAccessToken(timeout = 5000, signal?: AbortSignal): Promise<string | null> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  // Bridge external signal to internal controller
  if (signal) {
    signal.addEventListener('abort', () => controller.abort());
  }

  try {
    const response = await fetch('/api/auth/token', {
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (!response.ok) return null;

    const data = await response.json();
    return data.accessToken;
  } catch (error) {
    clearTimeout(timeoutId);
    console.error('Failed to get access token:', error);
    return null;
  }
}

/**
 * Base fetch function with interceptors
 */
async function fetchWithInterceptors(
  endpoint: string,
  options: RequestOptions = {},
): Promise<Response> {
  const { timeout = API_CONFIG.timeout, ...fetchOptions } = options;

  // Create abort controller for timeout
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  // Bridge external signal if provided
  if (fetchOptions.signal) {
    fetchOptions.signal.addEventListener('abort', () => controller.abort());
  }

  try {
    // Add auth token with shared timeout and signal
    const token = await getAccessToken(5000, controller.signal);
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
