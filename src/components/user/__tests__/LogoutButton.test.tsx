import { render, screen } from '@/test/test-utils';
import userEvent from '@testing-library/user-event';
import { LogoutButton } from '../LogoutButton';

// Mock next-auth/react signOut
const mockSignOut = vi.fn();
vi.mock('next-auth/react', async () => {
  const actual = await vi.importActual('next-auth/react');
  return {
    ...actual,
    signOut: (...args: unknown[]) => mockSignOut(...args),
  };
});

describe('LogoutButton', () => {
  beforeEach(() => {
    mockSignOut.mockReset();
    mockSignOut.mockResolvedValue(undefined);
  });

  it('should render with label by default', () => {
    render(<LogoutButton />);

    expect(screen.getByText('Logout')).toBeInTheDocument();
  });

  it('should render without label when showLabel is false', () => {
    render(<LogoutButton showLabel={false} />);

    expect(screen.queryByText('Logout')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: /logout/i })).toBeInTheDocument();
  });

  it('should show confirmation dialog when clicked', async () => {
    const user = userEvent.setup();
    render(<LogoutButton />);

    await user.click(screen.getByText('Logout'));

    expect(screen.getByText('Are you sure you want to logout?')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Logout' })).toBeInTheDocument();
  });

  it('should call signOut when confirmed', async () => {
    const user = userEvent.setup();
    render(<LogoutButton />);

    // Open dialog
    await user.click(screen.getByText('Logout'));

    // Confirm logout (click the Logout button in the dialog)
    const dialogButtons = screen.getAllByRole('button', { name: 'Logout' });
    const confirmButton = dialogButtons[dialogButtons.length - 1];
    await user.click(confirmButton);

    expect(mockSignOut).toHaveBeenCalledWith(expect.objectContaining({ callbackUrl: '/en' }));
  });

  it('should close dialog when Cancel is clicked', async () => {
    const user = userEvent.setup();
    render(<LogoutButton />);

    // Open dialog
    await user.click(screen.getByText('Logout'));
    expect(screen.getByText('Are you sure you want to logout?')).toBeInTheDocument();

    // Cancel
    await user.click(screen.getByRole('button', { name: 'Cancel' }));

    // Dialog should close (dialog text should disappear)
    expect(screen.queryByText('Are you sure you want to logout?')).not.toBeInTheDocument();
  });

  it('should display warning about unsaved changes', async () => {
    const user = userEvent.setup();
    render(<LogoutButton />);

    await user.click(screen.getByText('Logout'));

    expect(screen.getByText(/unsaved changes will be lost/i)).toBeInTheDocument();
  });
});
