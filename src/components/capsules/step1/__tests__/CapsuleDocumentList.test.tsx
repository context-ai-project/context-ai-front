import { render, screen, waitFor } from '@testing-library/react';
import { CapsuleDocumentList } from '../CapsuleDocumentList';

const mockToggleDocument = vi.fn();
let mockSectorId: string | null = 'sector-1';

vi.mock('@/stores/capsule.store', () => ({
  useSelectedSectorId: () => mockSectorId,
  useSelectedDocumentIds: () => ['doc-1'],
  useToggleDocument: () => mockToggleDocument,
}));

vi.mock('@/lib/api/knowledge.api', () => ({
  knowledgeApi: {
    listDocuments: vi.fn().mockResolvedValue([
      { id: 'doc-1', title: 'Document A', status: 'COMPLETED', createdAt: '2026-01-01T00:00:00Z' },
      { id: 'doc-2', title: 'Document B', status: 'COMPLETED', createdAt: '2026-01-02T00:00:00Z' },
      { id: 'doc-3', title: 'Document C', status: 'PROCESSING', createdAt: '2026-01-03T00:00:00Z' },
    ]),
  },
}));

vi.mock('@/lib/utils/format-date', () => ({
  formatDate: (d: string) => d,
}));

describe('CapsuleDocumentList', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSectorId = 'sector-1';
  });

  it('renders nothing when no sector is selected', () => {
    mockSectorId = null;
    const { container } = render(<CapsuleDocumentList />);
    expect(container.firstChild).toBeNull();
  });

  it('shows loading state initially', () => {
    render(<CapsuleDocumentList />);
    expect(screen.getByText('Loading…')).toBeInTheDocument();
  });

  it('renders only COMPLETED documents after loading', async () => {
    render(<CapsuleDocumentList />);
    await waitFor(() => {
      expect(screen.getByText('Document A')).toBeInTheDocument();
      expect(screen.getByText('Document B')).toBeInTheDocument();
    });
    expect(screen.queryByText('Document C')).not.toBeInTheDocument();
  });

  it('shows selected document count', async () => {
    render(<CapsuleDocumentList />);
    await waitFor(() => {
      expect(screen.getByText(/1/)).toBeInTheDocument();
    });
  });

  it('renders search input', async () => {
    render(<CapsuleDocumentList />);
    await waitFor(() => {
      expect(screen.getByPlaceholderText('searchDocuments')).toBeInTheDocument();
    });
  });
});
