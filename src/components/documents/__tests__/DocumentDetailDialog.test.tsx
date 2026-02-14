import { render, screen, waitFor } from '@testing-library/react';
import { DocumentDetailDialog } from '../DocumentDetailDialog';
import type { KnowledgeSourceDto } from '@/lib/api/knowledge.api';

// Create mock function first
const mockGetDocumentDetail = vi.fn();

vi.mock('@/lib/api/knowledge.api', () => ({
  knowledgeApi: {
    getDocumentDetail: (...args: unknown[]) => mockGetDocumentDetail(...args),
  },
}));

const mockDocument: KnowledgeSourceDto = {
  id: 'doc-1',
  title: 'Test Document',
  sectorId: '440e8400-e29b-41d4-a716-446655440000',
  sourceType: 'PDF',
  status: 'COMPLETED',
  metadata: null,
  createdAt: '2025-01-15T00:00:00Z',
  updatedAt: '2025-01-15T00:00:00Z',
};

const mockDetail = {
  ...mockDocument,
  content: 'Full document content here',
  fragmentCount: 5,
};

describe('DocumentDetailDialog', () => {
  const defaultProps = {
    document: mockDocument,
    open: true,
    onOpenChange: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockGetDocumentDetail.mockResolvedValue(mockDetail);
  });

  it('should render nothing when document is null', () => {
    const { container } = render(
      <DocumentDetailDialog document={null} open={true} onOpenChange={vi.fn()} />,
    );
    expect(container.innerHTML).toBe('');
  });

  it('should show loading state while fetching detail', () => {
    mockGetDocumentDetail.mockReturnValue(new Promise(() => {}));

    render(<DocumentDetailDialog {...defaultProps} />);

    expect(screen.getByText('loadingDetail')).toBeInTheDocument();
  });

  it('should render document title and metadata', async () => {
    render(<DocumentDetailDialog {...defaultProps} />);

    expect(await screen.findByText('Test Document')).toBeInTheDocument();
  });

  it('should display content preview', async () => {
    render(<DocumentDetailDialog {...defaultProps} />);

    expect(await screen.findByText('Full document content here')).toBeInTheDocument();
  });

  it('should show no content message when content is empty', async () => {
    mockGetDocumentDetail.mockResolvedValue({
      ...mockDocument,
      content: '',
      fragmentCount: 0,
    });

    render(<DocumentDetailDialog {...defaultProps} />);

    expect(await screen.findByText('noContent')).toBeInTheDocument();
  });

  it('should show error state on fetch failure', async () => {
    mockGetDocumentDetail.mockRejectedValue(new Error('Load error'));

    render(<DocumentDetailDialog {...defaultProps} />);

    expect(await screen.findByText('Load error')).toBeInTheDocument();
  });

  it('should display status badge', async () => {
    render(<DocumentDetailDialog {...defaultProps} />);

    expect(await screen.findByText('status.COMPLETED')).toBeInTheDocument();
  });

  it('should call API with document ID when opened', async () => {
    render(<DocumentDetailDialog {...defaultProps} />);

    await waitFor(() => {
      expect(mockGetDocumentDetail).toHaveBeenCalledWith('doc-1');
    });
  });

  it('should not call API when dialog is closed', () => {
    render(<DocumentDetailDialog document={mockDocument} open={false} onOpenChange={vi.fn()} />);

    expect(mockGetDocumentDetail).not.toHaveBeenCalled();
  });
});
