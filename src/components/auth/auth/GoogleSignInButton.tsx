'use client';

import React, { useState } from 'react';
import { useAuth } from './AuthProvider';

interface GoogleSignInButtonProps {
  onSuccess?: () => void;
  onError?: (error: string) => void;
  disabled?: boolean;
  className?: string;
  children?: React.ReactNode;
}

export function GoogleSignInButton({ 
  onSuccess, 
  onError, 
  disabled = false, 
  className = '',
  children 
}: GoogleSignInButtonProps) {
  const { signInWithGoogle } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    if (disabled || loading) return;

    setLoading(true);

    try {
      console.log('🔄 GoogleSignInButton: Starting Google Sign-In...');

      // التحقق من دعم المتصفح للنوافذ المنبثقة
      if (typeof window !== 'undefined') {
        console.log('🔄 Testing popup support...');
        const testPopup = window.open('', '_blank', 'width=1,height=1');
        if (!testPopup || testPopup.closed) {
          console.error('❌ Popup blocked');
          throw new Error('auth/popup-blocked');
        }
        testPopup.close();
        console.log('✅ Popup support confirmed');
      }

      console.log('🔄 Calling signInWithGoogle...');
      await signInWithGoogle();
      console.log('✅ Google Sign-In successful');

      if (onSuccess) {
        onSuccess();
      }
    } catch (error: any) {
      console.error('❌ Google Sign-In Error:', error);
      console.error('Error details:', {
        code: error.code,
        message: error.message,
        stack: error.stack
      });

      let errorMessage = 'خطأ في تسجيل الدخول بـ Google';

      if (error.message) {
        errorMessage = error.message;
      } else if (error.code) {
        errorMessage = getErrorMessage(error.code);
      }

      console.log('📤 Sending error to parent:', errorMessage);

      if (onError) {
        onError(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  const getErrorMessage = (errorCode: string): string => {
    switch (errorCode) {
      case 'auth/popup-closed-by-user':
        return 'تم إغلاق نافذة تسجيل الدخول';
      case 'auth/popup-blocked':
        return 'تم حجب النافذة المنبثقة. يرجى السماح بالنوافذ المنبثقة في متصفحك';
      case 'auth/cancelled-popup-request':
        return 'تم إلغاء طلب تسجيل الدخول';
      case 'auth/operation-not-allowed':
        return 'تسجيل الدخول بـ Google غير مفعل. يرجى التواصل مع المدير';
      case 'auth/unauthorized-domain':
        return 'النطاق الحالي غير مصرح له. يرجى استخدام النطاق الصحيح';
      case 'auth/network-request-failed':
        return 'خطأ في الاتصال بالشبكة. تحقق من اتصالك بالإنترنت';
      case 'auth/too-many-requests':
        return 'تم تجاوز عدد المحاولات المسموح. حاول مرة أخرى لاحقاً';
      case 'auth/user-disabled':
        return 'تم تعطيل هذا الحساب';
      case 'auth/account-exists-with-different-credential':
        return 'يوجد حساب بنفس البريد الإلكتروني مع طريقة تسجيل دخول مختلفة';
      default:
        return 'خطأ غير متوقع في تسجيل الدخول بـ Google';
    }
  };

  const defaultClassName = `
    w-full flex items-center justify-center px-4 py-2 border border-gray-300 
    rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 
    hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 
    focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed
    transition-colors duration-200
  `.trim();

  return (
    <button
      type="button"
      onClick={handleGoogleSignIn}
      disabled={disabled || loading}
      className={className || defaultClassName}
      aria-label="تسجيل الدخول بـ Google"
    >
      {loading ? (
        <>
          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-gray-700" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          جاري تسجيل الدخول...
        </>
      ) : (
        <>
          <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          {children || 'تسجيل الدخول بـ Google'}
        </>
      )}
    </button>
  );
}

export default GoogleSignInButton;
