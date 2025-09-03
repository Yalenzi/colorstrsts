'use client';

import { useState, useEffect } from 'react';
import { Language } from '@/types';
import { getTranslationsSync } from '@/lib/translations';
import { Button } from '@/components/ui/button';
import { UnifiedColorResults, convertToUnifiedColorResult, UnifiedColorResult } from '@/components/shared/UnifiedColorResults';
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  SwatchIcon
} from '@heroicons/react/24/outline';
import { getChemicalTestsLocal } from '@/lib/local-data-service';
import { toast } from 'sonner';

interface ColorResult {
  id: string;
  test_id: string;
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
}

interface ColorResultsManagementProps {
  lang: Language;
}

export function ColorResultsManagement({ lang }: ColorResultsManagementProps) {
  const [colorResults, setColorResults] = useState<ColorResult[]>([]);
  const [tests, setTests] = useState<ChemicalTest[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingResult, setEditingResult] = useState<ColorResult | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTest, setSelectedTest] = useState<string>('all');
  const [selectedConfidence, setSelectedConfidence] = useState<string>('all');

  const t = getTranslationsSync(lang);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      console.log('🔄 Loading color results data...');

      // تحميل الاختبارات من الملف المحلي
      const testsData = await getChemicalTestsLocal();
      setTests(testsData);

      // تحميل نتائج الألوان من localStorage أو إنشاء بيانات تجريبية
      const savedResults = localStorage.getItem('color_results_admin');
      let colorResults: ColorResult[] = [];

      if (savedResults) {
        colorResults = JSON.parse(savedResults);
        console.log('📦 Loaded color results from localStorage:', colorResults.length);
      } else {
        // إنشاء بيانات من الاختبارات الجديدة مع التركيب الصحيح
        colorResults = testsData.flatMap((test, index) =>
          test.results?.map((result, resultIndex) => ({
            id: `${test.id}-${resultIndex}`,
            test_id: test.id,
            test_name: test.method_name,
            test_name_ar: test.method_name_ar,
            color_result: result.color || result.color_result || 'Unknown',
            color_result_ar: result.color_ar || result.color_result_ar || 'غير معروف',
            color_hex: result.hex_code || result.color_hex || '#808080',
            possible_substance: result.substance || result.possible_substance || 'Unknown substance',
            possible_substance_ar: result.substance_ar || result.possible_substance_ar || 'مادة غير معروفة',
            confidence_level: typeof result.confidence === 'number' ? result.confidence :
                            result.confidence_level === 'very_high' ? 95 :
                            result.confidence_level === 'high' ? 85 :
                            result.confidence_level === 'medium' ? 75 :
                            result.confidence_level === 'low' ? 60 : 50,
            category: test.category,
            reference: test.reference,
            created_at: test.created_at,
            updated_at: test.updated_at || new Date().toISOString()
          })) || []
        );

        // حفظ البيانات التجريبية
        localStorage.setItem('color_results_admin', JSON.stringify(colorResults));
        console.log('🆕 Created sample color results:', colorResults.length);
      }

      setColorResults(colorResults);

      console.log('✅ Color results loaded successfully:', {
        colorResults: colorResults.length,
        tests: testsData.length
      });

    } catch (error) {
      console.error('❌ Error loading color results data:', error);
      toast.error('خطأ في تحميل بيانات نتائج الألوان');
    } finally {
      setLoading(false);
    }
  };

  const saveColorResults = (updatedResults: ColorResult[]) => {
    setColorResults(updatedResults);
    localStorage.setItem('color_results_admin', JSON.stringify(updatedResults));
    console.log('💾 Color results saved to localStorage:', updatedResults.length);
    toast.success('تم حفظ نتائج الألوان بنجاح');
  };

  const handleAddResult = () => {
    setEditingResult(null);
    setShowModal(true);
  };

  const handleEditResult = (result: ColorResult) => {
    setEditingResult(result);
    setShowModal(true);
  };

  const handleDeleteResult = async (resultId: string) => {
    if (confirm(lang === 'ar' ? 'هل أنت متأكد من حذف هذه النتيجة؟' : 'Are you sure you want to delete this result?')) {
      try {
        const updatedResults = colorResults.filter(result => result.id !== resultId);
        saveColorResults(updatedResults);
        toast.success(lang === 'ar' ? 'تم حذف النتيجة' : 'Result deleted');
      } catch (error) {
        console.error('Error deleting result:', error);
        toast.error(lang === 'ar' ? 'خطأ في حذف النتيجة' : 'Error deleting result');
      }
    }
  };

  const handleSaveResult = async (resultData: ColorResult) => {
    try {
      let updatedResults;
      if (editingResult) {
        // تحديث نتيجة موجودة
        updatedResults = colorResults.map(result =>
          result.id === editingResult.id ? resultData : result
        );
        toast.success(lang === 'ar' ? 'تم تحديث النتيجة' : 'Result updated');
      } else {
        // إضافة نتيجة جديدة
        const newResult = {
          ...resultData,
          id: `result-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
        };
        updatedResults = [...colorResults, newResult];
        toast.success(lang === 'ar' ? 'تم إضافة النتيجة' : 'Result added');
      }

      saveColorResults(updatedResults);
      setShowModal(false);
      setEditingResult(null);
    } catch (error) {
      console.error('Error saving result:', error);
      toast.error(lang === 'ar' ? 'خطأ في حفظ النتيجة' : 'Error saving result');
    }
  };

  const filteredResults = colorResults.filter(result => {
    const matchesSearch = searchQuery === '' || 
      result.color_result.toLowerCase().includes(searchQuery.toLowerCase()) ||
      result.color_result_ar.includes(searchQuery) ||
      result.possible_substance.toLowerCase().includes(searchQuery.toLowerCase()) ||
      result.possible_substance_ar.includes(searchQuery);
    
    const matchesTest = selectedTest === 'all' || result.test_id === selectedTest;
    const matchesConfidence = selectedConfidence === 'all' || result.confidence_level === selectedConfidence;
    
    return matchesSearch && matchesTest && matchesConfidence;
  });

  const getConfidenceLevelColor = (level: string) => {
    switch (level) {
      case 'very_high': return 'text-green-700 bg-green-100 border-green-300 dark:text-green-300 dark:bg-green-900 dark:border-green-700';
      case 'high': return 'text-green-600 bg-green-50 border-green-200 dark:text-green-400 dark:bg-green-900/50 dark:border-green-600';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200 dark:text-yellow-400 dark:bg-yellow-900/50 dark:border-yellow-600';
      case 'low': return 'text-red-600 bg-red-50 border-red-200 dark:text-red-400 dark:bg-red-900/50 dark:border-red-600';
      default: return 'text-gray-600 bg-gray-50 border-gray-200 dark:text-gray-400 dark:bg-gray-800 dark:border-gray-600';
    }
  };

  const getTestName = (testId: string) => {
    const test = tests.find(t => t.id === testId);
    return test ? (lang === 'ar' ? test.method_name_ar : test.method_name) : testId;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <div>
          <h2 className="text-2xl font-bold text-foreground">
            {lang === 'ar' ? 'إدارة النتائج اللونية' : 'Color Results Management'}
          </h2>
          <p className="text-muted-foreground">
            {lang === 'ar' 
              ? 'إدارة وتحرير النتائج اللونية للاختبارات'
              : 'Manage and edit color results for tests'
            }
          </p>
        </div>
        <Button onClick={handleAddResult} className="flex items-center space-x-2 rtl:space-x-reverse">
          <PlusIcon className="h-4 w-4" />
          <span>{lang === 'ar' ? 'إضافة نتيجة جديدة' : 'Add New Result'}</span>
        </Button>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <input
            type="text"
            placeholder={lang === 'ar' ? 'البحث في النتائج...' : 'Search results...'}
            value={searchQuery || ''}
            onChange={(e) => {
              try {
                setSearchQuery(e.target.value || '');
              } catch (error) {
                console.error('Search input error:', error);
              }
            }}
            className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>
        <div>
          <select
            value={selectedTest}
            onChange={(e) => setSelectedTest(e.target.value)}
            className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary-500"
          >
            <option value="all">{lang === 'ar' ? 'جميع الاختبارات' : 'All Tests'}</option>
            {tests.map(test => (
              <option key={test.id} value={test.id}>
                {lang === 'ar' ? test.method_name_ar : test.method_name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <select
            value={selectedConfidence}
            onChange={(e) => setSelectedConfidence(e.target.value)}
            className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary-500"
          >
            <option value="all">{lang === 'ar' ? 'جميع مستويات الثقة' : 'All Confidence Levels'}</option>
            <option value="very_high">{lang === 'ar' ? 'عالي جداً' : 'Very High'}</option>
            <option value="high">{lang === 'ar' ? 'عالي' : 'High'}</option>
            <option value="medium">{lang === 'ar' ? 'متوسط' : 'Medium'}</option>
            <option value="low">{lang === 'ar' ? 'منخفض' : 'Low'}</option>
          </select>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-border">
          <div className="flex items-center space-x-2 rtl:space-x-reverse">
            <SwatchIcon className="h-5 w-5 text-primary-600" />
            <span className="text-sm font-medium text-muted-foreground">
              {lang === 'ar' ? 'إجمالي النتائج' : 'Total Results'}
            </span>
          </div>
          <p className="text-2xl font-bold text-foreground mt-1">{colorResults.length}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-border">
          <div className="flex items-center space-x-2 rtl:space-x-reverse">
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
            <span className="text-sm font-medium text-muted-foreground">
              {lang === 'ar' ? 'ثقة عالية' : 'High Confidence'}
            </span>
          </div>
          <p className="text-2xl font-bold text-foreground mt-1">
            {colorResults.filter(r => r.confidence_level === 'very_high' || r.confidence_level === 'high').length}
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-border">
          <div className="flex items-center space-x-2 rtl:space-x-reverse">
            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
            <span className="text-sm font-medium text-muted-foreground">
              {lang === 'ar' ? 'ثقة متوسطة' : 'Medium Confidence'}
            </span>
          </div>
          <p className="text-2xl font-bold text-foreground mt-1">
            {colorResults.filter(r => r.confidence_level === 'medium').length}
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-border">
          <div className="flex items-center space-x-2 rtl:space-x-reverse">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <span className="text-sm font-medium text-muted-foreground">
              {lang === 'ar' ? 'ثقة منخفضة' : 'Low Confidence'}
            </span>
          </div>
          <p className="text-2xl font-bold text-foreground mt-1">
            {colorResults.filter(r => r.confidence_level === 'low').length}
          </p>
        </div>
      </div>

      {/* Results Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  {lang === 'ar' ? 'اللون' : 'Color'}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  {lang === 'ar' ? 'الاختبار' : 'Test'}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  {lang === 'ar' ? 'المادة المحتملة' : 'Possible Substance'}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  {lang === 'ar' ? 'مستوى الثقة' : 'Confidence'}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  {lang === 'ar' ? 'الإجراءات' : 'Actions'}
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {filteredResults.map((result) => (
                <tr key={result.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-3 rtl:space-x-reverse">
                      <div 
                        className="w-6 h-6 rounded-full border border-gray-300"
                        style={{ backgroundColor: result.color_hex }}
                      ></div>
                      <div>
                        <div className="text-sm font-medium text-foreground">
                          {lang === 'ar' ? result.color_result_ar : result.color_result}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {result.color_hex}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-foreground">
                      {getTestName(result.test_id)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-foreground">
                      {lang === 'ar' ? result.possible_substance_ar : result.possible_substance}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full border ${getConfidenceLevelColor(result.confidence_level)}`}>
                      {lang === 'ar' 
                        ? (result.confidence_level === 'very_high' ? 'عالي جداً' : 
                           result.confidence_level === 'high' ? 'عالي' : 
                           result.confidence_level === 'medium' ? 'متوسط' : 'منخفض')
                        : result.confidence_level.replace('_', ' ')
                      }
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-2 rtl:space-x-reverse">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditResult(result)}
                        className="text-blue-600 hover:text-blue-700"
                      >
                        <PencilIcon className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteResult(result.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Color Result Modal */}
      {showModal && (
        <ColorResultModal
          lang={lang}
          result={editingResult}
          tests={tests}
          onSave={handleSaveResult}
          onClose={() => {
            setShowModal(false);
            setEditingResult(null);
          }}
        />
      )}
    </div>
  );
}

// Color Result Modal Component
interface ColorResultModalProps {
  lang: Language;
  result: ColorResult | null;
  tests: ChemicalTest[];
  onSave: (result: ColorResult) => void;
  onClose: () => void;
}

function ColorResultModal({ lang, result, tests, onSave, onClose }: ColorResultModalProps) {
  const [formData, setFormData] = useState<ColorResult>({
    id: '',
    test_id: '',
    color_result: '',
    color_result_ar: '',
    color_hex: '#FFFFFF',
    possible_substance: '',
    possible_substance_ar: '',
    confidence_level: 'medium'
  });

  // تحديث البيانات عند تغيير النتيجة المُحررة
  useEffect(() => {
    if (result) {
      console.log('🔧 تحميل بيانات النتيجة للتحرير:', result);
      setFormData({
        id: result.id || '',
        test_id: result.test_id || '',
        color_result: result.color_result || '',
        color_result_ar: result.color_result_ar || '',
        color_hex: result.color_hex || '#FFFFFF',
        possible_substance: result.possible_substance || '',
        possible_substance_ar: result.possible_substance_ar || '',
        confidence_level: result.confidence_level || 'medium'
      });
    } else {
      // إعادة تعيين النموذج للإضافة الجديدة
      setFormData({
        id: '',
        test_id: '',
        color_result: '',
        color_result_ar: '',
        color_hex: '#FFFFFF',
        possible_substance: '',
        possible_substance_ar: '',
        confidence_level: 'medium'
      });
    }
  }, [result]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Generate ID if new result
    if (!result) {
      const id = `${formData.test_id}-${formData.color_result.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')}`;
      formData.id = id;
    }

    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold text-foreground">
              {result
                ? (lang === 'ar' ? 'تحرير النتيجة اللونية' : 'Edit Color Result')
                : (lang === 'ar' ? 'إضافة نتيجة لونية جديدة' : 'Add New Color Result')
              }
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Test Selection */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                {lang === 'ar' ? 'الاختبار' : 'Test'}
              </label>
              <select
                name="test_id"
                value={formData.test_id}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary-500"
              >
                <option value="">{lang === 'ar' ? 'اختر الاختبار' : 'Select Test'}</option>
                {tests.map(test => (
                  <option key={test.id} value={test.id}>
                    {lang === 'ar' ? test.method_name_ar : test.method_name}
                  </option>
                ))}
              </select>
            </div>

            {/* Color Result */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  {lang === 'ar' ? 'نتيجة اللون (إنجليزي)' : 'Color Result (English)'}
                </label>
                <input
                  type="text"
                  name="color_result"
                  value={formData.color_result}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary-500"
                  placeholder="Purple to violet"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  {lang === 'ar' ? 'نتيجة اللون (عربي)' : 'Color Result (Arabic)'}
                </label>
                <input
                  type="text"
                  name="color_result_ar"
                  value={formData.color_result_ar}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary-500"
                  placeholder="بنفسجي إلى بنفسجي داكن"
                />
              </div>
            </div>

            {/* Color Hex */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                {lang === 'ar' ? 'كود اللون' : 'Color Hex Code'}
              </label>
              <div className="flex items-center space-x-2 rtl:space-x-reverse">
                <input
                  type="color"
                  name="color_hex"
                  value={formData.color_hex}
                  onChange={handleInputChange}
                  className="w-12 h-10 border border-border rounded cursor-pointer"
                />
                <input
                  type="text"
                  name="color_hex"
                  value={formData.color_hex}
                  onChange={handleInputChange}
                  required
                  className="flex-1 px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary-500"
                  placeholder="#8B5CF6"
                />
              </div>
            </div>

            {/* Possible Substance */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  {lang === 'ar' ? 'المادة المحتملة (إنجليزي)' : 'Possible Substance (English)'}
                </label>
                <input
                  type="text"
                  name="possible_substance"
                  value={formData.possible_substance}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary-500"
                  placeholder="Opium, Morphine, Heroin"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  {lang === 'ar' ? 'المادة المحتملة (عربي)' : 'Possible Substance (Arabic)'}
                </label>
                <input
                  type="text"
                  name="possible_substance_ar"
                  value={formData.possible_substance_ar}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary-500"
                  placeholder="الأفيون، المورفين، الهيروين"
                />
              </div>
            </div>

            {/* Confidence Level */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                {lang === 'ar' ? 'مستوى الثقة' : 'Confidence Level'}
              </label>
              <select
                name="confidence_level"
                value={formData.confidence_level}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary-500"
              >
                <option value="very_high">{lang === 'ar' ? 'عالي جداً' : 'Very High'}</option>
                <option value="high">{lang === 'ar' ? 'عالي' : 'High'}</option>
                <option value="medium">{lang === 'ar' ? 'متوسط' : 'Medium'}</option>
                <option value="low">{lang === 'ar' ? 'منخفض' : 'Low'}</option>
              </select>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-4 rtl:space-x-reverse pt-6 border-t border-border">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
              >
                {lang === 'ar' ? 'إلغاء' : 'Cancel'}
              </Button>
              <Button type="submit">
                {result
                  ? (lang === 'ar' ? 'تحديث النتيجة' : 'Update Result')
                  : (lang === 'ar' ? 'إضافة النتيجة' : 'Add Result')
                }
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
