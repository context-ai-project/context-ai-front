import { renderHook, act } from '@testing-library/react';
import type { ReactNode } from 'react';
import {
  SectorStoreProvider,
  useAllSectors,
  useActiveSectors,
  useSectorById,
  useSectorLoading,
  useSectorError,
  useFetchSectors,
  useAddSector,
  useUpdateSector,
  useDeleteSector,
  useToggleSectorStatus,
  useSectorNameExists,
  useFindSimilarNames,
} from '../sector.store';
import type { Sector } from '@/types/sector.types';

// ── Mocks ─────────────────────────────────────────────────────────────────────

const mockListSectors = vi.fn();
const mockCreateSector = vi.fn();
const mockUpdateSector = vi.fn();
const mockDeleteSector = vi.fn();
const mockToggleStatus = vi.fn();

vi.mock('@/lib/api/sector.api', () => ({
  sectorApi: {
    listSectors: (...args: unknown[]) => mockListSectors(...args),
    createSector: (...args: unknown[]) => mockCreateSector(...args),
    updateSector: (...args: unknown[]) => mockUpdateSector(...args),
    deleteSector: (...args: unknown[]) => mockDeleteSector(...args),
    toggleStatus: (...args: unknown[]) => mockToggleStatus(...args),
  },
}));

// ── Helpers ───────────────────────────────────────────────────────────────────

function Wrapper({ children }: { children: ReactNode }) {
  return <SectorStoreProvider>{children}</SectorStoreProvider>;
}

const name = 'Human Resources';

const MOCK_SECTORS: Sector[] = [
  {
    id: 's1',
    name: name,
    description: 'HR docs',
    icon: 'users',
    status: 'active',
    documentCount: 5,
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z',
  },
  {
    id: 's2',
    name: 'Engineering',
    description: 'Eng docs',
    icon: 'code',
    status: 'inactive',
    documentCount: 10,
    createdAt: '2025-02-01T00:00:00Z',
    updatedAt: '2025-02-01T00:00:00Z',
  },
  {
    id: 's3',
    name: 'Finance',
    description: 'Finance docs',
    icon: 'briefcase',
    status: 'active',
    documentCount: 0,
    createdAt: '2025-03-01T00:00:00Z',
    updatedAt: '2025-03-01T00:00:00Z',
  },
];

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('SectorStore', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Default: resolves immediately so SectorInitializer finishes
    mockListSectors.mockResolvedValue(MOCK_SECTORS);
  });

  // ── Initial fetch ────────────────────────────────────────────────────────

  describe('initial fetch on mount', () => {
    it('should auto-fetch sectors when provider mounts', async () => {
      const { result } = renderHook(
        () => ({
          sectors: useAllSectors(),
          isLoading: useSectorLoading(),
        }),
        { wrapper: Wrapper },
      );

      await vi.waitFor(() => {
        expect(result.current.sectors).toEqual(MOCK_SECTORS);
      });
      expect(mockListSectors).toHaveBeenCalledOnce();
    });

    it('should set error if initial fetch fails', async () => {
      mockListSectors.mockRejectedValue(new Error('Network error'));

      const { result } = renderHook(
        () => ({
          error: useSectorError(),
          isLoading: useSectorLoading(),
        }),
        { wrapper: Wrapper },
      );

      await vi.waitFor(() => {
        expect(result.current.error).toBe('Network error');
      });
    });
  });

  // ── Selectors ────────────────────────────────────────────────────────────

  describe('selectors', () => {
    it('useActiveSectors should filter only active sectors', async () => {
      const { result } = renderHook(
        () => ({
          active: useActiveSectors(),
          all: useAllSectors(),
        }),
        { wrapper: Wrapper },
      );

      await vi.waitFor(() => {
        expect(result.current.all).toHaveLength(3);
      });

      expect(result.current.active).toHaveLength(2);
      expect(result.current.active.every((s) => s.status === 'active')).toBe(true);
    });

    it('useSectorById should return matching sector', async () => {
      const { result } = renderHook(
        () => ({
          sector: useSectorById('s1'),
          all: useAllSectors(),
        }),
        { wrapper: Wrapper },
      );

      await vi.waitFor(() => {
        expect(result.current.all).toHaveLength(3);
      });

      expect(result.current.sector?.name).toBe(name);
    });

    it('useSectorById should return undefined for unknown id', async () => {
      const { result } = renderHook(
        () => ({
          sector: useSectorById('unknown'),
          all: useAllSectors(),
        }),
        { wrapper: Wrapper },
      );

      await vi.waitFor(() => {
        expect(result.current.all).toHaveLength(3);
      });

      expect(result.current.sector).toBeUndefined();
    });
  });

  // ── addSector ────────────────────────────────────────────────────────────

  describe('addSector', () => {
    it('should add a new sector to the list', async () => {
      const newSector: Sector = {
        id: 's4',
        name: 'Legal',
        description: 'Legal docs',
        icon: 'shield',
        status: 'active',
        documentCount: 0,
        createdAt: '2025-04-01T00:00:00Z',
        updatedAt: '2025-04-01T00:00:00Z',
      };
      mockCreateSector.mockResolvedValue(newSector);

      const { result } = renderHook(
        () => ({
          sectors: useAllSectors(),
          addSector: useAddSector(),
        }),
        { wrapper: Wrapper },
      );

      await vi.waitFor(() => {
        expect(result.current.sectors).toHaveLength(3);
      });

      await act(async () => {
        await result.current.addSector({
          name: 'Legal',
          description: 'Legal docs',
          icon: 'shield',
        });
      });

      expect(result.current.sectors).toHaveLength(4);
      expect(result.current.sectors[0].name).toBe('Legal'); // prepended
    });
  });

  // ── updateSector ─────────────────────────────────────────────────────────

  describe('updateSector', () => {
    it('should replace sector in list', async () => {
      const updated = { ...MOCK_SECTORS[0], name: 'HR Updated' };
      mockUpdateSector.mockResolvedValue(updated);

      const { result } = renderHook(
        () => ({
          sectors: useAllSectors(),
          updateSector: useUpdateSector(),
        }),
        { wrapper: Wrapper },
      );

      await vi.waitFor(() => {
        expect(result.current.sectors).toHaveLength(3);
      });

      await act(async () => {
        await result.current.updateSector('s1', { name: 'HR Updated' });
      });

      expect(result.current.sectors.find((s) => s.id === 's1')?.name).toBe('HR Updated');
    });
  });

  // ── deleteSector ─────────────────────────────────────────────────────────

  describe('deleteSector', () => {
    it('should remove sector from list', async () => {
      mockDeleteSector.mockResolvedValue({ id: 's3', message: 'Deleted' });

      const { result } = renderHook(
        () => ({
          sectors: useAllSectors(),
          deleteSector: useDeleteSector(),
        }),
        { wrapper: Wrapper },
      );

      await vi.waitFor(() => {
        expect(result.current.sectors).toHaveLength(3);
      });

      await act(async () => {
        await result.current.deleteSector('s3');
      });

      expect(result.current.sectors).toHaveLength(2);
      expect(result.current.sectors.find((s) => s.id === 's3')).toBeUndefined();
    });
  });

  // ── toggleSectorStatus ──────────────────────────────────────────────────

  describe('toggleSectorStatus', () => {
    it('should update sector status in list', async () => {
      mockToggleStatus.mockResolvedValue({ id: 's1', status: 'inactive', message: 'Done' });

      const { result } = renderHook(
        () => ({
          sectors: useAllSectors(),
          toggle: useToggleSectorStatus(),
        }),
        { wrapper: Wrapper },
      );

      await vi.waitFor(() => {
        expect(result.current.sectors).toHaveLength(3);
      });

      await act(async () => {
        await result.current.toggle('s1');
      });

      expect(result.current.sectors.find((s) => s.id === 's1')?.status).toBe('inactive');
    });
  });

  // ── sectorNameExists ────────────────────────────────────────────────────

  describe('sectorNameExists', () => {
    it('should return true for exact name match', async () => {
      const { result } = renderHook(
        () => ({
          sectors: useAllSectors(),
          exists: useSectorNameExists(),
        }),
        { wrapper: Wrapper },
      );

      await vi.waitFor(() => {
        expect(result.current.sectors).toHaveLength(3);
      });

      expect(result.current.exists(name)).toBe(true);
      expect(result.current.exists(name)).toBe(true);
      expect(result.current.exists('Nonexistent')).toBe(false);
    });

    it('should exclude given id from check', async () => {
      const { result } = renderHook(
        () => ({
          sectors: useAllSectors(),
          exists: useSectorNameExists(),
        }),
        { wrapper: Wrapper },
      );

      await vi.waitFor(() => {
        expect(result.current.sectors).toHaveLength(3);
      });

      expect(result.current.exists(name, 's1')).toBe(false);
    });
  });

  // ── findSimilarNames ────────────────────────────────────────────────────

  describe('findSimilarNames', () => {
    it('should return similar sector names', async () => {
      const { result } = renderHook(
        () => ({
          sectors: useAllSectors(),
          findSimilar: useFindSimilarNames(),
        }),
        { wrapper: Wrapper },
      );

      await vi.waitFor(() => {
        expect(result.current.sectors).toHaveLength(3);
      });

      // "Human" should match "Human Resources" (contains)
      expect(result.current.findSimilar('Human')).toEqual([name]);
    });

    it('should return empty array when no similar names', async () => {
      const { result } = renderHook(
        () => ({
          sectors: useAllSectors(),
          findSimilar: useFindSimilarNames(),
        }),
        { wrapper: Wrapper },
      );

      await vi.waitFor(() => {
        expect(result.current.sectors).toHaveLength(3);
      });

      expect(result.current.findSimilar('Zzzzzzz')).toEqual([]);
    });
  });

  // ── Context error ────────────────────────────────────────────────────────

  describe('context error', () => {
    it('should throw when hooks are used outside provider', () => {
      const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
      expect(() => renderHook(() => useAllSectors())).toThrow(
        'useSectorStore must be used within SectorStoreProvider',
      );
      spy.mockRestore();
    });
  });

  // ── setLoading / setError ────────────────────────────────────────────────

  describe('fetchSectors (manual)', () => {
    it('should refetch sectors', async () => {
      const { result } = renderHook(
        () => ({
          sectors: useAllSectors(),
          fetchSectors: useFetchSectors(),
        }),
        { wrapper: Wrapper },
      );

      await vi.waitFor(() => {
        expect(result.current.sectors).toHaveLength(3);
      });

      // now update mock to return different data
      mockListSectors.mockResolvedValue([MOCK_SECTORS[0]]);

      await act(async () => {
        await result.current.fetchSectors();
      });

      expect(result.current.sectors).toHaveLength(1);
      expect(mockListSectors).toHaveBeenCalledTimes(2); // initial + refetch
    });
  });
});
