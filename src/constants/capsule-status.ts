import type { CapsuleStatus } from '@/lib/api/capsule.api';

/**
 * Centralized capsule status groupings (CS-10).
 *
 * Eliminates scattered string literals across components and stores.
 */

export const RESUMABLE_STATUSES = new Set<CapsuleStatus>(['DRAFT', 'FAILED']);
export const PUBLISHABLE_STATUSES = new Set<CapsuleStatus>(['COMPLETED']);
export const ARCHIVABLE_STATUSES = new Set<CapsuleStatus>(['ACTIVE', 'COMPLETED']);
export const TERMINAL_STATUSES = new Set<CapsuleStatus>(['COMPLETED', 'ACTIVE', 'ARCHIVED']);
export const GENERATION_STATUSES = new Set<CapsuleStatus>(['GENERATING_ASSETS', 'RENDERING']);

export const isResumable = (s: CapsuleStatus): boolean => RESUMABLE_STATUSES.has(s);
export const isPublishable = (s: CapsuleStatus): boolean => PUBLISHABLE_STATUSES.has(s);
export const isArchivable = (s: CapsuleStatus): boolean => ARCHIVABLE_STATUSES.has(s);
export const isTerminal = (s: CapsuleStatus): boolean => TERMINAL_STATUSES.has(s);
export const isGenerating = (s: CapsuleStatus): boolean => GENERATION_STATUSES.has(s);
