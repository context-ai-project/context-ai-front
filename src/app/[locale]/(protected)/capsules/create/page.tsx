import { CapsuleCreateWizard } from '@/components/capsules/CapsuleCreateWizard';
import { CapsuleStoreProvider } from '@/stores/capsule.store';
import { requireRole } from '@/lib/utils/require-role';
import { CAN_CREATE_CAPSULES } from '@/constants/permissions';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

/**
 * Capsule creation wizard page
 * Only accessible to managers and admins (capsule:create permission)
 */
export default async function CapsuleCreatePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  await requireRole(CAN_CREATE_CAPSULES, locale);

  return (
    <CapsuleStoreProvider>
      <div className="flex h-[calc(100vh-3.5rem)] flex-col">
        <CapsuleCreateWizard />
      </div>
    </CapsuleStoreProvider>
  );
}
