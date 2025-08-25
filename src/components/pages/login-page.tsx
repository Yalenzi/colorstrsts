'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Language } from '@/types';
import { useAuth } from '@/components/auth/EnhancedAuthProvider';
import { EnhancedLoginForm } from '@/components/auth/EnhancedLoginForm';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

interface AuthPageProps {
  lang: Language;
}

export function AuthPage({ lang }: AuthPageProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading } = useAuth();
  const isRTL = lang === 'ar';

  const redirectTo = searchParams?.get('redirect') || `/${lang}`;

  // إعادة توجيه المستخدم المسجل دخوله
  useEffect(() => {
    if (!loading && user) {
      console.log('✅ User already logged in, redirecting to:', redirectTo);
      router.push(redirectTo);
    }
  }, [user, loading, router, redirectTo]);

  // عرض شاشة التحميل
  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center bg-gray-50 ${isRTL ? 'rtl' : 'ltr'}`}>
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
            <p className="text-gray-600">
              {isRTL ? 'جاري التحميل...' : 'Loading...'}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // إذا كان المستخدم مسجل دخوله، لا تعرض شيئاً (سيتم إعادة التوجيه)
  if (user) {
    return null;
  }

  const handleLoginSuccess = () => {
    console.log('✅ Login successful, redirecting to:', redirectTo);
    router.push(redirectTo);
  };

  return (
    <div className={`min-h-screen flex items-center justify-center bg-gray-50 px-4 ${isRTL ? 'rtl' : 'ltr'}`}>
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {isRTL ? 'مرحباً بك' : 'Welcome Back'}
          </h1>
          <p className="text-gray-600">
            {isRTL
              ? 'سجل دخولك للوصول إلى حسابك'
              : 'Sign in to access your account'
            }
          </p>
        </div>

        <EnhancedLoginForm
          lang={lang}
          onSuccess={handleLoginSuccess}
          redirectTo={redirectTo}
        />

        <div className="mt-8 text-center">
          <p className="text-sm text-gray-600">
            {isRTL
              ? 'بتسجيل الدخول، أنت توافق على '
              : 'By signing in, you agree to our '
            }
            <a href={`/${lang}/terms`} className="text-primary hover:underline">
              {isRTL ? 'الشروط والأحكام' : 'Terms of Service'}
            </a>
            {isRTL ? ' و' : ' and '}
            <a href={`/${lang}/privacy`} className="text-primary hover:underline">
              {isRTL ? 'سياسة الخصوصية' : 'Privacy Policy'}
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
