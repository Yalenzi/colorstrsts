'use client';

import { useState, useEffect } from 'react';
import { Language } from '@/types';
import { GoogleAuthDiagnostic } from '@/components/auth/GoogleAuthDiagnostic';
import { useAuth } from '@/components/safe-providers';

interface AuthDebugPageProps {
  params: { lang: Language };
}

export default function AuthDebugPage({ params }: AuthDebugPageProps) {
  const lang = params.lang;
  const { user, loading } = useAuth();

  const isRTL = lang === 'ar';

  return (
    <div className={`min-h-screen bg-gray-50 p-4 ${isRTL ? 'rtl' : 'ltr'}`} dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {isRTL ? 'تشخيص مصادقة Google' : 'Google Authentication Debug'}
          </h1>
          <p className="text-gray-600">
            {isRTL 
              ? 'أداة تشخيص لفحص مشاكل تسجيل الدخول بـ Google'
              : 'Diagnostic tool for troubleshooting Google Sign-In issues'
            }
          </p>
        </div>

        {/* Current Auth Status */}
        <div className="bg-white rounded-lg p-6 shadow-sm">
          <h2 className="text-xl font-semibold mb-4">
            {isRTL ? 'حالة المصادقة الحالية' : 'Current Authentication Status'}
          </h2>
          <div className="space-y-2">
            <p>
              <strong>{isRTL ? 'حالة التحميل:' : 'Loading:'}</strong> {loading ? 'Yes' : 'No'}
            </p>
            <p>
              <strong>{isRTL ? 'المستخدم:' : 'User:'}</strong> {user ? user.email : 'Not signed in'}
            </p>
            {user && (
              <div className="mt-4 p-4 bg-green-50 rounded-lg">
                <h3 className="font-medium text-green-800 mb-2">
                  {isRTL ? 'تفاصيل المستخدم' : 'User Details'}
                </h3>
                <div className="text-sm space-y-1">
                  <p><strong>UID:</strong> {user.uid}</p>
                  <p><strong>Email:</strong> {user.email}</p>
                  <p><strong>Display Name:</strong> {user.displayName || 'Not set'}</p>
                  <p><strong>Photo URL:</strong> {user.photoURL ? 'Available' : 'Not set'}</p>
                  <p><strong>Email Verified:</strong> {user.emailVerified ? 'Yes' : 'No'}</p>
                  <p><strong>Provider:</strong> {user.providerData.map(p => p.providerId).join(', ')}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Google Auth Diagnostic */}
        <GoogleAuthDiagnostic />

        {/* Common Issues and Solutions */}
        <div className="bg-white rounded-lg p-6 shadow-sm">
          <h2 className="text-xl font-semibold mb-4">
            {isRTL ? 'المشاكل الشائعة والحلول' : 'Common Issues and Solutions'}
          </h2>
          <div className="space-y-4">
            <div className="border-l-4 border-red-500 pl-4">
              <h3 className="font-medium text-red-800">
                {isRTL ? 'خطأ: unauthorized-domain' : 'Error: unauthorized-domain'}
              </h3>
              <p className="text-sm text-red-600 mt-1">
                {isRTL 
                  ? 'الحل: أضف النطاق الحالي إلى Firebase Console > Authentication > Settings > Authorized domains'
                  : 'Solution: Add current domain to Firebase Console > Authentication > Settings > Authorized domains'
                }
              </p>
            </div>

            <div className="border-l-4 border-yellow-500 pl-4">
              <h3 className="font-medium text-yellow-800">
                {isRTL ? 'خطأ: popup-blocked' : 'Error: popup-blocked'}
              </h3>
              <p className="text-sm text-yellow-600 mt-1">
                {isRTL 
                  ? 'الحل: اسمح بالنوافذ المنبثقة في المتصفح أو استخدم redirect بدلاً من popup'
                  : 'Solution: Allow popups in browser or use redirect instead of popup'
                }
              </p>
            </div>

            <div className="border-l-4 border-blue-500 pl-4">
              <h3 className="font-medium text-blue-800">
                {isRTL ? 'خطأ: internal-error' : 'Error: internal-error'}
              </h3>
              <p className="text-sm text-blue-600 mt-1">
                {isRTL 
                  ? 'الحل: تحقق من إعدادات Firebase وتأكد من صحة API Key و Project ID'
                  : 'Solution: Check Firebase configuration and ensure API Key and Project ID are correct'
                }
              </p>
            </div>

            <div className="border-l-4 border-green-500 pl-4">
              <h3 className="font-medium text-green-800">
                {isRTL ? 'نصائح للتشخيص' : 'Diagnostic Tips'}
              </h3>
              <ul className="text-sm text-green-600 mt-1 space-y-1">
                <li>• {isRTL ? 'افتح Developer Tools (F12) لرؤية الأخطاء في Console' : 'Open Developer Tools (F12) to see errors in Console'}</li>
                <li>• {isRTL ? 'جرب في نافذة incognito لتجنب مشاكل cache' : 'Try in incognito window to avoid cache issues'}</li>
                <li>• {isRTL ? 'تأكد من أن التاريخ والوقت صحيحان في جهازك' : 'Ensure your device date and time are correct'}</li>
                <li>• {isRTL ? 'جرب متصفحات مختلفة (Chrome, Firefox, Safari)' : 'Try different browsers (Chrome, Firefox, Safari)'}</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Firebase Configuration Display */}
        <div className="bg-white rounded-lg p-6 shadow-sm">
          <h2 className="text-xl font-semibold mb-4">
            {isRTL ? 'إعدادات Firebase' : 'Firebase Configuration'}
          </h2>
          <div className="bg-gray-100 p-4 rounded-lg">
            <p className="text-sm text-gray-600 mb-2">
              {isRTL ? 'تحقق من هذه الإعدادات في Firebase Console:' : 'Verify these settings in Firebase Console:'}
            </p>
            <div className="space-y-1 text-sm font-mono">
              <p><strong>Project ID:</strong> colorstests-573ef</p>
              <p><strong>Auth Domain:</strong> colorstests-573ef.firebaseapp.com</p>
              <p><strong>Current Domain:</strong> {typeof window !== 'undefined' ? window.location.hostname : 'Unknown'}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
