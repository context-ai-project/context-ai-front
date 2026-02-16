/**
 * Centralized role and permission constants.
 *
 * Single source of truth for "who can do what" — eliminates the
 * scattered inline role arrays flagged as CS-03 / CS-09.
 */

/** Supported user roles */
export const ROLES = {
  ADMIN: 'admin',
  MANAGER: 'manager',
  USER: 'user',
} as const;

/** Union type derived from ROLES values */
export type UserRole = (typeof ROLES)[keyof typeof ROLES];

/** All role values for runtime checks */
const ALL_ROLES = new Set<string>(Object.values(ROLES));

// ── Permission sets ──────────────────────────────────────────────────

/** Roles allowed to upload / delete documents */
export const CAN_UPLOAD: readonly UserRole[] = [ROLES.ADMIN, ROLES.MANAGER];

/**
 * Roles allowed to see the Documents page.
 * Per RBAC matrix: knowledge:read → user ✅, manager ✅, admin ✅
 */
export const CAN_VIEW_DOCUMENTS: readonly UserRole[] = [ROLES.ADMIN, ROLES.MANAGER, ROLES.USER];

/** Roles allowed to see the Sectors page */
export const CAN_VIEW_SECTORS: readonly UserRole[] = [ROLES.ADMIN];

/** Roles allowed to see the Admin page */
export const CAN_VIEW_ADMIN: readonly UserRole[] = [ROLES.ADMIN];

/** Roles treated as "admin-level" (sector selector, etc.) */
export const ADMIN_LEVEL_ROLES: readonly UserRole[] = [ROLES.ADMIN, ROLES.MANAGER];

// ── Helper ───────────────────────────────────────────────────────────

/**
 * Check whether a user role is included in a list of allowed roles.
 *
 * @param userRole - The role string to check
 * @param allowedRoles - Array of allowed role values
 * @returns `true` if `userRole` is present in `allowedRoles`
 */
export function hasPermission(userRole: string, allowedRoles: readonly string[]): boolean {
  return allowedRoles.includes(userRole);
}

/**
 * Type-safe check: is the given string a known UserRole?
 */
export function isUserRole(value: string): value is UserRole {
  return ALL_ROLES.has(value);
}
