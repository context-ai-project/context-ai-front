'use client';

import { useSession } from 'next-auth/react';
import { MessageList } from './MessageList';
import { MessageInput } from './MessageInput';
import { EmptyState } from './EmptyState';
import { ErrorState } from './ErrorState';
import { useChatStore } from '@/stores/chat.store';
import { useCurrentSectorId } from '@/stores/user.store';
import { chatApi } from '@/lib/api/chat.api';
import { createUserMessage, createAssistantMessage } from '@/types/message.types';
import { logError, getErrorMessage } from '@/lib/api/error-handler';
import { DEFAULT_SECTOR_ID } from '@/constants/sectors';

/**
 * Main chat container component
 * Manages message flow, state, and interactions
 */
export function ChatContainer() {
  const { data: session } = useSession();
  const currentSectorId = useCurrentSectorId();
  const {
    messages,
    conversationId,
    isLoading,
    error,
    addMessage,
    setConversationId,
    setLoading,
    setError,
    clearMessages,
  } = useChatStore();

  const handleSendMessage = async (messageContent: string) => {
    // Validate user session
    if (!session?.user?.id) {
      setError('User session not found. Please sign in again.');
      return;
    }

    setError(null);
    setLoading(true);

    // Add user message optimistically
    const userMessage = createUserMessage(messageContent, conversationId);
    addMessage(userMessage);

    try {
      const response = await chatApi.sendMessage({
        userId: session.user.id,
        conversationId: conversationId || undefined,
        sectorId: currentSectorId || DEFAULT_SECTOR_ID,
        query: messageContent,
      });

      // Validate backend response
      if (!response || !response.conversationId) {
        throw new Error('Invalid response from backend: missing conversationId');
      }

      // Update conversation ID if new
      setConversationId(response.conversationId);

      // Add assistant message
      const assistantMessage = createAssistantMessage(response);
      addMessage(assistantMessage);
    } catch (err) {
      logError(err, { context: 'ChatContainer.handleSendMessage' });
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleClearConversation = () => {
    clearMessages();
    setError(null);
  };

  const showEmptyState = messages.length === 0 && !isLoading && !error;

  return (
    <div className="flex h-[calc(100svh-3.5rem)] flex-col">
      {/* Messages area with scroll */}
      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-4xl px-4 py-6">
          {error && (
            <div className="mb-4">
              <ErrorState error={error} onDismiss={() => setError(null)} variant="inline" />
            </div>
          )}

          {showEmptyState ? (
            <EmptyState onQuestionClick={handleSendMessage} />
          ) : (
            <MessageList messages={messages} isLoading={isLoading} />
          )}
        </div>
      </div>

      {/* Input area - fixed at bottom */}
      <div className="border-border bg-background shrink-0 border-t">
        <div className="mx-auto max-w-4xl px-4 py-4">
          <MessageInput
            onSendMessage={handleSendMessage}
            onClearConversation={handleClearConversation}
          />
        </div>
      </div>
    </div>
  );
}
