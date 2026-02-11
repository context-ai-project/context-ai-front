import { renderHook, act } from '@testing-library/react';
import type { ReactNode } from 'react';
import {
  UserStoreProvider,
  useCurrentSectorId,
  useSectors,
  useSetCurrentSectorId,
  useSetSectors,
  useClearUserData,
} from '../user.store';

/**
 * Wrapper for hooks that require UserStoreProvider
 */
function Wrapper({ children }: { children: ReactNode }) {
  return <UserStoreProvider>{children}</UserStoreProvider>;
}

/**
 * Mock sectors for testing
 */
const mockSectors = [
  { id: 'sector-1', name: 'Human Resources' },
  { id: 'sector-2', name: 'Engineering' },
  { id: 'sector-3', name: 'Sales' },
];

describe('UserStore', () => {
  beforeEach(() => {
    // Clear sessionStorage before each test
    sessionStorage.clear();
  });

  describe('Initial State', () => {
    it('should have null currentSectorId by default', () => {
      const { result } = renderHook(() => useCurrentSectorId(), { wrapper: Wrapper });
      expect(result.current).toBeNull();
    });

    it('should have empty sectors by default', () => {
      const { result } = renderHook(() => useSectors(), { wrapper: Wrapper });
      expect(result.current).toEqual([]);
    });
  });

  describe('setCurrentSectorId', () => {
    it('should update current sector ID', () => {
      // Use a single renderHook with combined hooks to share the same store context
      const { result } = renderHook(
        () => ({
          currentSectorId: useCurrentSectorId(),
          setCurrentSectorId: useSetCurrentSectorId(),
        }),
        { wrapper: Wrapper },
      );

      act(() => {
        result.current.setCurrentSectorId('sector-1');
      });

      expect(result.current.currentSectorId).toBe('sector-1');
    });

    it('should allow changing sector ID', () => {
      const { result } = renderHook(
        () => ({
          currentSectorId: useCurrentSectorId(),
          setCurrentSectorId: useSetCurrentSectorId(),
        }),
        { wrapper: Wrapper },
      );

      act(() => {
        result.current.setCurrentSectorId('sector-1');
      });

      expect(result.current.currentSectorId).toBe('sector-1');

      act(() => {
        result.current.setCurrentSectorId('sector-2');
      });

      expect(result.current.currentSectorId).toBe('sector-2');
    });
  });

  describe('setSectors', () => {
    it('should set sectors list', () => {
      const { result } = renderHook(
        () => ({
          sectors: useSectors(),
          setSectors: useSetSectors(),
        }),
        { wrapper: Wrapper },
      );

      act(() => {
        result.current.setSectors(mockSectors);
      });

      expect(result.current.sectors).toEqual(mockSectors);
      expect(result.current.sectors).toHaveLength(3);
    });

    it('should replace existing sectors', () => {
      const { result } = renderHook(
        () => ({
          sectors: useSectors(),
          setSectors: useSetSectors(),
        }),
        { wrapper: Wrapper },
      );

      act(() => {
        result.current.setSectors(mockSectors);
      });

      const newSectors = [{ id: 'new-1', name: 'New Sector' }];

      act(() => {
        result.current.setSectors(newSectors);
      });

      expect(result.current.sectors).toEqual(newSectors);
      expect(result.current.sectors).toHaveLength(1);
    });
  });

  describe('clearUserData', () => {
    it('should reset all user data to initial state', () => {
      const { result } = renderHook(
        () => ({
          currentSectorId: useCurrentSectorId(),
          sectors: useSectors(),
          setCurrentSectorId: useSetCurrentSectorId(),
          setSectors: useSetSectors(),
          clearUserData: useClearUserData(),
        }),
        { wrapper: Wrapper },
      );

      // Set some data
      act(() => {
        result.current.setSectors(mockSectors);
        result.current.setCurrentSectorId('sector-1');
      });

      expect(result.current.currentSectorId).toBe('sector-1');
      expect(result.current.sectors).toHaveLength(3);

      // Clear
      act(() => {
        result.current.clearUserData();
      });

      expect(result.current.currentSectorId).toBeNull();
      expect(result.current.sectors).toEqual([]);
    });
  });

  describe('SessionStorage Persistence', () => {
    it('should persist currentSectorId to sessionStorage on change', async () => {
      const { result } = renderHook(
        () => ({
          currentSectorId: useCurrentSectorId(),
          setCurrentSectorId: useSetCurrentSectorId(),
        }),
        { wrapper: Wrapper },
      );

      act(() => {
        result.current.setCurrentSectorId('sector-1');
      });

      // Wait for useEffect to fire
      await vi.waitFor(() => {
        expect(sessionStorage.getItem('user-storage-currentSectorId')).toBe('sector-1');
      });
    });

    it('should remove sessionStorage key when sectorId is cleared', async () => {
      const { result } = renderHook(
        () => ({
          currentSectorId: useCurrentSectorId(),
          setCurrentSectorId: useSetCurrentSectorId(),
          clearUserData: useClearUserData(),
        }),
        { wrapper: Wrapper },
      );

      act(() => {
        result.current.setCurrentSectorId('sector-1');
      });

      await vi.waitFor(() => {
        expect(sessionStorage.getItem('user-storage-currentSectorId')).toBe('sector-1');
      });

      act(() => {
        result.current.clearUserData();
      });

      await vi.waitFor(() => {
        expect(sessionStorage.getItem('user-storage-currentSectorId')).toBeNull();
      });
    });
  });

  describe('Context Error', () => {
    it('should throw when hooks are used outside UserStoreProvider', () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined);

      expect(() => {
        renderHook(() => useCurrentSectorId());
      }).toThrow('useUserStore must be used within UserStoreProvider');

      consoleSpy.mockRestore();
    });
  });

  describe('Hook Return Types', () => {
    it('useSetCurrentSectorId returns a function', () => {
      const { result } = renderHook(() => useSetCurrentSectorId(), { wrapper: Wrapper });
      expect(typeof result.current).toBe('function');
    });

    it('useSetSectors returns a function', () => {
      const { result } = renderHook(() => useSetSectors(), { wrapper: Wrapper });
      expect(typeof result.current).toBe('function');
    });

    it('useClearUserData returns a function', () => {
      const { result } = renderHook(() => useClearUserData(), { wrapper: Wrapper });
      expect(typeof result.current).toBe('function');
    });
  });
});
