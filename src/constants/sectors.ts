/**
 * Centralized sector definitions
 * Single source of truth for all sector IDs and names
 *
 * Temporary hardcoded sectors for MVP — will come from API in future phases
 */
export const SECTORS = [
  { id: '440e8400-e29b-41d4-a716-446655440000', name: 'Human Resources' },
  { id: '440e8400-e29b-41d4-a716-446655440001', name: 'Engineering' },
  { id: '440e8400-e29b-41d4-a716-446655440002', name: 'Sales' },
] as const;

/** Default sector ID (first sector in the list) */
export const DEFAULT_SECTOR_ID = SECTORS[0].id;

/** Type for sector IDs */
export type SectorId = (typeof SECTORS)[number]['id'];
