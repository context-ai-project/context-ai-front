import { useUser } from '@auth0/nextjs-auth0/client';
import { useCurrentSectorId, useSectors } from '@/stores/user.store';

/**
 * Provides a unified current-user object combining Auth0 client data with local user store state.
 *
 * The returned object exposes raw Auth0 fields, a boolean authentication flag, the current sector id
 * and sectors from the local store, and computed display fields (`userName`, `userEmail`, `userPicture`)
 * that use sensible fallbacks.
 *
 * @returns An object containing:
 * - `user` — the Auth0 user object or `undefined`
 * - `isLoading` — whether Auth0 user data is loading
 * - `error` — the Auth0 error object or `undefined`
 * - `isAuthenticated` — `true` if a Auth0 user exists, `false` otherwise
 * - `currentSectorId` — the currently selected sector id from the local store or `undefined`
 * - `sectors` — the list of sectors from the local store
 * - `userName` — preferred display name: `user.name`, then `user.nickname`, otherwise `'Guest'`
 * - `userEmail` — `user.email` or an empty string
 * - `userPicture` — `user.picture` or an empty string
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