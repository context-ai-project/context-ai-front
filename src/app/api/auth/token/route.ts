import { getAccessToken } from '@auth0/nextjs-auth0';
import { NextResponse } from 'next/server';

/**
 * Provide an Auth0 access token for API client authentication.
 *
 * Returns a JSON response containing the `accessToken` when available.
 *
 * @returns A JSON response with `{ accessToken: string }` on success, or `{ error: string }` with HTTP status `401` if no token is available or `500` if an internal error occurs.
 */
export async function GET() {
  try {
    const { accessToken } = await getAccessToken();

    if (!accessToken) {
      return NextResponse.json({ error: 'No access token available' }, { status: 401 });
    }

    return NextResponse.json({ accessToken });
  } catch (error) {
    console.error('Error getting access token:', error);
    return NextResponse.json({ error: 'Failed to get access token' }, { status: 500 });
  }
}