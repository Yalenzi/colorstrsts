'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import { Language } from '@/types';

interface SimpleTestAccessGuardProps {
  children: React.ReactNode;
  testIndex: number;
  testId?: string;
  testName?: string;
  lang: Language;
}

export function SimpleTestAccessGuard({ 
  children, 
  testIndex, 
  testId, 
  testName, 
  lang 
}: SimpleTestAccessGuardProps) {
  const { user } = useAuth();
  const [canAccess, setCanAccess] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const isRTL = lang === 'ar';

  useEffect(() => {
    let isMounted = true;

    const checkAccess = async () => {
      try {
        console.log('🔍 SimpleTestAccessGuard: Checking access for test', testIndex);
        
        // منطق بسيط للوصول - أول 3 اختبارات مجانية للجميع
        const freeTests = [0, 1, 2];
        const isFreeTest = freeTests.includes(testIndex);
        
        if (isFreeTest) {
          console.log('✅ Free test access granted');
          if (isMounted) {
            setCanAccess(true);
            setLoading(false);
          }
          return;
        }

        // للاختبارات المدفوعة، تحقق من تسجيل الدخول
        if (!user) {
          console.log('❌ User not logged in for premium test');
          if (isMounted) {
            setCanAccess(false);
            setError('Login required for premium tests');
            setLoading(false);
          }
          return;
        }

        // إذا كان المستخدم مسجل دخول، اسمح بالوصول مؤقتاً
        // (سيتم تطبيق منطق الدفع لاحقاً)
        console.log('✅ Logged in user access granted');
        if (isMounted) {
          setCanAccess(true);
          setLoading(false);
        }

      } catch (err) {
        console.error('❌ Error in SimpleTestAccessGuard:', err);
        if (isMounted) {
          setError('Error checking access');
          setLoading(false);
        }
      }
    };

    checkAccess();

    return () => {
      isMounted = false;
    };
  }, [testIndex, user?.uid]);

  // شاشة التحميل
  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">
            {isRTL ? 'جاري التحقق من الوصول...' : 'Checking access...'}
          </p>
        </div>
      </div>
    );
  }

  // رسالة خطأ
  if (error) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            {isRTL ? 'خطأ في الوصول' : 'Access Error'}
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            {error}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            {isRTL ? 'إعادة المحاولة' : 'Retry'}
          </button>
        </div>
      </div>
    );
  }

  // منع الوصول
  if (!canAccess) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 0h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            {isRTL ? 'اختبار مميز' : 'Premium Test'}
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            {isRTL 
              ? 'هذا الاختبار يتطلب تسجيل الدخول أو اشتراك مميز'
              : 'This test requires login or premium subscription'
            }
          </p>
          <div className="space-y-2">
            <button
              onClick={() => window.location.href = `/${lang}/auth/login`}
              className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
            >
              {isRTL ? 'تسجيل الدخول' : 'Login'}
            </button>
            <button
              onClick={() => window.location.href = `/${lang}/tests`}
              className="w-full bg-gray-200 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-300 transition-colors"
            >
              {isRTL ? 'العودة للاختبارات' : 'Back to Tests'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // السماح بالوصول مع إضافة وظيفة النقر
  const handleTestClick = () => {
    const testUrl = `/${lang}/tests/${testId}`;
    console.log('🔗 Navigating to test:', testUrl);
    window.location.href = testUrl;
  };

  return (
    <div onClick={handleTestClick} className="cursor-pointer">
      {children}
    </div>
  );
}
