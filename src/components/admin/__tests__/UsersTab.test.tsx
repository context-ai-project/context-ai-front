import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { UsersTab } from '../UsersTab';
import type { AdminUserResponse } from '@/lib/api/admin.api';
import type { Sector } from '@/types/sector.types';

// Mock admin API
vi.mock('@/lib/api/admin.api', () => ({
  adminApi: {
    updateUserRole: vi.fn(),
    toggleUserStatus: vi.fn(),
  },
}));

// Mock invitation API
vi.mock('@/lib/api/invitation.api', () => ({
  invitationApi: {
    createInvitation: vi.fn(),
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
    isActive: false,
    roles: ['user'],
    sectorIds: ['s1'],
    createdAt: '2025-06-01T00:00:00Z',
    lastLoginAt: '2025-07-01T00:00:00Z',
  },
];

const mockSectors: Sector[] = [
  {
    id: 's1',
    name: 'Engineering',
    description: 'Engineering sector',
    icon: 'code',
    status: 'active',
    documentCount: 5,
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z',
  },
];

describe('UsersTab', () => {
  const onUserUpdated = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render users in table', () => {
    render(
      <UsersTab
        users={mockUsers}
        sectors={mockSectors}
        isLoading={false}
        error={null}
        onUserUpdated={onUserUpdated}
      />,
    );

    expect(screen.getByText('Admin User')).toBeInTheDocument();
    expect(screen.getByText('admin@test.com')).toBeInTheDocument();
    expect(screen.getByText('Regular User')).toBeInTheDocument();
    expect(screen.getByText('user@test.com')).toBeInTheDocument();
  });

  it('should show loading state when loading and no users', () => {
    render(
      <UsersTab
        users={[]}
        sectors={mockSectors}
        isLoading={true}
        error={null}
        onUserUpdated={onUserUpdated}
      />,
    );

    expect(screen.getByText('loading')).toBeInTheDocument();
  });

  it('should show error banner when error is present', () => {
    render(
      <UsersTab
        users={mockUsers}
        sectors={mockSectors}
        isLoading={false}
        error="Something went wrong"
        onUserUpdated={onUserUpdated}
      />,
    );

    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
  });

  it('should show no results when filtered list is empty', () => {
    render(
      <UsersTab
        users={[]}
        sectors={mockSectors}
        isLoading={false}
        error={null}
        onUserUpdated={onUserUpdated}
      />,
    );

    expect(screen.getByText('noResults')).toBeInTheDocument();
  });

  it('should filter users by search', async () => {
    render(
      <UsersTab
        users={mockUsers}
        sectors={mockSectors}
        isLoading={false}
        error={null}
        onUserUpdated={onUserUpdated}
      />,
    );

    const input = screen.getByRole('textbox');
    await userEvent.type(input, 'admin');

    expect(screen.getByText('Admin User')).toBeInTheDocument();
    expect(screen.queryByText('Regular User')).not.toBeInTheDocument();
  });

  it('should show role badge and status indicator', () => {
    render(
      <UsersTab
        users={mockUsers}
        sectors={mockSectors}
        isLoading={false}
        error={null}
        onUserUpdated={onUserUpdated}
      />,
    );

    // Role badges — using translation keys (mock returns key as text)
    expect(screen.getByText('roles.admin')).toBeInTheDocument();
    expect(screen.getByText('roles.user')).toBeInTheDocument();

    // Status indicators
    expect(screen.getByText('status.active')).toBeInTheDocument();
    expect(screen.getByText('status.inactive')).toBeInTheDocument();
  });

  it('should show user with no roles as "user" role', () => {
    const noRoleUser: AdminUserResponse = {
      ...mockUsers[0],
      id: 'u3',
      roles: [],
    };

    render(
      <UsersTab
        users={[noRoleUser]}
        sectors={mockSectors}
        isLoading={false}
        error={null}
        onUserUpdated={onUserUpdated}
      />,
    );

    expect(screen.getByText('roles.user')).toBeInTheDocument();
  });

  it('should render invite button (enabled)', () => {
    render(
      <UsersTab
        users={mockUsers}
        sectors={mockSectors}
        isLoading={false}
        error={null}
        onUserUpdated={onUserUpdated}
      />,
    );

    const inviteBtn = screen.getByText('inviteUser');
    expect(inviteBtn.closest('button')).not.toBeDisabled();
  });
});
