import { render, screen } from '@/test/test-utils';
import userEvent from '@testing-library/user-event';
import { SourceCard } from '../SourceCard';
import { mockSources } from '@/test/mocks';

describe('SourceCard', () => {
  const user = userEvent.setup();
  const defaultSource = mockSources[0];

  it('should render source card with test id', () => {
    render(<SourceCard source={defaultSource} index={0} />);

    expect(screen.getByTestId('source-card')).toBeInTheDocument();
  });

  it('should display document title from metadata', () => {
    render(<SourceCard source={defaultSource} index={0} />);

    expect(screen.getByText('HR Manual 2024')).toBeInTheDocument();
  });

  it('should display similarity score as percentage', () => {
    render(<SourceCard source={defaultSource} index={0} />);

    expect(screen.getByText('95% match')).toBeInTheDocument();
  });

  it('should display page number when available', () => {
    render(<SourceCard source={defaultSource} index={0} />);

    expect(screen.getByText('Page 42')).toBeInTheDocument();
  });

  it('should use fallback title when metadata title is not present', () => {
    const sourceWithoutTitle = {
      ...defaultSource,
      metadata: {},
    };

    render(<SourceCard source={sourceWithoutTitle} index={2} />);

    expect(screen.getByText('Document 3')).toBeInTheDocument();
  });

  it('should not display page number when not available', () => {
    const sourceWithoutPage = {
      ...defaultSource,
      metadata: { title: 'Test Doc' },
    };

    render(<SourceCard source={sourceWithoutPage} index={0} />);

    expect(screen.queryByText(/Page/)).not.toBeInTheDocument();
  });

  it('should render external link when URL is available', () => {
    render(<SourceCard source={defaultSource} index={0} />);

    const link = screen.getByLabelText('View source document');
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', 'https://intranet.company.com/hr/manual');
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('should not render external link when URL is not available', () => {
    const sourceWithoutUrl = {
      ...defaultSource,
      metadata: { title: 'Test Doc', page: 1 },
    };

    render(<SourceCard source={sourceWithoutUrl} index={0} />);

    expect(screen.queryByLabelText('View source document')).not.toBeInTheDocument();
  });

  it('should expand content when clicked', async () => {
    render(<SourceCard source={defaultSource} index={0} />);

    // Content should not be visible initially
    expect(screen.queryByText(defaultSource.content)).not.toBeInTheDocument();

    // Click to expand
    const expandButton = screen.getByRole('button', { expanded: false });
    await user.click(expandButton);

    // Content should now be visible
    expect(screen.getByText(defaultSource.content)).toBeInTheDocument();
  });

  it('should collapse content when clicked again', async () => {
    render(<SourceCard source={defaultSource} index={0} />);

    // Expand
    const button = screen.getByRole('button', { expanded: false });
    await user.click(button);
    expect(screen.getByText(defaultSource.content)).toBeInTheDocument();

    // Collapse
    const expandedButton = screen.getByRole('button', { expanded: true });
    await user.click(expandedButton);
    expect(screen.queryByText(defaultSource.content)).not.toBeInTheDocument();
  });

  it('should have proper aria-expanded attribute', async () => {
    render(<SourceCard source={defaultSource} index={0} />);

    const button = screen.getByRole('button', { expanded: false });
    expect(button).toHaveAttribute('aria-expanded', 'false');

    await user.click(button);
    expect(button).toHaveAttribute('aria-expanded', 'true');
  });

  it('should have proper aria-controls attribute', () => {
    render(<SourceCard source={defaultSource} index={0} />);

    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('aria-controls', 'source-content-0');
  });

  it('should display additional metadata in expanded content', async () => {
    const sourceWithExtraMetadata = {
      ...defaultSource,
      metadata: {
        title: 'HR Manual',
        page: 42,
        url: 'https://example.com',
        department: 'HR',
        version: '2024',
      },
    };

    render(<SourceCard source={sourceWithExtraMetadata} index={0} />);

    // Expand
    await user.click(screen.getByRole('button', { expanded: false }));

    // Extra metadata (title, page, url are filtered out)
    expect(screen.getByText('department:')).toBeInTheDocument();
    expect(screen.getByText('HR')).toBeInTheDocument();
    expect(screen.getByText('version:')).toBeInTheDocument();
    expect(screen.getByText('2024')).toBeInTheDocument();
  });
});
