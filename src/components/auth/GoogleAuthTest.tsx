'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { UnifiedGoogleAuth } from './UnifiedGoogleAuth';
import { useAuth } from './ImprovedAuthProvider';
import { 
  CheckCircleIcon, 
  XCircleIcon, 
  ClockIcon,
  UserIcon,
  ShieldCheckIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { Language } from '@/types';

interface GoogleAuthTestProps {
  lang: Language;
}

export function GoogleAuthTest({ lang }: GoogleAuthTestProps) {
  const { user, userProfile, loading, logout } = useAuth();
  const [testResults, setTestResults] = useState<Array<{
    name: string;
    status: 'pass' | 'fail' | 'warning' | 'pending';
    message: string;
  }>>([]);

  const isRTL = lang === 'ar';

  const texts = {
    ar: {
      title: 'اختبار تسجيل الدخول بـ Google',
      description: 'اختبار شامل لوظائف المصادقة عبر Google Firebase',
      currentUser: 'المستخدم الحالي',
      userProfile: 'ملف المستخدم',
      testResults: 'نتائج الاختبار',
      runTests: 'تشغيل الاختبارات',
      logout: 'تسجيل الخروج',
      signIn: 'تسجيل الدخول',
      email: 'البريد الإلكتروني',
      displayName: 'الاسم',
      verified: 'محقق',
      notVerified: 'غير محقق',
      loading: 'جاري التحميل...',
      noUser: 'لا يوجد مستخدم مسجل',
      testsPassed: 'نجحت الاختبارات',
      testsFailed: 'فشلت الاختبارات',
      testsWarning: 'تحذيرات في الاختبارات'
    },
    en: {
      title: 'Google Sign-In Test',
      description: 'Comprehensive test for Google Firebase authentication',
      currentUser: 'Current User',
      userProfile: 'User Profile',
      testResults: 'Test Results',
      runTests: 'Run Tests',
      logout: 'Logout',
      signIn: 'Sign In',
      email: 'Email',
      displayName: 'Display Name',
      verified: 'Verified',
      notVerified: 'Not Verified',
      loading: 'Loading...',
      noUser: 'No user signed in',
      testsPassed: 'Tests Passed',
      testsFailed: 'Tests Failed',
      testsWarning: 'Tests Warning'
    }
  };

  const t = texts[lang];

  useEffect(() => {
    runSystemTests();
  }, [user]);

  const runSystemTests = () => {
    const results = [];

    // Test 1: Firebase Configuration
    try {
      const { auth } = require('@/lib/firebase');
      if (auth.app.options.apiKey && auth.app.options.projectId) {
        results.push({
          name: isRTL ? 'إعداد Firebase' : 'Firebase Configuration',
          status: 'pass' as const,
          message: isRTL ? 'إعدادات Firebase صحيحة' : 'Firebase config is valid'
        });
      } else {
        results.push({
          name: isRTL ? 'إعداد Firebase' : 'Firebase Configuration',
          status: 'fail' as const,
          message: isRTL ? 'إعدادات Firebase ناقصة' : 'Firebase config incomplete'
        });
      }
    } catch (error) {
      results.push({
        name: isRTL ? 'إعداد Firebase' : 'Firebase Configuration',
        status: 'fail' as const,
        message: isRTL ? 'خطأ في تحميل Firebase' : 'Error loading Firebase'
      });
    }

    // Test 2: Authentication State
    if (user) {
      results.push({
        name: isRTL ? 'حالة المصادقة' : 'Authentication State',
        status: 'pass' as const,
        message: isRTL ? `مسجل كـ ${user.email}` : `Signed in as ${user.email}`
      });

      // Test 3: Email Verification
      if (user.emailVerified) {
        results.push({
          name: isRTL ? 'تحقق البريد الإلكتروني' : 'Email Verification',
          status: 'pass' as const,
          message: isRTL ? 'البريد الإلكتروني محقق' : 'Email is verified'
        });
      } else {
        results.push({
          name: isRTL ? 'تحقق البريد الإلكتروني' : 'Email Verification',
          status: 'warning' as const,
          message: isRTL ? 'البريد الإلكتروني غير محقق' : 'Email not verified'
        });
      }

      // Test 4: User Profile
      if (userProfile) {
        results.push({
          name: isRTL ? 'ملف المستخدم' : 'User Profile',
          status: 'pass' as const,
          message: isRTL ? 'ملف المستخدم محمل' : 'User profile loaded'
        });
      } else {
        results.push({
          name: isRTL ? 'ملف المستخدم' : 'User Profile',
          status: 'warning' as const,
          message: isRTL ? 'ملف المستخدم غير محمل' : 'User profile not loaded'
        });
      }
    } else {
      results.push({
        name: isRTL ? 'حالة المصادقة' : 'Authentication State',
        status: 'pending' as const,
        message: isRTL ? 'لا يوجد مستخدم مسجل' : 'No user signed in'
      });
    }

    // Test 5: Google Provider
    try {
      const { GoogleAuthProvider } = require('firebase/auth');
      if (GoogleAuthProvider) {
        results.push({
          name: isRTL ? 'مزود Google' : 'Google Provider',
          status: 'pass' as const,
          message: isRTL ? 'مزود Google متاح' : 'Google provider available'
        });
      }
    } catch (error) {
      results.push({
        name: isRTL ? 'مزود Google' : 'Google Provider',
        status: 'fail' as const,
        message: isRTL ? 'خطأ في تحميل مزود Google' : 'Error loading Google provider'
      });
    }

    setTestResults(results);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pass':
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
      case 'fail':
        return <XCircleIcon className="h-5 w-5 text-red-500" />;
      case 'warning':
        return <ExclamationTriangleIcon className="h-5 w-5 text-yellow-500" />;
      case 'pending':
        return <ClockIcon className="h-5 w-5 text-gray-500" />;
      default:
        return null;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pass':
        return <Badge className="bg-green-100 text-green-800">✓ {isRTL ? 'نجح' : 'Pass'}</Badge>;
      case 'fail':
        return <Badge className="bg-red-100 text-red-800">✗ {isRTL ? 'فشل' : 'Fail'}</Badge>;
      case 'warning':
        return <Badge className="bg-yellow-100 text-yellow-800">⚠ {isRTL ? 'تحذير' : 'Warning'}</Badge>;
      case 'pending':
        return <Badge className="bg-gray-100 text-gray-800">⏳ {isRTL ? 'انتظار' : 'Pending'}</Badge>;
      default:
        return null;
    }
  };

  const handleSignInSuccess = (user: any) => {
    console.log('✅ Sign-in successful:', user.email);
    runSystemTests();
  };

  const handleSignInError = (error: string) => {
    console.error('❌ Sign-in error:', error);
    runSystemTests();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <ClockIcon className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>{t.loading}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-gray-50 dark:bg-gray-900 p-4 ${isRTL ? 'rtl' : 'ltr'}`} dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShieldCheckIcon className="h-6 w-6" />
              {t.title}
            </CardTitle>
            <CardDescription>{t.description}</CardDescription>
          </CardHeader>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* User Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserIcon className="h-5 w-5" />
                {t.currentUser}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {user ? (
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">{t.email}:</span>
                    <span className="text-sm font-medium">{user.email}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">{t.displayName}:</span>
                    <span className="text-sm font-medium">{user.displayName || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">{isRTL ? 'التحقق' : 'Verified'}:</span>
                    <Badge className={user.emailVerified ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                      {user.emailVerified ? t.verified : t.notVerified}
                    </Badge>
                  </div>
                  <Button onClick={logout} variant="outline" className="w-full mt-4">
                    {t.logout}
                  </Button>
                </div>
              ) : (
                <div className="text-center space-y-4">
                  <p className="text-gray-600 dark:text-gray-400">{t.noUser}</p>
                  <UnifiedGoogleAuth
                    lang={lang}
                    onSuccess={handleSignInSuccess}
                    onError={handleSignInError}
                  />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Test Results */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <CheckCircleIcon className="h-5 w-5" />
                  {t.testResults}
                </CardTitle>
                <Button onClick={runSystemTests} variant="outline" size="sm">
                  {t.runTests}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {testResults.map((result, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(result.status)}
                      <div>
                        <div className="font-medium text-sm">{result.name}</div>
                        <div className="text-xs text-gray-600 dark:text-gray-400">{result.message}</div>
                      </div>
                    </div>
                    {getStatusBadge(result.status)}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Summary */}
        <Card>
          <CardContent className="pt-6">
            <Alert>
              <CheckCircleIcon className="h-4 w-4" />
              <AlertDescription>
                {isRTL 
                  ? 'استخدم هذه الصفحة لاختبار وظائف تسجيل الدخول بـ Google. تأكد من أن جميع الاختبارات تظهر "نجح" قبل الانتقال للإنتاج.'
                  : 'Use this page to test Google sign-in functionality. Make sure all tests show "Pass" before going to production.'
                }
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
