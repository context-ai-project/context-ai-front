import { requireRole } from '@/lib/utils/require-role';
import { CAN_VIEW_CAPSULES } from '@/constants/permissions';
import { CapsulePlayerView } from '@/components/capsules/player/CapsulePlayerView';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

/**
 * Capsule detail / player page
 * Accessible to all authenticated users with capsule:read permission
 */
export default async function CapsuleDetailPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  await requireRole(CAN_VIEW_CAPSULES, locale);

  return <CapsulePlayerView capsuleId={id} />;
}
