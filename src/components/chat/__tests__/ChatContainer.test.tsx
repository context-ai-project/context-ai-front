import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ChatContainer } from '../ChatContainer';
import { chatApi } from '@/lib/api/chat.api';
import { MessageRole } from '@/types/message.types';

// Mock the chat API
vi.mock('@/lib/api/chat.api', () => ({
  chatApi: {
    sendMessage: vi.fn(),
  },
}));

// Mock error handler - must re-export ErrorType used by ErrorState
vi.mock('@/lib/api/error-handler', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/lib/api/error-handler')>();
  return {
    ...actual,
    logError: vi.fn(),
    getErrorMessage: (err: unknown) =>
      err instanceof Error ? err.message : 'An unexpected error occurred',
  };
});

// Controllable mock for useSession
const mockSessionData = vi.fn();
vi.mock('next-auth/react', () => ({
  useSession: () => mockSessionData(),
  SessionProvider: ({ children }: { children: React.ReactNode }) => children,
}));

// Controllable store state
const mockStoreState = {
  messages: [] as Array<{
    id: string;
    conversationId: string;
    role: string;
    content: string;
    createdAt: string;
    sourcesUsed?: unknown[];
  }>,
  conversationId: null as string | null,
  isLoading: false,
  error: null as string | null,
  addMessage: vi.fn(),
  setConversationId: vi.fn(),
  setLoading: vi.fn(),
  setError: vi.fn(),
  clearMessages: vi.fn(),
  addMessages: vi.fn(),
  setMessages: vi.fn(),
  clearError: vi.fn(),
  reset: vi.fn(),
};

// Mock sector store (needed by ChatHeader for active sectors)
vi.mock('@/stores/sector.store', () => ({
  useActiveSectors: () => [
    {
      id: 'test-sector-id',
      name: 'Engineering',
      description: '',
      icon: 'code',
      status: 'active',
      documentCount: 0,
      createdAt: '',
      updatedAt: '',
    },
  ],
  SectorStoreProvider: ({ children }: { children: React.ReactNode }) => children,
}));

// Mock user store (needed by ChatHeader and SuggestedQuestions → EmptyState)
vi.mock('@/stores/user.store', () => ({
  useCurrentSectorId: () => 'test-sector-id',
  useSectors: () => [{ id: 'test-sector-id', name: 'Engineering' }],
  useSetCurrentSectorId: () => vi.fn(),
  useSetSectors: () => vi.fn(),
  UserStoreProvider: ({ children }: { children: React.ReactNode }) => children,
}));

// Mock all chat store hooks
vi.mock('@/stores/chat.store', () => ({
  useChatStore: () => mockStoreState,
  useMessages: () => mockStoreState.messages,
  useConversationId: () => mockStoreState.conversationId,
  useIsLoading: () => mockStoreState.isLoading,
  useError: () => mockStoreState.error,
  useAddMessage: () => mockStoreState.addMessage,
  useSetConversationId: () => mockStoreState.setConversationId,
  useSetLoading: () => mockStoreState.setLoading,
  useSetError: () => mockStoreState.setError,
  useClearMessages: () => mockStoreState.clearMessages,
  useResetChat: () => mockStoreState.reset,
  useSetMessages: () => mockStoreState.setMessages,
  useAddMessages: () => mockStoreState.addMessages,
  useClearError: () => mockStoreState.clearError,
  ChatStoreProvider: ({ children }: { children: React.ReactNode }) => children,
}));

const defaultSession = {
  data: {
    user: {
      id: 'test-user-id',
      name: 'Test User',
      email: 'test@example.com',
      image: null,
      roles: ['user'],
    },
    accessToken: 'test-access-token',
    expires: new Date(Date.now() + 86400000).toISOString(),
  },
  status: 'authenticated',
};

describe('ChatContainer', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSessionData.mockReturnValue(defaultSession);
    mockStoreState.messages = [];
    mockStoreState.conversationId = null;
    mockStoreState.isLoading = false;
    mockStoreState.error = null;
  });

  it('should render empty state when no messages and not loading', () => {
    render(<ChatContainer />);
    // The component renders MessageInput with the textbox
    expect(screen.getByRole('textbox')).toBeDefined();
  });

  it('should render error state when error is present', () => {
    mockStoreState.error = 'Something went wrong';

    render(<ChatContainer />);
    // ErrorState categorizes strings as UNKNOWN type and shows its translated title
    expect(screen.getByTestId('error-state')).toBeInTheDocument();
    expect(screen.getByText('types.unknown.title')).toBeInTheDocument();
  });

  it('should render message list when messages exist', () => {
    mockStoreState.messages = [
      {
        id: 'msg-1',
        conversationId: 'conv-1',
        role: MessageRole.USER,
        content: 'Hello world',
        createdAt: '2026-01-01T00:00:00Z',
      },
    ];

    render(<ChatContainer />);
    expect(screen.getByText('Hello world')).toBeInTheDocument();
  });

  it('should set error when session is not available', async () => {
    mockSessionData.mockReturnValue({
      data: null,
      status: 'unauthenticated',
    });

    render(<ChatContainer />);

    const input = screen.getByRole('textbox');
    await userEvent.type(input, 'test message');

    const sendButton = screen.getByRole('button', { name: /send/i });
    await userEvent.click(sendButton);

    await waitFor(() => {
      expect(mockStoreState.setError).toHaveBeenCalledWith(
        'User session not found. Please sign in again.',
      );
    });
  });

  it('should send message and handle successful response', async () => {
    const mockResponse = {
      conversationId: 'conv-new',
      response: 'This is the AI response',
      sources: [],
      timestamp: '2026-01-01T00:00:00Z',
    };

    vi.mocked(chatApi.sendMessage).mockResolvedValue(mockResponse);

    render(<ChatContainer />);

    const input = screen.getByRole('textbox');
    await userEvent.type(input, 'How do I request vacation?');

    const sendButton = screen.getByRole('button', { name: /send/i });
    await userEvent.click(sendButton);

    await waitFor(() => {
      expect(mockStoreState.setLoading).toHaveBeenCalledWith(true);
      expect(mockStoreState.addMessage).toHaveBeenCalled();
      expect(chatApi.sendMessage).toHaveBeenCalled();
    });

    await waitFor(() => {
      expect(mockStoreState.setConversationId).toHaveBeenCalledWith('conv-new');
      expect(mockStoreState.setLoading).toHaveBeenCalledWith(false);
    });
  });

  it('should handle API error gracefully', async () => {
    vi.mocked(chatApi.sendMessage).mockRejectedValue(new Error('Network error'));

    render(<ChatContainer />);

    const input = screen.getByRole('textbox');
    await userEvent.type(input, 'test');

    const sendButton = screen.getByRole('button', { name: /send/i });
    await userEvent.click(sendButton);

    await waitFor(() => {
      expect(mockStoreState.setError).toHaveBeenCalledWith('Network error');
      expect(mockStoreState.setLoading).toHaveBeenCalledWith(false);
    });
  });

  it('should handle invalid response from backend', async () => {
    vi.mocked(chatApi.sendMessage).mockResolvedValue({
      // Missing conversationId
      response: 'some response',
    } as ReturnType<typeof chatApi.sendMessage> extends Promise<infer R> ? R : never);

    render(<ChatContainer />);

    const input = screen.getByRole('textbox');
    await userEvent.type(input, 'test');

    const sendButton = screen.getByRole('button', { name: /send/i });
    await userEvent.click(sendButton);

    await waitFor(() => {
      expect(mockStoreState.setError).toHaveBeenCalledWith(
        'Invalid response from backend: missing conversationId',
      );
    });
  });

  it('should handle timestamp as Date object in response', async () => {
    const mockResponse = {
      conversationId: 'conv-1',
      response: 'Test response',
      sources: [],
      timestamp: new Date('2026-01-01T00:00:00Z'),
    };

    vi.mocked(chatApi.sendMessage).mockResolvedValue(mockResponse);

    render(<ChatContainer />);

    const input = screen.getByRole('textbox');
    await userEvent.type(input, 'test');

    const sendButton = screen.getByRole('button', { name: /send/i });
    await userEvent.click(sendButton);

    await waitFor(() => {
      // The second addMessage call is for the assistant message
      const assistantCall = mockStoreState.addMessage.mock.calls[1]?.[0];
      expect(assistantCall?.createdAt).toBe('2026-01-01T00:00:00.000Z');
    });
  });

  it('should use existing conversationId when available', async () => {
    mockStoreState.conversationId = 'existing-conv-id';

    const mockResponse = {
      conversationId: 'existing-conv-id',
      response: 'Test response',
      sources: [],
      timestamp: '2026-01-01T00:00:00Z',
    };

    vi.mocked(chatApi.sendMessage).mockResolvedValue(mockResponse);

    render(<ChatContainer />);

    const input = screen.getByRole('textbox');
    await userEvent.type(input, 'test');

    const sendButton = screen.getByRole('button', { name: /send/i });
    await userEvent.click(sendButton);

    await waitFor(() => {
      const callArgs = vi.mocked(chatApi.sendMessage).mock.calls[0][0];
      expect(callArgs.conversationId).toBe('existing-conv-id');
    });
  });

  it('should dismiss error when dismiss is clicked', () => {
    mockStoreState.error = 'An error occurred';

    render(<ChatContainer />);

    // ErrorState should render a dismiss button
    const dismissButton = screen.getByLabelText('dismissError');
    dismissButton.click();
    expect(mockStoreState.setError).toHaveBeenCalledWith(null);
  });
});
