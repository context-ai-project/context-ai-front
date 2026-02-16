import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { isE2ETestMode } from '@/lib/test-auth';
import { getUserRole } from '@/lib/utils/get-user-role';
import { hasPermission } from '@/constants/permissions';
import type { UserRole } from '@/constants/permissions';
import { routes } from '@/lib/routes';

/**
 * Server-side route guard that checks if the current user has the required role.
 *
 * Must be called from a Server Component (page.tsx).
 * Redirects to the dashboard if the user lacks the required role.
 *
 * In E2E test mode the check is bypassed (consistent with layout-level auth bypass).
 *
 * @param allowedRoles - Array of roles that are permitted to access the route
 * @param locale - The current locale for building the redirect URL
 *
 * @example
 * ```ts
 * // In a Server Component page.tsx
 * export default async function SectorsPage({ params }) {
 *   const { locale } = await params;
 *   await requireRole(CAN_VIEW_SECTORS, locale);
 *   return <SectorsView />;
 * }
 * ```
 */
export async function requireRole(
  allowedRoles: readonly UserRole[],
  locale: string,
): Promise<void> {
  // Skip role check in E2E test mode (mirrors layout-level bypass)
  if (isE2ETestMode()) return;

  const session = await auth();

  // If not authenticated at all, redirect to sign-in
  if (!session) {
    redirect(routes.signIn(locale));
  }

  const userRole = getUserRole(session.user?.roles);

  if (!hasPermission(userRole, allowedRoles)) {
    redirect(routes.dashboard(locale));
  }
}
