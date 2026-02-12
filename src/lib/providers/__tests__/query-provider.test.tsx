import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { QueryProvider } from '../query-provider';
import { useQueryClient } from '@tanstack/react-query';

// Don't mock react-query — we want to test the actual provider wrapping

// Helper component that verifies QueryClient is available
function TestChild() {
  const queryClient = useQueryClient();
  return <div data-testid="test-child">QueryClient available: {queryClient ? 'yes' : 'no'}</div>;
}

// Need to unmock react-query for this test since we want the real provider
vi.unmock('@tanstack/react-query');

describe('QueryProvider', () => {
  it('should render children wrapped with QueryClientProvider', () => {
    render(
      <QueryProvider>
        <div data-testid="child-content">Hello</div>
      </QueryProvider>,
    );

    expect(screen.getByTestId('child-content')).toBeInTheDocument();
    expect(screen.getByText('Hello')).toBeInTheDocument();
  });

  it('should provide QueryClient to child components', () => {
    render(
      <QueryProvider>
        <TestChild />
      </QueryProvider>,
    );

    expect(screen.getByTestId('test-child')).toHaveTextContent('QueryClient available: yes');
  });

  it('should render multiple children', () => {
    render(
      <QueryProvider>
        <div data-testid="child-1">First</div>
        <div data-testid="child-2">Second</div>
      </QueryProvider>,
    );

    expect(screen.getByTestId('child-1')).toBeInTheDocument();
    expect(screen.getByTestId('child-2')).toBeInTheDocument();
  });
});
