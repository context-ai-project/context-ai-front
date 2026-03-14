import { render, screen } from '@testing-library/react';
import { InlineError } from '../InlineError';

describe('InlineError', () => {
  it('renders the error message', () => {
    render(<InlineError message="Something went wrong" />);
    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
  });

  it('has role="alert"', () => {
    render(<InlineError message="Error" />);
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    render(<InlineError message="Error" className="mt-4" />);
    const el = screen.getByRole('alert');
    expect(el.className).toContain('mt-4');
  });

  it('includes base destructive styling', () => {
    render(<InlineError message="Error" />);
    const el = screen.getByRole('alert');
    expect(el.className).toContain('border-destructive');
    expect(el.className).toContain('text-destructive');
  });
});
