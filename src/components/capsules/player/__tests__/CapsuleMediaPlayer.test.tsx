import { render, screen, waitFor } from '@testing-library/react';
import { CapsuleMediaPlayer } from '../CapsuleMediaPlayer';

vi.mock('@/lib/api/capsule.api', () => ({
  capsuleApi: {
    getDownloadUrl: vi.fn(),
  },
}));

import { capsuleApi } from '@/lib/api/capsule.api';

describe('CapsuleMediaPlayer', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows loading state initially', () => {
    vi.mocked(capsuleApi.getDownloadUrl).mockReturnValue(new Promise(() => {}));
    render(<CapsuleMediaPlayer capsuleId="c1" type="audio" />);
    expect(screen.getByText('Loading audio…')).toBeInTheDocument();
  });

  it('shows audio player when URL is loaded', async () => {
    vi.mocked(capsuleApi.getDownloadUrl).mockResolvedValueOnce({ url: 'https://audio.mp3' });
    render(<CapsuleMediaPlayer capsuleId="c1" type="audio" />);
    await waitFor(() => {
      expect(screen.getByText('playAudio')).toBeInTheDocument();
    });
  });

  it('shows video player when type is video', async () => {
    vi.mocked(capsuleApi.getDownloadUrl).mockResolvedValueOnce({ url: 'https://video.mp4' });
    render(<CapsuleMediaPlayer capsuleId="c1" type="video" />);
    await waitFor(() => {
      expect(screen.getByText('playVideo')).toBeInTheDocument();
    });
  });

  it('shows unavailable message when URL fetch fails', async () => {
    vi.mocked(capsuleApi.getDownloadUrl).mockRejectedValueOnce(new Error('fail'));
    render(<CapsuleMediaPlayer capsuleId="c1" type="audio" />);
    await waitFor(() => {
      expect(screen.getByText('Audio not available.')).toBeInTheDocument();
    });
  });

  it('shows unavailable message for video when fetch fails', async () => {
    vi.mocked(capsuleApi.getDownloadUrl).mockRejectedValueOnce(new Error('fail'));
    render(<CapsuleMediaPlayer capsuleId="c1" type="video" />);
    await waitFor(() => {
      expect(screen.getByText('Video not available.')).toBeInTheDocument();
    });
  });

  it('renders download button', async () => {
    vi.mocked(capsuleApi.getDownloadUrl).mockResolvedValueOnce({ url: 'https://audio.mp3' });
    render(<CapsuleMediaPlayer capsuleId="c1" type="audio" />);
    await waitFor(() => {
      expect(screen.getByText('download')).toBeInTheDocument();
    });
  });
});
