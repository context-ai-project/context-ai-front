import { render, screen } from '@testing-library/react';
import { CapsuleCard } from '../CapsuleCard';
import type { CapsuleDto } from '@/lib/api/capsule.api';

vi.mock('@/components/capsules/shared/CapsuleStatusBadge', () => ({
  CapsuleStatusBadge: ({ status }: { status: string }) => (
    <span data-testid="status">{status}</span>
  ),
}));

vi.mock('@/components/capsules/shared/CapsuleTypeBadge', () => ({
  CapsuleTypeBadge: ({ type }: { type: string }) => <span data-testid="type">{type}</span>,
}));

vi.mock('@/components/capsules/shared/CapsuleLanguageBadge', () => ({
  CapsuleLanguageBadge: ({ language }: { language: string }) => (
    <span data-testid="lang">{language}</span>
  ),
}));

vi.mock('@/lib/utils/format-duration', () => ({
  formatDuration: (s: number) => `${s}s`,
}));

vi.mock('@/lib/utils/format-date', () => ({
  formatDate: (d: string) => d,
}));

vi.mock('@/constants/capsule-status', () => ({
  RESUMABLE_STATUSES: new Set(['DRAFT', 'FAILED']),
}));

const baseCapsule: CapsuleDto = {
  id: 'c1',
  title: 'Test Capsule',
  status: 'ACTIVE',
  type: 'AUDIO',
  language: 'en',
  sectorName: 'HR',
  durationSeconds: 120,
  createdAt: '2026-01-01T00:00:00Z',
  audioUrl: 'https://audio.mp3',
  videoUrl: null,
  sectorId: 's1',
  script: '',
  introText: '',
} as CapsuleDto;

describe('CapsuleCard', () => {
  it('renders capsule title', () => {
    render(<CapsuleCard capsule={baseCapsule} />);
    expect(screen.getByText('Test Capsule')).toBeInTheDocument();
  });

  it('renders status badge', () => {
    render(<CapsuleCard capsule={baseCapsule} />);
    expect(screen.getByTestId('status')).toHaveTextContent('ACTIVE');
  });

  it('renders type badge', () => {
    render(<CapsuleCard capsule={baseCapsule} />);
    expect(screen.getByTestId('type')).toHaveTextContent('AUDIO');
  });

  it('renders language badge when language is present', () => {
    render(<CapsuleCard capsule={baseCapsule} />);
    expect(screen.getByTestId('lang')).toHaveTextContent('en');
  });

  it('renders sector name', () => {
    render(<CapsuleCard capsule={baseCapsule} />);
    expect(screen.getByText('HR')).toBeInTheDocument();
  });

  it('renders formatted duration', () => {
    render(<CapsuleCard capsule={baseCapsule} />);
    expect(screen.getByText('120s')).toBeInTheDocument();
  });

  it('renders formatted date', () => {
    render(<CapsuleCard capsule={baseCapsule} />);
    expect(screen.getByText('2026-01-01T00:00:00Z')).toBeInTheDocument();
  });

  it('does not show language badge when language is missing', () => {
    const capsule = { ...baseCapsule, language: undefined } as unknown as CapsuleDto;
    render(<CapsuleCard capsule={capsule} />);
    expect(screen.queryByTestId('lang')).not.toBeInTheDocument();
  });
});
