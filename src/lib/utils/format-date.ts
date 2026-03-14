/**
 * Locale-aware date formatting utility.
 *
 * Centralizes all date display formatting across the app (CS-09).
 *
 * @param dateStr  - ISO date string to format
 * @param locale   - Active locale code ('en' | 'es'). Defaults to 'en'.
 * @returns Formatted date string (e.g. "Feb 15, 2026" or "15 feb 2026")
 */

/** Locale code → BCP 47 locale tag */
const LOCALE_MAP: Record<string, string> = {
  en: 'en-US',
  es: 'es-ES',
};

export function formatDate(dateStr: string, locale = 'en'): string {
  const bcp47 = LOCALE_MAP[locale] ?? 'en-US';
  return new Date(dateStr).toLocaleDateString(bcp47, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

/**
 * Format a date with time (for chat timestamps, etc.)
 *
 * @param dateStr - ISO date string
 * @param locale  - Locale code. Defaults to 'en'.
 * @returns e.g. "Feb 15, 14:30" or "15 feb, 14:30"
 */
export function formatDateTime(dateStr: string, locale = 'en'): string {
  const bcp47 = LOCALE_MAP[locale] ?? 'en-US';
  return new Date(dateStr).toLocaleDateString(bcp47, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
}
