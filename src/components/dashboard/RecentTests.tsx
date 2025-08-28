'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Language } from '@/types';
import { useAuth } from '@/components/safe-providers';
import { getTranslationsSync } from '@/lib/translations';
import { Button } from '@/components/ui/button';
import { getRecentTestsForDashboard, UserTestResult } from '@/lib/user-test-history';
import {
  BeakerIcon,
  EyeIcon,
  CalendarIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

interface RecentTestsProps {
  lang: Language;
}

export function RecentTests({ lang }: RecentTestsProps) {
  const { user } = useAuth();
  const t = getTranslationsSync(lang);
  const [tests, setTests] = useState<UserTestResult[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadRecentTests = async () => {
      if (!user?.uid) {
        setLoading(false);
        return;
      }

      try {
        console.log('🔄 Loading recent tests for user:', user.uid);
        const recentTests = await getRecentTestsForDashboard(user.uid);
        setTests(recentTests);
        console.log('✅ Loaded recent tests:', recentTests.length);
      } catch (error) {
        console.error('❌ Error loading recent tests:', error);
        setTests([]);
      } finally {
        setLoading(false);
      }
    };

    loadRecentTests();
  }, [user]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(lang === 'ar' ? 'ar-SA' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString(lang === 'ar' ? 'ar-SA' : 'en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getResultIcon = (confidence: string) => {
    const confidenceNum = parseFloat(confidence);
    if (confidenceNum >= 80) {
      return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
    } else if (confidenceNum >= 50) {
      return <ExclamationTriangleIcon className="h-5 w-5 text-yellow-500" />;
    } else {
      return <XCircleIcon className="h-5 w-5 text-red-500" />;
    }
  };

  const getConfidenceColor = (confidence: string) => {
    const confidenceNum = parseFloat(confidence);
    if (confidenceNum >= 80) return 'text-green-600 bg-green-50';
    if (confidenceNum >= 50) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  const getResultText = (result: string) => {
    switch (result) {
      case 'positive':
        return lang === 'ar' ? 'إيجابي' : 'Positive';
      case 'negative':
        return lang === 'ar' ? 'سلبي' : 'Negative';
      case 'inconclusive':
        return lang === 'ar' ? 'غير محدد' : 'Inconclusive';
      default:
        return lang === 'ar' ? 'غير معروف' : 'Unknown';
    }
  };

  const getResultColor = (result: string) => {
    switch (result) {
      case 'positive':
        return 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/20';
      case 'negative':
        return 'text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900/20';
      case 'inconclusive':
        return 'text-yellow-600 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-900/20';
      default:
        return 'text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-900/20';
    }
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-3 rtl:space-x-reverse mb-6">
          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
            <BeakerIcon className="h-5 w-5 text-white" />
          </div>
          <h2 className="text-xl font-bold text-foreground">
            {lang === 'ar' ? 'الاختبارات الأخيرة' : 'Recent Tests'}
          </h2>
        </div>
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="flex items-center space-x-4 rtl:space-x-reverse p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                <div className="w-12 h-12 bg-gray-300 dark:bg-gray-600 rounded-lg"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-1/4"></div>
                  <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-1/2"></div>
                </div>
                <div className="w-20 h-6 bg-gray-300 dark:bg-gray-600 rounded"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3 rtl:space-x-reverse">
          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
            <BeakerIcon className="h-5 w-5 text-white" />
          </div>
          <h2 className="text-xl font-bold text-foreground">
            {lang === 'ar' ? 'الاختبارات الأخيرة' : 'Recent Tests'}
          </h2>
        </div>
        <Button variant="outline" asChild>
          <Link href={`/${lang}/results`}>
            {lang === 'ar' ? 'عرض الكل' : 'View All'}
          </Link>
        </Button>
      </div>

      {tests.length === 0 ? (
        <div className="text-center py-12">
          <BeakerIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
            {lang === 'ar' ? 'لا توجد اختبارات بعد' : 'No tests yet'}
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mb-6">
            {lang === 'ar' 
              ? 'ابدأ اختبارك الأول لرؤية النتائج هنا'
              : 'Start your first test to see results here'
            }
          </p>
          <Button asChild>
            <Link href={`/${lang}/tests`}>
              <BeakerIcon className="h-4 w-4 mr-2 rtl:ml-2 rtl:mr-0" />
              {lang === 'ar' ? 'ابدأ اختبار' : 'Start Test'}
            </Link>
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {tests.map((test) => (
            <div
              key={test.id}
              className="flex items-center space-x-4 rtl:space-x-reverse p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
            >
              {/* عينة اللون */}
              <div className="flex-shrink-0">
                <div
                  className="w-12 h-12 rounded-lg border-2 border-gray-300 dark:border-gray-600"
                  style={{ backgroundColor: test.selectedColor.hex_code }}
                  title={`Color: ${test.selectedColor.hex_code}`}
                />
              </div>

              {/* معلومات الاختبار */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2 rtl:space-x-reverse mb-1">
                  <h3 className="text-lg font-semibold text-foreground">
                    {lang === 'ar' ? test.testNameAr : test.testName}
                  </h3>
                  {getResultIcon(test.result.confidence)}
                </div>

                <div className="flex items-center space-x-4 rtl:space-x-reverse text-sm text-muted-foreground">
                  <div className="flex items-center space-x-1 rtl:space-x-reverse">
                    <CalendarIcon className="h-4 w-4" />
                    <span>{formatDate(test.completedAt)}</span>
                  </div>
                  <div className="flex items-center space-x-1 rtl:space-x-reverse">
                    <ClockIcon className="h-4 w-4" />
                    <span>{formatTime(test.completedAt)}</span>
                  </div>
                </div>

                {test.result.substance && (
                  <div className="mt-2">
                    <div className="flex flex-wrap gap-1">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary-100 text-primary-800 dark:bg-primary-900/20 dark:text-primary-300">
                        {lang === 'ar' ? test.result.substanceAr : test.result.substance}
                      </span>
                    </div>
                  </div>
                )}

                {/* Color name */}
                <div className="mt-1 text-xs text-muted-foreground">
                  {lang === 'ar' ? test.selectedColor.color_name?.ar : test.selectedColor.color_name?.en}
                </div>
              </div>

              {/* النتيجة والإجراءات */}
              <div className="flex-shrink-0 text-right rtl:text-left">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getConfidenceColor(test.result.confidence)}`}>
                  {test.result.confidence}% {lang === 'ar' ? 'ثقة' : 'confidence'}
                </span>
                <div className="mt-2">
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/${lang}/tests/${test.testId}`}>
                      <EyeIcon className="h-4 w-4 mr-1 rtl:ml-1 rtl:mr-0" />
                      {lang === 'ar' ? 'عرض' : 'View'}
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
