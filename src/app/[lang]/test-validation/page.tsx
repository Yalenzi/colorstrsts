'use client';

import { useState, useEffect } from 'react';
import { Language } from '@/types';
import { validateDatabaseData, getDatabaseSummary, testDataAccess, ValidationResult } from '@/lib/test-data-validation';
import { getTestById, getChemicalTestsLocal } from '@/lib/local-data-service';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface TestValidationPageProps {
  params: { lang: Language };
}

export default function TestValidationPage({ params }: TestValidationPageProps) {
  const lang = params.lang;
  const [validation, setValidation] = useState<ValidationResult | null>(null);
  const [testResults, setTestResults] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const runValidation = () => {
    setLoading(true);
    setTestResults([]);
    
    try {
      // Run database validation
      const result = validateDatabaseData();
      setValidation(result);
      
      // Run data access tests
      const accessTest = testDataAccess();
      
      // Test local data service
      const tests = getChemicalTestsLocal();
      const firstTest = tests[0];
      const testById = getTestById(firstTest?.id || '');
      
      const results = [
        `✅ Database validation: ${result.isValid ? 'PASSED' : 'FAILED'}`,
        `📊 Total tests: ${result.summary.totalTests}`,
        `🎨 Total color results: ${result.summary.totalColorResults}`,
        `⚗️ Total chemical components: ${result.summary.totalChemicalComponents}`,
        `📝 Tests with instructions: ${result.summary.testsWithInstructions}`,
        `🔍 Data access test: ${accessTest ? 'PASSED' : 'FAILED'}`,
        `📚 Local data service: ${tests.length} tests loaded`,
        `🧪 Test by ID: ${testById ? 'FOUND' : 'NOT FOUND'}`,
        '',
        '🔍 Sample Test Data:',
        `   Name: ${firstTest?.method_name}`,
        `   Name (AR): ${firstTest?.method_name_ar}`,
        `   Color Results: ${firstTest?.color_results?.length || 0}`,
        `   Chemical Components: ${firstTest?.chemical_components?.length || 0}`,
        `   Instructions: ${firstTest?.instructions?.length || 0}`,
      ];
      
      if (result.errors.length > 0) {
        results.push('', '❌ Errors:');
        results.push(...result.errors.map(error => `   ${error}`));
      }
      
      if (result.warnings.length > 0) {
        results.push('', '⚠️ Warnings:');
        results.push(...result.warnings.map(warning => `   ${warning}`));
      }
      
      setTestResults(results);
      
    } catch (error) {
      setTestResults([`❌ Validation failed: ${error}`]);
    } finally {
      setLoading(false);
    }
  };

  const isRTL = lang === 'ar';

  return (
    <div className={`min-h-screen bg-gray-50 p-4 ${isRTL ? 'rtl' : 'ltr'}`}>
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-bold">
              {isRTL ? 'اختبار صحة البيانات' : 'Data Validation Test'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              onClick={runValidation} 
              disabled={loading}
              className="w-full"
            >
              {loading 
                ? (isRTL ? 'جاري الاختبار...' : 'Testing...') 
                : (isRTL ? 'تشغيل اختبار البيانات' : 'Run Data Validation')
              }
            </Button>

            {validation && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className={validation.isValid ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}>
                  <CardHeader>
                    <CardTitle className="text-lg">
                      {isRTL ? 'حالة التحقق' : 'Validation Status'}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className={`text-2xl font-bold ${validation.isValid ? 'text-green-600' : 'text-red-600'}`}>
                      {validation.isValid 
                        ? (isRTL ? '✅ نجح' : '✅ PASSED') 
                        : (isRTL ? '❌ فشل' : '❌ FAILED')
                      }
                    </div>
                    <div className="mt-2 text-sm text-gray-600">
                      {isRTL ? `أخطاء: ${validation.errors.length}` : `Errors: ${validation.errors.length}`}
                      <br />
                      {isRTL ? `تحذيرات: ${validation.warnings.length}` : `Warnings: ${validation.warnings.length}`}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">
                      {isRTL ? 'ملخص البيانات' : 'Data Summary'}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      <div>{isRTL ? 'الاختبارات:' : 'Tests:'} {validation.summary.totalTests}</div>
                      <div>{isRTL ? 'النتائج اللونية:' : 'Color Results:'} {validation.summary.totalColorResults}</div>
                      <div>{isRTL ? 'المكونات الكيميائية:' : 'Chemical Components:'} {validation.summary.totalChemicalComponents}</div>
                      <div>{isRTL ? 'اختبارات مع تعليمات:' : 'Tests with Instructions:'} {validation.summary.testsWithInstructions}</div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {testResults.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">
                    {isRTL ? 'نتائج الاختبار' : 'Test Results'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <pre className="bg-gray-100 p-4 rounded-lg text-sm overflow-auto max-h-96 whitespace-pre-wrap">
                    {testResults.join('\n')}
                  </pre>
                </CardContent>
              </Card>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
