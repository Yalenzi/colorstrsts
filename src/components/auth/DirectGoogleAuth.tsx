'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

interface DirectGoogleAuthProps {
  onSuccess?: () => void;
  onError?: (error: string) => void;
  className?: string;
  lang?: 'ar' | 'en';
  variant?: 'default' | 'outline' | 'secondary';
  size?: 'sm' | 'default' | 'lg';
}

export function DirectGoogleAuth({
  onSuccess,
  onError,
  className = '',
  lang = 'ar',
  variant = 'outline',
  size = 'default'
}: DirectGoogleAuthProps) {
  const [loading, setLoading] = useState(false);

  const texts = {
    ar: {
      signIn: 'تسجيل الدخول بـ Google',
      signing: 'جاري تسجيل الدخول...',
      success: 'تم تسجيل الدخول بنجاح',
      error: 'خطأ في تسجيل الدخول',
      popupBlocked: 'النافذة المنبثقة محجوبة، سيتم إعادة التوجيه...',
      networkError: 'خطأ في الاتصال بالإنترنت',
      configError: 'خطأ في إعدادات Firebase'
    },
    en: {
      signIn: 'Sign in with Google',
      signing: 'Signing in...',
      success: 'Successfully signed in',
      error: 'Sign in error',
      popupBlocked: 'Popup blocked, redirecting...',
      networkError: 'Network connection error',
      configError: 'Firebase configuration error'
    }
  };

  const t = texts[lang];

  // فحص نتيجة Redirect عند تحميل المكون
  useEffect(() => {
    const checkRedirectResult = async () => {
      try {
        const { getRedirectResult } = await import('firebase/auth');
        const { auth } = await import('@/lib/firebase');
        
        const result = await getRedirectResult(auth);
        if (result) {
          console.log('✅ Redirect result successful:', result.user.email);
          
          // إنشاء أو تحديث ملف المستخدم
          try {
            const { createOrUpdateUserProfile } = await import('@/lib/subscription-service');
            await createOrUpdateUserProfile(result.user);
          } catch (profileError) {
            console.warn('⚠️ Failed to create/update user profile:', profileError);
          }
          
          toast.success(t.success);
          
          if (onSuccess) {
            onSuccess();
          }
        }
      } catch (error: any) {
        console.error('❌ Redirect result error:', error);
        if (error.code !== 'auth/no-auth-event') {
          const errorMessage = getErrorMessage(error.code);
          toast.error(errorMessage);
          
          if (onError) {
            onError(errorMessage);
          }
        }
      }
    };

    checkRedirectResult();
  }, [onSuccess, onError, t.success]);

  const getErrorMessage = (errorCode: string): string => {
    switch (errorCode) {
      case 'auth/network-request-failed':
        return t.networkError;
      case 'auth/configuration-not-found':
      case 'auth/invalid-api-key':
        return t.configError;
      case 'auth/popup-blocked':
      case 'auth/popup-closed-by-user':
      case 'auth/cancelled-popup-request':
        return t.popupBlocked;
      default:
        return t.error;
    }
  };

  const handleGoogleSignIn = async () => {
    if (loading) return;

    setLoading(true);
    
    try {
      console.log('🔄 Starting Direct Google Sign-In...');

      // استيراد Firebase functions مباشرة
      const { GoogleAuthProvider, signInWithPopup, signInWithRedirect } = await import('firebase/auth');
      const { auth } = await import('@/lib/firebase');

      console.log('🔧 Firebase config check:', {
        apiKey: !!auth.app.options.apiKey,
        authDomain: auth.app.options.authDomain,
        projectId: auth.app.options.projectId
      });

      // التحقق من إعدادات Firebase
      if (!auth.app.options.apiKey || !auth.app.options.projectId) {
        throw new Error('Firebase configuration is incomplete');
      }

      const provider = new GoogleAuthProvider();
      
      // إعداد النطاقات المطلوبة
      provider.addScope('email');
      provider.addScope('profile');
      
      // إعداد معاملات مخصصة
      provider.setCustomParameters({
        prompt: 'select_account'
      });

      let result;

      try {
        // محاولة استخدام Popup أولاً
        console.log('🔄 Trying popup method...');
        result = await signInWithPopup(auth, provider);
        console.log('✅ Popup successful');
      } catch (popupError: any) {
        console.log('❌ Popup failed:', popupError.code);
        
        // إذا فشل Popup، استخدم Redirect
        if (
          popupError.code === 'auth/popup-blocked' ||
          popupError.code === 'auth/popup-closed-by-user' ||
          popupError.code === 'auth/cancelled-popup-request'
        ) {
          console.log('🔄 Trying redirect method...');
          toast.info(t.popupBlocked);
          await signInWithRedirect(auth, provider);
          return; // سيتم إعادة التوجيه
        } else {
          throw popupError;
        }
      }

      if (result && result.user) {
        console.log('✅ Google Sign-In successful:', result.user.email);
        
        // إنشاء أو تحديث ملف المستخدم
        try {
          const { createOrUpdateUserProfile } = await import('@/lib/subscription-service');
          await createOrUpdateUserProfile(result.user);
          console.log('✅ User profile created/updated');
        } catch (profileError) {
          console.warn('⚠️ Failed to create/update user profile:', profileError);
          // لا نرمي خطأ هنا لأن تسجيل الدخول نجح
        }
        
        toast.success(t.success);
        
        if (onSuccess) {
          onSuccess();
        }
      }

    } catch (error: any) {
      console.error('❌ Direct Google Sign-In error:', error);
      
      const errorMessage = getErrorMessage(error.code);
      
      if (onError) {
        onError(errorMessage);
      } else {
        toast.error(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      onClick={handleGoogleSignIn}
      disabled={loading}
      variant={variant}
      size={size}
      className={`w-full flex items-center justify-center space-x-2 rtl:space-x-reverse ${className}`}
    >
      {loading ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>{t.signing}</span>
        </>
      ) : (
        <>
          <svg className="h-5 w-5" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          <span>{t.signIn}</span>
        </>
      )}
    </Button>
  );
}
