import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/firebase';
import { getUserProfile, hasPermission, UserRole } from './auth';
import { sanitizeObject } from './sanitization';
import rateLimit from 'express-rate-limit';
import { LRUCache } from 'lru-cache';

// Rate limiting configuration
const rateLimitCache = new LRUCache<string, number>({
  max: 1000,
  ttl: 60 * 1000 // 1 minute
});

interface RateLimitConfig {
  windowMs: number;
  max: number;
  message: string;
}

const RATE_LIMITS: Record<string, RateLimitConfig> = {
  auth: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // 5 attempts per window
    message: 'Too many authentication attempts'
  },
  api: {
    windowMs: 60 * 1000, // 1 minute
    max: 100, // 100 requests per minute
    message: 'Too many API requests'
  },
  upload: {
    windowMs: 60 * 1000, // 1 minute
    max: 10, // 10 uploads per minute
    message: 'Too many upload attempts'
  },
  admin: {
    windowMs: 60 * 1000, // 1 minute
    max: 50, // 50 admin requests per minute
    message: 'Too many admin requests'
  }
};

/**
 * Rate limiting middleware
 */
export function createRateLimit(type: keyof typeof RATE_LIMITS) {
  const config = RATE_LIMITS[type];
  
  return (req: NextRequest): NextResponse | null => {
    const ip = getClientIP(req);
    const key = `${type}:${ip}`;
    const now = Date.now();
    
    // Get current count for this IP
    const current = rateLimitCache.get(key) || 0;
    
    if (current >= config.max) {
      return NextResponse.json(
        { error: config.message },
        { status: 429 }
      );
    }
    
    // Increment counter
    rateLimitCache.set(key, current + 1);
    
    return null; // Continue to next middleware
  };
}

/**
 * Authentication middleware
 */
export async function requireAuth(req: NextRequest): Promise<NextResponse | { user: any }> {
  try {
    const authHeader = req.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    
    // Verify Firebase token
    const decodedToken = await auth.verifyIdToken(token);
    
    if (!decodedToken) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }

    // Get user profile
    const userProfile = await getUserProfile(decodedToken.uid);
    
    if (!userProfile || !userProfile.isActive) {
      return NextResponse.json(
        { error: 'User account is inactive' },
        { status: 403 }
      );
    }

    return { user: userProfile };
  } catch (error) {
    console.error('Authentication error:', error);
    return NextResponse.json(
      { error: 'Authentication failed' },
      { status: 401 }
    );
  }
}

/**
 * Authorization middleware
 */
export function requirePermission(permission: string) {
  return async (req: NextRequest, user: any): Promise<NextResponse | null> => {
    if (!hasPermission(user.role, permission)) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      );
    }
    
    return null; // Continue
  };
}

/**
 * Admin-only middleware
 */
export async function requireAdmin(req: NextRequest, user: any): Promise<NextResponse | null> {
  if (user.role !== UserRole.ADMIN && user.role !== UserRole.SUPER_ADMIN) {
    return NextResponse.json(
      { error: 'Admin access required' },
      { status: 403 }
    );
  }
  
  return null;
}

/**
 * Input validation middleware
 */
export function validateInput(schema: any) {
  return async (req: NextRequest): Promise<NextResponse | { data: any }> => {
    try {
      const body = await req.json();
      
      // Sanitize input
      const sanitized = sanitizeObject(body, {
        email: 'email',
        displayName: 'text',
        description: 'text',
        description_ar: 'arabic',
        method_name: 'text',
        method_name_ar: 'arabic',
        color_hex: 'color',
        photoURL: 'url'
      });
      
      // Validate with schema
      const validationResult = schema.safeParse(sanitized);
      
      if (!validationResult.success) {
        return NextResponse.json(
          { 
            error: 'Validation failed',
            details: validationResult.error.errors
          },
          { status: 400 }
        );
      }
      
      return { data: validationResult.data };
    } catch (error) {
      return NextResponse.json(
        { error: 'Invalid JSON data' },
        { status: 400 }
      );
    }
  };
}

/**
 * CORS middleware
 */
export function corsMiddleware(req: NextRequest): NextResponse {
  const origin = req.headers.get('origin');
  const allowedOrigins = [
    'https://colorstest.com',
    'https://www.colorstest.com',
    process.env.NODE_ENV === 'development' ? 'http://localhost:3000' : null
  ].filter(Boolean);

  const response = NextResponse.next();

  // Check if origin is allowed
  if (origin && allowedOrigins.includes(origin)) {
    response.headers.set('Access-Control-Allow-Origin', origin);
  }

  response.headers.set('Access-Control-Allow-Credentials', 'true');
  response.headers.set(
    'Access-Control-Allow-Methods',
    'GET, POST, PUT, DELETE, OPTIONS'
  );
  response.headers.set(
    'Access-Control-Allow-Headers',
    'Content-Type, Authorization, X-Requested-With'
  );

  return response;
}

/**
 * Security headers middleware
 */
export function securityHeaders(response: NextResponse): NextResponse {
  // Content Security Policy
  response.headers.set(
    'Content-Security-Policy',
    "default-src 'self'; " +
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.gstatic.com https://www.googleapis.com; " +
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; " +
    "font-src 'self' https://fonts.gstatic.com; " +
    "img-src 'self' data: https: blob:; " +
    "connect-src 'self' https://firestore.googleapis.com https://identitytoolkit.googleapis.com; " +
    "frame-ancestors 'none';"
  );

  // Other security headers
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  
  if (process.env.NODE_ENV === 'production') {
    response.headers.set(
      'Strict-Transport-Security',
      'max-age=31536000; includeSubDomains; preload'
    );
  }

  return response;
}

/**
 * Request logging middleware
 */
export function logRequest(req: NextRequest): void {
  const ip = getClientIP(req);
  const userAgent = req.headers.get('user-agent') || 'Unknown';
  const method = req.method;
  const url = req.url;
  const timestamp = new Date().toISOString();

  // Log request (in production, send to logging service)
  console.log(`[${timestamp}] ${method} ${url} - IP: ${ip} - UA: ${userAgent}`);
  
  // Log suspicious patterns
  if (isSuspiciousRequest(req)) {
    console.warn(`[SECURITY] Suspicious request detected: ${method} ${url} - IP: ${ip}`);
  }
}

/**
 * Detect suspicious request patterns
 */
function isSuspiciousRequest(req: NextRequest): boolean {
  const url = req.url.toLowerCase();
  const userAgent = req.headers.get('user-agent')?.toLowerCase() || '';
  
  // Check for common attack patterns
  const suspiciousPatterns = [
    '/admin', '/wp-admin', '/phpmyadmin',
    '.php', '.asp', '.jsp',
    'script', 'eval', 'javascript:',
    'union', 'select', 'drop', 'insert',
    '../', '..\\', '%2e%2e',
    '<script', '</script>',
    'cmd.exe', '/bin/bash'
  ];
  
  // Check for bot user agents
  const botPatterns = [
    'bot', 'crawler', 'spider', 'scraper',
    'curl', 'wget', 'python', 'java'
  ];
  
  return suspiciousPatterns.some(pattern => url.includes(pattern)) ||
         botPatterns.some(pattern => userAgent.includes(pattern));
}

/**
 * Get client IP address
 */
function getClientIP(req: NextRequest): string {
  const forwarded = req.headers.get('x-forwarded-for');
  const realIP = req.headers.get('x-real-ip');
  
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  
  if (realIP) {
    return realIP;
  }
  
  return req.ip || 'unknown';
}

/**
 * Compose multiple middleware functions
 */
export function composeMiddleware(...middlewares: Array<(req: NextRequest) => Promise<NextResponse | any> | NextResponse | any>) {
  return async (req: NextRequest): Promise<NextResponse> => {
    let context: any = {};
    
    for (const middleware of middlewares) {
      const result = await middleware(req);
      
      if (result instanceof NextResponse) {
        return result; // Early return if middleware returns response
      }
      
      if (result && typeof result === 'object') {
        context = { ...context, ...result };
      }
    }
    
    // If no middleware returned a response, continue
    return NextResponse.next();
  };
}

/**
 * API route wrapper with security middleware
 */
export function secureApiRoute(
  handler: (req: NextRequest, context: any) => Promise<NextResponse>,
  options: {
    requireAuth?: boolean;
    requireAdmin?: boolean;
    permission?: string;
    rateLimit?: keyof typeof RATE_LIMITS;
    validateInput?: any;
  } = {}
) {
  return async (req: NextRequest): Promise<NextResponse> => {
    try {
      // Log request
      logRequest(req);
      
      // Apply rate limiting
      if (options.rateLimit) {
        const rateLimitResult = createRateLimit(options.rateLimit)(req);
        if (rateLimitResult) return rateLimitResult;
      }
      
      // Apply CORS
      if (req.method === 'OPTIONS') {
        return corsMiddleware(req);
      }
      
      let context: any = {};
      
      // Validate input
      if (options.validateInput && (req.method === 'POST' || req.method === 'PUT')) {
        const validationResult = await validateInput(options.validateInput)(req);
        if (validationResult instanceof NextResponse) return validationResult;
        context = { ...context, ...validationResult };
      }
      
      // Require authentication
      if (options.requireAuth) {
        const authResult = await requireAuth(req);
        if (authResult instanceof NextResponse) return authResult;
        context = { ...context, ...authResult };
      }
      
      // Check permissions
      if (options.permission && context.user) {
        const permissionResult = await requirePermission(options.permission)(req, context.user);
        if (permissionResult) return permissionResult;
      }
      
      // Require admin
      if (options.requireAdmin && context.user) {
        const adminResult = await requireAdmin(req, context.user);
        if (adminResult) return adminResult;
      }
      
      // Call the actual handler
      const response = await handler(req, context);
      
      // Apply security headers
      return securityHeaders(response);
    } catch (error) {
      console.error('API route error:', error);
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      );
    }
  };
}
