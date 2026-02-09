import { auth } from '@/auth';
import createMiddleware from 'next-intl/middleware';
import { NextResponse } from 'next/server';
import { locales, defaultLocale } from './src/i18n';

/**
 * Combined middleware for i18n (next-intl) and authentication (NextAuth)
 * 
 * Order of execution:
 * 1. i18n middleware handles locale routing
 * 2. Auth middleware protects routes
 */

// Create i18n middleware
const intlMiddleware = createMiddleware({
  locales,
  defaultLocale,
  localePrefix: 'always', // Always show locale in URL
});

// Export combined middleware using NextAuth's auth wrapper
export default auth((req) => {
  // First, run i18n middleware
  const intlResponse = intlMiddleware(req);
  
  // If i18n middleware returned a redirect, return it
  if (intlResponse && intlResponse.status !== 200) {
    return intlResponse;
  }

  const { pathname } = req.nextUrl;

  // Extract locale from pathname (e.g., /en/chat -> en)
  const pathnameLocale = pathname.split('/')[1];
  const locale = locales.includes(pathnameLocale as typeof locales[number]) 
    ? pathnameLocale 
    : defaultLocale;

  // Public routes (without locale prefix for matching)
  const pathnameWithoutLocale = pathname.replace(`/${locale}`, '') || '/';
  const publicRoutes = ['/', '/auth/signin', '/auth/error', '/login', '/callback'];
  
  const isPublicRoute = publicRoutes.some(route => 
    pathnameWithoutLocale === route || pathnameWithoutLocale.startsWith(route)
  );

  if (isPublicRoute) {
    return NextResponse.next();
  }

  // Redirect to signin if not authenticated
  if (!req.auth) {
    const signInUrl = new URL(`/${locale}/auth/signin`, req.url);
    signInUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(signInUrl);
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - robots.txt (robots file)
     * - manifest.json (PWA manifest)
     * - static assets (images, fonts, etc.)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|robots.txt|manifest.json|.*\\.(?:svg|png|jpg|jpeg|gif|webp|woff|woff2|ttf|otf|eot)$).*)',
  ],
};

