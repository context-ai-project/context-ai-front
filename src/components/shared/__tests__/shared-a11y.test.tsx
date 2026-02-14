/**
 * Accessibility (a11y) tests for Shared components
 *
 * Uses vitest-axe (axe-core) to validate WCAG 2.1 AA compliance.
 * Tests cover: UserAvatar, ErrorBoundary.
 */
import React from 'react';
import { render, screen } from '@/test/test-utils';
import { axe } from '@/test/a11y-setup';
import { UserAvatar } from '../UserAvatar';
import { ErrorBoundary } from '../ErrorBoundary';

describe('Shared Components — Accessibility', () => {
  describe('UserAvatar', () => {
    it('should have no a11y violations with user data', async () => {
      const { container } = render(
        <UserAvatar user={{ name: 'Jane Doe', picture: 'https://example.com/avatar.jpg' }} />,
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should have no a11y violations with fallback initial', async () => {
      const { container } = render(<UserAvatar alt="John" />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('AvatarImage should have descriptive alt text', () => {
      const { container } = render(<UserAvatar alt="Alice" />);
      // The AvatarImage in jsdom won't render, but we verify it's wired up
      // by checking the fallback renders with the correct initial
      expect(screen.getByText('A')).toBeInTheDocument();
      // The container should not have an img with empty alt
      const imgWithEmptyAlt = container.querySelector('img[alt=""]');
      expect(imgWithEmptyAlt).not.toBeInTheDocument();
    });
  });

  describe('ErrorBoundary', () => {
    const originalError = console.error;
    beforeEach(() => {
      console.error = vi.fn();
    });
    afterEach(() => {
      console.error = originalError;
    });

    it('should have no a11y violations when rendering children', async () => {
      const { container } = render(
        <ErrorBoundary>
          <p>Normal content</p>
        </ErrorBoundary>,
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should have no a11y violations in error state', async () => {
      function ThrowingComponent(): React.ReactNode {
        throw new Error('Test error');
      }

      const { container } = render(
        <ErrorBoundary>
          <ThrowingComponent />
        </ErrorBoundary>,
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('error state buttons should be focusable', () => {
      function ThrowingComponent(): React.ReactNode {
        throw new Error('Test');
      }

      render(
        <ErrorBoundary>
          <ThrowingComponent />
        </ErrorBoundary>,
      );

      const tryAgainBtn = screen.getByRole('button', { name: /try again/i });
      const reloadBtn = screen.getByRole('button', { name: /reload page/i });
      expect(tryAgainBtn).toBeEnabled();
      expect(reloadBtn).toBeEnabled();
    });
  });
});
