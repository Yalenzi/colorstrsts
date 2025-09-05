'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Save, CheckCircle, XCircle, Loader2, Database, HardDrive } from 'lucide-react';

interface SaveTestsButtonProps {
  tests: any[];
  onSaveSuccess?: () => void;
  onSaveError?: (error: string) => void;
  lang?: 'ar' | 'en';
}

export function SaveTestsButton({ 
  tests, 
  onSaveSuccess, 
  onSaveError, 
  lang = 'ar' 
}: SaveTestsButtonProps) {
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<{
    success: boolean;
    message: string;
    details?: any;
  } | null>(null);

  const isRTL = lang === 'ar';

  const texts = {
    ar: {
      saveButton: 'حفظ الاختبارات',
      saving: 'جاري الحفظ...',
      saveSuccess: 'تم حفظ الاختبارات بنجاح',
      saveError: 'فشل في حفظ الاختبارات',
      saveToFiles: 'حفظ في ملفات قاعدة البيانات',
      saveToStorage: 'حفظ في التخزين المحلي',
      testsCount: 'عدد الاختبارات',
      savedFiles: 'الملفات المحفوظة',
      errors: 'الأخطاء',
      tryAgain: 'إعادة المحاولة',
      details: 'التفاصيل'
    },
    en: {
      saveButton: 'Save Tests',
      saving: 'Saving...',
      saveSuccess: 'Tests saved successfully',
      saveError: 'Failed to save tests',
      saveToFiles: 'Save to database files',
      saveToStorage: 'Save to local storage',
      testsCount: 'Tests count',
      savedFiles: 'Saved files',
      errors: 'Errors',
      tryAgain: 'Try Again',
      details: 'Details'
    }
  };

  const t = texts[lang];

  const handleSave = async () => {
    if (!tests || tests.length === 0) {
      toast.error('No tests to save');
      return;
    }

    setSaving(true);
    setSaveStatus(null);

    try {
      console.log(`🔄 Saving ${tests.length} tests...`);

      // حفظ في localStorage أولاً
      const dataToSave = {
        chemical_tests: tests,
        last_updated: new Date().toISOString(),
        version: "1.0.0",
        total_tests: tests.length,
        saved_by: 'admin_panel'
      };

      localStorage.setItem('chemical_tests_admin', JSON.stringify(dataToSave));
      console.log('✅ Saved to localStorage');

      // حفظ عبر API (إذا كان متاحاً)
      try {
        const response = await fetch('/api/save-tests', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ tests }),
        });

        // Check if response is JSON (API available) or HTML (404 page)
        const contentType = response.headers.get('content-type');
        const isJsonResponse = contentType && contentType.includes('application/json');

        if (!isJsonResponse) {
          console.warn('⚠️ API not available (static export mode) - using localStorage only');
          setSaveStatus({
            success: true,
            message: `${t.saveSuccess} (محلياً)`,
            details: { mode: 'localStorage_only' }
          });
          toast.success(`${t.saveSuccess} (${tests.length} ${t.testsCount.toLowerCase()}) - محلياً`);
          if (onSaveSuccess) {
            onSaveSuccess();
          }
          return;
        }

        if (response.ok) {
          const result = await response.json();
          console.log('✅ Save API response:', result);

          setSaveStatus({
            success: true,
            message: t.saveSuccess,
            details: result
          });

          toast.success(`${t.saveSuccess} (${tests.length} ${t.testsCount.toLowerCase()})`);

          if (onSaveSuccess) {
            onSaveSuccess();
          }

        } else {
          const error = await response.json();
          console.error('❌ Save API failed:', error);

          setSaveStatus({
            success: false,
            message: t.saveError,
            details: error
          });

          toast.error(`${t.saveError}: ${error.error || 'Unknown error'}`);

          if (onSaveError) {
            onSaveError(error.error || 'Save failed');
          }
        }
      } catch (apiError: any) {
        console.error('❌ Save error:', apiError);

        // Check if it's a JSON parsing error (HTML response)
        if (apiError.message && apiError.message.includes('Unexpected token')) {
          console.warn('⚠️ API not available (static export mode) - using localStorage only');
          setSaveStatus({
            success: true,
            message: `${t.saveSuccess} (محلياً)`,
            details: { mode: 'localStorage_only', error: apiError.message }
          });
          toast.success(`${t.saveSuccess} (${tests.length} ${t.testsCount.toLowerCase()}) - محلياً`);
          if (onSaveSuccess) {
            onSaveSuccess();
          }
        } else {
          setSaveStatus({
            success: false,
            message: t.saveError,
            details: { error: apiError.message }
          });
          toast.error(`${t.saveError}: ${apiError.message}`);
          if (onSaveError) {
            onSaveError(apiError.message || 'Save failed');
          }
        }
      }

    } catch (error: any) {
      console.error('❌ Save error:', error);

      setSaveStatus({
        success: false,
        message: t.saveError,
        details: { error: error.message }
      });

      toast.error(`${t.saveError}: ${error.message}`);

      if (onSaveError) {
        onSaveError(error.message);
      }

    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={`space-y-4 ${isRTL ? 'rtl' : 'ltr'}`} dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Save Button */}
      <Button
        onClick={handleSave}
        disabled={saving || !tests || tests.length === 0}
        className="w-full"
        size="lg"
      >
        {saving ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin mr-2" />
            {t.saving}
          </>
        ) : (
          <>
            <Save className="w-5 h-5 mr-2" />
            {t.saveButton} ({tests?.length || 0})
          </>
        )}
      </Button>

      {/* Save Status */}
      {saveStatus && (
        <Alert variant={saveStatus.success ? "default" : "destructive"}>
          <div className="flex items-center gap-2">
            {saveStatus.success ? (
              <CheckCircle className="w-5 h-5 text-green-600" />
            ) : (
              <XCircle className="w-5 h-5 text-red-600" />
            )}
            <AlertDescription className="flex-1">
              {saveStatus.message}
            </AlertDescription>
          </div>
        </Alert>
      )}

      {/* Save Details */}
      {saveStatus?.details && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <Database className="w-4 h-4" />
              {t.details}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {saveStatus.details.count && (
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">{t.testsCount}:</span>
                <span className="text-sm">{saveStatus.details.count}</span>
              </div>
            )}

            {saveStatus.details.savedFiles && (
              <div>
                <span className="text-sm font-medium">{t.savedFiles}:</span>
                <ul className="mt-1 text-xs space-y-1">
                  {saveStatus.details.savedFiles.map((file: string, index: number) => (
                    <li key={index} className="flex items-center gap-2">
                      <HardDrive className="w-3 h-3 text-green-600" />
                      {file}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {saveStatus.details.errors && saveStatus.details.errors.length > 0 && (
              <div>
                <span className="text-sm font-medium text-red-600">{t.errors}:</span>
                <ul className="mt-1 text-xs space-y-1">
                  {saveStatus.details.errors.map((error: string, index: number) => (
                    <li key={index} className="text-red-600">
                      {error}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {saveStatus.details.timestamp && (
              <div className="text-xs text-gray-500 pt-2 border-t">
                {new Date(saveStatus.details.timestamp).toLocaleString(lang === 'ar' ? 'ar-SA' : 'en-US')}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Retry Button */}
      {saveStatus && !saveStatus.success && (
        <Button
          onClick={handleSave}
          disabled={saving}
          variant="outline"
          className="w-full"
        >
          {t.tryAgain}
        </Button>
      )}
    </div>
  );
}
