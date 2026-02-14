import { render, screen } from '@/test/test-utils';
import { EmptyState } from '../EmptyState';
import { vi } from 'vitest';

describe('EmptyState', () => {
  it('should render empty state with test id', () => {
    render(<EmptyState />);

    expect(screen.getByTestId('empty-state')).toBeInTheDocument();
  });

  it('should display welcome heading', () => {
    render(<EmptyState />);

    expect(screen.getByText('Welcome to Context.ai')).toBeInTheDocument();
  });

  it('should display description text', () => {
    render(<EmptyState />);

    expect(
      screen.getByText('Your intelligent knowledge assistant powered by RAG technology'),
    ).toBeInTheDocument();
  });

  it('should display feature highlights', () => {
    render(<EmptyState />);

    expect(screen.getByText('Natural Conversations')).toBeInTheDocument();
    expect(screen.getByText('Context-Aware')).toBeInTheDocument();
    expect(screen.getByText('Source Citations')).toBeInTheDocument();
  });

  it('should display "Ask me anything about your documents" badge', () => {
    render(<EmptyState />);

    expect(screen.getByText('Ask me anything about your documents')).toBeInTheDocument();
  });

  it('should render suggested questions section', () => {
    render(<EmptyState />);

    expect(screen.getByText('Try asking:')).toBeInTheDocument();
  });

  it('should call onQuestionClick when a suggested question is clicked', async () => {
    const handleClick = vi.fn();
    const { user } = await import('@testing-library/user-event').then((m) => ({
      user: m.default.setup(),
    }));

    render(<EmptyState onQuestionClick={handleClick} />);

    // Find and click a suggested question button
    const buttons = screen.getAllByRole('button');
    expect(buttons.length).toBeGreaterThan(0);
    await user.click(buttons[0]);
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('should render feature descriptions', () => {
    render(<EmptyState />);

    expect(
      screen.getByText('Ask questions in plain language and get accurate answers'),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Responses based on your organization's knowledge base"),
    ).toBeInTheDocument();
    expect(
      screen.getByText('Every answer includes references to source documents'),
    ).toBeInTheDocument();
  });
});
