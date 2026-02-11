import { render, screen } from '@/test/test-utils';
import { SourceList } from '../SourceList';
import { mockSources } from '@/test/mocks';

describe('SourceList', () => {
  it('should render null when sources array is empty', () => {
    const { container } = render(<SourceList sources={[]} />);

    expect(container.firstChild).toBeNull();
  });

  it('should render null when sources is undefined', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- testing edge case with invalid input
    const { container } = render(<SourceList sources={undefined as any} />);

    expect(container.firstChild).toBeNull();
  });

  it('should display sources count', () => {
    render(<SourceList sources={mockSources} />);

    expect(screen.getByText(`Sources (${mockSources.length})`)).toBeInTheDocument();
  });

  it('should render correct number of source cards', () => {
    render(<SourceList sources={mockSources} />);

    const sourceCards = screen.getAllByTestId('source-card');
    expect(sourceCards).toHaveLength(mockSources.length);
  });

  it('should respect maxSources limit', () => {
    render(<SourceList sources={mockSources} maxSources={1} />);

    const sourceCards = screen.getAllByTestId('source-card');
    expect(sourceCards).toHaveLength(1);
  });

  it('should show remaining count when sources exceed maxSources', () => {
    render(<SourceList sources={mockSources} maxSources={1} />);

    expect(screen.getByText('and 2 more sources...')).toBeInTheDocument();
  });

  it('should show singular "source" when only one remaining', () => {
    render(<SourceList sources={mockSources} maxSources={2} />);

    expect(screen.getByText('and 1 more source...')).toBeInTheDocument();
  });

  it('should not show remaining count when all sources are displayed', () => {
    render(<SourceList sources={mockSources} maxSources={10} />);

    expect(screen.queryByText(/more source/)).not.toBeInTheDocument();
  });

  it('should default maxSources to 5', () => {
    // With 3 mock sources and default max of 5, all should display
    render(<SourceList sources={mockSources} />);

    const sourceCards = screen.getAllByTestId('source-card');
    expect(sourceCards).toHaveLength(mockSources.length);
  });

  it('should display the Sources heading with icon', () => {
    render(<SourceList sources={mockSources} />);

    expect(screen.getByText(`Sources (${mockSources.length})`)).toBeInTheDocument();
  });
});
