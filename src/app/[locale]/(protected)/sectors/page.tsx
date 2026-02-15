import { SectorsView } from '@/components/sectors/SectorsView';
import { requireRole } from '@/lib/utils/require-role';
import { CAN_VIEW_SECTORS } from '@/constants/permissions';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

/**
 * Sectors management page (admin only)
 * CRUD for knowledge sectors with activation/deactivation
 *
 * Route-level protection: redirects non-admin users to the dashboard.
 */
export default async function SectorsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  await requireRole(CAN_VIEW_SECTORS, locale);
  return <SectorsView />;
}
