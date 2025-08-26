'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/components/safe-providers';
import { Language } from '@/types';

interface AuthRedirectHandlerProps {
  lang: Language;
}

export function AuthRedirectHandler({ lang }: AuthRedirectHandlerProps) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    // انتظار انتهاء التحميل
    if (loading) return;

    // إذا تم تسجيل الدخول بنجاح
    if (user) {
      console.log('✅ User authenticated, redirecting...');
      console.log('User info:', {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName
      });

      // الحصول على الصفحة المطلوبة من query parameters
      const returnTo = searchParams.get('returnTo');
      const redirectTo = returnTo || `/${lang}/dashboard`;

      console.log('🔄 Redirecting to:', redirectTo);

      // تأخير قصير للتأكد من اكتمال العملية
      setTimeout(() => {
        router.push(redirectTo);
      }, 1500); // زيادة التأخير قليلاً
    } else {
      // إذا لم يكن هناك مستخدم، تحقق من وجود redirect parameters
      const urlParams = new URLSearchParams(window.location.search);
      const hasAuthParams = urlParams.has('code') || urlParams.has('state') || window.location.hash.includes('access_token');

      if (hasAuthParams) {
        console.log('🔍 Found auth parameters in URL, waiting for auth state...');
        console.log('URL params:', Object.fromEntries(urlParams.entries()));
        console.log('URL hash:', window.location.hash);
      }
    }
  }, [user, loading, router, lang, searchParams]);

  // إذا كان المستخدم مسجل الدخول، اعرض رسالة تحميل
  if (user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            {lang === 'ar' ? 'تم تسجيل الدخول بنجاح!' : 'Successfully signed in!'}
          </h2>
          <p className="text-gray-600">
            {lang === 'ar' ? 'جاري إعادة التوجيه...' : 'Redirecting...'}
          </p>
        </div>
      </div>
    );
  }

  return null;
}
