import { renderHook, act } from '@testing-library/react';
import type { ReactNode } from 'react';
import {
  ChatStoreProvider,
  useChatStore,
  useMessages,
  useConversationId,
  useIsLoading,
  useError,
  useAddMessage,
  useSetConversationId,
  useSetLoading,
  useSetError,
  useClearMessages,
  useResetChat,
  useSetMessages,
  useAddMessages,
  useClearError,
} from '../chat.store';
import { MessageRole, type MessageDto } from '@/types/message.types';

/**
 * Wrapper for hooks that require ChatStoreProvider
 */
function Wrapper({ children }: { children: ReactNode }) {
  return <ChatStoreProvider>{children}</ChatStoreProvider>;
}

/**
 * Factory for creating mock messages
 */
function createMockMessage(overrides: Partial<MessageDto> = {}): MessageDto {
  return {
    id: `msg-${Date.now()}`,
    conversationId: 'conv-test-001',
    role: MessageRole.USER,
    content: 'Test message',
    createdAt: '2026-01-15T10:30:00Z',
    ...overrides,
  };
}

describe('ChatStore', () => {
  describe('Initial State', () => {
    it('should have empty messages by default', () => {
      const { result } = renderHook(() => useMessages(), { wrapper: Wrapper });
      expect(result.current).toEqual([]);
    });

    it('should have null conversationId by default', () => {
      const { result } = renderHook(() => useConversationId(), { wrapper: Wrapper });
      expect(result.current).toBeNull();
    });

    it('should have isLoading false by default', () => {
      const { result } = renderHook(() => useIsLoading(), { wrapper: Wrapper });
      expect(result.current).toBe(false);
    });

    it('should have null error by default', () => {
      const { result } = renderHook(() => useError(), { wrapper: Wrapper });
      expect(result.current).toBeNull();
    });
  });

  describe('addMessage', () => {
    it('should add a valid message to the store', () => {
      const { result } = renderHook(() => useChatStore(), { wrapper: Wrapper });
      const message = createMockMessage({ id: 'msg-1', content: 'Hello' });

      act(() => {
        result.current.addMessage(message);
      });

      expect(result.current.messages).toHaveLength(1);
      expect(result.current.messages[0]).toEqual(message);
    });

    it('should append messages in order', () => {
      const { result } = renderHook(() => useChatStore(), { wrapper: Wrapper });
      const msg1 = createMockMessage({ id: 'msg-1', content: 'First' });
      const msg2 = createMockMessage({
        id: 'msg-2',
        content: 'Second',
        role: MessageRole.ASSISTANT,
      });

      act(() => {
        result.current.addMessage(msg1);
        result.current.addMessage(msg2);
      });

      expect(result.current.messages).toHaveLength(2);
      expect(result.current.messages[0].content).toBe('First');
      expect(result.current.messages[1].content).toBe('Second');
    });

    it('should not add message without id', () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
      const { result } = renderHook(() => useChatStore(), { wrapper: Wrapper });

      act(() => {
        result.current.addMessage({
          ...createMockMessage(),
          id: '',
        });
      });

      expect(result.current.messages).toHaveLength(0);
      consoleSpy.mockRestore();
    });

    it('should not add message without role', () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
      const { result } = renderHook(() => useChatStore(), { wrapper: Wrapper });

      act(() => {
        result.current.addMessage({
          ...createMockMessage(),
          role: '' as MessageRole,
        });
      });

      expect(result.current.messages).toHaveLength(0);
      consoleSpy.mockRestore();
    });

    it('should not add message without content', () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
      const { result } = renderHook(() => useChatStore(), { wrapper: Wrapper });

      act(() => {
        result.current.addMessage({
          ...createMockMessage(),
          content: '',
        });
      });

      expect(result.current.messages).toHaveLength(0);
      consoleSpy.mockRestore();
    });
  });

  describe('addMessages', () => {
    it('should add user and assistant messages simultaneously', () => {
      const { result } = renderHook(() => useChatStore(), { wrapper: Wrapper });
      const userMsg = createMockMessage({
        id: 'msg-user',
        role: MessageRole.USER,
        content: 'Question',
      });
      const assistantMsg = createMockMessage({
        id: 'msg-assistant',
        role: MessageRole.ASSISTANT,
        content: 'Answer',
      });

      act(() => {
        result.current.addMessages(userMsg, assistantMsg);
      });

      expect(result.current.messages).toHaveLength(2);
      expect(result.current.messages[0].role).toBe(MessageRole.USER);
      expect(result.current.messages[1].role).toBe(MessageRole.ASSISTANT);
    });
  });

  describe('setMessages', () => {
    it('should replace the entire messages array', () => {
      const { result } = renderHook(() => useChatStore(), { wrapper: Wrapper });
      const initialMsg = createMockMessage({ id: 'msg-1', content: 'Initial' });

      act(() => {
        result.current.addMessage(initialMsg);
      });

      expect(result.current.messages).toHaveLength(1);

      const newMessages = [
        createMockMessage({ id: 'msg-new-1', content: 'New 1' }),
        createMockMessage({ id: 'msg-new-2', content: 'New 2' }),
      ];

      act(() => {
        result.current.setMessages(newMessages);
      });

      expect(result.current.messages).toHaveLength(2);
      expect(result.current.messages[0].content).toBe('New 1');
      expect(result.current.messages[1].content).toBe('New 2');
    });
  });

  describe('setConversationId', () => {
    it('should set conversation ID', () => {
      const { result } = renderHook(() => useChatStore(), { wrapper: Wrapper });

      act(() => {
        result.current.setConversationId('conv-123');
      });

      expect(result.current.conversationId).toBe('conv-123');
    });

    it('should allow setting conversation ID to null', () => {
      const { result } = renderHook(() => useChatStore(), { wrapper: Wrapper });

      act(() => {
        result.current.setConversationId('conv-123');
      });

      act(() => {
        result.current.setConversationId(null);
      });

      expect(result.current.conversationId).toBeNull();
    });
  });

  describe('setLoading', () => {
    it('should update loading state', () => {
      const { result } = renderHook(() => useChatStore(), { wrapper: Wrapper });

      act(() => {
        result.current.setLoading(true);
      });

      expect(result.current.isLoading).toBe(true);

      act(() => {
        result.current.setLoading(false);
      });

      expect(result.current.isLoading).toBe(false);
    });
  });

  describe('setError', () => {
    it('should set error message and stop loading', () => {
      const { result } = renderHook(() => useChatStore(), { wrapper: Wrapper });

      act(() => {
        result.current.setLoading(true);
      });

      act(() => {
        result.current.setError('Something went wrong');
      });

      expect(result.current.error).toBe('Something went wrong');
      expect(result.current.isLoading).toBe(false);
    });

    it('should clear error when set to null', () => {
      const { result } = renderHook(() => useChatStore(), { wrapper: Wrapper });

      act(() => {
        result.current.setError('Error');
      });

      act(() => {
        result.current.setError(null);
      });

      expect(result.current.error).toBeNull();
    });
  });

  describe('clearMessages', () => {
    it('should clear all messages', () => {
      const { result } = renderHook(() => useChatStore(), { wrapper: Wrapper });

      act(() => {
        result.current.addMessage(createMockMessage({ id: 'msg-1' }));
        result.current.addMessage(createMockMessage({ id: 'msg-2' }));
      });

      expect(result.current.messages).toHaveLength(2);

      act(() => {
        result.current.clearMessages();
      });

      expect(result.current.messages).toHaveLength(0);
    });
  });

  describe('clearError', () => {
    it('should clear error state', () => {
      const { result } = renderHook(() => useChatStore(), { wrapper: Wrapper });

      act(() => {
        result.current.setError('Some error');
      });

      act(() => {
        result.current.clearError();
      });

      expect(result.current.error).toBeNull();
    });
  });

  describe('reset', () => {
    it('should reset all state to initial values', () => {
      const { result } = renderHook(() => useChatStore(), { wrapper: Wrapper });

      // Set all state
      act(() => {
        result.current.addMessage(createMockMessage({ id: 'msg-1' }));
        result.current.setConversationId('conv-123');
        result.current.setLoading(true);
        result.current.setError('Error');
      });

      // Reset
      act(() => {
        result.current.reset();
      });

      expect(result.current.messages).toEqual([]);
      expect(result.current.conversationId).toBeNull();
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBeNull();
    });
  });

  describe('Individual Action Hooks', () => {
    it('useAddMessage returns addMessage function', () => {
      const { result } = renderHook(() => useAddMessage(), { wrapper: Wrapper });
      expect(typeof result.current).toBe('function');
    });

    it('useSetConversationId returns setConversationId function', () => {
      const { result } = renderHook(() => useSetConversationId(), { wrapper: Wrapper });
      expect(typeof result.current).toBe('function');
    });

    it('useSetLoading returns setLoading function', () => {
      const { result } = renderHook(() => useSetLoading(), { wrapper: Wrapper });
      expect(typeof result.current).toBe('function');
    });

    it('useSetError returns setError function', () => {
      const { result } = renderHook(() => useSetError(), { wrapper: Wrapper });
      expect(typeof result.current).toBe('function');
    });

    it('useClearMessages returns clearMessages function', () => {
      const { result } = renderHook(() => useClearMessages(), { wrapper: Wrapper });
      expect(typeof result.current).toBe('function');
    });

    it('useResetChat returns reset function', () => {
      const { result } = renderHook(() => useResetChat(), { wrapper: Wrapper });
      expect(typeof result.current).toBe('function');
    });

    it('useSetMessages returns setMessages function', () => {
      const { result } = renderHook(() => useSetMessages(), { wrapper: Wrapper });
      expect(typeof result.current).toBe('function');
    });

    it('useAddMessages returns addMessages function', () => {
      const { result } = renderHook(() => useAddMessages(), { wrapper: Wrapper });
      expect(typeof result.current).toBe('function');
    });

    it('useClearError returns clearError function', () => {
      const { result } = renderHook(() => useClearError(), { wrapper: Wrapper });
      expect(typeof result.current).toBe('function');
    });
  });

  describe('Context Error', () => {
    it('should throw when hooks are used outside ChatStoreProvider', () => {
      // Suppress console.error for this test
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined);

      expect(() => {
        renderHook(() => useChatStore());
      }).toThrow('useChatStore must be used within ChatStoreProvider');

      consoleSpy.mockRestore();
    });
  });
});
