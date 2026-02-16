import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { DocumentsView } from '../DocumentsView';
import type { KnowledgeSourceDto } from '@/lib/api/knowledge.api';

// Create mocks first
const mockListDocuments = vi.fn();
const mockGetDocumentDetail = vi.fn();
const mockUploadDocument = vi.fn();
const mockDeleteSource = vi.fn();

// Mock knowledge API with pre-created mocks
vi.mock('@/lib/api/knowledge.api', () => ({
  knowledgeApi: {
    listDocuments: (...args: unknown[]) => mockListDocuments(...args),
    getDocumentDetail: (...args: unknown[]) => mockGetDocumentDetail(...args),
    uploadDocument: (...args: unknown[]) => mockUploadDocument(...args),
    deleteSource: (...args: unknown[]) => mockDeleteSource(...args),
  },
}));

// Mock sector store to provide sectors
vi.mock('@/stores/sector.store', () => ({
  useAllSectors: () => [
    {
      id: '440e8400-e29b-41d4-a716-446655440000',
      name: 'Human Resources',
      description: '',
      icon: 'users',
      status: 'active',
      documentCount: 0,
      createdAt: '',
      updatedAt: '',
    },
    {
      id: '440e8400-e29b-41d4-a716-446655440001',
      name: 'Engineering',
      description: '',
      icon: 'code',
      status: 'active',
      documentCount: 0,
      createdAt: '',
      updatedAt: '',
    },
  ],
  useActiveSectors: () => [
    {
      id: '440e8400-e29b-41d4-a716-446655440000',
      name: 'Human Resources',
      description: '',
      icon: 'users',
      status: 'active',
      documentCount: 0,
      createdAt: '',
      updatedAt: '',
    },
    {
      id: '440e8400-e29b-41d4-a716-446655440001',
      name: 'Engineering',
      description: '',
      icon: 'code',
      status: 'active',
      documentCount: 0,
      createdAt: '',
      updatedAt: '',
    },
  ],
  SectorStoreProvider: ({ children }: { children: React.ReactNode }) => children,
}));

// Mock next-auth to provide admin roles
vi.mock('next-auth/react', () => ({
  useSession: () => ({
    data: {
      user: {
        id: 'test-user-id',
        name: 'Test User',
        email: 'test@example.com',
        roles: ['admin'],
      },
      accessToken: 'test-token',
      expires: new Date(Date.now() + 86400000).toISOString(),
    },
    status: 'authenticated',
  }),
}));

const createMockDoc = (overrides: Partial<KnowledgeSourceDto> = {}): KnowledgeSourceDto => ({
  id: 'doc-1',
  title: 'Test Document',
  sectorId: '440e8400-e29b-41d4-a716-446655440000',
  sourceType: 'PDF',
  status: 'COMPLETED',
  metadata: null,
  createdAt: '2025-01-01T00:00:00Z',
  updatedAt: '2025-01-01T00:00:00Z',
  ...overrides,
});

describe('DocumentsView', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockListDocuments.mockResolvedValue([]);
  });

  it('should show loading state initially', () => {
    mockListDocuments.mockReturnValue(new Promise(() => {}));
    render(<DocumentsView />);
    expect(screen.getByText('loading')).toBeInTheDocument();
  });

  it('should render documents after loading', async () => {
    const docs = [
      createMockDoc({ id: 'doc-1', title: 'First Document' }),
      createMockDoc({ id: 'doc-2', title: 'Second Document', sourceType: 'MARKDOWN' }),
    ];
    mockListDocuments.mockResolvedValue(docs);

    render(<DocumentsView />);

    expect(await screen.findByText('First Document')).toBeInTheDocument();
    expect(screen.getByText('Second Document')).toBeInTheDocument();
  });

  it('should show empty state when no documents', async () => {
    mockListDocuments.mockResolvedValue([]);

    render(<DocumentsView />);

    expect(await screen.findByText('noResults')).toBeInTheDocument();
  });

  it('should show error state on fetch failure', async () => {
    mockListDocuments.mockRejectedValue(new Error('Network error'));

    render(<DocumentsView />);

    expect(await screen.findByText('Network error')).toBeInTheDocument();
  });

  it('should render title and subtitle', () => {
    render(<DocumentsView />);

    expect(screen.getByText('title')).toBeInTheDocument();
    expect(screen.getByText('subtitle')).toBeInTheDocument();
  });

  it('should show upload button for admin users', () => {
    render(<DocumentsView />);

    expect(screen.getByText('uploadButton')).toBeInTheDocument();
  });

  it('should display search input', () => {
    render(<DocumentsView />);

    expect(screen.getByPlaceholderText('searchPlaceholder')).toBeInTheDocument();
  });

  it('should display document card with status badge', async () => {
    const docs = [createMockDoc({ status: 'PROCESSING' })];
    mockListDocuments.mockResolvedValue(docs);

    render(<DocumentsView />);

    expect(await screen.findByText('status.PROCESSING')).toBeInTheDocument();
  });

  it('should display source type on card', async () => {
    const docs = [createMockDoc({ sourceType: 'PDF' })];
    mockListDocuments.mockResolvedValue(docs);

    render(<DocumentsView />);

    expect(await screen.findByText('sourceType.PDF')).toBeInTheDocument();
  });

  it('should display actions dropdown trigger on document cards', async () => {
    const docs = [createMockDoc()];
    mockListDocuments.mockResolvedValue(docs);

    render(<DocumentsView />);

    // Wait for documents to load, then find the actions dropdown trigger
    await screen.findByText('Test Document');
    const actionButton = screen.getByRole('button', { name: 'actions' });
    expect(actionButton).toBeInTheDocument();
    expect(actionButton).toHaveAttribute('aria-haspopup', 'menu');
  });

  it('should call listDocuments API on mount', async () => {
    render(<DocumentsView />);

    await waitFor(() => {
      expect(mockListDocuments).toHaveBeenCalledTimes(1);
    });
  });

  it('should filter documents by search text', async () => {
    const docs = [
      createMockDoc({ id: 'doc-1', title: 'Alpha Document' }),
      createMockDoc({ id: 'doc-2', title: 'Beta Document' }),
    ];
    mockListDocuments.mockResolvedValue(docs);

    render(<DocumentsView />);

    // Wait for docs to load
    expect(await screen.findByText('Alpha Document')).toBeInTheDocument();
    expect(screen.getByText('Beta Document')).toBeInTheDocument();

    // Type in search
    const searchInput = screen.getByPlaceholderText('searchPlaceholder');
    fireEvent.change(searchInput, { target: { value: 'Alpha' } });

    // Only Alpha should remain
    expect(screen.getByText('Alpha Document')).toBeInTheDocument();
    expect(screen.queryByText('Beta Document')).not.toBeInTheDocument();
  });

  it('should display formatted date on card', async () => {
    const docs = [createMockDoc({ createdAt: '2025-06-15T00:00:00Z' })];
    mockListDocuments.mockResolvedValue(docs);

    render(<DocumentsView />);

    expect(await screen.findByText('Jun 15, 2025')).toBeInTheDocument();
  });

  it('should display sector name from SECTORS constant', async () => {
    // Use the first real sector
    const docs = [createMockDoc({ sectorId: '440e8400-e29b-41d4-a716-446655440000' })];
    mockListDocuments.mockResolvedValue(docs);

    render(<DocumentsView />);

    expect(await screen.findByText('Human Resources')).toBeInTheDocument();
  });

  it('should display "Unknown" for unknown sector ID', async () => {
    const docs = [createMockDoc({ sectorId: 'unknown-sector-id' })];
    mockListDocuments.mockResolvedValue(docs);

    render(<DocumentsView />);

    expect(await screen.findByText('Unknown')).toBeInTheDocument();
  });
});
