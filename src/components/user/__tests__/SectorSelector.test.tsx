import { render, screen } from '@/test/test-utils';
import userEvent from '@testing-library/user-event';
import { SectorSelector } from '../SectorSelector';

// Mock useCurrentUser
const mockCurrentSectorId = { current: null as string | null };
const mockSectors = {
  current: [] as Array<{ id: string; name: string }>,
};
const mockSetCurrentSectorId = vi.fn();
const mockSetSectors = vi.fn();

vi.mock('@/hooks/useCurrentUser', () => ({
  useCurrentUser: () => ({
    currentSectorId: mockCurrentSectorId.current,
    sectors: mockSectors.current,
  }),
}));

// Mock sector store (SectorSelector now uses useActiveSectors)
vi.mock('@/stores/sector.store', () => ({
  useActiveSectors: () => [
    {
      id: 'sector-1',
      name: 'Human Resources',
      description: '',
      icon: 'users',
      status: 'active',
      documentCount: 0,
      createdAt: '',
      updatedAt: '',
    },
    {
      id: 'sector-2',
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

vi.mock('@/stores/user.store', async () => {
  const actual = await vi.importActual('@/stores/user.store');
  return {
    ...actual,
    useSetCurrentSectorId: () => mockSetCurrentSectorId,
    useSetSectors: () => mockSetSectors,
  };
});

describe('SectorSelector', () => {
  beforeEach(() => {
    mockCurrentSectorId.current = null;
    mockSectors.current = [];
    mockSetCurrentSectorId.mockReset();
    mockSetSectors.mockReset();
  });

  it('should render "Select Sector" when no sector is selected', () => {
    mockSectors.current = [];

    render(<SectorSelector />);

    expect(screen.getByText('Select Sector')).toBeInTheDocument();
  });

  it('should display the current sector name', () => {
    mockCurrentSectorId.current = 'sector-1';
    mockSectors.current = [
      { id: 'sector-1', name: 'Human Resources' },
      { id: 'sector-2', name: 'Engineering' },
    ];

    render(<SectorSelector />);

    expect(screen.getByText('Human Resources')).toBeInTheDocument();
  });

  it('should show "Active" badge when a sector is selected', () => {
    mockCurrentSectorId.current = 'sector-1';
    mockSectors.current = [{ id: 'sector-1', name: 'HR' }];

    render(<SectorSelector />);

    expect(screen.getByText('Active')).toBeInTheDocument();
  });

  it('should not show "Active" badge when no sector is selected', () => {
    mockSectors.current = [];

    render(<SectorSelector />);

    expect(screen.queryByText('Active')).not.toBeInTheDocument();
  });

  it('should render the Sector label', () => {
    render(<SectorSelector />);

    expect(screen.getByText('Sector:')).toBeInTheDocument();
  });

  it('should open dropdown with sector options when clicked', async () => {
    const user = userEvent.setup();
    mockCurrentSectorId.current = 'sector-1';
    mockSectors.current = [
      { id: 'sector-1', name: 'Human Resources' },
      { id: 'sector-2', name: 'Engineering' },
      { id: 'sector-3', name: 'Sales' },
    ];

    render(<SectorSelector />);

    // Click the trigger button
    await user.click(screen.getByRole('button'));

    // Dropdown should show the title and sectors
    expect(screen.getByText('Select Your Sector')).toBeInTheDocument();
    expect(screen.getByText('Engineering')).toBeInTheDocument();
    expect(screen.getByText('Sales')).toBeInTheDocument();
  });
});
