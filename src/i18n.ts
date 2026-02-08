/**
 * Supported locales
 */
export const locales = ['en', 'es'] as const;
export type Locale = (typeof locales)[number];

/**
 * Default locale
 */
export const defaultLocale: Locale = 'es';

/**
 * Get messages for a given locale
 */
export async function getMessages(locale: Locale) {
  return (await import(`../messages/${locale}.json`)).default;
}
