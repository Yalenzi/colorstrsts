'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from './AuthProvider';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  ExclamationTriangleIcon, 
  InformationCircleIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';

interface EnhancedGoogleSignInProps {
  lang: 'ar' | 'en';
  onSuccess?: () => void;
  onError?: (error: string) => void;
  className?: string;
}

export default function EnhancedGoogleSignIn({ 
  lang, 
  onSuccess, 
  onError, 
  className = '' 
}: EnhancedGoogleSignInProps) {
  const { signInWithGoogle } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [useRedirect, setUseRedirect] = useState(false);
  const [isProduction, setIsProduction] = useState(false);

  const isRTL = lang === 'ar';
  const maxRetries = 2;

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const domain = window.location.hostname;
      setIsProduction(domain === 'colorstest.com' || domain === 'www.colorstest.com');
    }
  }, []);

  const handleGoogleSignIn = async (forceRedirect = false) => {
    setLoading(true);
    setError(null);

    try {
      // إذا كان في الإنتاج وفشل popup مرتين، استخدم redirect
      if (forceRedirect || (isProduction && retryCount >= 1)) {
        console.log('🔄 Using redirect method for Google Sign-In...');
        setUseRedirect(true);
        
        // استخدام redirect مباشرة
        const { GoogleAuthProvider, signInWithRedirect } = await import('firebase/auth');
        const { auth } = await import('@/lib/firebase');
        
        const provider = new GoogleAuthProvider();
        provider.addScope('email');
        provider.addScope('profile');
        provider.setCustomParameters({
          prompt: 'select_account'
        });

        await signInWithRedirect(auth, provider);
        return; // سيتم إعادة التوجيه
      }

      // محاولة popup أولاً
      await signInWithGoogle();
      
      if (onSuccess) {
        onSuccess();
      }
      
      // إعادة تعيين العداد عند النجاح
      setRetryCount(0);
      
    } catch (error: any) {
      console.error('Enhanced Google Sign-In Error:', error);
      
      const errorMessage = error.message || 'خطأ في تسجيل الدخول بـ Google';
      setError(errorMessage);
      
      if (onError) {
        onError(errorMessage);
      }

      // زيادة عداد المحاولات
      setRetryCount(prev => prev + 1);

      // إذا كان الخطأ internal-error أو unauthorized-domain، اقترح redirect
      if (error.code === 'auth/internal-error' || 
          error.code === 'auth/unauthorized-domain' ||
          error.code === 'auth/popup-blocked') {
        setUseRedirect(true);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRetryWithRedirect = () => {
    handleGoogleSignIn(true);
  };

  const texts = {
    signInWithGoogle: isRTL ? 'تسجيل الدخول بـ Google' : 'Sign in with Google',
    signingIn: isRTL ? 'جاري تسجيل الدخول...' : 'Signing in...',
    redirecting: isRTL ? 'جاري إعادة التوجيه...' : 'Redirecting...',
    errorOccurred: isRTL ? 'حدث خطأ' : 'Error Occurred',
    tryRedirect: isRTL ? 'جرب إعادة التوجيه' : 'Try Redirect',
    popupBlocked: isRTL ? 'النافذة المنبثقة محجوبة' : 'Popup Blocked',
    popupBlockedMessage: isRTL 
      ? 'يبدو أن النوافذ المنبثقة محجوبة. سنستخدم إعادة التوجيه بدلاً من ذلك.'
      : 'Popups seem to be blocked. We\'ll use redirect instead.',
    productionIssue: isRTL ? 'مشكلة في الإنتاج' : 'Production Issue',
    productionMessage: isRTL 
      ? 'قد تكون هناك مشكلة في إعدادات Firebase للإنتاج. جرب إعادة التوجيه.'
      : 'There might be a Firebase configuration issue in production. Try redirect.',
    retry: isRTL ? 'إعادة المحاولة' : 'Retry'
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Error Display */}
      {error && (
        <Alert className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950">
          <ExclamationTriangleIcon className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800 dark:text-red-200">
            <div className="font-medium">{texts.errorOccurred}</div>
            <div className="text-sm mt-1">{error}</div>
          </AlertDescription>
        </Alert>
      )}

      {/* Production Issue Warning */}
      {isProduction && retryCount > 0 && (
        <Alert className="border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-950">
          <InformationCircleIcon className="h-4 w-4 text-yellow-600" />
          <AlertDescription className="text-yellow-800 dark:text-yellow-200">
            <div className="font-medium">{texts.productionIssue}</div>
            <div className="text-sm mt-1">{texts.productionMessage}</div>
          </AlertDescription>
        </Alert>
      )}

      {/* Popup Blocked Warning */}
      {useRedirect && !loading && (
        <Alert className="border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950">
          <InformationCircleIcon className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-800 dark:text-blue-200">
            <div className="font-medium">{texts.popupBlocked}</div>
            <div className="text-sm mt-1">{texts.popupBlockedMessage}</div>
          </AlertDescription>
        </Alert>
      )}

      {/* Main Sign-In Button */}
      <Button
        onClick={() => handleGoogleSignIn()}
        disabled={loading}
        className="w-full bg-white hover:bg-gray-50 text-gray-900 border border-gray-300 shadow-sm"
      >
        {loading ? (
          <>
            <ArrowPathIcon className="h-4 w-4 mr-2 animate-spin" />
            {useRedirect ? texts.redirecting : texts.signingIn}
          </>
        ) : (
          <>
            <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            {texts.signInWithGoogle}
          </>
        )}
      </Button>

      {/* Retry with Redirect Button */}
      {error && retryCount < maxRetries && !loading && (
        <div className="flex gap-2">
          <Button
            onClick={() => handleGoogleSignIn()}
            variant="outline"
            className="flex-1"
          >
            {texts.retry}
          </Button>
          
          {!useRedirect && (
            <Button
              onClick={handleRetryWithRedirect}
              variant="outline"
              className="flex-1"
            >
              {texts.tryRedirect}
            </Button>
          )}
        </div>
      )}

      {/* Max Retries Reached */}
      {retryCount >= maxRetries && !loading && (
        <Alert className="border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-950">
          <ExclamationTriangleIcon className="h-4 w-4 text-orange-600" />
          <AlertDescription className="text-orange-800 dark:text-orange-200">
            <div className="font-medium">
              {isRTL ? 'تم تجاوز عدد المحاولات المسموح' : 'Maximum retry attempts reached'}
            </div>
            <div className="text-sm mt-1">
              {isRTL 
                ? 'يرجى المحاولة مرة أخرى لاحقاً أو التواصل مع الدعم الفني'
                : 'Please try again later or contact technical support'
              }
            </div>
            <Button
              onClick={handleRetryWithRedirect}
              size="sm"
              className="mt-2"
            >
              {texts.tryRedirect}
            </Button>
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
