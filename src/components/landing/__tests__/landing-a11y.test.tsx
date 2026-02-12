/**
 * Accessibility (a11y) tests for Landing page components
 *
 * Uses vitest-axe (axe-core) to validate WCAG 2.1 AA compliance.
 * Tests cover: HeroSection, FeaturesSection, CTASection.
 */
import { render } from '@testing-library/react';
import { axe } from '@/test/a11y-setup';
import { HeroSection } from '../HeroSection';
import { FeaturesSection } from '../FeaturesSection';
import { CTASection } from '../CtaFooter';

describe('Landing Components — Accessibility', () => {
  describe('HeroSection', () => {
    it('should have no a11y violations', async () => {
      const { container } = render(<HeroSection />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should have a main heading (h1)', () => {
      const { container } = render(<HeroSection />);
      const h1 = container.querySelector('h1');
      expect(h1).toBeInTheDocument();
    });

    it('CTA links should be accessible', () => {
      const { container } = render(<HeroSection />);
      const links = container.querySelectorAll('a');
      links.forEach((link) => {
        // Each link should have visible text content
        expect(link.textContent?.trim().length).toBeGreaterThan(0);
      });
    });
  });

  describe('FeaturesSection', () => {
    it('should have no a11y violations', async () => {
      const { container } = render(<FeaturesSection />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should use semantic heading hierarchy', () => {
      const { container } = render(<FeaturesSection />);
      const h2 = container.querySelector('h2');
      expect(h2).toBeInTheDocument();
    });
  });

  describe('CTASection', () => {
    it('should have no a11y violations', async () => {
      const { container } = render(<CTASection />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('CTA button/link should have accessible text', () => {
      const { container } = render(<CTASection />);
      const links = container.querySelectorAll('a');
      links.forEach((link) => {
        expect(link.textContent?.trim().length).toBeGreaterThan(0);
      });
    });
  });
});
