import { z } from 'zod';

/** Schema for validating the /users/sync API response */
const userSyncResponseSchema = z.object({
  id: z.string().uuid(),
  roles: z.array(z.string()).default([]),
});

export interface SyncResult {
  id: string;
  roles: string[];
}

interface UserSyncProfile {
  sub?: string | null;
  email?: string | null;
  name?: string | null;
}

/**
 * Sync user with backend on first sign-in to get internal UUID
 *
 * @param profile - User profile from Auth0
 * @returns The internal user UUID from backend, or null if sync fails
 */
export async function syncUserWithBackend(profile: UserSyncProfile): Promise<SyncResult | null> {
  if (!profile.sub || !profile.email || !profile.name) {
    return null;
  }

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';
  const syncUrl = `${apiUrl}/users/sync`;

  const internalApiKey = process.env.INTERNAL_API_KEY;
  if (!internalApiKey) {
    console.error('[NextAuth] INTERNAL_API_KEY is not configured — cannot sync user');
    return null;
  }

  try {
    console.warn('[NextAuth] Syncing user with backend:', {
      url: syncUrl,
      auth0UserId: profile.sub,
    });

    const response = await fetch(syncUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Internal-API-Key': internalApiKey,
      },
      body: JSON.stringify({
        auth0UserId: profile.sub,
        email: profile.email,
        name: profile.name,
      }),
    });

    if (response.ok) {
      const rawData: unknown = await response.json();
      const parsed = userSyncResponseSchema.safeParse(rawData);

      if (parsed.success) {
        console.warn('[NextAuth] User synced successfully:', {
          userId: parsed.data.id,
          roles: parsed.data.roles,
        });
        return { id: parsed.data.id, roles: parsed.data.roles };
      }

      console.error('[NextAuth] Invalid /users/sync response:', parsed.error.format());
      return null;
    }

    const errorText = await response.text();
    console.error('[NextAuth] Failed to sync user:', {
      status: response.status,
      statusText: response.statusText,
      error: errorText,
    });
    return null;
  } catch (error) {
    console.error('[NextAuth] Error syncing user:', error);
    return null;
  }
}

/**
 * Extract profile data from Auth0 profile to persist in JWT token
 */
export function extractProfileData(profile: {
  picture?: string;
  sub?: string | null;
  email?: string | null;
  name?: string | null;
}) {
  return {
    picture: profile.picture,
    sub: profile.sub ?? undefined,
    email: profile.email ?? undefined,
    name: profile.name ?? undefined,
  };
}
