import { NextRequest, NextResponse } from 'next/server';
import { randomBytes, createHash } from 'crypto';

// CSRF token configuration
const CSRF_TOKEN_LENGTH = 32;
const CSRF_TOKEN_HEADER = 'X-CSRF-Token';
const CSRF_TOKEN_COOKIE = 'csrf-token';
const CSRF_SECRET_COOKIE = 'csrf-secret';

/**
 * Generate CSRF token and secret
 */
export function generateCSRFToken(): { token: string; secret: string } {
  const secret = randomBytes(CSRF_TOKEN_LENGTH).toString('hex');
  const token = randomBytes(CSRF_TOKEN_LENGTH).toString('hex');
  
  return { token, secret };
}

/**
 * Create CSRF token hash
 */
function createTokenHash(token: string, secret: string): string {
  return createHash('sha256').update(token + secret).digest('hex');
}

/**
 * Verify CSRF token
 */
export function verifyCSRFToken(token: string, secret: string, providedToken: string): boolean {
  if (!token || !secret || !providedToken) {
    return false;
  }
  
  const expectedHash = createTokenHash(token, secret);
  const providedHash = createTokenHash(providedToken, secret);
  
  return expectedHash === providedHash;
}

/**
 * CSRF protection middleware
 */
export function csrfProtection(req: NextRequest): NextResponse | null {
  // Skip CSRF protection for GET, HEAD, OPTIONS requests
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    return null;
  }
  
  // Get CSRF token from header
  const providedToken = req.headers.get(CSRF_TOKEN_HEADER);
  
  // Get CSRF secret from cookie
  const csrfSecret = req.cookies.get(CSRF_SECRET_COOKIE)?.value;
  const csrfToken = req.cookies.get(CSRF_TOKEN_COOKIE)?.value;
  
  if (!providedToken || !csrfSecret || !csrfToken) {
    return NextResponse.json(
      { error: 'CSRF token missing' },
      { status: 403 }
    );
  }
  
  if (!verifyCSRFToken(csrfToken, csrfSecret, providedToken)) {
    return NextResponse.json(
      { error: 'Invalid CSRF token' },
      { status: 403 }
    );
  }
  
  return null; // Continue
}

/**
 * Set CSRF cookies in response
 */
export function setCSRFCookies(response: NextResponse): NextResponse {
  const { token, secret } = generateCSRFToken();
  
  // Set secure cookie options
  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict' as const,
    maxAge: 60 * 60 * 24, // 24 hours
    path: '/'
  };
  
  response.cookies.set(CSRF_TOKEN_COOKIE, token, cookieOptions);
  response.cookies.set(CSRF_SECRET_COOKIE, secret, {
    ...cookieOptions,
    httpOnly: true // Secret should never be accessible to client
  });
  
  // Also set token in header for client access
  response.headers.set(CSRF_TOKEN_HEADER, token);
  
  return response;
}

/**
 * Session management utilities
 */
export interface SessionData {
  userId: string;
  email: string;
  role: string;
  createdAt: number;
  lastActivity: number;
  ipAddress: string;
  userAgent: string;
}

const SESSION_TIMEOUT = 60 * 60 * 1000; // 1 hour
const SESSION_COOKIE = 'session-id';

/**
 * Create secure session
 */
export function createSession(userData: Omit<SessionData, 'createdAt' | 'lastActivity'>): string {
  const sessionId = randomBytes(32).toString('hex');
  const sessionData: SessionData = {
    ...userData,
    createdAt: Date.now(),
    lastActivity: Date.now()
  };
  
  // In a real application, store this in a secure session store (Redis, database, etc.)
  // For now, we'll use a simple in-memory store (not suitable for production)
  sessionStore.set(sessionId, sessionData);
  
  return sessionId;
}

/**
 * Validate session
 */
export function validateSession(sessionId: string, ipAddress: string, userAgent: string): SessionData | null {
  const sessionData = sessionStore.get(sessionId);
  
  if (!sessionData) {
    return null;
  }
  
  // Check if session has expired
  if (Date.now() - sessionData.lastActivity > SESSION_TIMEOUT) {
    sessionStore.delete(sessionId);
    return null;
  }
  
  // Validate IP address and user agent for additional security
  if (sessionData.ipAddress !== ipAddress || sessionData.userAgent !== userAgent) {
    sessionStore.delete(sessionId);
    return null;
  }
  
  // Update last activity
  sessionData.lastActivity = Date.now();
  sessionStore.set(sessionId, sessionData);
  
  return sessionData;
}

/**
 * Destroy session
 */
export function destroySession(sessionId: string): void {
  sessionStore.delete(sessionId);
}

/**
 * Set secure session cookie
 */
export function setSessionCookie(response: NextResponse, sessionId: string): NextResponse {
  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict' as const,
    maxAge: SESSION_TIMEOUT / 1000, // Convert to seconds
    path: '/'
  };
  
  response.cookies.set(SESSION_COOKIE, sessionId, cookieOptions);
  
  return response;
}

/**
 * Clear session cookie
 */
export function clearSessionCookie(response: NextResponse): NextResponse {
  response.cookies.delete(SESSION_COOKIE);
  return response;
}

/**
 * Session middleware
 */
export function sessionMiddleware(req: NextRequest): { session: SessionData | null } {
  const sessionId = req.cookies.get(SESSION_COOKIE)?.value;
  
  if (!sessionId) {
    return { session: null };
  }
  
  const ipAddress = getClientIP(req);
  const userAgent = req.headers.get('user-agent') || '';
  
  const session = validateSession(sessionId, ipAddress, userAgent);
  
  return { session };
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

// Simple in-memory session store (replace with Redis or database in production)
const sessionStore = new Map<string, SessionData>();

/**
 * Clean up expired sessions (should be run periodically)
 */
export function cleanupExpiredSessions(): void {
  const now = Date.now();
  
  for (const [sessionId, sessionData] of sessionStore.entries()) {
    if (now - sessionData.lastActivity > SESSION_TIMEOUT) {
      sessionStore.delete(sessionId);
    }
  }
}

// Run cleanup every 15 minutes
if (typeof window === 'undefined') { // Server-side only
  setInterval(cleanupExpiredSessions, 15 * 60 * 1000);
}

/**
 * Generate secure random string
 */
export function generateSecureRandom(length: number = 32): string {
  return randomBytes(length).toString('hex');
}

/**
 * Hash sensitive data
 */
export function hashData(data: string, salt?: string): string {
  const actualSalt = salt || randomBytes(16).toString('hex');
  return createHash('sha256').update(data + actualSalt).digest('hex');
}

/**
 * Constant-time string comparison to prevent timing attacks
 */
export function constantTimeCompare(a: string, b: string): boolean {
  if (a.length !== b.length) {
    return false;
  }
  
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  
  return result === 0;
}

/**
 * Secure cookie configuration
 */
export const SECURE_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict' as const,
  path: '/',
  maxAge: 60 * 60 * 24 * 7 // 7 days
};

/**
 * Rate limiting for sensitive operations
 */
const sensitiveOperationLimits = new Map<string, { count: number; resetTime: number }>();

export function rateLimitSensitiveOperation(
  identifier: string, 
  maxAttempts: number = 5, 
  windowMs: number = 15 * 60 * 1000 // 15 minutes
): boolean {
  const now = Date.now();
  const key = `sensitive:${identifier}`;
  const current = sensitiveOperationLimits.get(key);
  
  if (!current || now > current.resetTime) {
    sensitiveOperationLimits.set(key, { count: 1, resetTime: now + windowMs });
    return true;
  }
  
  if (current.count >= maxAttempts) {
    return false;
  }
  
  current.count++;
  return true;
}
