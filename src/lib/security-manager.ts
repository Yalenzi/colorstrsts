// نظام الحماية الشامل للمنصة
import CryptoJS from 'crypto-js';

// إعدادات الأمان المتقدمة
const SECURITY_CONFIG = {
  // تشفير قوي
  ENCRYPTION_KEY: process.env.NEXT_PUBLIC_ENCRYPTION_KEY || 'ColorTest2025SecureKey!@#',
  // مدة الجلسة (30 دقيقة)
  SESSION_TIMEOUT: 30 * 60 * 1000,
  // عدد محاولات تسجيل الدخول
  MAX_LOGIN_ATTEMPTS: 3,
  // مدة الحظر (15 دقيقة)
  LOCKOUT_DURATION: 15 * 60 * 1000,
  // معدل الطلبات المسموح (100 طلب/دقيقة)
  RATE_LIMIT: 100,
  RATE_WINDOW: 60 * 1000,
};

// نظام مراقبة الأنشطة المشبوهة
class SecurityMonitor {
  private static instance: SecurityMonitor;
  private suspiciousActivities: Map<string, number> = new Map();
  private blockedIPs: Set<string> = new Set();
  private rateLimitMap: Map<string, { count: number; resetTime: number }> = new Map();

  static getInstance(): SecurityMonitor {
    if (!SecurityMonitor.instance) {
      SecurityMonitor.instance = new SecurityMonitor();
    }
    return SecurityMonitor.instance;
  }

  // فحص معدل الطلبات
  checkRateLimit(identifier: string): boolean {
    const now = Date.now();
    const key = identifier;
    
    const current = this.rateLimitMap.get(key);
    
    if (!current || now > current.resetTime) {
      this.rateLimitMap.set(key, { 
        count: 1, 
        resetTime: now + SECURITY_CONFIG.RATE_WINDOW 
      });
      return true;
    }
    
    if (current.count >= SECURITY_CONFIG.RATE_LIMIT) {
      this.logSuspiciousActivity(identifier, 'RATE_LIMIT_EXCEEDED');
      return false;
    }
    
    current.count++;
    return true;
  }

  // تسجيل النشاط المشبوه
  logSuspiciousActivity(identifier: string, activity: string): void {
    const count = this.suspiciousActivities.get(identifier) || 0;
    this.suspiciousActivities.set(identifier, count + 1);
    
    console.warn(`🚨 Suspicious Activity: ${activity} from ${identifier}`);
    
    // حظر تلقائي بعد 5 أنشطة مشبوهة
    if (count >= 5) {
      this.blockIP(identifier);
    }
  }

  // حظر IP
  blockIP(ip: string): void {
    this.blockedIPs.add(ip);
    console.error(`🔒 IP Blocked: ${ip}`);
  }

  // فحص IP محظور
  isBlocked(ip: string): boolean {
    return this.blockedIPs.has(ip);
  }
}

// تشفير البيانات الحساسة
export class SecureStorage {
  private static encrypt(data: string): string {
    return CryptoJS.AES.encrypt(data, SECURITY_CONFIG.ENCRYPTION_KEY).toString();
  }

  private static decrypt(encryptedData: string): string {
    const bytes = CryptoJS.AES.decrypt(encryptedData, SECURITY_CONFIG.ENCRYPTION_KEY);
    return bytes.toString(CryptoJS.enc.Utf8);
  }

  static setSecure(key: string, value: any): void {
    const encrypted = this.encrypt(JSON.stringify(value));
    localStorage.setItem(key, encrypted);
  }

  static getSecure(key: string): any {
    const encrypted = localStorage.getItem(key);
    if (!encrypted) return null;
    
    try {
      const decrypted = this.decrypt(encrypted);
      return JSON.parse(decrypted);
    } catch (error) {
      console.error('Decryption failed:', error);
      localStorage.removeItem(key);
      return null;
    }
  }
}

// نظام التحقق من الهوية المتقدم
export class AuthSecurity {
  private static loginAttempts: Map<string, number> = new Map();
  private static lockoutTime: Map<string, number> = new Map();

  // التحقق من كلمة المرور بأمان
  static async verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
    try {
      // استخدام timing-safe comparison
      const inputHash = await this.hashPassword(password);
      return this.timingSafeEqual(inputHash, hashedPassword);
    } catch (error) {
      console.error('Password verification failed:', error);
      return false;
    }
  }

  // مقارنة آمنة ضد timing attacks
  private static timingSafeEqual(a: string, b: string): boolean {
    if (a.length !== b.length) return false;
    
    let result = 0;
    for (let i = 0; i < a.length; i++) {
      result |= a.charCodeAt(i) ^ b.charCodeAt(i);
    }
    return result === 0;
  }

  // تشفير كلمة المرور
  private static async hashPassword(password: string): Promise<string> {
    const salt = process.env.NEXT_PUBLIC_AUTH_SALT || 'default_salt';
    return CryptoJS.SHA256(password + salt).toString();
  }

  // فحص محاولات تسجيل الدخول
  static checkLoginAttempts(identifier: string): boolean {
    const now = Date.now();
    const lockout = this.lockoutTime.get(identifier);
    
    // فحص الحظر
    if (lockout && now < lockout) {
      return false;
    }
    
    // إزالة الحظر المنتهي
    if (lockout && now >= lockout) {
      this.lockoutTime.delete(identifier);
      this.loginAttempts.delete(identifier);
    }
    
    return true;
  }

  // تسجيل محاولة فاشلة
  static recordFailedAttempt(identifier: string): void {
    const attempts = this.loginAttempts.get(identifier) || 0;
    const newAttempts = attempts + 1;
    
    this.loginAttempts.set(identifier, newAttempts);
    
    if (newAttempts >= SECURITY_CONFIG.MAX_LOGIN_ATTEMPTS) {
      const lockoutUntil = Date.now() + SECURITY_CONFIG.LOCKOUT_DURATION;
      this.lockoutTime.set(identifier, lockoutUntil);
      
      SecurityMonitor.getInstance().logSuspiciousActivity(
        identifier, 
        'MULTIPLE_FAILED_LOGINS'
      );
    }
  }

  // مسح محاولات تسجيل الدخول
  static clearLoginAttempts(identifier: string): void {
    this.loginAttempts.delete(identifier);
    this.lockoutTime.delete(identifier);
  }
}

// حماية ضد XSS
export class XSSProtection {
  static sanitizeInput(input: string): string {
    return input
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2F;');
  }

  static validateInput(input: string, type: 'email' | 'text' | 'number'): boolean {
    switch (type) {
      case 'email':
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input);
      case 'text':
        return /^[a-zA-Z0-9\s\u0600-\u06FF._-]+$/.test(input);
      case 'number':
        return /^\d+$/.test(input);
      default:
        return false;
    }
  }
}

// حماية ضد CSRF
export class CSRFProtection {
  private static tokens: Map<string, number> = new Map();

  static generateToken(): string {
    const token = CryptoJS.lib.WordArray.random(32).toString();
    this.tokens.set(token, Date.now() + 3600000); // صالح لساعة واحدة
    return token;
  }

  static validateToken(token: string): boolean {
    const timestamp = this.tokens.get(token);
    if (!timestamp) return false;
    
    if (Date.now() > timestamp) {
      this.tokens.delete(token);
      return false;
    }
    
    return true;
  }

  static cleanExpiredTokens(): void {
    const now = Date.now();
    this.tokens.forEach((timestamp, token) => {
      if (now > timestamp) {
        this.tokens.delete(token);
      }
    });
  }
}

// مراقب الأمان الرئيسي
export const securityManager = {
  monitor: SecurityMonitor.getInstance(),
  storage: SecureStorage,
  auth: AuthSecurity,
  xss: XSSProtection,
  csrf: CSRFProtection,
  
  // تهيئة نظام الأمان
  initialize(): void {
    console.log('🔒 Security Manager Initialized');
    
    // تنظيف دوري للبيانات المنتهية الصلاحية
    setInterval(() => {
      CSRFProtection.cleanExpiredTokens();
    }, 300000); // كل 5 دقائق
    
    // مراقبة الأنشطة المشبوهة
    this.startSecurityMonitoring();
  },
  
  // بدء مراقبة الأمان
  startSecurityMonitoring(): void {
    // مراقبة console للكشف عن محاولات التلاعب
    const originalLog = console.log;
    console.log = (...args) => {
      if (args.some(arg => 
        typeof arg === 'string' && 
        (arg.includes('script') || arg.includes('eval') || arg.includes('innerHTML'))
      )) {
        this.monitor.logSuspiciousActivity('console', 'SUSPICIOUS_CONSOLE_ACTIVITY');
      }
      originalLog.apply(console, args);
    };
  }
};