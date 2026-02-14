import { z } from 'zod';

/**
 * Message role enum
 */
export enum MessageRole {
  USER = 'user',
  ASSISTANT = 'assistant',
}

/**
 * Typed metadata for source fragments
 * Provides type-safe access to common metadata fields
 */
export interface SourceMetadata {
  title?: string;
  page?: number;
  url?: string;
  [key: string]: unknown;
}

/** Zod schema for validating source fragment metadata */
const sourceMetadataSchema = z
  .object({
    title: z.string().optional(),
    page: z.number().optional(),
    url: z.string().url().optional(),
  })
  .catchall(z.unknown());

/**
 * Extract typed metadata from a raw metadata record
 * Validates with Zod schema before returning typed result
 */
export function extractSourceMetadata(metadata?: Record<string, unknown>): SourceMetadata {
  if (!metadata) return {};

  const parsed = sourceMetadataSchema.safeParse(metadata);
  return parsed.success ? parsed.data : {};
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
  /** @planned Phase 6 - Sentiment analysis integration */
  sentimentScore?: number;
  /** @planned Phase 7 - Extended message metadata */
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

/**
 * Factory function to create a user message DTO
 * Ensures consistent structure and unique IDs
 */
export function createUserMessage(content: string, conversationId: string | null): MessageDto {
  return {
    id: `user-${crypto.randomUUID()}`,
    conversationId: conversationId || 'new',
    role: MessageRole.USER,
    content,
    createdAt: new Date().toISOString(),
  };
}

/**
 * Factory function to create an assistant message DTO from API response
 * Handles timestamp normalization
 */
export function createAssistantMessage(response: ChatResponseDto): MessageDto {
  return {
    id: `assistant-${crypto.randomUUID()}`,
    conversationId: response.conversationId,
    role: MessageRole.ASSISTANT,
    content: response.response,
    createdAt:
      typeof response.timestamp === 'string'
        ? response.timestamp
        : new Date(response.timestamp).toISOString(),
    sourcesUsed: response.sources,
  };
}
