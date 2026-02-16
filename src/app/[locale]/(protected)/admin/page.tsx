import { AdminView } from '@/components/admin/AdminView';
import { requireRole } from '@/lib/utils/require-role';
import { CAN_VIEW_ADMIN } from '@/constants/permissions';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

/**
 * Admin page (admin only)
 * User management, role assignment, and sector permissions
 *
 * Route-level protection: redirects non-admin users to the dashboard.
 */
export default async function AdminPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  await requireRole(CAN_VIEW_ADMIN, locale);
  return <AdminView />;
}
