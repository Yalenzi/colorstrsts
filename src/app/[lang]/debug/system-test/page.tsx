'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/components/auth/EnhancedAuthProvider';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckIcon, XMarkIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import { databaseColorTestService } from '@/lib/database-color-test-service';
import { getChemicalTestsLocal } from '@/lib/local-data-service';

interface SystemTestPageProps {
  params: {
    lang: 'ar' | 'en';
  };
}

interface TestResult {
  name: string;
  name_ar: string;
  status: 'pass' | 'fail' | 'loading' | 'unknown';
  details: string;
  details_ar: string;
  action?: () => void;
  actionLabel?: string;
  actionLabel_ar?: string;
}

export default function SystemTestPage({ params }: SystemTestPageProps) {
  const { lang } = params;
  const { user } = useAuth();
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [testing, setTesting] = useState(false);

  const runSystemTests = async () => {
    setTesting(true);
    const results: TestResult[] = [];

    // Test 1: Chemical Components in Database
    try {
      const tests = await databaseColorTestService.getAllTests();
      const hasChemicalComponents = tests.some(test => test.chemical_components && test.chemical_components.length > 0);
      
      results.push({
        name: 'Chemical Components in Database',
        name_ar: 'المكونات الكيميائية في قاعدة البيانات',
        status: hasChemicalComponents ? 'pass' : 'fail',
        details: hasChemicalComponents ? `Found tests with chemical components` : 'No chemical components found',
        details_ar: hasChemicalComponents ? 'تم العثور على اختبارات تحتوي على مكونات كيميائية' : 'لم يتم العثور على مكونات كيميائية'
      });
    } catch (error) {
      results.push({
        name: 'Chemical Components in Database',
        name_ar: 'المكونات الكيميائية في قاعدة البيانات',
        status: 'fail',
        details: `Error: ${error}`,
        details_ar: `خطأ: ${error}`
      });
    }

    // Test 2: Save API Functionality
    try {
      const response = await fetch('/api/save-tests', {
        method: 'GET'
      });
      
      results.push({
        name: 'Save API Endpoint',
        name_ar: 'نقطة نهاية API للحفظ',
        status: response.ok ? 'pass' : 'fail',
        details: response.ok ? 'API endpoint is accessible' : `HTTP ${response.status}`,
        details_ar: response.ok ? 'نقطة نهاية API متاحة' : `HTTP ${response.status}`,
        action: () => testSaveAPI(),
        actionLabel: 'Test Save',
        actionLabel_ar: 'اختبار الحفظ'
      });
    } catch (error) {
      results.push({
        name: 'Save API Endpoint',
        name_ar: 'نقطة نهاية API للحفظ',
        status: 'fail',
        details: `Error: ${error}`,
        details_ar: `خطأ: ${error}`
      });
    }

    // Test 3: Data Synchronization
    try {
      const dbTests = await databaseColorTestService.getAllTests();
      const localTests = getChemicalTestsLocal();
      
      results.push({
        name: 'Data Synchronization',
        name_ar: 'مزامنة البيانات',
        status: dbTests.length === localTests.length ? 'pass' : 'fail',
        details: `DB: ${dbTests.length}, Local: ${localTests.length}`,
        details_ar: `قاعدة البيانات: ${dbTests.length}، محلي: ${localTests.length}`,
        action: () => forceSyncData(),
        actionLabel: 'Force Sync',
        actionLabel_ar: 'إجبار المزامنة'
      });
    } catch (error) {
      results.push({
        name: 'Data Synchronization',
        name_ar: 'مزامنة البيانات',
        status: 'fail',
        details: `Error: ${error}`,
        details_ar: `خطأ: ${error}`
      });
    }

    // Test 4: User Authentication
    results.push({
      name: 'User Authentication',
      name_ar: 'مصادقة المستخدم',
      status: user ? 'pass' : 'fail',
      details: user ? `User: ${user.email}` : 'No user authenticated',
      details_ar: user ? `المستخدم: ${user.email}` : 'لا يوجد مستخدم مصادق'
    });

    // Test 5: Profile Dropdown (simulated)
    results.push({
      name: 'Profile Dropdown Functionality',
      name_ar: 'وظيفة القائمة المنسدلة للملف الشخصي',
      status: 'unknown',
      details: 'Manual test required - check header dropdown',
      details_ar: 'مطلوب اختبار يدوي - تحقق من القائمة المنسدلة في الهيدر',
      action: () => window.location.href = `/${lang}/profile`,
      actionLabel: 'Test Profile',
      actionLabel_ar: 'اختبار الملف الشخصي'
    });

    setTestResults(results);
    setTesting(false);
  };

  const testSaveAPI = async () => {
    try {
      const tests = await databaseColorTestService.getAllTests();
      const testData = tests.slice(0, 3); // Test with first 3 tests
      
      const response = await fetch('/api/save-tests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ tests: testData }),
      });

      if (response.ok) {
        alert(lang === 'ar' ? 'تم اختبار API بنجاح!' : 'API test successful!');
      } else {
        const error = await response.json();
        alert(lang === 'ar' ? `فشل اختبار API: ${error.error}` : `API test failed: ${error.error}`);
      }
    } catch (error) {
      alert(lang === 'ar' ? `خطأ في اختبار API: ${error}` : `API test error: ${error}`);
    }
  };

  const forceSyncData = async () => {
    try {
      await databaseColorTestService.forceReload();
      alert(lang === 'ar' ? 'تم إجبار إعادة تحميل البيانات!' : 'Forced data reload successful!');
      runSystemTests(); // Re-run tests
    } catch (error) {
      alert(lang === 'ar' ? `فشل في إعادة التحميل: ${error}` : `Reload failed: ${error}`);
    }
  };

  useEffect(() => {
    runSystemTests();
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pass':
        return <CheckIcon className="h-5 w-5 text-green-600" />;
      case 'fail':
        return <XMarkIcon className="h-5 w-5 text-red-600" />;
      case 'loading':
        return <ArrowPathIcon className="h-5 w-5 text-blue-600 animate-spin" />;
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
      case 'loading':
        return <Badge variant="secondary">Loading</Badge>;
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            {lang === 'ar' ? 'اختبار النظام الشامل' : 'Comprehensive System Test'}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {lang === 'ar' 
              ? 'فحص جميع مكونات النظام والتأكد من عملها بشكل صحيح'
              : 'Test all system components and ensure they work correctly'
            }
          </p>
        </div>

        <div className="flex justify-center">
          <Button onClick={runSystemTests} disabled={testing}>
            <ArrowPathIcon className={`h-4 w-4 mr-2 ${testing ? 'animate-spin' : ''}`} />
            {testing 
              ? (lang === 'ar' ? 'جاري الاختبار...' : 'Testing...')
              : (lang === 'ar' ? 'إعادة تشغيل الاختبارات' : 'Re-run Tests')
            }
          </Button>
        </div>

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
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                  {lang === 'ar' ? test.details_ar : test.details}
                </p>
                {test.action && (
                  <Button onClick={test.action} variant="outline" size="sm">
                    {lang === 'ar' ? test.actionLabel_ar : test.actionLabel}
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Summary */}
        <Card className="border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950">
          <CardHeader>
            <CardTitle className="text-blue-800 dark:text-blue-200">
              {lang === 'ar' ? 'ملخص النتائج' : 'Test Summary'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>{lang === 'ar' ? 'الاختبارات الناجحة:' : 'Passed tests:'}</span>
                <span className="font-bold text-green-600">
                  {testResults.filter(t => t.status === 'pass').length}
                </span>
              </div>
              <div className="flex justify-between">
                <span>{lang === 'ar' ? 'الاختبارات الفاشلة:' : 'Failed tests:'}</span>
                <span className="font-bold text-red-600">
                  {testResults.filter(t => t.status === 'fail').length}
                </span>
              </div>
              <div className="flex justify-between">
                <span>{lang === 'ar' ? 'إجمالي الاختبارات:' : 'Total tests:'}</span>
                <span className="font-bold text-blue-600">
                  {testResults.length}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

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
            onClick={() => window.location.href = `/${lang}/admin/tests`}
            className="flex-1"
          >
            {lang === 'ar' ? 'إدارة الاختبارات' : 'Test Management'}
          </Button>
        </div>
      </div>
    </div>
  );
}
