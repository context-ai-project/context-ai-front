import { DocumentsView } from '@/components/documents/DocumentsView';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

/**
 * Documents page
 * Lists knowledge base documents with search, filters, and upload functionality
 */
export default async function DocumentsPage({ params }: { params: Promise<{ locale: string }> }) {
  await params;
  return <DocumentsView />;
}
