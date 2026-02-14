import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { DeleteDocumentDialog } from '../DeleteDocumentDialog';
import type { KnowledgeSourceDto } from '@/lib/api/knowledge.api';

const mockDeleteSource = vi.fn();

vi.mock('@/lib/api/knowledge.api', () => ({
  knowledgeApi: {
    deleteSource: (...args: unknown[]) => mockDeleteSource(...args),
  },
}));

const mockDocument: KnowledgeSourceDto = {
  id: 'doc-1',
  title: 'Test Document',
  sectorId: 'sector-1',
  sourceType: 'PDF',
  status: 'COMPLETED',
  metadata: null,
  createdAt: '2025-01-01T00:00:00Z',
  updatedAt: '2025-01-01T00:00:00Z',
};

describe('DeleteDocumentDialog', () => {
  const defaultProps = {
    document: mockDocument,
    open: true,
    onOpenChange: vi.fn(),
    onDeleted: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render dialog when open with document', () => {
    render(<DeleteDocumentDialog {...defaultProps} />);

    expect(screen.getByText('title')).toBeInTheDocument();
    expect(screen.getByText('confirm')).toBeInTheDocument();
    expect(screen.getByText('cancel')).toBeInTheDocument();
  });

  it('should render nothing when document is null', () => {
    const { container } = render(<DeleteDocumentDialog {...defaultProps} document={null} />);
    expect(container.innerHTML).toBe('');
  });

  it('should call deleteSource API and onDeleted on confirm', async () => {
    mockDeleteSource.mockResolvedValueOnce({
      sourceId: 'doc-1',
      deletedFragments: 5,
      vectorsDeleted: true,
    });

    render(<DeleteDocumentDialog {...defaultProps} />);

    const confirmBtn = screen.getByText('confirm');
    await act(async () => {
      fireEvent.click(confirmBtn);
    });

    await waitFor(() => {
      expect(mockDeleteSource).toHaveBeenCalledWith('doc-1', 'sector-1');
      expect(defaultProps.onDeleted).toHaveBeenCalledWith('doc-1');
      expect(defaultProps.onOpenChange).toHaveBeenCalledWith(false);
    });
  });

  it('should show error when deletion fails', async () => {
    mockDeleteSource.mockRejectedValueOnce(new Error('Delete failed'));

    render(<DeleteDocumentDialog {...defaultProps} />);

    const confirmBtn = screen.getByText('confirm');
    await act(async () => {
      fireEvent.click(confirmBtn);
    });

    await waitFor(() => {
      expect(screen.getByText('Delete failed')).toBeInTheDocument();
    });
  });

  it('should display description with document title', () => {
    render(<DeleteDocumentDialog {...defaultProps} />);
    expect(screen.getByText(/message/)).toBeInTheDocument();
  });

  it('should call onOpenChange when cancel is clicked', () => {
    render(<DeleteDocumentDialog {...defaultProps} />);

    const cancelBtn = screen.getByText('cancel');
    fireEvent.click(cancelBtn);

    expect(defaultProps.onOpenChange).toHaveBeenCalledWith(false);
  });

  it('should show non-Error object as generic error message', async () => {
    mockDeleteSource.mockRejectedValueOnce('string error');

    render(<DeleteDocumentDialog {...defaultProps} />);

    const confirmBtn = screen.getByText('confirm');
    await act(async () => {
      fireEvent.click(confirmBtn);
    });

    await waitFor(() => {
      // Non-Error fallback uses t('error') which returns 'error' in mock
      expect(screen.getByText('error')).toBeInTheDocument();
    });
  });
});
