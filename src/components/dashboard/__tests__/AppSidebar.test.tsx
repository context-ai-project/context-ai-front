import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AppSidebar } from '../app-sidebar';

// Create a controllable mock for useSession
const mockUseSession = vi.fn();

// Override next-auth/react mock from setup.ts
vi.mock('next-auth/react', () => ({
  useSession: () => mockUseSession(),
  signOut: vi.fn(),
  SessionProvider: ({ children }: { children: React.ReactNode }) => children,
}));

// Mock sidebar UI components to simplify testing
vi.mock('@/components/ui/sidebar', () => ({
  Sidebar: ({ children }: { children: React.ReactNode }) => (
    <aside data-testid="sidebar">{children}</aside>
  ),
  SidebarContent: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="sidebar-content">{children}</div>
  ),
  SidebarFooter: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div data-testid="sidebar-footer" className={className}>
      {children}
    </div>
  ),
  SidebarGroup: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  SidebarGroupContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  SidebarGroupLabel: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  SidebarHeader: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div data-testid="sidebar-header" className={className}>
      {children}
    </div>
  ),
  SidebarMenu: ({ children }: { children: React.ReactNode }) => <ul>{children}</ul>,
  SidebarMenuButton: ({
    children,
    isActive,
    tooltip,
    asChild,
  }: {
    children: React.ReactNode;
    isActive?: boolean;
    tooltip?: string;
    asChild?: boolean;
  }) => (
    <div data-active={isActive} data-tooltip={tooltip} data-as-child={asChild}>
      {children}
    </div>
  ),
  SidebarMenuItem: ({ children }: { children: React.ReactNode }) => <li>{children}</li>,
  SidebarSeparator: () => <hr />,
}));

// Mock Radix dropdown to simplify
vi.mock('@/components/ui/dropdown-menu', () => ({
  DropdownMenu: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  DropdownMenuContent: ({
    children,
  }: {
    children: React.ReactNode;
    side?: string;
    align?: string;
    className?: string;
  }) => <div data-testid="dropdown-content">{children}</div>,
  DropdownMenuItem: ({
    children,
    onClick,
  }: {
    children: React.ReactNode;
    onClick?: () => void;
  }) => (
    <button onClick={onClick} data-testid="dropdown-item">
      {children}
    </button>
  ),
  DropdownMenuTrigger: ({
    children,
    asChild,
  }: {
    children: React.ReactNode;
    asChild?: boolean;
  }) => <div data-as-child={asChild}>{children}</div>,
}));

// Mock Avatar
vi.mock('@/components/ui/avatar', () => ({
  Avatar: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div data-testid="avatar" className={className}>
      {children}
    </div>
  ),
  AvatarImage: ({ src, alt }: { src?: string; alt?: string }) => (
    <div data-testid="avatar-image" data-src={src} aria-label={alt} role="img" />
  ),
  AvatarFallback: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <span data-testid="avatar-fallback" className={className}>
      {children}
    </span>
  ),
}));

const defaultSession = {
  data: {
    user: {
      id: 'test-user-id',
      name: 'Test User',
      email: 'test@example.com',
      image: null,
    },
    accessToken: 'test-access-token',
    expires: new Date(Date.now() + 86400000).toISOString(),
  },
  status: 'authenticated',
};

describe('AppSidebar', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseSession.mockReturnValue(defaultSession);
  });

  it('should render the sidebar with navigation items', () => {
    render(<AppSidebar />);

    expect(screen.getByText('Context.ai')).toBeInTheDocument();
    expect(screen.getByText('dashboard')).toBeInTheDocument();
    expect(screen.getByText('chat')).toBeInTheDocument();
    expect(screen.getByText('platform')).toBeInTheDocument();
  });

  it('should render user initials from session name', () => {
    render(<AppSidebar />);

    // The session mock provides "Test User" so initials should be "TU"
    expect(screen.getByTestId('avatar-fallback')).toHaveTextContent('TU');
  });

  it('should render user name from session', () => {
    render(<AppSidebar />);

    expect(screen.getByText('Test User')).toBeInTheDocument();
  });

  it('should render "U" as fallback initials when name is empty', () => {
    mockUseSession.mockReturnValue({
      data: {
        user: {
          id: 'test-id',
          name: null,
          email: 'test@example.com',
          image: null,
        },
        accessToken: 'test-token',
        expires: new Date(Date.now() + 86400000).toISOString(),
      },
      status: 'authenticated',
    });

    render(<AppSidebar />);

    expect(screen.getByTestId('avatar-fallback')).toHaveTextContent('U');
  });

  it('should render "User" when session name is null', () => {
    mockUseSession.mockReturnValue({
      data: {
        user: {
          id: 'test-id',
          name: null,
          email: 'test@example.com',
          image: null,
        },
        accessToken: 'test-token',
        expires: new Date(Date.now() + 86400000).toISOString(),
      },
      status: 'authenticated',
    });

    render(<AppSidebar />);

    expect(screen.getByText('User')).toBeInTheDocument();
  });

  it('should display role as "user" when no roles in session', () => {
    render(<AppSidebar />);

    // Default session mock has no roles, so getUserRole() returns 'user'
    expect(screen.getByText('user')).toBeInTheDocument();
  });

  it('should display role from session when roles are available', () => {
    mockUseSession.mockReturnValue({
      data: {
        user: {
          id: 'test-id',
          name: 'Admin User',
          email: 'admin@example.com',
          image: null,
          roles: ['admin'],
        },
        accessToken: 'test-token',
        expires: new Date(Date.now() + 86400000).toISOString(),
      },
      status: 'authenticated',
    });

    render(<AppSidebar />);

    // The role text is in the footer area (xs text below the user name)
    const roleElements = screen.getAllByText('admin');
    expect(roleElements.length).toBeGreaterThanOrEqual(1);
  });

  it('should render avatar image when session has user image', () => {
    mockUseSession.mockReturnValue({
      data: {
        user: {
          id: 'test-id',
          name: 'Test User',
          email: 'test@example.com',
          image: 'https://example.com/avatar.jpg',
        },
        accessToken: 'test-token',
        expires: new Date(Date.now() + 86400000).toISOString(),
      },
      status: 'authenticated',
    });

    render(<AppSidebar />);

    const avatarImage = screen.getByTestId('avatar-image');
    expect(avatarImage).toHaveAttribute('data-src', 'https://example.com/avatar.jpg');
  });

  it('should render Sign Out option', () => {
    render(<AppSidebar />);

    expect(screen.getByText('signOut')).toBeInTheDocument();
  });

  it('should have correct navigation links with locale', () => {
    render(<AppSidebar />);

    const dashboardLink = screen.getByText('dashboard').closest('a');
    const chatLink = screen.getByText('chat').closest('a');

    expect(dashboardLink).toHaveAttribute('href', '/en/dashboard');
    expect(chatLink).toHaveAttribute('href', '/en/chat');
  });
});
