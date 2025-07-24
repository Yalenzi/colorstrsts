import { NextRequest, NextResponse } from 'next/server';

// Supported languages
const locales = ['en', 'ar'];
const defaultLocale = 'en'; // Changed from 'ar' to 'en'

// CRITICAL SECURITY: Admin email whitelist
const ADMIN_EMAILS = [
  'aburakan4551@gmail.com',
  'admin@colorstest.com',
  // Add more admin emails here
];

// Admin routes that require protection
const ADMIN_ROUTES = [
  '/ar/admin',
  '/en/admin',
  '/admin'
];

// Get the preferred locale from the request
function getLocale(request: NextRequest): string {
  // Check if there's a locale in the pathname
  const pathname = request.nextUrl.pathname;
  const pathnameHasLocale = locales.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  );

  if (pathnameHasLocale) {
    return pathname.split('/')[1];
  }

  // Check Accept-Language header
  const acceptLanguage = request.headers.get('accept-language');
  if (acceptLanguage) {
    const preferredLocale = acceptLanguage
      .split(',')
      .map(lang => lang.split(';')[0].trim())
      .find(lang => {
        // Check for exact match
        if (locales.includes(lang)) return true;
        // Check for language code only (e.g., 'ar' from 'ar-SA')
        const langCode = lang.split('-')[0];
        return locales.includes(langCode);
      });

    if (preferredLocale) {
      const langCode = preferredLocale.split('-')[0];
      return locales.includes(langCode) ? langCode : defaultLocale;
    }
  }

  return defaultLocale;
}

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Skip middleware for static files and API routes
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/static') ||
    pathname.includes('.') ||
    pathname.startsWith('/favicon') ||
    pathname.startsWith('/icon') ||
    pathname.startsWith('/apple-touch-icon') ||
    pathname.startsWith('/manifest') ||
    pathname.startsWith('/robots') ||
    pathname.startsWith('/browserconfig')
  ) {
    return NextResponse.next();
  }

  // CRITICAL SECURITY: Check admin routes
  const isAdminRoute = ADMIN_ROUTES.some(route =>
    pathname.startsWith(route) || pathname.includes('/admin/')
  );

  if (isAdminRoute) {
    // Log security attempt
    console.warn(`[SECURITY] Admin route access attempt: ${pathname} from IP: ${getClientIP(request)}`);

    // Block all admin access at middleware level
    const loginUrl = new URL('/en/auth/login', request.url);
    loginUrl.searchParams.set('redirect', 'admin');
    loginUrl.searchParams.set('error', 'admin_auth_required');

    return NextResponse.redirect(loginUrl);
  }

  // Check if pathname already has a locale
  const pathnameHasLocale = locales.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  );

  if (!pathnameHasLocale) {
    // Redirect to the default locale (English)
    const locale = getLocale(request);
    const newUrl = new URL(`/${locale}${pathname}`, request.url);
    return NextResponse.redirect(newUrl);
  }

  // Add security headers to all responses
  const response = NextResponse.next();

  // Security headers
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('X-XSS-Protection', '1; mode=block');

  return response;
}

// Helper function to get client IP
function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const realIP = request.headers.get('x-real-ip');

  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }

  if (realIP) {
    return realIP;
  }

  return request.ip || 'unknown';
}

export const config = {
  matcher: [
    // Skip all internal paths (_next)
    '/((?!_next|api|favicon|icon|apple-touch-icon|manifest|robots|browserconfig|.*\\.).*)',
  ],
};
