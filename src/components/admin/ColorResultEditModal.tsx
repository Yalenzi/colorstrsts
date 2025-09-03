'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Save, X, Palette, TestTube } from 'lucide-react';
import { Language } from '@/types';
import { safeToString, safeToLowerCase, safeHexColor, safeConfidenceToNumber } from '@/lib/safe-string-utils';

interface ColorResultData {
  id?: string;
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

interface ColorResultEditModalProps {
  colorResult: ColorResultData | null;
  lang: Language;
  tests: any[];
  onSave: (result: ColorResultData) => void;
  onClose: () => void;
  isCreating?: boolean;
}

export function ColorResultEditModal({
  colorResult,
  lang,
  tests,
  onSave,
  onClose,
  isCreating = false
}: ColorResultEditModalProps) {
  const [formData, setFormData] = useState<ColorResultData>({
    test_id: '',
    test_name: '',
    test_name_ar: '',
    color_result: '',
    color_result_ar: '',
    color_hex: '#808080',
    possible_substance: '',
    possible_substance_ar: '',
    confidence_level: 75,
    category: '',
    reference: '',
    notes: '',
    notes_ar: ''
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  const isRTL = lang === 'ar';

  const texts = {
    ar: {
      editColorResult: 'تحرير النتيجة اللونية',
      addColorResult: 'إضافة نتيجة لونية جديدة',
      testName: 'اسم الاختبار',
      colorResult: 'النتيجة اللونية',
      colorResultAr: 'النتيجة اللونية بالعربية',
      hexCode: 'كود اللون',
      substance: 'المادة المحتملة',
      substanceAr: 'المادة المحتملة بالعربية',
      confidence: 'مستوى الثقة (%)',
      category: 'الفئة',
      reference: 'المرجع',
      notes: 'ملاحظات',
      notesAr: 'ملاحظات بالعربية',
      save: 'حفظ',
      cancel: 'إلغاء',
      saving: 'جاري الحفظ...',
      required: 'مطلوب',
      preview: 'معاينة',
      errors: 'أخطاء في النموذج',
      selectTest: 'اختر الاختبار',
      colorPreview: 'معاينة اللون',
      confidenceHigh: 'عالي',
      confidenceMedium: 'متوسط',
      confidenceLow: 'منخفض'
    },
    en: {
      editColorResult: 'Edit Color Result',
      addColorResult: 'Add New Color Result',
      testName: 'Test Name',
      colorResult: 'Color Result',
      colorResultAr: 'Color Result (Arabic)',
      hexCode: 'Hex Code',
      substance: 'Possible Substance',
      substanceAr: 'Possible Substance (Arabic)',
      confidence: 'Confidence Level (%)',
      category: 'Category',
      reference: 'Reference',
      notes: 'Notes',
      notesAr: 'Notes (Arabic)',
      save: 'Save',
      cancel: 'Cancel',
      saving: 'Saving...',
      required: 'Required',
      preview: 'Preview',
      errors: 'Form Errors',
      selectTest: 'Select Test',
      colorPreview: 'Color Preview',
      confidenceHigh: 'High',
      confidenceMedium: 'Medium',
      confidenceLow: 'Low'
    }
  };

  const t = texts[lang];

  // تحميل بيانات النتيجة اللونية عند التحرير
  useEffect(() => {
    if (colorResult) {
      console.log('🔄 Loading color result data for editing:', colorResult);
      
      // تحويل آمن للبيانات
      const safeFormData: ColorResultData = {
        id: colorResult.id,
        test_id: safeToString(colorResult.test_id),
        test_name: safeToString(colorResult.test_name),
        test_name_ar: safeToString(colorResult.test_name_ar),
        color_result: safeToString(colorResult.color_result),
        color_result_ar: safeToString(colorResult.color_result_ar),
        color_hex: safeHexColor(colorResult.color_hex),
        possible_substance: safeToString(colorResult.possible_substance),
        possible_substance_ar: safeToString(colorResult.possible_substance_ar),
        confidence_level: safeConfidenceToNumber(colorResult.confidence_level),
        category: safeToString(colorResult.category),
        reference: safeToString(colorResult.reference),
        notes: safeToString(colorResult.notes),
        notes_ar: safeToString(colorResult.notes_ar)
      };

      setFormData(safeFormData);

      console.log('✅ Color result data loaded safely for editing:', {
        id: safeFormData.id,
        test_id: safeFormData.test_id,
        color: safeFormData.color_result,
        hex: safeFormData.color_hex,
        confidence: safeFormData.confidence_level
      });
    }
  }, [colorResult]);

  // تحديث اسم الاختبار عند تغيير test_id
  useEffect(() => {
    if (formData.test_id && tests.length > 0) {
      const selectedTest = tests.find(test => test.id === formData.test_id);
      if (selectedTest) {
        setFormData(prev => ({
          ...prev,
          test_name: safeToString(selectedTest.method_name),
          test_name_ar: safeToString(selectedTest.method_name_ar),
          category: safeToString(selectedTest.category)
        }));
      }
    }
  }, [formData.test_id, tests]);

  // التحقق من صحة النموذج
  const validateForm = (): string[] => {
    const newErrors: string[] = [];

    if (!formData.test_id.trim()) {
      newErrors.push(isRTL ? 'يجب اختيار الاختبار' : 'Test selection is required');
    }

    if (!formData.color_result.trim()) {
      newErrors.push(isRTL ? 'النتيجة اللونية مطلوبة' : 'Color result is required');
    }

    if (!formData.color_result_ar.trim()) {
      newErrors.push(isRTL ? 'النتيجة اللونية بالعربية مطلوبة' : 'Arabic color result is required');
    }

    if (!formData.possible_substance.trim()) {
      newErrors.push(isRTL ? 'المادة المحتملة مطلوبة' : 'Possible substance is required');
    }

    if (!formData.possible_substance_ar.trim()) {
      newErrors.push(isRTL ? 'المادة المحتملة بالعربية مطلوبة' : 'Arabic possible substance is required');
    }

    // فحص hex color
    const hexPattern = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
    if (!hexPattern.test(formData.color_hex)) {
      newErrors.push(isRTL ? 'كود اللون غير صحيح' : 'Invalid hex color code');
    }

    // فحص مستوى الثقة
    const confidence = Number(formData.confidence_level);
    if (isNaN(confidence) || confidence < 0 || confidence > 100) {
      newErrors.push(isRTL ? 'مستوى الثقة يجب أن يكون بين 0 و 100' : 'Confidence level must be between 0 and 100');
    }

    return newErrors;
  };

  // حفظ النتيجة اللونية
  const handleSave = async () => {
    const validationErrors = validateForm();
    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);
    setErrors([]);

    try {
      const resultToSave: ColorResultData = {
        ...formData,
        id: formData.id || `color-result-${Date.now()}`,
        confidence_level: Number(formData.confidence_level)
      };

      console.log('💾 Saving color result:', resultToSave);
      
      onSave(resultToSave);
      toast.success(isRTL ? 'تم حفظ النتيجة اللونية بنجاح' : 'Color result saved successfully');
      onClose();

    } catch (error: any) {
      console.error('❌ Error saving color result:', error);
      toast.error(isRTL ? 'فشل في حفظ النتيجة اللونية' : 'Failed to save color result');
      setErrors([error.message || 'Save failed']);
    } finally {
      setLoading(false);
    }
  };

  // الحصول على لون شارة الثقة
  const getConfidenceBadgeColor = (confidence: number) => {
    if (confidence >= 85) return 'bg-green-100 text-green-800 border-green-200';
    if (confidence >= 70) return 'bg-blue-100 text-blue-800 border-blue-200';
    if (confidence >= 50) return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    return 'bg-red-100 text-red-800 border-red-200';
  };

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className={`bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full max-h-[95vh] overflow-y-auto ${isRTL ? 'rtl' : 'ltr'}`} dir={isRTL ? 'rtl' : 'ltr'}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Palette className="w-5 h-5" />
                <span>{isCreating ? t.addColorResult : t.editColorResult}</span>
              </div>
              <Button variant="outline" size="sm" onClick={onClose}>
                <X className="w-4 h-4" />
              </Button>
            </CardTitle>
            <CardDescription>
              {isCreating 
                ? (isRTL ? 'إضافة نتيجة لونية جديدة للاختبار' : 'Add a new color result to the test')
                : (isRTL ? 'تحرير بيانات النتيجة اللونية' : 'Edit color result data')
              }
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Errors */}
            {errors.length > 0 && (
              <Alert variant="destructive">
                <AlertDescription>
                  <div className="font-medium">{t.errors}:</div>
                  <ul className="mt-1 list-disc list-inside">
                    {errors.map((error, index) => (
                      <li key={index}>{error}</li>
                    ))}
                  </ul>
                </AlertDescription>
              </Alert>
            )}

            {/* Test Selection */}
            <div>
              <Label htmlFor="test_id">{t.testName} *</Label>
              <Select 
                value={formData.test_id} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, test_id: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t.selectTest} />
                </SelectTrigger>
                <SelectContent>
                  {tests.map((test) => (
                    <SelectItem key={test.id} value={test.id}>
                      {isRTL ? test.method_name_ar : test.method_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Color Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="color_result">{t.colorResult} *</Label>
                <Input
                  id="color_result"
                  value={formData.color_result}
                  onChange={(e) => setFormData(prev => ({ ...prev, color_result: e.target.value }))}
                  placeholder="Purple"
                  required
                />
              </div>
              <div>
                <Label htmlFor="color_result_ar">{t.colorResultAr} *</Label>
                <Input
                  id="color_result_ar"
                  value={formData.color_result_ar}
                  onChange={(e) => setFormData(prev => ({ ...prev, color_result_ar: e.target.value }))}
                  placeholder="بنفسجي"
                  required
                />
              </div>
            </div>

            {/* Hex Color */}
            <div>
              <Label htmlFor="color_hex">{t.hexCode} *</Label>
              <div className="flex gap-3 items-center">
                <Input
                  id="color_hex"
                  value={formData.color_hex}
                  onChange={(e) => setFormData(prev => ({ ...prev, color_hex: safeHexColor(e.target.value) }))}
                  placeholder="#8B5CF6"
                  required
                />
                <div 
                  className="w-12 h-12 rounded-lg border-2 border-gray-300 flex-shrink-0"
                  style={{ backgroundColor: formData.color_hex }}
                  title={t.colorPreview}
                />
              </div>
            </div>

            {/* Substance Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="possible_substance">{t.substance} *</Label>
                <Input
                  id="possible_substance"
                  value={formData.possible_substance}
                  onChange={(e) => setFormData(prev => ({ ...prev, possible_substance: e.target.value }))}
                  placeholder="MDMA"
                  required
                />
              </div>
              <div>
                <Label htmlFor="possible_substance_ar">{t.substanceAr} *</Label>
                <Input
                  id="possible_substance_ar"
                  value={formData.possible_substance_ar}
                  onChange={(e) => setFormData(prev => ({ ...prev, possible_substance_ar: e.target.value }))}
                  placeholder="إكستاسي"
                  required
                />
              </div>
            </div>

            {/* Confidence Level */}
            <div>
              <Label htmlFor="confidence_level">{t.confidence} *</Label>
              <div className="flex gap-3 items-center">
                <Input
                  id="confidence_level"
                  type="number"
                  min="0"
                  max="100"
                  value={formData.confidence_level}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    confidence_level: Math.min(100, Math.max(0, parseInt(e.target.value) || 0))
                  }))}
                  required
                />
                <Badge className={getConfidenceBadgeColor(Number(formData.confidence_level))}>
                  {Number(formData.confidence_level) >= 85 ? t.confidenceHigh :
                   Number(formData.confidence_level) >= 60 ? t.confidenceMedium : t.confidenceLow}
                </Badge>
              </div>
            </div>

            {/* Additional Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="category">{t.category}</Label>
                <Input
                  id="category"
                  value={formData.category}
                  onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                  placeholder="stimulant"
                />
              </div>
              <div>
                <Label htmlFor="reference">{t.reference}</Label>
                <Input
                  id="reference"
                  value={formData.reference}
                  onChange={(e) => setFormData(prev => ({ ...prev, reference: e.target.value }))}
                  placeholder="REF-001"
                />
              </div>
            </div>

            {/* Notes */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="notes">{t.notes}</Label>
                <Input
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Additional notes..."
                />
              </div>
              <div>
                <Label htmlFor="notes_ar">{t.notesAr}</Label>
                <Input
                  id="notes_ar"
                  value={formData.notes_ar}
                  onChange={(e) => setFormData(prev => ({ ...prev, notes_ar: e.target.value }))}
                  placeholder="ملاحظات إضافية..."
                />
              </div>
            </div>

            {/* Preview */}
            <Card className="bg-gray-50 dark:bg-gray-900">
              <CardHeader>
                <CardTitle className="text-sm">{t.preview}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3">
                  <div 
                    className="w-8 h-8 rounded-full border-2 border-gray-300"
                    style={{ backgroundColor: formData.color_hex }}
                  />
                  <div className="flex-1">
                    <div className="font-medium">
                      {isRTL ? formData.color_result_ar : formData.color_result}
                    </div>
                    <div className="text-sm text-gray-600">
                      {isRTL ? formData.possible_substance_ar : formData.possible_substance}
                    </div>
                  </div>
                  <Badge className={getConfidenceBadgeColor(Number(formData.confidence_level))}>
                    {formData.confidence_level}%
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <div className="flex gap-3">
              <Button onClick={handleSave} disabled={loading} className="flex-1">
                {loading ? (
                  <>
                    <Save className="w-4 h-4 mr-2 animate-pulse" />
                    {t.saving}
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    {t.save}
                  </>
                )}
              </Button>
              <Button variant="outline" onClick={onClose} disabled={loading}>
                <X className="w-4 h-4 mr-2" />
                {t.cancel}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
