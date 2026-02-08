'use client';

import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { createStore, useStore } from 'zustand';

/**
 * User state interface
 * Manages user profile, current sector, and session data
 */
interface UserState {
  // State
  currentSectorId: string | null;
  sectors: Array<{ id: string; name: string }>;

  // Actions
  setCurrentSectorId: (sectorId: string) => void;
  setSectors: (sectors: Array<{ id: string; name: string }>) => void;
  clearUserData: () => void;
}

/**
 * Initial state
 */
const initialState = {
  currentSectorId: null,
  sectors: [],
};

/**
 * Create user store
 */
type UserStore = ReturnType<typeof createUserStore>;

const createUserStore = (initialValues?: Partial<UserState>) => {
  return createStore<UserState>()((set) => ({
    ...initialState,
    ...initialValues,

    setCurrentSectorId: (sectorId) =>
      set({
        currentSectorId: sectorId,
      }),

    setSectors: (sectors) =>
      set({
        sectors,
      }),

    clearUserData: () =>
      set({
        ...initialState,
      }),
  }));
};

/**
 * User store context
 */
const UserStoreContext = createContext<UserStore | null>(null);

/**
 * Provides a React context containing the user Zustand store and persists its relevant state to sessionStorage on the client.
 *
 * Initializes the store from sessionStorage when available (client-side only) and subscribes to store updates to keep sessionStorage in sync in a SSR-safe manner.
 */
export function UserStoreProvider({ children }: { children: ReactNode }) {
  // Initialize store with sessionStorage data (client-side only)
  const [store] = useState(() => {
    if (typeof window !== 'undefined') {
      const stored = sessionStorage.getItem('user-storage');
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          return createUserStore(parsed);
        } catch {
          return createUserStore();
        }
      }
    }
    return createUserStore();
  });

  // Subscribe to store changes and persist to sessionStorage
  useEffect(() => {
    const unsubscribe = store.subscribe((state) => {
      if (typeof window !== 'undefined') {
        sessionStorage.setItem(
          'user-storage',
          JSON.stringify({
            currentSectorId: state.currentSectorId,
            sectors: state.sectors,
          }),
        );
      }
    });

    return unsubscribe;
  }, [store]);

  return <UserStoreContext.Provider value={store}>{children}</UserStoreContext.Provider>;
}

/**
 * Retrieves the UserStore from React context for use in hooks and components.
 *
 * @returns The Zustand store instance that holds user state and actions.
 * @throws Error if called outside of a `UserStoreProvider`.
 */
function useUserStoreContext() {
  const store = useContext(UserStoreContext);

  if (!store) {
    throw new Error('useUserStore must be used within UserStoreProvider');
  }

  return store;
}

/**
 * Hook to get current sector ID
 */
export const useCurrentSectorId = () => {
  const store = useUserStoreContext();
  return useStore(store, (state) => state.currentSectorId);
};

/**
 * Hook to get sectors list
 */
export const useSectors = () => {
  const store = useUserStoreContext();
  return useStore(store, (state) => state.sectors);
};

/**
 * Hook to set current sector ID
 */
export const useSetCurrentSectorId = () => {
  const store = useUserStoreContext();
  return useStore(store, (state) => state.setCurrentSectorId);
};

/**
 * Hook to set sectors list
 */
export const useSetSectors = () => {
  const store = useUserStoreContext();
  return useStore(store, (state) => state.setSectors);
};

/**
 * Hook to clear user data
 */
export const useClearUserData = () => {
  const store = useUserStoreContext();
  return useStore(store, (state) => state.clearUserData);
};