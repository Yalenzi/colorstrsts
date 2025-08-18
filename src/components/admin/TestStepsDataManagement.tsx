'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { 
  BeakerIcon, 
  PencilIcon, 
  TrashIcon, 
  PlusIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  ShieldCheckIcon,
  EyeIcon,
  DocumentDuplicateIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import { databaseColorTestService } from '@/lib/database-color-test-service';
import { Language } from '@/types';

interface TestStepsDataManagementProps {
  lang: Language;
}

interface TestData {
  id: string;
  method_name: string;
  method_name_ar: string;
  description: string;
  description_ar: string;
  category: string;
  safety_level: string;
  preparation_time: number;
  color_results: Array<{
    color_result: string;
    color_result_ar: string;
    possible_substance: string;
    possible_substance_ar: string;
    confidence_level: string;
    color_hex: string;
  }>;
  prepare: string;
  prepare_ar: string;
  test_type: string;
  test_number: string;
  reference: string;
}

export function TestStepsDataManagement({ lang }: TestStepsDataManagementProps) {
  const [tests, setTests] = useState<TestData[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedTest, setSelectedTest] = useState<TestData | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');

  const isRTL = lang === 'ar';

  const texts = {
    title: isRTL ? 'إدارة خطوات الاختبار' : 'Test Steps Management',
    subtitle: isRTL ? 'إدارة وتحرير بيانات خطوات الاختبارات' : 'Manage and edit test steps data',
    totalTests: isRTL ? 'إجمالي الاختبارات' : 'Total Tests',
    totalResults: isRTL ? 'إجمالي النتائج' : 'Total Results',
    search: isRTL ? 'البحث في الاختبارات...' : 'Search tests...',
    testName: isRTL ? 'اسم الاختبار' : 'Test Name',
    testNameAr: isRTL ? 'اسم الاختبار (عربي)' : 'Test Name (Arabic)',
    description: isRTL ? 'الوصف' : 'Description',
    descriptionAr: isRTL ? 'الوصف (عربي)' : 'Description (Arabic)',
    category: isRTL ? 'الفئة' : 'Category',
    safetyLevel: isRTL ? 'مستوى الأمان' : 'Safety Level',
    preparationTime: isRTL ? 'وقت التحضير (دقائق)' : 'Preparation Time (minutes)',
    prepare: isRTL ? 'التحضير' : 'Preparation',
    prepareAr: isRTL ? 'التحضير (عربي)' : 'Preparation (Arabic)',
    testType: isRTL ? 'نوع الاختبار' : 'Test Type',
    testNumber: isRTL ? 'رقم الاختبار' : 'Test Number',
    reference: isRTL ? 'المرجع' : 'Reference',
    colorResults: isRTL ? 'نتائج الألوان' : 'Color Results',
    actions: isRTL ? 'الإجراءات' : 'Actions',
    edit: isRTL ? 'تحرير' : 'Edit',
    delete: isRTL ? 'حذف' : 'Delete',
    view: isRTL ? 'عرض' : 'View',
    copy: isRTL ? 'نسخ' : 'Copy',
    save: isRTL ? 'حفظ' : 'Save',
    cancel: isRTL ? 'إلغاء' : 'Cancel',
    add: isRTL ? 'إضافة جديد' : 'Add New',
    refresh: isRTL ? 'تحديث' : 'Refresh',
    loading: isRTL ? 'جاري التحميل...' : 'Loading...',
    noTests: isRTL ? 'لا توجد اختبارات' : 'No tests found',
    confirmDelete: isRTL ? 'هل أنت متأكد من حذف هذا الاختبار؟' : 'Are you sure you want to delete this test?',
    deleteSuccess: isRTL ? 'تم حذف الاختبار بنجاح' : 'Test deleted successfully',
    saveSuccess: isRTL ? 'تم حفظ الاختبار بنجاح' : 'Test saved successfully',
    errorOccurred: isRTL ? 'حدث خطأ' : 'An error occurred'
  };

  // Load tests data
  const loadTests = async () => {
    setLoading(true);
    setError('');
    try {
      const testsData = await databaseColorTestService.getAllTests();
      setTests(testsData || []);
      console.log(`📊 Loaded ${testsData?.length || 0} tests for management`);
    } catch (error) {
      console.error('Error loading tests:', error);
      setError(texts.errorOccurred);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTests();
  }, []);

  // Filter tests based on search
  const filteredTests = tests.filter(test => 
    test.method_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    test.method_name_ar.includes(searchQuery) ||
    test.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    test.description_ar.includes(searchQuery)
  );

  const handleEdit = (test: TestData) => {
    setSelectedTest({ ...test });
    setEditMode(true);
  };

  const handleView = (test: TestData) => {
    setSelectedTest(test);
    setEditMode(false);
  };

  const handleSave = async () => {
    if (!selectedTest) return;

    setLoading(true);
    try {
      await databaseColorTestService.updateTest(selectedTest);
      setSuccess(texts.saveSuccess);
      setSelectedTest(null);
      setEditMode(false);
      await loadTests();
    } catch (error) {
      console.error('Error saving test:', error);
      setError(texts.errorOccurred);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (testId: string) => {
    if (!confirm(texts.confirmDelete)) return;

    setLoading(true);
    try {
      await databaseColorTestService.deleteTest(testId);
      setSuccess(texts.deleteSuccess);
      await loadTests();
    } catch (error) {
      console.error('Error deleting test:', error);
      setError(texts.errorOccurred);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (test: TestData) => {
    const newTest = {
      ...test,
      id: `${test.id}-copy-${Date.now()}`,
      method_name: `${test.method_name} (Copy)`,
      method_name_ar: `${test.method_name_ar} (نسخة)`
    };
    setSelectedTest(newTest);
    setEditMode(true);
  };

  const getSafetyLevelColor = (level: string) => {
    switch (level) {
      case 'low': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'high': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300';
      case 'extreme': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'basic': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'advanced': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300';
      case 'specialized': return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  const totalResults = tests.reduce((sum, test) => sum + (test.color_results?.length || 0), 0);

  return (
    <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            {texts.title}
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            {texts.subtitle}
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button onClick={loadTests} variant="outline" size="sm">
            <ArrowPathIcon className="h-4 w-4 mr-2" />
            {texts.refresh}
          </Button>
          <Button onClick={() => { setSelectedTest(null); setEditMode(true); }} size="sm">
            <PlusIcon className="h-4 w-4 mr-2" />
            {texts.add}
          </Button>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="flex items-center p-6">
            <div className="flex items-center">
              <BeakerIcon className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-2xl font-bold">{tests.length}</p>
                <p className="text-gray-600 dark:text-gray-400">{texts.totalTests}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center p-6">
            <div className="flex items-center">
              <DocumentDuplicateIcon className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-2xl font-bold">{totalResults}</p>
                <p className="text-gray-600 dark:text-gray-400">{texts.totalResults}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center p-6">
            <div className="flex items-center">
              <ShieldCheckIcon className="h-8 w-8 text-orange-600" />
              <div className="ml-4">
                <p className="text-2xl font-bold">100%</p>
                <p className="text-gray-600 dark:text-gray-400">
                  {isRTL ? 'مزامنة البيانات' : 'Data Sync'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center space-x-2">
            <Input
              placeholder={texts.search}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1"
            />
          </div>
        </CardContent>
      </Card>

      {/* Tests Table */}
      <Card>
        <CardHeader>
          <CardTitle>{texts.title}</CardTitle>
          <CardDescription>
            {isRTL ? `عرض ${filteredTests.length} من ${tests.length} اختبار` : 
             `Showing ${filteredTests.length} of ${tests.length} tests`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-600 dark:text-gray-400">{texts.loading}</p>
            </div>
          ) : filteredTests.length === 0 ? (
            <div className="text-center py-8">
              <BeakerIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400">{texts.noTests}</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-800">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      {texts.testName}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      {texts.category}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      {texts.safetyLevel}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      {texts.colorResults}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      {texts.actions}
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredTests.map((test) => (
                    <tr key={test.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {isRTL ? test.method_name_ar : test.method_name}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {test.test_number}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge className={getCategoryColor(test.category)}>
                          {test.category}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge className={getSafetyLevelColor(test.safety_level)}>
                          {test.safety_level}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {test.color_results?.length || 0}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <Button
                            onClick={() => handleView(test)}
                            variant="outline"
                            size="sm"
                          >
                            <EyeIcon className="h-4 w-4" />
                          </Button>
                          <Button
                            onClick={() => handleEdit(test)}
                            variant="outline"
                            size="sm"
                          >
                            <PencilIcon className="h-4 w-4" />
                          </Button>
                          <Button
                            onClick={() => handleCopy(test)}
                            variant="outline"
                            size="sm"
                          >
                            <DocumentDuplicateIcon className="h-4 w-4" />
                          </Button>
                          <Button
                            onClick={() => handleDelete(test.id)}
                            variant="outline"
                            size="sm"
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
          )}
        </CardContent>
      </Card>

      {/* Edit/View Modal */}
      {selectedTest && (
        <Card className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <CardTitle>
                {editMode ? 
                  (selectedTest.id ? texts.edit : texts.add) : 
                  texts.view
                } {texts.testName}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {editMode ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="method_name">{texts.testName}</Label>
                    <Input
                      id="method_name"
                      value={selectedTest.method_name}
                      onChange={(e) => setSelectedTest({
                        ...selectedTest,
                        method_name: e.target.value
                      })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="method_name_ar">{texts.testNameAr}</Label>
                    <Input
                      id="method_name_ar"
                      value={selectedTest.method_name_ar}
                      onChange={(e) => setSelectedTest({
                        ...selectedTest,
                        method_name_ar: e.target.value
                      })}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Label htmlFor="description">{texts.description}</Label>
                    <Textarea
                      id="description"
                      value={selectedTest.description}
                      onChange={(e) => setSelectedTest({
                        ...selectedTest,
                        description: e.target.value
                      })}
                      rows={3}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Label htmlFor="description_ar">{texts.descriptionAr}</Label>
                    <Textarea
                      id="description_ar"
                      value={selectedTest.description_ar}
                      onChange={(e) => setSelectedTest({
                        ...selectedTest,
                        description_ar: e.target.value
                      })}
                      rows={3}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Label htmlFor="prepare">{texts.prepare}</Label>
                    <Textarea
                      id="prepare"
                      value={selectedTest.prepare}
                      onChange={(e) => setSelectedTest({
                        ...selectedTest,
                        prepare: e.target.value
                      })}
                      rows={4}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Label htmlFor="prepare_ar">{texts.prepareAr}</Label>
                    <Textarea
                      id="prepare_ar"
                      value={selectedTest.prepare_ar}
                      onChange={(e) => setSelectedTest({
                        ...selectedTest,
                        prepare_ar: e.target.value
                      })}
                      rows={4}
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-white">
                      {isRTL ? selectedTest.method_name_ar : selectedTest.method_name}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {isRTL ? selectedTest.description_ar : selectedTest.description}
                    </p>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white">{texts.prepare}</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 whitespace-pre-wrap">
                      {isRTL ? selectedTest.prepare_ar : selectedTest.prepare}
                    </p>
                  </div>
                  {selectedTest.color_results && selectedTest.color_results.length > 0 && (
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white">{texts.colorResults}</h4>
                      <div className="mt-2 space-y-2">
                        {selectedTest.color_results.map((result, index) => (
                          <div key={index} className="flex items-center space-x-3 p-2 bg-gray-50 dark:bg-gray-700 rounded">
                            <div 
                              className="w-6 h-6 rounded-full border border-gray-300 dark:border-gray-600"
                              style={{ backgroundColor: result.color_hex }}
                            ></div>
                            <div className="flex-1">
                              <p className="text-sm font-medium">
                                {isRTL ? result.color_result_ar : result.color_result}
                              </p>
                              <p className="text-xs text-gray-600 dark:text-gray-400">
                                {isRTL ? result.possible_substance_ar : result.possible_substance}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div className="flex justify-end space-x-2 pt-4 border-t border-gray-200 dark:border-gray-700">
                <Button
                  onClick={() => {
                    setSelectedTest(null);
                    setEditMode(false);
                  }}
                  variant="outline"
                >
                  {texts.cancel}
                </Button>
                {editMode && (
                  <Button onClick={handleSave} disabled={loading}>
                    {texts.save}
                  </Button>
                )}
              </div>
            </CardContent>
          </div>
        </Card>
      )}

      {/* Success/Error Messages */}
      {success && (
        <div className="fixed bottom-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg">
          {success}
        </div>
      )}
      {error && (
        <div className="fixed bottom-4 right-4 bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg">
          {error}
        </div>
      )}
    </div>
  );
}
