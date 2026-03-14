/**
 * capsule.store — generateAudio, pollStatus and VIDEO-type coverage
 *
 * Kept in a separate file to avoid interfering with the
 * existing capsule.store.test.tsx which uses a shared store instance.
 */
import { renderHook, act } from '@testing-library/react';
import type { ReactNode } from 'react';
import {
  CapsuleStoreProvider,
  useCapsuleError,
  useCurrentCapsuleId,
  useGenerationStatus,
  useGenerationProgress,
  useIsGeneratingAudio,
  useIsGeneratingScript,
  useGenerateAudio,
  useGenerateScript,
  usePollStatus,
  useSetCapsuleType,
  useSetSelectedVoiceId,
  useSetScript,
  useNextStep,
  useSetSelectedSectorId,
  useSetCapsuleTitle,
  useSetSelectedDocumentIds,
  useCapsuleScript,
  useCurrentCapsule,
} from '../capsule.store';

// ── Mocks ─────────────────────────────────────────────────────────────────────

const mockCreateCapsule = vi.fn();
const mockGetVoices = vi.fn();
const mockGenerateScript = vi.fn();
const mockUpdateCapsule = vi.fn();
const mockGenerateAudio = vi.fn();
const mockGetCapsuleStatus = vi.fn();
const mockGetCapsule = vi.fn();

vi.mock('@/lib/api/capsule.api', () => ({
  capsuleApi: {
    createCapsule: (...args: unknown[]) => mockCreateCapsule(...args),
    getVoices: (...args: unknown[]) => mockGetVoices(...args),
    generateScript: (...args: unknown[]) => mockGenerateScript(...args),
    updateCapsule: (...args: unknown[]) => mockUpdateCapsule(...args),
    generateAudio: (...args: unknown[]) => mockGenerateAudio(...args),
    getCapsuleStatus: (...args: unknown[]) => mockGetCapsuleStatus(...args),
    getCapsule: (...args: unknown[]) => mockGetCapsule(...args),
  },
}));

function Wrapper({ children }: { children: ReactNode }) {
  return <CapsuleStoreProvider>{children}</CapsuleStoreProvider>;
}

const MOCK_CAPSULE = {
  id: 'cap-2',
  title: 'Video Test',
  sectorId: 'sector-1',
  type: 'VIDEO' as const,
  status: 'DRAFT' as const,
  createdBy: 'user-1',
  createdAt: '2025-01-01T00:00:00Z',
  updatedAt: '2025-01-01T00:00:00Z',
  sources: [{ id: 'doc-1', title: 'Doc 1', sourceType: 'PDF' }],
};

// ── Helper: navigate to step 2 ────────────────────────────────────────────────

async function goToStep2(result: ReturnType<typeof renderHook>['result'], isVideo = false) {
  if (isVideo) {
    act(() => (result.current as { setType: (t: string) => void }).setType('VIDEO'));
  }
  act(() => {
    (result.current as { setSectorId: (s: string) => void }).setSectorId('sector-1');
    (result.current as { setTitle: (t: string) => void }).setTitle('Title');
    (result.current as { setDocIds: (d: string[]) => void }).setDocIds(['doc-1']);
  });
  await act(async () => (result.current as { nextStep: () => Promise<void> }).nextStep());
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('CapsuleStore — generateAudio', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Silence repeated polling calls in tests that don't care about it
    mockGetCapsuleStatus.mockResolvedValue({ status: 'GENERATING_ASSETS' });
  });

  it('sets error when no voice selected', async () => {
    const { result } = renderHook(
      () => ({
        generateAudio: useGenerateAudio(),
        error: useCapsuleError(),
      }),
      { wrapper: Wrapper },
    );

    await act(async () => result.current.generateAudio());

    expect(result.current.error).toMatch(/script and voice/i);
  });

  it('sets error when script is empty', async () => {
    mockCreateCapsule.mockResolvedValueOnce({ ...MOCK_CAPSULE, type: 'AUDIO' });

    const { result } = renderHook(
      () => ({
        nextStep: useNextStep(),
        setSectorId: useSetSelectedSectorId(),
        setTitle: useSetCapsuleTitle(),
        setDocIds: useSetSelectedDocumentIds(),
        setVoice: useSetSelectedVoiceId(),
        generateAudio: useGenerateAudio(),
        error: useCapsuleError(),
      }),
      { wrapper: Wrapper },
    );

    await goToStep2(result);
    // voice is set but script remains ''
    act(() => result.current.setVoice('voice-1'));
    await act(async () => result.current.generateAudio());

    expect(result.current.error).toMatch(/script and voice/i);
  });

  it('calls updateCapsule and generateAudio API when valid', async () => {
    mockCreateCapsule.mockResolvedValueOnce({ ...MOCK_CAPSULE, type: 'AUDIO' });
    mockUpdateCapsule.mockResolvedValueOnce({});
    mockGenerateAudio.mockResolvedValueOnce(undefined);
    // Let polling call settle without progressing the state
    mockGetCapsuleStatus.mockResolvedValue({ status: 'GENERATING_ASSETS' });

    const { result } = renderHook(
      () => ({
        nextStep: useNextStep(),
        setSectorId: useSetSelectedSectorId(),
        setTitle: useSetCapsuleTitle(),
        setDocIds: useSetSelectedDocumentIds(),
        setVoice: useSetSelectedVoiceId(),
        setScript: useSetScript(),
        generateAudio: useGenerateAudio(),
        isGenerating: useIsGeneratingAudio(),
        status: useGenerationStatus(),
        capsuleId: useCurrentCapsuleId(),
      }),
      { wrapper: Wrapper },
    );

    await goToStep2(result);
    act(() => {
      result.current.setVoice('voice-1');
      result.current.setScript('My script text here');
    });

    await act(async () => result.current.generateAudio());

    expect(mockUpdateCapsule).toHaveBeenCalledWith('cap-2', { audioVoiceId: 'voice-1' });
    expect(mockGenerateAudio).toHaveBeenCalledWith('cap-2', 'voice-1', 'My script text here');
  });

  it('sets FAILED status and error when API throws', async () => {
    mockCreateCapsule.mockResolvedValueOnce({ ...MOCK_CAPSULE, type: 'AUDIO' });
    mockUpdateCapsule.mockResolvedValueOnce({});
    mockGenerateAudio.mockRejectedValueOnce(new Error('ElevenLabs unavailable'));

    const { result } = renderHook(
      () => ({
        nextStep: useNextStep(),
        setSectorId: useSetSelectedSectorId(),
        setTitle: useSetCapsuleTitle(),
        setDocIds: useSetSelectedDocumentIds(),
        setVoice: useSetSelectedVoiceId(),
        setScript: useSetScript(),
        generateAudio: useGenerateAudio(),
        error: useCapsuleError(),
        status: useGenerationStatus(),
      }),
      { wrapper: Wrapper },
    );

    await goToStep2(result);
    act(() => {
      result.current.setVoice('voice-1');
      result.current.setScript('Script text');
    });

    await act(async () => result.current.generateAudio());

    expect(result.current.error).toBe('ElevenLabs unavailable');
    expect(result.current.status).toBe('FAILED');
  });
});

describe('CapsuleStore — generateScript with language', () => {
  beforeEach(() => vi.clearAllMocks());

  it('passes language to the API', async () => {
    mockCreateCapsule.mockResolvedValueOnce({ ...MOCK_CAPSULE, type: 'AUDIO' });
    mockGenerateScript.mockResolvedValueOnce({ script: 'Generated script ES' });

    const { result } = renderHook(
      () => ({
        nextStep: useNextStep(),
        setSectorId: useSetSelectedSectorId(),
        setTitle: useSetCapsuleTitle(),
        setDocIds: useSetSelectedDocumentIds(),
        generateScript: useGenerateScript(),
        script: useCapsuleScript(),
        isGenerating: useIsGeneratingScript(),
      }),
      { wrapper: Wrapper },
    );

    await goToStep2(result);
    await act(async () => result.current.generateScript('es-ES'));

    expect(mockGenerateScript).toHaveBeenCalledWith('cap-2', 'es-ES');
    expect(result.current.script).toBe('Generated script ES');
    expect(result.current.isGenerating).toBe(false);
  });

  it('sets error and clears loading on API failure', async () => {
    mockCreateCapsule.mockResolvedValueOnce({ ...MOCK_CAPSULE, type: 'AUDIO' });
    mockGenerateScript.mockRejectedValueOnce(new Error('LLM error'));

    const { result } = renderHook(
      () => ({
        nextStep: useNextStep(),
        setSectorId: useSetSelectedSectorId(),
        setTitle: useSetCapsuleTitle(),
        setDocIds: useSetSelectedDocumentIds(),
        generateScript: useGenerateScript(),
        error: useCapsuleError(),
        isGenerating: useIsGeneratingScript(),
      }),
      { wrapper: Wrapper },
    );

    await goToStep2(result);
    await act(async () => result.current.generateScript('en'));

    expect(result.current.error).toBe('LLM error');
    expect(result.current.isGenerating).toBe(false);
  });
});

describe('CapsuleStore — VIDEO type flow', () => {
  beforeEach(() => vi.clearAllMocks());

  it('creates capsule with VIDEO type and advances to step 2', async () => {
    mockCreateCapsule.mockResolvedValueOnce(MOCK_CAPSULE);

    const { result } = renderHook(
      () => ({
        nextStep: useNextStep(),
        setType: useSetCapsuleType(),
        setSectorId: useSetSelectedSectorId(),
        setTitle: useSetCapsuleTitle(),
        setDocIds: useSetSelectedDocumentIds(),
        capsuleId: useCurrentCapsuleId(),
      }),
      { wrapper: Wrapper },
    );

    act(() => result.current.setType('VIDEO'));
    await goToStep2(result, false);

    expect(mockCreateCapsule).toHaveBeenCalledWith(expect.objectContaining({ type: 'VIDEO' }));
    expect(result.current.capsuleId).toBe('cap-2');
  });
});

describe('CapsuleStore — pollStatus', () => {
  beforeEach(() => vi.clearAllMocks());

  it('does nothing when no currentCapsuleId', async () => {
    const { result } = renderHook(() => ({ pollStatus: usePollStatus() }), {
      wrapper: Wrapper,
    });

    await act(async () => result.current.pollStatus());

    expect(mockGetCapsuleStatus).not.toHaveBeenCalled();
  });

  it('updates generationStatus from API response', async () => {
    mockCreateCapsule.mockResolvedValueOnce({ ...MOCK_CAPSULE, type: 'AUDIO' });
    mockGetCapsuleStatus.mockResolvedValueOnce({ status: 'RENDERING' });

    const { result } = renderHook(
      () => ({
        nextStep: useNextStep(),
        setSectorId: useSetSelectedSectorId(),
        setTitle: useSetCapsuleTitle(),
        setDocIds: useSetSelectedDocumentIds(),
        pollStatus: usePollStatus(),
        status: useGenerationStatus(),
      }),
      { wrapper: Wrapper },
    );

    await goToStep2(result);
    await act(async () => result.current.pollStatus());

    expect(mockGetCapsuleStatus).toHaveBeenCalledWith('cap-2');
    expect(result.current.status).toBe('RENDERING');
  });

  it('fetches full capsule and sets it when status is COMPLETED', async () => {
    mockCreateCapsule.mockResolvedValueOnce({ ...MOCK_CAPSULE, type: 'AUDIO' });
    mockGetCapsuleStatus.mockResolvedValueOnce({ status: 'COMPLETED' });
    mockGetCapsule.mockResolvedValueOnce({
      ...MOCK_CAPSULE,
      status: 'COMPLETED',
      audioUrl: 'capsules/cap-2/audio.mp3',
    });

    const { result } = renderHook(
      () => ({
        nextStep: useNextStep(),
        setSectorId: useSetSelectedSectorId(),
        setTitle: useSetCapsuleTitle(),
        setDocIds: useSetSelectedDocumentIds(),
        pollStatus: usePollStatus(),
        currentCapsule: useCurrentCapsule(),
        isGenerating: useIsGeneratingAudio(),
      }),
      { wrapper: Wrapper },
    );

    await goToStep2(result);
    await act(async () => result.current.pollStatus());

    expect(mockGetCapsule).toHaveBeenCalledWith('cap-2');
    expect(result.current.currentCapsule).toMatchObject({ audioUrl: 'capsules/cap-2/audio.mp3' });
    expect(result.current.isGenerating).toBe(false);
  });

  it('sets error when status is FAILED', async () => {
    mockCreateCapsule.mockResolvedValueOnce({ ...MOCK_CAPSULE, type: 'AUDIO' });
    mockGetCapsuleStatus.mockResolvedValueOnce({
      status: 'FAILED',
      errorMessage: 'Shotstack render error',
    });

    const { result } = renderHook(
      () => ({
        nextStep: useNextStep(),
        setSectorId: useSetSelectedSectorId(),
        setTitle: useSetCapsuleTitle(),
        setDocIds: useSetSelectedDocumentIds(),
        pollStatus: usePollStatus(),
        error: useCapsuleError(),
        isGenerating: useIsGeneratingAudio(),
      }),
      { wrapper: Wrapper },
    );

    await goToStep2(result);
    await act(async () => result.current.pollStatus());

    expect(result.current.error).toBe('Shotstack render error');
    expect(result.current.isGenerating).toBe(false);
  });

  it('leaves progress unchanged when pollStatus response has no progress field', async () => {
    mockCreateCapsule.mockResolvedValueOnce({ ...MOCK_CAPSULE, type: 'AUDIO' });
    // Response without a progress field — pollStatus only syncs generationStatus
    mockGetCapsuleStatus.mockResolvedValueOnce({ status: 'GENERATING_ASSETS' });

    const { result } = renderHook(
      () => ({
        nextStep: useNextStep(),
        setSectorId: useSetSelectedSectorId(),
        setTitle: useSetCapsuleTitle(),
        setDocIds: useSetSelectedDocumentIds(),
        pollStatus: usePollStatus(),
        progress: useGenerationProgress(),
        status: useGenerationStatus(),
      }),
      { wrapper: Wrapper },
    );

    await goToStep2(result);
    await act(async () => result.current.pollStatus());

    // generationStatus is updated; progress stays at initial 0
    expect(result.current.status).toBe('GENERATING_ASSETS');
    expect(result.current.progress).toBe(0);
  });
});
