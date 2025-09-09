'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { 
  GoogleAuthProvider, 
  signInWithPopup, 
  signInWithRedirect, 
  getRedirectResult,
  onAuthStateChanged,
  User
} from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { createOrUpdateUserProfile } from '@/lib/subscription-service';

interface UnifiedGoogleAuthProps {
  onSuccess?: (user: User) => void;
  onError?: (error: string) => void;
  className?: string;
  lang?: 'ar' | 'en';
  variant?: 'default' | 'outline' | 'secondary';
  size?: 'sm' | 'default' | 'lg';
  disabled?: boolean;
}

export function UnifiedGoogleAuth({
  onSuccess,
  onError,
  className = '',
  lang = 'ar',
  variant = 'default',
  size = 'default',
  disabled = false
}: UnifiedGoogleAuthProps) {
  const [loading, setLoading] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);

  const isRTL = lang === 'ar';

  const texts = {
    ar: {
      signIn: 'تسجيل الدخول بـ Google',
      signingIn: 'جاري تسجيل الدخول...',
      redirecting: 'جاري إعادة التوجيه...',
      success: 'تم تسجيل الدخول بنجاح',
      error: 'خطأ في تسجيل الدخول',
      tryAgain: 'حاول مرة أخرى'
    },
    en: {
      signIn: 'Sign in with Google',
      signingIn: 'Signing in...',
      redirecting: 'Redirecting...',
      success: 'Successfully signed in',
      error: 'Sign in error',
      tryAgain: 'Try again'
    }
  };

  const t = texts[lang];

  // Check for redirect result on component mount
  useEffect(() => {
    const checkRedirectResult = async () => {
      try {
        const result = await getRedirectResult(auth);
        if (result) {
          console.log('✅ Google Sign-In redirect successful:', result.user.email);
          
          // Create or update user profile
          await createOrUpdateUserProfile(result.user);
          
          toast.success(t.success);
          
          if (onSuccess) {
            onSuccess(result.user);
          }
        }
      } catch (error: any) {
        console.error('❌ Redirect result error:', error);
        const errorMessage = getErrorMessage(error);
        toast.error(errorMessage);
        
        if (onError) {
          onError(errorMessage);
        }
      }
    };

    checkRedirectResult();
  }, [onSuccess, onError, t.success]);

  const getErrorMessage = (error: any): string => {
    const errorCode = error?.code || '';
    
    switch (errorCode) {
      case 'auth/popup-blocked':
        return lang === 'ar' ? 'تم حظر النافذة المنبثقة. يرجى السماح بالنوافذ المنبثقة.' : 'Popup blocked. Please allow popups.';
      case 'auth/popup-closed-by-user':
        return lang === 'ar' ? 'تم إغلاق النافذة من قبل المستخدم.' : 'Popup closed by user.';
      case 'auth/cancelled-popup-request':
        return lang === 'ar' ? 'تم إلغاء طلب تسجيل الدخول.' : 'Sign-in request cancelled.';
      case 'auth/network-request-failed':
        return lang === 'ar' ? 'خطأ في الشبكة. تحقق من اتصال الإنترنت.' : 'Network error. Check internet connection.';
      case 'auth/too-many-requests':
        return lang === 'ar' ? 'محاولات كثيرة جداً. حاول لاحقاً.' : 'Too many attempts. Try later.';
      case 'auth/user-disabled':
        return lang === 'ar' ? 'تم تعطيل هذا الحساب.' : 'This account has been disabled.';
      case 'auth/operation-not-allowed':
        return lang === 'ar' ? 'تسجيل الدخول بـ Google غير مفعل.' : 'Google sign-in is not enabled.';
      default:
        return lang === 'ar' ? 'خطأ في تسجيل الدخول. حاول مرة أخرى.' : 'Sign-in error. Please try again.';
    }
  };

  const handleGoogleSignIn = async () => {
    if (loading || disabled) return;

    setLoading(true);

    try {
      console.log('🔄 Starting Google Sign-In...');

      // Validate Firebase configuration
      if (!auth.app.options.apiKey || !auth.app.options.projectId) {
        throw new Error('Firebase configuration is incomplete');
      }

      const provider = new GoogleAuthProvider();
      
      // Configure provider
      provider.addScope('email');
      provider.addScope('profile');
      provider.setCustomParameters({
        prompt: 'select_account',
        access_type: 'offline'
      });

      let result;

      try {
        // Try popup first
        console.log('🔄 Attempting popup sign-in...');
        result = await signInWithPopup(auth, provider);
        console.log('✅ Popup sign-in successful:', result.user.email);
      } catch (popupError: any) {
        console.warn('⚠️ Popup failed, trying redirect:', popupError.code);
        
        // If popup fails, use redirect
        if (popupError.code === 'auth/popup-blocked' || 
            popupError.code === 'auth/popup-closed-by-user' ||
            popupError.code === 'auth/cancelled-popup-request') {
          
          console.log('🔄 Using redirect method...');
          setIsRedirecting(true);
          await signInWithRedirect(auth, provider);
          return; // Will redirect, so return here
        } else {
          throw popupError; // Re-throw other errors
        }
      }

      // If we get here, popup was successful
      if (result) {
        // Create or update user profile
        await createOrUpdateUserProfile(result.user);
        
        console.log('✅ Google Sign-In completed successfully');
        toast.success(t.success);
        
        if (onSuccess) {
          onSuccess(result.user);
        }
      }

    } catch (error: any) {
      console.error('❌ Google Sign-In error:', error);
      const errorMessage = getErrorMessage(error);
      toast.error(errorMessage);
      
      if (onError) {
        onError(errorMessage);
      }
    } finally {
      setLoading(false);
      setIsRedirecting(false);
    }
  };

  const buttonText = isRedirecting ? t.redirecting : loading ? t.signingIn : t.signIn;
  const isButtonDisabled = loading || isRedirecting || disabled;

  return (
    <Button
      onClick={handleGoogleSignIn}
      disabled={isButtonDisabled}
      variant={variant}
      size={size}
      className={`w-full ${className}`}
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      {(loading || isRedirecting) && (
        <Loader2 className={`h-4 w-4 animate-spin ${isRTL ? 'ml-2' : 'mr-2'}`} />
      )}
      <svg className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} viewBox="0 0 24 24">
        <path
          fill="currentColor"
          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        />
        <path
          fill="currentColor"
          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        />
        <path
          fill="currentColor"
          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        />
        <path
          fill="currentColor"
          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        />
      </svg>
      {buttonText}
    </Button>
  );
}
