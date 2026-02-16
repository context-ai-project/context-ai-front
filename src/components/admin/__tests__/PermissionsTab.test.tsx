import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PermissionsTab } from '../PermissionsTab';
import type { AdminUserResponse } from '@/lib/api/admin.api';
import type { Sector } from '@/types/sector.types';

// Mock admin API
vi.mock('@/lib/api/admin.api', () => ({
  adminApi: {
    updateUserSectors: vi.fn(),
  },
}));

const mockUsers: AdminUserResponse[] = [
  {
    id: 'u1',
    auth0UserId: 'auth0|1',
    email: 'admin@test.com',
    name: 'Admin User',
    isActive: true,
    roles: ['admin'],
    sectorIds: [],
    createdAt: '2025-01-01T00:00:00Z',
    lastLoginAt: null,
  },
  {
    id: 'u2',
    auth0UserId: 'auth0|2',
    email: 'user@test.com',
    name: 'Regular User',
    isActive: true,
    roles: ['user'],
    sectorIds: ['s1'],
    createdAt: '2025-06-01T00:00:00Z',
    lastLoginAt: null,
  },
];

const mockSectors: Sector[] = [
  {
    id: 's1',
    name: 'Engineering',
    description: 'Eng',
    icon: 'code',
    status: 'active',
    documentCount: 5,
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z',
  },
  {
    id: 's2',
    name: 'Sales',
    description: 'Sales',
    icon: 'briefcase',
    status: 'inactive',
    documentCount: 2,
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z',
  },
];

describe('PermissionsTab', () => {
  const onUserUpdated = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render title and subtitle', () => {
    render(
      <PermissionsTab users={mockUsers} sectors={mockSectors} onUserUpdated={onUserUpdated} />,
    );

    expect(screen.getByText('permissions.title')).toBeInTheDocument();
    expect(screen.getByText('permissions.subtitle')).toBeInTheDocument();
  });

  it('should render only active sectors as columns', () => {
    render(
      <PermissionsTab users={mockUsers} sectors={mockSectors} onUserUpdated={onUserUpdated} />,
    );

    // Only 'Engineering' is active, 'Sales' is inactive
    expect(screen.getByText('Engineering')).toBeInTheDocument();
    expect(screen.queryByText('Sales')).not.toBeInTheDocument();
  });

  it('should render user rows', () => {
    render(
      <PermissionsTab users={mockUsers} sectors={mockSectors} onUserUpdated={onUserUpdated} />,
    );

    expect(screen.getByText('Admin User')).toBeInTheDocument();
    expect(screen.getByText('Regular User')).toBeInTheDocument();
  });

  it('should show Admin badge for admin users', () => {
    render(
      <PermissionsTab users={mockUsers} sectors={mockSectors} onUserUpdated={onUserUpdated} />,
    );

    expect(screen.getByText('Admin')).toBeInTheDocument();
  });

  it('should render switch elements for each user-sector pair', () => {
    render(
      <PermissionsTab users={mockUsers} sectors={mockSectors} onUserUpdated={onUserUpdated} />,
    );

    // 2 users × 1 active sector = 2 switches
    const switches = screen.getAllByRole('switch');
    expect(switches).toHaveLength(2);
  });

  it('should disable switch for admin users', () => {
    render(
      <PermissionsTab users={mockUsers} sectors={mockSectors} onUserUpdated={onUserUpdated} />,
    );

    const switches = screen.getAllByRole('switch');
    // The admin user's switch should be disabled
    const adminSwitch = switches[0];
    expect(adminSwitch).toBeDisabled();
  });

  it('should filter users by search', async () => {
    render(
      <PermissionsTab users={mockUsers} sectors={mockSectors} onUserUpdated={onUserUpdated} />,
    );

    const input = screen.getByRole('textbox');
    await userEvent.type(input, 'regular');

    expect(screen.getByText('Regular User')).toBeInTheDocument();
    expect(screen.queryByText('Admin User')).not.toBeInTheDocument();
  });

  it('should show empty state when no users match search', async () => {
    render(
      <PermissionsTab users={mockUsers} sectors={mockSectors} onUserUpdated={onUserUpdated} />,
    );

    const input = screen.getByRole('textbox');
    await userEvent.type(input, 'zzzzz');

    expect(screen.getByText('noResults')).toBeInTheDocument();
  });
});
