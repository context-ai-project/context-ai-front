import { ChatContainer } from '@/components/chat/ChatContainer';

/**
 * Force dynamic rendering to ensure locale changes are reflected
 */
export const dynamic = 'force-dynamic';
export const revalidate = 0;

/**
 * Chat page - Main interface for AI conversations
 * Server Component for better SEO and performance
 * Delegates interactivity to ChatContainer client component
 */
export default async function ChatPage({ params }: { params: Promise<{ locale: string }> }) {
  // Await params to ensure this page re-renders when locale changes
  await params;
  return <ChatContainer />;
}
