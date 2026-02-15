import { render, screen, fireEvent } from '@testing-library/react';
import { SectorsView } from '../SectorsView';
import type { Sector } from '@/types/sector.types';

// ── Mock data ────────────────────────────────────────────────────────────────

const mockSectors: Sector[] = [
  {
    id: 's1',
    name: 'Human Resources',
    description: 'HR department sector',
    icon: 'users',
    status: 'active',
    documentCount: 5,
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z',
  },
  {
    id: 's2',
    name: 'Engineering',
    description: 'Engineering department',
    icon: 'code',
    status: 'inactive',
    documentCount: 0,
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z',
  },
];

// ── Mocks ────────────────────────────────────────────────────────────────────

let mockAllSectors: Sector[] = [];
let mockLoading = false;
let mockError: string | null = null;

vi.mock('@/stores/sector.store', () => ({
  useAllSectors: () => mockAllSectors,
  useSectorLoading: () => mockLoading,
  useSectorError: () => mockError,
  useAddSector: () => vi.fn(),
  useUpdateSector: () => vi.fn(),
  useDeleteSector: () => vi.fn(),
  useToggleSectorStatus: () => vi.fn(),
  useSectorNameExists: () => vi.fn().mockReturnValue(false),
  useFindSimilarNames: () => vi.fn().mockReturnValue([]),
}));

describe('SectorsView', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAllSectors = [...mockSectors];
    mockLoading = false;
    mockError = null;
  });

  it('should render title and subtitle', () => {
    render(<SectorsView />);

    expect(screen.getByText('title')).toBeInTheDocument();
    expect(screen.getByText('subtitle')).toBeInTheDocument();
  });

  it('should render new sector button', () => {
    render(<SectorsView />);

    expect(screen.getByText('newSector')).toBeInTheDocument();
  });

  it('should render search input', () => {
    render(<SectorsView />);

    expect(screen.getByPlaceholderText('searchPlaceholder')).toBeInTheDocument();
  });

  it('should render sector count badge', () => {
    render(<SectorsView />);

    expect(screen.getByText('2 / 2')).toBeInTheDocument();
  });

  it('should render sector cards', () => {
    render(<SectorsView />);

    expect(screen.getByText('Human Resources')).toBeInTheDocument();
    expect(screen.getByText('Engineering')).toBeInTheDocument();
  });

  it('should filter sectors by search', () => {
    render(<SectorsView />);

    const searchInput = screen.getByPlaceholderText('searchPlaceholder');
    fireEvent.change(searchInput, { target: { value: 'human' } });

    expect(screen.getByText('Human Resources')).toBeInTheDocument();
    expect(screen.queryByText('Engineering')).not.toBeInTheDocument();
    expect(screen.getByText('1 / 2')).toBeInTheDocument();
  });

  it('should filter by description', () => {
    render(<SectorsView />);

    const searchInput = screen.getByPlaceholderText('searchPlaceholder');
    fireEvent.change(searchInput, { target: { value: 'engineering department' } });

    expect(screen.queryByText('Human Resources')).not.toBeInTheDocument();
    expect(screen.getByText('Engineering')).toBeInTheDocument();
  });

  it('should show empty state when no results', () => {
    render(<SectorsView />);

    const searchInput = screen.getByPlaceholderText('searchPlaceholder');
    fireEvent.change(searchInput, { target: { value: 'nonexistent' } });

    expect(screen.getByText('noResults')).toBeInTheDocument();
  });

  it('should show empty state when no sectors exist', () => {
    mockAllSectors = [];
    render(<SectorsView />);

    expect(screen.getByText('empty')).toBeInTheDocument();
  });

  it('should show loading state', () => {
    mockLoading = true;
    mockAllSectors = [];
    render(<SectorsView />);

    expect(screen.getByText('loading')).toBeInTheDocument();
  });

  it('should show error banner when error exists', () => {
    mockError = 'Something went wrong';
    render(<SectorsView />);

    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
  });

  it('should not show error banner when no error', () => {
    render(<SectorsView />);

    expect(screen.queryByText('Something went wrong')).not.toBeInTheDocument();
  });

  it('should show all sectors when search is cleared', () => {
    render(<SectorsView />);

    const searchInput = screen.getByPlaceholderText('searchPlaceholder');

    // Type search
    fireEvent.change(searchInput, { target: { value: 'human' } });
    expect(screen.queryByText('Engineering')).not.toBeInTheDocument();

    // Clear search
    fireEvent.change(searchInput, { target: { value: '' } });
    expect(screen.getByText('Engineering')).toBeInTheDocument();
  });
});
