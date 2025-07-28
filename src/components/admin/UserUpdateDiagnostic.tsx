'use client';

import { useState, useEffect } from 'react';
import { Language } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { auth, db } from '@/lib/firebase';
import { doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import toast from 'react-hot-toast';
import {
  CheckCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  WrenchScrewdriverIcon,
  ShieldCheckIcon,
  CircleStackIcon as DatabaseIcon
} from '@heroicons/react/24/outline';

interface UserUpdateDiagnosticProps {
  lang: Language;
}

interface DiagnosticResult {
  test: string;
  status: 'success' | 'warning' | 'error';
  message: string;
  details?: string;
}

export function UserUpdateDiagnostic({ lang }: UserUpdateDiagnosticProps) {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [testing, setTesting] = useState(false);
  const [results, setResults] = useState<DiagnosticResult[]>([]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });

    return () => unsubscribe();
  }, []);

  const isRTL = lang === 'ar';

  const texts = {
    title: isRTL ? 'تشخيص مشاكل تحديث المستخدمين' : 'User Update Diagnostic',
    subtitle: isRTL ? 'فحص وإصلاح مشاكل تحديث بيانات المستخدمين' : 'Diagnose and fix user update issues',
    runDiagnostic: isRTL ? 'تشغيل التشخيص' : 'Run Diagnostic',
    testing: isRTL ? 'جاري الفحص...' : 'Testing...',
    
    // Test Names
    authTest: isRTL ? 'فحص المصادقة' : 'Authentication Test',
    permissionTest: isRTL ? 'فحص الصلاحيات' : 'Permission Test',
    firestoreTest: isRTL ? 'فحص اتصال Firestore' : 'Firestore Connection Test',
    updateTest: isRTL ? 'فحص تحديث البيانات' : 'Data Update Test',
    rulesTest: isRTL ? 'فحص قواعد الأمان' : 'Security Rules Test',
    
    // Status
    success: isRTL ? 'نجح' : 'Success',
    warning: isRTL ? 'تحذير' : 'Warning',
    error: isRTL ? 'خطأ' : 'Error',
    
    // Messages
    authSuccess: isRTL ? 'المستخدم مصادق عليه بنجاح' : 'User is authenticated successfully',
    authError: isRTL ? 'المستخدم غير مصادق عليه' : 'User is not authenticated',
    adminSuccess: isRTL ? 'المستخدم لديه صلاحيات إدارية' : 'User has admin privileges',
    adminError: isRTL ? 'المستخدم ليس لديه صلاحيات إدارية' : 'User does not have admin privileges',
    firestoreSuccess: isRTL ? 'الاتصال بـ Firestore يعمل بشكل صحيح' : 'Firestore connection is working',
    firestoreError: isRTL ? 'خطأ في الاتصال بـ Firestore' : 'Firestore connection error',
    updateSuccess: isRTL ? 'تحديث البيانات يعمل بشكل صحيح' : 'Data update is working correctly',
    updateError: isRTL ? 'خطأ في تحديث البيانات' : 'Data update error',
    rulesSuccess: isRTL ? 'قواعد الأمان تسمح بالتحديث' : 'Security rules allow updates',
    rulesError: isRTL ? 'قواعد الأمان تمنع التحديث' : 'Security rules prevent updates',
    
    // Solutions
    solutions: isRTL ? 'الحلول المقترحة' : 'Suggested Solutions',
    loginSolution: isRTL ? 'يرجى تسجيل الدخول كمدير' : 'Please login as an admin',
    permissionSolution: isRTL ? 'تحقق من صلاحيات المستخدم في قاعدة البيانات' : 'Check user permissions in database',
    connectionSolution: isRTL ? 'تحقق من اتصال الإنترنت وإعدادات Firebase' : 'Check internet connection and Firebase settings',
    rulesSolution: isRTL ? 'تحقق من قواعد أمان Firestore' : 'Check Firestore security rules'
  };

  const runDiagnostic = async () => {
    setTesting(true);
    setResults([]);
    const testResults: DiagnosticResult[] = [];

    try {
      // Test 1: Authentication
      console.log('🔍 بدء فحص المصادقة...');
      if (user) {
        testResults.push({
          test: texts.authTest,
          status: 'success',
          message: texts.authSuccess,
          details: `UID: ${user.uid}, Email: ${user.email}`
        });
      } else {
        testResults.push({
          test: texts.authTest,
          status: 'error',
          message: texts.authError,
          details: texts.loginSolution
        });
      }

      // Test 2: Admin Permissions
      console.log('🔍 بدء فحص الصلاحيات...');
      if (user) {
        try {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            const role = userData.role;
            
            if (role === 'admin' || role === 'super_admin') {
              testResults.push({
                test: texts.permissionTest,
                status: 'success',
                message: texts.adminSuccess,
                details: `Role: ${role}`
              });
            } else {
              testResults.push({
                test: texts.permissionTest,
                status: 'error',
                message: texts.adminError,
                details: `Current role: ${role || 'user'}`
              });
            }
          } else {
            testResults.push({
              test: texts.permissionTest,
              status: 'warning',
              message: isRTL ? 'بيانات المستخدم غير موجودة في قاعدة البيانات' : 'User data not found in database',
              details: texts.permissionSolution
            });
          }
        } catch (error: any) {
          testResults.push({
            test: texts.permissionTest,
            status: 'error',
            message: isRTL ? 'خطأ في فحص الصلاحيات' : 'Permission check error',
            details: error.message
          });
        }
      }

      // Test 3: Firestore Connection
      console.log('🔍 بدء فحص اتصال Firestore...');
      try {
        const testDoc = doc(db, 'test', 'connection');
        await getDoc(testDoc);
        testResults.push({
          test: texts.firestoreTest,
          status: 'success',
          message: texts.firestoreSuccess
        });
      } catch (error: any) {
        testResults.push({
          test: texts.firestoreTest,
          status: 'error',
          message: texts.firestoreError,
          details: error.message
        });
      }

      // Test 4: Update Test (if user is admin)
      console.log('🔍 بدء فحص تحديث البيانات...');
      if (user) {
        try {
          // Try to update the current user's lastDiagnostic field
          const userRef = doc(db, 'users', user.uid);
          await updateDoc(userRef, {
            lastDiagnostic: serverTimestamp(),
            diagnosticTest: true
          });
          
          testResults.push({
            test: texts.updateTest,
            status: 'success',
            message: texts.updateSuccess
          });
        } catch (error: any) {
          testResults.push({
            test: texts.updateTest,
            status: 'error',
            message: texts.updateError,
            details: error.message
          });
        }
      }

      // Test 5: Security Rules Test
      console.log('🔍 بدء فحص قواعد الأمان...');
      if (user) {
        try {
          // Try to read another user's document (should fail for non-admins)
          const testUserDoc = doc(db, 'users', 'test-user-id');
          await getDoc(testUserDoc);
          
          testResults.push({
            test: texts.rulesTest,
            status: 'success',
            message: texts.rulesSuccess
          });
        } catch (error: any) {
          if (error.code === 'permission-denied') {
            testResults.push({
              test: texts.rulesTest,
              status: 'warning',
              message: isRTL ? 'قواعد الأمان تعمل بشكل صحيح (منع الوصول غير المصرح)' : 'Security rules working correctly (denied unauthorized access)',
              details: isRTL ? 'هذا طبيعي للمستخدمين العاديين' : 'This is normal for regular users'
            });
          } else {
            testResults.push({
              test: texts.rulesTest,
              status: 'error',
              message: texts.rulesError,
              details: error.message
            });
          }
        }
      }

      setResults(testResults);
      
      // Show summary
      const successCount = testResults.filter(r => r.status === 'success').length;
      const errorCount = testResults.filter(r => r.status === 'error').length;
      
      if (errorCount === 0) {
        toast.success(isRTL ? 'جميع الفحوصات نجحت!' : 'All tests passed!');
      } else {
        toast.error(isRTL ? `${errorCount} فحص فشل من أصل ${testResults.length}` : `${errorCount} of ${testResults.length} tests failed`);
      }

    } catch (error) {
      console.error('خطأ في التشخيص:', error);
      toast.error(isRTL ? 'خطأ في تشغيل التشخيص' : 'Error running diagnostic');
    } finally {
      setTesting(false);
    }
  };

  const getStatusIcon = (status: DiagnosticResult['status']) => {
    switch (status) {
      case 'success':
        return <CheckCircleIcon className="h-5 w-5 text-green-600" />;
      case 'warning':
        return <ExclamationTriangleIcon className="h-5 w-5 text-yellow-600" />;
      case 'error':
        return <ExclamationTriangleIcon className="h-5 w-5 text-red-600" />;
    }
  };

  const getStatusBadge = (status: DiagnosticResult['status']) => {
    const config = {
      success: { color: 'bg-green-100 text-green-800', text: texts.success },
      warning: { color: 'bg-yellow-100 text-yellow-800', text: texts.warning },
      error: { color: 'bg-red-100 text-red-800', text: texts.error }
    };
    
    const statusConfig = config[status] || config.error;
    return <Badge className={statusConfig.color}>{statusConfig.text}</Badge>;
  };

  return (
    <div className={`space-y-6 ${isRTL ? 'rtl' : 'ltr'}`} dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center space-x-2 rtl:space-x-reverse">
            <WrenchScrewdriverIcon className="h-6 w-6" />
            <span>{texts.title}</span>
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            {texts.subtitle}
          </p>
        </div>
        <Button onClick={runDiagnostic} disabled={testing}>
          {testing ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2 rtl:ml-2 rtl:mr-0"></div>
              {texts.testing}
            </>
          ) : (
            <>
              <WrenchScrewdriverIcon className="h-4 w-4 mr-2 rtl:ml-2 rtl:mr-0" />
              {texts.runDiagnostic}
            </>
          )}
        </Button>
      </div>

      {/* Current User Info */}
      {user && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 rtl:space-x-reverse">
              <ShieldCheckIcon className="h-5 w-5" />
              <span>{isRTL ? 'معلومات المستخدم الحالي' : 'Current User Info'}</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium">{isRTL ? 'البريد الإلكتروني:' : 'Email:'}</span>
                <span className="ml-2 rtl:mr-2">{user.email}</span>
              </div>
              <div>
                <span className="font-medium">{isRTL ? 'معرف المستخدم:' : 'User ID:'}</span>
                <span className="ml-2 rtl:mr-2 font-mono text-xs">{user.uid}</span>
              </div>
              <div>
                <span className="font-medium">{isRTL ? 'البريد مؤكد:' : 'Email Verified:'}</span>
                <span className="ml-2 rtl:mr-2">{user.emailVerified ? (isRTL ? 'نعم' : 'Yes') : (isRTL ? 'لا' : 'No')}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Diagnostic Results */}
      {results.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 rtl:space-x-reverse">
              <DatabaseIcon className="h-5 w-5" />
              <span>{isRTL ? 'نتائج التشخيص' : 'Diagnostic Results'}</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {results.map((result, index) => (
                <div key={index} className="flex items-start space-x-3 rtl:space-x-reverse p-4 border border-gray-200 rounded-lg">
                  <div className="flex-shrink-0">
                    {getStatusIcon(result.status)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium text-gray-900 dark:text-white">
                        {result.test}
                      </h3>
                      {getStatusBadge(result.status)}
                    </div>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">
                      {result.message}
                    </p>
                    {result.details && (
                      <p className="text-sm text-gray-500 mt-2 font-mono bg-gray-50 dark:bg-gray-800 p-2 rounded">
                        {result.details}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Instructions */}
      <Alert>
        <InformationCircleIcon className="h-4 w-4" />
        <AlertDescription>
          {isRTL 
            ? 'هذا التشخيص يساعد في تحديد مشاكل تحديث المستخدمين. قم بتشغيله إذا كنت تواجه مشاكل في تحديث بيانات المستخدمين.'
            : 'This diagnostic helps identify user update issues. Run it if you are experiencing problems updating user data.'
          }
        </AlertDescription>
      </Alert>
    </div>
  );
}
