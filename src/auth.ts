import NextAuth from 'next-auth';
import Auth0Provider from 'next-auth/providers/auth0';
import { syncUserWithBackend, extractProfileData } from '@/lib/auth/sync-user';

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
      // Persist the OAuth access_token and id_token right after signin
      if (account) {
        token.accessToken = account.access_token;
        token.idToken = account.id_token;
      }

      // Persist profile data and sync with backend
      if (profile) {
        Object.assign(token, extractProfileData(profile));

        if (account) {
          token.userId = (await syncUserWithBackend(profile)) ?? undefined;
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
