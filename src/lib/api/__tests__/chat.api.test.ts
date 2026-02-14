import { chatApi, chatKeys } from '../chat.api';
import { apiClient } from '../client';
import type { ChatQueryDto, ChatResponseDto } from '@/types/message.types';

// Mock the API client
vi.mock('../client', () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
  APIError: class APIError extends Error {
    constructor(
      message: string,
      public status: number,
      public data?: unknown,
    ) {
      super(message);
      this.name = 'APIError';
    }
  },
}));

const mockGet = vi.mocked(apiClient.get);
const mockPost = vi.mocked(apiClient.post);
const mockDelete = vi.mocked(apiClient.delete);

describe('Chat API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('chatKeys', () => {
    it('should generate correct query keys', () => {
      expect(chatKeys.all).toEqual(['chat']);
      expect(chatKeys.conversations('user-1')).toEqual(['chat', 'conversations', 'user-1']);
      expect(chatKeys.conversation('conv-1')).toEqual(['chat', 'conversation', 'conv-1']);
      expect(chatKeys.messages('conv-1')).toEqual(['chat', 'messages', 'conv-1']);
    });
  });

  describe('sendMessage', () => {
    it('should send a message to the backend', async () => {
      const dto: ChatQueryDto = {
        conversationId: 'conv-1',
        sectorId: 'sector-1',
        query: 'What is vacation policy?',
      };

      const mockResponse: ChatResponseDto = {
        response: 'You have 20 days of vacation.',
        conversationId: 'conv-1',
        sources: [],
        timestamp: '2026-01-15T10:30:05Z',
      };

      mockPost.mockResolvedValueOnce(mockResponse);

      const result = await chatApi.sendMessage(dto);

      expect(mockPost).toHaveBeenCalledWith('/interaction/query', dto);
      expect(result).toEqual(mockResponse);
    });

    it('should send message without conversationId for new conversations', async () => {
      const dto: ChatQueryDto = {
        sectorId: 'sector-1',
        query: 'Hello!',
      };

      const mockResponse: ChatResponseDto = {
        response: 'Hi there!',
        conversationId: 'new-conv-123',
        sources: [],
        timestamp: '2026-01-15T10:30:05Z',
      };

      mockPost.mockResolvedValueOnce(mockResponse);

      const result = await chatApi.sendMessage(dto);

      expect(result.conversationId).toBe('new-conv-123');
    });
  });

  describe('getConversations', () => {
    it('should fetch conversations with default options', async () => {
      const mockResponse = {
        conversations: [],
        total: 0,
        count: 0,
        offset: 0,
        hasMore: false,
      };

      mockGet.mockResolvedValueOnce(mockResponse);

      const result = await chatApi.getConversations('user-1');

      expect(mockGet).toHaveBeenCalledWith(expect.stringContaining('/interaction/conversations?'));
      expect(mockGet).toHaveBeenCalledWith(expect.stringContaining('userId=user-1'));
      expect(mockGet).toHaveBeenCalledWith(expect.stringContaining('limit=10'));
      expect(mockGet).toHaveBeenCalledWith(expect.stringContaining('offset=0'));
      expect(result).toEqual(mockResponse);
    });

    it('should fetch conversations with custom options', async () => {
      const mockResponse = {
        conversations: [],
        total: 0,
        count: 0,
        offset: 10,
        hasMore: false,
      };

      mockGet.mockResolvedValueOnce(mockResponse);

      await chatApi.getConversations('user-1', {
        limit: 20,
        offset: 10,
        includeInactive: true,
      });

      expect(mockGet).toHaveBeenCalledWith(expect.stringContaining('limit=20'));
      expect(mockGet).toHaveBeenCalledWith(expect.stringContaining('offset=10'));
      expect(mockGet).toHaveBeenCalledWith(expect.stringContaining('includeInactive=true'));
    });
  });

  describe('getConversation', () => {
    it('should fetch a specific conversation by ID', async () => {
      const mockResponse = {
        id: 'conv-1',
        userId: 'user-1',
        sectorId: 'sector-1',
        isActive: true,
        messages: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockGet.mockResolvedValueOnce(mockResponse);

      const result = await chatApi.getConversation('conv-1', 'user-1');

      expect(mockGet).toHaveBeenCalledWith(
        expect.stringContaining('/interaction/conversations/conv-1'),
      );
      expect(mockGet).toHaveBeenCalledWith(expect.stringContaining('userId=user-1'));
      expect(result).toEqual(mockResponse);
    });

    it('should encode special characters in conversationId', async () => {
      mockGet.mockResolvedValueOnce({});

      await chatApi.getConversation('conv/special&chars', 'user-1');

      expect(mockGet).toHaveBeenCalledWith(expect.stringContaining('conv%2Fspecial%26chars'));
    });
  });

  describe('deleteConversation', () => {
    it('should delete a conversation', async () => {
      mockDelete.mockResolvedValueOnce(undefined);

      await chatApi.deleteConversation('conv-1', 'user-1');

      expect(mockDelete).toHaveBeenCalledWith(
        expect.stringContaining('/interaction/conversations/conv-1'),
      );
      expect(mockDelete).toHaveBeenCalledWith(expect.stringContaining('userId=user-1'));
    });
  });
});
