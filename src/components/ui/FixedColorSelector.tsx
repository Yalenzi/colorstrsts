'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { getTranslationsSync } from '@/lib/translations';
import { getTestById } from '@/lib/data-service';
import { useTestCompletion, useTestTimer } from '@/hooks/useTestCompletion';
import { Language } from '@/types';
import { Camera, CheckCircle, AlertTriangle } from 'lucide-react';

interface FixedColorResult {
  id: string;
  test_id: string;
  hex_code: string;
  color_name: string;
  color_name_ar: string;
  possible_substance: string;
  possible_substance_ar: string;
  confidence_level: string;
  confidence: number;
}

interface FixedColorSelectorProps {
  testId: string;
  lang: Language;
  selectedColorResult: FixedColorResult | null;
  onColorSelect: (colorResult: FixedColorResult) => void;
  onComplete: () => void;
  notes: string;
  onNotesChange: (notes: string) => void;
}

export function FixedColorSelector({
  testId,
  lang,
  selectedColorResult,
  onColorSelect,
  onComplete,
  notes,
  onNotesChange
}: FixedColorSelectorProps) {
  const [availableColors, setAvailableColors] = useState<FixedColorResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [testStartTime, setTestStartTime] = useState<number | null>(null);

  const isRTL = lang === 'ar';
  const t = getTranslationsSync(lang);

  // Test completion hooks
  const { completeTest, isUserLoggedIn } = useTestCompletion();
  const { startTest, getTestDuration } = useTestTimer();

  // Start test timer when component mounts
  useEffect(() => {
    const startTime = startTest();
    setTestStartTime(startTime);
  }, [startTest]);

  // تحويل مستوى الثقة إلى رقم
  const getConfidenceScore = (level: string): number => {
    switch (level) {
      case 'very_high': return 95;
      case 'high': return 85;
      case 'medium': return 75;
      case 'low': return 60;
      case 'very_low': return 50;
      default: return 75;
    }
  };

  // تحميل الألوان المتاحة للاختبار
  useEffect(() => {
    const loadColors = async () => {
      try {
        setLoading(true);
        setError('');

        console.log(`🔄 Loading colors for test: ${testId}`);

        // تحميل بيانات الاختبار
        const test = getTestById(testId);
        
        if (!test) {
          throw new Error(`Test not found: ${testId}`);
        }

        console.log(`✅ Found test: ${test.method_name}`);
        console.log(`📊 Test data:`, test);

        // تحويل النتائج اللونية للتركيب الصحيح
        let colorResults: FixedColorResult[] = [];

        if (test.color_results && test.color_results.length > 0) {
          // استخدام color_results إذا كانت موجودة
          colorResults = test.color_results.map((result: any, index: number) => ({
            id: `${testId}-color-${index + 1}`,
            test_id: testId,
            hex_code: result.hex_code || result.color_hex || '#808080',
            color_name: result.color_name || result.color_result || 'Unknown',
            color_name_ar: result.color_name_ar || result.color_result_ar || 'غير معروف',
            possible_substance: result.possible_substance || 'Unknown',
            possible_substance_ar: result.possible_substance_ar || 'غير معروف',
            confidence_level: result.confidence_level || 'medium',
            confidence: getConfidenceScore(result.confidence_level || 'medium')
          }));
        } else if (test.results && test.results.length > 0) {
          // استخدام results إذا كانت موجودة
          colorResults = test.results.map((result: any, index: number) => ({
            id: `${testId}-result-${index + 1}`,
            test_id: testId,
            hex_code: result.hex_code || result.color_hex || '#808080',
            color_name: result.color || result.color_name || result.color_result || 'Unknown',
            color_name_ar: result.color_ar || result.color_name_ar || result.color_result_ar || 'غير معروف',
            possible_substance: result.substance || result.possible_substance || 'Unknown',
            possible_substance_ar: result.substance_ar || result.possible_substance_ar || 'غير معروف',
            confidence_level: result.confidence_level || 'medium',
            confidence: typeof result.confidence === 'number' ? result.confidence : getConfidenceScore(result.confidence_level || 'medium')
          }));
        }

        // إزالة الألوان المكررة
        const uniqueColors = colorResults.filter((color, index, self) => 
          index === self.findIndex(c => 
            c.hex_code === color.hex_code && 
            c.color_name === color.color_name &&
            c.possible_substance === color.possible_substance
          )
        );

        console.log(`🎨 Original colors: ${colorResults.length}, Unique colors: ${uniqueColors.length}`);
        
        if (uniqueColors.length === 0) {
          // إنشاء ألوان افتراضية إذا لم توجد
          uniqueColors.push(
            {
              id: `${testId}-default-1`,
              test_id: testId,
              hex_code: '#800080',
              color_name: 'Purple',
              color_name_ar: 'بنفسجي',
              possible_substance: 'Diazepam',
              possible_substance_ar: 'ديازيبام',
              confidence_level: 'high',
              confidence: 85
            },
            {
              id: `${testId}-default-2`,
              test_id: testId,
              hex_code: '#4B0082',
              color_name: 'Indigo',
              color_name_ar: 'نيلي',
              possible_substance: 'Oxazepam',
              possible_substance_ar: 'أوكسازيبام',
              confidence_level: 'medium',
              confidence: 75
            }
          );
        }

        setAvailableColors(uniqueColors);
        console.log(`✅ Loaded ${uniqueColors.length} unique colors for ${testId}`);

      } catch (error: any) {
        console.error('❌ Error loading colors:', error);
        setError(error.message || 'Failed to load colors');
      } finally {
        setLoading(false);
      }
    };

    if (testId) {
      loadColors();
    }
  }, [testId]);

  const handleColorClick = (color: FixedColorResult) => {
    console.log('🎨 Color selected:', color);
    onColorSelect(color);
  };

  const handleComplete = async () => {
    if (!selectedColorResult) {
      setError(isRTL ? 'يرجى اختيار لون أولاً' : 'Please select a color first');
      return;
    }

    try {
      // حفظ النتيجة
      const duration = testStartTime ? getTestDuration() : 0;
      
      await completeTest({
        testId,
        colorId: selectedColorResult.hex_code,
        confidence: selectedColorResult.confidence,
        notes,
        duration
      });

      onComplete();
    } catch (error: any) {
      console.error('❌ Error completing test:', error);
      setError(error.message || 'Failed to complete test');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>{isRTL ? 'جاري تحميل الألوان...' : 'Loading colors...'}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className={`space-y-6 ${isRTL ? 'rtl' : 'ltr'}`} dir={isRTL ? 'rtl' : 'ltr'}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Camera className="w-5 h-5" />
            {isRTL ? 'اختر اللون المُلاحظ' : 'Select Observed Color'}
          </CardTitle>
          <CardDescription>
            {isRTL 
              ? 'انقر على اللون الذي لاحظته بعد إضافة الكاشف'
              : 'Click on the color you observed after adding the reagent'
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          {availableColors.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {availableColors.map((color) => (
                <Card
                  key={color.id}
                  className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${
                    selectedColorResult?.id === color.id
                      ? 'ring-2 ring-primary shadow-lg'
                      : 'hover:shadow-md'
                  }`}
                  onClick={() => handleColorClick(color)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <div
                        className="w-12 h-12 rounded-full border-2 border-gray-300 flex-shrink-0"
                        style={{ backgroundColor: color.hex_code }}
                        title={color.hex_code}
                      />
                      <div className="flex-1">
                        <h3 className="font-medium text-sm">
                          {isRTL ? color.color_name_ar : color.color_name}
                        </h3>
                        <p className="text-xs text-gray-500">{color.hex_code}</p>
                      </div>
                      {selectedColorResult?.id === color.id && (
                        <CheckCircle className="w-5 h-5 text-green-600" />
                      )}
                    </div>

                    <div className="space-y-2">
                      <div>
                        <p className="text-xs font-medium text-gray-600">
                          {isRTL ? 'المادة المحتملة:' : 'Possible Substance:'}
                        </p>
                        <p className="text-sm">
                          {isRTL ? color.possible_substance_ar : color.possible_substance}
                        </p>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-600">
                          {isRTL ? 'مستوى الثقة:' : 'Confidence:'}
                        </span>
                        <Badge 
                          variant={color.confidence >= 80 ? 'default' : color.confidence >= 60 ? 'secondary' : 'outline'}
                        >
                          {color.confidence}%
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              {isRTL ? 'لا توجد ألوان متاحة لهذا الاختبار' : 'No colors available for this test'}
            </div>
          )}

          {/* Notes Section */}
          <div className="mt-6">
            <label className="block text-sm font-medium mb-2">
              {isRTL ? 'ملاحظات إضافية (اختيارية):' : 'Additional Notes (Optional):'}
            </label>
            <Textarea
              value={notes}
              onChange={(e) => onNotesChange(e.target.value)}
              placeholder={isRTL ? 'أضف أي ملاحظات حول النتيجة...' : 'Add any notes about the result...'}
              rows={3}
            />
          </div>

          {/* Selected Color Summary */}
          {selectedColorResult && (
            <Card className="mt-4 bg-blue-50 dark:bg-blue-950/20">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div
                    className="w-8 h-8 rounded-full border-2 border-gray-300"
                    style={{ backgroundColor: selectedColorResult.hex_code }}
                  />
                  <div>
                    <p className="font-medium">
                      {isRTL ? selectedColorResult.color_name_ar : selectedColorResult.color_name}
                    </p>
                    <p className="text-sm text-gray-600">
                      {isRTL ? selectedColorResult.possible_substance_ar : selectedColorResult.possible_substance}
                    </p>
                  </div>
                  <Badge variant="outline">
                    {selectedColorResult.confidence}%
                  </Badge>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 mt-6">
            <Button
              onClick={handleComplete}
              disabled={!selectedColorResult}
              className="flex-1"
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              {isRTL ? 'إكمال الاختبار' : 'Complete Test'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
