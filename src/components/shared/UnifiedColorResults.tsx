'use client';

import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Language } from '@/types';

// تركيب موحد للنتائج اللونية
export interface UnifiedColorResult {
  id: string;
  test_id: string;
  test_name?: string;
  test_name_ar?: string;
  color_result: string;
  color_result_ar: string;
  color_hex: string;
  possible_substance: string;
  possible_substance_ar: string;
  confidence_level: number | string;
  category?: string;
  reference?: string;
  notes?: string;
  notes_ar?: string;
}

interface UnifiedColorResultsProps {
  results: UnifiedColorResult[];
  lang: Language;
  showTestName?: boolean;
  showCategory?: boolean;
  showReference?: boolean;
  compact?: boolean;
}

export function UnifiedColorResults({ 
  results, 
  lang, 
  showTestName = true,
  showCategory = false,
  showReference = false,
  compact = false
}: UnifiedColorResultsProps) {
  const isRTL = lang === 'ar';

  const texts = {
    ar: {
      colorResult: 'النتيجة اللونية',
      substance: 'المادة المحتملة',
      confidence: 'مستوى الثقة',
      testName: 'اسم الاختبار',
      category: 'الفئة',
      reference: 'المرجع',
      noResults: 'لا توجد نتائج لونية',
      high: 'عالي',
      medium: 'متوسط',
      low: 'منخفض'
    },
    en: {
      colorResult: 'Color Result',
      substance: 'Possible Substance',
      confidence: 'Confidence Level',
      testName: 'Test Name',
      category: 'Category',
      reference: 'Reference',
      noResults: 'No color results found',
      high: 'High',
      medium: 'Medium',
      low: 'Low'
    }
  };

  const t = texts[lang];

  // تحويل مستوى الثقة إلى رقم
  const getConfidenceScore = (confidence: number | string): number => {
    if (typeof confidence === 'number') {
      return confidence;
    }
    
    switch (confidence) {
      case 'very_high': return 95;
      case 'high': return 85;
      case 'medium': return 75;
      case 'low': return 60;
      case 'very_low': return 50;
      default: return 75;
    }
  };

  // لون شارة الثقة
  const getConfidenceBadgeColor = (confidence: number | string) => {
    const score = getConfidenceScore(confidence);
    
    if (score >= 85) return 'bg-green-100 text-green-800 border-green-200';
    if (score >= 70) return 'bg-blue-100 text-blue-800 border-blue-200';
    if (score >= 50) return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    return 'bg-red-100 text-red-800 border-red-200';
  };

  // نص مستوى الثقة
  const getConfidenceText = (confidence: number | string) => {
    const score = getConfidenceScore(confidence);
    
    if (score >= 85) return lang === 'ar' ? 'عالي' : 'High';
    if (score >= 70) return lang === 'ar' ? 'متوسط' : 'Medium';
    return lang === 'ar' ? 'منخفض' : 'Low';
  };

  if (!results || results.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        {t.noResults}
      </div>
    );
  }

  if (compact) {
    return (
      <div className={`grid gap-3 ${isRTL ? 'rtl' : 'ltr'}`} dir={isRTL ? 'rtl' : 'ltr'}>
        {results.map((result) => (
          <div key={result.id} className="flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50">
            <div 
              className="w-6 h-6 rounded-full border-2 border-gray-300"
              style={{ backgroundColor: result.color_hex }}
            />
            <div className="flex-1">
              <div className="font-medium text-sm">
                {isRTL ? result.color_result_ar : result.color_result}
              </div>
              <div className="text-xs text-gray-500">
                {isRTL ? result.possible_substance_ar : result.possible_substance}
              </div>
            </div>
            <Badge className={getConfidenceBadgeColor(result.confidence_level)}>
              {getConfidenceScore(result.confidence_level)}%
            </Badge>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${isRTL ? 'rtl' : 'ltr'}`} dir={isRTL ? 'rtl' : 'ltr'}>
      {results.map((result) => (
        <Card key={result.id}>
          <CardContent className="p-4">
            <div className="flex items-start gap-4">
              {/* Color Circle */}
              <div 
                className="w-12 h-12 rounded-full border-2 border-gray-300 flex-shrink-0"
                style={{ backgroundColor: result.color_hex }}
                title={result.color_hex}
              />

              {/* Content */}
              <div className="flex-1 space-y-2">
                {/* Test Name */}
                {showTestName && (result.test_name || result.test_name_ar) && (
                  <div className="text-sm text-gray-600">
                    <span className="font-medium">{t.testName}:</span>{' '}
                    {isRTL ? result.test_name_ar : result.test_name}
                  </div>
                )}

                {/* Color Result */}
                <div>
                  <span className="font-medium">{t.colorResult}:</span>{' '}
                  <span className="text-lg">
                    {isRTL ? result.color_result_ar : result.color_result}
                  </span>
                  <span className="text-sm text-gray-500 ml-2">
                    ({result.color_hex})
                  </span>
                </div>

                {/* Possible Substance */}
                <div>
                  <span className="font-medium">{t.substance}:</span>{' '}
                  <span>
                    {isRTL ? result.possible_substance_ar : result.possible_substance}
                  </span>
                </div>

                {/* Confidence Level */}
                <div className="flex items-center gap-2">
                  <span className="font-medium">{t.confidence}:</span>
                  <Badge className={getConfidenceBadgeColor(result.confidence_level)}>
                    {getConfidenceText(result.confidence_level)} ({getConfidenceScore(result.confidence_level)}%)
                  </Badge>
                </div>

                {/* Category */}
                {showCategory && result.category && (
                  <div>
                    <span className="font-medium">{t.category}:</span>{' '}
                    <Badge variant="outline">{result.category}</Badge>
                  </div>
                )}

                {/* Reference */}
                {showReference && result.reference && (
                  <div className="text-sm text-gray-600">
                    <span className="font-medium">{t.reference}:</span>{' '}
                    {result.reference}
                  </div>
                )}

                {/* Notes */}
                {(result.notes || result.notes_ar) && (
                  <div className="text-sm text-gray-600">
                    {isRTL ? result.notes_ar : result.notes}
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

// دالة مساعدة لتحويل البيانات من تركيبات مختلفة
export function convertToUnifiedColorResult(data: any, testData?: any): UnifiedColorResult {
  return {
    id: data.id || `result-${Date.now()}`,
    test_id: data.test_id || testData?.id || '',
    test_name: testData?.method_name || data.test_name,
    test_name_ar: testData?.method_name_ar || data.test_name_ar,
    color_result: data.color || data.color_result || 'Unknown',
    color_result_ar: data.color_ar || data.color_result_ar || 'غير معروف',
    color_hex: data.hex_code || data.color_hex || '#808080',
    possible_substance: data.substance || data.possible_substance || 'Unknown',
    possible_substance_ar: data.substance_ar || data.possible_substance_ar || 'غير معروف',
    confidence_level: data.confidence || data.confidence_level || 75,
    category: testData?.category || data.category,
    reference: testData?.reference || data.reference,
    notes: data.notes,
    notes_ar: data.notes_ar
  };
}
