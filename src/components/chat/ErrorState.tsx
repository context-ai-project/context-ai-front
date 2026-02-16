'use client';

import { XCircle, RefreshCw, AlertTriangle, WifiOff, Lock } from 'lucide-react';
import { useTranslations } from 'next-intl';
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

/** Maps ErrorType enum to translation key segment */
const ERROR_TYPE_KEYS: Record<ErrorType, string> = {
  [ErrorType.NETWORK]: 'network',
  [ErrorType.AUTH]: 'auth',
  [ErrorType.VALIDATION]: 'validation',
  [ErrorType.SERVER]: 'server',
  [ErrorType.TIMEOUT]: 'timeout',
  [ErrorType.UNKNOWN]: 'unknown',
};

/**
 * ErrorState component displays user-friendly error messages with appropriate icons
 * and recovery options based on the error type.
 *
 * All UI text is internationalised via `next-intl` (CS-11).
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
  const t = useTranslations('errors');

  const errorType = categorizeError(error);
  const Icon = ERROR_ICONS[errorType];
  const typeKey = ERROR_TYPE_KEYS[errorType];
  const title = t(`types.${typeKey}.title`);
  const description =
    error instanceof Error && error.message ? error.message : t(`types.${typeKey}.description`);

  if (variant === 'inline') {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4" data-testid="error-state">
        <div className="flex items-start gap-3">
          <Icon className="h-5 w-5 shrink-0 text-red-500" />
          <div className="flex-1">
            <h3 className="text-sm font-medium text-red-800">{title}</h3>
            <p className="mt-1 text-sm text-red-700">{description}</p>
            <div className="mt-3 flex gap-2">
              {onRetry && (
                <Button onClick={onRetry} size="sm" variant="default" className="gap-2">
                  <RefreshCw className="h-3 w-3" />
                  {t('tryAgain')}
                </Button>
              )}
              {onDismiss && (
                <Button onClick={onDismiss} size="sm" variant="ghost">
                  {t('dismiss')}
                </Button>
              )}
            </div>
          </div>
          {onDismiss && (
            <button
              onClick={onDismiss}
              className="text-red-500 hover:text-red-700"
              aria-label={t('dismissError')}
            >
              <XCircle className="h-5 w-5" />
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div
      className="flex min-h-[400px] flex-col items-center justify-center gap-6 p-8"
      data-testid="error-state"
    >
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
          {t('tryAgain')}
        </Button>
      )}
    </div>
  );
}
