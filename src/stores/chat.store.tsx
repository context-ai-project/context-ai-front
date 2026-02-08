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
  currentSectorId: string | null;

  // Actions
  setMessages: (messages: MessageDto[]) => void;
  addMessage: (message: MessageDto) => void;
  addMessages: (userMessage: MessageDto, assistantMessage: MessageDto) => void;
  setConversationId: (id: string | null) => void;
  setCurrentSectorId: (sectorId: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearMessages: () => void;
  clearError: () => void;
  reset: () => void;
}

/**
 * Initial state
 */
const initialState = {
  messages: [],
  conversationId: null,
  isLoading: false,
  error: null,
  currentSectorId: null,
};

/**
 * Create chat store
 */
type ChatStore = ReturnType<typeof createChatStore>;

const createChatStore = () => {
  return createStore<ChatState>()((set) => ({
    ...initialState,

    setMessages: (messages) =>
      set({
        messages,
      }),

    addMessage: (message) =>
      set((state) => ({
        messages: [...state.messages, message],
      })),

    addMessages: (userMessage, assistantMessage) =>
      set((state) => ({
        messages: [...state.messages, userMessage, assistantMessage],
      })),

    setConversationId: (id) =>
      set({
        conversationId: id,
      }),

    setCurrentSectorId: (sectorId) =>
      set({
        currentSectorId: sectorId,
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
        ...initialState,
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
 * Hook to get current sector ID
 */
export const useCurrentSectorId = () => {
  const store = useChatStoreContext();
  return useStore(store, (state) => state.currentSectorId);
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

export const useSetCurrentSectorId = () => {
  const store = useChatStoreContext();
  return useStore(store, (state) => state.setCurrentSectorId);
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
