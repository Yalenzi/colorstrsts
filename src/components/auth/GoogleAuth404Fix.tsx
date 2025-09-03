'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { Loader2, AlertTriangle, CheckCircle } from 'lucide-react';

interface GoogleAuth404FixProps {
  lang?: 'ar' | 'en';
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

export function GoogleAuth404Fix({ 
  lang = 'ar', 
  onSuccess,
  onError 
}: GoogleAuth404FixProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState(1);
  const router = useRouter();
  const isRTL = lang === 'ar';

  const texts = {
    ar: {
      title: 'إصلاح مشكلة 404 في Google Auth',
      subtitle: 'حل مشاكل تسجيل الدخول وإنشاء الحساب',
      step1: 'الخطوة 1: فحص الإعدادات',
      step2: 'الخطوة 2: اختبار الاتصال',
      step3: 'الخطوة 3: تسجيل الدخول',
      checkConfig: 'فحص إعداد Firebase',
      testConnection: 'اختبار الاتصال',
      trySignIn: 'تجربة تسجيل الدخول',
      checking: 'جاري الفحص...',
      testing: 'جاري الاختبار...',
      signingIn: 'جاري تسجيل الدخول...',
      success: 'تم بنجاح!',
      error: 'حدث خطأ',
      configOk: 'إعداد Firebase صحيح',
      connectionOk: 'الاتصال يعمل بشكل جيد',
      signInSuccess: 'تم تسجيل الدخول بنجاح',
      tryAgain: 'إعادة المحاولة',
      goToDashboard: 'الذهاب إلى لوحة التحكم',
      troubleshooting: 'استكشاف الأخطاء',
      commonIssues: 'المشاكل الشائعة وحلولها'
    },
    en: {
      title: 'Google Auth 404 Fix',
      subtitle: 'Resolve sign-in and sign-up issues',
      step1: 'Step 1: Check Configuration',
      step2: 'Step 2: Test Connection',
      step3: 'Step 3: Sign In',
      checkConfig: 'Check Firebase Configuration',
      testConnection: 'Test Connection',
      trySignIn: 'Try Sign In',
      checking: 'Checking...',
      testing: 'Testing...',
      signingIn: 'Signing in...',
      success: 'Success!',
      error: 'Error occurred',
      configOk: 'Firebase configuration is valid',
      connectionOk: 'Connection is working properly',
      signInSuccess: 'Successfully signed in',
      tryAgain: 'Try Again',
      goToDashboard: 'Go to Dashboard',
      troubleshooting: 'Troubleshooting',
      commonIssues: 'Common Issues and Solutions'
    }
  };

  const t = texts[lang];

  const checkFirebaseConfig = async () => {
    setLoading(true);
    setError('');

    try {
      console.log('🔄 Checking Firebase configuration...');
      
      // فحص إعداد Firebase
      const response = await fetch('/api/auth/google');
      const data = await response.json();
      
      if (data.success) {
        toast.success(t.configOk);
        setStep(2);
      } else {
        throw new Error(data.error || 'Configuration check failed');
      }
    } catch (err: any) {
      console.error('❌ Config check failed:', err);
      setError(err.message);
      if (onError) onError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const testConnection = async () => {
    setLoading(true);
    setError('');

    try {
      console.log('🔄 Testing connection...');
      
      // اختبار الاتصال بـ Firebase
      const { auth } = await import('@/lib/firebase');
      const { GoogleAuthProvider } = await import('firebase/auth');
      
      if (auth && GoogleAuthProvider) {
        toast.success(t.connectionOk);
        setStep(3);
      } else {
        throw new Error('Failed to load Firebase modules');
      }
    } catch (err: any) {
      console.error('❌ Connection test failed:', err);
      setError(err.message);
      if (onError) onError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const tryGoogleSignIn = async () => {
    setLoading(true);
    setError('');

    try {
      console.log('🔄 Attempting Google Sign-In...');
      
      const { auth } = await import('@/lib/firebase');
      const { GoogleAuthProvider, signInWithPopup, signInWithRedirect } = await import('firebase/auth');
      
      const provider = new GoogleAuthProvider();
      provider.addScope('email');
      provider.addScope('profile');
      provider.setCustomParameters({
        prompt: 'select_account'
      });

      let result;

      try {
        // محاولة Popup أولاً
        result = await signInWithPopup(auth, provider);
      } catch (popupError: any) {
        console.log('❌ Popup failed, trying redirect:', popupError.code);
        
        if (
          popupError.code === 'auth/popup-blocked' ||
          popupError.code === 'auth/popup-closed-by-user' ||
          popupError.code === 'auth/cancelled-popup-request'
        ) {
          toast.info('النافذة المنبثقة محجوبة، سيتم إعادة التوجيه...');
          await signInWithRedirect(auth, provider);
          return;
        } else {
          throw popupError;
        }
      }

      if (result && result.user) {
        console.log('✅ Google Sign-In successful:', result.user.email);
        toast.success(t.signInSuccess);
        
        if (onSuccess) {
          onSuccess();
        } else {
          // إعادة التوجيه إلى لوحة التحكم
          setTimeout(() => {
            router.push(`/${lang}/dashboard`);
          }, 1500);
        }
      }

    } catch (err: any) {
      console.error('❌ Google Sign-In failed:', err);
      
      let errorMessage = t.error;
      if (err.code === 'auth/unauthorized-domain') {
        errorMessage = 'Domain not authorized in Firebase Console';
      } else if (err.code === 'auth/internal-error') {
        errorMessage = 'Firebase internal error - check configuration';
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
      if (onError) onError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const resetSteps = () => {
    setStep(1);
    setError('');
  };

  return (
    <div className={`max-w-2xl mx-auto p-6 ${isRTL ? 'rtl' : 'ltr'}`} dir={isRTL ? 'rtl' : 'ltr'}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="w-6 h-6 text-orange-600" />
            {t.title}
          </CardTitle>
          <CardDescription>{t.subtitle}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Step 1: Check Configuration */}
          <div className={`p-4 rounded-lg border ${step >= 1 ? 'bg-blue-50 border-blue-200' : 'bg-gray-50 border-gray-200'}`}>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold flex items-center gap-2">
                {step > 1 ? <CheckCircle className="w-5 h-5 text-green-600" /> : '1.'}
                {t.step1}
              </h3>
              {step === 1 && (
                <Button
                  onClick={checkFirebaseConfig}
                  disabled={loading}
                  size="sm"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      {t.checking}
                    </>
                  ) : (
                    t.checkConfig
                  )}
                </Button>
              )}
            </div>
            {step > 1 && <p className="text-sm text-green-600">{t.configOk}</p>}
          </div>

          {/* Step 2: Test Connection */}
          <div className={`p-4 rounded-lg border ${step >= 2 ? 'bg-blue-50 border-blue-200' : 'bg-gray-50 border-gray-200'}`}>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold flex items-center gap-2">
                {step > 2 ? <CheckCircle className="w-5 h-5 text-green-600" /> : '2.'}
                {t.step2}
              </h3>
              {step === 2 && (
                <Button
                  onClick={testConnection}
                  disabled={loading}
                  size="sm"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      {t.testing}
                    </>
                  ) : (
                    t.testConnection
                  )}
                </Button>
              )}
            </div>
            {step > 2 && <p className="text-sm text-green-600">{t.connectionOk}</p>}
          </div>

          {/* Step 3: Try Sign In */}
          <div className={`p-4 rounded-lg border ${step >= 3 ? 'bg-blue-50 border-blue-200' : 'bg-gray-50 border-gray-200'}`}>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold flex items-center gap-2">
                3. {t.step3}
              </h3>
              {step === 3 && (
                <Button
                  onClick={tryGoogleSignIn}
                  disabled={loading}
                  size="sm"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      {t.signingIn}
                    </>
                  ) : (
                    t.trySignIn
                  )}
                </Button>
              )}
            </div>
          </div>

          {/* Reset Button */}
          {(error || step > 1) && (
            <div className="flex gap-2">
              <Button
                onClick={resetSteps}
                variant="outline"
                className="flex-1"
              >
                {t.tryAgain}
              </Button>
              {step > 2 && (
                <Button
                  onClick={() => router.push(`/${lang}/dashboard`)}
                  className="flex-1"
                >
                  {t.goToDashboard}
                </Button>
              )}
            </div>
          )}

          {/* Troubleshooting Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">{t.troubleshooting}</CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-2">
              <p><strong>404 Error:</strong> Usually means Firebase configuration issue</p>
              <p><strong>Popup Blocked:</strong> Browser blocking popups, will try redirect</p>
              <p><strong>Unauthorized Domain:</strong> Domain not added in Firebase Console</p>
              <p><strong>Internal Error:</strong> Firebase project configuration issue</p>
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    </div>
  );
}
