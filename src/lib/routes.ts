/**
 * Centralized route definitions
 * Single source of truth for all application routes
 */
export const routes = {
  home: (locale: string) => `/${locale}`,
  signIn: (locale: string) => `/${locale}/auth/signin`,
  dashboard: (locale: string) => `/${locale}/dashboard`,
  chat: (locale: string) => `/${locale}/chat`,
  documents: (locale: string) => `/${locale}/documents`,
  sectors: (locale: string) => `/${locale}/sectors`,
  admin: (locale: string) => `/${locale}/admin`,
  capsules: (locale: string) => `/${locale}/capsules`,
  capsuleDetail: (locale: string, id: string) => `/${locale}/capsules/${id}`,
  capsuleCreate: (locale: string) => `/${locale}/capsules/create`,
  capsuleResume: (locale: string, id: string) => `/${locale}/capsules/${id}/resume`,
} as const;
