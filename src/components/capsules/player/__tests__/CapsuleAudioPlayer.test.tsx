import { render, screen, waitFor } from '@testing-library/react';
import { CapsuleAudioPlayer } from '../CapsuleAudioPlayer';

vi.mock('@/lib/api/capsule.api', () => ({
  capsuleApi: {
    getDownloadUrl: vi.fn(),
  },
}));

import { capsuleApi } from '@/lib/api/capsule.api';

describe('CapsuleAudioPlayer', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows loading state', () => {
    vi.mocked(capsuleApi.getDownloadUrl).mockReturnValue(new Promise(() => {}));
    render(<CapsuleAudioPlayer capsuleId="c1" />);
    expect(screen.getByText('Loading audio…')).toBeInTheDocument();
  });

  it('shows audio element when URL loads', async () => {
    vi.mocked(capsuleApi.getDownloadUrl).mockResolvedValueOnce({
      url: 'https://audio.mp3',
      expiresAt: '2026-12-31T23:59:59Z',
    });
    render(<CapsuleAudioPlayer capsuleId="c1" />);
    await waitFor(() => {
      expect(screen.getByText('playAudio')).toBeInTheDocument();
    });
  });

  it('shows error when URL fails', async () => {
    vi.mocked(capsuleApi.getDownloadUrl).mockRejectedValueOnce(new Error('fail'));
    render(<CapsuleAudioPlayer capsuleId="c1" />);
    await waitFor(() => {
      expect(screen.getByText('Audio not available.')).toBeInTheDocument();
    });
  });
});
