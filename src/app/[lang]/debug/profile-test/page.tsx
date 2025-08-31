'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/components/safe-providers';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { UserIcon, CheckIcon, XMarkIcon } from '@heroicons/react/24/outline';

interface ProfileTestPageProps {
  params: {
    lang: 'ar' | 'en';
  };
}

export default function ProfileTestPage({ params }: ProfileTestPageProps) {
  const { lang } = params;
  const { user, loading } = useAuth();
  const [testResults, setTestResults] = useState<any[]>([]);

  useEffect(() => {
    runTests();
  }, [user, loading]);

  const runTests = () => {
    const results = [
      {
        name: 'Authentication Status',
        name_ar: 'حالة المصادقة',
        status: !loading && user ? 'pass' : 'fail',
        details: user ? `User ID: ${user.uid}` : 'No user authenticated',
        details_ar: user ? `معرف المستخدم: ${user.uid}` : 'لا يوجد مستخدم مسجل'
      },
      {
        name: 'User Object',
        name_ar: 'كائن المستخدم',
        status: user && user.email ? 'pass' : 'fail',
        details: user ? `Email: ${user.email}` : 'No user object',
        details_ar: user ? `البريد الإلكتروني: ${user.email}` : 'لا يوجد كائن مستخدم'
      },
      {
        name: 'Profile Route Access',
        name_ar: 'الوصول لصفحة الملف الشخصي',
        status: 'unknown',
        details: 'Click test button to check',
        details_ar: 'اضغط على زر الاختبار للتحقق'
      },
      {
        name: 'Firebase Connection',
        name_ar: 'اتصال Firebase',
        status: typeof window !== 'undefined' && window.firebase ? 'pass' : 'unknown',
        details: 'Firebase SDK availability',
        details_ar: 'توفر Firebase SDK'
      }
    ];

    setTestResults(results);
  };

  const testProfileAccess = () => {
    try {
      window.location.href = `/${lang}/profile`;
    } catch (error) {
      console.error('Error accessing profile:', error);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pass':
        return <CheckIcon className="h-5 w-5 text-green-600" />;
      case 'fail':
        return <XMarkIcon className="h-5 w-5 text-red-600" />;
      default:
        return <div className="h-5 w-5 bg-gray-400 rounded-full" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pass':
        return <Badge className="bg-green-100 text-green-800">Pass</Badge>;
      case 'fail':
        return <Badge variant="destructive">Fail</Badge>;
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            {lang === 'ar' ? 'اختبار الملف الشخصي' : 'Profile Test'}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {lang === 'ar' 
              ? 'تحقق من حالة المصادقة والوصول للملف الشخصي'
              : 'Check authentication status and profile access'
            }
          </p>
        </div>

        {/* Loading State */}
        {loading && (
          <Card className="border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950">
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2 rtl:space-x-reverse text-blue-800 dark:text-blue-200">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                <span className="font-medium">
                  {lang === 'ar' ? 'جاري التحقق من المصادقة...' : 'Checking authentication...'}
                </span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* User Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 rtl:space-x-reverse">
              <UserIcon className="h-6 w-6" />
              <span>{lang === 'ar' ? 'معلومات المستخدم' : 'User Information'}</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {user ? (
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="font-medium">{lang === 'ar' ? 'معرف المستخدم:' : 'User ID:'}</span>
                  <span className="text-sm text-gray-600 dark:text-gray-400">{user.uid}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">{lang === 'ar' ? 'البريد الإلكتروني:' : 'Email:'}</span>
                  <span className="text-sm text-gray-600 dark:text-gray-400">{user.email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">{lang === 'ar' ? 'الاسم المعروض:' : 'Display Name:'}</span>
                  <span className="text-sm text-gray-600 dark:text-gray-400">{user.displayName || 'Not set'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">{lang === 'ar' ? 'البريد مؤكد:' : 'Email Verified:'}</span>
                  <Badge variant={user.emailVerified ? "default" : "secondary"}>
                    {user.emailVerified ? (lang === 'ar' ? 'نعم' : 'Yes') : (lang === 'ar' ? 'لا' : 'No')}
                  </Badge>
                </div>
              </div>
            ) : (
              <div className="text-center py-4">
                <p className="text-gray-600 dark:text-gray-400">
                  {lang === 'ar' ? 'لا يوجد مستخدم مسجل دخول' : 'No user signed in'}
                </p>
                <Button 
                  onClick={() => window.location.href = `/${lang}/auth/signin`}
                  className="mt-2"
                >
                  {lang === 'ar' ? 'تسجيل الدخول' : 'Sign In'}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Test Results */}
        <div className="grid gap-4">
          {testResults.map((test, index) => (
            <Card key={index} className={`${
              test.status === 'fail' ? 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950' :
              test.status === 'pass' ? 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950' :
              'border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-950'
            }`}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 rtl:space-x-reverse">
                    {getStatusIcon(test.status)}
                    <span className="text-lg">{lang === 'ar' ? test.name_ar : test.name}</span>
                  </div>
                  {getStatusBadge(test.status)}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {lang === 'ar' ? test.details_ar : test.details}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-4 rtl:space-x-reverse">
          <Button onClick={runTests} variant="outline" className="flex-1">
            {lang === 'ar' ? 'إعادة الاختبار' : 'Re-run Tests'}
          </Button>
          <Button onClick={testProfileAccess} className="flex-1" disabled={!user}>
            {lang === 'ar' ? 'اختبار الملف الشخصي' : 'Test Profile Access'}
          </Button>
        </div>

        {/* Navigation */}
        <div className="flex space-x-4 rtl:space-x-reverse">
          <Button 
            variant="outline" 
            onClick={() => window.history.back()}
            className="flex-1"
          >
            {lang === 'ar' ? 'العودة' : 'Go Back'}
          </Button>
          <Button 
            onClick={() => window.location.href = `/${lang}`}
            variant="secondary"
            className="flex-1"
          >
            {lang === 'ar' ? 'الصفحة الرئيسية' : 'Home Page'}
          </Button>
        </div>
      </div>
    </div>
  );
}
