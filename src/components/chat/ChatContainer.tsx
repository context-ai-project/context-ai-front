'use client';

import { useState } from 'react';
import { MessageList } from './MessageList';
import { MessageInput } from './MessageInput';
import { SectorSelector } from './SectorSelector';
import { useChatStore, useChatActions } from '@/stores/chat.store';
import { chatApi } from '@/lib/api/chat.api';
import { MessageRole } from '@/types/message.types';
import { isApiError } from '@/lib/api/error-handler';

/**
 * Main chat container with responsive layout
 * Handles the overall structure and logic of the chat interface
 * Issue 5.7: Integrate State with API and Components
 */
export function ChatContainer() {
  const { conversationId, currentSectorId } = useChatStore();
  const { addMessage, setConversationId, setLoading, setError, reset } = useChatActions();

  // Local error state for UI feedback
  const [localError, setLocalError] = useState<string | null>(null);

  /**
   * Handle sending a message
   * This connects the UI -> Store -> API flow
   */
  const handleSendMessage = async (messageContent: string) => {
    setLocalError(null);

    // Validation: sectorId is required
    if (!currentSectorId) {
      setLocalError('No sector selected. Please select a sector from your profile.');
      return;
    }

    // Generate temporary ID for optimistic UI update
    const tempUserId = `temp-${Date.now()}`;
    const tempConversationId = conversationId || `temp-conv-${Date.now()}`;

    // Optimistic update: add user message immediately
    addMessage({
      id: tempUserId,
      conversationId: tempConversationId,
      role: MessageRole.USER,
      content: messageContent,
      createdAt: new Date(),
    });

    setLoading(true);

    try {
      // Call the API
      const response = await chatApi.sendMessage({
        conversationId: conversationId || undefined,
        sectorId: currentSectorId,
        message: messageContent,
      });

      // Update conversation ID if it's a new conversation
      if (!conversationId) {
        setConversationId(response.conversationId);
      }

      // Add assistant message from response
      addMessage({
        id: response.assistantMessage.id,
        conversationId: response.conversationId,
        role: MessageRole.ASSISTANT,
        content: response.assistantMessage.content,
        sourcesUsed: response.sources,
        metadata: response.assistantMessage.metadata,
        createdAt: new Date(response.assistantMessage.createdAt),
      });

      // Clear any errors
      setError(null);
    } catch (err: unknown) {
      // Handle API errors
      if (isApiError(err)) {
        const errorMessage = `Error ${err.status}: ${err.message}`;
        setError(errorMessage);
        setLocalError(errorMessage);
      } else {
        const genericError = 'Failed to send message. Please try again.';
        setError(genericError);
        setLocalError(genericError);
      }

      // Remove optimistic user message on error
      // Note: In a real app, you might want to mark it as "failed" instead
      // For now, we just show the error and keep the message
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handle clearing the conversation
   * Resets the store and local state
   */
  const handleClearConversation = () => {
    reset();
    setLocalError(null);
  };

  return (
    <div className="mx-auto flex h-full w-full max-w-7xl flex-col gap-4">
      {/* Sector selector (temporary - will be replaced in Issue 5.13) */}
      <SectorSelector />

      {/* Error banner */}
      {localError && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-4">
          <div className="flex items-start gap-2">
            <svg className="h-5 w-5 shrink-0 text-red-500" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
            </svg>
            <div className="flex-1">
              <h3 className="text-sm font-medium text-red-800">Error</h3>
              <p className="mt-1 text-sm text-red-700">{localError}</p>
            </div>
            <button
              onClick={() => setLocalError(null)}
              className="shrink-0 text-red-500 hover:text-red-700"
              aria-label="Dismiss error"
            >
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Main chat area */}
      <div className="flex flex-1 flex-col overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
        {/* Messages area - scrollable */}
        <div className="flex-1 overflow-y-auto p-4">
          <MessageList />
        </div>

        {/* Input area - fixed at bottom */}
        <div className="border-t border-gray-200 bg-gray-50 p-4">
          <MessageInput
            onSendMessage={handleSendMessage}
            onClearConversation={handleClearConversation}
          />
        </div>
      </div>
    </div>
  );
}
