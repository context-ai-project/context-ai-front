import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ErrorBoundary } from '../ErrorBoundary';

/**
 * Component that throws an error for testing ErrorBoundary
 */
function ThrowingComponent({ shouldThrow = true }: { shouldThrow?: boolean }) {
  if (shouldThrow) {
    throw new Error('Test error message');
  }
  return <div>No error</div>;
}

describe('ErrorBoundary', () => {
  // Suppress console.error for ErrorBoundary tests (React logs errors during error boundary)
  const originalError = console.error;

  beforeEach(() => {
    console.error = vi.fn();
  });

  afterEach(() => {
    console.error = originalError;
  });

  it('should render children when there is no error', () => {
    render(
      <ErrorBoundary>
        <div>Normal content</div>
      </ErrorBoundary>,
    );

    expect(screen.getByText('Normal content')).toBeInTheDocument();
  });

  it('should render default fallback UI when an error occurs', () => {
    render(
      <ErrorBoundary>
        <ThrowingComponent />
      </ErrorBoundary>,
    );

    // With useTranslations mock, keys are returned as-is
    expect(screen.getByText('somethingWentWrong')).toBeInTheDocument();
    expect(screen.getByText('Test error message')).toBeInTheDocument();
  });

  it('should render custom fallback when provided', () => {
    render(
      <ErrorBoundary fallback={<div>Custom error fallback</div>}>
        <ThrowingComponent />
      </ErrorBoundary>,
    );

    expect(screen.getByText('Custom error fallback')).toBeInTheDocument();
    expect(screen.queryByText('somethingWentWrong')).not.toBeInTheDocument();
  });

  it('should display "Try Again" and "Reload Page" buttons', () => {
    render(
      <ErrorBoundary>
        <ThrowingComponent />
      </ErrorBoundary>,
    );

    expect(screen.getByRole('button', { name: /tryAgain/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /reloadPage/i })).toBeInTheDocument();
  });

  it('should recover when "Try Again" is clicked and error is resolved', async () => {
    const user = userEvent.setup();
    let shouldThrow = true;

    function ConditionalThrow() {
      if (shouldThrow) {
        throw new Error('Recoverable error');
      }
      return <div>Recovered content</div>;
    }

    const { rerender } = render(
      <ErrorBoundary>
        <ConditionalThrow />
      </ErrorBoundary>,
    );

    // Error state
    expect(screen.getByText('somethingWentWrong')).toBeInTheDocument();

    // Resolve the error
    shouldThrow = false;

    await user.click(screen.getByRole('button', { name: /tryAgain/i }));

    // Force rerender after state reset
    rerender(
      <ErrorBoundary>
        <ConditionalThrow />
      </ErrorBoundary>,
    );

    expect(screen.getByText('Recovered content')).toBeInTheDocument();
  });

  it('should call onReset callback when "Try Again" is clicked', async () => {
    const user = userEvent.setup();
    const onResetMock = vi.fn();

    render(
      <ErrorBoundary onReset={onResetMock}>
        <ThrowingComponent />
      </ErrorBoundary>,
    );

    await user.click(screen.getByRole('button', { name: /tryAgain/i }));

    expect(onResetMock).toHaveBeenCalledTimes(1);
  });

  it('should not show error details in non-development mode', () => {
    // In test mode (NODE_ENV=test), error details should NOT be shown
    render(
      <ErrorBoundary>
        <ThrowingComponent />
      </ErrorBoundary>,
    );

    // The <details> element with development-only details should not render
    expect(screen.queryByText(/devOnlyDetails/i)).not.toBeInTheDocument();

    // But the error message should still be shown in the default fallback
    expect(screen.getByText('somethingWentWrong')).toBeInTheDocument();
    expect(screen.getByText('Test error message')).toBeInTheDocument();
  });
});
