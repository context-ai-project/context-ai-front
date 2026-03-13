import { render, screen, waitFor } from '@testing-library/react';
import { CapsulePreviewPanel } from '../CapsulePreviewPanel';

vi.mock('@/lib/api/capsule.api', () => ({
  capsuleApi: {
    getDownloadUrl: vi.fn().mockResolvedValue({
      url: 'https://signed-url.com/audio.mp3',
      expiresAt: '2026-12-31T23:59:59Z',
    }),
  },
}));

vi.mock('@/components/capsules/step2/CapsuleGenerationProgress', () => ({
  CapsuleGenerationProgress: ({ status }: { status: string }) => (
    <div data-testid="generation-progress">{status}</div>
  ),
}));

let mockStore = {
  currentCapsule: null as Record<string, unknown> | null,
  generationStatus: null as string | null,
  isGeneratingAudio: false,
  script: '',
  error: null as string | null,
};

vi.mock('@/stores/capsule.store', () => ({
  useCurrentCapsule: () => mockStore.currentCapsule,
  useGenerationStatus: () => mockStore.generationStatus,
  useIsGeneratingAudio: () => mockStore.isGeneratingAudio,
  useCapsuleScript: () => mockStore.script,
  useCapsuleError: () => mockStore.error,
  useGenerateAudio: () => vi.fn(),
}));

vi.mock('@/lib/utils/format-duration', () => ({
  formatDuration: (s: number) => `${s}s`,
}));

import { capsuleApi } from '@/lib/api/capsule.api';

describe('CapsulePreviewPanel', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockStore = {
      currentCapsule: null,
      generationStatus: null,
      isGeneratingAudio: false,
      script: '',
      error: null,
    };
  });

  it('shows generation progress when isGeneratingAudio', () => {
    mockStore.isGeneratingAudio = true;
    mockStore.generationStatus = 'GENERATING_ASSETS';
    render(<CapsulePreviewPanel />);
    expect(screen.getByTestId('generation-progress')).toBeInTheDocument();
  });

  it('shows generation progress when status is RENDERING', () => {
    mockStore.generationStatus = 'RENDERING';
    render(<CapsulePreviewPanel />);
    expect(screen.getByTestId('generation-progress')).toBeInTheDocument();
  });

  it('shows error state with retry button', () => {
    mockStore.error = 'Something went wrong';
    render(<CapsulePreviewPanel />);
    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    expect(screen.getByText('retry')).toBeInTheDocument();
  });

  it('shows video ready when video capsule has videoUrl', async () => {
    vi.mocked(capsuleApi.getDownloadUrl).mockResolvedValue({
      url: 'https://video.mp4',
      expiresAt: '2026-12-31T23:59:59Z',
    });
    mockStore.currentCapsule = {
      id: 'c1',
      type: 'VIDEO',
      videoUrl: 'https://video.mp4',
      audioUrl: null,
      durationSeconds: 120,
    };
    render(<CapsulePreviewPanel />);
    await waitFor(() => {
      expect(screen.getByText('videoReady')).toBeInTheDocument();
    });
  });

  it('shows audio ready when audio capsule has audioUrl', async () => {
    vi.mocked(capsuleApi.getDownloadUrl).mockResolvedValue({
      url: 'https://audio.mp3',
      expiresAt: '2026-12-31T23:59:59Z',
    });
    mockStore.currentCapsule = {
      id: 'c2',
      type: 'AUDIO',
      audioUrl: 'https://audio.mp3',
      videoUrl: null,
      durationSeconds: 60,
    };
    render(<CapsulePreviewPanel />);
    await waitFor(() => {
      expect(screen.getByText('audioReady')).toBeInTheDocument();
    });
  });

  it('shows duration when available', async () => {
    vi.mocked(capsuleApi.getDownloadUrl).mockResolvedValue({
      url: 'https://audio.mp3',
      expiresAt: '2026-12-31T23:59:59Z',
    });
    mockStore.currentCapsule = {
      id: 'c2',
      type: 'AUDIO',
      audioUrl: 'https://audio.mp3',
      videoUrl: null,
      durationSeconds: 60,
    };
    render(<CapsulePreviewPanel />);
    await waitFor(() => {
      expect(screen.getByText(/60s/)).toBeInTheDocument();
    });
  });

  it('shows placeholder when script is empty and no audio', () => {
    render(<CapsulePreviewPanel />);
    expect(screen.getByText('previewPlaceholder')).toBeInTheDocument();
  });

  it('shows voice prompt when script has content but no audio', () => {
    mockStore.script = 'Some script content';
    render(<CapsulePreviewPanel />);
    expect(screen.getByText(/Select a voice/)).toBeInTheDocument();
  });

  it('shows error loading preview when URL fetch fails for audio', async () => {
    vi.mocked(capsuleApi.getDownloadUrl).mockRejectedValue(new Error('fail'));
    mockStore.currentCapsule = {
      id: 'c2',
      type: 'AUDIO',
      audioUrl: 'https://audio.mp3',
      videoUrl: null,
      durationSeconds: null,
    };
    render(<CapsulePreviewPanel />);
    await waitFor(() => {
      expect(screen.getByText(/Could not load audio/)).toBeInTheDocument();
    });
  });

  it('shows error loading preview when URL fetch fails for video', async () => {
    vi.mocked(capsuleApi.getDownloadUrl).mockRejectedValue(new Error('fail'));
    mockStore.currentCapsule = {
      id: 'c1',
      type: 'VIDEO',
      videoUrl: 'https://video.mp4',
      audioUrl: null,
      durationSeconds: null,
    };
    render(<CapsulePreviewPanel />);
    await waitFor(() => {
      expect(screen.getByText(/Could not load video/)).toBeInTheDocument();
    });
  });
});
