'use client';

import { useState, useEffect } from 'react';
import { Language } from '@/types';
import { getTranslationsSync } from '@/lib/translations';
import { getColorResultsLocal, getTestById } from '@/lib/local-data-service';
import { Button } from '@/components/ui/button';
import { ImageColorAnalyzer } from '@/components/ui/image-color-analyzer';
import { useTestCompletion, createTestCompletionData, useTestTimer } from '@/hooks/useTestCompletion';
import {
  EyeIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  SwatchIcon,
  ArrowRightIcon,
  PhotoIcon,
  CameraIcon
} from '@heroicons/react/24/outline';

interface ColorResult {
  id: string;
  test_id: string;
  hex_code: string;
  color_name: {
    ar: string;
    en: string;
  };
  substances: {
    ar: string[];
    en: string[];
  };
  confidence: number;
  confidence_level: string;
}

interface ColorSelectorProps {
  colorResults: ColorResult[];
  lang: Language;
  selectedColorResult: ColorResult | null;
  onColorSelect: (colorResult: ColorResult) => void;
  onComplete: () => void;
  notes: string;
  onNotesChange: (notes: string) => void;
  testId: string;
}

// Convert local ColorResult to ColorSelector ColorResult
const convertColorResult = (localColor: any): ColorResult | null => {
  // Skip invalid colors without proper hex codes
  if (!localColor.color_hex && !localColor.hex_code) {
    console.warn('Skipping color result without hex code:', localColor);
    return null;
  }

  const hexCode = localColor.color_hex || localColor.hex_code;

  // Skip if hex code is invalid or default black
  if (!hexCode || hexCode === '#000000' || hexCode === '#000') {
    console.warn('Skipping invalid or default black color:', localColor);
    return null;
  }

  return {
    id: localColor.id || `color-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
    test_id: localColor.test_id || '',
    hex_code: hexCode,
    color_name: {
      ar: localColor.color_result_ar || localColor.color_name_ar || 'لون غير محدد',
      en: localColor.color_result || localColor.color_name || 'Unknown'
    },
    substances: {
      ar: [localColor.possible_substance_ar || 'غير محدد'],
      en: [localColor.possible_substance || 'Unknown']
    },
    confidence: getConfidenceScore(localColor.confidence_level),
    confidence_level: localColor.confidence_level || 'medium'
  };
};

// Convert confidence level to numeric score
const getConfidenceScore = (level: string): number => {
  switch (level) {
    case 'very_high': return 90;
    case 'high': return 80;
    case 'medium': return 65;
    case 'low': return 45;
    case 'very_low': return 25;
    default: return 50;
  }
};

export function ColorSelector({
  colorResults,
  lang,
  selectedColorResult,
  onColorSelect,
  onComplete,
  notes,
  onNotesChange,
  testId
}: ColorSelectorProps) {
  const [availableColors, setAvailableColors] = useState<ColorResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [showImageAnalyzer, setShowImageAnalyzer] = useState(false);
  const [testStartTime, setTestStartTime] = useState<number | null>(null);
  const [isClient, setIsClient] = useState(false);
  const t = getTranslationsSync(lang);

  // Test completion hooks
  const { completeTest, isUserLoggedIn } = useTestCompletion();
  const { startTest, getTestDuration } = useTestTimer();

  // Check if we're on the client side to prevent hydration mismatch
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Start test timer when component mounts
  useEffect(() => {
    if (isClient) {
      const startTime = startTest();
      setTestStartTime(startTime);
    }
  }, [startTest, isClient]);

  useEffect(() => {
    // Only load colors on client side to prevent hydration mismatch
    if (!isClient) return;

    const loadColors = async () => {
      try {
        setLoading(true);

        // If colorResults are provided, use them
        if (colorResults && colorResults.length > 0) {
          setAvailableColors(colorResults);
        } else {
          // Load colors from the specific test
          const test = getTestById(testId);
          if (test?.color_results && test.color_results.length > 0) {
            // Convert test color results to ColorResult format, filtering out invalid colors
            const testColors: ColorResult[] = test.color_results
              .map((result, index) => {
                // Skip colors without proper hex codes
                const hexCode = result.color_hex || result.hex_code;
                if (!hexCode || hexCode === '#000000' || hexCode === '#000') {
                  console.warn('Skipping invalid color in test:', result);
                  return null;
                }

                return {
                  id: `${testId}-${index}`,
                  test_id: testId,
                  hex_code: hexCode,
                  color_name: {
                    ar: result.color_result_ar || result.color_name_ar || 'لون غير محدد',
                    en: result.color_result || result.color_name || 'Unknown'
                  },
                  substances: {
                    ar: [result.possible_substance_ar || 'غير محدد'],
                    en: [result.possible_substance || 'Unknown']
                  },
                  confidence: getConfidenceScore(result.confidence_level || 'medium'),
                  confidence_level: result.confidence_level || 'medium'
                };
              })
              .filter((color): color is ColorResult => color !== null); // Remove null values

            setAvailableColors(testColors);
          } else {
            // Fallback to all color results
            const allColors = getColorResultsLocal();
            const convertedColors = allColors
              .map(convertColorResult)
              .filter((color): color is ColorResult => color !== null); // Remove null values
            setAvailableColors(convertedColors);
          }
        }
      } catch (error) {
        console.error('Error loading colors:', error);
      } finally {
        setLoading(false);
      }
    };

    loadColors();
  }, [colorResults, testId, isClient]);

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 85) return 'text-green-600 bg-green-50 border-green-200';
    if (confidence >= 75) return 'text-green-500 bg-green-50 border-green-200';
    if (confidence >= 60) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    if (confidence >= 40) return 'text-orange-600 bg-orange-50 border-orange-200';
    return 'text-red-600 bg-red-50 border-red-200';
  };

  const getConfidenceText = (confidence: number) => {
    if (confidence >= 85) return lang === 'ar' ? 'عالي جداً' : 'Very High';
    if (confidence >= 75) return lang === 'ar' ? 'عالي' : 'High';
    if (confidence >= 60) return lang === 'ar' ? 'متوسط' : 'Medium';
    if (confidence >= 40) return lang === 'ar' ? 'منخفض' : 'Low';
    return lang === 'ar' ? 'منخفض جداً' : 'Very Low';
  };

  // Handle color detected from image
  const handleImageColorDetected = (detectedHex: string) => {
    // Find the closest matching color from available colors
    const closestColor = findClosestColor(detectedHex, availableColors);
    if (closestColor) {
      onColorSelect(closestColor);
    } else {
      // Create a custom color result if no close match found
      const customColor: ColorResult = {
        id: `custom-${Date.now()}`,
        test_id: testId,
        hex_code: detectedHex,
        color_name: {
          ar: 'لون مكتشف من الصورة',
          en: 'Color detected from image'
        },
        substances: {
          ar: ['يتطلب تحليل إضافي'],
          en: ['Requires additional analysis']
        },
        confidence: 70,
        confidence_level: 'medium'
      };
      onColorSelect(customColor);
    }
  };

  // Find closest color match
  const findClosestColor = (targetHex: string, colors: ColorResult[]): ColorResult | null => {
    if (colors.length === 0) return null;

    const targetRgb = hexToRgb(targetHex);
    if (!targetRgb) return null;

    let closestColor = colors[0];
    let minDistance = Infinity;

    colors.forEach(color => {
      const colorRgb = hexToRgb(color.hex_code);
      if (colorRgb) {
        const distance = Math.sqrt(
          Math.pow(targetRgb.r - colorRgb.r, 2) +
          Math.pow(targetRgb.g - colorRgb.g, 2) +
          Math.pow(targetRgb.b - colorRgb.b, 2)
        );
        if (distance < minDistance) {
          minDistance = distance;
          closestColor = color;
        }
      }
    });

    // Only return if the distance is reasonable (less than 100 in RGB space)
    return minDistance < 100 ? closestColor : null;
  };

  // Convert hex to RGB
  const hexToRgb = (hex: string): { r: number; g: number; b: number } | null => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  };

  if (loading || !isClient) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">
            {lang === 'ar' ? 'جاري تحميل الألوان...' : 'Loading colors...'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary-100 dark:bg-primary-900 mb-4">
          <EyeIcon className="h-8 w-8 text-primary-600" />
        </div>
        <h2 className="text-2xl font-bold text-foreground mb-2">
          {lang === 'ar' ? 'اختر اللون المُلاحظ' : 'Select Observed Color'}
        </h2>
        <p className="text-muted-foreground mb-4">
          {lang === 'ar'
            ? 'انقر على اللون الذي لاحظته بعد إضافة الكاشف'
            : 'Click on the color you observed after adding the reagent'
          }
        </p>

        {/* Color Selection Methods */}
        <div className="flex flex-col sm:flex-row items-center justify-center space-y-3 sm:space-y-0 sm:space-x-4 rtl:space-x-reverse">
          <div className="flex items-center space-x-2 rtl:space-x-reverse text-sm text-muted-foreground">
            <SwatchIcon className="h-4 w-4" />
            <span>{lang === 'ar' ? 'اختيار يدوي' : 'Manual Selection'}</span>
          </div>

          <div className="text-muted-foreground">
            {lang === 'ar' ? 'أو' : 'or'}
          </div>

          <Button
            variant="outline"
            onClick={() => setShowImageAnalyzer(true)}
            className="flex items-center space-x-2 rtl:space-x-reverse"
          >
            <PhotoIcon className="h-4 w-4" />
            <span>{lang === 'ar' ? 'تحليل بالصورة' : 'Image Analysis'}</span>
          </Button>
        </div>
      </div>

      {/* Color Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-8">
        {isClient && availableColors.map((color) => (
          <div
            key={color.id}
            onClick={() => onColorSelect(color)}
            className={`
              relative cursor-pointer rounded-lg border-2 p-4 transition-all duration-200 hover:shadow-lg
              ${selectedColorResult?.id === color.id 
                ? 'border-primary-500 bg-primary-50 dark:bg-primary-950' 
                : 'border-border bg-background hover:border-primary-300'
              }
            `}
          >
            {/* Color Circle */}
            <div className="flex flex-col items-center space-y-3">
              <div
                className="w-16 h-16 rounded-full border-4 border-white dark:border-gray-300 shadow-lg"
                style={{ backgroundColor: color.hex_code }}
              />
              
              {/* Color Name */}
              <div className="text-center">
                <h3 className="font-semibold text-foreground text-sm">
                  {lang === 'ar' ? color.color_name?.ar || 'لون غير محدد' : color.color_name?.en || 'Undefined color'}
                </h3>
                <p className="text-xs text-muted-foreground mt-1">
                  {color.hex_code}
                </p>
              </div>

              {/* Confidence Badge */}
              <div className={`px-2 py-1 rounded-full text-xs font-medium border ${getConfidenceColor(color.confidence)}`}>
                {color.confidence}% {getConfidenceText(color.confidence)}
              </div>

              {/* Selection Indicator */}
              {selectedColorResult?.id === color.id && (
                <div className="absolute top-2 right-2">
                  <CheckCircleIcon className="h-6 w-6 text-primary-600" />
                </div>
              )}
            </div>
          </div>
        ))}

        {/* No colors available message */}
        {isClient && availableColors.length === 0 && (
          <div className="col-span-full text-center py-8">
            <div className="text-muted-foreground">
              <SwatchIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg mb-2">
                {lang === 'ar' ? 'لا توجد ألوان متاحة' : 'No colors available'}
              </p>
              <p className="text-sm">
                {lang === 'ar'
                  ? 'يرجى المحاولة مرة أخرى أو استخدام تحليل الصورة'
                  : 'Please try again or use image analysis'
                }
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Selected Color Details */}
      {selectedColorResult && (
        <div className="bg-background border border-border rounded-lg p-6 mb-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">
            {lang === 'ar' ? 'تفاصيل اللون المختار' : 'Selected Color Details'}
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Color Info */}
            <div>
              <div className="flex items-center space-x-3 rtl:space-x-reverse mb-4">
                <div 
                  className="w-8 h-8 rounded-full border-2 border-white shadow"
                  style={{ backgroundColor: selectedColorResult.hex_code }}
                />
                <div>
                  <h4 className="font-medium text-foreground">
                    {lang === 'ar' ? selectedColorResult.color_name?.ar || 'لون غير محدد' : selectedColorResult.color_name?.en || 'Undefined color'}
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    {selectedColorResult.hex_code}
                  </p>
                </div>
              </div>

              <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getConfidenceColor(selectedColorResult.confidence)}`}>
                <SwatchIcon className="h-4 w-4 mr-1 rtl:ml-1 rtl:mr-0" />
                {selectedColorResult.confidence}% {getConfidenceText(selectedColorResult.confidence)}
              </div>
            </div>

            {/* Possible Substances */}
            <div>
              <h4 className="font-medium text-foreground mb-2">
                {lang === 'ar' ? 'المواد المحتملة' : 'Possible Substances'}
              </h4>
              {selectedColorResult.substances?.[lang]?.length > 0 ? (
                <div className="space-y-1">
                  {selectedColorResult.substances[lang]?.map((substance, index) => (
                    <div key={index} className="flex items-center space-x-2 rtl:space-x-reverse text-sm">
                      <div className="w-2 h-2 rounded-full bg-primary-500" />
                      <span className="text-muted-foreground">{substance}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  {lang === 'ar' ? 'لا توجد مواد محددة' : 'No specific substances identified'}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Notes Section */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-foreground mb-2">
          {lang === 'ar' ? 'ملاحظات إضافية (اختياري)' : 'Additional Notes (Optional)'}
        </label>
        <textarea
          value={notes}
          onChange={(e) => onNotesChange(e.target.value)}
          placeholder={lang === 'ar' 
            ? 'أضف أي ملاحظات حول الاختبار...'
            : 'Add any notes about the test...'
          }
          className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground placeholder-muted-foreground focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
          rows={3}
        />
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          {selectedColorResult ? (
            <span className="flex items-center space-x-1 rtl:space-x-reverse text-green-600">
              <CheckCircleIcon className="h-4 w-4" />
              <span>
                {lang === 'ar' ? 'تم اختيار اللون' : 'Color selected'}
              </span>
            </span>
          ) : (
            <span className="flex items-center space-x-1 rtl:space-x-reverse">
              <ExclamationTriangleIcon className="h-4 w-4" />
              <span>
                {lang === 'ar' ? 'يرجى اختيار لون' : 'Please select a color'}
              </span>
            </span>
          )}
        </div>

        <Button
          onClick={async () => {
            console.log('View Results clicked, selectedColorResult:', selectedColorResult);
            if (selectedColorResult) {
              // Save test result if user is logged in
              if (isUserLoggedIn && testStartTime) {
                try {
                  const test = getTestById(testId);
                  if (test) {
                    const testCompletionData = createTestCompletionData(
                      testId,
                      test.method_name || 'Unknown Test',
                      test.method_name_ar || 'اختبار غير معروف',
                      selectedColorResult,
                      testStartTime
                    );

                    await completeTest(testCompletionData);
                  }
                } catch (error) {
                  console.error('❌ Error saving test result:', error);
                }
              }

              // Call the original onComplete
              onComplete();
            }
          }}
          disabled={!selectedColorResult}
          className="flex items-center space-x-2 rtl:space-x-reverse"
        >
          <span>{lang === 'ar' ? 'عرض النتائج' : 'View Results'}</span>
          <ArrowRightIcon className="h-4 w-4" />
        </Button>
      </div>

      {/* Important Notice */}
      <div className="mt-6 p-4 bg-warning-50 dark:bg-warning-950 border border-warning-200 dark:border-warning-800 rounded-lg">
        <div className="flex items-start space-x-2 rtl:space-x-reverse">
          <ExclamationTriangleIcon className="h-5 w-5 text-warning-600 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-warning-700 dark:text-warning-300">
            <p className="font-medium mb-1">
              {lang === 'ar' ? 'تنبيه مهم:' : 'Important Notice:'}
            </p>
            <p>
              {lang === 'ar' 
                ? 'اختر اللون الأقرب لما لاحظته. إذا لم تجد اللون المطابق تماماً، اختر الأقرب إليه.'
                : 'Select the color closest to what you observed. If you cannot find an exact match, choose the closest one.'
              }
            </p>
          </div>
        </div>
      </div>

      {/* Image Color Analyzer Modal */}
      {showImageAnalyzer && (
        <ImageColorAnalyzer
          lang={lang}
          testId={testId}
          onColorDetected={handleImageColorDetected}
          onClose={() => setShowImageAnalyzer(false)}
        />
      )}
    </div>
  );
}
