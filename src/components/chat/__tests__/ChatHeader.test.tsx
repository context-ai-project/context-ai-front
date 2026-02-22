import { render, screen } from '@/test/test-utils';
import { ChatHeader } from '../ChatHeader';

const mockUseCurrentSectorId = vi.fn();
const mockUseSectors = vi.fn();
const mockUseSetCurrentSectorId = vi.fn();
const mockUseSetSectors = vi.fn();
const mockUseActiveSectors = vi.fn();
const mockGetUserRole = vi.fn();
const mockHasPermission = vi.fn();

vi.mock('@/stores/user.store', () => ({
  useCurrentSectorId: () => mockUseCurrentSectorId(),
  useSectors: () => mockUseSectors(),
  useSetCurrentSectorId: () => mockUseSetCurrentSectorId(),
  useSetSectors: () => mockUseSetSectors(),
  UserStoreProvider: ({ children }: { children: React.ReactNode }) => children,
}));

vi.mock('@/stores/sector.store', () => ({
  useActiveSectors: () => mockUseActiveSectors(),
}));

vi.mock('@/lib/utils/get-user-role', () => ({
  getUserRole: (roles: unknown) => mockGetUserRole(roles),
}));

vi.mock('@/constants/permissions', async () => {
  const actual = await vi.importActual('@/constants/permissions');
  return {
    ...actual,
    hasPermission: (...args: unknown[]) => mockHasPermission(...args),
  };
});

describe('ChatHeader', () => {
  const setCurrentSectorId = vi.fn();
  const setSectors = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseCurrentSectorId.mockReturnValue('s-1');
    mockUseSectors.mockReturnValue([{ id: 's-1', name: 'HR' }]);
    mockUseSetCurrentSectorId.mockReturnValue(setCurrentSectorId);
    mockUseSetSectors.mockReturnValue(setSectors);
    mockUseActiveSectors.mockReturnValue([{ id: 's-1', name: 'HR' }]);
    mockGetUserRole.mockReturnValue('user');
    mockHasPermission.mockReturnValue(false);
  });

  it('shows readonly badge for non-admin with single sector', () => {
    render(<ChatHeader />);

    expect(screen.getByText('HR')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /selectSector$/ })).not.toBeInTheDocument();
  });

  it('shows dropdown for non-admin when multiple sectors', () => {
    mockUseSectors.mockReturnValue([
      { id: 's-1', name: 'HR' },
      { id: 's-2', name: 'Finance' },
    ]);

    render(<ChatHeader />);

    expect(screen.getByRole('button', { name: 'HR' })).toBeInTheDocument();
  });

  it('shows dropdown for admin even with single sector', () => {
    mockHasPermission.mockReturnValue(true);

    render(<ChatHeader />);

    expect(screen.getByRole('button', { name: 'HR' })).toBeInTheDocument();
  });

  it('falls back to selectSector label when current sector is missing', () => {
    mockUseCurrentSectorId.mockReturnValue('missing');
    mockUseSectors.mockReturnValue([
      { id: 's-1', name: 'HR' },
      { id: 's-2', name: 'Finance' },
    ]);

    render(<ChatHeader />);

    expect(screen.getByRole('button', { name: /selectSector$/ })).toBeInTheDocument();
  });

  it('auto-selects first sector when current sector is not set', () => {
    mockUseCurrentSectorId.mockReturnValue(null);
    mockUseSectors.mockReturnValue([
      { id: 's-1', name: 'HR' },
      { id: 's-2', name: 'Finance' },
    ]);

    render(<ChatHeader />);

    expect(setCurrentSectorId).toHaveBeenCalledWith('s-1');
  });

  it('auto-selects first sector when current sector is no longer active', () => {
    mockUseCurrentSectorId.mockReturnValue('s-old');
    mockUseSectors.mockReturnValue([{ id: 's-1', name: 'HR' }]);

    render(<ChatHeader />);

    expect(setCurrentSectorId).toHaveBeenCalledWith('s-1');
  });

  it('does not auto-select when current sector is still active', () => {
    mockUseCurrentSectorId.mockReturnValue('s-1');
    mockUseSectors.mockReturnValue([{ id: 's-1', name: 'HR' }]);

    render(<ChatHeader />);

    expect(setCurrentSectorId).not.toHaveBeenCalled();
  });
});
