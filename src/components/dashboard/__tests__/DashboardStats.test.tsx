import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DashboardStats } from '../DashboardStats';

// ── Mocks ────────────────────────────────────────────────────────────────────

const mockGetAdminStats = vi.fn();

vi.mock('@/lib/api/stats.api', () => ({
  statsApi: {
    getAdminStats: (...args: unknown[]) => mockGetAdminStats(...args),
  },
}));

vi.mock('@/lib/api/error-handler', () => ({
  logError: vi.fn(),
}));

// Controllable mock for useSession
const mockUseSession = vi.fn();
vi.mock('next-auth/react', () => ({
  useSession: () => mockUseSession(),
}));

// ── Helpers ──────────────────────────────────────────────────────────────────

function makeSession(roles: string[] = []) {
  return {
    data: {
      user: {
        id: 'test-user-id',
        name: 'Test User',
        email: 'test@example.com',
        image: null,
        roles,
      },
      accessToken: 'test-token',
      expires: new Date(Date.now() + 86400000).toISOString(),
    },
    status: 'authenticated',
  };
}

const ADMIN_STATS = {
  totalConversations: 42,
  totalUsers: 15,
  recentUsers: 3,
  totalDocuments: 56,
  totalSectors: 8,
  activeSectors: 6,
};

// ── Tests ────────────────────────────────────────────────────────────────────

describe('DashboardStats', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetAdminStats.mockResolvedValue(ADMIN_STATS);
    // Default: admin session
    mockUseSession.mockReturnValue(makeSession(['admin']));
  });

  // ── Admin view ────────────────────────────────────────────────────────────

  describe('Admin view', () => {
    it('should show loading skeletons initially', () => {
      // Delay resolution so loading state is visible
      mockGetAdminStats.mockReturnValue(new Promise(() => {}));

      render(<DashboardStats />);

      // Skeletons are rendered (4 skeleton cards)
      const cards = document.querySelectorAll('[class*="animate-pulse"], [data-slot="skeleton"]');
      expect(cards.length).toBeGreaterThan(0);
    });

    it('should display real stats after loading', async () => {
      render(<DashboardStats />);

      // Wait for stats to appear (mock useTranslations returns just the key)
      await waitFor(() => {
        expect(screen.getByText('stats.conversations.title')).toBeInTheDocument();
      });

      // Conversations count
      expect(screen.getByText('42')).toBeInTheDocument();

      // Documents count
      expect(screen.getByText('56')).toBeInTheDocument();

      // Users count
      expect(screen.getByText('15')).toBeInTheDocument();

      // Sectors count
      expect(screen.getByText('8')).toBeInTheDocument();
    });

    it('should show all 4 stat titles', async () => {
      render(<DashboardStats />);

      await waitFor(() => {
        expect(screen.getByText('stats.conversations.title')).toBeInTheDocument();
      });

      expect(screen.getByText('stats.documents.title')).toBeInTheDocument();
      expect(screen.getByText('stats.users.title')).toBeInTheDocument();
      expect(screen.getByText('stats.sectors.title')).toBeInTheDocument();
    });

    it('should show zeros on API error', async () => {
      mockGetAdminStats.mockRejectedValue(new Error('Unauthorized'));

      render(<DashboardStats />);

      await waitFor(() => {
        expect(screen.getByText('stats.conversations.title')).toBeInTheDocument();
      });

      // All values should be 0
      const zeros = screen.getAllByText('0');
      expect(zeros.length).toBeGreaterThanOrEqual(4);
    });

    it('should call getAdminStats on mount', async () => {
      render(<DashboardStats />);

      await waitFor(() => {
        expect(mockGetAdminStats).toHaveBeenCalledOnce();
      });
    });
  });

  // ── Non-admin welcome view ──────────────────────────────────────────────

  describe('Non-admin welcome view', () => {
    beforeEach(() => {
      mockUseSession.mockReturnValue(makeSession(['user']));
    });

    it('should NOT call getAdminStats for non-admin users', () => {
      render(<DashboardStats />);

      expect(mockGetAdminStats).not.toHaveBeenCalled();
    });

    it('should show welcome title for regular users', () => {
      render(<DashboardStats />);

      expect(screen.getByText('welcome.title')).toBeInTheDocument();
      expect(screen.getByText('welcome.subtitle')).toBeInTheDocument();
    });

    it('should show quick action links for chat and documents', () => {
      render(<DashboardStats />);

      // Chat CTA appears twice (heading + button link)
      const chatCtas = screen.getAllByText('welcome.chatCta');
      expect(chatCtas.length).toBeGreaterThanOrEqual(1);

      // Documents CTA
      const docsCtas = screen.getAllByText('welcome.documentsCta');
      expect(docsCtas.length).toBeGreaterThanOrEqual(1);
    });

    it('should show welcome view for manager users', () => {
      mockUseSession.mockReturnValue(makeSession(['manager']));

      render(<DashboardStats />);

      expect(screen.getByText('welcome.title')).toBeInTheDocument();
      expect(mockGetAdminStats).not.toHaveBeenCalled();
    });

    it('should show welcome view when no roles are present', () => {
      mockUseSession.mockReturnValue(makeSession([]));

      render(<DashboardStats />);

      expect(screen.getByText('welcome.title')).toBeInTheDocument();
    });
  });
});
