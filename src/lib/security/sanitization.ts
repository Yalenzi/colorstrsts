import DOMPurify from 'dompurify';
import { JSDOM } from 'jsdom';

// Create a DOMPurify instance for server-side use
const window = new JSDOM('').window;
const purify = DOMPurify(window as any);

/**
 * Sanitize HTML content to prevent XSS attacks
 */
export function sanitizeHtml(dirty: string): string {
  if (!dirty || typeof dirty !== 'string') {
    return '';
  }

  return purify.sanitize(dirty, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'p', 'br', 'ul', 'ol', 'li'],
    ALLOWED_ATTR: [],
    KEEP_CONTENT: true,
    RETURN_DOM: false,
    RETURN_DOM_FRAGMENT: false,
    RETURN_DOM_IMPORT: false
  });
}

/**
 * Sanitize plain text input by removing potentially dangerous characters
 */
export function sanitizeText(input: string): string {
  if (!input || typeof input !== 'string') {
    return '';
  }

  return input
    .trim()
    .replace(/[<>\"'&]/g, '') // Remove HTML/XML special characters
    .replace(/[\x00-\x1F\x7F]/g, '') // Remove control characters
    .replace(/\s+/g, ' ') // Normalize whitespace
    .substring(0, 1000); // Limit length
}

/**
 * Sanitize Arabic text input
 */
export function sanitizeArabicText(input: string): string {
  if (!input || typeof input !== 'string') {
    return '';
  }

  return input
    .trim()
    .replace(/[<>\"'&]/g, '') // Remove HTML/XML special characters
    .replace(/[\x00-\x1F\x7F]/g, '') // Remove control characters
    .replace(/[^\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF\s\d.,!?()-]/g, '') // Keep only Arabic characters, numbers, and basic punctuation
    .replace(/\s+/g, ' ') // Normalize whitespace
    .substring(0, 1000); // Limit length
}

/**
 * Sanitize email input
 */
export function sanitizeEmail(email: string): string {
  if (!email || typeof email !== 'string') {
    return '';
  }

  return email
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9@._-]/g, '') // Keep only valid email characters
    .substring(0, 100); // Limit length
}

/**
 * Sanitize URL input
 */
export function sanitizeUrl(url: string): string {
  if (!url || typeof url !== 'string') {
    return '';
  }

  // Only allow HTTP and HTTPS URLs
  const urlPattern = /^https?:\/\/([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/;
  
  if (!urlPattern.test(url)) {
    return '';
  }

  return url.trim().substring(0, 500);
}

/**
 * Sanitize file name
 */
export function sanitizeFileName(fileName: string): string {
  if (!fileName || typeof fileName !== 'string') {
    return '';
  }

  return fileName
    .trim()
    .replace(/[^a-zA-Z0-9._-]/g, '') // Keep only safe characters
    .replace(/\.{2,}/g, '.') // Prevent directory traversal
    .replace(/^\.+/, '') // Remove leading dots
    .substring(0, 255); // Limit length
}

/**
 * Sanitize search query
 */
export function sanitizeSearchQuery(query: string): string {
  if (!query || typeof query !== 'string') {
    return '';
  }

  return query
    .trim()
    .replace(/[<>\"'&]/g, '') // Remove HTML/XML special characters
    .replace(/[\x00-\x1F\x7F]/g, '') // Remove control characters
    .replace(/[%_\\]/g, '') // Remove SQL wildcard characters
    .substring(0, 100); // Limit length
}

/**
 * Sanitize hex color code
 */
export function sanitizeHexColor(color: string): string {
  if (!color || typeof color !== 'string') {
    return '#000000';
  }

  const hexPattern = /^#[0-9A-Fa-f]{6}$/;
  const sanitized = color.trim().toUpperCase();

  if (!hexPattern.test(sanitized)) {
    return '#000000';
  }

  return sanitized;
}

/**
 * Sanitize numeric input
 */
export function sanitizeNumber(input: string | number, min: number = 0, max: number = Number.MAX_SAFE_INTEGER): number {
  let num: number;

  if (typeof input === 'string') {
    num = parseFloat(input.replace(/[^0-9.-]/g, ''));
  } else {
    num = input;
  }

  if (isNaN(num) || !isFinite(num)) {
    return min;
  }

  return Math.max(min, Math.min(max, num));
}

/**
 * Sanitize boolean input
 */
export function sanitizeBoolean(input: any): boolean {
  if (typeof input === 'boolean') {
    return input;
  }

  if (typeof input === 'string') {
    return input.toLowerCase() === 'true';
  }

  return false;
}

/**
 * Sanitize object by applying appropriate sanitization to each property
 */
export function sanitizeObject(obj: any, schema: Record<string, 'text' | 'arabic' | 'email' | 'url' | 'html' | 'number' | 'boolean' | 'color'>): any {
  if (!obj || typeof obj !== 'object') {
    return {};
  }

  const sanitized: any = {};

  for (const [key, type] of Object.entries(schema)) {
    if (obj.hasOwnProperty(key)) {
      switch (type) {
        case 'text':
          sanitized[key] = sanitizeText(obj[key]);
          break;
        case 'arabic':
          sanitized[key] = sanitizeArabicText(obj[key]);
          break;
        case 'email':
          sanitized[key] = sanitizeEmail(obj[key]);
          break;
        case 'url':
          sanitized[key] = sanitizeUrl(obj[key]);
          break;
        case 'html':
          sanitized[key] = sanitizeHtml(obj[key]);
          break;
        case 'number':
          sanitized[key] = sanitizeNumber(obj[key]);
          break;
        case 'boolean':
          sanitized[key] = sanitizeBoolean(obj[key]);
          break;
        case 'color':
          sanitized[key] = sanitizeHexColor(obj[key]);
          break;
        default:
          sanitized[key] = sanitizeText(obj[key]);
      }
    }
  }

  return sanitized;
}

/**
 * Remove potentially dangerous SQL injection patterns
 */
export function sanitizeSqlInput(input: string): string {
  if (!input || typeof input !== 'string') {
    return '';
  }

  const sqlPatterns = [
    /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|EXECUTE|UNION|SCRIPT)\b)/gi,
    /(--|\/\*|\*\/|;|'|"|`)/g,
    /(\bOR\b|\bAND\b)\s+\d+\s*=\s*\d+/gi
  ];

  let sanitized = input;
  sqlPatterns.forEach(pattern => {
    sanitized = sanitized.replace(pattern, '');
  });

  return sanitized.trim();
}

/**
 * Validate and sanitize JSON input
 */
export function sanitizeJsonInput(input: string): any {
  if (!input || typeof input !== 'string') {
    return null;
  }

  try {
    const parsed = JSON.parse(input);
    
    // Recursively sanitize object properties
    if (typeof parsed === 'object' && parsed !== null) {
      return sanitizeJsonObject(parsed);
    }
    
    return parsed;
  } catch (error) {
    return null;
  }
}

/**
 * Recursively sanitize JSON object
 */
function sanitizeJsonObject(obj: any): any {
  if (Array.isArray(obj)) {
    return obj.map(item => sanitizeJsonObject(item));
  }

  if (typeof obj === 'object' && obj !== null) {
    const sanitized: any = {};
    for (const [key, value] of Object.entries(obj)) {
      const sanitizedKey = sanitizeText(key);
      if (sanitizedKey) {
        sanitized[sanitizedKey] = sanitizeJsonObject(value);
      }
    }
    return sanitized;
  }

  if (typeof obj === 'string') {
    return sanitizeText(obj);
  }

  return obj;
}
