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
 *
 * Note: createdAt is a string (ISO 8601) to match API response format
 * and avoid serialization issues
 */
export interface MessageDto {
  id: string;
  conversationId: string;
  role: MessageRole;
  content: string;
  sourcesUsed?: SourceFragment[];
  sentimentScore?: number;
  metadata?: Record<string, unknown>;
  createdAt: string;
}

/**
 * Chat query DTO
 */
export interface ChatQueryDto {
  userId: string;
  conversationId?: string;
  sectorId: string;
  query: string; // Backend expects 'query', not 'message'
}

/**
 * Chat response DTO (matches backend QueryAssistantResponseDto)
 * Backend returns the assistant's response text, not full Message objects
 */
export interface ChatResponseDto {
  response: string; // Assistant's response text
  conversationId: string;
  sources: SourceFragment[];
  timestamp: string | Date; // ISO 8601 string or Date object
}
