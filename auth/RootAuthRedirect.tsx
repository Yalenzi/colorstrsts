'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

interface RootAuthRedirectProps {
  defaultLang?: string;
}

export function RootAuthRedirect({ defaultLang = 'en' }: RootAuthRedirectProps) {
  const router = useRouter();

  useEffect(() => {
    // Detect user's preferred language from browser or localStorage
    let preferredLang = defaultLang;

    if (typeof window !== 'undefined') {
      // Check localStorage first
      const savedLang = localStorage.getItem('preferred-language');
      if (savedLang && ['ar', 'en'].includes(savedLang)) {
        preferredLang = savedLang;
      } else {
        // Fallback to browser language detection
        const browserLang = navigator.language.toLowerCase();
        if (browserLang.startsWith('ar')) {
          preferredLang = 'ar';
        }
      }
    }

    // Redirect to the main app with detected language
    router.replace(`/${preferredLang}`);
  }, [router, defaultLang]);

  // Show loading spinner while redirecting
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 via-white to-secondary-50 dark:from-primary-950 dark:via-gray-900 dark:to-secondary-950">
      <div className="text-center">
        <LoadingSpinner size="lg" />
        <p className="mt-4 text-gray-600 dark:text-gray-400">
          Redirecting...
        </p>
      </div>
    </div>
  );
}
