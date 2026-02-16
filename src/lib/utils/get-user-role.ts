import { ROLES, isUserRole } from '@/constants/permissions';
import type { UserRole } from '@/constants/permissions';

/**
 * Extracts the primary role from user roles array.
 *
 * Centralises the logic that was previously duplicated in
 * `app-sidebar.tsx` and `ChatHeader.tsx` (CS-02).
 *
 * Returns a typed `UserRole` instead of a plain string (CS-09).
 *
 * @param roles - Array of role strings from the user session
 * @returns The first recognised role, or `'user'` as default
 */
export function getUserRole(roles?: string[]): UserRole {
  if (roles && Array.isArray(roles) && roles.length > 0) {
    const first = roles[0];
    if (isUserRole(first)) return first;
  }
  return ROLES.USER;
}
