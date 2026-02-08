'use client';

import { MessageList } from './MessageList';
import { MessageInput } from './MessageInput';
import { EmptyState } from './EmptyState';
import { ErrorState } from './ErrorState';
import { useChatStore } from '@/stores/chat.store';
import { chatApi } from '@/lib/api/chat.api';
import { MessageRole } from '@/types/message.types';
import { logError, getErrorMessage } from '@/lib/api/error-handler';

// Temporary hardcoded sector for MVP
const TEST_SECTOR_ID = '440e8400-e29b-41d4-a716-446655440000';

export function ChatContainer() {
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
    setError(null);
    setLoading(true);

    // Add user message optimistically
    const userMessage = {
      id: `temp-user-${Date.now()}`,
      conversationId: conversationId || 'new',
      role: MessageRole.USER,
      content: messageContent,
      createdAt: new Date().toISOString(),
    };
    addMessage(userMessage);

    try {
      const response = await chatApi.sendMessage({
        conversationId: conversationId || undefined,
        sectorId: TEST_SECTOR_ID,
        message: messageContent,
      });

      // Update conversation ID and add assistant message
      setConversationId(response.conversationId);
      addMessage(response.assistantMessage);
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
    <div className="flex h-full flex-col">
      <div className="flex-1 overflow-y-auto p-4">
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

      <div className="border-t border-gray-200 p-4">
        <MessageInput
          onSendMessage={handleSendMessage}
          onClearConversation={handleClearConversation}
        />
      </div>
    </div>
  );
}
