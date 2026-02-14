import { describe, it, expect } from 'vitest';
import {
  APIError,
  ErrorType,
  categorizeError,
  getErrorMessage,
  isApiError,
} from '../error-handler';

describe('APIError', () => {
  it('should create an APIError with message and status', () => {
    const error = new APIError('Not Found', 404);

    expect(error.message).toBe('Not Found');
    expect(error.status).toBe(404);
    expect(error.name).toBe('APIError');
    expect(error).toBeInstanceOf(Error);
    expect(error).toBeInstanceOf(APIError);
  });

  it('should create an APIError with additional data', () => {
    const data = { details: 'Field validation failed' };
    const error = new APIError('Validation Error', 400, data);

    expect(error.data).toEqual(data);
  });
});

describe('categorizeError', () => {
  it('should return NETWORK for status 0', () => {
    expect(categorizeError(new APIError('Network', 0))).toBe(ErrorType.NETWORK);
  });

  it('should return AUTH for status 401', () => {
    expect(categorizeError(new APIError('Unauthorized', 401))).toBe(ErrorType.AUTH);
  });

  it('should return AUTH for status 403', () => {
    expect(categorizeError(new APIError('Forbidden', 403))).toBe(ErrorType.AUTH);
  });

  it('should return VALIDATION for status 400', () => {
    expect(categorizeError(new APIError('Bad Request', 400))).toBe(ErrorType.VALIDATION);
  });

  it('should return VALIDATION for status 422', () => {
    expect(categorizeError(new APIError('Unprocessable', 422))).toBe(ErrorType.VALIDATION);
  });

  it('should return TIMEOUT for status 408', () => {
    expect(categorizeError(new APIError('Timeout', 408))).toBe(ErrorType.TIMEOUT);
  });

  it('should return SERVER for status 500', () => {
    expect(categorizeError(new APIError('Server Error', 500))).toBe(ErrorType.SERVER);
  });

  it('should return SERVER for status 502', () => {
    expect(categorizeError(new APIError('Bad Gateway', 502))).toBe(ErrorType.SERVER);
  });

  it('should return SERVER for status 503', () => {
    expect(categorizeError(new APIError('Service Unavailable', 503))).toBe(ErrorType.SERVER);
  });

  it('should return UNKNOWN for non-APIError', () => {
    expect(categorizeError(new Error('Generic error'))).toBe(ErrorType.UNKNOWN);
  });

  it('should return UNKNOWN for string error', () => {
    expect(categorizeError('string error')).toBe(ErrorType.UNKNOWN);
  });

  it('should return UNKNOWN for null', () => {
    expect(categorizeError(null)).toBe(ErrorType.UNKNOWN);
  });

  it('should return UNKNOWN for undefined', () => {
    expect(categorizeError(undefined)).toBe(ErrorType.UNKNOWN);
  });
});

describe('getErrorMessage', () => {
  it('should return network message for network errors', () => {
    const error = new APIError('Network', 0);
    const message = getErrorMessage(error);

    expect(message).toContain('Unable to connect');
  });

  it('should return auth message for auth errors', () => {
    const error = new APIError('Unauthorized', 401);
    const message = getErrorMessage(error);

    expect(message).toContain('Authentication failed');
  });

  it('should return the error message for validation errors', () => {
    const error = new APIError('Field is required', 400);
    const message = getErrorMessage(error);

    expect(message).toBe('Field is required');
  });

  it('should return timeout message for timeout errors', () => {
    const error = new APIError('Timeout', 408);
    const message = getErrorMessage(error);

    expect(message).toContain('timed out');
  });

  it('should return server message for server errors', () => {
    const error = new APIError('Internal', 500);
    const message = getErrorMessage(error);

    expect(message).toContain('Server error');
  });

  it('should return error.message for generic Error instances', () => {
    const error = new Error('Custom error');
    const message = getErrorMessage(error);

    expect(message).toBe('Custom error');
  });

  it('should return default message for unknown errors', () => {
    const message = getErrorMessage('random string');

    expect(message).toContain('unexpected error');
  });

  it('should return default message for null', () => {
    const message = getErrorMessage(null);

    expect(message).toContain('unexpected error');
  });
});

describe('isApiError', () => {
  it('should return true for APIError instances', () => {
    expect(isApiError(new APIError('test', 400))).toBe(true);
  });

  it('should return false for regular Error instances', () => {
    expect(isApiError(new Error('test'))).toBe(false);
  });

  it('should return false for strings', () => {
    expect(isApiError('test')).toBe(false);
  });

  it('should return false for null', () => {
    expect(isApiError(null)).toBe(false);
  });

  it('should return false for undefined', () => {
    expect(isApiError(undefined)).toBe(false);
  });
});
