'use client';

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { createStore, useStore } from 'zustand';
import type { Sector, SectorStatus, CreateSectorDto, UpdateSectorDto } from '@/types/sector.types';
import { sectorApi } from '@/lib/api/sector.api';

// ── Store types ──────────────────────────────────────────────────────────────

interface SectorState {
  sectors: Sector[];
  isLoading: boolean;
  error: string | null;
}

interface SectorActions {
  /** Fetch all sectors from the API */
  fetchSectors: () => Promise<void>;
  /** Add a new sector via API (active by default) */
  addSector: (dto: CreateSectorDto) => Promise<Sector>;
  /** Update an existing sector via API */
  updateSector: (id: string, dto: UpdateSectorDto) => Promise<void>;
  /** Delete a sector via API (only if documentCount === 0) */
  deleteSector: (id: string) => Promise<boolean>;
  /** Toggle sector active/inactive via API */
  toggleSectorStatus: (id: string) => Promise<void>;
  /** Check if a sector name already exists (exact match, case-insensitive) — local cache */
  sectorNameExists: (name: string, excludeId?: string) => boolean;
  /** Find sectors with similar names (fuzzy) — local cache */
  findSimilarNames: (name: string, excludeId?: string) => string[];
  /** Set loading state */
  setLoading: (loading: boolean) => void;
  /** Set error */
  setError: (error: string | null) => void;
}

type SectorStoreState = SectorState & SectorActions;

// ── Pure helper functions (extracted to avoid nesting) ───────────────────────

/**
 * Minimum character length for substring-based similarity checks.
 * Prevents false positives like "Ma" matching "Human Resources".
 */
const MIN_SIMILARITY_LENGTH = 5;

/**
 * Checks if two names are similar (fuzzy match).
 * Returns true if names share significant common substrings.
 * Requires the shorter string to be at least MIN_SIMILARITY_LENGTH chars
 * to avoid noisy matches on very short inputs.
 */
function isSimilar(a: string, b: string): boolean {
  const la = a.toLowerCase().trim();
  const lb = b.toLowerCase().trim();
  if (la === lb) return false; // Exact match handled separately

  const shorter = la.length <= lb.length ? la : lb;

  // Skip similarity checks if the query is too short
  if (shorter.length < MIN_SIMILARITY_LENGTH) return false;

  // Check if one contains the other
  if (la.includes(lb) || lb.includes(la)) return true;

  // Check word overlap (only compare words with meaningful length)
  const wordsA = la.split(/\s+/);
  const wordsB = lb.split(/\s+/);
  const threshold = Math.min(wordsA.length, wordsB.length) * 0.5;
  const commonCount = wordsA.filter(
    (w) =>
      w.length >= MIN_SIMILARITY_LENGTH &&
      wordsB.some(
        (wb) =>
          wb.length >= MIN_SIMILARITY_LENGTH && (wb === w || wb.includes(w) || w.includes(wb)),
      ),
  ).length;
  return commonCount > 0 && commonCount >= threshold;
}

/** Build sector list excluding the sector matching id */
function filterOut(sectors: Sector[], id: string): Sector[] {
  return sectors.filter((s) => s.id !== id);
}

/** Replace a sector in the list with an updated version */
function replaceSector(sectors: Sector[], id: string, updated: Sector): Sector[] {
  return sectors.map((s) => (s.id === id ? updated : s));
}

/** Apply a status change to a sector in the list */
function applyStatusChange(sectors: Sector[], id: string, status: SectorStatus): Sector[] {
  return sectors.map((s) =>
    s.id === id ? { ...s, status, updatedAt: new Date().toISOString() } : s,
  );
}

/** Extract a human-readable error message from an unknown error */
function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  return 'An unexpected error occurred';
}

// ── Store factory ────────────────────────────────────────────────────────────

type SectorStore = ReturnType<typeof createSectorStore>;

const createSectorStore = () => {
  return createStore<SectorStoreState>()((set, get) => ({
    sectors: [],
    isLoading: false,
    error: null,

    fetchSectors: async () => {
      set({ isLoading: true, error: null });
      try {
        const sectors = await sectorApi.listSectors();
        set({ sectors, isLoading: false });
      } catch (error: unknown) {
        set({ error: getErrorMessage(error), isLoading: false });
      }
    },

    addSector: async (dto: CreateSectorDto): Promise<Sector> => {
      try {
        const newSector = await sectorApi.createSector(dto);
        set((state) => ({ sectors: [newSector, ...state.sectors] }));
        return newSector;
      } catch (error: unknown) {
        set({ error: getErrorMessage(error) });
        throw error;
      }
    },

    updateSector: async (id: string, dto: UpdateSectorDto): Promise<void> => {
      try {
        const updated = await sectorApi.updateSector(id, dto);
        set((state) => ({ sectors: replaceSector(state.sectors, id, updated) }));
      } catch (error: unknown) {
        set({ error: getErrorMessage(error) });
        throw error;
      }
    },

    deleteSector: async (id: string): Promise<boolean> => {
      try {
        await sectorApi.deleteSector(id);
        set((state) => ({ sectors: filterOut(state.sectors, id) }));
        return true;
      } catch (error: unknown) {
        set({ error: getErrorMessage(error) });
        throw error;
      }
    },

    toggleSectorStatus: async (id: string): Promise<void> => {
      try {
        const result = await sectorApi.toggleStatus(id);
        set((state) => ({ sectors: applyStatusChange(state.sectors, id, result.status) }));
      } catch (error: unknown) {
        set({ error: getErrorMessage(error) });
        throw error;
      }
    },

    sectorNameExists: (name: string, excludeId?: string): boolean => {
      const normalized = name.toLowerCase().trim();
      return get().sectors.some(
        (s) => s.id !== excludeId && s.name.toLowerCase().trim() === normalized,
      );
    },

    findSimilarNames: (name: string, excludeId?: string): string[] => {
      return get()
        .sectors.filter((s) => s.id !== excludeId && isSimilar(name, s.name))
        .map((s) => s.name);
    },

    setLoading: (loading: boolean) => set({ isLoading: loading }),
    setError: (error: string | null) => set({ error }),
  }));
};

// ── React Context ────────────────────────────────────────────────────────────

const SectorStoreContext = createContext<SectorStore | null>(null);

/**
 * Initializer component that fetches sectors from the API on mount.
 * Rendered inside the provider so it has access to the store context.
 */
function SectorInitializer() {
  const fetchSectors = useFetchSectors();

  useEffect(() => {
    fetchSectors();
  }, [fetchSectors]);

  return null;
}

/**
 * Provider for the sector store.
 * Uses useState with lazy initializer (SSR-safe, same pattern as ChatStoreProvider).
 * Auto-fetches sectors from the API on mount via SectorInitializer.
 */
export function SectorStoreProvider({ children }: { children: ReactNode }) {
  const [store] = useState(createSectorStore);

  return (
    <SectorStoreContext.Provider value={store}>
      <SectorInitializer />
      {children}
    </SectorStoreContext.Provider>
  );
}

// ── Hook helpers ─────────────────────────────────────────────────────────────

function useSectorStoreContext() {
  const store = useContext(SectorStoreContext);
  if (!store) throw new Error('useSectorStore must be used within SectorStoreProvider');
  return store;
}

// ── Selector factory (eliminates repetitive 3-line hook boilerplate) ─────────

/**
 * Creates a typed selector hook bound to the SectorStore context.
 */
function createSectorSelector<T>(selector: (state: SectorStoreState) => T) {
  return () => {
    const store = useSectorStoreContext();
    return useStore(store, selector);
  };
}

// ── Selectors (stable references — no .filter/.map to avoid new arrays) ──────

const selectSectors = (state: SectorStoreState) => state.sectors;

function createSectorByIdSelector(id: string) {
  return (state: SectorStoreState) => state.sectors.find((sec) => sec.id === id);
}

// ── Exported hooks ───────────────────────────────────────────────────────────

/** Get all sectors */
export const useAllSectors = () => {
  const store = useSectorStoreContext();
  return useStore(store, selectSectors);
};

/**
 * Get only active sectors.
 * Uses useMemo to cache the filtered result so that the reference stays stable
 * as long as the underlying sectors array hasn't changed.
 * This avoids the "getSnapshot should be cached" infinite loop in useSyncExternalStore.
 */
export const useActiveSectors = () => {
  const sectors = useAllSectors();
  return useMemo(() => sectors.filter((sec) => sec.status === 'active'), [sectors]);
};

/** Get a single sector by ID */
export const useSectorById = (id: string) => {
  const store = useSectorStoreContext();
  return useStore(store, createSectorByIdSelector(id));
};

/** Get loading state */
export const useSectorLoading = createSectorSelector((s) => s.isLoading);

/** Get error state */
export const useSectorError = createSectorSelector((s) => s.error);

/** Get fetchSectors action */
export const useFetchSectors = createSectorSelector((s) => s.fetchSectors);

/** Get addSector action */
export const useAddSector = createSectorSelector((s) => s.addSector);

/** Get updateSector action */
export const useUpdateSector = createSectorSelector((s) => s.updateSector);

/** Get deleteSector action */
export const useDeleteSector = createSectorSelector((s) => s.deleteSector);

/** Get toggleSectorStatus action */
export const useToggleSectorStatus = createSectorSelector((s) => s.toggleSectorStatus);

/** Get sectorNameExists checker */
export const useSectorNameExists = createSectorSelector((s) => s.sectorNameExists);

/** Get findSimilarNames checker */
export const useFindSimilarNames = createSectorSelector((s) => s.findSimilarNames);
