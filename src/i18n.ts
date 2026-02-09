import { getRequestConfig } from 'next-intl/server';

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
 * next-intl configuration
 * This function is called by next-intl to get the messages for the current locale
 */
export default getRequestConfig(async ({ requestLocale }) => {
  // Get the actual locale from the request
  let locale = await requestLocale;

  // Validate that the incoming `locale` parameter is valid
  if (!locale || !locales.includes(locale as Locale)) {
    locale = defaultLocale;
  }

  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default,
  };
});
