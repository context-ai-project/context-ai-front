import { ChatContainer } from '@/components/chat/ChatContainer';

/**
 * Server component that renders the protected chat page.
 *
 * Delegates interactivity to a client-side chat container and provides a full-height
 * column layout for the chat UI.
 *
 * @returns The page's JSX element containing a full-height flex column with the chat container
 */
export default function ChatPage() {
  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col">
      <ChatContainer />
    </div>
  );
}