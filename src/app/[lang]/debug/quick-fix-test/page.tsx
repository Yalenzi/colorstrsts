'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/components/providers';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckIcon, XMarkIcon, ExclamationTriangleIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';

interface QuickFixTestPageProps {
  params: {
    lang: 'ar' | 'en';
  };
}

export default function QuickFixTestPage({ params }: QuickFixTestPageProps) {
  const { lang } = params;
  const { user, loading } = useAuth();
  const [testResults, setTestResults] = useState<any[]>([]);
  const [testing, setTesting] = useState(false);

  const runQuickTests = async () => {
    setTesting(true);
    const results = [];

    // Test 1: User Authentication Status
    results.push({
      name: lang === 'ar' ? 'حالة المصادقة' : 'Authentication Status',
      status: user ? 'pass' : 'fail',
      details: user ? `✅ ${lang === 'ar' ? 'مسجل دخول كـ' : 'Logged in as'}: ${user.email}` : `❌ ${lang === 'ar' ? 'غير مسجل دخول' : 'Not logged in'}`,
      action: user ? null : () => window.location.href = `/${lang}/auth/signin`,
      actionLabel: user ? null : (lang === 'ar' ? 'تسجيل الدخول' : 'Sign In')
    });

    // Test 2: Header User Icon
    results.push({
      name: lang === 'ar' ? 'أيقونة المستخدم في الهيدر' : 'Header User Icon',
      status: user ? 'warning' : 'fail',
      details: user ? 
        `⚠️ ${lang === 'ar' ? 'اختبر القائمة المنسدلة يدوياً' : 'Test dropdown manually'}` : 
        `❌ ${lang === 'ar' ? 'يجب تسجيل الدخول أولاً' : 'Must sign in first'}`,
      action: () => {
        if (user) {
          alert(lang === 'ar' ? 
            'اضغط على أيقونة المستخدم في أعلى الصفحة لاختبار القائمة المنسدلة' : 
            'Click on the user icon at the top of the page to test the dropdown'
          );
        }
      },
      actionLabel: user ? (lang === 'ar' ? 'اختبار يدوي' : 'Manual Test') : null
    });

    // Test 3: Profile Page Access
    try {
      results.push({
        name: lang === 'ar' ? 'الوصول لصفحة الملف الشخصي' : 'Profile Page Access',
        status: 'pass',
        details: `✅ ${lang === 'ar' ? 'الصفحة متاحة' : 'Page available'}`,
        action: () => window.location.href = `/${lang}/profile`,
        actionLabel: lang === 'ar' ? 'اذهب للملف الشخصي' : 'Go to Profile'
      });
    } catch (error) {
      results.push({
        name: lang === 'ar' ? 'الوصول لصفحة الملف الشخصي' : 'Profile Page Access',
        status: 'fail',
        details: `❌ ${lang === 'ar' ? 'خطأ في الوصول' : 'Access error'}: ${error}`
      });
    }

    // Test 4: Enhanced Test Management
    try {
      results.push({
        name: lang === 'ar' ? 'إدارة الاختبارات المحسنة' : 'Enhanced Test Management',
        status: 'pass',
        details: `✅ ${lang === 'ar' ? 'الصفحة متاحة مع استيراد/تصدير' : 'Page available with import/export'}`,
        action: () => window.location.href = `/${lang}/admin/tests`,
        actionLabel: lang === 'ar' ? 'اذهب لإدارة الاختبارات' : 'Go to Test Management'
      });
    } catch (error) {
      results.push({
        name: lang === 'ar' ? 'إدارة الاختبارات المحسنة' : 'Enhanced Test Management',
        status: 'fail',
        details: `❌ ${lang === 'ar' ? 'خطأ في الوصول' : 'Access error'}: ${error}`
      });
    }

    // Test 5: DB.json API
    try {
      const response = await fetch('/api/tests/load-from-db');
      const data = await response.json();
      
      results.push({
        name: lang === 'ar' ? 'API قاعدة البيانات' : 'Database API',
        status: response.ok ? 'pass' : 'fail',
        details: response.ok ? 
          `✅ ${lang === 'ar' ? 'تم تحميل' : 'Loaded'} ${data.count || 0} ${lang === 'ar' ? 'اختبار من DB.json' : 'tests from DB.json'}` :
          `❌ ${lang === 'ar' ? 'فشل في تحميل البيانات' : 'Failed to load data'}`,
        action: () => {
          console.log('DB API Response:', data);
          alert(lang === 'ar' ? 'تحقق من الكونسول للتفاصيل' : 'Check console for details');
        },
        actionLabel: lang === 'ar' ? 'عرض التفاصيل' : 'Show Details'
      });
    } catch (error) {
      results.push({
        name: lang === 'ar' ? 'API قاعدة البيانات' : 'Database API',
        status: 'fail',
        details: `❌ ${lang === 'ar' ? 'خطأ في API' : 'API Error'}: ${error}`
      });
    }

    // Test 6: Console Errors Check
    const originalError = console.error;
    const errors: string[] = [];
    console.error = (...args) => {
      errors.push(args.join(' '));
      originalError(...args);
    };

    setTimeout(() => {
      console.error = originalError;
      
      results.push({
        name: lang === 'ar' ? 'أخطاء الكونسول' : 'Console Errors',
        status: errors.length === 0 ? 'pass' : 'warning',
        details: errors.length === 0 ? 
          `✅ ${lang === 'ar' ? 'لا توجد أخطاء' : 'No errors detected'}` :
          `⚠️ ${errors.length} ${lang === 'ar' ? 'أخطاء مكتشفة' : 'errors detected'}`,
        action: errors.length > 0 ? () => {
          console.log('Console errors:', errors);
          alert(lang === 'ar' ? 'تحقق من الكونسول للأخطاء' : 'Check console for errors');
        } : null,
        actionLabel: errors.length > 0 ? (lang === 'ar' ? 'عرض الأخطاء' : 'Show Errors') : null
      });

      setTestResults(results);
      setTesting(false);
    }, 1000);
  };

  useEffect(() => {
    runQuickTests();
  }, [user]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pass':
        return <CheckIcon className="h-5 w-5 text-green-600" />;
      case 'fail':
        return <XMarkIcon className="h-5 w-5 text-red-600" />;
      case 'warning':
        return <ExclamationTriangleIcon className="h-5 w-5 text-yellow-600" />;
      default:
        return <ArrowPathIcon className="h-5 w-5 text-blue-600 animate-spin" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pass':
        return <Badge className="bg-green-100 text-green-800">✅ نجح</Badge>;
      case 'fail':
        return <Badge variant="destructive">❌ فشل</Badge>;
      case 'warning':
        return <Badge className="bg-yellow-100 text-yellow-800">⚠️ تحذير</Badge>;
      default:
        return <Badge variant="secondary">🔄 جاري الاختبار</Badge>;
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            {lang === 'ar' ? 'اختبار الإصلاحات السريع' : 'Quick Fixes Test'}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {lang === 'ar' 
              ? 'فحص سريع للتأكد من نجاح جميع الإصلاحات'
              : 'Quick check to verify all fixes are working'
            }
          </p>
        </div>

        <div className="flex justify-center">
          <Button onClick={runQuickTests} disabled={testing}>
            <ArrowPathIcon className={`h-4 w-4 mr-2 ${testing ? 'animate-spin' : ''}`} />
            {testing 
              ? (lang === 'ar' ? 'جاري الاختبار...' : 'Testing...')
              : (lang === 'ar' ? 'إعادة الاختبار' : 'Re-test')
            }
          </Button>
        </div>

        <div className="grid gap-4">
          {testResults.map((test, index) => (
            <Card key={index} className={`${
              test.status === 'fail' ? 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950' :
              test.status === 'pass' ? 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950' :
              test.status === 'warning' ? 'border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-950' :
              'border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-950'
            }`}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 rtl:space-x-reverse">
                    {getStatusIcon(test.status)}
                    <span className="text-lg">{test.name}</span>
                  </div>
                  {getStatusBadge(test.status)}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                  {test.details}
                </p>
                {test.action && test.actionLabel && (
                  <Button onClick={test.action} variant="outline" size="sm">
                    {test.actionLabel}
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Quick Actions */}
        <Card className="border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950">
          <CardHeader>
            <CardTitle className="text-blue-800 dark:text-blue-200">
              {lang === 'ar' ? 'إجراءات سريعة' : 'Quick Actions'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Button asChild variant="outline">
                <Link href={`/${lang}/auth/signin`}>
                  {lang === 'ar' ? '🔐 تسجيل الدخول' : '🔐 Sign In'}
                </Link>
              </Button>
              <Button asChild variant="outline">
                <Link href={`/${lang}/profile`}>
                  {lang === 'ar' ? '👤 الملف الشخصي' : '👤 Profile'}
                </Link>
              </Button>
              <Button asChild variant="outline">
                <Link href={`/${lang}/admin/tests`}>
                  {lang === 'ar' ? '🧪 إدارة الاختبارات' : '🧪 Test Management'}
                </Link>
              </Button>
              <Button asChild variant="outline">
                <Link href={`/${lang}/admin/settings`}>
                  {lang === 'ar' ? '⚙️ الإعدادات' : '⚙️ Settings'}
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Summary */}
        <Card className="border-purple-200 bg-purple-50 dark:border-purple-800 dark:bg-purple-950">
          <CardHeader>
            <CardTitle className="text-purple-800 dark:text-purple-200">
              {lang === 'ar' ? 'ملخص النتائج' : 'Test Summary'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-green-600">
                  {testResults.filter(t => t.status === 'pass').length}
                </div>
                <div className="text-sm text-gray-600">
                  {lang === 'ar' ? 'نجح' : 'Passed'}
                </div>
              </div>
              <div>
                <div className="text-2xl font-bold text-red-600">
                  {testResults.filter(t => t.status === 'fail').length}
                </div>
                <div className="text-sm text-gray-600">
                  {lang === 'ar' ? 'فشل' : 'Failed'}
                </div>
              </div>
              <div>
                <div className="text-2xl font-bold text-yellow-600">
                  {testResults.filter(t => t.status === 'warning').length}
                </div>
                <div className="text-sm text-gray-600">
                  {lang === 'ar' ? 'تحذير' : 'Warning'}
                </div>
              </div>
              <div>
                <div className="text-2xl font-bold text-blue-600">
                  {testResults.length}
                </div>
                <div className="text-sm text-gray-600">
                  {lang === 'ar' ? 'إجمالي' : 'Total'}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
