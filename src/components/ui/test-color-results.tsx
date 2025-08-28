'use client';

import React, { useState, useEffect } from 'react';
import { Language } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BeakerIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';

interface ColorResult {
  color_result: string;
  color_result_ar: string;
  color_hex: string;
  possible_substance: string;
  possible_substance_ar: string;
  confidence_level: string;
}

interface ChemicalTest {
  id: string;
  method_name: string;
  method_name_ar: string;
  description: string;
  description_ar: string;
  color_results: ColorResult[];
  chemical_components?: Array<{
    name: string;
    name_ar: string;
  }>;
  instructions?: Array<{
    step_number: number;
    instruction: string;
    instruction_ar: string;
    safety_warning?: string;
    safety_warning_ar?: string;
  }>;
}

interface TestColorResultsProps {
  lang: Language;
}

export function TestColorResults({ lang }: TestColorResultsProps) {
  const [tests, setTests] = useState<ChemicalTest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isRTL = lang === 'ar';

  const texts = {
    ar: {
      title: 'النتائج اللونية المتوقعة للاختبارات',
      description: 'النتائج اللونية المحتملة لكل اختبار كيميائي والمواد المرتبطة بها',
      chemicalComponents: 'المكونات الكيميائية',
      testInstructions: 'تعليمات إجراء الاختبار',
      safetyWarnings: 'تحذيرات السلامة الخاصة',
      expectedColors: 'الألوان المتوقعة',
      substances: 'المواد المحتملة',
      confidence: 'مستوى الثقة',
      high: 'عالي',
      medium: 'متوسط',
      low: 'منخفض',
      loading: 'جاري تحميل البيانات...',
      error: 'خطأ في تحميل البيانات'
    },
    en: {
      title: 'Expected Color Results for Tests',
      description: 'Possible color results for each chemical test and associated substances',
      chemicalComponents: 'Chemical Components',
      testInstructions: 'Test Instructions',
      safetyWarnings: 'Safety Warnings',
      expectedColors: 'Expected Colors',
      substances: 'Possible Substances',
      confidence: 'Confidence Level',
      high: 'High',
      medium: 'Medium',
      low: 'Low',
      loading: 'Loading data...',
      error: 'Error loading data'
    }
  };

  const t = texts[lang];

  useEffect(() => {
    const loadTestData = async () => {
      try {
        setLoading(true);
        console.log('🔄 Loading test data from Db.json...');
        
        const response = await fetch('/data/Db.json');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.chemical_tests && Array.isArray(data.chemical_tests)) {
          setTests(data.chemical_tests);
          console.log(`✅ Loaded ${data.chemical_tests.length} tests successfully`);
        } else {
          throw new Error('Invalid data structure');
        }
      } catch (err) {
        console.error('❌ Error loading test data:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    loadTestData();
  }, []);

  const getConfidenceColor = (level: string) => {
    switch (level?.toLowerCase()) {
      case 'high': return 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-700';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-300 dark:border-yellow-700';
      case 'low': return 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/20 dark:text-red-300 dark:border-red-700';
      default: return 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600';
    }
  };

  const getConfidenceText = (level: string) => {
    switch (level?.toLowerCase()) {
      case 'high': return t.high;
      case 'medium': return t.medium;
      case 'low': return t.low;
      default: return level;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">{t.loading}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <div className="flex items-center">
          <ExclamationTriangleIcon className="h-5 w-5 text-red-500 mr-2" />
          <p className="text-red-700">{t.error}: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${isRTL ? 'rtl' : 'ltr'}`} dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">{t.title}</h2>
        <p className="text-gray-600 dark:text-gray-400">{t.description}</p>
      </div>

      {tests.map((test) => (
        <Card key={test.id} className="overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20">
            <div className="flex items-center space-x-3 rtl:space-x-reverse">
              <div className="p-2 bg-blue-100 dark:bg-blue-800 rounded-lg">
                <BeakerIcon className="h-6 w-6 text-blue-600 dark:text-blue-300" />
              </div>
              <div>
                <CardTitle className="text-xl">
                  {isRTL ? test.method_name_ar : test.method_name}
                </CardTitle>
                <CardDescription>
                  {isRTL ? test.description_ar : test.description}
                </CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-6">
            {/* Chemical Components */}
            {test.chemical_components && test.chemical_components.length > 0 && (
              <div className="mb-6 p-4 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-700 rounded-lg">
                <h3 className="font-semibold text-purple-800 dark:text-purple-300 mb-3 flex items-center">
                  <BeakerIcon className="h-5 w-5 mr-2 rtl:ml-2 rtl:mr-0" />
                  {t.chemicalComponents}
                </h3>
                <ul className="space-y-2">
                  {test.chemical_components.map((component, index) => (
                    <li key={index} className="text-purple-700 dark:text-purple-300">
                      • {isRTL ? component.name_ar : component.name}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Test Instructions */}
            {test.instructions && test.instructions.length > 0 && (
              <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h3 className="font-semibold text-blue-800 mb-3">
                  {t.testInstructions}
                </h3>
                <ol className="space-y-2">
                  {test.instructions.map((instruction, index) => (
                    <li key={index} className="text-blue-700">
                      <span className="font-medium">{instruction.step_number}.</span>{' '}
                      {isRTL ? instruction.instruction_ar : instruction.instruction}
                    </li>
                  ))}
                </ol>
              </div>
            )}

            {/* Safety Warnings */}
            {test.instructions && test.instructions.some(i => i.safety_warning) && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <h3 className="font-semibold text-red-800 mb-3 flex items-center">
                  <ExclamationTriangleIcon className="h-5 w-5 mr-2 rtl:ml-2 rtl:mr-0" />
                  {t.safetyWarnings}
                </h3>
                <ul className="space-y-2">
                  {test.instructions
                    .filter(i => i.safety_warning)
                    .map((instruction, index) => (
                      <li key={index} className="text-red-700 font-medium">
                        ⚠️ {isRTL ? instruction.safety_warning_ar : instruction.safety_warning}
                      </li>
                    ))}
                </ul>
              </div>
            )}

            {/* Color Results */}
            <div>
              <h3 className="font-semibold text-gray-800 mb-4">{t.expectedColors}</h3>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {test.color_results.map((result, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-center space-x-3 rtl:space-x-reverse mb-3">
                      <div 
                        className="w-8 h-8 rounded-full border-2 border-gray-300"
                        style={{ backgroundColor: result.color_hex }}
                        title={isRTL ? result.color_result_ar : result.color_result}
                      ></div>
                      <div>
                        <p className="font-medium text-gray-900">
                          {isRTL ? result.color_result_ar : result.color_result}
                        </p>
                        <Badge className={getConfidenceColor(result.confidence_level)}>
                          {getConfidenceText(result.confidence_level)}
                        </Badge>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-1">{t.substances}:</p>
                      <p className="text-sm font-medium text-gray-800">
                        {isRTL ? result.possible_substance_ar : result.possible_substance}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
