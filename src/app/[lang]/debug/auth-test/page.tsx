'use client';

import React from 'react';
import { AuthProvider } from '@/components/auth/AuthProvider';
import AuthTestSuite from '@/components/debug/AuthTestSuite';

interface AuthTestPageProps {
  params: {
    lang: string;
  };
}

export default function AuthTestPage({ params }: AuthTestPageProps) {
  const { lang } = params;

  return (
    <AuthProvider>
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {lang === 'ar' ? 'اختبار نظام المصادقة' : 'Authentication System Test'}
            </h1>
            <p className="text-gray-600">
              {lang === 'ar' 
                ? 'اختبار شامل لنظام تسجيل الدخول والتسجيل باستخدام Google وBريد الإلكتروني'
                : 'Comprehensive testing for Google OAuth and email authentication system'
              }
            </p>
          </div>
          
          <AuthTestSuite />
        </div>
      </div>
    </AuthProvider>
  );
}
