'use client';

import { useEffect, useState } from 'react';
import { initializeSystem, checkSystemHealth } from '@/lib/firebase-setup';

interface SystemInitializerProps {
  children: React.ReactNode;
}

export function SystemInitializer({ children }: SystemInitializerProps) {
  const [initialized, setInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const initSystem = async () => {
      try {
        console.log('🚀 SystemInitializer: Starting system initialization...');
        
        // فحص حالة النظام أولاً
        const health = await checkSystemHealth();
        console.log('🔍 System health:', health);
        
        // تهيئة النظام إذا لم يكن مهيأ
        if (!health.contentSettings) {
          console.log('⚙️ System needs initialization...');
          const result = await initializeSystem();
          
          if (!result) {
            throw new Error('Failed to initialize system');
          }
        }
        
        if (isMounted) {
          setInitialized(true);
          console.log('✅ SystemInitializer: System ready');
        }
      } catch (err) {
        console.error('❌ SystemInitializer: Initialization failed:', err);
        if (isMounted) {
          setError(err instanceof Error ? err.message : 'System initialization failed');
        }
      }
    };

    initSystem();

    return () => {
      isMounted = false;
    };
  }, []);

  // عرض شاشة التحميل أثناء التهيئة
  if (!initialized && !error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            تهيئة النظام...
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            جاري إعداد النظام للاستخدام
          </p>
        </div>
      </div>
    );
  }

  // عرض رسالة خطأ إذا فشلت التهيئة
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            خطأ في تهيئة النظام
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            {error}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            إعادة المحاولة
          </button>
        </div>
      </div>
    );
  }

  // عرض التطبيق بعد التهيئة الناجحة
  return <>{children}</>;
}
