'use client';

import { useState, useEffect } from 'react';
import { Language } from '@/types';
import { useAuth } from '@/components/safe-providers';
import { getTranslationsSync } from '@/lib/translations';
import { Button } from '@/components/ui/button';
import {
  XMarkIcon,
  SparklesIcon,
  BeakerIcon,
  ChartBarIcon,
  UserIcon
} from '@heroicons/react/24/outline';

interface WelcomeMessageProps {
  lang: Language;
}

export function WelcomeMessage({ lang }: WelcomeMessageProps) {
  const { user } = useAuth();
  const t = getTranslationsSync(lang);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // تم تعطيل رسالة الترحيب نهائياً
    // WelcomeMessage is permanently disabled
    setIsVisible(false);
  }, [user]);

  const handleDismiss = () => {
    setIsVisible(false);
    if (user) {
      localStorage.setItem(`welcome_seen_${user.id}`, 'true');
    }
  };

  if (!isVisible || !user) {
    return null;
  }

  const userName = user.full_name || user.email?.split('@')[0] || t('navigation.user');

  return (
    <div className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg p-6 shadow-lg mb-8 relative overflow-hidden border border-gray-200 dark:border-gray-700">
      {/* خلفية زخرفية */}
      <div className="absolute inset-0 bg-gradient-to-r from-gray-50/50 to-transparent dark:from-gray-700/20">
        <div className="absolute top-0 right-0 w-32 h-32 bg-gray-100/30 dark:bg-gray-600/10 rounded-full -translate-y-16 translate-x-16"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-gray-100/20 dark:bg-gray-600/5 rounded-full translate-y-12 -translate-x-12"></div>
      </div>

      {/* زر الإغلاق */}
      <button
        onClick={handleDismiss}
        className="absolute top-4 right-4 rtl:left-4 rtl:right-auto text-white/80 hover:text-white transition-colors"
      >
        <XMarkIcon className="h-5 w-5" />
      </button>

      <div className="relative z-10">
        <div className="flex items-center space-x-3 rtl:space-x-reverse mb-4">
          <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center">
            <SparklesIcon className="h-6 w-6 text-primary-600 dark:text-primary-400" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              {lang === 'ar' ? `مرحباً ${userName}!` : `Welcome ${userName}!`}
            </h2>
            <p className="text-gray-600 dark:text-gray-300">
              {lang === 'ar'
                ? 'نحن سعداء لانضمامك إلينا'
                : "We're excited to have you on board"
              }
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
            <div className="flex items-center space-x-3 rtl:space-x-reverse mb-2">
              <BeakerIcon className="h-5 w-5 text-primary-600 dark:text-primary-400" />
              <h3 className="font-semibold text-gray-900 dark:text-white">
                {lang === 'ar' ? 'ابدأ اختبارك الأول' : 'Start Your First Test'}
              </h3>
            </div>
            <p className="text-gray-600 dark:text-gray-300 text-sm">
              {lang === 'ar'
                ? 'لديك 5 اختبارات مجانية للبدء'
                : 'You have 5 free tests to get started'
              }
            </p>
          </div>

          <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
            <div className="flex items-center space-x-3 rtl:space-x-reverse mb-2">
              <ChartBarIcon className="h-5 w-5 text-primary-600 dark:text-primary-400" />
              <h3 className="font-semibold text-gray-900 dark:text-white">
                {lang === 'ar' ? 'تتبع نتائجك' : 'Track Your Results'}
              </h3>
            </div>
            <p className="text-gray-600 dark:text-gray-300 text-sm">
              {lang === 'ar'
                ? 'احفظ وراجع نتائج اختباراتك'
                : 'Save and review your test results'
              }
            </p>
          </div>

          <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
            <div className="flex items-center space-x-3 rtl:space-x-reverse mb-2">
              <UserIcon className="h-5 w-5 text-primary-600 dark:text-primary-400" />
              <h3 className="font-semibold text-gray-900 dark:text-white">
                {lang === 'ar' ? 'أكمل ملفك الشخصي' : 'Complete Your Profile'}
              </h3>
            </div>
            <p className="text-gray-600 dark:text-gray-300 text-sm">
              {lang === 'ar'
                ? 'أضف معلوماتك لتجربة أفضل'
                : 'Add your info for a better experience'
              }
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <Button
            variant="default"
            asChild
            className="bg-primary-600 text-white hover:bg-primary-700"
          >
            <a href={`/${lang}/tests`}>
              <BeakerIcon className="h-4 w-4 mr-2 rtl:ml-2 rtl:mr-0" />
              {lang === 'ar' ? 'ابدأ اختبار' : 'Start Test'}
            </a>
          </Button>

          <Button
            variant="outline"
            asChild
            className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            <a href={`/${lang}/help`}>
              {lang === 'ar' ? 'تعلم المزيد' : 'Learn More'}
            </a>
          </Button>
        </div>
      </div>
    </div>
  );
}
