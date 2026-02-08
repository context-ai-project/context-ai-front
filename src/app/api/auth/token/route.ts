import { getAccessToken } from '@auth0/nextjs-auth0';
import { NextResponse } from 'next/server';

/**
 * Cache control headers to prevent caching of sensitive access tokens
 */
const NO_CACHE_HEADERS = {
  'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
  Pragma: 'no-cache',
  Expires: '0',
};

/**
 * API route to get Auth0 access token
 * Used by the API client to authenticate requests
 *
 * Returns access token with no-cache headers to ensure fresh tokens
 */
export async function GET() {
  try {
    const { accessToken } = await getAccessToken();

    if (!accessToken) {
      return NextResponse.json(
        { error: 'No access token available' },
        { status: 401, headers: NO_CACHE_HEADERS },
      );
    }

    return NextResponse.json({ accessToken }, { headers: NO_CACHE_HEADERS });
  } catch (error) {
    console.error('Error getting access token:', error);
    return NextResponse.json(
      { error: 'Failed to get access token' },
      { status: 500, headers: NO_CACHE_HEADERS },
    );
  }
}
