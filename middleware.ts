import { withMiddlewareAuthRequired } from '@auth0/nextjs-auth0/edge';

/**
 * Middleware to protect routes that require authentication
 * Runs on Edge Runtime for better performance
 */
export default withMiddlewareAuthRequired();

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/auth (Auth0 authentication routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - robots.txt (robots file)
     * - manifest.json (PWA manifest)
     * - public folder
     * - fonts (woff, woff2, ttf, otf, eot)
     */
    '/((?!api/auth|_next/static|_next/image|favicon.ico|robots.txt|manifest.json|.*\\.(?:svg|png|jpg|jpeg|gif|webp|woff|woff2|ttf|otf|eot)$).*)',
  ],
};

