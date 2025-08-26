'use client';

import React, { useState, useEffect } from 'react';
import { getRedirectResult, onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Language } from '@/types';

interface GoogleSignInDebuggerProps {
  lang: Language;
}

export function GoogleSignInDebugger({ lang }: GoogleSignInDebuggerProps) {
  const [debugInfo, setDebugInfo] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null);
  const isRTL = lang === 'ar';

  const addDebugInfo = (message: string, data?: any) => {
    const timestamp = new Date().toLocaleTimeString();
    setDebugInfo(prev => [...prev, { timestamp, message, data }]);
    console.log(`[${timestamp}] ${message}`, data || '');
  };

  useEffect(() => {
    addDebugInfo('🔄 GoogleSignInDebugger mounted');
    
    // مراقبة حالة المصادقة
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      addDebugInfo('👤 Auth state changed', {
        user: user ? {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName
        } : null
      });
      setUser(user);
    });

    // فحص redirect result
    const checkRedirect = async () => {
      try {
        addDebugInfo('🔍 Checking redirect result...');
        
        const result = await getRedirectResult(auth);
        
        if (result) {
          addDebugInfo('✅ Redirect result found!', {
            user: {
              uid: result.user.uid,
              email: result.user.email,
              displayName: result.user.displayName
            },
            credential: result.credential ? 'Present' : 'None',
            operationType: result.operationType
          });
        } else {
          addDebugInfo('ℹ️ No redirect result found');
          
          // فحص URL parameters
          const urlParams = new URLSearchParams(window.location.search);
          const urlHash = window.location.hash;
          
          addDebugInfo('🔗 URL Info', {
            search: window.location.search,
            hash: urlHash,
            pathname: window.location.pathname,
            params: Object.fromEntries(urlParams.entries())
          });
        }
      } catch (error: any) {
        addDebugInfo('❌ Redirect result error', {
          code: error.code,
          message: error.message,
          stack: error.stack
        });
      }
    };

    checkRedirect();

    return () => {
      unsubscribe();
    };
  }, []);

  const clearDebugInfo = () => {
    setDebugInfo([]);
  };

  const testDirectSignIn = async () => {
    try {
      addDebugInfo('🧪 Testing direct sign-in...');
      
      // استيراد dynamic لتجنب SSR issues
      const { signInWithRedirect, GoogleAuthProvider } = await import('firebase/auth');
      
      const provider = new GoogleAuthProvider();
      provider.addScope('email');
      provider.addScope('profile');
      
      addDebugInfo('🔄 Starting redirect...');
      await signInWithRedirect(auth, provider);
      
    } catch (error: any) {
      addDebugInfo('❌ Direct sign-in error', {
        code: error.code,
        message: error.message
      });
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className={isRTL ? 'text-right' : 'text-left'}>
          {isRTL ? 'مشخص Google Sign-In' : 'Google Sign-In Debugger'}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* معلومات المستخدم الحالي */}
        <div className="p-4 bg-gray-50 rounded-lg">
          <h3 className="font-semibold mb-2">
            {isRTL ? 'حالة المستخدم الحالية:' : 'Current User State:'}
          </h3>
          <pre className="text-sm bg-white p-2 rounded border overflow-auto">
            {JSON.stringify(user, null, 2)}
          </pre>
        </div>

        {/* أزرار التحكم */}
        <div className="flex gap-2 flex-wrap">
          <Button onClick={testDirectSignIn} variant="outline">
            {isRTL ? 'اختبار تسجيل الدخول' : 'Test Sign-In'}
          </Button>
          <Button onClick={clearDebugInfo} variant="secondary">
            {isRTL ? 'مسح السجل' : 'Clear Log'}
          </Button>
        </div>

        {/* سجل التشخيص */}
        <div className="space-y-2 max-h-96 overflow-auto">
          <h3 className="font-semibold">
            {isRTL ? 'سجل التشخيص:' : 'Debug Log:'}
          </h3>
          {debugInfo.map((info, index) => (
            <div key={index} className="p-2 bg-gray-50 rounded text-sm">
              <div className="font-mono text-xs text-gray-500">
                [{info.timestamp}]
              </div>
              <div className="font-medium">{info.message}</div>
              {info.data && (
                <pre className="text-xs bg-white p-1 rounded mt-1 overflow-auto">
                  {JSON.stringify(info.data, null, 2)}
                </pre>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
