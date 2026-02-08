'use client';

import { XCircle, RefreshCw, AlertTriangle, WifiOff, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ErrorType, categorizeError } from '@/lib/api/error-handler';

interface ErrorStateProps {
  error: Error | string;
  onRetry?: () => void;
  onDismiss?: () => void;
  variant?: 'inline' | 'full';
}

const ERROR_ICONS = {
  [ErrorType.NETWORK]: WifiOff,
  [ErrorType.AUTH]: Lock,
  [ErrorType.VALIDATION]: AlertTriangle,
  [ErrorType.SERVER]: XCircle,
  [ErrorType.TIMEOUT]: AlertTriangle,
  [ErrorType.UNKNOWN]: XCircle,
};

const ERROR_TITLES = {
  [ErrorType.NETWORK]: 'Network Error',
  [ErrorType.AUTH]: 'Authentication Error',
  [ErrorType.VALIDATION]: 'Validation Error',
  [ErrorType.SERVER]: 'Server Error',
  [ErrorType.TIMEOUT]: 'Request Timeout',
  [ErrorType.UNKNOWN]: 'Unexpected Error',
};

const ERROR_DESCRIPTIONS = {
  [ErrorType.NETWORK]:
    'Unable to connect to the server. Please check your internet connection and try again.',
  [ErrorType.AUTH]:
    'Your session has expired or you do not have permission to perform this action. Please sign in again.',
  [ErrorType.VALIDATION]:
    'The information you provided is invalid. Please check your input and try again.',
  [ErrorType.SERVER]:
    'The server encountered an error while processing your request. Please try again later.',
  [ErrorType.TIMEOUT]:
    'The request took too long to complete. Please check your connection and try again.',
  [ErrorType.UNKNOWN]:
    'An unexpected error occurred. Please try again or contact support if the problem persists.',
};

/**
 * ErrorState component displays user-friendly error messages with appropriate icons
 * and recovery options based on the error type.
 *
 * @example
 * ```tsx
 * <ErrorState
 *   error={error}
 *   onRetry={() => refetch()}
 *   variant="inline"
 * />
 * ```
 */
export function ErrorState({ error, onRetry, onDismiss, variant = 'full' }: ErrorStateProps) {
  const errorType = categorizeError(error);
  const Icon = ERROR_ICONS[errorType];
  const title = ERROR_TITLES[errorType];
  const description =
    error instanceof Error && error.message ? error.message : ERROR_DESCRIPTIONS[errorType];

  if (variant === 'inline') {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4">
        <div className="flex items-start gap-3">
          <Icon className="h-5 w-5 shrink-0 text-red-500" />
          <div className="flex-1">
            <h3 className="text-sm font-medium text-red-800">{title}</h3>
            <p className="mt-1 text-sm text-red-700">{description}</p>
            <div className="mt-3 flex gap-2">
              {onRetry && (
                <Button onClick={onRetry} size="sm" variant="default" className="gap-2">
                  <RefreshCw className="h-3 w-3" />
                  Try Again
                </Button>
              )}
              {onDismiss && (
                <Button onClick={onDismiss} size="sm" variant="ghost">
                  Dismiss
                </Button>
              )}
            </div>
          </div>
          {onDismiss && (
            <button
              onClick={onDismiss}
              className="text-red-500 hover:text-red-700"
              aria-label="Dismiss error"
            >
              <XCircle className="h-5 w-5" />
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-[400px] flex-col items-center justify-center gap-6 p-8">
      <div className="flex flex-col items-center gap-3 text-center">
        <div className="rounded-full bg-red-100 p-4">
          <Icon className="h-12 w-12 text-red-600" />
        </div>
        <h2 className="text-2xl font-semibold text-red-900">{title}</h2>
        <p className="max-w-md text-red-700">{description}</p>
      </div>

      {onRetry && (
        <Button onClick={onRetry} variant="default" className="gap-2">
          <RefreshCw className="h-4 w-4" />
          Try Again
        </Button>
      )}
    </div>
  );
}
