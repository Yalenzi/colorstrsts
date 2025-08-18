'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Language } from '@/types';
import { 
  getCurrentAdminSession, 
  onAdminAuthStateChanged, 
  hasAdminPermission,
  AdminUser,
  clearAdminSession
} from '@/lib/admin-auth';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  ShieldExclamationIcon, 
  ExclamationTriangleIcon,
  ArrowLeftIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline';

interface AdminProtectedRouteProps {
  children: React.ReactNode;
  lang: Language;
  requiredPermission?: string;
  fallbackPath?: string;
}

export default function AdminProtectedRoute({ 
  children, 
  lang, 
  requiredPermission,
  fallbackPath = '/admin/login'
}: AdminProtectedRouteProps) {
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sessionExpired, setSessionExpired] = useState(false);
  
  const router = useRouter();
  const isRTL = lang === 'ar';

  useEffect(() => {
    let isMounted = true;

    // Check existing session first
    const session = getCurrentAdminSession();
    if (session) {
      setAdminUser(session.user);
      setLoading(false);
    }

    // Listen to auth state changes
    const unsubscribe = onAdminAuthStateChanged((user) => {
      if (!isMounted) return;

      if (user) {
        setAdminUser(user);
        setError(null);
        setSessionExpired(false);
      } else {
        setAdminUser(null);
        const session = getCurrentAdminSession();
        if (session) {
          // Session exists but auth state is null - session expired
          setSessionExpired(true);
          clearAdminSession();
        }
      }
      setLoading(false);
    });

    // Session expiry check
    const checkSessionExpiry = () => {
      const session = getCurrentAdminSession();
      if (!session) {
        if (adminUser) {
          setSessionExpired(true);
          setAdminUser(null);
        }
        return;
      }

      // Check if session is about to expire (5 minutes warning)
      const timeUntilExpiry = session.expiresAt - Date.now();
      if (timeUntilExpiry <= 5 * 60 * 1000 && timeUntilExpiry > 0) {
        // Show warning about session expiry
        console.warn('Admin session will expire soon');
      } else if (timeUntilExpiry <= 0) {
        // Session expired
        setSessionExpired(true);
        setAdminUser(null);
        clearAdminSession();
      }
    };

    // Check session expiry every minute
    const sessionCheckInterval = setInterval(checkSessionExpiry, 60000);

    return () => {
      isMounted = false;
      unsubscribe();
      clearInterval(sessionCheckInterval);
    };
  }, [adminUser]);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!loading && !adminUser) {
      const redirectPath = `/${lang}${fallbackPath}`;
      router.push(redirectPath);
    }
  }, [loading, adminUser, lang, fallbackPath, router]);

  // Check permissions
  useEffect(() => {
    if (adminUser && requiredPermission) {
      if (!hasAdminPermission(requiredPermission)) {
        setError(isRTL ? 'ليس لديك الصلاحية للوصول لهذه الصفحة' : 'You do not have permission to access this page');
      } else {
        setError(null);
      }
    }
  }, [adminUser, requiredPermission, isRTL]);

  const handleGoToLogin = () => {
    router.push(`/${lang}/admin/login`);
  };

  const handleGoHome = () => {
    router.push(`/${lang}`);
  };

  const texts = {
    loading: isRTL ? 'جاري التحقق من الصلاحيات...' : 'Checking permissions...',
    sessionExpired: isRTL ? 'انتهت صلاحية الجلسة' : 'Session Expired',
    sessionExpiredMessage: isRTL ? 'انتهت صلاحية جلسة الدخول. يرجى تسجيل الدخول مرة أخرى.' : 'Your session has expired. Please log in again.',
    accessDenied: isRTL ? 'وصول مرفوض' : 'Access Denied',
    insufficientPermissions: isRTL ? 'صلاحيات غير كافية' : 'Insufficient Permissions',
    loginAgain: isRTL ? 'تسجيل الدخول مرة أخرى' : 'Log In Again',
    goHome: isRTL ? 'العودة للرئيسية' : 'Go Home',
    backToAdmin: isRTL ? 'العودة للوحة التحكم' : 'Back to Admin Panel'
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-600 dark:text-gray-400">{texts.loading}</p>
        </div>
      </div>
    );
  }

  // Session expired
  if (sessionExpired) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 text-center">
            <div className="w-16 h-16 bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <ExclamationTriangleIcon className="w-8 h-8 text-yellow-600 dark:text-yellow-400" />
            </div>
            
            <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              {texts.sessionExpired}
            </h1>
            
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {texts.sessionExpiredMessage}
            </p>
            
            <div className="space-y-3">
              <Button
                onClick={handleGoToLogin}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              >
                {isRTL ? (
                  <>
                    <ArrowRightIcon className="w-4 h-4 ml-2" />
                    {texts.loginAgain}
                  </>
                ) : (
                  <>
                    {texts.loginAgain}
                    <ArrowLeftIcon className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>
              
              <Button
                onClick={handleGoHome}
                variant="outline"
                className="w-full"
              >
                {texts.goHome}
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Access denied due to insufficient permissions
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 text-center">
            <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <ShieldExclamationIcon className="w-8 h-8 text-red-600 dark:text-red-400" />
            </div>
            
            <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              {texts.accessDenied}
            </h1>
            
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {error}
            </p>
            
            <div className="space-y-3">
              <Button
                onClick={() => router.push(`/${lang}/admin`)}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              >
                {texts.backToAdmin}
              </Button>
              
              <Button
                onClick={handleGoHome}
                variant="outline"
                className="w-full"
              >
                {texts.goHome}
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Not authenticated - will redirect to login
  if (!adminUser) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-600 dark:text-gray-400">
            {isRTL ? 'جاري إعادة التوجيه...' : 'Redirecting...'}
          </p>
        </div>
      </div>
    );
  }

  // All checks passed - render protected content
  return <>{children}</>;
}
