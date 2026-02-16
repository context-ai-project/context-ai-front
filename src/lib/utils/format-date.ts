/**
 * Locale-aware date formatting utility.
 *
 * Replaces the duplicate `formatDate` / `formatDisplayDate` functions
 * in DocumentsView and DocumentDetailDialog that hardcoded 'en-US' (CS-05 + CS-10).
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
