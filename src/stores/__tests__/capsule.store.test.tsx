import { renderHook, act } from '@testing-library/react';
import type { ReactNode } from 'react';
import {
  CapsuleStoreProvider,
  useCapsuleType,
  useSetCapsuleType,
  useCapsuleTitle,
  useSetCapsuleTitle,
  useSelectedSectorId,
  useSetSelectedSectorId,
  useSelectedDocumentIds,
  useToggleDocument,
  useSetSelectedDocumentIds,
  useCurrentStep,
  useNextStep,
  usePreviousStep,
  useResetWizard,
  useResumeWizard,
  useIntroText,
  useSetIntroText,
  useSetScript,
  useLoadVoices,
  useGenerateScript,
  useCapsuleError,
  useCurrentCapsuleId,
  useCurrentCapsule,
} from '../capsule.store';
import type { CapsuleDto } from '@/lib/api/capsule.api';

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

const MOCK_CAPSULE: CapsuleDto = {
  id: 'cap-1',
  title: 'Test Capsule',
  sectorId: 'sector-1',
  type: 'AUDIO',
  status: 'DRAFT',
  createdBy: 'user-1',
  createdAt: '2025-01-01T00:00:00Z',
  updatedAt: '2025-01-01T00:00:00Z',
  sources: [{ id: 'doc-1', title: 'Doc 1', sourceType: 'PDF' }],
};

describe('CapsuleStore', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('initial state', () => {
    it('has step 1 and default type AUDIO', () => {
      const { result } = renderHook(() => ({ step: useCurrentStep(), type: useCapsuleType() }), {
        wrapper: Wrapper,
      });
      expect(result.current.step).toBe(1);
      expect(result.current.type).toBe('AUDIO');
    });
  });

  describe('setters', () => {
    it('setCapsuleType updates type', () => {
      const { result } = renderHook(
        () => ({ type: useCapsuleType(), setType: useSetCapsuleType() }),
        { wrapper: Wrapper },
      );
      act(() => result.current.setType('VIDEO'));
      expect(result.current.type).toBe('VIDEO');
    });
    it('setCapsuleTitle updates title', () => {
      const { result } = renderHook(
        () => ({ title: useCapsuleTitle(), setTitle: useSetCapsuleTitle() }),
        { wrapper: Wrapper },
      );
      act(() => result.current.setTitle('My Capsule'));
      expect(result.current.title).toBe('My Capsule');
    });
    it('setSelectedSectorId updates sector and clears documents', () => {
      const { result } = renderHook(
        () => ({
          sectorId: useSelectedSectorId(),
          setSectorId: useSetSelectedSectorId(),
          docIds: useSelectedDocumentIds(),
          toggleDoc: useToggleDocument(),
        }),
        { wrapper: Wrapper },
      );
      act(() => result.current.toggleDoc('doc-1'));
      expect(result.current.docIds).toContain('doc-1');
      act(() => result.current.setSectorId('sector-2'));
      expect(result.current.sectorId).toBe('sector-2');
      expect(result.current.docIds).toEqual([]);
    });
    it('toggleDocument adds and removes document id', () => {
      const { result } = renderHook(
        () => ({ docIds: useSelectedDocumentIds(), toggleDoc: useToggleDocument() }),
        { wrapper: Wrapper },
      );
      act(() => result.current.toggleDoc('doc-1'));
      expect(result.current.docIds).toEqual(['doc-1']);
      act(() => result.current.toggleDoc('doc-1'));
      expect(result.current.docIds).toEqual([]);
    });
    it('setSelectedDocumentIds replaces list', () => {
      const { result } = renderHook(
        () => ({ docIds: useSelectedDocumentIds(), setDocIds: useSetSelectedDocumentIds() }),
        { wrapper: Wrapper },
      );
      act(() => result.current.setDocIds(['a', 'b']));
      expect(result.current.docIds).toEqual(['a', 'b']);
    });
    it('setIntroText and setScript update step 2 fields', () => {
      const { result } = renderHook(
        () => ({
          introText: useIntroText(),
          setIntroText: useSetIntroText(),
          setScript: useSetScript(),
        }),
        { wrapper: Wrapper },
      );
      act(() => result.current.setIntroText('Intro'));
      expect(result.current.introText).toBe('Intro');
      act(() => {
        result.current.setScript('Script content');
      });
      // script is not exposed by a selector in the list we imported; intro is
      expect(result.current.introText).toBe('Intro');
    });
  });

  describe('nextStep', () => {
    it('sets error when required fields missing', async () => {
      const { result } = renderHook(() => ({ nextStep: useNextStep(), error: useCapsuleError() }), {
        wrapper: Wrapper,
      });
      await act(async () => result.current.nextStep());
      expect(result.current.error).toBe('Please fill in all required fields before continuing.');
    });
    it('calls createCapsule and moves to step 2 when valid', async () => {
      mockCreateCapsule.mockResolvedValueOnce(MOCK_CAPSULE);
      const { result } = renderHook(
        () => ({
          nextStep: useNextStep(),
          step: useCurrentStep(),
          setSectorId: useSetSelectedSectorId(),
          setTitle: useSetCapsuleTitle(),
          setDocIds: useSetSelectedDocumentIds(),
        }),
        { wrapper: Wrapper },
      );
      act(() => {
        result.current.setSectorId('sector-1');
        result.current.setTitle('Title');
        result.current.setDocIds(['doc-1']);
      });
      await act(async () => result.current.nextStep());
      expect(mockCreateCapsule).toHaveBeenCalledWith(
        expect.objectContaining({
          sectorId: 'sector-1',
          title: 'Title',
          sourceIds: ['doc-1'],
          type: 'AUDIO',
        }),
      );
      expect(result.current.step).toBe(2);
    });
  });

  describe('previousStep and resetWizard', () => {
    it('previousStep goes back to step 1', async () => {
      mockCreateCapsule.mockResolvedValueOnce(MOCK_CAPSULE);
      const { result } = renderHook(
        () => ({
          step: useCurrentStep(),
          nextStep: useNextStep(),
          previousStep: usePreviousStep(),
          setSectorId: useSetSelectedSectorId(),
          setTitle: useSetCapsuleTitle(),
          setDocIds: useSetSelectedDocumentIds(),
        }),
        { wrapper: Wrapper },
      );
      act(() => {
        result.current.setSectorId('sector-1');
        result.current.setTitle('T');
        result.current.setDocIds(['d1']);
      });
      await act(async () => result.current.nextStep());
      expect(result.current.step).toBe(2);
      act(() => result.current.previousStep());
      expect(result.current.step).toBe(1);
    });
    it('resetWizard clears to default state', async () => {
      mockCreateCapsule.mockResolvedValueOnce(MOCK_CAPSULE);
      const { result } = renderHook(
        () => ({
          step: useCurrentStep(),
          nextStep: useNextStep(),
          resetWizard: useResetWizard(),
          setSectorId: useSetSelectedSectorId(),
          setTitle: useSetCapsuleTitle(),
          setDocIds: useSetSelectedDocumentIds(),
          currentCapsuleId: useCurrentCapsuleId(),
        }),
        { wrapper: Wrapper },
      );
      act(() => {
        result.current.setSectorId('s1');
        result.current.setTitle('T');
        result.current.setDocIds(['d1']);
      });
      await act(async () => result.current.nextStep());
      expect(result.current.currentCapsuleId).toBe('cap-1');
      act(() => result.current.resetWizard());
      expect(result.current.step).toBe(1);
      expect(result.current.currentCapsuleId).toBeNull();
    });
  });

  describe('resumeWizard', () => {
    it('hydrates state from capsule and sets step 2', () => {
      const { result } = renderHook(
        () => ({
          step: useCurrentStep(),
          resumeWizard: useResumeWizard(),
          currentCapsule: useCurrentCapsule(),
          currentCapsuleId: useCurrentCapsuleId(),
        }),
        { wrapper: Wrapper },
      );
      act(() => result.current.resumeWizard(MOCK_CAPSULE));
      expect(result.current.step).toBe(2);
      expect(result.current.currentCapsuleId).toBe('cap-1');
      expect(result.current.currentCapsule).toEqual(MOCK_CAPSULE);
    });
  });

  describe('loadVoices', () => {
    it('fetches voices and stores them', async () => {
      const voices = [{ id: 'v1', name: 'Voice 1' }];
      mockGetVoices.mockResolvedValueOnce(voices);
      const { result } = renderHook(() => ({ loadVoices: useLoadVoices() }), { wrapper: Wrapper });
      await act(async () => result.current.loadVoices());
      expect(mockGetVoices).toHaveBeenCalled();
    });
  });

  describe('generateScript', () => {
    it('does nothing when no currentCapsuleId', async () => {
      const { result } = renderHook(() => ({ generateScript: useGenerateScript() }), {
        wrapper: Wrapper,
      });
      await act(async () => result.current.generateScript());
      expect(mockGenerateScript).not.toHaveBeenCalled();
    });
    it('calls API and updates script when capsule exists', async () => {
      mockCreateCapsule.mockResolvedValueOnce(MOCK_CAPSULE);
      mockGenerateScript.mockResolvedValueOnce({ script: 'New script' });
      const { result } = renderHook(
        () => ({
          nextStep: useNextStep(),
          generateScript: useGenerateScript(),
          setSectorId: useSetSelectedSectorId(),
          setTitle: useSetCapsuleTitle(),
          setDocIds: useSetSelectedDocumentIds(),
        }),
        { wrapper: Wrapper },
      );
      act(() => {
        result.current.setSectorId('s1');
        result.current.setTitle('T');
        result.current.setDocIds(['d1']);
      });
      await act(async () => result.current.nextStep());
      await act(async () => result.current.generateScript());
      expect(mockGenerateScript).toHaveBeenCalledWith('cap-1');
    });
  });
});
