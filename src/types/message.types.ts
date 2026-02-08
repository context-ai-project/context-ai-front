/**
 * Message role enum
 */
export enum MessageRole {
  USER = 'user',
  ASSISTANT = 'assistant',
}

/**
 * Source fragment interface
 */
export interface SourceFragment {
  id: string;
  content: string;
  similarity: number;
  sourceId: string;
  metadata?: Record<string, unknown>;
}

/**
 * Message DTO
 */
export interface MessageDto {
  id: string;
  conversationId: string;
  role: MessageRole;
  content: string;
  sourcesUsed?: SourceFragment[];
  sentimentScore?: number;
  metadata?: Record<string, unknown>;
  createdAt: Date;
}

/**
 * Chat query DTO
 */
export interface ChatQueryDto {
  conversationId?: string;
  sectorId: string;
  message: string;
}

/**
 * Chat response DTO
 */
export interface ChatResponseDto {
  userMessage: MessageDto;
  assistantMessage: MessageDto;
  conversationId: string;
  sources: SourceFragment[];
}
