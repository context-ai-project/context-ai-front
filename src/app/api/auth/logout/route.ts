import { NextResponse } from 'next/server';

/**
 * Federated logout endpoint
 *
 * Redirects to Auth0's `/v2/logout` so both the local NextAuth session
 * **and** the Auth0 IdP session are terminated.
 *
 * The client must clear the NextAuth cookie (`signOut({ redirect: false })`)
 * before navigating here.
 *
 * Auth0 docs: https://auth0.com/docs/authenticate/login/logout
 */
export function GET(request: Request) {
  const auth0Issuer = process.env.AUTH0_ISSUER; // e.g. https://tenant.auth0.com
  const clientId = process.env.AUTH0_CLIENT_ID;

  if (!auth0Issuer || !clientId) {
    // Fallback: if env vars are missing just redirect to home
    return NextResponse.redirect(new URL('/', request.url));
  }

  // Build the return-to URL (app root) from the incoming request origin
  const origin = new URL(request.url).origin;
  const returnTo = encodeURIComponent(origin);

  const logoutUrl = `${auth0Issuer}/v2/logout?client_id=${clientId}&returnTo=${returnTo}`;

  return NextResponse.redirect(logoutUrl);
}
