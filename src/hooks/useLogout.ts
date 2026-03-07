'use client';

import { useState } from 'react';
import { signOut } from 'next-auth/react';
import { useLocale } from 'next-intl';
import { logError } from '@/lib/api/error-handler';
import { routes } from '@/lib/routes';

/**
 * Build Auth0 logout URL so the IdP session and consent are cleared.
 * Prevents "Authorize App" on next login when not using incognito.
 */
function getAuth0LogoutUrl(returnTo: string): string | null {
  const domain = process.env.NEXT_PUBLIC_AUTH0_DOMAIN;
  const clientId = process.env.NEXT_PUBLIC_AUTH0_CLIENT_ID;
  if (!domain || !clientId) return null;
  const params = new URLSearchParams({
    client_id: clientId,
    returnTo,
  });
  return `https://${domain}/v2/logout?${params.toString()}`;
}

/**
 * Shared logout hook with error handling and loading state.
 * Clears NextAuth session and redirects to Auth0 logout so the next login
 * shows the Auth0 login/signup screen instead of the consent screen.
 */
export function useLogout() {
  const locale = useLocale();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const logout = async () => {
    try {
      setIsLoggingOut(true);
      const returnTo =
        typeof window !== 'undefined'
          ? window.location.origin + routes.home(locale)
          : routes.home(locale);
      const auth0LogoutUrl = typeof window !== 'undefined' ? getAuth0LogoutUrl(returnTo) : null;

      await signOut({ redirect: false });

      if (auth0LogoutUrl) {
        window.location.href = auth0LogoutUrl;
        return;
      }
      window.location.href = returnTo;
    } catch (error: unknown) {
      logError(error, { context: 'logout' });
      window.location.href = routes.home(locale);
    } finally {
      setIsLoggingOut(false);
    }
  };

  return { logout, isLoggingOut };
}
