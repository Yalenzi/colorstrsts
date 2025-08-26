'use client';

import React, { useState } from 'react';
import { useAuth } from '@/components/safe-providers';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';

export function GoogleSignInTest() {
  const { user, signInWithGoogle, logout } = useAuth();
  const [loading, setLoading] = useState(false);
  const [testResults, setTestResults] = useState<string[]>([]);

  const addTestResult = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setTestResults(prev => [...prev, `[${timestamp}] ${message}`]);
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    addTestResult('🔄 Starting Google Sign-In test...');
    
    try {
      // Test environment detection
      addTestResult(`🌍 Environment: ${typeof window !== 'undefined' ? 'Browser' : 'Server'}`);
      addTestResult(`🔗 Current URL: ${typeof window !== 'undefined' ? window.location.href : 'N/A'}`);
      
      // Test Firebase config
      addTestResult('🔧 Testing Firebase configuration...');
      
      // Call Google Sign-In
      addTestResult('📞 Calling signInWithGoogle...');
      await signInWithGoogle();
      
      addTestResult('✅ Google Sign-In successful!');
      toast.success('تم تسجيل الدخول بـ Google بنجاح!');
      
    } catch (error: any) {
      addTestResult(`❌ Google Sign-In failed: ${error.message}`);
      addTestResult(`🔍 Error code: ${error.code || 'N/A'}`);
      addTestResult(`📋 Error stack: ${error.stack || 'N/A'}`);
      
      console.error('Google Sign-In Test Error:', error);
      toast.error(`خطأ في تسجيل الدخول: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      addTestResult('🔄 Starting logout...');
      await logout();
      addTestResult('✅ Logout successful!');
      toast.success('تم تسجيل الخروج بنجاح!');
    } catch (error: any) {
      addTestResult(`❌ Logout failed: ${error.message}`);
      toast.error(`خطأ في تسجيل الخروج: ${error.message}`);
    }
  };

  const clearResults = () => {
    setTestResults([]);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>🧪 Google Sign-In Test</CardTitle>
          <CardDescription>
            اختبار تسجيل الدخول بـ Google مع Firebase
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Current User Status */}
          <div className="p-4 bg-gray-50 rounded-lg">
            <h3 className="font-semibold mb-2">حالة المستخدم الحالية:</h3>
            {user ? (
              <div className="space-y-2">
                <p>✅ مسجل الدخول</p>
                <p><strong>البريد الإلكتروني:</strong> {user.email}</p>
                <p><strong>الاسم:</strong> {user.displayName || 'غير محدد'}</p>
                <p><strong>UID:</strong> {user.uid}</p>
              </div>
            ) : (
              <p>❌ غير مسجل الدخول</p>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4">
            {!user ? (
              <Button 
                onClick={handleGoogleSignIn} 
                disabled={loading}
                className="flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    جاري تسجيل الدخول...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    اختبار تسجيل الدخول بـ Google
                  </>
                )}
              </Button>
            ) : (
              <Button onClick={handleLogout} variant="outline">
                تسجيل الخروج
              </Button>
            )}
            
            <Button onClick={clearResults} variant="secondary">
              مسح النتائج
            </Button>
          </div>

          {/* Test Results */}
          {testResults.length > 0 && (
            <div className="mt-6">
              <h3 className="font-semibold mb-2">📋 نتائج الاختبار:</h3>
              <div className="bg-black text-green-400 p-4 rounded-lg font-mono text-sm max-h-96 overflow-y-auto">
                {testResults.map((result, index) => (
                  <div key={index} className="mb-1">
                    {result}
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
