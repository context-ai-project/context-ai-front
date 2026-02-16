/**
 * Sector API client
 * Handles CRUD operations for sector management (admin only)
 */

import { apiClient } from './client';
import type {
  Sector,
  SectorStatus,
  CreateSectorDto,
  UpdateSectorDto,
  SectorIcon,
} from '@/types/sector.types';

// ── Raw API response types (match backend DTOs) ────────────────────────────

/** Raw sector response from backend (status is UPPERCASE) */
interface SectorApiResponse {
  id: string;
  name: string;
  description: string;
  icon: SectorIcon;
  status: string; // 'ACTIVE' | 'INACTIVE'
  documentCount: number;
  createdAt: string;
  updatedAt: string;
}

/** Raw toggle status response from backend */
interface ToggleStatusApiResponse {
  id: string;
  status: string; // 'ACTIVE' | 'INACTIVE'
  message: string;
}

/** Raw delete sector response from backend */
interface DeleteSectorApiResponse {
  id: string;
  message: string;
}

// ── Normalization helpers ───────────────────────────────────────────────────

/**
 * Maps backend uppercase status to frontend lowercase
 * 'ACTIVE' → 'active', 'INACTIVE' → 'inactive'
 */
function normalizeStatus(status: string): SectorStatus {
  return status.toLowerCase() as SectorStatus;
}

/** Normalize a raw API sector response to the frontend Sector type */
function normalizeSector(raw: SectorApiResponse): Sector {
  return {
    id: raw.id,
    name: raw.name,
    description: raw.description,
    icon: raw.icon,
    status: normalizeStatus(raw.status),
    documentCount: raw.documentCount,
    createdAt: raw.createdAt,
    updatedAt: raw.updatedAt,
  };
}

// ── Query keys (for TanStack Query integration if needed) ───────────────────

export const sectorKeys = {
  all: ['sectors'] as const,
  detail: (id: string) => ['sectors', id] as const,
};

// ── API functions ───────────────────────────────────────────────────────────

export const sectorApi = {
  /**
   * List all sectors
   * Returns sectors with document counts, normalized to frontend types
   */
  listSectors: async (): Promise<Sector[]> => {
    const raw = await apiClient.get<SectorApiResponse[]>('/sectors');
    return raw.map(normalizeSector);
  },

  /**
   * Get a single sector by ID
   */
  getSector: async (id: string): Promise<Sector> => {
    const raw = await apiClient.get<SectorApiResponse>(`/sectors/${encodeURIComponent(id)}`);
    return normalizeSector(raw);
  },

  /**
   * Create a new sector
   * The sector is created as active by default
   */
  createSector: async (dto: CreateSectorDto): Promise<Sector> => {
    const raw = await apiClient.post<SectorApiResponse>('/sectors', dto);
    return normalizeSector(raw);
  },

  /**
   * Update an existing sector (partial update)
   * Strips the status field — status is managed via the toggleStatus endpoint
   */
  updateSector: async (id: string, dto: UpdateSectorDto): Promise<Sector> => {
    const patchDto: Omit<UpdateSectorDto, 'status'> = {
      ...(dto.name !== undefined && { name: dto.name }),
      ...(dto.description !== undefined && { description: dto.description }),
      ...(dto.icon !== undefined && { icon: dto.icon }),
    };
    const raw = await apiClient.patch<SectorApiResponse>(
      `/sectors/${encodeURIComponent(id)}`,
      patchDto,
    );
    return normalizeSector(raw);
  },

  /**
   * Delete a sector (only if it has no associated documents)
   */
  deleteSector: async (id: string): Promise<DeleteSectorApiResponse> => {
    return apiClient.delete<DeleteSectorApiResponse>(`/sectors/${encodeURIComponent(id)}`);
  },

  /**
   * Toggle sector status between active and inactive
   */
  toggleStatus: async (
    id: string,
  ): Promise<{ id: string; status: SectorStatus; message: string }> => {
    const raw = await apiClient.patch<ToggleStatusApiResponse>(
      `/sectors/${encodeURIComponent(id)}/status`,
    );
    return {
      id: raw.id,
      status: normalizeStatus(raw.status),
      message: raw.message,
    };
  },
};
