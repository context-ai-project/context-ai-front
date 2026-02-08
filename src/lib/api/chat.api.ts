import type { ChatQueryDto, ChatResponseDto, MessageDto } from '@/types/message.types';
import { apiClient } from './client';

/**
 * Query keys for React Query
 */
export const chatKeys = {
  all: ['chat'] as const,
  conversations: (userId: string) => ['chat', 'conversations', userId] as const,
  conversation: (id: string) => ['chat', 'conversation', id] as const,
  messages: (conversationId: string) => ['chat', 'messages', conversationId] as const,
};

/**
 * Interface for conversation list item
 */
export interface ConversationSummary {
  id: string;
  userId: string;
  sectorId: string;
  title?: string;
  isActive: boolean;
  messageCount: number;
  lastMessagePreview?: string;
  createdAt: Date;
  updatedAt: Date;
  metadata?: Record<string, unknown>;
}

/**
 * Interface for conversation detail
 */
export interface ConversationDetail {
  id: string;
  userId: string;
  sectorId: string;
  title?: string;
  isActive: boolean;
  messages: MessageDto[];
  createdAt: Date;
  updatedAt: Date;
  metadata?: Record<string, unknown>;
}

/**
 * Interface for conversations list response
 */
export interface ConversationsListResponse {
  conversations: ConversationSummary[];
  total: number;
  count: number;
  offset: number;
  hasMore: boolean;
}

/**
 * Chat API functions
 */
export const chatApi = {
  /**
   * Send a message to the chat assistant
   */
  sendMessage: async (dto: ChatQueryDto): Promise<ChatResponseDto> => {
    return apiClient.post<ChatResponseDto>('/interaction/query', dto);
  },

  /**
   * Get list of conversations for a user
   */
  getConversations: async (
    userId: string,
    options?: {
      limit?: number;
      offset?: number;
      includeInactive?: boolean;
    },
  ): Promise<ConversationsListResponse> => {
    const params = new URLSearchParams({
      userId,
      limit: String(options?.limit ?? 10),
      offset: String(options?.offset ?? 0),
      includeInactive: String(options?.includeInactive ?? false),
    });

    return apiClient.get<ConversationsListResponse>(`/interaction/conversations?${params}`);
  },

  /**
   * Get a specific conversation by ID
   */
  getConversation: async (conversationId: string, userId: string): Promise<ConversationDetail> => {
    const params = new URLSearchParams({ userId });
    return apiClient.get<ConversationDetail>(
      `/interaction/conversations/${conversationId}?${params}`,
    );
  },

  /**
   * Delete a conversation (soft delete)
   */
  deleteConversation: async (conversationId: string, userId: string): Promise<void> => {
    const params = new URLSearchParams({ userId });
    return apiClient.delete<void>(`/interaction/conversations/${conversationId}?${params}`);
  },
};
