'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Save, X, Plus, Trash2, Eye } from 'lucide-react';
import { Language } from '@/types';

interface TestData {
  id?: string;
  method_name: string;
  method_name_ar: string;
  description?: string;
  description_ar?: string;
  category: string;
  safety_level: string;
  preparation_time: number;
  prepare?: string;
  prepare_ar?: string;
  reference?: string;
  test_type?: string;
  test_number?: string;
  icon?: string;
  color_primary?: string;
  results?: any[];
  chemical_components?: any[];
  created_at?: string;
  updated_at?: string;
}

interface UnifiedTestEditFormProps {
  test: TestData | null;
  lang: Language;
  onSave: (test: TestData) => void;
  onCancel: () => void;
  isCreating?: boolean;
}

export function UnifiedTestEditForm({ 
  test, 
  lang, 
  onSave, 
  onCancel, 
  isCreating = false 
}: UnifiedTestEditFormProps) {
  const [formData, setFormData] = useState<TestData>({
    method_name: '',
    method_name_ar: '',
    description: '',
    description_ar: '',
    category: 'basic',
    safety_level: 'medium',
    preparation_time: 5,
    prepare: '',
    prepare_ar: '',
    reference: '',
    test_type: 'F/L',
    test_number: '',
    icon: 'BeakerIcon',
    color_primary: '#8B5CF6',
    results: [],
    chemical_components: []
  });

  const [loading, setSaving] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  const isRTL = lang === 'ar';

  const texts = {
    ar: {
      editTest: 'تحرير الاختبار',
      addTest: 'إضافة اختبار جديد',
      basicInfo: 'المعلومات الأساسية',
      testName: 'اسم الاختبار',
      testNameAr: 'اسم الاختبار بالعربية',
      description: 'الوصف',
      descriptionAr: 'الوصف بالعربية',
      category: 'الفئة',
      safetyLevel: 'مستوى الأمان',
      preparationTime: 'وقت التحضير (دقائق)',
      preparation: 'خطوات التحضير',
      preparationAr: 'خطوات التحضير بالعربية',
      reference: 'المرجع',
      testType: 'نوع الاختبار',
      testNumber: 'رقم الاختبار',
      colorResults: 'النتائج اللونية',
      addColorResult: 'إضافة نتيجة لونية',
      color: 'اللون',
      substance: 'المادة',
      confidence: 'مستوى الثقة',
      save: 'حفظ',
      cancel: 'إلغاء',
      saving: 'جاري الحفظ...',
      required: 'مطلوب',
      preview: 'معاينة',
      errors: 'أخطاء في النموذج'
    },
    en: {
      editTest: 'Edit Test',
      addTest: 'Add New Test',
      basicInfo: 'Basic Information',
      testName: 'Test Name',
      testNameAr: 'Test Name (Arabic)',
      description: 'Description',
      descriptionAr: 'Description (Arabic)',
      category: 'Category',
      safetyLevel: 'Safety Level',
      preparationTime: 'Preparation Time (minutes)',
      preparation: 'Preparation Steps',
      preparationAr: 'Preparation Steps (Arabic)',
      reference: 'Reference',
      testType: 'Test Type',
      testNumber: 'Test Number',
      colorResults: 'Color Results',
      addColorResult: 'Add Color Result',
      color: 'Color',
      substance: 'Substance',
      confidence: 'Confidence',
      save: 'Save',
      cancel: 'Cancel',
      saving: 'Saving...',
      required: 'Required',
      preview: 'Preview',
      errors: 'Form Errors'
    }
  };

  const t = texts[lang];

  // تحميل بيانات الاختبار عند التحرير
  useEffect(() => {
    if (test) {
      console.log('🔄 Loading test data for editing:', test);
      
      setFormData({
        id: test.id,
        method_name: test.method_name || '',
        method_name_ar: test.method_name_ar || '',
        description: test.description || '',
        description_ar: test.description_ar || '',
        category: test.category || 'basic',
        safety_level: test.safety_level || 'medium',
        preparation_time: test.preparation_time || 5,
        prepare: test.prepare || '',
        prepare_ar: test.prepare_ar || '',
        reference: test.reference || '',
        test_type: test.test_type || 'F/L',
        test_number: test.test_number || '',
        icon: test.icon || 'BeakerIcon',
        color_primary: test.color_primary || '#8B5CF6',
        results: test.results || [],
        chemical_components: test.chemical_components || []
      });

      console.log('✅ Test data loaded for editing:', {
        name: test.method_name,
        results: test.results?.length || 0,
        components: test.chemical_components?.length || 0
      });
    }
  }, [test]);

  // التحقق من صحة النموذج
  const validateForm = (): string[] => {
    const newErrors: string[] = [];

    if (!formData.method_name.trim()) {
      newErrors.push(isRTL ? 'اسم الاختبار مطلوب' : 'Test name is required');
    }

    if (!formData.method_name_ar.trim()) {
      newErrors.push(isRTL ? 'اسم الاختبار بالعربية مطلوب' : 'Arabic test name is required');
    }

    if (formData.preparation_time < 1) {
      newErrors.push(isRTL ? 'وقت التحضير يجب أن يكون أكبر من 0' : 'Preparation time must be greater than 0');
    }

    return newErrors;
  };

  // حفظ الاختبار
  const handleSave = async () => {
    const validationErrors = validateForm();
    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      return;
    }

    setSaving(true);
    setErrors([]);

    try {
      const testToSave: TestData = {
        ...formData,
        updated_at: new Date().toISOString(),
        ...(isCreating && { created_at: new Date().toISOString() })
      };

      console.log('💾 Saving test:', testToSave);
      
      onSave(testToSave);
      toast.success(isRTL ? 'تم حفظ الاختبار بنجاح' : 'Test saved successfully');

    } catch (error: any) {
      console.error('❌ Error saving test:', error);
      toast.error(isRTL ? 'فشل في حفظ الاختبار' : 'Failed to save test');
      setErrors([error.message || 'Save failed']);
    } finally {
      setSaving(false);
    }
  };

  // إضافة نتيجة لونية جديدة
  const addColorResult = () => {
    const newResult = {
      color: '',
      color_ar: '',
      hex_code: '#808080',
      substance: '',
      substance_ar: '',
      confidence: 75,
      notes: '',
      notes_ar: ''
    };

    setFormData(prev => ({
      ...prev,
      results: [...(prev.results || []), newResult]
    }));
  };

  // حذف نتيجة لونية
  const removeColorResult = (index: number) => {
    setFormData(prev => ({
      ...prev,
      results: prev.results?.filter((_, i) => i !== index) || []
    }));
  };

  // تحديث نتيجة لونية
  const updateColorResult = (index: number, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      results: prev.results?.map((result, i) => 
        i === index ? { ...result, [field]: value } : result
      ) || []
    }));
  };

  return (
    <div className={`max-w-4xl mx-auto p-6 ${isRTL ? 'rtl' : 'ltr'}`} dir={isRTL ? 'rtl' : 'ltr'}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>{isCreating ? t.addTest : t.editTest}</span>
            <Button variant="outline" size="sm" onClick={onCancel}>
              <X className="w-4 h-4" />
            </Button>
          </CardTitle>
          <CardDescription>
            {isCreating 
              ? (isRTL ? 'إضافة اختبار كيميائي جديد' : 'Add a new chemical test')
              : (isRTL ? 'تحرير بيانات الاختبار الكيميائي' : 'Edit chemical test data')
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

          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">{t.basicInfo}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="method_name">{t.testName} *</Label>
                  <Input
                    id="method_name"
                    value={formData.method_name}
                    onChange={(e) => setFormData(prev => ({ ...prev, method_name: e.target.value }))}
                    placeholder="Marquis Test"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="method_name_ar">{t.testNameAr} *</Label>
                  <Input
                    id="method_name_ar"
                    value={formData.method_name_ar}
                    onChange={(e) => setFormData(prev => ({ ...prev, method_name_ar: e.target.value }))}
                    placeholder="اختبار ماركيز"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="description">{t.description}</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Test description..."
                    rows={3}
                  />
                </div>
                <div>
                  <Label htmlFor="description_ar">{t.descriptionAr}</Label>
                  <Textarea
                    id="description_ar"
                    value={formData.description_ar}
                    onChange={(e) => setFormData(prev => ({ ...prev, description_ar: e.target.value }))}
                    placeholder="وصف الاختبار..."
                    rows={3}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="category">{t.category}</Label>
                  <Select value={formData.category} onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="basic">Basic</SelectItem>
                      <SelectItem value="advanced">Advanced</SelectItem>
                      <SelectItem value="specialized">Specialized</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="safety_level">{t.safetyLevel}</Label>
                  <Select value={formData.safety_level} onValueChange={(value) => setFormData(prev => ({ ...prev, safety_level: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="preparation_time">{t.preparationTime}</Label>
                  <Input
                    id="preparation_time"
                    type="number"
                    min="1"
                    value={formData.preparation_time}
                    onChange={(e) => setFormData(prev => ({ ...prev, preparation_time: parseInt(e.target.value) || 5 }))}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Color Results */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>{t.colorResults}</span>
                <Button size="sm" onClick={addColorResult}>
                  <Plus className="w-4 h-4 mr-2" />
                  {t.addColorResult}
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {formData.results && formData.results.length > 0 ? (
                <div className="space-y-4">
                  {formData.results.map((result, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-medium">Result {index + 1}</h4>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => removeColorResult(index)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                          <Label>{t.color}</Label>
                          <Input
                            value={result.color || ''}
                            onChange={(e) => updateColorResult(index, 'color', e.target.value)}
                            placeholder="Purple"
                          />
                        </div>
                        <div>
                          <Label>{t.color} (Arabic)</Label>
                          <Input
                            value={result.color_ar || ''}
                            onChange={(e) => updateColorResult(index, 'color_ar', e.target.value)}
                            placeholder="بنفسجي"
                          />
                        </div>
                        <div>
                          <Label>Hex Code</Label>
                          <div className="flex gap-2">
                            <Input
                              value={result.hex_code || ''}
                              onChange={(e) => updateColorResult(index, 'hex_code', e.target.value)}
                              placeholder="#8B5CF6"
                            />
                            <div 
                              className="w-10 h-10 rounded border"
                              style={{ backgroundColor: result.hex_code || '#808080' }}
                            />
                          </div>
                        </div>
                        <div>
                          <Label>{t.confidence} (%)</Label>
                          <Input
                            type="number"
                            min="0"
                            max="100"
                            value={result.confidence || 75}
                            onChange={(e) => updateColorResult(index, 'confidence', parseInt(e.target.value) || 75)}
                          />
                        </div>
                        <div>
                          <Label>{t.substance}</Label>
                          <Input
                            value={result.substance || ''}
                            onChange={(e) => updateColorResult(index, 'substance', e.target.value)}
                            placeholder="MDMA"
                          />
                        </div>
                        <div>
                          <Label>{t.substance} (Arabic)</Label>
                          <Input
                            value={result.substance_ar || ''}
                            onChange={(e) => updateColorResult(index, 'substance_ar', e.target.value)}
                            placeholder="إكستاسي"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  No color results added yet
                </div>
              )}
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
            <Button variant="outline" onClick={onCancel} disabled={loading}>
              <X className="w-4 h-4 mr-2" />
              {t.cancel}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
