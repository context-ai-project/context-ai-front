import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest';
import { LandingNavbar } from '../LandingNavbar';
import { useTranslations } from 'next-intl';

// Mock LanguageSelector
vi.mock('@/components/shared/LanguageSelector', () => ({
  LanguageSelector: () => <div data-testid="language-selector">LanguageSelector</div>,
}));

// Override next-intl for finer control
vi.mock('next-intl', () => ({
  useTranslations: vi.fn(),
  useLocale: () => 'en',
}));

// Mock Button component
vi.mock('@/components/ui/button', () => ({
  Button: ({
    children,
    asChild,
    variant,
  }: {
    children: React.ReactNode;
    asChild?: boolean;
    variant?: string;
  }) => (
    <div data-variant={variant} data-as-child={asChild}>
      {children}
    </div>
  ),
}));

describe('LandingNavbar', () => {
  const mockTranslate = vi.fn((key: string) => {
    const translations: Record<string, string> = {
      features: 'Features',
      howItWorks: 'How it Works',
      useCases: 'Use Cases',
      signIn: 'Sign In',
      getStarted: 'Get Started',
      openMenu: 'Open menu',
      closeMenu: 'Close menu',
    };
    return translations[key] || key;
  });

  beforeEach(() => {
    vi.clearAllMocks();
    (useTranslations as Mock).mockReturnValue(mockTranslate);
  });

  it('should render logo and brand name', () => {
    render(<LandingNavbar />);

    expect(screen.getByText('Context.ai')).toBeInTheDocument();
  });

  it('should render desktop navigation links', () => {
    render(<LandingNavbar />);

    expect(screen.getByText('Features')).toBeInTheDocument();
    expect(screen.getByText('How it Works')).toBeInTheDocument();
    expect(screen.getByText('Use Cases')).toBeInTheDocument();
  });

  it('should render auth buttons', () => {
    render(<LandingNavbar />);

    const signInButtons = screen.getAllByText('Sign In');
    const getStartedButtons = screen.getAllByText('Get Started');

    expect(signInButtons.length).toBeGreaterThan(0);
    expect(getStartedButtons.length).toBeGreaterThan(0);
  });

  it('should toggle mobile menu on hamburger button click', async () => {
    const user = userEvent.setup();
    render(<LandingNavbar />);

    // Initially mobile menu should not be visible
    const mobileMenuButton = screen.getByRole('button', { name: 'Open menu' });
    expect(mobileMenuButton).toBeInTheDocument();

    // Click to open
    await user.click(mobileMenuButton);

    // Now the close button should appear
    const closeButton = screen.getByRole('button', { name: 'Close menu' });
    expect(closeButton).toBeInTheDocument();

    // Click to close
    await user.click(closeButton);

    // Open menu button should be back
    expect(screen.getByRole('button', { name: 'Open menu' })).toBeInTheDocument();
  });

  it('should close mobile menu when clicking a navigation link', async () => {
    const user = userEvent.setup();
    render(<LandingNavbar />);

    // Open mobile menu
    const mobileMenuButton = screen.getByRole('button', { name: 'Open menu' });
    await user.click(mobileMenuButton);

    // Find the mobile features link (there are two: desktop and mobile)
    const mobileLinks = screen.getAllByText('Features');
    const mobileLink = mobileLinks[mobileLinks.length - 1]; // Last one is in mobile menu

    await user.click(mobileLink);

    // Mobile menu should close, so open menu button should reappear
    expect(screen.getByRole('button', { name: 'Open menu' })).toBeInTheDocument();
  });

  it('should render language selector', () => {
    render(<LandingNavbar />);

    const selectors = screen.getAllByTestId('language-selector');
    expect(selectors.length).toBeGreaterThanOrEqual(1);
  });
});
