import NextAuth from 'next-auth';
import Auth0Provider from 'next-auth/providers/auth0';

/**
 * NextAuth.js v5 configuration with Auth0 provider
 *
 * Environment variables required:
 * - AUTH0_CLIENT_ID
 * - AUTH0_CLIENT_SECRET
 * - AUTH0_ISSUER (e.g., https://your-tenant.auth0.com)
 * - NEXTAUTH_SECRET
 */
export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Auth0Provider({
      clientId: process.env.AUTH0_CLIENT_ID!,
      clientSecret: process.env.AUTH0_CLIENT_SECRET!,
      issuer: process.env.AUTH0_ISSUER!,
      authorization: {
        params: {
          scope: 'openid profile email',
          audience: process.env.AUTH0_AUDIENCE,
        },
      },
    }),
  ],
  callbacks: {
    async jwt({ token, account, profile }) {
      // Persist the OAuth access_token and user ID to the token right after signin
      if (account) {
        token.accessToken = account.access_token;
        token.idToken = account.id_token;
      }
      if (profile) {
        token.picture = profile.picture;
        token.sub = profile.sub ?? undefined; // Auth0 user ID (e.g., "auth0|123456")
        token.email = profile.email ?? undefined;
        token.name = profile.name ?? undefined;

        // Sync user with backend on first sign-in to get internal UUID
        if (account && profile.sub && profile.email && profile.name) {
          try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';
            const syncUrl = `${apiUrl}/users/sync`;

            console.warn('[NextAuth] Syncing user with backend:', {
              url: syncUrl,
              auth0UserId: profile.sub,
              email: profile.email,
            });

            const internalApiKey = process.env.INTERNAL_API_KEY;
            if (!internalApiKey) {
              console.error('[NextAuth] INTERNAL_API_KEY is not configured - cannot sync user');
            }

            const response = await fetch(syncUrl, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'X-Internal-API-Key': internalApiKey || '',
              },
              body: JSON.stringify({
                auth0UserId: profile.sub,
                email: profile.email,
                name: profile.name,
              }),
            });

            if (response.ok) {
              const userData = await response.json();
              token.userId = userData.id; // Store internal UUID
              console.warn('[NextAuth] User synced successfully:', { userId: userData.id });
            } else {
              const errorText = await response.text();
              console.error('[NextAuth] Failed to sync user:', {
                status: response.status,
                statusText: response.statusText,
                error: errorText,
              });
            }
          } catch (error) {
            console.error('[NextAuth] Error syncing user:', error);
          }
        }
      }
      return token;
    },
    async session({ session, token }) {
      // Send properties to the client, including user ID
      session.accessToken = token.accessToken as string;
      session.user.image = token.picture as string;
      session.user.id = token.userId as string; // Internal UUID from backend

      // If userId is not available, log warning
      if (!token.userId) {
        console.warn('[NextAuth] Session created without userId - user sync may have failed');
      }

      return session;
    },
  },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },
  session: {
    strategy: 'jwt',
  },
});
