import { withMiddlewareAuthRequired } from '@auth0/nextjs-auth0/edge';

/**
 * Middleware to protect routes that require authentication
 * Runs on Edge Runtime for better performance
 *
 * Note: i18n is configured separately via next-intl's configuration
 * without middleware to avoid conflicts with Auth0 edge middleware
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
     * - fonts and images
     */
    '/((?!api/auth|_next/static|_next/image|favicon.ico|robots.txt|manifest.json|.*\\.(?:svg|png|jpg|jpeg|gif|webp|woff|woff2|ttf|otf|eot)$).*)',
  ],
};

