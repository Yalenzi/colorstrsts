'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from './AuthProvider';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  ExclamationTriangleIcon, 
  InformationCircleIcon,
  ArrowPathIcon,
  GlobeAltIcon
} from '@heroicons/react/24/outline';

interface ProductionAuthFixProps {
  lang: 'ar' | 'en';
}

export default function ProductionAuthFix({ lang }: ProductionAuthFixProps) {
  const { signInWithGoogle } = useAuth();
  const [isProduction, setIsProduction] = useState(false);
  const [currentDomain, setCurrentDomain] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);
  const [isRetrying, setIsRetrying] = useState(false);

  const isRTL = lang === 'ar';

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const domain = window.location.hostname;
      setCurrentDomain(domain);
      setIsProduction(domain === 'colorstest.com' || domain === 'www.colorstest.com');
    }
  }, []);

  const handleGoogleSignInWithFallback = async () => {
    setIsRetrying(true);
    setAuthError(null);

    try {
      await signInWithGoogle();
    } catch (error: any) {
      console.error('Google Sign-In Error:', error);
      setAuthError(error.message);
      
      // إذا كان الخطأ internal-error، اعرض تعليمات للمستخدم
      if (error.code === 'auth/internal-error') {
        setAuthError(
          isRTL 
            ? 'خطأ في إعدادات المصادقة. يرجى المحاولة مرة أخرى أو استخدام طريقة أخرى للدخول.'
            : 'Authentication configuration error. Please try again or use an alternative sign-in method.'
        );
      }
    } finally {
      setIsRetrying(false);
    }
  };

  const texts = {
    title: isRTL ? 'إصلاح مشاكل المصادقة' : 'Authentication Issues Fix',
    description: isRTL ? 'حلول للمشاكل الشائعة في المصادقة' : 'Solutions for common authentication issues',
    productionIssue: isRTL ? 'مشكلة في الإنتاج' : 'Production Issue',
    productionMessage: isRTL 
      ? 'تم اكتشاف أن الموقع يعمل في بيئة الإنتاج. قد تحتاج بعض إعدادات Firebase للتحديث.'
      : 'Production environment detected. Some Firebase settings may need updates.',
    currentDomain: isRTL ? 'النطاق الحالي' : 'Current Domain',
    tryGoogleSignIn: isRTL ? 'جرب تسجيل الدخول بـ Google' : 'Try Google Sign-In',
    retrying: isRTL ? 'جاري المحاولة...' : 'Retrying...',
    errorOccurred: isRTL ? 'حدث خطأ' : 'Error Occurred',
    solutions: isRTL ? 'الحلول المقترحة' : 'Suggested Solutions',
    solution1: isRTL 
      ? '1. تحديث النطاقات المصرح بها في Firebase Console'
      : '1. Update authorized domains in Firebase Console',
    solution2: isRTL 
      ? '2. التحقق من إعدادات OAuth في Google Cloud Console'
      : '2. Check OAuth settings in Google Cloud Console',
    solution3: isRTL 
      ? '3. استخدام redirect بدلاً من popup للمصادقة'
      : '3. Use redirect instead of popup for authentication',
    adminNote: isRTL 
      ? 'ملاحظة للمدير: يرجى إضافة النطاق الحالي للنطاقات المصرح بها في Firebase'
      : 'Admin Note: Please add the current domain to authorized domains in Firebase'
  };

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-4">
      {/* Production Warning */}
      {isProduction && (
        <Alert className="border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-950">
          <ExclamationTriangleIcon className="h-4 w-4 text-yellow-600" />
          <AlertDescription className="text-yellow-800 dark:text-yellow-200">
            <div className="font-medium">{texts.productionIssue}</div>
            <div className="text-sm mt-1">{texts.productionMessage}</div>
          </AlertDescription>
        </Alert>
      )}

      {/* Current Domain Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GlobeAltIcon className="h-5 w-5" />
            {texts.title}
          </CardTitle>
          <CardDescription>{texts.description}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <span className="text-sm font-medium">{texts.currentDomain}:</span>
            <span className="text-sm text-blue-600 dark:text-blue-400">{currentDomain}</span>
          </div>

          {/* Test Google Sign-In */}
          <div className="space-y-2">
            <Button
              onClick={handleGoogleSignInWithFallback}
              disabled={isRetrying}
              className="w-full"
            >
              {isRetrying ? (
                <>
                  <ArrowPathIcon className="h-4 w-4 mr-2 animate-spin" />
                  {texts.retrying}
                </>
              ) : (
                texts.tryGoogleSignIn
              )}
            </Button>

            {authError && (
              <Alert className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950">
                <ExclamationTriangleIcon className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-800 dark:text-red-200">
                  <div className="font-medium">{texts.errorOccurred}</div>
                  <div className="text-sm mt-1">{authError}</div>
                </AlertDescription>
              </Alert>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Solutions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <InformationCircleIcon className="h-5 w-5" />
            {texts.solutions}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm">
            <div className="p-3 border rounded-lg">
              <div className="font-medium text-blue-600 dark:text-blue-400">
                {texts.solution1}
              </div>
              <div className="text-gray-600 dark:text-gray-400 mt-1">
                Firebase Console → Authentication → Settings → Authorized domains
              </div>
              <div className="text-xs text-gray-500 mt-1">
                Add: {currentDomain}
              </div>
            </div>

            <div className="p-3 border rounded-lg">
              <div className="font-medium text-blue-600 dark:text-blue-400">
                {texts.solution2}
              </div>
              <div className="text-gray-600 dark:text-gray-400 mt-1">
                Google Cloud Console → Credentials → OAuth 2.0 Client IDs
              </div>
              <div className="text-xs text-gray-500 mt-1">
                Add: https://{currentDomain}
              </div>
            </div>

            <div className="p-3 border rounded-lg">
              <div className="font-medium text-blue-600 dark:text-blue-400">
                {texts.solution3}
              </div>
              <div className="text-gray-600 dark:text-gray-400 mt-1">
                {isRTL 
                  ? 'النظام يستخدم redirect تلقائياً عند فشل popup'
                  : 'System automatically uses redirect when popup fails'
                }
              </div>
            </div>
          </div>

          {isProduction && (
            <Alert className="mt-4 border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950">
              <InformationCircleIcon className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-blue-800 dark:text-blue-200">
                <div className="font-medium">{texts.adminNote}</div>
                <div className="text-sm mt-1">
                  Domain to add: <code className="bg-blue-100 dark:bg-blue-900 px-1 rounded">{currentDomain}</code>
                </div>
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// Hook للتحقق من حالة الإنتاج
export function useProductionCheck() {
  const [isProduction, setIsProduction] = useState(false);
  const [currentDomain, setCurrentDomain] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const domain = window.location.hostname;
      setCurrentDomain(domain);
      setIsProduction(domain === 'colorstest.com' || domain === 'www.colorstest.com');
    }
  }, []);

  return { isProduction, currentDomain };
}
