import { render, screen } from '@/test/test-utils';
import { UserProfile } from '../UserProfile';

// Mock useCurrentUser hook
const mockUseCurrentUser = vi.fn();
vi.mock('@/hooks/useCurrentUser', () => ({
  useCurrentUser: () => mockUseCurrentUser(),
}));

/** Shared test constants */
const TEST_USER_ID = 'user-1';
const TEST_EMAIL = 'test@example.com';
const TEST_NAME = 'Test User';
const SECTOR_1 = { id: 'sector-1', name: 'Engineering' };
const SECTOR_2 = { id: 'sector-2', name: 'Sales' };

/** Factory for authenticated user state */
function authenticatedState(overrides: Record<string, unknown> = {}) {
  return {
    user: { id: TEST_USER_ID, name: TEST_NAME, email: TEST_EMAIL },
    userName: TEST_NAME,
    userEmail: TEST_EMAIL,
    userPicture: '',
    currentSectorId: null,
    sectors: [],
    ...overrides,
  };
}

describe('UserProfile', () => {
  beforeEach(() => {
    mockUseCurrentUser.mockReset();
  });

  it('should render nothing when user is not authenticated', () => {
    mockUseCurrentUser.mockReturnValue({
      user: null,
      userName: 'Guest',
      userEmail: '',
      userPicture: '',
      currentSectorId: null,
      sectors: [],
    });

    const { container } = render(<UserProfile />);
    expect(container.firstChild).toBeNull();
  });

  it('should render user information when authenticated', () => {
    mockUseCurrentUser.mockReturnValue(
      authenticatedState({
        user: { id: TEST_USER_ID, name: 'John Doe', email: 'john@example.com' },
        userName: 'John Doe',
        userEmail: 'john@example.com',
        currentSectorId: 'sector-1',
        sectors: [SECTOR_1, SECTOR_2],
      }),
    );

    render(<UserProfile />);

    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getAllByText('john@example.com').length).toBeGreaterThanOrEqual(1);
  });

  it('should display current sector badge', () => {
    mockUseCurrentUser.mockReturnValue(
      authenticatedState({
        user: { id: TEST_USER_ID, name: 'Jane', email: 'jane@example.com' },
        userName: 'Jane',
        userEmail: 'jane@example.com',
        currentSectorId: 'sector-2',
        sectors: [
          { id: 'sector-1', name: 'HR' },
          { id: 'sector-2', name: 'Engineering' },
        ],
      }),
    );

    render(<UserProfile />);

    expect(screen.getByText('Engineering')).toBeInTheDocument();
    expect(screen.getByText(/current sector/i)).toBeInTheDocument();
  });

  it('should not display sector when no sector is selected', () => {
    mockUseCurrentUser.mockReturnValue(
      authenticatedState({
        userName: 'Test',
        user: { id: TEST_USER_ID, name: 'Test', email: TEST_EMAIL },
      }),
    );

    render(<UserProfile />);

    expect(screen.queryByText(/current sector/i)).not.toBeInTheDocument();
  });

  it('should display email in the card content', () => {
    mockUseCurrentUser.mockReturnValue(authenticatedState());

    render(<UserProfile />);

    const emailLabels = screen.getAllByText(new RegExp(TEST_EMAIL, 'i'));
    expect(emailLabels.length).toBeGreaterThanOrEqual(1);
  });

  it('should render logout button', () => {
    mockUseCurrentUser.mockReturnValue(authenticatedState());

    render(<UserProfile />);

    // LogoutButton with showLabel=false renders as icon button with aria-label
    expect(screen.getByRole('button', { name: /logout/i })).toBeInTheDocument();
  });
});
