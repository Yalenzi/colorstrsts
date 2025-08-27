'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Language } from '@/types';

interface SimpleGoogleSignInProps {
  lang?: Language;
  onSuccess?: (user: any) => void;
  onError?: (error: string) => void;
  className?: string;
  variant?: 'default' | 'outline' | 'secondary' | 'ghost' | 'link' | 'destructive';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  children?: React.ReactNode;
  fullWidth?: boolean;
}

export function SimpleGoogleSignIn({
  lang = 'ar',
  onSuccess,
  onError,
  className = '',
  variant = 'outline',
  size = 'default',
  children,
  fullWidth = true
}: SimpleGoogleSignInProps) {
  const [loading, setLoading] = useState(false);
  const isRTL = lang === 'ar';

  const texts = {
    signInButton: isRTL ? 'تسجيل الدخول بـ Google' : 'Continue with Google',
    signingIn: isRTL ? 'جاري تسجيل الدخول...' : 'Signing in...',
    error: isRTL ? 'حدث خطأ أثناء تسجيل الدخول بـ Google' : 'Error signing in with Google'
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    
    try {
      console.log('🔄 Starting simple Google Sign-In...');
      
      // إنشاء URL للـ OAuth مباشرة
      const clientId = '991442547146-lfjk8eg4rmi4q0veidfqqqgoq7l9ul0r.apps.googleusercontent.com'; // استبدل بـ client ID الفعلي
      const redirectUri = `${window.location.origin}/${lang}/auth/google-callback`;
      const scope = 'email profile';
      const responseType = 'code';
      const state = Math.random().toString(36).substring(2, 15);
      
      // حفظ state في localStorage للتحقق لاحقاً
      localStorage.setItem('google_oauth_state', state);
      localStorage.setItem('google_oauth_lang', lang);
      
      const googleAuthUrl = `https://accounts.google.com/oauth/authorize?` +
        `client_id=${encodeURIComponent(clientId)}&` +
        `redirect_uri=${encodeURIComponent(redirectUri)}&` +
        `scope=${encodeURIComponent(scope)}&` +
        `response_type=${encodeURIComponent(responseType)}&` +
        `state=${encodeURIComponent(state)}&` +
        `access_type=offline&` +
        `prompt=select_account`;
      
      console.log('🔄 Redirecting to Google OAuth...');
      console.log('🔍 Redirect URI:', redirectUri);
      
      // إعادة توجيه مباشرة إلى Google
      window.location.href = googleAuthUrl;
      
    } catch (error: any) {
      console.error('❌ Simple Google Sign-In error:', error);
      
      setLoading(false);
      
      const errorMessage = error.message || texts.error;
      
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
          {texts.signingIn}
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
