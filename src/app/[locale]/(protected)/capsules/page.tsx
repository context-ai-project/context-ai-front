import { requireRole } from '@/lib/utils/require-role';
import { CAN_VIEW_CAPSULES } from '@/constants/permissions';
import { CapsuleListView } from '@/components/capsules/list/CapsuleListView';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

/**
 * Capsules list page
 * Accessible to all authenticated users with capsule:read permission
 */
export default async function CapsulesPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  await requireRole(CAN_VIEW_CAPSULES, locale);

  return <CapsuleListView />;
}
