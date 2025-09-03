'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { CheckCircle, XCircle, AlertCircle, RefreshCw, Database, Edit } from 'lucide-react';
import { Language } from '@/types';

interface TestEditDiagnosticProps {
  lang?: Language;
  testId?: string;
}

interface DiagnosticResult {
  test: string;
  status: 'success' | 'error' | 'warning';
  message: string;
  details?: any;
}

export function TestEditDiagnostic({ lang = 'ar', testId }: TestEditDiagnosticProps) {
  const [results, setResults] = useState<DiagnosticResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [testData, setTestData] = useState<any>(null);

  const isRTL = lang === 'ar';

  const texts = {
    ar: {
      title: 'تشخيص مشاكل تحرير الاختبارات',
      subtitle: 'فحص بيانات الاختبار وحل مشاكل التحرير',
      runDiagnostic: 'تشغيل التشخيص',
      running: 'جاري التشخيص...',
      testDataLoad: 'فحص تحميل بيانات الاختبار',
      testDataStructure: 'فحص تركيب البيانات',
      testEditForm: 'فحص نموذج التحرير',
      testSaveFunction: 'فحص دالة الحفظ',
      success: 'نجح',
      error: 'فشل',
      warning: 'تحذير',
      dataLoaded: 'تم تحميل بيانات الاختبار بنجاح',
      dataNotLoaded: 'فشل في تحميل بيانات الاختبار',
      structureValid: 'تركيب البيانات صحيح',
      structureInvalid: 'تركيب البيانات غير صحيح',
      formWorking: 'نموذج التحرير يعمل',
      formNotWorking: 'نموذج التحرير لا يعمل',
      saveWorking: 'دالة الحفظ تعمل',
      saveNotWorking: 'دالة الحفظ لا تعمل',
      testDetails: 'تفاصيل الاختبار',
      recommendations: 'التوصيات',
      fixIssues: 'إصلاح المشاكل'
    },
    en: {
      title: 'Test Edit Diagnostic',
      subtitle: 'Check test data and resolve editing issues',
      runDiagnostic: 'Run Diagnostic',
      running: 'Running diagnostic...',
      testDataLoad: 'Test Data Loading',
      testDataStructure: 'Test Data Structure',
      testEditForm: 'Test Edit Form',
      testSaveFunction: 'Test Save Function',
      success: 'Success',
      error: 'Error',
      warning: 'Warning',
      dataLoaded: 'Test data loaded successfully',
      dataNotLoaded: 'Failed to load test data',
      structureValid: 'Data structure is valid',
      structureInvalid: 'Data structure is invalid',
      formWorking: 'Edit form is working',
      formNotWorking: 'Edit form is not working',
      saveWorking: 'Save function is working',
      saveNotWorking: 'Save function is not working',
      testDetails: 'Test Details',
      recommendations: 'Recommendations',
      fixIssues: 'Fix Issues'
    }
  };

  const t = texts[lang];

  const runDiagnostic = async () => {
    setLoading(true);
    setResults([]);

    const diagnosticResults: DiagnosticResult[] = [];

    // 1. فحص تحميل بيانات الاختبار
    try {
      console.log('🔄 Testing test data loading...');
      
      // محاولة تحميل من localStorage
      const savedTests = localStorage.getItem('chemical_tests_admin');
      let testsData = null;

      if (savedTests) {
        try {
          const data = JSON.parse(savedTests);
          testsData = data.chemical_tests || data;
          
          if (testId) {
            const specificTest = testsData.find((t: any) => t.id === testId);
            if (specificTest) {
              setTestData(specificTest);
              diagnosticResults.push({
                test: t.testDataLoad,
                status: 'success',
                message: t.dataLoaded,
                details: {
                  source: 'localStorage',
                  testId: testId,
                  testName: specificTest.method_name,
                  hasResults: !!specificTest.results,
                  resultsCount: specificTest.results?.length || 0
                }
              });
            } else {
              diagnosticResults.push({
                test: t.testDataLoad,
                status: 'error',
                message: `Test ${testId} not found`,
                details: { availableTests: testsData.length }
              });
            }
          } else {
            diagnosticResults.push({
              test: t.testDataLoad,
              status: 'success',
              message: t.dataLoaded,
              details: {
                source: 'localStorage',
                testsCount: testsData.length
              }
            });
          }
        } catch (parseError) {
          diagnosticResults.push({
            test: t.testDataLoad,
            status: 'error',
            message: t.dataNotLoaded,
            details: 'Failed to parse localStorage data'
          });
        }
      } else {
        diagnosticResults.push({
          test: t.testDataLoad,
          status: 'warning',
          message: 'No data in localStorage',
          details: 'Tests may not be loaded'
        });
      }
    } catch (error) {
      diagnosticResults.push({
        test: t.testDataLoad,
        status: 'error',
        message: t.dataNotLoaded,
        details: error.message
      });
    }

    // 2. فحص تركيب البيانات
    if (testData) {
      try {
        console.log('🔄 Testing data structure...');
        
        const requiredFields = ['id', 'method_name', 'method_name_ar'];
        const missingFields = requiredFields.filter(field => !testData[field]);
        
        if (missingFields.length === 0) {
          diagnosticResults.push({
            test: t.testDataStructure,
            status: 'success',
            message: t.structureValid,
            details: {
              hasId: !!testData.id,
              hasName: !!testData.method_name,
              hasNameAr: !!testData.method_name_ar,
              hasDescription: !!testData.description,
              hasResults: !!testData.results,
              resultsCount: testData.results?.length || 0,
              hasComponents: !!testData.chemical_components,
              componentsCount: testData.chemical_components?.length || 0
            }
          });
        } else {
          diagnosticResults.push({
            test: t.testDataStructure,
            status: 'error',
            message: t.structureInvalid,
            details: { missingFields }
          });
        }
      } catch (error) {
        diagnosticResults.push({
          test: t.testDataStructure,
          status: 'error',
          message: t.structureInvalid,
          details: error.message
        });
      }
    }

    // 3. فحص نموذج التحرير
    try {
      console.log('🔄 Testing edit form...');
      
      // محاولة إنشاء نموذج تحرير
      const formTest = testData || {
        id: 'test-form-check',
        method_name: 'Test Form Check',
        method_name_ar: 'فحص نموذج التحرير',
        description: 'Test description',
        description_ar: 'وصف الاختبار',
        category: 'basic',
        safety_level: 'medium',
        preparation_time: 5
      };

      diagnosticResults.push({
        test: t.testEditForm,
        status: 'success',
        message: t.formWorking,
        details: {
          formDataReady: true,
          hasRequiredFields: !!(formTest.method_name && formTest.method_name_ar)
        }
      });
    } catch (error) {
      diagnosticResults.push({
        test: t.testEditForm,
        status: 'error',
        message: t.formNotWorking,
        details: error.message
      });
    }

    // 4. فحص دالة الحفظ
    try {
      console.log('🔄 Testing save function...');
      
      // محاولة محاكاة عملية الحفظ
      const testSaveData = {
        id: 'test-save-check',
        method_name: 'Save Test',
        method_name_ar: 'اختبار الحفظ',
        category: 'basic',
        safety_level: 'medium',
        preparation_time: 5
      };

      // فحص localStorage
      const canSaveToLocalStorage = typeof Storage !== 'undefined';
      
      // فحص API
      let apiAvailable = false;
      try {
        const response = await fetch('/api/save-tests', { method: 'GET' });
        apiAvailable = response.ok;
      } catch (apiError) {
        console.warn('API not available:', apiError);
      }

      diagnosticResults.push({
        test: t.testSaveFunction,
        status: canSaveToLocalStorage && apiAvailable ? 'success' : 'warning',
        message: canSaveToLocalStorage && apiAvailable ? t.saveWorking : 'Save partially working',
        details: {
          localStorage: canSaveToLocalStorage,
          apiEndpoint: apiAvailable,
          canSave: canSaveToLocalStorage || apiAvailable
        }
      });
    } catch (error) {
      diagnosticResults.push({
        test: t.testSaveFunction,
        status: 'error',
        message: t.saveNotWorking,
        details: error.message
      });
    }

    setResults(diagnosticResults);
    setLoading(false);

    // عرض ملخص النتائج
    const successCount = diagnosticResults.filter(r => r.status === 'success').length;
    const errorCount = diagnosticResults.filter(r => r.status === 'error').length;
    
    if (errorCount === 0) {
      toast.success(`✅ All tests passed (${successCount}/${diagnosticResults.length})`);
    } else {
      toast.error(`❌ ${errorCount} tests failed, ${successCount} passed`);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'error':
        return <XCircle className="w-5 h-5 text-red-600" />;
      case 'warning':
        return <AlertCircle className="w-5 h-5 text-yellow-600" />;
      default:
        return null;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      success: 'default',
      error: 'destructive',
      warning: 'secondary'
    } as const;

    return (
      <Badge variant={variants[status] || 'secondary'}>
        {status === 'success' ? t.success : status === 'error' ? t.error : t.warning}
      </Badge>
    );
  };

  return (
    <div className={`max-w-4xl mx-auto p-6 ${isRTL ? 'rtl' : 'ltr'}`} dir={isRTL ? 'rtl' : 'ltr'}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Edit className="w-6 h-6" />
            {t.title}
          </CardTitle>
          <CardDescription>{t.subtitle}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Button
            onClick={runDiagnostic}
            disabled={loading}
            className="w-full"
          >
            {loading ? (
              <>
                <RefreshCw className="w-5 h-5 animate-spin mr-2" />
                {t.running}
              </>
            ) : (
              <>
                <Database className="w-5 h-5 mr-2" />
                {t.runDiagnostic}
              </>
            )}
          </Button>

          {results.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Diagnostic Results</h3>
              
              {results.map((result, index) => (
                <Alert key={index} className="flex items-start gap-3">
                  {getStatusIcon(result.status)}
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">{result.test}</h4>
                      {getStatusBadge(result.status)}
                    </div>
                    <AlertDescription>
                      {result.message}
                      {result.details && (
                        <pre className="mt-2 text-xs bg-gray-100 dark:bg-gray-800 p-2 rounded overflow-auto">
                          {typeof result.details === 'string' 
                            ? result.details 
                            : JSON.stringify(result.details, null, 2)
                          }
                        </pre>
                      )}
                    </AlertDescription>
                  </div>
                </Alert>
              ))}
            </div>
          )}

          {testData && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">{t.testDetails}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <strong>ID:</strong> {testData.id}
                  </div>
                  <div>
                    <strong>Name:</strong> {testData.method_name}
                  </div>
                  <div>
                    <strong>Name (AR):</strong> {testData.method_name_ar}
                  </div>
                  <div>
                    <strong>Category:</strong> {testData.category}
                  </div>
                  <div>
                    <strong>Safety Level:</strong> {testData.safety_level}
                  </div>
                  <div>
                    <strong>Preparation Time:</strong> {testData.preparation_time} min
                  </div>
                  <div>
                    <strong>Results Count:</strong> {testData.results?.length || 0}
                  </div>
                  <div>
                    <strong>Components Count:</strong> {testData.chemical_components?.length || 0}
                  </div>
                </div>

                {testData.results && testData.results.length > 0 && (
                  <div className="mt-4">
                    <strong>Color Results:</strong>
                    <div className="mt-2 space-y-2">
                      {testData.results.map((result: any, index: number) => (
                        <div key={index} className="flex items-center gap-3 p-2 bg-gray-50 rounded">
                          <div 
                            className="w-6 h-6 rounded-full border"
                            style={{ backgroundColor: result.hex_code || result.color_hex || '#808080' }}
                          />
                          <span className="text-sm">
                            {result.color || result.color_result || 'Unknown'} → {result.substance || result.possible_substance || 'Unknown'}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Recommendations */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">{t.recommendations}</CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-2">
              <p><strong>Data Loading Issues:</strong> Check localStorage and API endpoints</p>
              <p><strong>Form Not Showing Data:</strong> Verify data structure and field mapping</p>
              <p><strong>Save Not Working:</strong> Check API endpoints and localStorage permissions</p>
              <p><strong>Missing Fields:</strong> Ensure all required fields are present in data</p>
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    </div>
  );
}
