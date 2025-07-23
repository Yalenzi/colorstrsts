import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp, query, where, orderBy, limit, getDocs } from 'firebase/firestore';

// Security event types
export enum SecurityEventType {
  LOGIN_SUCCESS = 'login_success',
  LOGIN_FAILURE = 'login_failure',
  LOGIN_BLOCKED = 'login_blocked',
  PASSWORD_CHANGE = 'password_change',
  ACCOUNT_LOCKED = 'account_locked',
  SUSPICIOUS_ACTIVITY = 'suspicious_activity',
  FILE_UPLOAD = 'file_upload',
  FILE_UPLOAD_BLOCKED = 'file_upload_blocked',
  ADMIN_ACTION = 'admin_action',
  DATA_ACCESS = 'data_access',
  RATE_LIMIT_EXCEEDED = 'rate_limit_exceeded',
  CSRF_ATTACK = 'csrf_attack',
  XSS_ATTEMPT = 'xss_attempt',
  SQL_INJECTION_ATTEMPT = 'sql_injection_attempt',
  UNAUTHORIZED_ACCESS = 'unauthorized_access',
  DATA_BREACH_ATTEMPT = 'data_breach_attempt'
}

export interface SecurityEvent {
  type: SecurityEventType;
  userId?: string;
  userEmail?: string;
  ipAddress: string;
  userAgent: string;
  timestamp: any;
  details: Record<string, any>;
  severity: 'low' | 'medium' | 'high' | 'critical';
  resolved: boolean;
}

/**
 * Log security event
 */
export async function logSecurityEvent(
  type: SecurityEventType,
  details: Record<string, any>,
  severity: 'low' | 'medium' | 'high' | 'critical' = 'medium',
  userId?: string,
  userEmail?: string,
  ipAddress: string = 'unknown',
  userAgent: string = 'unknown'
): Promise<void> {
  try {
    const event: SecurityEvent = {
      type,
      userId,
      userEmail,
      ipAddress,
      userAgent,
      timestamp: serverTimestamp(),
      details,
      severity,
      resolved: false
    };

    await addDoc(collection(db, 'securityEvents'), event);

    // Send alert for high/critical events
    if (severity === 'high' || severity === 'critical') {
      await sendSecurityAlert(event);
    }

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.warn(`[SECURITY] ${type}:`, details);
    }

  } catch (error) {
    console.error('Failed to log security event:', error);
    // Fallback to console logging
    console.warn(`[SECURITY] ${type}:`, details);
  }
}

/**
 * Send security alert
 */
async function sendSecurityAlert(event: SecurityEvent): Promise<void> {
  try {
    // In a real implementation, this would send emails, Slack notifications, etc.
    console.error(`[SECURITY ALERT] ${event.type}:`, event.details);
    
    // Example: Send to monitoring service
    if (process.env.SECURITY_WEBHOOK_URL) {
      await fetch(process.env.SECURITY_WEBHOOK_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: `Security Alert: ${event.type}`,
          attachments: [{
            color: event.severity === 'critical' ? 'danger' : 'warning',
            fields: [
              { title: 'Event Type', value: event.type, short: true },
              { title: 'Severity', value: event.severity, short: true },
              { title: 'User', value: event.userEmail || 'Unknown', short: true },
              { title: 'IP Address', value: event.ipAddress, short: true },
              { title: 'Details', value: JSON.stringify(event.details), short: false }
            ]
          }]
        })
      });
    }
  } catch (error) {
    console.error('Failed to send security alert:', error);
  }
}

/**
 * Monitor for suspicious patterns
 */
export async function detectSuspiciousActivity(
  userId: string,
  ipAddress: string,
  action: string
): Promise<boolean> {
  try {
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);

    // Check for rapid successive actions
    const recentEvents = await getDocs(
      query(
        collection(db, 'securityEvents'),
        where('userId', '==', userId),
        where('timestamp', '>=', oneHourAgo),
        orderBy('timestamp', 'desc'),
        limit(50)
      )
    );

    const events = recentEvents.docs.map(doc => doc.data());

    // Pattern 1: Too many failed login attempts
    const failedLogins = events.filter(e => e.type === SecurityEventType.LOGIN_FAILURE).length;
    if (failedLogins >= 5) {
      await logSecurityEvent(
        SecurityEventType.SUSPICIOUS_ACTIVITY,
        { pattern: 'multiple_failed_logins', count: failedLogins },
        'high',
        userId,
        undefined,
        ipAddress
      );
      return true;
    }

    // Pattern 2: Rapid API calls
    const apiCalls = events.filter(e => e.type === SecurityEventType.DATA_ACCESS).length;
    if (apiCalls >= 100) {
      await logSecurityEvent(
        SecurityEventType.SUSPICIOUS_ACTIVITY,
        { pattern: 'rapid_api_calls', count: apiCalls },
        'medium',
        userId,
        undefined,
        ipAddress
      );
      return true;
    }

    // Pattern 3: Multiple IP addresses for same user
    const uniqueIPs = new Set(events.map(e => e.ipAddress));
    if (uniqueIPs.size >= 5) {
      await logSecurityEvent(
        SecurityEventType.SUSPICIOUS_ACTIVITY,
        { pattern: 'multiple_ip_addresses', ips: Array.from(uniqueIPs) },
        'medium',
        userId,
        undefined,
        ipAddress
      );
      return true;
    }

    return false;

  } catch (error) {
    console.error('Error detecting suspicious activity:', error);
    return false;
  }
}

/**
 * Performance monitoring
 */
export class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private metrics: Map<string, number[]> = new Map();

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  recordMetric(name: string, value: number): void {
    if (!this.metrics.has(name)) {
      this.metrics.set(name, []);
    }
    
    const values = this.metrics.get(name)!;
    values.push(value);
    
    // Keep only last 100 values
    if (values.length > 100) {
      values.shift();
    }
  }

  getAverageMetric(name: string): number {
    const values = this.metrics.get(name);
    if (!values || values.length === 0) return 0;
    
    return values.reduce((sum, val) => sum + val, 0) / values.length;
  }

  getMetricPercentile(name: string, percentile: number): number {
    const values = this.metrics.get(name);
    if (!values || values.length === 0) return 0;
    
    const sorted = [...values].sort((a, b) => a - b);
    const index = Math.ceil((percentile / 100) * sorted.length) - 1;
    return sorted[index];
  }

  async reportMetrics(): Promise<void> {
    const report: Record<string, any> = {};
    
    for (const [name, values] of this.metrics.entries()) {
      report[name] = {
        count: values.length,
        average: this.getAverageMetric(name),
        p95: this.getMetricPercentile(name, 95),
        p99: this.getMetricPercentile(name, 99)
      };
    }

    // Log metrics
    console.log('[PERFORMANCE]', report);

    // Send to monitoring service
    if (process.env.PERFORMANCE_WEBHOOK_URL) {
      try {
        await fetch(process.env.PERFORMANCE_WEBHOOK_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(report)
        });
      } catch (error) {
        console.error('Failed to send performance metrics:', error);
      }
    }
  }
}

/**
 * Error tracking and reporting
 */
export class ErrorTracker {
  private static instance: ErrorTracker;
  private errors: Array<{ error: Error; context: any; timestamp: Date }> = [];

  static getInstance(): ErrorTracker {
    if (!ErrorTracker.instance) {
      ErrorTracker.instance = new ErrorTracker();
    }
    return ErrorTracker.instance;
  }

  captureError(error: Error, context: any = {}): void {
    this.errors.push({
      error,
      context,
      timestamp: new Date()
    });

    // Keep only last 50 errors
    if (this.errors.length > 50) {
      this.errors.shift();
    }

    // Log error
    console.error('[ERROR]', error.message, context);

    // Send to error tracking service
    this.sendErrorReport(error, context);
  }

  private async sendErrorReport(error: Error, context: any): Promise<void> {
    try {
      if (process.env.ERROR_WEBHOOK_URL) {
        await fetch(process.env.ERROR_WEBHOOK_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: error.message,
            stack: error.stack,
            context,
            timestamp: new Date().toISOString(),
            url: typeof window !== 'undefined' ? window.location.href : 'server',
            userAgent: typeof window !== 'undefined' ? navigator.userAgent : 'server'
          })
        });
      }
    } catch (reportError) {
      console.error('Failed to send error report:', reportError);
    }
  }

  getRecentErrors(): Array<{ error: Error; context: any; timestamp: Date }> {
    return [...this.errors];
  }
}

/**
 * Health check monitoring
 */
export async function performHealthCheck(): Promise<{
  status: 'healthy' | 'degraded' | 'unhealthy';
  checks: Record<string, boolean>;
  timestamp: string;
}> {
  const checks: Record<string, boolean> = {};
  
  try {
    // Check Firebase connection
    checks.firebase = await checkFirebaseConnection();
    
    // Check memory usage
    checks.memory = checkMemoryUsage();
    
    // Check error rate
    checks.errorRate = checkErrorRate();
    
    // Determine overall status
    const failedChecks = Object.values(checks).filter(check => !check).length;
    let status: 'healthy' | 'degraded' | 'unhealthy';
    
    if (failedChecks === 0) {
      status = 'healthy';
    } else if (failedChecks <= 1) {
      status = 'degraded';
    } else {
      status = 'unhealthy';
    }

    return {
      status,
      checks,
      timestamp: new Date().toISOString()
    };

  } catch (error) {
    console.error('Health check failed:', error);
    return {
      status: 'unhealthy',
      checks: { healthCheck: false },
      timestamp: new Date().toISOString()
    };
  }
}

async function checkFirebaseConnection(): Promise<boolean> {
  try {
    // Try to read from a test collection
    await getDocs(query(collection(db, 'healthCheck'), limit(1)));
    return true;
  } catch (error) {
    return false;
  }
}

function checkMemoryUsage(): boolean {
  if (typeof window === 'undefined') {
    // Server-side memory check
    const used = process.memoryUsage();
    const maxMemory = 512 * 1024 * 1024; // 512MB limit
    return used.heapUsed < maxMemory;
  } else {
    // Client-side - always return true for now
    return true;
  }
}

function checkErrorRate(): boolean {
  const errorTracker = ErrorTracker.getInstance();
  const recentErrors = errorTracker.getRecentErrors();
  const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
  
  const recentErrorCount = recentErrors.filter(
    e => e.timestamp > fiveMinutesAgo
  ).length;
  
  // Fail if more than 10 errors in 5 minutes
  return recentErrorCount <= 10;
}

// Initialize monitoring
export function initializeMonitoring(): void {
  const performanceMonitor = PerformanceMonitor.getInstance();
  const errorTracker = ErrorTracker.getInstance();

  // Set up global error handler
  if (typeof window !== 'undefined') {
    window.addEventListener('error', (event) => {
      errorTracker.captureError(event.error, {
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno
      });
    });

    window.addEventListener('unhandledrejection', (event) => {
      errorTracker.captureError(
        new Error(event.reason),
        { type: 'unhandledrejection' }
      );
    });
  }

  // Report metrics every 5 minutes
  setInterval(() => {
    performanceMonitor.reportMetrics();
  }, 5 * 60 * 1000);

  console.log('[MONITORING] Security monitoring initialized');
}
