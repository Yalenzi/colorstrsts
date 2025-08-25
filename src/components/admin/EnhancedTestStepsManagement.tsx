'use client';

import React, { useState, useEffect } from 'react';
import { Language } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  BeakerIcon,
  PencilIcon,
  EyeIcon,
  MagnifyingGlassIcon,
  DocumentTextIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
  FunnelIcon,
  ArrowPathIcon,
  BookOpenIcon
} from '@heroicons/react/24/outline';
import { getChemicalTestsLocal } from '@/lib/local-data-service';
import { toast } from 'sonner';

interface ChemicalTest {
  id: string;
  method_name: string;
  method_name_ar: string;
  description: string;
  description_ar: string;
  category: string;
  safety_level: 'low' | 'medium' | 'high' | 'critical';
  preparation_time: number;
  prepare: string;
  prepare_ar: string;
  reference: string;
  test_type: string;
  chemical_components?: string[];
}

interface EnhancedTestStepsManagementProps {
  lang: Language;
}

export function EnhancedTestStepsManagement({ lang }: EnhancedTestStepsManagementProps) {
  const [tests, setTests] = useState<ChemicalTest[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedSafety, setSelectedSafety] = useState<string>('all');
  const [editingTest, setEditingTest] = useState<ChemicalTest | null>(null);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showViewDialog, setShowViewDialog] = useState(false);
  const [viewingTest, setViewingTest] = useState<ChemicalTest | null>(null);

  const isRTL = lang === 'ar';

  const texts = {
    title: isRTL ? 'إدارة خطوات الاختبارات' : 'Test Steps Management',
    subtitle: isRTL ? 'إدارة وتحرير خطوات الاختبارات الكيميائية' : 'Manage and edit chemical test steps',
    search: isRTL ? 'البحث في الاختبارات...' : 'Search tests...',
    category: isRTL ? 'الفئة' : 'Category',
    safety: isRTL ? 'مستوى الأمان' : 'Safety Level',
    allCategories: isRTL ? 'جميع الفئات' : 'All Categories',
    allSafety: isRTL ? 'جميع المستويات' : 'All Safety Levels',
    testName: isRTL ? 'اسم الاختبار' : 'Test Name',
    description: isRTL ? 'الوصف' : 'Description',
    steps: isRTL ? 'الخطوات' : 'Steps',
    components: isRTL ? 'المكونات الكيميائية' : 'Chemical Components',
    edit: isRTL ? 'تحرير' : 'Edit',
    view: isRTL ? 'عرض' : 'View',
    save: isRTL ? 'حفظ' : 'Save',
    cancel: isRTL ? 'إلغاء' : 'Cancel',
    close: isRTL ? 'إغلاق' : 'Close',
    refresh: isRTL ? 'تحديث' : 'Refresh',
    noTests: isRTL ? 'لا توجد اختبارات' : 'No tests found',
    loading: isRTL ? 'جاري التحميل...' : 'Loading...',
    safetyLevels: {
      low: isRTL ? 'منخفض' : 'Low',
      medium: isRTL ? 'متوسط' : 'Medium',
      high: isRTL ? 'عالي' : 'High',
      critical: isRTL ? 'حرج' : 'Critical'
    }
  };

  useEffect(() => {
    loadTests();
  }, []);

  const loadTests = async () => {
    try {
      console.log('🔄 Loading chemical tests for steps management...');
      setLoading(true);
      
      const testsData = await getChemicalTestsLocal();
      
      // إضافة المكونات الكيميائية من البيانات المرفقة
      const enhancedTests = testsData.map(test => ({
        ...test,
        chemical_components: getChemicalComponents(test.method_name)
      }));
      
      setTests(enhancedTests);
      console.log('✅ Loaded tests for steps management:', enhancedTests.length);
      
    } catch (error) {
      console.error('❌ Error loading tests:', error);
      toast.error(isRTL ? 'خطأ في تحميل الاختبارات' : 'Error loading tests');
    } finally {
      setLoading(false);
    }
  };

  // دالة للحصول على المكونات الكيميائية
  const getChemicalComponents = (testName: string): string[] => {
    const componentsMap: { [key: string]: string[] } = {
      'Marquis Test': ['Formaldehyde solution (37%)', 'Glacial acetic acid', 'Concentrated sulfuric acid'],
      'Ferric Sulfate Test': ['Ferric sulfate', 'Water'],
      'Mecke Test': ['Selenious acid', 'Concentrated sulfuric acid'],
      'Nitric Acid Test': ['Concentrated nitric acid'],
      'Fast Blue B Salt Test': ['Fast blue B salt', 'Anhydrous sodium sulfate', 'Chloroform', 'Sodium hydroxide'],
      'Duquenois-Levine Test': ['Vanillin', 'Ethanol (95%)', 'Acetaldehyde', 'Concentrated hydrochloric acid', 'Chloroform'],
      'Cobalt Thiocyanate Test': ['Hydrochloric acid (16% aqueous)', 'Cobalt(II) thiocyanate', 'Water'],
      'Modified Cobalt Thiocyanate Test (Scott Test)': ['Cobalt(II) thiocyanate', 'Acetic acid (10% vol/vol)', 'Glycerine', 'Concentrated hydrochloric acid', 'Chloroform'],
      'Methyl Benzoate Test': ['Potassium hydroxide', 'Absolute methanol'],
      'Wagner Test': ['Iodine', 'Potassium iodide', 'Water'],
      'Sulfuric Acid Test': ['Concentrated sulfuric acid'],
      'Simon Test': ['Sodium nitroprusside', 'Water', 'Acetaldehyde', 'Sodium carbonate', 'Water'],
      'Simon Test with Acetone': ['Sodium nitroprusside', 'Acetone (5% vol/vol aqueous)', 'Sodium carbonate', 'Water'],
      'Gallic Acid Test': ['Gallic acid', 'Concentrated sulfuric acid'],
      'Zimmermann Test': ['1,3-dinitrobenzene', 'Methanol', 'Potassium hydroxide', 'Water'],
      'Dinitrobenzene Tests': ['1,2-dinitrobenzene', 'Polyethylene glycol', 'Lithium hydroxide', 'Water', '1,3-dinitrobenzene', 'Polyethylene glycol', '1,4-dinitrobenzene', 'Polyethylene glycol', 'Lithium hydroxide', 'Water'],
      'Dille-Koppanyi Test': ['Cobalt(II) acetate tetrahydrate', 'Absolute methanol', 'Glacial acetic acid', 'Isopropylamine', 'Absolute methanol'],
      'Hydrochloric Acid Test': ['Hydrochloric acid (2N, approx. 7.3%)'],
      'Vitali-Morin Test': ['Concentrated nitric acid', 'Acetone', 'Potassium hydroxide', 'Ethanol'],
      'Ehrlich Test': ['4-dimethylaminobenzaldehyde', 'Methanol', 'Concentrated ortho-phosphoric acid'],
      'Liebermann Test': ['Sodium nitrite', 'Concentrated sulfuric acid'],
      'Nitric Acid-Sulfuric Acid Test': ['Concentrated nitric acid', 'Sulfuric acid'],
      'Chen-Kao Test': ['Acetic acid (1% vol/vol aqueous)', 'Copper(II) sulfate', 'Water', 'Sodium hydroxide']
    };

    return componentsMap[testName] || [];
  };

  const saveTests = (updatedTests: ChemicalTest[]) => {
    setTests(updatedTests);
    localStorage.setItem('chemical_tests_admin', JSON.stringify(updatedTests));
    console.log('💾 Tests saved to localStorage:', updatedTests.length);
    toast.success(isRTL ? 'تم حفظ الاختبارات بنجاح' : 'Tests saved successfully');
  };

  const handleEditTest = (test: ChemicalTest) => {
    setEditingTest({ ...test });
    setShowEditDialog(true);
  };

  const handleViewTest = (test: ChemicalTest) => {
    setViewingTest(test);
    setShowViewDialog(true);
  };

  const handleSaveTest = () => {
    if (!editingTest) return;

    const updatedTests = tests.map(test =>
      test.id === editingTest.id ? editingTest : test
    );

    saveTests(updatedTests);
    setShowEditDialog(false);
    setEditingTest(null);
  };

  const getSafetyBadgeColor = (level: string) => {
    switch (level) {
      case 'low': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'critical': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // فلترة الاختبارات
  const filteredTests = tests.filter(test => {
    const matchesSearch = searchQuery === '' || 
      test.method_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      test.method_name_ar.includes(searchQuery) ||
      test.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      test.description_ar.includes(searchQuery);

    const matchesCategory = selectedCategory === 'all' || test.category === selectedCategory;
    const matchesSafety = selectedSafety === 'all' || test.safety_level === selectedSafety;

    return matchesSearch && matchesCategory && matchesSafety;
  });

  const categories = [...new Set(tests.map(test => test.category))];
  const safetyLevels = ['low', 'medium', 'high', 'critical'];

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-center">
            <ArrowPathIcon className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
            <p className="text-gray-600">{texts.loading}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={`space-y-6 ${isRTL ? 'rtl' : 'ltr'}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <BeakerIcon className="h-6 w-6 text-primary" />
            {texts.title}
          </h2>
          <p className="text-gray-600 mt-1">{texts.subtitle}</p>
        </div>
        <Button onClick={loadTests} variant="outline" size="sm">
          <ArrowPathIcon className="h-4 w-4 mr-2" />
          {texts.refresh}
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder={texts.search}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Category Filter */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="all">{texts.allCategories}</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>

            {/* Safety Filter */}
            <select
              value={selectedSafety}
              onChange={(e) => setSelectedSafety(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="all">{texts.allSafety}</option>
              {safetyLevels.map(level => (
                <option key={level} value={level}>{texts.safetyLevels[level as keyof typeof texts.safetyLevels]}</option>
              ))}
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <BeakerIcon className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  {isRTL ? 'إجمالي الاختبارات' : 'Total Tests'}
                </p>
                <p className="text-2xl font-bold text-gray-900">{tests.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <FunnelIcon className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  {isRTL ? 'النتائج المفلترة' : 'Filtered Results'}
                </p>
                <p className="text-2xl font-bold text-gray-900">{filteredTests.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <ExclamationTriangleIcon className="h-8 w-8 text-red-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  {isRTL ? 'اختبارات عالية الخطورة' : 'High Risk Tests'}
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {tests.filter(t => t.safety_level === 'high' || t.safety_level === 'critical').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <DocumentTextIcon className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  {isRTL ? 'الفئات' : 'Categories'}
                </p>
                <p className="text-2xl font-bold text-gray-900">{categories.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tests List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ListBulletIcon className="h-5 w-5" />
            {isRTL ? 'قائمة الاختبارات' : 'Tests List'}
          </CardTitle>
          <CardDescription>
            {isRTL 
              ? `عرض ${filteredTests.length} من أصل ${tests.length} اختبار`
              : `Showing ${filteredTests.length} of ${tests.length} tests`
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredTests.length === 0 ? (
            <div className="text-center py-12">
              <BeakerIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">{texts.noTests}</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredTests.map((test) => (
                <Card key={test.id} className="border-l-4 border-l-primary">
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">
                            {isRTL ? test.method_name_ar : test.method_name}
                          </h3>
                          <Badge className={getSafetyBadgeColor(test.safety_level)}>
                            {texts.safetyLevels[test.safety_level as keyof typeof texts.safetyLevels]}
                          </Badge>
                          <Badge variant="outline">{test.category}</Badge>
                        </div>
                        
                        <p className="text-gray-600 mb-3">
                          {isRTL ? test.description_ar : test.description}
                        </p>

                        {/* Chemical Components */}
                        {test.chemical_components && test.chemical_components.length > 0 && (
                          <div className="mb-3">
                            <p className="text-sm font-medium text-gray-700 mb-2">
                              {texts.components}:
                            </p>
                            <div className="flex flex-wrap gap-1">
                              {test.chemical_components.map((component, index) => (
                                <Badge key={index} variant="secondary" className="text-xs">
                                  {component}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Preparation Time */}
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <ClockIcon className="h-4 w-4" />
                          <span>
                            {isRTL ? 'وقت التحضير:' : 'Preparation time:'} {test.preparation_time} 
                            {isRTL ? 'دقيقة' : 'minutes'}
                          </span>
                        </div>
                      </div>

                      <div className="flex gap-2 ml-4">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewTest(test)}
                        >
                          <EyeIcon className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditTest(test)}
                        >
                          <PencilIcon className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* View Test Dialog */}
      <Dialog open={showViewDialog} onOpenChange={setShowViewDialog}>
        <DialogContent className="max-w-4xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <BookOpenIcon className="h-5 w-5" />
              {viewingTest && (isRTL ? viewingTest.method_name_ar : viewingTest.method_name)}
            </DialogTitle>
            <DialogDescription>
              {isRTL ? 'عرض تفاصيل الاختبار وخطوات التنفيذ' : 'View test details and execution steps'}
            </DialogDescription>
          </DialogHeader>
          
          {viewingTest && (
            <ScrollArea className="max-h-[60vh]">
              <div className="space-y-6">
                {/* Test Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">{texts.testName}</h4>
                    <p className="text-gray-700">{isRTL ? viewingTest.method_name_ar : viewingTest.method_name}</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">{texts.category}</h4>
                    <Badge variant="outline">{viewingTest.category}</Badge>
                  </div>
                </div>

                <Separator />

                {/* Description */}
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">{texts.description}</h4>
                  <p className="text-gray-700 whitespace-pre-wrap">
                    {isRTL ? viewingTest.description_ar : viewingTest.description}
                  </p>
                </div>

                <Separator />

                {/* Chemical Components */}
                {viewingTest.chemical_components && viewingTest.chemical_components.length > 0 && (
                  <>
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-3">{texts.components}</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {viewingTest.chemical_components.map((component, index) => (
                          <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 rounded-md">
                            <div className="w-2 h-2 bg-primary rounded-full"></div>
                            <span className="text-sm text-gray-700">{component}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <Separator />
                  </>
                )}

                {/* Test Steps */}
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">{texts.steps}</h4>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <pre className="text-sm text-gray-700 whitespace-pre-wrap font-mono">
                      {isRTL ? viewingTest.prepare_ar : viewingTest.prepare}
                    </pre>
                  </div>
                </div>
              </div>
            </ScrollArea>
          )}
          
          <div className="flex justify-end">
            <Button variant="outline" onClick={() => setShowViewDialog(false)}>
              {texts.close}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Test Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-4xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <PencilIcon className="h-5 w-5" />
              {isRTL ? 'تحرير الاختبار' : 'Edit Test'}
            </DialogTitle>
            <DialogDescription>
              {isRTL ? 'تحرير تفاصيل الاختبار وخطوات التنفيذ' : 'Edit test details and execution steps'}
            </DialogDescription>
          </DialogHeader>
          
          {editingTest && (
            <ScrollArea className="max-h-[60vh]">
              <div className="space-y-4">
                {/* Test Names */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {isRTL ? 'اسم الاختبار (إنجليزي)' : 'Test Name (English)'}
                    </label>
                    <Input
                      value={editingTest.method_name}
                      onChange={(e) => setEditingTest({...editingTest, method_name: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {isRTL ? 'اسم الاختبار (عربي)' : 'Test Name (Arabic)'}
                    </label>
                    <Input
                      value={editingTest.method_name_ar}
                      onChange={(e) => setEditingTest({...editingTest, method_name_ar: e.target.value})}
                    />
                  </div>
                </div>

                {/* Descriptions */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {isRTL ? 'الوصف (إنجليزي)' : 'Description (English)'}
                    </label>
                    <Textarea
                      value={editingTest.description}
                      onChange={(e) => setEditingTest({...editingTest, description: e.target.value})}
                      rows={3}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {isRTL ? 'الوصف (عربي)' : 'Description (Arabic)'}
                    </label>
                    <Textarea
                      value={editingTest.description_ar}
                      onChange={(e) => setEditingTest({...editingTest, description_ar: e.target.value})}
                      rows={3}
                    />
                  </div>
                </div>

                {/* Test Steps */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {isRTL ? 'خطوات الاختبار (إنجليزي)' : 'Test Steps (English)'}
                    </label>
                    <Textarea
                      value={editingTest.prepare}
                      onChange={(e) => setEditingTest({...editingTest, prepare: e.target.value})}
                      rows={8}
                      className="font-mono text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {isRTL ? 'خطوات الاختبار (عربي)' : 'Test Steps (Arabic)'}
                    </label>
                    <Textarea
                      value={editingTest.prepare_ar}
                      onChange={(e) => setEditingTest({...editingTest, prepare_ar: e.target.value})}
                      rows={8}
                      className="font-mono text-sm"
                    />
                  </div>
                </div>

                {/* Additional Fields */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {texts.category}
                    </label>
                    <Input
                      value={editingTest.category}
                      onChange={(e) => setEditingTest({...editingTest, category: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {texts.safety}
                    </label>
                    <select
                      value={editingTest.safety_level}
                      onChange={(e) => setEditingTest({...editingTest, safety_level: e.target.value as any})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                      {safetyLevels.map(level => (
                        <option key={level} value={level}>
                          {texts.safetyLevels[level as keyof typeof texts.safetyLevels]}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {isRTL ? 'وقت التحضير (دقائق)' : 'Preparation Time (minutes)'}
                    </label>
                    <Input
                      type="number"
                      value={editingTest.preparation_time}
                      onChange={(e) => setEditingTest({...editingTest, preparation_time: parseInt(e.target.value) || 0})}
                    />
                  </div>
                </div>
              </div>
            </ScrollArea>
          )}
          
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>
              {texts.cancel}
            </Button>
            <Button onClick={handleSaveTest}>
              <CheckCircleIcon className="h-4 w-4 mr-2" />
              {texts.save}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
