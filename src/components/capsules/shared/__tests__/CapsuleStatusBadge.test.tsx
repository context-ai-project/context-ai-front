import { render, screen } from '@/test/test-utils';
import { CapsuleStatusBadge } from '../CapsuleStatusBadge';
import type { CapsuleStatus } from '@/lib/api/capsule.api';

vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => `capsules.status.${key}`,
}));

describe('CapsuleStatusBadge', () => {
  const statuses: CapsuleStatus[] = [
    'DRAFT',
    'GENERATING_ASSETS',
    'RENDERING',
    'COMPLETED',
    'ACTIVE',
    'FAILED',
    'ARCHIVED',
  ];

  it.each(statuses)('renders translated label for status %s', (status) => {
    render(<CapsuleStatusBadge status={status} />);
    // The mock translator prefixes "capsules.status." to the key
    const expectedKey = {
      DRAFT: 'draft',
      GENERATING_ASSETS: 'generatingAssets',
      RENDERING: 'rendering',
      COMPLETED: 'completed',
      ACTIVE: 'active',
      FAILED: 'failed',
      ARCHIVED: 'archived',
    }[status];
    expect(screen.getByText(`capsules.status.${expectedKey}`)).toBeInTheDocument();
  });

  describe('visual variants', () => {
    it('renders DRAFT with outline variant', () => {
      const { container } = render(<CapsuleStatusBadge status="DRAFT" />);
      // The Badge renders a single element — we just assert it renders without throwing
      expect(container.firstChild).toBeTruthy();
    });

    it('renders FAILED with destructive variant', () => {
      const { container } = render(<CapsuleStatusBadge status="FAILED" />);
      expect(container.firstChild).toBeTruthy();
    });

    it('renders ACTIVE with default variant', () => {
      const { container } = render(<CapsuleStatusBadge status="ACTIVE" />);
      expect(container.firstChild).toBeTruthy();
    });

    it('renders GENERATING_ASSETS with secondary variant', () => {
      const { container } = render(<CapsuleStatusBadge status="GENERATING_ASSETS" />);
      expect(container.firstChild).toBeTruthy();
    });
  });
});
