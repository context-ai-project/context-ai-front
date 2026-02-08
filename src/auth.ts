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
      }
      return token;
    },
    async session({ session, token }) {
      // Send properties to the client, including user ID
      session.accessToken = token.accessToken as string;
      session.user.image = token.picture as string;
      session.user.id = token.sub as string; // Auth0 user ID
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
