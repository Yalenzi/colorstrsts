'use client';

import React, { useState } from 'react';
import { signInWithPopup, signInWithRedirect, GoogleAuthProvider } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import { Language } from '@/types';

interface GoogleSignInHybridButtonProps {
  lang?: Language;
  onSuccess?: () => void;
  onError?: (error: string) => void;
  className?: string;
  variant?: 'default' | 'outline' | 'secondary' | 'ghost' | 'link' | 'destructive';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  children?: React.ReactNode;
  fullWidth?: boolean;
}

export function GoogleSignInHybridButton({
  lang = 'ar',
  onSuccess,
  onError,
  className = '',
  variant = 'outline',
  size = 'default',
  children,
  fullWidth = true
}: GoogleSignInHybridButtonProps) {
  const [loading, setLoading] = useState(false);
  const isRTL = lang === 'ar';

  const texts = {
    signInButton: isRTL ? 'تسجيل الدخول بـ Google' : 'Continue with Google',
    signingIn: isRTL ? 'جاري تسجيل الدخول...' : 'Signing in...',
    redirecting: isRTL ? 'جاري إعادة التوجيه...' : 'Redirecting...',
    error: isRTL ? 'حدث خطأ أثناء تسجيل الدخول بـ Google' : 'Error signing in with Google'
  };

  const [currentText, setCurrentText] = useState(texts.signingIn);

  const createProvider = () => {
    const provider = new GoogleAuthProvider();
    provider.addScope('email');
    provider.addScope('profile');
    provider.setCustomParameters({
      prompt: 'select_account',
      access_type: 'offline'
    });
    return provider;
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setCurrentText(texts.signingIn);
    
    try {
      console.log('🔄 Starting Google Sign-In (hybrid approach)...');
      
      const provider = createProvider();
      
      try {
        // المحاولة الأولى: Popup (أسرع وأكثر موثوقية)
        console.log('🔄 Trying popup method...');
        setCurrentText(texts.signingIn);
        
        const result = await signInWithPopup(auth, provider);
        
        console.log('✅ Popup sign-in successful:', result.user.email);
        
        if (onSuccess) {
          onSuccess();
        }
        
        return;
        
      } catch (popupError: any) {
        console.log('⚠️ Popup failed, trying redirect...', popupError.code);
        
        // إذا فشل popup، جرب redirect
        if (popupError.code === 'auth/popup-blocked' || 
            popupError.code === 'auth/popup-closed-by-user' ||
            popupError.code === 'auth/cancelled-popup-request') {
          
          console.log('🔄 Switching to redirect method...');
          setCurrentText(texts.redirecting);
          
          // تأخير قصير لإظهار الرسالة
          await new Promise(resolve => setTimeout(resolve, 500));
          
          await signInWithRedirect(auth, provider);
          
          // لن نصل هنا لأن الصفحة ستعيد التوجيه
          return;
          
        } else {
          // خطأ آخر، ارمه
          throw popupError;
        }
      }
      
    } catch (error: any) {
      console.error('❌ Google Sign-In error:', error);
      
      setLoading(false);
      setCurrentText(texts.signingIn);
      
      let errorMessage = texts.error;
      
      if (error.code === 'auth/popup-blocked') {
        errorMessage = isRTL 
          ? 'تم حجب النافذة المنبثقة. يرجى السماح بالنوافذ المنبثقة وإعادة المحاولة.'
          : 'Popup was blocked. Please allow popups and try again.';
      } else if (error.code === 'auth/popup-closed-by-user') {
        errorMessage = isRTL 
          ? 'تم إغلاق النافذة. يرجى إعادة المحاولة.'
          : 'Popup was closed. Please try again.';
      } else if (error.code === 'auth/network-request-failed') {
        errorMessage = isRTL 
          ? 'خطأ في الشبكة. يرجى التحقق من الاتصال وإعادة المحاولة.'
          : 'Network error. Please check your connection and try again.';
      }
      
      if (onError) {
        onError(errorMessage);
      }
    }
  };

  return (
    <Button
      type="button"
      variant={variant}
      size={size}
      className={`${fullWidth ? 'w-full' : ''} ${className}`}
      onClick={handleGoogleSignIn}
      disabled={loading}
    >
      {loading ? (
        <>
          <div className={`animate-spin rounded-full h-4 w-4 border-b-2 border-current ${isRTL ? 'ml-2' : 'mr-2'}`}></div>
          {currentText}
        </>
      ) : (
        <>
          <svg className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} viewBox="0 0 24 24">
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
          {children || texts.signInButton}
        </>
      )}
    </Button>
  );
}
