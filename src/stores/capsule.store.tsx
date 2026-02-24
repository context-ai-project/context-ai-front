'use client';

import { createContext, useContext, useState, type ReactNode } from 'react';
import { createStore, useStore } from 'zustand';
import {
  capsuleApi,
  type CapsuleDto,
  type CapsuleStatus,
  type CapsuleType,
  type VoiceInfoDto,
} from '@/lib/api/capsule.api';

// ── Polling interval ──────────────────────────────────────────────────────

/** How often (ms) to poll the status endpoint while generation is running */
const POLL_INTERVAL_MS = 3_000;

// ── Store types ───────────────────────────────────────────────────────────

interface CapsuleWizardState {
  // ── Step 1 fields ────────────────────────────────────────────────────
  capsuleType: CapsuleType;
  selectedSectorId: string | null;
  capsuleTitle: string;
  selectedDocumentIds: string[];

  // ── Step 2 fields ────────────────────────────────────────────────────
  introText: string;
  script: string;
  selectedVoiceId: string | null;
  voices: VoiceInfoDto[];

  // ── Wizard navigation ────────────────────────────────────────────────
  currentStep: 1 | 2;

  // ── Async / generation state ─────────────────────────────────────────
  currentCapsuleId: string | null;
  currentCapsule: CapsuleDto | null;
  generationStatus: CapsuleStatus | null;
  /** Real generation progress 0-100 reported by the backend per chunk */
  generationProgress: number;
  isCreating: boolean;
  isGeneratingScript: boolean;
  isGeneratingAudio: boolean;
  isLoadingVoices: boolean;
  error: string | null;
}

interface CapsuleWizardActions {
  // ── Step 1 setters ───────────────────────────────────────────────────
  setCapsuleType: (type: CapsuleType) => void;
  setSelectedSectorId: (id: string | null) => void;
  setCapsuleTitle: (title: string) => void;
  toggleDocument: (id: string) => void;
  setSelectedDocumentIds: (ids: string[]) => void;

  // ── Step 2 setters ───────────────────────────────────────────────────
  setIntroText: (text: string) => void;
  setScript: (script: string) => void;
  setSelectedVoiceId: (id: string | null) => void;

  // ── Navigation ───────────────────────────────────────────────────────
  /** Advance to step 2 — also calls createCapsule on the backend */
  nextStep: () => Promise<void>;
  previousStep: () => void;
  resetWizard: () => void;
  /**
   * Hydrate the wizard from an existing DRAFT/FAILED capsule and jump to Step 2.
   * Used by the "Resume" flow: no new capsule is created on the backend.
   */
  resumeWizard: (capsule: CapsuleDto) => void;

  // ── Async actions ────────────────────────────────────────────────────
  /** Fetch available ElevenLabs voices */
  loadVoices: () => Promise<void>;
  /** Generate narration script via Gemini RAG */
  generateScript: () => Promise<void>;
  /** Trigger ElevenLabs audio pipeline and start polling */
  generateAudio: () => Promise<void>;
  /** Poll the generation status endpoint once */
  pollStatus: () => Promise<void>;
}

type CapsuleStoreState = CapsuleWizardState & CapsuleWizardActions;

// ── Default wizard state ──────────────────────────────────────────────────

const DEFAULT_WIZARD_STATE: CapsuleWizardState = {
  capsuleType: 'AUDIO',
  selectedSectorId: null,
  capsuleTitle: '',
  selectedDocumentIds: [],
  introText: '',
  script: '',
  selectedVoiceId: null,
  voices: [],
  currentStep: 1,
  currentCapsuleId: null,
  currentCapsule: null,
  generationStatus: null,
  generationProgress: 0,
  isCreating: false,
  isGeneratingScript: false,
  isGeneratingAudio: false,
  isLoadingVoices: false,
  error: null,
};

// ── Pure helpers ──────────────────────────────────────────────────────────

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  return 'An unexpected error occurred';
}

/** Toggle an id in an array (add if absent, remove if present) */
function toggleId(ids: string[], id: string): string[] {
  return ids.includes(id) ? ids.filter((x) => x !== id) : [...ids, id];
}

// ── Generation polling helper ─────────────────────────────────────────────

type SetFn = (partial: Partial<CapsuleStoreState>) => void;
type GetFn = () => CapsuleStoreState;

/**
 * Polls the generation status endpoint until the capsule reaches a terminal state.
 * Extracted at module level to avoid exceeding SonarJS max function nesting depth.
 */
async function pollGenerationStatus(id: string, set: SetFn, get: GetFn): Promise<void> {
  const { isGeneratingAudio } = get();
  if (!isGeneratingAudio) return;

  try {
    const status = await capsuleApi.getCapsuleStatus(id);
    set({ generationStatus: status.status, generationProgress: status.progress ?? 0 });

    if (status.status === 'COMPLETED' || status.status === 'ACTIVE') {
      const capsule = await capsuleApi.getCapsule(id);
      set({
        currentCapsule: capsule,
        isGeneratingAudio: false,
        generationStatus: capsule.status,
        generationProgress: 100,
      });
    } else if (status.status === 'FAILED') {
      set({
        isGeneratingAudio: false,
        error: status.errorMessage ?? 'Audio generation failed.',
        generationProgress: 0,
      });
    } else {
      setTimeout(() => {
        pollGenerationStatus(id, set, get).catch(() => {
          set({ isGeneratingAudio: false, error: 'Polling failed.' });
        });
      }, POLL_INTERVAL_MS);
    }
  } catch (error: unknown) {
    set({ isGeneratingAudio: false, error: getErrorMessage(error) });
  }
}

// ── Store factory ─────────────────────────────────────────────────────────

type CapsuleStore = ReturnType<typeof createCapsuleStore>;

const createCapsuleStore = () => {
  return createStore<CapsuleStoreState>()((set, get) => ({
    ...DEFAULT_WIZARD_STATE,

    // ── Step 1 setters ────────────────────────────────────────────────

    setCapsuleType: (type) => set({ capsuleType: type }),

    setSelectedSectorId: (id) => set({ selectedSectorId: id, selectedDocumentIds: [] }),

    setCapsuleTitle: (title) => set({ capsuleTitle: title }),

    toggleDocument: (id) =>
      set((state) => ({ selectedDocumentIds: toggleId(state.selectedDocumentIds, id) })),

    setSelectedDocumentIds: (ids) => set({ selectedDocumentIds: ids }),

    // ── Step 2 setters ────────────────────────────────────────────────

    setIntroText: (text) => set({ introText: text }),

    setScript: (script) => set({ script }),

    setSelectedVoiceId: (id) => set({ selectedVoiceId: id }),

    // ── Navigation ────────────────────────────────────────────────────

    nextStep: async () => {
      const { capsuleType, selectedSectorId, capsuleTitle, selectedDocumentIds, introText } = get();

      if (!selectedSectorId || !capsuleTitle.trim() || selectedDocumentIds.length === 0) {
        set({ error: 'Please fill in all required fields before continuing.' });
        return;
      }

      set({ isCreating: true, error: null });
      try {
        const capsule = await capsuleApi.createCapsule({
          type: capsuleType,
          sectorId: selectedSectorId,
          title: capsuleTitle.trim(),
          sourceIds: selectedDocumentIds,
          ...(introText.trim() ? { introText: introText.trim() } : {}),
        });
        set({
          currentCapsuleId: capsule.id,
          currentCapsule: capsule,
          generationStatus: capsule.status,
          currentStep: 2,
          isCreating: false,
        });
      } catch (error: unknown) {
        set({ error: getErrorMessage(error), isCreating: false });
      }
    },

    previousStep: () => set({ currentStep: 1, error: null }),

    resetWizard: () => set(DEFAULT_WIZARD_STATE),

    resumeWizard: (capsule) => {
      const sourceIds = (capsule.sources ?? []).map((s) => s.id);
      set({
        capsuleType: capsule.type,
        selectedSectorId: capsule.sectorId,
        capsuleTitle: capsule.title,
        selectedDocumentIds: sourceIds,
        introText: capsule.introText ?? '',
        script: capsule.script ?? '',
        selectedVoiceId: capsule.audioVoiceId ?? null,
        currentStep: 2,
        currentCapsuleId: capsule.id,
        currentCapsule: capsule,
        generationStatus: capsule.status,
        error: null,
      });
    },

    // ── Async actions ─────────────────────────────────────────────────

    loadVoices: async () => {
      set({ isLoadingVoices: true, error: null });
      try {
        const voices = await capsuleApi.getVoices();
        set({ voices, isLoadingVoices: false });
      } catch (error: unknown) {
        set({ error: getErrorMessage(error), isLoadingVoices: false });
      }
    },

    generateScript: async () => {
      const { currentCapsuleId } = get();
      if (!currentCapsuleId) return;

      set({ isGeneratingScript: true, error: null });
      try {
        const result = await capsuleApi.generateScript(currentCapsuleId);
        set({ script: result.script, isGeneratingScript: false });
      } catch (error: unknown) {
        set({ error: getErrorMessage(error), isGeneratingScript: false });
      }
    },

    generateAudio: async () => {
      const { currentCapsuleId, selectedVoiceId, script } = get();
      if (!currentCapsuleId || !selectedVoiceId || !script.trim()) {
        set({ error: 'A script and voice selection are required to generate audio.' });
        return;
      }

      set({
        isGeneratingAudio: true,
        generationStatus: 'GENERATING',
        generationProgress: 0,
        error: null,
      });
      try {
        // Persist manual script edits before generating
        await capsuleApi.updateCapsule(currentCapsuleId, {
          script: script.trim(),
          audioVoiceId: selectedVoiceId,
        });

        // Kick off the generation pipeline
        await capsuleApi.generateAudio(currentCapsuleId, selectedVoiceId);

        // Start polling
        await pollGenerationStatus(currentCapsuleId, set, get);
      } catch (error: unknown) {
        set({
          error: getErrorMessage(error),
          isGeneratingAudio: false,
          generationStatus: 'FAILED',
        });
      }
    },

    pollStatus: async () => {
      const { currentCapsuleId } = get();
      if (!currentCapsuleId) return;

      try {
        const status = await capsuleApi.getCapsuleStatus(currentCapsuleId);
        set({ generationStatus: status.status });

        if (status.status === 'COMPLETED' || status.status === 'ACTIVE') {
          const capsule = await capsuleApi.getCapsule(currentCapsuleId);
          set({ currentCapsule: capsule, isGeneratingAudio: false });
        } else if (status.status === 'FAILED') {
          set({
            isGeneratingAudio: false,
            error: status.errorMessage ?? 'Audio generation failed.',
          });
        }
      } catch (error: unknown) {
        set({ error: getErrorMessage(error) });
      }
    },
  }));
};

// ── React Context ─────────────────────────────────────────────────────────

const CapsuleStoreContext = createContext<CapsuleStore | null>(null);

/**
 * Provider for the capsule wizard store.
 * Uses useState with lazy initializer (SSR-safe, same pattern as SectorStoreProvider).
 * Each wizard session creates a fresh store instance via useState.
 */
export function CapsuleStoreProvider({ children }: { children: ReactNode }) {
  const [store] = useState(createCapsuleStore);

  return <CapsuleStoreContext.Provider value={store}>{children}</CapsuleStoreContext.Provider>;
}

// ── Hook helpers ──────────────────────────────────────────────────────────

function useCapsuleStoreContext() {
  const store = useContext(CapsuleStoreContext);
  if (!store) throw new Error('useCapsuleStore must be used within CapsuleStoreProvider');
  return store;
}

/** Creates a typed selector hook bound to the CapsuleStore context */
function createCapsuleSelector<T>(selector: (state: CapsuleStoreState) => T) {
  return () => {
    const store = useCapsuleStoreContext();
    return useStore(store, selector);
  };
}

// ── Exported state hooks ──────────────────────────────────────────────────

export const useCapsuleType = createCapsuleSelector((s) => s.capsuleType);
export const useSelectedSectorId = createCapsuleSelector((s) => s.selectedSectorId);
export const useCapsuleTitle = createCapsuleSelector((s) => s.capsuleTitle);
export const useSelectedDocumentIds = createCapsuleSelector((s) => s.selectedDocumentIds);
export const useIntroText = createCapsuleSelector((s) => s.introText);
export const useCapsuleScript = createCapsuleSelector((s) => s.script);
export const useSelectedVoiceId = createCapsuleSelector((s) => s.selectedVoiceId);
export const useCapsuleVoices = createCapsuleSelector((s) => s.voices);
export const useCurrentStep = createCapsuleSelector((s) => s.currentStep);
export const useCurrentCapsuleId = createCapsuleSelector((s) => s.currentCapsuleId);
export const useCurrentCapsule = createCapsuleSelector((s) => s.currentCapsule);
export const useGenerationStatus = createCapsuleSelector((s) => s.generationStatus);
export const useGenerationProgress = createCapsuleSelector((s) => s.generationProgress);
export const useIsCreating = createCapsuleSelector((s) => s.isCreating);
export const useIsGeneratingScript = createCapsuleSelector((s) => s.isGeneratingScript);
export const useIsGeneratingAudio = createCapsuleSelector((s) => s.isGeneratingAudio);
export const useIsLoadingVoices = createCapsuleSelector((s) => s.isLoadingVoices);
export const useCapsuleError = createCapsuleSelector((s) => s.error);

// ── Exported action hooks ─────────────────────────────────────────────────

export const useSetCapsuleType = createCapsuleSelector((s) => s.setCapsuleType);
export const useSetSelectedSectorId = createCapsuleSelector((s) => s.setSelectedSectorId);
export const useSetCapsuleTitle = createCapsuleSelector((s) => s.setCapsuleTitle);
export const useToggleDocument = createCapsuleSelector((s) => s.toggleDocument);
export const useSetSelectedDocumentIds = createCapsuleSelector((s) => s.setSelectedDocumentIds);
export const useSetIntroText = createCapsuleSelector((s) => s.setIntroText);
export const useSetScript = createCapsuleSelector((s) => s.setScript);
export const useSetSelectedVoiceId = createCapsuleSelector((s) => s.setSelectedVoiceId);
export const useNextStep = createCapsuleSelector((s) => s.nextStep);
export const usePreviousStep = createCapsuleSelector((s) => s.previousStep);
export const useResetWizard = createCapsuleSelector((s) => s.resetWizard);
export const useResumeWizard = createCapsuleSelector((s) => s.resumeWizard);
export const useLoadVoices = createCapsuleSelector((s) => s.loadVoices);
export const useGenerateScript = createCapsuleSelector((s) => s.generateScript);
export const useGenerateAudio = createCapsuleSelector((s) => s.generateAudio);
export const usePollStatus = createCapsuleSelector((s) => s.pollStatus);
