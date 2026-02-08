import { auth } from '@/auth';
import { NextResponse } from 'next/server';

/**
 * Middleware to protect routes that require authentication using NextAuth.js v5
 * Compatible with Next.js 16 and runs on Edge Runtime for better performance
 *
 * Note: i18n is configured separately via next-intl's configuration
 */
export default auth((req) => {
  const { pathname } = req.nextUrl;

  // Allow public routes
  const publicRoutes = ['/', '/auth/signin', '/auth/error'];
  if (publicRoutes.includes(pathname)) {
    return NextResponse.next();
  }

  // Redirect to signin if not authenticated
  if (!req.auth) {
    const signInUrl = new URL('/auth/signin', req.url);
    signInUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(signInUrl);
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/auth (NextAuth authentication routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - robots.txt (robots file)
     * - manifest.json (PWA manifest)
     * - public folder
     * - fonts and images
     */
    '/((?!api/auth|_next/static|_next/image|favicon.ico|robots.txt|manifest.json|.*\\.(?:svg|png|jpg|jpeg|gif|webp|woff|woff2|ttf|otf|eot)$).*)',
  ],
};

