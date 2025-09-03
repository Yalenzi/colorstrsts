'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Wrench, RefreshCw, CheckCircle, AlertTriangle } from 'lucide-react';
import { Language } from '@/types';

interface FixTestDataButtonProps {
  lang: Language;
  onFixComplete?: () => void;
}

interface FixResult {
  success: boolean;
  message: string;
  details?: any;
  error?: string;
}

export function FixTestDataButton({ lang, onFixComplete }: FixTestDataButtonProps) {
  const [loading, setLoading] = useState(false);
  const [selectedFix, setSelectedFix] = useState('');
  const [selectedTestId, setSelectedTestId] = useState('');
  const [lastResult, setLastResult] = useState<FixResult | null>(null);

  const isRTL = lang === 'ar';

  const texts = {
    ar: {
      title: 'إصلاح بيانات الاختبارات',
      subtitle: 'إصلاح المشاكل في بيانات الاختبارات والنتائج اللونية',
      selectFix: 'اختر نوع الإصلاح',
      selectTest: 'اختر الاختبار (اختياري)',
      fixButton: 'تطبيق الإصلاح',
      fixing: 'جاري الإصلاح...',
      success: 'تم الإصلاح بنجاح',
      error: 'فشل في الإصلاح',
      duplicateColors: 'إصلاح الألوان المكررة',
      allTestsStructure: 'إصلاح تركيب جميع الاختبارات',
      zimmermannFix: 'إصلاح اختبار زيمرمان (ديازيبام)',
      lastResult: 'نتيجة آخر إصلاح',
      details: 'التفاصيل'
    },
    en: {
      title: 'Fix Test Data',
      subtitle: 'Fix issues in test data and color results',
      selectFix: 'Select Fix Type',
      selectTest: 'Select Test (Optional)',
      fixButton: 'Apply Fix',
      fixing: 'Fixing...',
      success: 'Fixed successfully',
      error: 'Fix failed',
      duplicateColors: 'Fix Duplicate Colors',
      allTestsStructure: 'Fix All Tests Structure',
      zimmermannFix: 'Fix Zimmermann (Diazepam) Test',
      lastResult: 'Last Fix Result',
      details: 'Details'
    }
  };

  const t = texts[lang];

  const fixTypes = [
    {
      value: 'duplicate-colors',
      label: t.duplicateColors,
      description: isRTL ? 'إصلاح الألوان المكررة في اختبار محدد' : 'Fix duplicate colors in specific test'
    },
    {
      value: 'all-tests-structure',
      label: t.allTestsStructure,
      description: isRTL ? 'إصلاح تركيب البيانات لجميع الاختبارات' : 'Fix data structure for all tests'
    }
  ];

  const commonTests = [
    {
      id: 'zimmermann-diazepam-test',
      name: 'Zimmermann Test (Diazepam)',
      name_ar: 'اختبار زيمرمان (ديازيبام)'
    },
    {
      id: 'marquis-test',
      name: 'Marquis Test',
      name_ar: 'اختبار ماركيز'
    },
    {
      id: 'mecke-test',
      name: 'Mecke Test',
      name_ar: 'اختبار ميك'
    }
  ];

  const handleFix = async () => {
    if (!selectedFix) {
      toast.error(isRTL ? 'يرجى اختيار نوع الإصلاح' : 'Please select fix type');
      return;
    }

    setLoading(true);
    setLastResult(null);

    try {
      console.log(`🔧 Applying fix: ${selectedFix} for test: ${selectedTestId || 'all'}`);

      const response = await fetch('/api/fix-test-data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          testId: selectedTestId || null,
          fixType: selectedFix
        }),
      });

      const result = await response.json();

      if (result.success) {
        setLastResult(result);
        toast.success(t.success);
        
        if (onFixComplete) {
          onFixComplete();
        }
      } else {
        setLastResult(result);
        toast.error(result.error || t.error);
      }

    } catch (error: any) {
      console.error('❌ Error applying fix:', error);
      const errorResult = {
        success: false,
        message: t.error,
        error: error.message
      };
      setLastResult(errorResult);
      toast.error(error.message || t.error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`space-y-4 ${isRTL ? 'rtl' : 'ltr'}`} dir={isRTL ? 'rtl' : 'ltr'}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wrench className="w-5 h-5" />
            {t.title}
          </CardTitle>
          <CardDescription>{t.subtitle}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Fix Type Selection */}
          <div>
            <label className="block text-sm font-medium mb-2">
              {t.selectFix}
            </label>
            <Select value={selectedFix} onValueChange={setSelectedFix}>
              <SelectTrigger>
                <SelectValue placeholder={t.selectFix} />
              </SelectTrigger>
              <SelectContent>
                {fixTypes.map((fix) => (
                  <SelectItem key={fix.value} value={fix.value}>
                    <div>
                      <div className="font-medium">{fix.label}</div>
                      <div className="text-xs text-gray-500">{fix.description}</div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Test Selection (for specific fixes) */}
          {selectedFix === 'duplicate-colors' && (
            <div>
              <label className="block text-sm font-medium mb-2">
                {t.selectTest}
              </label>
              <Select value={selectedTestId} onValueChange={setSelectedTestId}>
                <SelectTrigger>
                  <SelectValue placeholder={t.selectTest} />
                </SelectTrigger>
                <SelectContent>
                  {commonTests.map((test) => (
                    <SelectItem key={test.id} value={test.id}>
                      {isRTL ? test.name_ar : test.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Fix Button */}
          <Button
            onClick={handleFix}
            disabled={loading || !selectedFix}
            className="w-full"
          >
            {loading ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                {t.fixing}
              </>
            ) : (
              <>
                <Wrench className="w-4 h-4 mr-2" />
                {t.fixButton}
              </>
            )}
          </Button>

          {/* Last Result */}
          {lastResult && (
            <Alert variant={lastResult.success ? 'default' : 'destructive'}>
              <div className="flex items-center gap-2">
                {lastResult.success ? (
                  <CheckCircle className="w-4 h-4 text-green-600" />
                ) : (
                  <AlertTriangle className="w-4 h-4 text-red-600" />
                )}
                <span className="font-medium">{t.lastResult}</span>
                <Badge variant={lastResult.success ? 'default' : 'destructive'}>
                  {lastResult.success ? t.success : t.error}
                </Badge>
              </div>
              <AlertDescription className="mt-2">
                <div>{lastResult.message}</div>
                {lastResult.details && (
                  <details className="mt-2">
                    <summary className="cursor-pointer text-sm font-medium">
                      {t.details}
                    </summary>
                    <pre className="mt-1 text-xs bg-gray-100 dark:bg-gray-800 p-2 rounded overflow-auto">
                      {JSON.stringify(lastResult.details, null, 2)}
                    </pre>
                  </details>
                )}
                {lastResult.error && (
                  <div className="mt-1 text-sm text-red-600">
                    {lastResult.error}
                  </div>
                )}
              </AlertDescription>
            </Alert>
          )}

          {/* Quick Fixes */}
          <div className="border-t pt-4">
            <h4 className="font-medium mb-2">
              {isRTL ? 'إصلاحات سريعة' : 'Quick Fixes'}
            </h4>
            <div className="space-y-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSelectedFix('duplicate-colors');
                  setSelectedTestId('zimmermann-diazepam-test');
                }}
                className="w-full justify-start"
              >
                {t.zimmermannFix}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSelectedFix('all-tests-structure');
                  setSelectedTestId('');
                }}
                className="w-full justify-start"
              >
                {t.allTestsStructure}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
