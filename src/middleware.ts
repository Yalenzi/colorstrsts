import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// قائمة IP المحظورة
const BLOCKED_IPS = new Set([
  // أضف IP المشبوهة هنا
]);

// قائمة User Agents المشبوهة
const SUSPICIOUS_USER_AGENTS = [
  'bot', 'crawler', 'spider', 'scraper', 'hack', 'scan'
];

// حدود معدل الطلبات
const RATE_LIMITS = new Map<string, { count: number; resetTime: number }>();

export function middleware(request: NextRequest) {
  const ip = request.ip || request.headers.get('x-forwarded-for') || 'unknown';
  const userAgent = request.headers.get('user-agent') || '';
  const url = request.nextUrl.pathname;

  // 1. فحص IP محظور
  if (BLOCKED_IPS.has(ip)) {
    console.warn(`🚫 Blocked IP attempted access: ${ip}`);
    return new NextResponse('Access Denied', { status: 403 });
  }

  // 2. فحص User Agent مشبوه
  if (SUSPICIOUS_USER_AGENTS.some(agent => 
    userAgent.toLowerCase().includes(agent)
  )) {
    console.warn(`🚫 Suspicious User Agent: ${userAgent} from ${ip}`);
    return new NextResponse('Access Denied', { status: 403 });
  }

  // 3. حماية صفحات الإدارة
  if (url.startsWith('/admin') || url.includes('/admin/')) {
    // فحص إضافي للإدارة
    const referer = request.headers.get('referer');
    if (!referer || !referer.includes(request.nextUrl.origin)) {
      console.warn(`🚫 Direct admin access attempt from ${ip}`);
      return NextResponse.redirect(new URL('/', request.url));
    }
  }

  // 4. حماية API routes
  if (url.startsWith('/api/')) {
    // فحص معدل الطلبات
    const now = Date.now();
    const key = `${ip}-api`;
    const current = RATE_LIMITS.get(key);
    
    if (!current || now > current.resetTime) {
      RATE_LIMITS.set(key, { count: 1, resetTime: now + 60000 });
    } else if (current.count >= 50) { // 50 طلب/دقيقة للAPI
      console.warn(`🚫 API Rate limit exceeded for ${ip}`);
      return new NextResponse('Rate Limit Exceeded', { status: 429 });
    } else {
      current.count++;
    }

    // فحص Content-Type للطلبات POST
    if (request.method === 'POST') {
      const contentType = request.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        return new NextResponse('Invalid Content-Type', { status: 400 });
      }
    }
  }

  // 5. حماية ضد SQL Injection في URL
  const suspiciousPatterns = [
    'union', 'select', 'insert', 'delete', 'drop', 'exec',
    'script', 'javascript:', 'vbscript:', 'onload', 'onerror'
  ];
  
  const urlLower = url.toLowerCase();
  if (suspiciousPatterns.some(pattern => urlLower.includes(pattern))) {
    console.warn(`🚫 Suspicious URL pattern detected: ${url} from ${ip}`);
    return new NextResponse('Invalid Request', { status: 400 });
  }

  // 6. إضافة headers أمنية
  const response = NextResponse.next();
  
  response.headers.set('X-Frame-Options', 'SAMEORIGIN');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  response.headers.set('Cross-Origin-Opener-Policy', 'same-origin');
  response.headers.set('Cross-Origin-Resource-Policy', 'same-origin');

  // CSP Header - Updated to include all Firebase services
  response.headers.set(
    'Content-Security-Policy',
    "default-src 'self'; " +
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.gstatic.com https://www.googleapis.com https://accounts.google.com; " +
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; " +
    "img-src 'self' data: https: blob:; " +
    "font-src 'self' data: https://fonts.gstatic.com; " +
    "connect-src 'self' " +
      "https://api.stcpay.com.sa " +
      "https://*.firebaseio.com " +
      "https://*.googleapis.com " +
      "https://*.firebaseapp.com " +
      "https://firebaseinstallations.googleapis.com " +
      "https://firebaseremoteconfig.googleapis.com " +
      "https://firebase.googleapis.com " +
      "https://identitytoolkit.googleapis.com " +
      "https://securetoken.googleapis.com " +
      "https://www.googleapis.com " +
      "wss://*.firebaseio.com;"
  );

  return response;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};