'use client';

import { useState } from 'react';
import { signOut } from 'next-auth/react';
import { logError } from '@/lib/api/error-handler';

/**
 * Shared logout hook with error handling and loading state.
 *
 * Performs a **federated logout**:
 * 1. Clears the local NextAuth session (JWT cookie).
 * 2. Redirects to `/api/auth/logout` which terminates the Auth0 IdP
 *    session via Auth0's `/v2/logout` endpoint.
 *
 * This ensures the user is fully signed out from both the app and Auth0,
 * preventing automatic re-login on the next sign-in attempt.
 */
export function useLogout() {
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const logout = async () => {
    try {
      setIsLoggingOut(true);
      // 1. Clear local NextAuth session without redirecting
      await signOut({ redirect: false });
      // 2. Redirect to server route that ends the Auth0 session
      window.location.href = '/api/auth/logout';
    } catch (error: unknown) {
      logError(error, { context: 'logout' });
    } finally {
      setIsLoggingOut(false);
    }
  };

  return { logout, isLoggingOut };
}
