import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Navbar } from '../Navbar';

// Mock useCurrentUser hook
const mockUseCurrentUser = vi.fn();
vi.mock('@/hooks/useCurrentUser', () => ({
  useCurrentUser: () => mockUseCurrentUser(),
}));

// Mock child components to isolate Navbar testing
vi.mock('../UserAvatar', () => ({
  UserAvatar: ({ alt }: { src?: string; alt?: string }) => (
    <div data-testid="user-avatar">{alt}</div>
  ),
}));

vi.mock('../LanguageSelector', () => ({
  LanguageSelector: () => <div data-testid="language-selector">LanguageSelector</div>,
}));

vi.mock('@/components/user/SectorSelector', () => ({
  SectorSelector: () => <div data-testid="sector-selector">SectorSelector</div>,
}));

vi.mock('@/components/user/LogoutButton', () => ({
  LogoutButton: ({ showLabel }: { variant?: string; size?: string; showLabel?: boolean }) => (
    <button data-testid="logout-button">{showLabel ? 'Logout' : ''}</button>
  ),
}));

// Mock dropdown menu
vi.mock('@/components/ui/dropdown-menu', () => ({
  DropdownMenu: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  DropdownMenuContent: ({
    children,
  }: {
    children: React.ReactNode;
    align?: string;
    className?: string;
  }) => <div data-testid="dropdown-content">{children}</div>,
  DropdownMenuItem: ({ children, asChild }: { children: React.ReactNode; asChild?: boolean }) => (
    <div data-as-child={asChild}>{children}</div>
  ),
  DropdownMenuLabel: ({ children }: { children: React.ReactNode; className?: string }) => (
    <div data-testid="dropdown-label">{children}</div>
  ),
  DropdownMenuSeparator: ({ className }: { className?: string }) => <hr className={className} />,
  DropdownMenuTrigger: ({
    children,
    asChild,
  }: {
    children: React.ReactNode;
    asChild?: boolean;
  }) => <div data-as-child={asChild}>{children}</div>,
}));

vi.mock('@/components/ui/button', () => ({
  Button: ({
    children,
    asChild,
    variant,
    className,
  }: {
    children: React.ReactNode;
    asChild?: boolean;
    variant?: string;
    className?: string;
  }) => (
    <div data-variant={variant} data-as-child={asChild} className={className}>
      {children}
    </div>
  ),
}));

describe('Navbar', () => {
  it('should render logo and brand name', () => {
    mockUseCurrentUser.mockReturnValue({
      user: null,
      isLoading: false,
      userName: 'Guest',
      userEmail: '',
      userPicture: '',
    });

    render(<Navbar />);

    expect(screen.getByText('Context.ai')).toBeInTheDocument();
  });

  it('should render navigation links', () => {
    mockUseCurrentUser.mockReturnValue({
      user: null,
      isLoading: false,
      userName: 'Guest',
      userEmail: '',
      userPicture: '',
    });

    render(<Navbar />);

    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Chat')).toBeInTheDocument();
    expect(screen.getByText('Knowledge')).toBeInTheDocument();
  });

  it('should show loading skeleton when loading', () => {
    mockUseCurrentUser.mockReturnValue({
      user: null,
      isLoading: true,
      userName: 'Guest',
      userEmail: '',
      userPicture: '',
    });

    render(<Navbar />);

    // Loading skeleton has animate-pulse class
    const skeleton = document.querySelector('.animate-pulse');
    expect(skeleton).toBeTruthy();
  });

  it('should show Sign In button when not authenticated', () => {
    mockUseCurrentUser.mockReturnValue({
      user: null,
      isLoading: false,
      userName: 'Guest',
      userEmail: '',
      userPicture: '',
    });

    render(<Navbar />);

    expect(screen.getByText('Sign In')).toBeInTheDocument();
  });

  it('should show user info when authenticated', () => {
    mockUseCurrentUser.mockReturnValue({
      user: {
        id: 'user-1',
        name: 'Test User',
        email: 'test@example.com',
        image: 'https://example.com/avatar.jpg',
      },
      isLoading: false,
      userName: 'Test User',
      userEmail: 'test@example.com',
      userPicture: 'https://example.com/avatar.jpg',
    });

    render(<Navbar />);

    // User name appears in both the button and the dropdown label
    const userNameElements = screen.getAllByText('Test User');
    expect(userNameElements.length).toBeGreaterThanOrEqual(1);

    const emailElements = screen.getAllByText('test@example.com');
    expect(emailElements.length).toBeGreaterThanOrEqual(1);
  });

  it('should show sector selector when user is authenticated', () => {
    mockUseCurrentUser.mockReturnValue({
      user: {
        id: 'user-1',
        name: 'Test User',
        email: 'test@example.com',
        image: null,
      },
      isLoading: false,
      userName: 'Test User',
      userEmail: 'test@example.com',
      userPicture: '',
    });

    render(<Navbar />);

    expect(screen.getAllByTestId('sector-selector').length).toBeGreaterThan(0);
  });

  it('should show language selector', () => {
    mockUseCurrentUser.mockReturnValue({
      user: null,
      isLoading: false,
      userName: 'Guest',
      userEmail: '',
      userPicture: '',
    });

    render(<Navbar />);

    expect(screen.getAllByTestId('language-selector').length).toBeGreaterThan(0);
  });

  it('should show logout button when authenticated', () => {
    mockUseCurrentUser.mockReturnValue({
      user: {
        id: 'user-1',
        name: 'Test User',
        email: 'test@example.com',
        image: null,
      },
      isLoading: false,
      userName: 'Test User',
      userEmail: 'test@example.com',
      userPicture: '',
    });

    render(<Navbar />);

    expect(screen.getByTestId('logout-button')).toBeInTheDocument();
  });

  it('should show Profile and Settings links when authenticated', () => {
    mockUseCurrentUser.mockReturnValue({
      user: {
        id: 'user-1',
        name: 'Test User',
        email: 'test@example.com',
        image: null,
      },
      isLoading: false,
      userName: 'Test User',
      userEmail: 'test@example.com',
      userPicture: '',
    });

    render(<Navbar />);

    expect(screen.getByText('Profile')).toBeInTheDocument();
    expect(screen.getByText('Settings')).toBeInTheDocument();
  });
});
