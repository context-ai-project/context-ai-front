'use client';

import { Component, type ReactNode } from 'react';
import { XCircle, RefreshCw } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { logError } from '@/lib/api/error-handler';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onReset?: () => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

/**
 * Error Boundary component that catches React rendering errors and displays a fallback UI.
 * Follows React Error Boundary pattern with support for error recovery.
 *
 * UI text is delegated to `ErrorBoundaryFallback` (a functional component that
 * uses `useTranslations`), keeping the class component free of hardcoded strings (CS-11).
 *
 * @example
 * ```tsx
 * <ErrorBoundary>
 *   <MyComponent />
 * </ErrorBoundary>
 * ```
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    logError(error, {
      context: 'ErrorBoundary',
      componentStack: errorInfo.componentStack,
    });

    this.setState({
      error,
      errorInfo,
    });
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });

    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <ErrorBoundaryFallback
          error={this.state.error}
          errorInfo={this.state.errorInfo}
          onReset={this.handleReset}
        />
      );
    }

    return this.props.children;
  }
}

// ── Default Fallback (functional, i18n-aware) ─────────────────────────

interface ErrorBoundaryFallbackProps {
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
  onReset: () => void;
}

/**
 * Default fallback rendered by ErrorBoundary.
 * Uses `useTranslations` for all user-facing text.
 */
function ErrorBoundaryFallback({ error, errorInfo, onReset }: ErrorBoundaryFallbackProps) {
  const t = useTranslations('errors');

  return (
    <div className="flex min-h-[400px] flex-col items-center justify-center gap-6 rounded-lg border border-red-200 bg-red-50 p-8">
      <div className="flex flex-col items-center gap-3 text-center">
        <div className="rounded-full bg-red-100 p-4">
          <XCircle className="h-12 w-12 text-red-600" />
        </div>
        <h2 className="text-2xl font-semibold text-red-900">{t('somethingWentWrong')}</h2>
        <p className="max-w-md text-red-700">{error?.message || t('defaultBoundaryMessage')}</p>
      </div>

      <div className="flex gap-3">
        <Button onClick={onReset} variant="default" className="gap-2">
          <RefreshCw className="h-4 w-4" />
          {t('tryAgain')}
        </Button>
        <Button onClick={() => window.location.reload()} variant="outline">
          {t('reloadPage')}
        </Button>
      </div>

      {process.env.NODE_ENV === 'development' && errorInfo && (
        <details className="mt-4 max-w-2xl rounded-lg border border-red-200 bg-white p-4">
          <summary className="cursor-pointer font-mono text-sm text-red-800">
            {t('devOnlyDetails')}
          </summary>
          <pre className="mt-2 overflow-auto text-xs text-gray-700">{error?.stack}</pre>
          <pre className="mt-2 overflow-auto text-xs text-gray-600">{errorInfo.componentStack}</pre>
        </details>
      )}
    </div>
  );
}
