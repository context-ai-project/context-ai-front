/**
 * Capsule API client
 * Handles CRUD, generation pipeline, and playback operations for multimedia capsules.
 *
 * Uses the centralised `apiClient` for auth, timeout, and error handling.
 */

import { apiClient } from './client';

// ── Enums ──────────────────────────────────────────────────────────────────

export type CapsuleType = 'VIDEO' | 'AUDIO' | 'BOTH';

export type CapsuleStatus = 'DRAFT' | 'GENERATING' | 'COMPLETED' | 'ACTIVE' | 'FAILED' | 'ARCHIVED';

export type CapsuleGenerationStep = 'SCRIPT' | 'AUDIO' | 'VIDEO' | 'POSTPROCESS';

// ── DTOs ───────────────────────────────────────────────────────────────────

/** Minimal source reference embedded in a capsule response */
export interface CapsuleSourceRefDto {
  id: string;
  title: string;
  sourceType: string;
}

/** Full response DTO for a multimedia capsule */
export interface CapsuleDto {
  id: string;
  title: string;
  description?: string;
  sectorId: string;
  sectorName?: string;
  type: CapsuleType;
  status: CapsuleStatus;
  introText?: string;
  script?: string;
  audioUrl?: string;
  videoUrl?: string;
  thumbnailUrl?: string;
  durationSeconds?: number;
  audioVoiceId?: string;
  generationMetadata?: Record<string, unknown>;
  createdBy: string;
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
  sources?: CapsuleSourceRefDto[];
}

/** DTO for creating a new capsule (DRAFT state) */
export interface CreateCapsuleDto {
  title: string;
  sectorId: string;
  type: CapsuleType;
  sourceIds: string[];
  introText?: string;
}

/** DTO for updating editable fields of an existing capsule */
export interface UpdateCapsuleDto {
  title?: string;
  introText?: string;
  script?: string;
  audioVoiceId?: string;
}

/** Response DTO for the capsule status polling endpoint */
export interface CapsuleStatusResponseDto {
  capsuleId: string;
  status: CapsuleStatus;
  currentStep?: CapsuleGenerationStep;
  progress?: number;
  errorMessage?: string;
  audioUrl?: string;
}

/** Response DTO for the capsule generation quota endpoint */
export interface CapsuleQuotaDto {
  used: number;
  limit: number;
  remaining: number;
  capsulesCost: number;
  capsulesRemaining: number;
}

/** Voice info returned by ElevenLabs voices endpoint */
export interface VoiceInfoDto {
  id: string;
  name: string;
  description?: string;
  previewUrl?: string;
  category?: string;
  labels?: Record<string, string>;
}

/** Paginated list response */
export interface PaginatedCapsuleResponse {
  data: CapsuleDto[];
  total: number;
  page: number;
  limit: number;
}

/** Filters for listing capsules */
export interface ListCapsulesParams {
  page?: number;
  limit?: number;
  sectorId?: string;
  status?: CapsuleStatus;
  type?: CapsuleType;
  search?: string;
}

// ── Query keys (for TanStack Query integration if needed) ──────────────────

export const capsuleKeys = {
  all: ['capsules'] as const,
  list: (params?: ListCapsulesParams) => ['capsules', 'list', params] as const,
  detail: (id: string) => ['capsules', id] as const,
  status: (id: string) => ['capsules', id, 'status'] as const,
  voices: () => ['capsules', 'voices'] as const,
  quota: () => ['capsules', 'quota'] as const,
};

// ── Helper ─────────────────────────────────────────────────────────────────

/** Build a query string from a params object, omitting undefined values */
function buildQueryString(params: Record<string, string | number | undefined>): string {
  const entries = Object.entries(params).filter(([, v]) => v !== undefined);
  if (entries.length === 0) return '';
  const qs = entries
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`)
    .join('&');
  return `?${qs}`;
}

// ── API functions ───────────────────────────────────────────────────────────

export const capsuleApi = {
  /**
   * List capsules with optional filters and pagination.
   */
  listCapsules: async (params?: ListCapsulesParams): Promise<PaginatedCapsuleResponse> => {
    const qs = buildQueryString({
      page: params?.page,
      limit: params?.limit,
      sectorId: params?.sectorId,
      status: params?.status,
      type: params?.type,
      search: params?.search,
    });
    return apiClient.get<PaginatedCapsuleResponse>(`/capsules${qs}`);
  },

  /**
   * Get a single capsule by ID.
   */
  getCapsule: async (id: string): Promise<CapsuleDto> => {
    return apiClient.get<CapsuleDto>(`/capsules/${encodeURIComponent(id)}`);
  },

  /**
   * Create a new capsule in DRAFT state (end of Step 1 in wizard).
   */
  createCapsule: async (dto: CreateCapsuleDto): Promise<CapsuleDto> => {
    return apiClient.post<CapsuleDto>('/capsules', dto);
  },

  /**
   * Update editable fields of an existing capsule (script, voice, etc.).
   */
  updateCapsule: async (id: string, dto: UpdateCapsuleDto): Promise<CapsuleDto> => {
    return apiClient.patch<CapsuleDto>(`/capsules/${encodeURIComponent(id)}`, dto);
  },

  /**
   * Archive (soft-delete) a capsule.
   */
  deleteCapsule: async (id: string): Promise<void> => {
    return apiClient.delete<void>(`/capsules/${encodeURIComponent(id)}`);
  },

  /**
   * Trigger AI script generation for a capsule using RAG + Gemini.
   */
  generateScript: async (id: string, language?: string): Promise<{ script: string }> => {
    const body = language ? { language } : {};
    return apiClient.post<{ script: string }>(
      `/capsules/${encodeURIComponent(id)}/generate-script`,
      body,
    );
  },

  /**
   * Trigger the full audio generation pipeline (ElevenLabs TTS + GCS upload).
   * Returns 202 Accepted with no body — poll getCapsuleStatus() for progress.
   */
  generateAudio: async (id: string, voiceId: string): Promise<void> => {
    await apiClient.post<void>(`/capsules/${encodeURIComponent(id)}/generate`, { voiceId });
  },

  /**
   * Poll the generation status of a capsule.
   * Used while status === 'GENERATING' to track pipeline progress.
   */
  getCapsuleStatus: async (id: string): Promise<CapsuleStatusResponseDto> => {
    return apiClient.get<CapsuleStatusResponseDto>(`/capsules/${encodeURIComponent(id)}/status`);
  },

  /**
   * Get a signed download URL for the capsule's audio or video file.
   */
  getDownloadUrl: async (
    id: string,
    type: 'audio' | 'video',
  ): Promise<{ url: string; expiresAt: string }> => {
    return apiClient.get<{ url: string; expiresAt: string }>(
      `/capsules/${encodeURIComponent(id)}/download/${type}`,
    );
  },

  /**
   * Publish a COMPLETED capsule (status → ACTIVE).
   * Makes the capsule visible to end users.
   */
  publishCapsule: async (id: string): Promise<CapsuleDto> => {
    return apiClient.post<CapsuleDto>(`/capsules/${encodeURIComponent(id)}/publish`);
  },

  /**
   * Archive an ACTIVE or COMPLETED capsule (status → ARCHIVED).
   */
  archiveCapsule: async (id: string): Promise<CapsuleDto> => {
    return apiClient.post<CapsuleDto>(`/capsules/${encodeURIComponent(id)}/archive`);
  },

  /**
   * Get the generation quota for the current billing period.
   */
  getQuota: async (): Promise<CapsuleQuotaDto> => {
    return apiClient.get<CapsuleQuotaDto>('/capsules/quota');
  },

  /**
   * Get available ElevenLabs voices for audio synthesis.
   */
  getVoices: async (): Promise<VoiceInfoDto[]> => {
    return apiClient.get<VoiceInfoDto[]>('/capsules/voices');
  },
};
