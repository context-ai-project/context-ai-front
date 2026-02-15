import { render, screen, waitFor } from '@testing-library/react';
import { AdminView } from '../AdminView';

// ── Mocks ─────────────────────────────────────────────────────────────────────

const mockListUsers = vi.fn();
const mockListSectors = vi.fn();

vi.mock('@/lib/api/admin.api', () => ({
  adminApi: {
    listUsers: (...args: unknown[]) => mockListUsers(...args),
    updateUserRole: vi.fn(),
    toggleUserStatus: vi.fn(),
    updateUserSectors: vi.fn(),
  },
}));

vi.mock('@/lib/api/sector.api', () => ({
  sectorApi: {
    listSectors: (...args: unknown[]) => mockListSectors(...args),
  },
}));

const mockUser = {
  id: 'u1',
  auth0UserId: 'auth0|1',
  email: 'user@test.com',
  name: 'Test User',
  isActive: true,
  roles: ['admin'],
  sectorIds: [],
  createdAt: '2025-01-01T00:00:00Z',
  lastLoginAt: null,
};

const mockSector = {
  id: 's1',
  name: 'Engineering',
  description: 'Eng',
  icon: 'code' as const,
  status: 'active' as const,
  documentCount: 2,
  createdAt: '2025-01-01T00:00:00Z',
  updatedAt: '2025-01-01T00:00:00Z',
};

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('AdminView', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockListUsers.mockResolvedValue([mockUser]);
    mockListSectors.mockResolvedValue([mockSector]);
  });

  it('should render title and subtitle', async () => {
    render(<AdminView />);

    expect(screen.getByText('title')).toBeInTheDocument();
    expect(screen.getByText('subtitle')).toBeInTheDocument();
  });

  it('should render tabs', async () => {
    render(<AdminView />);

    expect(screen.getByText('tabs.users')).toBeInTheDocument();
    expect(screen.getByText('tabs.permissions')).toBeInTheDocument();
  });

  it('should fetch users and sectors on mount', async () => {
    render(<AdminView />);

    await waitFor(() => {
      expect(mockListUsers).toHaveBeenCalledOnce();
      expect(mockListSectors).toHaveBeenCalledOnce();
    });
  });

  it('should display users table after data loads', async () => {
    render(<AdminView />);

    await waitFor(() => {
      expect(screen.getByText('Test User')).toBeInTheDocument();
    });
  });

  it('should show error banner on fetch failure', async () => {
    mockListUsers.mockRejectedValue(new Error('Fetch failed'));

    render(<AdminView />);

    await waitFor(() => {
      expect(screen.getByText('Fetch failed')).toBeInTheDocument();
    });
  });
});
