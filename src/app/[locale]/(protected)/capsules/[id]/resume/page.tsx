import { requireRole } from '@/lib/utils/require-role';
import { CAN_CREATE_CAPSULES } from '@/constants/permissions';
import { CapsuleStoreProvider } from '@/stores/capsule.store';
import { CapsuleResumeWizard } from '@/components/capsules/CapsuleResumeWizard';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

/**
 * Resume a DRAFT or FAILED capsule in the creation wizard.
 * Only accessible to managers and admins (capsule:create permission),
 * same as the create flow.
 */
export default async function CapsuleResumePage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  await requireRole(CAN_CREATE_CAPSULES, locale);

  return (
    <CapsuleStoreProvider>
      <div className="flex h-[calc(100vh-3.5rem)] flex-col">
        <CapsuleResumeWizard capsuleId={id} locale={locale} />
      </div>
    </CapsuleStoreProvider>
  );
}
