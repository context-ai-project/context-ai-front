import { render, screen } from '@/test/test-utils';
import userEvent from '@testing-library/user-event';
import { ErrorState } from '../ErrorState';
import { APIError } from '@/lib/api/error-handler';
import { vi } from 'vitest';

describe('ErrorState', () => {
  const user = userEvent.setup();

  describe('Full variant (default)', () => {
    it('should render error state with test id', () => {
      render(<ErrorState error="Something went wrong" />);

      expect(screen.getByTestId('error-state')).toBeInTheDocument();
    });

    it('should display error title for unknown error', () => {
      render(<ErrorState error="Something went wrong" />);

      expect(screen.getByText('Unexpected Error')).toBeInTheDocument();
    });

    it('should display the error message from Error instance', () => {
      render(<ErrorState error={new Error('Custom error message')} />);

      expect(screen.getByText('Custom error message')).toBeInTheDocument();
    });

    it('should display network error type for network API errors', () => {
      const networkError = new APIError('Network failed', 0);
      render(<ErrorState error={networkError} />);

      expect(screen.getByText('Network Error')).toBeInTheDocument();
    });

    it('should display auth error for 401 API errors', () => {
      const authError = new APIError('Unauthorized', 401);
      render(<ErrorState error={authError} />);

      expect(screen.getByText('Authentication Error')).toBeInTheDocument();
    });

    it('should display server error for 500 API errors', () => {
      const serverError = new APIError('Internal Server Error', 500);
      render(<ErrorState error={serverError} />);

      expect(screen.getByText('Server Error')).toBeInTheDocument();
    });

    it('should display validation error for 400 API errors', () => {
      const validationError = new APIError('Bad Request', 400);
      render(<ErrorState error={validationError} />);

      expect(screen.getByText('Validation Error')).toBeInTheDocument();
    });

    it('should display timeout error for 408 API errors', () => {
      const timeoutError = new APIError('Request Timeout', 408);
      render(<ErrorState error={timeoutError} />);

      expect(screen.getByRole('heading', { name: 'Request Timeout' })).toBeInTheDocument();
    });

    it('should render retry button when onRetry is provided', () => {
      render(<ErrorState error="Error" onRetry={vi.fn()} />);

      expect(screen.getByText('Try Again')).toBeInTheDocument();
    });

    it('should not render retry button when onRetry is not provided', () => {
      render(<ErrorState error="Error" />);

      expect(screen.queryByText('Try Again')).not.toBeInTheDocument();
    });

    it('should call onRetry when retry button is clicked', async () => {
      const onRetry = vi.fn();
      render(<ErrorState error="Error" onRetry={onRetry} />);

      await user.click(screen.getByText('Try Again'));
      expect(onRetry).toHaveBeenCalledTimes(1);
    });
  });

  describe('Inline variant', () => {
    it('should render inline variant', () => {
      render(<ErrorState error="Inline error" variant="inline" />);

      expect(screen.getByTestId('error-state')).toBeInTheDocument();
    });

    it('should display dismiss button when onDismiss is provided', () => {
      render(<ErrorState error="Error" variant="inline" onDismiss={vi.fn()} />);

      expect(screen.getByText('Dismiss')).toBeInTheDocument();
    });

    it('should call onDismiss when dismiss button is clicked', async () => {
      const onDismiss = vi.fn();
      render(<ErrorState error="Error" variant="inline" onDismiss={onDismiss} />);

      await user.click(screen.getByText('Dismiss'));
      expect(onDismiss).toHaveBeenCalledTimes(1);
    });

    it('should render both retry and dismiss buttons', () => {
      render(<ErrorState error="Error" variant="inline" onRetry={vi.fn()} onDismiss={vi.fn()} />);

      expect(screen.getByText('Try Again')).toBeInTheDocument();
      expect(screen.getByText('Dismiss')).toBeInTheDocument();
    });

    it('should have accessible dismiss button with aria-label', () => {
      render(<ErrorState error="Error" variant="inline" onDismiss={vi.fn()} />);

      expect(screen.getByLabelText('Dismiss error')).toBeInTheDocument();
    });
  });
});
