/**
 * Centralized route definitions
 * Single source of truth for all application routes
 */
export const routes = {
  home: (locale: string) => `/${locale}`,
  signIn: (locale: string) => `/${locale}/auth/signin`,
  dashboard: (locale: string) => `/${locale}/dashboard`,
  chat: (locale: string) => `/${locale}/chat`,
  knowledge: (locale: string) => `/${locale}/knowledge`,
  documents: (locale: string) => `/${locale}/documents`,
  profile: (locale: string) => `/${locale}/profile`,
  settings: (locale: string) => `/${locale}/settings`,
} as const;
