/**
 * Sector types for the sector management module
 *
 * Sectors are isolated knowledge bases for each department.
 * Only admin users can manage sectors (CRUD).
 */

/** Available icon identifiers for sectors */
export const SECTOR_ICONS = [
  'code',
  'users',
  'trending-up',
  'layout',
  'heart',
  'briefcase',
  'building',
  'globe',
  'shield',
  'lightbulb',
  'book',
  'megaphone',
] as const;

export type SectorIcon = (typeof SECTOR_ICONS)[number];

/** Sector status */
export type SectorStatus = 'active' | 'inactive';

/** Sector entity */
export interface Sector {
  id: string;
  name: string;
  description: string;
  icon: SectorIcon;
  status: SectorStatus;
  documentCount: number;
  createdAt: string;
  updatedAt: string;
}

/** DTO for creating a sector */
export interface CreateSectorDto {
  name: string;
  description: string;
  icon: SectorIcon;
}

/** DTO for updating a sector */
export interface UpdateSectorDto {
  name?: string;
  description?: string;
  icon?: SectorIcon;
  status?: SectorStatus;
}
