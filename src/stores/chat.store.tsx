'use client';

import { createContext, useContext, useState, type ReactNode } from 'react';
import { createStore, useStore } from 'zustand';
import type { MessageDto } from '@/types/message.types';

/**
 * Chat state interface
 * Manages messages, conversation state, loading and error states
 */
interface ChatState {
  // State
  messages: MessageDto[];
  conversationId: string | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  setMessages: (messages: MessageDto[]) => void;
  addMessage: (message: MessageDto) => void;
  addMessages: (userMessage: MessageDto, assistantMessage: MessageDto) => void;
  setConversationId: (id: string | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearMessages: () => void;
  clearError: () => void;
  reset: () => void;
}

/**
 * Factory function to create fresh initial state
 * Prevents accidental shared references across resets
 */
const getInitialState = (): Pick<
  ChatState,
  'messages' | 'conversationId' | 'isLoading' | 'error'
> => ({
  messages: [],
  conversationId: null,
  isLoading: false,
  error: null,
});

/**
 * Create chat store
 */
type ChatStore = ReturnType<typeof createChatStore>;

const createChatStore = () => {
  return createStore<ChatState>()((set) => ({
    ...getInitialState(),

    setMessages: (messages) =>
      set({
        messages,
      }),

    addMessage: (message) =>
      set((state) => {
        // Validate message before adding
        if (!message || !message.id || !message.role || !message.content) {
          console.warn('Attempted to add invalid message:', message);
          return state; // Don't update state
        }
        return {
          messages: [...state.messages, message],
        };
      }),

    addMessages: (userMessage, assistantMessage) =>
      set((state) => ({
        messages: [...state.messages, userMessage, assistantMessage],
      })),

    setConversationId: (id) =>
      set({
        conversationId: id,
      }),

    setLoading: (loading) =>
      set({
        isLoading: loading,
      }),

    setError: (error) =>
      set({
        error,
        isLoading: false,
      }),

    clearMessages: () =>
      set({
        messages: [],
      }),

    clearError: () =>
      set({
        error: null,
      }),

    reset: () =>
      set({
        ...getInitialState(),
      }),
  }));
};

/**
 * Chat store context
 */
const ChatStoreContext = createContext<ChatStore | null>(null);

/**
 * Chat store provider - wraps components that need access to chat state
 * This pattern is SSR-safe for Next.js 16 App Router
 * Uses useState with lazy initialization to comply with React hooks rules
 */
export function ChatStoreProvider({ children }: { children: ReactNode }) {
  const [store] = useState(createChatStore);

  return <ChatStoreContext.Provider value={store}>{children}</ChatStoreContext.Provider>;
}

/**
 * Hook to access chat store
 * Must be used within ChatStoreProvider
 */
function useChatStoreContext() {
  const store = useContext(ChatStoreContext);

  if (!store) {
    throw new Error('useChatStore must be used within ChatStoreProvider');
  }

  return store;
}

/**
 * Hook to get current conversation ID
 */
export const useConversationId = () => {
  const store = useChatStoreContext();
  return useStore(store, (state) => state.conversationId);
};

/**
 * Hook to get loading state
 */
export const useIsLoading = () => {
  const store = useChatStoreContext();
  return useStore(store, (state) => state.isLoading);
};

/**
 * Hook to get error state
 */
export const useError = () => {
  const store = useChatStoreContext();
  return useStore(store, (state) => state.error);
};

/**
 * Hook to get messages
 */
export const useMessages = () => {
  const store = useChatStoreContext();
  return useStore(store, (state) => state.messages);
};

/**
 * Hook to get the full store state (for internal use)
 */
export const useChatStore = () => {
  const store = useChatStoreContext();
  return useStore(store, (state) => state);
};

/**
 * Individual action hooks (prevents re-render issues)
 */
export const useAddMessage = () => {
  const store = useChatStoreContext();
  return useStore(store, (state) => state.addMessage);
};

export const useSetConversationId = () => {
  const store = useChatStoreContext();
  return useStore(store, (state) => state.setConversationId);
};

export const useSetLoading = () => {
  const store = useChatStoreContext();
  return useStore(store, (state) => state.setLoading);
};

export const useSetError = () => {
  const store = useChatStoreContext();
  return useStore(store, (state) => state.setError);
};

export const useClearMessages = () => {
  const store = useChatStoreContext();
  return useStore(store, (state) => state.clearMessages);
};

export const useResetChat = () => {
  const store = useChatStoreContext();
  return useStore(store, (state) => state.reset);
};

/**
 * Hook to set messages (replaces entire messages array)
 */
export const useSetMessages = () => {
  const store = useChatStoreContext();
  return useStore(store, (state) => state.setMessages);
};

/**
 * Hook to add both user and assistant messages at once
 */
export const useAddMessages = () => {
  const store = useChatStoreContext();
  return useStore(store, (state) => state.addMessages);
};

/**
 * Hook to clear error state
 */
export const useClearError = () => {
  const store = useChatStoreContext();
  return useStore(store, (state) => state.clearError);
};
