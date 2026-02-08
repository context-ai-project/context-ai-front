import { APIError } from './client';

/**
 * Error types for better error handling
 */
export enum ErrorType {
  NETWORK = 'NETWORK',
  AUTH = 'AUTH',
  VALIDATION = 'VALIDATION',
  SERVER = 'SERVER',
  TIMEOUT = 'TIMEOUT',
  UNKNOWN = 'UNKNOWN',
}

/**
 * Categorize error by type
 */
export function categorizeError(error: unknown): ErrorType {
  if (error instanceof APIError) {
    if (error.status === 0) return ErrorType.NETWORK;
    if (error.status === 401 || error.status === 403) return ErrorType.AUTH;
    if (error.status === 400 || error.status === 422) return ErrorType.VALIDATION;
    if (error.status === 408) return ErrorType.TIMEOUT;
    if (error.status >= 500) return ErrorType.SERVER;
  }

  return ErrorType.UNKNOWN;
}

/**
 * Get user-friendly error message
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof APIError) {
    const type = categorizeError(error);

    switch (type) {
      case ErrorType.NETWORK:
        return 'Unable to connect to the server. Please check your internet connection.';
      case ErrorType.AUTH:
        return 'Authentication failed. Please sign in again.';
      case ErrorType.VALIDATION:
        return error.message || 'Invalid input. Please check your data.';
      case ErrorType.TIMEOUT:
        return 'Request timed out. Please try again.';
      case ErrorType.SERVER:
        return 'Server error. Please try again later.';
      default:
        return error.message || 'An unexpected error occurred.';
    }
  }

  if (error instanceof Error) {
    return error.message;
  }

  return 'An unexpected error occurred.';
}

/**
 * Type guard to check if an error is an APIError
 */
export function isApiError(error: unknown): error is APIError {
  return error instanceof APIError;
}

/**
 * Log error for monitoring (Sentry, etc.)
 */
export function logError(error: unknown, context?: Record<string, unknown>) {
  if (process.env.NODE_ENV === 'development') {
    console.error('Error:', error, 'Context:', context);
  }

  // Integration with Sentry will be added in Phase 8 - Deployment & Monitoring
}
