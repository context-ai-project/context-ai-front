import 'next-auth';
import 'next-auth/jwt';

declare module 'next-auth' {
  /**
   * Returned by `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
   */
  interface Session {
    accessToken?: string;
    user: {
      id: string; // Auth0 user ID (sub)
      name?: string | null;
      email?: string | null;
      image?: string | null;
      roles?: string[]; // Auth0 custom claims — roles assigned to the user
      isActive?: boolean; // Whether the user account is active in the backend
    };
  }

  interface User {
    id: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
    roles?: string[];
    isActive?: boolean;
  }
}

declare module 'next-auth/jwt' {
  /** Returned by the `jwt` callback and `getToken`, when using JWT sessions */
  interface JWT {
    accessToken?: string;
    idToken?: string;
    picture?: string;
    sub?: string; // Auth0 user ID (e.g., "auth0|123456")
    userId?: string; // Internal UUID from backend
    email?: string;
    name?: string;
    roles?: string[];
    isActive?: boolean; // Whether the user account is active in the backend
  }
}
