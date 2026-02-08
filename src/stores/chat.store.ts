import { create } from 'zustand';
import { persist } from 'zustand/middleware';
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
 * Chat store using Zustand
 * Persists conversationId and currentSectorId to localStorage
 */
export const useChatStore = create<ChatState>()(
  persist(
    (set) => ({
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
    }),
    {
      name: 'chat-storage',
      partialize: (state) => ({
        conversationId: state.conversationId,
        currentSectorId: state.currentSectorId,
      }),
    },
  ),
);

/**
 * Hook to get current conversation ID
 */
export const useConversationId = () => useChatStore((state) => state.conversationId);

/**
 * Hook to get loading state
 */
export const useIsLoading = () => useChatStore((state) => state.isLoading);

/**
 * Hook to get error state
 */
export const useError = () => useChatStore((state) => state.error);

/**
 * Hook to get messages
 */
export const useMessages = () => useChatStore((state) => state.messages);

/**
 * Hook to get current sector ID
 */
export const useCurrentSectorId = () => useChatStore((state) => state.currentSectorId);

/**
 * Hook to get all actions
 */
export const useChatActions = () =>
  useChatStore((state) => ({
    addMessage: state.addMessage,
    addMessages: state.addMessages,
    setMessages: state.setMessages,
    setConversationId: state.setConversationId,
    setCurrentSectorId: state.setCurrentSectorId,
    setLoading: state.setLoading,
    setError: state.setError,
    clearError: state.clearError,
    clearMessages: state.clearMessages,
    reset: state.reset,
  }));
