import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ToggleUserStatusDialog } from '../ToggleUserStatusDialog';
import { adminApi, type AdminUserResponse } from '@/lib/api/admin.api';

// Mock admin API
vi.mock('@/lib/api/admin.api', () => ({
  adminApi: {
    toggleUserStatus: vi.fn(),
  },
}));

const mockToggleUserStatus = vi.mocked(adminApi.toggleUserStatus);

const activeUser: AdminUserResponse = {
  id: 'u1',
  auth0UserId: 'auth0|1',
  email: 'user@test.com',
  name: 'Test User',
  isActive: true,
  roles: ['user'],
  sectorIds: [],
  createdAt: '2025-01-01T00:00:00Z',
  lastLoginAt: null,
};

const inactiveUser: AdminUserResponse = {
  ...activeUser,
  isActive: false,
};

describe('ToggleUserStatusDialog', () => {
  const onOpenChange = vi.fn();
  const onSuccess = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should show deactivate title for active user', () => {
    render(
      <ToggleUserStatusDialog
        open={true}
        onOpenChange={onOpenChange}
        user={activeUser}
        onSuccess={onSuccess}
      />,
    );

    expect(screen.getByText('statusChange.deactivateTitle')).toBeInTheDocument();
    expect(screen.getByText('statusChange.deactivateMessage')).toBeInTheDocument();
  });

  it('should show activate title for inactive user', () => {
    render(
      <ToggleUserStatusDialog
        open={true}
        onOpenChange={onOpenChange}
        user={inactiveUser}
        onSuccess={onSuccess}
      />,
    );

    expect(screen.getByText('statusChange.activateTitle')).toBeInTheDocument();
    expect(screen.getByText('statusChange.activateMessage')).toBeInTheDocument();
  });

  it('should call toggleUserStatus with inverted status on confirm', async () => {
    const deactivatedUser = { ...activeUser, isActive: false };
    mockToggleUserStatus.mockResolvedValue(deactivatedUser);

    render(
      <ToggleUserStatusDialog
        open={true}
        onOpenChange={onOpenChange}
        user={activeUser}
        onSuccess={onSuccess}
      />,
    );

    await userEvent.click(screen.getByText('statusChange.confirm'));

    // For active user, should toggle to false
    expect(mockToggleUserStatus).toHaveBeenCalledWith('u1', false);
    expect(onSuccess).toHaveBeenCalledWith(deactivatedUser);
  });

  it('should call toggleUserStatus to activate for inactive user', async () => {
    const activatedUser = { ...inactiveUser, isActive: true };
    mockToggleUserStatus.mockResolvedValue(activatedUser);

    render(
      <ToggleUserStatusDialog
        open={true}
        onOpenChange={onOpenChange}
        user={inactiveUser}
        onSuccess={onSuccess}
      />,
    );

    await userEvent.click(screen.getByText('statusChange.confirm'));

    expect(mockToggleUserStatus).toHaveBeenCalledWith('u1', true);
  });

  it('should show error on API failure', async () => {
    mockToggleUserStatus.mockRejectedValue(new Error('Status change failed'));

    render(
      <ToggleUserStatusDialog
        open={true}
        onOpenChange={onOpenChange}
        user={activeUser}
        onSuccess={onSuccess}
      />,
    );

    await userEvent.click(screen.getByText('statusChange.confirm'));

    expect(await screen.findByText('Status change failed')).toBeInTheDocument();
  });

  it('should not render when user is null', () => {
    const { container } = render(
      <ToggleUserStatusDialog
        open={true}
        onOpenChange={onOpenChange}
        user={null}
        onSuccess={onSuccess}
      />,
    );

    expect(container.querySelector('[role="dialog"]')).not.toBeInTheDocument();
  });
});
