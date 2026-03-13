import { render, screen, waitFor } from '@testing-library/react';
import { CapsulePlayerView } from '../CapsulePlayerView';
import type { CapsuleDto } from '@/lib/api/capsule.api';

vi.mock('@/lib/api/capsule.api', () => ({
  capsuleApi: {
    getCapsule: vi.fn(),
    publishCapsule: vi.fn(),
    archiveCapsule: vi.fn(),
  },
}));

vi.mock('../CapsuleMediaPlayer', () => ({
  CapsuleMediaPlayer: ({ type }: { type: string }) => <div data-testid={`media-${type}`} />,
}));

vi.mock('@/components/capsules/shared/CapsuleStatusBadge', () => ({
  CapsuleStatusBadge: ({ status }: { status: string }) => <span>{status}</span>,
}));

vi.mock('@/components/capsules/shared/CapsuleTypeBadge', () => ({
  CapsuleTypeBadge: ({ type }: { type: string }) => <span>{type}</span>,
}));

vi.mock('@/components/capsules/shared/CapsuleLanguageBadge', () => ({
  CapsuleLanguageBadge: ({ language }: { language: string }) => <span>{language}</span>,
}));

vi.mock('@/components/capsules/list/DeleteCapsuleDialog', () => ({
  DeleteCapsuleDialog: () => null,
}));

vi.mock('@/lib/utils/format-duration', () => ({
  formatDuration: (s: number) => `${s}s`,
}));

vi.mock('@/lib/utils/format-date', () => ({
  formatDate: (d: string) => d,
}));

vi.mock('@/lib/utils/get-user-role', () => ({
  getUserRole: () => 'admin',
}));

vi.mock('@/constants/permissions', () => ({
  hasPermission: () => true,
  CAN_CREATE_CAPSULES: 'CAN_CREATE_CAPSULES',
  CAN_DELETE_CAPSULES: 'CAN_DELETE_CAPSULES',
}));

vi.mock('@/constants/capsule-status', () => ({
  RESUMABLE_STATUSES: new Set(['DRAFT', 'FAILED']),
  isPublishable: (s: string) => s === 'COMPLETED',
  isArchivable: (s: string) => s === 'ACTIVE' || s === 'COMPLETED',
}));

import { capsuleApi } from '@/lib/api/capsule.api';

const mockCapsule: CapsuleDto = {
  id: 'c1',
  title: 'My Capsule',
  status: 'ACTIVE',
  type: 'AUDIO',
  language: 'en',
  sectorName: 'HR',
  durationSeconds: 90,
  createdAt: '2026-01-15T00:00:00Z',
  audioUrl: 'https://audio.mp3',
  videoUrl: null,
  sectorId: 's1',
  script: '',
  introText: '',
} as CapsuleDto;

describe('CapsulePlayerView', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows loading state initially', () => {
    vi.mocked(capsuleApi.getCapsule).mockReturnValue(new Promise(() => {}));
    render(<CapsulePlayerView capsuleId="c1" />);
    expect(screen.getByText('Loading…')).toBeInTheDocument();
  });

  it('shows error when capsule load fails', async () => {
    vi.mocked(capsuleApi.getCapsule).mockRejectedValueOnce(new Error('Not found'));
    render(<CapsulePlayerView capsuleId="c1" />);
    await waitFor(() => {
      expect(screen.getByText('Not found')).toBeInTheDocument();
    });
  });

  it('renders capsule title after loading', async () => {
    vi.mocked(capsuleApi.getCapsule).mockResolvedValueOnce(mockCapsule);
    render(<CapsulePlayerView capsuleId="c1" />);
    await waitFor(() => {
      expect(screen.getByText('My Capsule')).toBeInTheDocument();
    });
  });

  it('renders audio media player when audioUrl is present', async () => {
    vi.mocked(capsuleApi.getCapsule).mockResolvedValueOnce(mockCapsule);
    render(<CapsulePlayerView capsuleId="c1" />);
    await waitFor(() => {
      expect(screen.getByTestId('media-audio')).toBeInTheDocument();
    });
  });

  it('renders video media player when videoUrl is present', async () => {
    vi.mocked(capsuleApi.getCapsule).mockResolvedValueOnce({
      ...mockCapsule,
      videoUrl: 'https://video.mp4',
    });
    render(<CapsulePlayerView capsuleId="c1" />);
    await waitFor(() => {
      expect(screen.getByTestId('media-video')).toBeInTheDocument();
    });
  });

  it('renders sector name in metadata', async () => {
    vi.mocked(capsuleApi.getCapsule).mockResolvedValueOnce(mockCapsule);
    render(<CapsulePlayerView capsuleId="c1" />);
    await waitFor(() => {
      expect(screen.getByText('HR')).toBeInTheDocument();
    });
  });

  it('renders duration in metadata', async () => {
    vi.mocked(capsuleApi.getCapsule).mockResolvedValueOnce(mockCapsule);
    render(<CapsulePlayerView capsuleId="c1" />);
    await waitFor(() => {
      expect(screen.getByText('90s')).toBeInTheDocument();
    });
  });
});
