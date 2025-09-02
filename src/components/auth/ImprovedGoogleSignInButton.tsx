'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/components/safe-providers';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

interface ImprovedGoogleSignInButtonProps {
  onSuccess?: () => void;
  onError?: (error: string) => void;
  className?: string;
  size?: 'sm' | 'default' | 'lg';
  variant?: 'default' | 'outline' | 'secondary';
  disabled?: boolean;
  lang?: 'ar' | 'en';
}

export function ImprovedGoogleSignInButton({
  onSuccess,
  onError,
  className = '',
  size = 'default',
  variant = 'outline',
  disabled = false,
  lang = 'ar'
}: ImprovedGoogleSignInButtonProps) {
  const { signInWithGoogle } = useAuth();
  const [loading, setLoading] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  const texts = {
    ar: {
      signIn: 'تسجيل الدخول بـ Google',
      signing: 'جاري تسجيل الدخول...',
      success: 'تم تسجيل الدخول بنجاح',
      error: 'خطأ في تسجيل الدخول',
      retry: 'إعادة المحاولة',
      popupBlocked: 'النافذة المنبثقة محجوبة، سيتم إعادة التوجيه...'
    },
    en: {
      signIn: 'Sign in with Google',
      signing: 'Signing in...',
      success: 'Successfully signed in',
      error: 'Sign in error',
      retry: 'Retry',
      popupBlocked: 'Popup blocked, redirecting...'
    }
  };

  const t = texts[lang];

  const handleGoogleSignIn = async () => {
    if (loading || disabled) return;

    setLoading(true);
    
    try {
      console.log('🔄 ImprovedGoogleSignInButton: Starting Google Sign-In...');
      console.log('Retry count:', retryCount);

      // إذا فشلت المحاولة السابقة، استخدم redirect مباشرة
      const useRedirect = retryCount > 0;
      
      if (useRedirect) {
        toast.info(t.popupBlocked);
      }

      await signInWithGoogle(useRedirect);
      
      console.log('✅ Google Sign-In successful');
      
      if (onSuccess) {
        onSuccess();
      }
      
      toast.success(t.success);
      
      // إعادة تعيين العداد عند النجاح
      setRetryCount(0);
      
    } catch (error: any) {
      console.error('❌ ImprovedGoogleSignInButton error:', error);
      
      const errorMessage = error.message || t.error;
      
      // زيادة عداد المحاولات
      setRetryCount(prev => prev + 1);
      
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
      disabled={loading || disabled}
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
          <span>{retryCount > 0 ? t.retry : t.signIn}</span>
        </>
      )}
    </Button>
  );
}
