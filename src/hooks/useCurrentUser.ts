import { useUser } from '@auth0/nextjs-auth0/client';
import { useCurrentSectorId, useSectors } from '@/stores/user.store';

/**
 * Custom hook to get current user with Auth0 data and local state
 * Combines Auth0 user data with user store
 */
export function useCurrentUser() {
  const { user, isLoading, error } = useUser();
  const currentSectorId = useCurrentSectorId();
  const sectors = useSectors();

  return {
    // Auth0 data
    user,
    isLoading,
    error,
    isAuthenticated: !!user,

    // User store data
    currentSectorId,
    sectors,

    // Computed
    userName: user?.name || user?.nickname || 'Guest',
    userEmail: user?.email || '',
    userPicture: user?.picture || '',
  };
}
