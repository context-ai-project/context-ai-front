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
  responseType?: RagResponseType; // v1.3: answer | no_context | error
  structured?: StructuredResponse; // v1.3: structured response data
  sourcesUsed?: SourceFragment[];
  /** @planned Phase 6 - Sentiment analysis integration */
  sentimentScore?: number;
  /** @planned Phase 7 - Extended message metadata */
  metadata?: Record<string, unknown>;
  createdAt: string;
}

/**
 * Chat query DTO
 *
 * Note: userId is NOT included — the backend extracts it from the JWT token
 * for security (prevents user impersonation).
 */
export interface ChatQueryDto {
  conversationId?: string;
  sectorId: string;
  query: string; // Backend expects 'query', not 'message'
}

/**
 * Response types to distinguish between normal responses and fallbacks (v1.3)
 */
export enum RagResponseType {
  /** Response with documentary context */
  ANSWER = 'answer',
  /** No relevant documents found */
  NO_CONTEXT = 'no_context',
  /** Error during processing */
  ERROR = 'error',
}

/**
 * Section types for structured responses (v1.3)
 */
export type SectionType = 'info' | 'steps' | 'warning' | 'tip';

/**
 * A single section in a structured response (v1.3)
 */
export interface ResponseSection {
  title: string;
  content: string;
  type: SectionType;
}

/**
 * Structured response from the API (v1.3)
 */
export interface StructuredResponse {
  summary: string;
  sections: ResponseSection[];
  keyPoints?: string[];
  relatedTopics?: string[];
}

/**
 * Chat response DTO (matches backend QueryAssistantResponseDto)
 * Backend returns the assistant's response text, not full Message objects
 *
 * v1.3: Added responseType and structured fields
 */
export interface ChatResponseDto {
  response: string; // Assistant's response text (backward compatible)
  responseType: RagResponseType; // v1.3: Type of response
  structured?: StructuredResponse; // v1.3: Structured response data
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
 * Handles timestamp normalization and v1.3 structured fields
 */
export function createAssistantMessage(response: ChatResponseDto): MessageDto {
  return {
    id: `assistant-${crypto.randomUUID()}`,
    conversationId: response.conversationId,
    role: MessageRole.ASSISTANT,
    content: response.response,
    responseType: response.responseType,
    structured: response.structured,
    createdAt:
      typeof response.timestamp === 'string'
        ? response.timestamp
        : new Date(response.timestamp).toISOString(),
    sourcesUsed: response.sources,
  };
}
