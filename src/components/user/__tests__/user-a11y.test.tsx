/**
 * Accessibility (a11y) tests for User components
 *
 * Uses vitest-axe (axe-core) to validate WCAG 2.1 AA compliance.
 * Tests cover: LogoutButton, SectorSelector.
 */
import { render, screen } from '@/test/test-utils';
import { axe } from '@/test/a11y-setup';
import { LogoutButton } from '../LogoutButton';
import { SectorSelector } from '../SectorSelector';
import { SECTORS } from '@/constants/sectors';

// Mock useCurrentUser for SectorSelector
vi.mock('@/hooks/useCurrentUser', () => ({
  useCurrentUser: () => ({
    user: { id: 'user-1', name: 'Test', email: 'test@example.com' },
    userName: 'Test',
    userEmail: 'test@example.com',
    userPicture: '',
    currentSectorId: SECTORS[0].id,
    sectors: [
      { id: SECTORS[0].id, name: SECTORS[0].name },
      { id: SECTORS[1].id, name: SECTORS[1].name },
    ],
    isLoading: false,
  }),
}));

describe('User Components — Accessibility', () => {
  describe('LogoutButton', () => {
    it('should have no a11y violations with label', async () => {
      const { container } = render(<LogoutButton showLabel />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should have no a11y violations in icon-only mode', async () => {
      const { container } = render(<LogoutButton showLabel={false} />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('icon-only button should have aria-label', () => {
      render(<LogoutButton showLabel={false} />);
      expect(screen.getByRole('button', { name: 'Logout' })).toBeInTheDocument();
    });
  });

  describe('SectorSelector', () => {
    it('should have no a11y violations', async () => {
      const { container } = render(<SectorSelector />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('trigger button should be keyboard focusable', () => {
      render(<SectorSelector />);
      const trigger = screen.getByRole('button', { name: /human resources/i });
      expect(trigger).toBeEnabled();
      // Verify it can receive focus
      trigger.focus();
      expect(trigger).toHaveFocus();
    });
  });
});
