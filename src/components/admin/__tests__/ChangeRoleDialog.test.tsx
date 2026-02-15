import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ChangeRoleDialog } from '../ChangeRoleDialog';
import { adminApi, type AdminUserResponse } from '@/lib/api/admin.api';

// Mock admin API
vi.mock('@/lib/api/admin.api', () => ({
  adminApi: {
    updateUserRole: vi.fn(),
  },
}));

const mockUpdateUserRole = vi.mocked(adminApi.updateUserRole);

const mockUser: AdminUserResponse = {
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

describe('ChangeRoleDialog', () => {
  const onOpenChange = vi.fn();
  const onSuccess = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render dialog with title', () => {
    render(
      <ChangeRoleDialog
        open={true}
        onOpenChange={onOpenChange}
        user={mockUser}
        onSuccess={onSuccess}
      />,
    );

    expect(screen.getByText('roleChange.title')).toBeInTheDocument();
    expect(screen.getByText('roleChange.message')).toBeInTheDocument();
  });

  it('should render role selector with options', () => {
    render(
      <ChangeRoleDialog
        open={true}
        onOpenChange={onOpenChange}
        user={mockUser}
        onSuccess={onSuccess}
      />,
    );

    // The select trigger should show the current role
    expect(screen.getByRole('combobox')).toBeInTheDocument();
  });

  it('should render cancel and confirm buttons', () => {
    render(
      <ChangeRoleDialog
        open={true}
        onOpenChange={onOpenChange}
        user={mockUser}
        onSuccess={onSuccess}
      />,
    );

    expect(screen.getByText('roleChange.cancel')).toBeInTheDocument();
    expect(screen.getByText('roleChange.confirm')).toBeInTheDocument();
  });

  it('should call adminApi.updateUserRole on confirm', async () => {
    const updatedUser = { ...mockUser, roles: ['admin'] };
    mockUpdateUserRole.mockResolvedValue(updatedUser);

    render(
      <ChangeRoleDialog
        open={true}
        onOpenChange={onOpenChange}
        user={mockUser}
        onSuccess={onSuccess}
      />,
    );

    // Click confirm button
    const confirmBtn = screen.getByText('roleChange.confirm');
    await userEvent.click(confirmBtn);

    // Uses the current role (user) because we haven't changed the select
    expect(mockUpdateUserRole).toHaveBeenCalledWith('u1', 'user');
  });

  it('should not render when user is null', () => {
    const { container } = render(
      <ChangeRoleDialog
        open={true}
        onOpenChange={onOpenChange}
        user={null}
        onSuccess={onSuccess}
      />,
    );

    // Dialog should not have content
    expect(container.querySelector('[role="dialog"]')).not.toBeInTheDocument();
  });

  it('should show error on API failure', async () => {
    mockUpdateUserRole.mockRejectedValue(new Error('Role update failed'));

    render(
      <ChangeRoleDialog
        open={true}
        onOpenChange={onOpenChange}
        user={mockUser}
        onSuccess={onSuccess}
      />,
    );

    await userEvent.click(screen.getByText('roleChange.confirm'));

    // Error message should be displayed
    expect(await screen.findByText('Role update failed')).toBeInTheDocument();
  });
});
