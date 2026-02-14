'use client';

import { useState } from 'react';
import { signOut } from 'next-auth/react';
import { useLocale } from 'next-intl';
import { logError } from '@/lib/api/error-handler';
import { routes } from '@/lib/routes';

/**
 * Shared logout hook with error handling and loading state
 * Ensures consistent logout behavior across the application
 */
export function useLogout() {
  const locale = useLocale();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const logout = async () => {
    try {
      setIsLoggingOut(true);
      await signOut({ callbackUrl: routes.home(locale) });
    } catch (error: unknown) {
      logError(error, { context: 'logout' });
    } finally {
      setIsLoggingOut(false);
    }
  };

  return { logout, isLoggingOut };
}
