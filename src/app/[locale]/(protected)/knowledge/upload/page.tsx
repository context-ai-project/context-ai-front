import { KnowledgeUpload } from '@/components/knowledge/KnowledgeUpload';
import { requireRole } from '@/lib/utils/require-role';
import { CAN_UPLOAD } from '@/constants/permissions';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

/**
 * Knowledge Upload page
 * Allows admin/manager users to upload documents to the knowledge base
 *
 * Route-level protection: redirects users without knowledge:create to dashboard.
 */
export default async function KnowledgeUploadPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  await requireRole(CAN_UPLOAD, locale);
  return <KnowledgeUpload />;
}
