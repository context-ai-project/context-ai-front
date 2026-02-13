import { KnowledgeUpload } from '@/components/knowledge/KnowledgeUpload';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

/**
 * Knowledge Upload page
 * Allows admin/manager users to upload documents to the knowledge base
 */
export default async function KnowledgeUploadPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  await params;
  return <KnowledgeUpload />;
}
