'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  EyeIcon,
  DocumentDuplicateIcon,
  ArrowPathIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';
import { ChemicalTest } from '@/types';
import { databaseColorTestService } from '@/lib/database-color-test-service';
import toast from 'react-hot-toast';

interface NewTestsManagementProps {
  isRTL: boolean;
  lang: 'ar' | 'en';
}

export default function NewTestsManagement({ isRTL, lang }: NewTestsManagementProps) {
  const [tests, setTests] = useState<ChemicalTest[]>([]);
  const [filteredTests, setFilteredTests] = useState<ChemicalTest[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedSafetyLevel, setSelectedSafetyLevel] = useState('all');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingTest, setEditingTest] = useState<ChemicalTest | null>(null);
  const [formData, setFormData] = useState({
    method_name: '',
    method_name_ar: '',
    description: '',
    description_ar: '',
    category: 'basic',
    safety_level: 'medium',
    preparation_time: 5,
    prepare: '',
    prepare_ar: ''
  });
  const [stats, setStats] = useState({
    total: 0,
    categories: 0,
    safetyLevels: 0,
    colorResults: 0
  });

  const t = {
    title: lang === 'ar' ? 'إدارة الاختبارات الكيميائية' : 'Chemical Tests Management',
    subtitle: lang === 'ar' ? 'إضافة وتحرير وحذف الاختبارات' : 'Add, edit and delete tests',
    addNew: lang === 'ar' ? 'إضافة اختبار جديد' : 'Add New Test',
    search: lang === 'ar' ? 'البحث...' : 'Search...',
    filter: lang === 'ar' ? 'تصفية' : 'Filter',
    category: lang === 'ar' ? 'الفئة' : 'Category',
    safetyLevel: lang === 'ar' ? 'مستوى الأمان' : 'Safety Level',
    all: lang === 'ar' ? 'الكل' : 'All',
    edit: lang === 'ar' ? 'تحرير' : 'Edit',
    delete: lang === 'ar' ? 'حذف' : 'Delete',
    view: lang === 'ar' ? 'عرض' : 'View',
    duplicate: lang === 'ar' ? 'نسخ' : 'Duplicate',
    refresh: lang === 'ar' ? 'تحديث' : 'Refresh',
    noTests: lang === 'ar' ? 'لا توجد اختبارات' : 'No tests found',
    loading: lang === 'ar' ? 'جاري التحميل...' : 'Loading...',
    statistics: lang === 'ar' ? 'الإحصائيات' : 'Statistics',
    totalTests: lang === 'ar' ? 'إجمالي الاختبارات' : 'Total Tests',
    totalCategories: lang === 'ar' ? 'إجمالي الفئات' : 'Total Categories',
    totalSafetyLevels: lang === 'ar' ? 'مستويات الأمان' : 'Safety Levels',
    totalColorResults: lang === 'ar' ? 'النتائج اللونية' : 'Color Results',
    confirmDelete: lang === 'ar' ? 'هل أنت متأكد من حذف هذا الاختبار؟' : 'Are you sure you want to delete this test?',
    testDeleted: lang === 'ar' ? 'تم حذف الاختبار بنجاح' : 'Test deleted successfully',
    errorDeleting: lang === 'ar' ? 'خطأ في حذف الاختبار' : 'Error deleting test',
    errorLoading: lang === 'ar' ? 'خطأ في تحميل الاختبارات' : 'Error loading tests',
    testDuplicated: lang === 'ar' ? 'تم نسخ الاختبار بنجاح' : 'Test duplicated successfully',
    errorDuplicating: lang === 'ar' ? 'خطأ في نسخ الاختبار' : 'Error duplicating test'
  };

  useEffect(() => {
    loadTests();
  }, []);

  useEffect(() => {
    filterTests();
    calculateStats();
  }, [tests, searchTerm, selectedCategory, selectedSafetyLevel]);

  const loadTests = async () => {
    try {
      setLoading(true);
      console.log('🔄 Refreshing tests data...');

      // Force reload from source
      const testsData = await databaseColorTestService.getAllTests();
      console.log(`📊 Loaded ${testsData.length} tests after refresh`);

      setTests(testsData);
      toast.success(lang === 'ar'
        ? `تم تحديث ${testsData.length} اختبار بنجاح`
        : `Successfully refreshed ${testsData.length} tests`
      );
    } catch (error) {
      console.error('Error loading tests:', error);
      toast.error(t.errorLoading);
    } finally {
      setLoading(false);
    }
  };

  const filterTests = () => {
    let filtered = tests;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(test =>
        test.method_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        test.method_name_ar.toLowerCase().includes(searchTerm.toLowerCase()) ||
        test.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        test.description_ar?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(test => test.category === selectedCategory);
    }

    // Safety level filter
    if (selectedSafetyLevel !== 'all') {
      filtered = filtered.filter(test => test.safety_level === selectedSafetyLevel);
    }

    setFilteredTests(filtered);
  };

  const calculateStats = () => {
    // Ensure tests is an array
    if (!tests || !Array.isArray(tests)) {
      setStats({
        total: 0,
        categories: 0,
        safetyLevels: 0,
        colorResults: 0
      });
      return;
    }

    const categories = new Set(tests.map(test => test?.category).filter(Boolean));
    const safetyLevels = new Set(tests.map(test => test?.safety_level).filter(Boolean));
    const totalColorResults = tests.reduce((sum, test) => {
      const results = test?.color_results;
      return sum + (Array.isArray(results) ? results.length : 0);
    }, 0);

    setStats({
      total: tests.length,
      categories: categories.size,
      safetyLevels: safetyLevels.size,
      colorResults: totalColorResults
    });
  };

  const handleDelete = async (testId: string) => {
    if (!confirm(t.confirmDelete)) return;

    try {
      // Delete from local state and localStorage
      const updatedTests = tests.filter(test => test.id !== testId);
      setTests(updatedTests);
      // Save to localStorage
      localStorage.setItem('chemical_tests_data', JSON.stringify({ chemical_tests: updatedTests }));
      toast.success(t.testDeleted);
    } catch (error) {
      console.error('Error deleting test:', error);
      toast.error(t.errorDeleting);
    }
  };

  const handleDuplicate = async (test: ChemicalTest) => {
    try {
      const duplicatedTest: ChemicalTest = {
        ...test,
        id: `${test.id}-copy-${Date.now()}`,
        method_name: `${test.method_name} (Copy)`,
        method_name_ar: `${test.method_name_ar} (نسخة)`
      };

      setTests(prev => [...prev, duplicatedTest]);
      toast.success(t.testDuplicated);
    } catch (error) {
      console.error('Error duplicating test:', error);
      toast.error(t.errorDuplicating);
    }
  };

  const handleSaveTest = async () => {
    try {
      if (!formData.method_name || !formData.method_name_ar) {
        toast.error(lang === 'ar' ? 'يرجى ملء جميع الحقول المطلوبة' : 'Please fill all required fields');
        return;
      }

      const newTest: ChemicalTest = {
        id: editingTest?.id || `test-${Date.now()}`,
        method_name: formData.method_name,
        method_name_ar: formData.method_name_ar,
        description: formData.description,
        description_ar: formData.description_ar,
        category: formData.category,
        safety_level: formData.safety_level,
        preparation_time: formData.preparation_time,
        prepare: formData.prepare,
        prepare_ar: formData.prepare_ar,
        color_results: editingTest?.color_results || [],
        test_type: formData.category,
        test_number: tests.length + 1,
        reference: 'User Added Test'
      };

      if (editingTest) {
        // Update existing test
        const updatedTests = tests.map(test => test.id === editingTest.id ? newTest : test);
        setTests(updatedTests);
        // Save to localStorage
        localStorage.setItem('chemical_tests_data', JSON.stringify({ chemical_tests: updatedTests }));
        toast.success(lang === 'ar' ? 'تم تحديث الاختبار بنجاح' : 'Test updated successfully');
      } else {
        // Add new test
        const updatedTests = [...tests, newTest];
        setTests(updatedTests);
        // Save to localStorage
        localStorage.setItem('chemical_tests_data', JSON.stringify({ chemical_tests: updatedTests }));
        toast.success(lang === 'ar' ? 'تم إضافة الاختبار بنجاح' : 'Test added successfully');
      }

      // Reset form and close dialog
      setFormData({
        method_name: '',
        method_name_ar: '',
        description: '',
        description_ar: '',
        category: 'basic',
        safety_level: 'medium',
        preparation_time: 5,
        prepare: '',
        prepare_ar: ''
      });
      setShowAddForm(false);
      setEditingTest(null);

    } catch (error) {
      console.error('Error saving test:', error);
      toast.error(lang === 'ar' ? 'خطأ في حفظ الاختبار' : 'Error saving test');
    }
  };

  const handleEditTest = (test: ChemicalTest) => {
    setEditingTest(test);
    setFormData({
      method_name: test.method_name,
      method_name_ar: test.method_name_ar,
      description: test.description || '',
      description_ar: test.description_ar || '',
      category: test.category || 'basic',
      safety_level: test.safety_level || 'medium',
      preparation_time: test.preparation_time || 5,
      prepare: test.prepare || '',
      prepare_ar: test.prepare_ar || ''
    });
    setShowAddForm(true);
  };

  const handleViewTest = (test: ChemicalTest) => {
    // Navigate to test details page or show details modal
    const testUrl = `/${lang}/tests/${test.id}`;
    window.open(testUrl, '_blank');
  };

  const getSafetyLevelColor = (level: string) => {
    switch (level) {
      case 'low': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'high': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      case 'extreme': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    }
  };

  const getSafetyLevelText = (level: string) => {
    const levels = {
      low: lang === 'ar' ? 'منخفض' : 'Low',
      medium: lang === 'ar' ? 'متوسط' : 'Medium',
      high: lang === 'ar' ? 'عالي' : 'High',
      extreme: lang === 'ar' ? 'خطير جداً' : 'Extreme'
    };
    return levels[level as keyof typeof levels] || level;
  };

  const getUniqueCategories = () => {
    const categories = [...new Set(tests.map(test => test.category).filter(Boolean))];
    return categories;
  };

  const getUniqueSafetyLevels = () => {
    const levels = [...new Set(tests.map(test => test.safety_level).filter(Boolean))];
    return levels;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2">{t.loading}</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            {t.title}
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            {t.subtitle}
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => setShowAddForm(true)}
            className="flex items-center gap-2"
          >
            <PlusIcon className="h-4 w-4" />
            {t.addNew}
          </Button>
          <Button
            onClick={async () => {
              await databaseColorTestService.reloadData();
              await loadTests();
            }}
            variant="outline"
            className="flex items-center gap-2"
          >
            <ArrowPathIcon className="h-4 w-4" />
            {t.refresh}
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <ChartBarIcon className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  {t.totalTests}
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {stats.total}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <FunnelIcon className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  {t.totalCategories}
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {stats.categories}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Badge className="h-8 w-8 text-orange-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  {t.totalSafetyLevels}
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {stats.safetyLevels}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <EyeIcon className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  {t.totalColorResults}
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {stats.colorResults}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FunnelIcon className="h-5 w-5" />
            {t.filter}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="search">{t.search}</Label>
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                <Input
                  id="search"
                  type="text"
                  placeholder={t.search || (lang === 'ar' ? 'البحث...' : 'Search...')}
                  value={searchTerm || ''}
                  onChange={(e) => {
                    try {
                      setSearchTerm(e.target.value || '');
                    } catch (error) {
                      console.error('Search input error:', error);
                    }
                  }}
                  className="pl-10"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="category">{t.category}</Label>
              <select
                id="category"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
              >
                <option value="all">{t.all}</option>
                {getUniqueCategories().map(category => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <Label htmlFor="safetyLevel">{t.safetyLevel}</Label>
              <select
                id="safetyLevel"
                value={selectedSafetyLevel}
                onChange={(e) => setSelectedSafetyLevel(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
              >
                <option value="all">{t.all}</option>
                {getUniqueSafetyLevels().map(level => (
                  <option key={level} value={level}>
                    {getSafetyLevelText(level)}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-end">
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {lang === 'ar' 
                  ? `عرض ${filteredTests.length} من ${tests.length} اختبار`
                  : `Showing ${filteredTests.length} of ${tests.length} tests`
                }
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tests Grid */}
      {filteredTests.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400">{t.noTests}</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTests.map((test) => (
            <Card key={test.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg">
                      {lang === 'ar' ? test.method_name_ar : test.method_name}
                    </CardTitle>
                    <CardDescription className="mt-1">
                      {lang === 'ar' ? test.description_ar : test.description}
                    </CardDescription>
                  </div>
                  {test.safety_level && (
                    <Badge className={getSafetyLevelColor(test.safety_level)}>
                      {getSafetyLevelText(test.safety_level)}
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 mb-4">
                  {test.category && (
                    <div className="text-sm">
                      <span className="font-medium">{t.category}:</span> {test.category}
                    </div>
                  )}
                  <div className="text-sm">
                    <span className="font-medium">
                      {lang === 'ar' ? 'النتائج اللونية:' : 'Color Results:'}
                    </span> {test.color_results?.length || 0}
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleViewTest(test)}
                    className="flex items-center gap-1"
                  >
                    <EyeIcon className="h-3 w-3" />
                    {t.view}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleEditTest(test)}
                    className="flex items-center gap-1"
                  >
                    <PencilIcon className="h-3 w-3" />
                    {t.edit}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDuplicate(test)}
                    className="flex items-center gap-1"
                  >
                    <DocumentDuplicateIcon className="h-3 w-3" />
                    {t.duplicate}
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleDelete(test.id)}
                    className="flex items-center gap-1"
                  >
                    <TrashIcon className="h-3 w-3" />
                    {t.delete}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Add/Edit Test Dialog */}
      <Dialog open={showAddForm} onOpenChange={setShowAddForm}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingTest ? t.edit : t.addNew}
            </DialogTitle>
            <DialogDescription>
              {lang === 'ar'
                ? 'أضف اختبار كيميائي جديد أو حرر اختبار موجود'
                : 'Add a new chemical test or edit an existing one'
              }
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="method_name">
                  {lang === 'ar' ? 'اسم الاختبار (إنجليزي)' : 'Test Name (English)'}
                </Label>
                <Input
                  id="method_name"
                  placeholder="e.g., Marquis Test"
                  value={formData.method_name}
                  onChange={(e) => setFormData(prev => ({ ...prev, method_name: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="method_name_ar">
                  {lang === 'ar' ? 'اسم الاختبار (عربي)' : 'Test Name (Arabic)'}
                </Label>
                <Input
                  id="method_name_ar"
                  placeholder="مثال: اختبار ماركيز"
                  value={formData.method_name_ar}
                  onChange={(e) => setFormData(prev => ({ ...prev, method_name_ar: e.target.value }))}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="description">
                  {lang === 'ar' ? 'الوصف (إنجليزي)' : 'Description (English)'}
                </Label>
                <Textarea
                  id="description"
                  placeholder="Test description..."
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="description_ar">
                  {lang === 'ar' ? 'الوصف (عربي)' : 'Description (Arabic)'}
                </Label>
                <Textarea
                  id="description_ar"
                  placeholder="وصف الاختبار..."
                  rows={3}
                  value={formData.description_ar}
                  onChange={(e) => setFormData(prev => ({ ...prev, description_ar: e.target.value }))}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="category">
                  {lang === 'ar' ? 'الفئة' : 'Category'}
                </Label>
                <select
                  id="category"
                  value={formData.category}
                  onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
                >
                  <option value="basic">Basic</option>
                  <option value="advanced">Advanced</option>
                  <option value="specialized">Specialized</option>
                </select>
              </div>
              <div>
                <Label htmlFor="safety_level">
                  {lang === 'ar' ? 'مستوى الأمان' : 'Safety Level'}
                </Label>
                <select
                  id="safety_level"
                  value={formData.safety_level}
                  onChange={(e) => setFormData(prev => ({ ...prev, safety_level: e.target.value }))}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="extreme">Extreme</option>
                </select>
              </div>
              <div>
                <Label htmlFor="preparation_time">
                  {lang === 'ar' ? 'وقت التحضير (دقائق)' : 'Preparation Time (minutes)'}
                </Label>
                <Input
                  id="preparation_time"
                  type="number"
                  placeholder="5"
                  min="1"
                  max="60"
                  value={formData.preparation_time}
                  onChange={(e) => setFormData(prev => ({ ...prev, preparation_time: parseInt(e.target.value) || 5 }))}
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button
                variant="outline"
                onClick={() => {
                  setShowAddForm(false);
                  setEditingTest(null);
                  setFormData({
                    method_name: '',
                    method_name_ar: '',
                    description: '',
                    description_ar: '',
                    category: 'basic',
                    safety_level: 'medium',
                    preparation_time: 5,
                    prepare: '',
                    prepare_ar: ''
                  });
                }}
              >
                {lang === 'ar' ? 'إلغاء' : 'Cancel'}
              </Button>
              <Button
                onClick={handleSaveTest}
              >
                {lang === 'ar' ? 'حفظ' : 'Save'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
