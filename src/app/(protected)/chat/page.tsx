import { ChatContainer } from '@/components/chat/ChatContainer';

/**
 * Chat page - Server Component for better SEO and performance
 * Delegates interactivity to ChatContainer client component
 */
export default function ChatPage() {
  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col">
      <ChatContainer />
    </div>
  );
}
