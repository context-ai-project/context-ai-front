import { ChatContainer } from '@/components/chat/ChatContainer';

/**
 * Chat page - Main interface for AI conversations
 * Server Component for better SEO and performance
 * Delegates interactivity to ChatContainer client component
 */
export default function ChatPage() {
  return <ChatContainer />;
}
