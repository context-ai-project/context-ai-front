import { render, screen, waitFor } from '@testing-library/react';
import { CapsuleVideoPlayer } from '../CapsuleVideoPlayer';

vi.mock('@/lib/api/capsule.api', () => ({
  capsuleApi: {
    getDownloadUrl: vi.fn(),
  },
}));

import { capsuleApi } from '@/lib/api/capsule.api';

describe('CapsuleVideoPlayer', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows loading state', () => {
    vi.mocked(capsuleApi.getDownloadUrl).mockReturnValue(new Promise(() => {}));
    render(<CapsuleVideoPlayer capsuleId="c1" />);
    expect(screen.getByText('Loading video…')).toBeInTheDocument();
  });

  it('shows video element when URL loads', async () => {
    vi.mocked(capsuleApi.getDownloadUrl).mockResolvedValueOnce({
      url: 'https://video.mp4',
      expiresAt: '2026-12-31T23:59:59Z',
    });
    render(<CapsuleVideoPlayer capsuleId="c1" />);
    await waitFor(() => {
      expect(screen.getByText('playVideo')).toBeInTheDocument();
    });
  });

  it('shows error when URL fails', async () => {
    vi.mocked(capsuleApi.getDownloadUrl).mockRejectedValueOnce(new Error('fail'));
    render(<CapsuleVideoPlayer capsuleId="c1" />);
    await waitFor(() => {
      expect(screen.getByText('Video not available.')).toBeInTheDocument();
    });
  });
});
