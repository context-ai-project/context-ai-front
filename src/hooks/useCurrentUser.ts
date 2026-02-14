'use client';

import { useSession } from 'next-auth/react';
import { useCurrentSectorId, useSectors } from '@/stores/user.store';

/**
 * Custom hook to get current user with NextAuth data and local state
 * Combines NextAuth session data with user store
 */
export function useCurrentUser() {
  const { data: session, status } = useSession();
  const user = session?.user;
  const currentSectorId = useCurrentSectorId();
  const sectors = useSectors();

  return {
    // NextAuth data
    user,
    isLoading: status === 'loading',
    isAuthenticated: status === 'authenticated',

    // User store data
    currentSectorId,
    sectors,

    // Computed
    userName: user?.name || 'Guest',
    userEmail: user?.email || '',
    userPicture: user?.image || '',
  };
}
