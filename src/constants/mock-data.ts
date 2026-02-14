import type { LucideIcon } from 'lucide-react';

/**
 * Mock dashboard statistics for MVP
 * Will be replaced with real API calls in future phases
 *
 * @planned Phase 7 - Analytics Dashboard with real data
 */
export interface DashboardStat {
  titleKey: string;
  value: string;
  changeKey: string;
  icon: LucideIcon;
}

/**
 * Mock stat values for MVP dashboard
 * These are placeholder values and do NOT represent real data
 */
export const MOCK_STAT_VALUES = {
  queries: '1,247',
  documents: '156',
  users: '24',
  accuracy: '92%',
} as const;
