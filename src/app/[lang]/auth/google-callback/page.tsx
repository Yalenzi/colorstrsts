'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Language } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface GoogleCallbackPageProps {
  params: Promise<{ lang: Language }>;
}

export default function GoogleCallbackPage({ params }: GoogleCallbackPageProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');
  const [lang, setLang] = useState<Language>('ar');

  useEffect(() => {
    const initLang = async () => {
      const resolvedParams = await params;
      setLang(resolvedParams.lang);
    };
    initLang();
  }, [params]);

  useEffect(() => {
    const handleGoogleCallback = async () => {
      try {
        console.log('🔄 Processing Google OAuth callback...');
        
        // الحصول على parameters من URL
        const code = searchParams?.get('code');
        const state = searchParams?.get('state');
        const error = searchParams?.get('error');
        
        console.log('📋 Callback parameters:', { code: !!code, state, error });
        
        if (error) {
          throw new Error(`Google OAuth error: ${error}`);
        }
        
        if (!code) {
          throw new Error('No authorization code received');
        }
        
        // التحقق من state
        const savedState = localStorage.getItem('google_oauth_state');
        if (state !== savedState) {
          throw new Error('Invalid state parameter');
        }
        
        // تنظيف localStorage
        localStorage.removeItem('google_oauth_state');
        const savedLang = localStorage.getItem('google_oauth_lang') || lang;
        localStorage.removeItem('google_oauth_lang');
        
        console.log('✅ State verified, exchanging code for token...');
        
        // استبدال code بـ access token
        const response = await fetch('/api/auth/google-exchange', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            code,
            redirectUri: `${window.location.origin}/${savedLang}/auth/google-callback`
          }),
        });
        
        if (!response.ok) {
          throw new Error(`Token exchange failed: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('✅ Token exchange successful:', data);
        
        // حفظ معلومات المستخدم
        if (data.user) {
          localStorage.setItem('user', JSON.stringify(data.user));
          localStorage.setItem('access_token', data.access_token);
        }
        
        setStatus('success');
        setMessage(lang === 'ar' ? 'تم تسجيل الدخول بنجاح!' : 'Successfully signed in!');
        
        // إعادة توجيه إلى Dashboard بعد ثانيتين
        setTimeout(() => {
          router.push(`/${savedLang}/dashboard`);
        }, 2000);
        
      } catch (error: any) {
        console.error('❌ Google callback error:', error);
        setStatus('error');
        setMessage(error.message || (lang === 'ar' ? 'حدث خطأ أثناء تسجيل الدخول' : 'An error occurred during sign in'));
        
        // إعادة توجيه إلى صفحة تسجيل الدخول بعد 3 ثوان
        setTimeout(() => {
          router.push(`/${lang}/auth/login`);
        }, 3000);
      }
    };

    if (searchParams) {
      handleGoogleCallback();
    }
  }, [searchParams, router, lang]);

  const isRTL = lang === 'ar';

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className={`text-center ${isRTL ? 'text-right' : 'text-left'}`}>
            {lang === 'ar' ? 'تسجيل الدخول بـ Google' : 'Google Sign-In'}
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          {status === 'loading' && (
            <>
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-gray-600">
                {lang === 'ar' ? 'جاري معالجة تسجيل الدخول...' : 'Processing sign in...'}
              </p>
            </>
          )}
          
          {status === 'success' && (
            <>
              <div className="text-green-600 text-4xl mb-4">✅</div>
              <p className="text-green-600 font-semibold">{message}</p>
              <p className="text-gray-600 text-sm">
                {lang === 'ar' ? 'جاري إعادة التوجيه...' : 'Redirecting...'}
              </p>
            </>
          )}
          
          {status === 'error' && (
            <>
              <div className="text-red-600 text-4xl mb-4">❌</div>
              <p className="text-red-600 font-semibold">{message}</p>
              <p className="text-gray-600 text-sm">
                {lang === 'ar' ? 'جاري إعادة التوجيه إلى صفحة تسجيل الدخول...' : 'Redirecting to login page...'}
              </p>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
