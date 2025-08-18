'use client';

import React, { useState, useEffect } from 'react';
import { Language } from '@/types';
import { getCurrentAdminSession, signOutAdmin, clearAdminSession } from '@/lib/admin-auth';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  ClockIcon, 
  ExclamationTriangleIcon,
  ArrowRightOnRectangleIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

interface AdminSessionManagerProps {
  lang: Language;
  onSessionExpired?: () => void;
}

export default function AdminSessionManager({ lang, onSessionExpired }: AdminSessionManagerProps) {
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const [showWarning, setShowWarning] = useState(false);
  const [isExpired, setIsExpired] = useState(false);
  
  const isRTL = lang === 'ar';

  useEffect(() => {
    const checkSession = () => {
      const session = getCurrentAdminSession();
      if (!session) {
        setIsExpired(true);
        if (onSessionExpired) {
          onSessionExpired();
        }
        return;
      }

      const remaining = session.expiresAt - Date.now();
      setTimeRemaining(remaining);

      // Show warning when 5 minutes or less remaining
      if (remaining <= 5 * 60 * 1000 && remaining > 0) {
        setShowWarning(true);
      } else if (remaining <= 0) {
        setIsExpired(true);
        clearAdminSession();
        if (onSessionExpired) {
          onSessionExpired();
        }
      } else {
        setShowWarning(false);
      }
    };

    // Check immediately
    checkSession();

    // Check every 30 seconds
    const interval = setInterval(checkSession, 30000);

    return () => clearInterval(interval);
  }, [onSessionExpired]);

  const handleExtendSession = async () => {
    try {
      // In a real implementation, you would call an API to extend the session
      // For now, we'll just refresh the page to re-authenticate
      window.location.reload();
    } catch (error) {
      console.error('Error extending session:', error);
      toast.error(isRTL ? 'خطأ في تمديد الجلسة' : 'Error extending session');
    }
  };

  const handleLogout = async () => {
    try {
      await signOutAdmin();
      toast.success(isRTL ? 'تم تسجيل الخروج بنجاح' : 'Logged out successfully');
    } catch (error) {
      console.error('Error logging out:', error);
      toast.error(isRTL ? 'خطأ في تسجيل الخروج' : 'Error logging out');
    }
  };

  const formatTime = (milliseconds: number): string => {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    } else {
      return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }
  };

  const texts = {
    sessionWarning: isRTL ? 'تحذير انتهاء الجلسة' : 'Session Expiry Warning',
    sessionWillExpire: isRTL ? 'ستنتهي جلستك خلال' : 'Your session will expire in',
    extendSession: isRTL ? 'تمديد الجلسة' : 'Extend Session',
    logout: isRTL ? 'تسجيل الخروج' : 'Logout',
    sessionExpired: isRTL ? 'انتهت صلاحية الجلسة' : 'Session Expired',
    sessionExpiredMessage: isRTL ? 'انتهت صلاحية جلسة الدخول. يرجى تسجيل الدخول مرة أخرى.' : 'Your session has expired. Please log in again.'
  };

  // Don't render anything if session is valid and no warning needed
  if (!showWarning && !isExpired) {
    return null;
  }

  // Session expired
  if (isExpired) {
    return (
      <Alert className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950 mb-4">
        <ExclamationTriangleIcon className="h-4 w-4 text-red-600" />
        <AlertDescription className="text-red-800 dark:text-red-200">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium">{texts.sessionExpired}</div>
              <div className="text-sm mt-1">{texts.sessionExpiredMessage}</div>
            </div>
            <Button
              onClick={() => window.location.href = `/${lang}/admin/login`}
              size="sm"
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {isRTL ? 'تسجيل الدخول' : 'Login'}
            </Button>
          </div>
        </AlertDescription>
      </Alert>
    );
  }

  // Session warning
  return (
    <Alert className="border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-950 mb-4">
      <ClockIcon className="h-4 w-4 text-yellow-600" />
      <AlertDescription className="text-yellow-800 dark:text-yellow-200">
        <div className="flex items-center justify-between">
          <div>
            <div className="font-medium">{texts.sessionWarning}</div>
            <div className="text-sm mt-1">
              {texts.sessionWillExpire}: <span className="font-mono font-bold">{formatTime(timeRemaining)}</span>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={handleExtendSession}
              size="sm"
              className="bg-yellow-600 hover:bg-yellow-700 text-white"
            >
              {texts.extendSession}
            </Button>
            <Button
              onClick={handleLogout}
              size="sm"
              variant="outline"
              className="border-yellow-300 text-yellow-800 hover:bg-yellow-100"
            >
              <ArrowRightOnRectangleIcon className="h-4 w-4 mr-1" />
              {texts.logout}
            </Button>
          </div>
        </div>
      </AlertDescription>
    </Alert>
  );
}

// Hook for using session manager
export function useAdminSession(lang: Language) {
  const [session, setSession] = useState(getCurrentAdminSession());
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    const checkSession = () => {
      const currentSession = getCurrentAdminSession();
      setSession(currentSession);
      
      if (!currentSession) {
        setIsExpired(true);
      } else {
        const remaining = currentSession.expiresAt - Date.now();
        if (remaining <= 0) {
          setIsExpired(true);
          clearAdminSession();
        } else {
          setIsExpired(false);
        }
      }
    };

    // Check immediately
    checkSession();

    // Check every minute
    const interval = setInterval(checkSession, 60000);

    return () => clearInterval(interval);
  }, []);

  const extendSession = () => {
    // Refresh page to re-authenticate
    window.location.reload();
  };

  const logout = async () => {
    try {
      await signOutAdmin();
      setSession(null);
      setIsExpired(true);
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  return {
    session,
    isExpired,
    extendSession,
    logout,
    timeRemaining: session ? session.expiresAt - Date.now() : 0
  };
}
