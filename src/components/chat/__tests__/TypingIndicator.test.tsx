import { render, screen } from '@/test/test-utils';
import { TypingIndicator } from '../TypingIndicator';

describe('TypingIndicator', () => {
  it('should render typing indicator with test id', () => {
    render(<TypingIndicator />);

    const indicator = screen.getByTestId('typing-indicator');
    expect(indicator).toBeInTheDocument();
  });

  it('should display "Assistant is typing..." text', () => {
    render(<TypingIndicator />);

    expect(screen.getByText('Assistant is typing...')).toBeInTheDocument();
  });

  it('should have accessible role="status" for screen readers', () => {
    render(<TypingIndicator />);

    const indicator = screen.getByRole('status');
    expect(indicator).toBeInTheDocument();
  });

  it('should have aria-live="polite" for accessibility', () => {
    render(<TypingIndicator />);

    const indicator = screen.getByTestId('typing-indicator');
    expect(indicator).toHaveAttribute('aria-live', 'polite');
  });

  it('should render three animated dots', () => {
    const { container } = render(<TypingIndicator />);

    const dots = container.querySelectorAll('.animate-bounce');
    expect(dots).toHaveLength(3);
  });

  it('should apply custom className when provided', () => {
    render(<TypingIndicator className="custom-class" />);

    const indicator = screen.getByTestId('typing-indicator');
    expect(indicator).toHaveClass('custom-class');
  });

  it('should render an avatar for the assistant', () => {
    render(<TypingIndicator />);

    // UserAvatar renders an image with alt text
    expect(screen.getByText('A')).toBeInTheDocument(); // Avatar fallback initial for "Assistant"
  });
});
