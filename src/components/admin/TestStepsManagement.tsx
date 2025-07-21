'use client';

import React, { useState, useEffect } from 'react';
import { Language } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  MagnifyingGlassIcon,
  CheckIcon,
  XMarkIcon,
  ExclamationTriangleIcon,
  ListBulletIcon,
  EyeIcon,
  DocumentDuplicateIcon,
  ArrowPathIcon,
  ChartBarIcon,
  BeakerIcon,
  ShieldExclamationIcon,
  DocumentTextIcon,
  BookOpenIcon,
  FunnelIcon
} from '@heroicons/react/24/outline';
import { databaseColorTestService } from '@/lib/database-color-test-service';
import { firebaseTestsService } from '@/lib/firebase-tests-service';
import toast from 'react-hot-toast';

interface TestStepsManagementProps {
  lang: Language;
}

interface ChemicalTestStep {
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
  test_number: string;
  safety_instructions?: string;
  safety_instructions_ar?: string;
  equipment_needed?: string[];
  equipment_needed_ar?: string[];
  created_at: string;
  updated_at: string;
  created_by: string;
}

export function TestStepsManagement({ lang }: TestStepsManagementProps) {
  const [tests, setTests] = useState<ChemicalTestStep[]>([]);
  const [filteredTests, setFilteredTests] = useState<ChemicalTestStep[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedSafetyLevel, setSelectedSafetyLevel] = useState('all');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingTest, setEditingTest] = useState<ChemicalTestStep | null>(null);
  const [viewingTest, setViewingTest] = useState<ChemicalTestStep | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const isRTL = lang === 'ar';

  // Form state for adding/editing
  const [formData, setFormData] = useState({
    method_name: '',
    method_name_ar: '',
    description: '',
    description_ar: '',
    category: 'basic',
    safety_level: 'medium' as 'low' | 'medium' | 'high' | 'critical',
    preparation_time: 5,
    prepare: '',
    prepare_ar: '',
    reference: '',
    test_type: 'chemical',
    test_number: '',
    safety_instructions: '',
    safety_instructions_ar: '',
    equipment_needed: [''],
    equipment_needed_ar: ['']
  });

  // Translations
  const t = {
    title: lang === 'ar' ? 'إدارة خطوات الاختبار' : 'Test Steps Management',
    subtitle: lang === 'ar' ? 'إدارة وتحرير خطوات الاختبارات الكيميائية' : 'Manage and edit chemical test procedures',
    addNew: lang === 'ar' ? 'إضافة اختبار جديد' : 'Add New Test',
    refresh: lang === 'ar' ? 'تحديث' : 'Refresh',
    search: lang === 'ar' ? 'البحث في الاختبارات...' : 'Search tests...',
    allCategories: lang === 'ar' ? 'جميع الفئات' : 'All Categories',
    allSafetyLevels: lang === 'ar' ? 'جميع مستويات السلامة' : 'All Safety Levels',
    view: lang === 'ar' ? 'عرض' : 'View',
    edit: lang === 'ar' ? 'تحرير' : 'Edit',
    duplicate: lang === 'ar' ? 'نسخ' : 'Duplicate',
    delete: lang === 'ar' ? 'حذف' : 'Delete',
    safetyInstructions: lang === 'ar' ? 'تعليمات السلامة' : 'Safety Instructions',
    editInstructions: lang === 'ar' ? 'تحرير التعليمات' : 'Edit Instructions',
    noTests: lang === 'ar' ? 'لا توجد اختبارات' : 'No tests found',
    loading: lang === 'ar' ? 'جاري التحميل...' : 'Loading...',
    save: lang === 'ar' ? 'حفظ' : 'Save',
    cancel: lang === 'ar' ? 'إلغاء' : 'Cancel',
    confirmDelete: lang === 'ar' ? 'تأكيد الحذف' : 'Confirm Delete',
    deleteMessage: lang === 'ar' ? 'هل أنت متأكد من حذف هذا الاختبار؟' : 'Are you sure you want to delete this test?'
  };

  const categories = [
    { id: 'basic', name: lang === 'ar' ? 'أساسي' : 'Basic' },
    { id: 'advanced', name: lang === 'ar' ? 'متقدم' : 'Advanced' },
    { id: 'specialized', name: lang === 'ar' ? 'متخصص' : 'Specialized' },
    { id: 'research', name: lang === 'ar' ? 'بحثي' : 'Research' }
  ];

  const safetyLevels = [
    { id: 'low', name: lang === 'ar' ? 'منخفض' : 'Low', color: 'bg-green-100 text-green-800' },
    { id: 'medium', name: lang === 'ar' ? 'متوسط' : 'Medium', color: 'bg-yellow-100 text-yellow-800' },
    { id: 'high', name: lang === 'ar' ? 'عالي' : 'High', color: 'bg-orange-100 text-orange-800' },
    { id: 'critical', name: lang === 'ar' ? 'حرج' : 'Critical', color: 'bg-red-100 text-red-800' }
  ];

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    filterTests();
  }, [tests, searchTerm, selectedCategory, selectedSafetyLevel]);

  const getSafetyLevelColor = (level: string) => {
    const safetyLevel = safetyLevels.find(s => s.id === level);
    return safetyLevel ? safetyLevel.color : 'bg-gray-100 text-gray-800';
  };

  const filterTests = () => {
    let filtered = tests;

    if (searchTerm) {
      filtered = filtered.filter(test =>
        test.method_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        test.method_name_ar.includes(searchTerm) ||
        test.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        test.description_ar.includes(searchTerm)
      );
    }

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(test => test.category === selectedCategory);
    }

    if (selectedSafetyLevel !== 'all') {
      filtered = filtered.filter(test => test.safety_level === selectedSafetyLevel);
    }

    setFilteredTests(filtered);
  };

  const loadData = async () => {
    try {
      setLoading(true);

      // Load tests from database service
      const allTests = await databaseColorTestService.getAllTests();

      // Transform to ChemicalTestStep format
      const testSteps: ChemicalTestStep[] = allTests.map((test, index) => ({
        id: test.id,
        method_name: test.method_name || `Test ${index + 1}`,
        method_name_ar: test.method_name_ar || `اختبار ${index + 1}`,
        description: test.description || 'Chemical test procedure',
        description_ar: test.description_ar || 'إجراء اختبار كيميائي',
        category: test.category || 'basic',
        safety_level: (test.safety_level as 'low' | 'medium' | 'high' | 'critical') || 'medium',
        preparation_time: test.preparation_time || 5,
        prepare: test.prepare || 'Standard preparation procedure',
        prepare_ar: test.prepare_ar || 'إجراء التحضير القياسي',
        reference: test.reference || 'Chemical Testing Manual',
        test_type: test.test_type || 'chemical',
        test_number: test.test_number || String(index + 1),
        safety_instructions: test.safety_instructions || 'Follow standard safety protocols',
        safety_instructions_ar: test.safety_instructions_ar || 'اتبع بروتوكولات السلامة القياسية',
        equipment_needed: test.equipment_needed || ['Test tubes', 'Reagents', 'Safety equipment'],
        equipment_needed_ar: test.equipment_needed_ar || ['أنابيب اختبار', 'كواشف', 'معدات السلامة'],
        created_at: test.created_at || new Date().toISOString(),
        updated_at: test.updated_at || new Date().toISOString(),
        created_by: test.created_by || 'system'
      }));

      setTests(testSteps);
      console.log(`📋 Loaded ${testSteps.length} chemical test procedures`);

    } catch (error) {
      console.error('Error loading test procedures:', error);
      toast.error(lang === 'ar' ? 'خطأ في تحميل إجراءات الاختبار' : 'Error loading test procedures');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveTest = async () => {
    try {
      if (!formData.method_name || !formData.method_name_ar) {
        toast.error(lang === 'ar' ? 'يرجى ملء جميع الحقول المطلوبة' : 'Please fill all required fields');
        return;
      }

      const newTest: ChemicalTestStep = {
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
        reference: formData.reference,
        test_type: formData.test_type,
        test_number: formData.test_number || String(tests.length + 1),
        safety_instructions: formData.safety_instructions,
        safety_instructions_ar: formData.safety_instructions_ar,
        equipment_needed: formData.equipment_needed.filter(item => item.trim() !== ''),
        equipment_needed_ar: formData.equipment_needed_ar.filter(item => item.trim() !== ''),
        created_at: editingTest?.created_at || new Date().toISOString(),
        updated_at: new Date().toISOString(),
        created_by: editingTest?.created_by || 'admin'
      };

      if (editingTest) {
        // Update existing test
        const updatedTests = tests.map(test => test.id === editingTest.id ? newTest : test);
        setTests(updatedTests);
        toast.success(lang === 'ar' ? 'تم تحديث الاختبار بنجاح' : 'Test updated successfully');
      } else {
        // Add new test
        const updatedTests = [...tests, newTest];
        setTests(updatedTests);
        toast.success(lang === 'ar' ? 'تم إضافة الاختبار بنجاح' : 'Test added successfully');
      }

      // Reset form
      setFormData({
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
        test_type: 'chemical',
        test_number: '',
        safety_instructions: '',
        safety_instructions_ar: '',
        equipment_needed: [''],
        equipment_needed_ar: ['']
      });

      setShowAddForm(false);
      setEditingTest(null);

    } catch (error) {
      console.error('Error saving test:', error);
      toast.error(lang === 'ar' ? 'خطأ في حفظ الاختبار' : 'Error saving test');
    }
  };

  const handleEditTest = (test: ChemicalTestStep) => {
    setEditingTest(test);
    setFormData({
      method_name: test.method_name,
      method_name_ar: test.method_name_ar,
      description: test.description,
      description_ar: test.description_ar,
      category: test.category,
      safety_level: test.safety_level,
      preparation_time: test.preparation_time,
      prepare: test.prepare,
      prepare_ar: test.prepare_ar,
      reference: test.reference,
      test_type: test.test_type,
      test_number: test.test_number,
      safety_instructions: test.safety_instructions || '',
      safety_instructions_ar: test.safety_instructions_ar || '',
      equipment_needed: test.equipment_needed || [''],
      equipment_needed_ar: test.equipment_needed_ar || ['']
    });
    setShowAddForm(true);
  };

  const handleViewTest = (test: ChemicalTestStep) => {
    setViewingTest(test);
  };

  const handleDuplicate = (test: ChemicalTestStep) => {
    const duplicatedTest = {
      ...test,
      id: `test-${Date.now()}`,
      method_name: `${test.method_name} (Copy)`,
      method_name_ar: `${test.method_name_ar} (نسخة)`,
      test_number: String(tests.length + 1),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    setTests(prev => [...prev, duplicatedTest]);
    toast.success(lang === 'ar' ? 'تم نسخ الاختبار بنجاح' : 'Test duplicated successfully');
  };

  const handleDeleteTest = async (testId: string) => {
    try {
      setTests(prev => prev.filter(test => test.id !== testId));
      setDeleteConfirm(null);
      toast.success(lang === 'ar' ? 'تم حذف الاختبار بنجاح' : 'Test deleted successfully');
    } catch (error) {
      console.error('Error deleting test:', error);
      toast.error(lang === 'ar' ? 'خطأ في حذف الاختبار' : 'Error deleting test');
    }
  };

  const addEquipment = (type: 'en' | 'ar') => {
    if (type === 'en') {
      setFormData(prev => ({ ...prev, equipment_needed: [...prev.equipment_needed, ''] }));
    } else {
      setFormData(prev => ({ ...prev, equipment_needed_ar: [...prev.equipment_needed_ar, ''] }));
    }
  };

  const removeEquipment = (type: 'en' | 'ar', index: number) => {
    if (type === 'en') {
      setFormData(prev => ({
        ...prev,
        equipment_needed: prev.equipment_needed.filter((_, i) => i !== index)
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        equipment_needed_ar: prev.equipment_needed_ar.filter((_, i) => i !== index)
      }));
    }
  };

  const updateEquipment = (type: 'en' | 'ar', index: number, value: string) => {
    if (type === 'en') {
      setFormData(prev => ({
        ...prev,
        equipment_needed: prev.equipment_needed.map((item, i) => i === index ? value : item)
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        equipment_needed_ar: prev.equipment_needed_ar.map((item, i) => i === index ? value : item)
      }));
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 rtl:mr-2 rtl:ml-0">{t.loading}</span>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${isRTL ? 'rtl' : 'ltr'}`} dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center space-x-3 rtl:space-x-reverse">
          <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
            <BeakerIcon className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {t.title}
            </h1>
            <p className="text-gray-500">
              {t.subtitle} ({filteredTests.length} {lang === 'ar' ? 'اختبار' : 'tests'})
            </p>
          </div>
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
            onClick={loadData}
            variant="outline"
            className="flex items-center gap-2"
          >
            <ArrowPathIcon className="h-4 w-4" />
            {t.refresh}
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 rtl:right-3 rtl:left-auto top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
              <Input
                type="text"
                placeholder={t.search || (lang === 'ar' ? 'البحث في الاختبارات...' : 'Search tests...')}
                value={searchTerm || ''}
                onChange={(e) => {
                  try {
                    setSearchTerm(e.target.value || '');
                  } catch (error) {
                    console.error('Search input error:', error);
                  }
                }}
                className="pl-10 rtl:pr-10 rtl:pl-3"
              />
            </div>

            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">{t.allCategories}</option>
              {categories.map(category => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>

            <select
              value={selectedSafetyLevel}
              onChange={(e) => setSelectedSafetyLevel(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">{t.allSafetyLevels}</option>
              {safetyLevels.map(level => (
                <option key={level.id} value={level.id}>
                  {level.name}
                </option>
              ))}
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Tests Grid */}
      {filteredTests.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <BeakerIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
              {t.noTests}
            </h3>
            <p className="text-gray-500 mb-4">
              {lang === 'ar'
                ? 'لم يتم العثور على اختبارات تطابق البحث المحدد'
                : 'No tests found matching the current search criteria'
              }
            </p>
            <Button onClick={() => setShowAddForm(true)}>
              {t.addNew}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTests.map((test) => (
            <Card key={test.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <BeakerIcon className="h-5 w-5 text-blue-600" />
                      {lang === 'ar' ? test.method_name_ar : test.method_name}
                    </CardTitle>
                    <CardDescription className="mt-1">
                      {lang === 'ar' ? test.description_ar : test.description}
                    </CardDescription>
                  </div>
                  <Badge className={getSafetyLevelColor(test.safety_level)}>
                    {safetyLevels.find(s => s.id === test.safety_level)?.name || test.safety_level}
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-gray-600">
                      {lang === 'ar' ? 'الفئة:' : 'Category:'}
                    </span>
                    <p className="text-gray-900 dark:text-gray-100">
                      {categories.find(c => c.id === test.category)?.name || test.category}
                    </p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">
                      {lang === 'ar' ? 'وقت التحضير:' : 'Prep Time:'}
                    </span>
                    <p className="text-gray-900 dark:text-gray-100">
                      {test.preparation_time} {lang === 'ar' ? 'دقيقة' : 'min'}
                    </p>
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
                    onClick={() => setDeleteConfirm(test.id)}
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
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <BeakerIcon className="h-5 w-5" />
              {editingTest ? t.edit : t.addNew}
            </DialogTitle>
            <DialogDescription>
              {lang === 'ar'
                ? 'أضف اختبار كيميائي جديد أو حرر اختبار موجود'
                : 'Add a new chemical test or edit an existing one'
              }
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  {lang === 'ar' ? 'اسم الاختبار (إنجليزي)' : 'Test Name (English)'} *
                </label>
                <Input
                  value={formData.method_name}
                  onChange={(e) => setFormData(prev => ({ ...prev, method_name: e.target.value }))}
                  placeholder="Enter test name in English..."
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  {lang === 'ar' ? 'اسم الاختبار (عربي)' : 'Test Name (Arabic)'} *
                </label>
                <Input
                  value={formData.method_name_ar}
                  onChange={(e) => setFormData(prev => ({ ...prev, method_name_ar: e.target.value }))}
                  placeholder="أدخل اسم الاختبار بالعربية..."
                  required
                  dir="rtl"
                />
              </div>
            </div>

            {/* Descriptions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  {lang === 'ar' ? 'الوصف (إنجليزي)' : 'Description (English)'}
                </label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Enter test description in English..."
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  {lang === 'ar' ? 'الوصف (عربي)' : 'Description (Arabic)'}
                </label>
                <Textarea
                  value={formData.description_ar}
                  onChange={(e) => setFormData(prev => ({ ...prev, description_ar: e.target.value }))}
                  placeholder="أدخل وصف الاختبار بالعربية..."
                  rows={3}
                  dir="rtl"
                />
              </div>
            </div>

            {/* Category and Safety */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  {lang === 'ar' ? 'الفئة' : 'Category'}
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {categories.map(category => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  {lang === 'ar' ? 'مستوى السلامة' : 'Safety Level'}
                </label>
                <select
                  value={formData.safety_level}
                  onChange={(e) => setFormData(prev => ({ ...prev, safety_level: e.target.value as 'low' | 'medium' | 'high' | 'critical' }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {safetyLevels.map(level => (
                    <option key={level.id} value={level.id}>
                      {level.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  {lang === 'ar' ? 'وقت التحضير (دقائق)' : 'Preparation Time (minutes)'}
                </label>
                <Input
                  type="number"
                  min="1"
                  max="120"
                  value={formData.preparation_time}
                  onChange={(e) => setFormData(prev => ({ ...prev, preparation_time: parseInt(e.target.value) || 5 }))}
                />
              </div>
            </div>

            {/* Safety Instructions */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <ShieldExclamationIcon className="h-5 w-5 text-orange-600" />
                <h3 className="text-lg font-semibold">
                  {lang === 'ar' ? 'تعليمات السلامة' : 'Safety Instructions'}
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    {lang === 'ar' ? 'تعليمات السلامة (إنجليزي)' : 'Safety Instructions (English)'}
                  </label>
                  <Textarea
                    value={formData.safety_instructions}
                    onChange={(e) => setFormData(prev => ({ ...prev, safety_instructions: e.target.value }))}
                    placeholder="Enter safety instructions in English..."
                    rows={4}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    {lang === 'ar' ? 'تعليمات السلامة (عربي)' : 'Safety Instructions (Arabic)'}
                  </label>
                  <Textarea
                    value={formData.safety_instructions_ar}
                    onChange={(e) => setFormData(prev => ({ ...prev, safety_instructions_ar: e.target.value }))}
                    placeholder="أدخل تعليمات السلامة بالعربية..."
                    rows={4}
                    dir="rtl"
                  />
                </div>
              </div>
            </div>

            {/* Preparation Instructions */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <DocumentTextIcon className="h-5 w-5 text-blue-600" />
                <h3 className="text-lg font-semibold">
                  {lang === 'ar' ? 'تعليمات التحضير' : 'Preparation Instructions'}
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    {lang === 'ar' ? 'تعليمات التحضير (إنجليزي)' : 'Preparation Instructions (English)'}
                  </label>
                  <Textarea
                    value={formData.prepare}
                    onChange={(e) => setFormData(prev => ({ ...prev, prepare: e.target.value }))}
                    placeholder="Enter preparation instructions in English..."
                    rows={4}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    {lang === 'ar' ? 'تعليمات التحضير (عربي)' : 'Preparation Instructions (Arabic)'}
                  </label>
                  <Textarea
                    value={formData.prepare_ar}
                    onChange={(e) => setFormData(prev => ({ ...prev, prepare_ar: e.target.value }))}
                    placeholder="أدخل تعليمات التحضير بالعربية..."
                    rows={4}
                    dir="rtl"
                  />
                </div>
              </div>
            </div>

            {/* Reference */}
            <div>
              <label className="block text-sm font-medium mb-2">
                <BookOpenIcon className="h-4 w-4 inline mr-2" />
                {lang === 'ar' ? 'المرجع العلمي' : 'Scientific Reference'}
              </label>
              <Input
                value={formData.reference}
                onChange={(e) => setFormData(prev => ({ ...prev, reference: e.target.value }))}
                placeholder={lang === 'ar' ? 'أدخل المرجع العلمي...' : 'Enter scientific reference...'}
              />
            </div>

            {/* Equipment Needed */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">
                {lang === 'ar' ? 'المعدات المطلوبة' : 'Equipment Needed'}
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    {lang === 'ar' ? 'المعدات (إنجليزي)' : 'Equipment (English)'}
                  </label>
                  <div className="space-y-2">
                    {formData.equipment_needed.map((equipment, index) => (
                      <div key={index} className="flex items-center space-x-2 rtl:space-x-reverse">
                        <Input
                          value={equipment}
                          onChange={(e) => updateEquipment('en', index, e.target.value)}
                          placeholder="Enter equipment..."
                          className="flex-1"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeEquipment('en', index)}
                          className="text-red-600"
                        >
                          <XMarkIcon className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => addEquipment('en')}
                      className="w-full"
                    >
                      <PlusIcon className="h-4 w-4 mr-2" />
                      {lang === 'ar' ? 'إضافة معدة' : 'Add Equipment'}
                    </Button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    {lang === 'ar' ? 'المعدات (عربي)' : 'Equipment (Arabic)'}
                  </label>
                  <div className="space-y-2">
                    {formData.equipment_needed_ar.map((equipment, index) => (
                      <div key={index} className="flex items-center space-x-2 rtl:space-x-reverse">
                        <Input
                          value={equipment}
                          onChange={(e) => updateEquipment('ar', index, e.target.value)}
                          placeholder="أدخل المعدة..."
                          className="flex-1"
                          dir="rtl"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeEquipment('ar', index)}
                          className="text-red-600"
                        >
                          <XMarkIcon className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => addEquipment('ar')}
                      className="w-full"
                    >
                      <PlusIcon className="h-4 w-4 mr-2" />
                      {lang === 'ar' ? 'إضافة معدة' : 'Add Equipment'}
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-2 rtl:space-x-reverse pt-4 border-t">
              <Button variant="outline" onClick={() => setShowAddForm(false)}>
                {t.cancel}
              </Button>
              <Button onClick={handleSaveTest}>
                {t.save}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* View Test Details Dialog */}
      {viewingTest && (
        <Dialog open={!!viewingTest} onOpenChange={() => setViewingTest(null)}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <BeakerIcon className="h-6 w-6 text-blue-600" />
                {lang === 'ar' ? viewingTest.method_name_ar : viewingTest.method_name}
              </DialogTitle>
              <DialogDescription>
                {lang === 'ar' ? viewingTest.description_ar : viewingTest.description}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6">
              {/* Basic Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <DocumentTextIcon className="h-5 w-5" />
                    {lang === 'ar' ? 'معلومات أساسية' : 'Basic Information'}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-600">
                        {lang === 'ar' ? 'رقم الاختبار:' : 'Test Number:'}
                      </label>
                      <p className="text-sm">{viewingTest.test_number}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">
                        {lang === 'ar' ? 'نوع الاختبار:' : 'Test Type:'}
                      </label>
                      <p className="text-sm">{viewingTest.test_type}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">
                        {lang === 'ar' ? 'الفئة:' : 'Category:'}
                      </label>
                      <Badge variant="outline">{categories.find(c => c.id === viewingTest.category)?.name}</Badge>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">
                        {lang === 'ar' ? 'مستوى السلامة:' : 'Safety Level:'}
                      </label>
                      <Badge className={getSafetyLevelColor(viewingTest.safety_level)}>
                        {safetyLevels.find(s => s.id === viewingTest.safety_level)?.name}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Safety Instructions */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <ShieldExclamationIcon className="h-5 w-5 text-orange-600" />
                    {lang === 'ar' ? 'تعليمات السلامة' : 'Safety Instructions'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="bg-orange-50 p-4 rounded-lg">
                    <p className="text-sm whitespace-pre-wrap">
                      {lang === 'ar' ? viewingTest.safety_instructions_ar : viewingTest.safety_instructions}
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Preparation Instructions */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <DocumentTextIcon className="h-5 w-5 text-blue-600" />
                    {lang === 'ar' ? 'تعليمات التحضير' : 'Preparation Instructions'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <p className="text-sm whitespace-pre-wrap">
                      {lang === 'ar' ? viewingTest.prepare_ar : viewingTest.prepare}
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Equipment Needed */}
              {viewingTest.equipment_needed && viewingTest.equipment_needed.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">
                      {lang === 'ar' ? 'المعدات المطلوبة' : 'Equipment Needed'}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="list-disc list-inside space-y-1">
                      {(lang === 'ar' ? viewingTest.equipment_needed_ar : viewingTest.equipment_needed)?.map((equipment, index) => (
                        <li key={index} className="text-sm">{equipment}</li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}

              {/* Reference */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <BookOpenIcon className="h-5 w-5" />
                    {lang === 'ar' ? 'المرجع العلمي' : 'Scientific Reference'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm">{viewingTest.reference}</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="flex justify-end pt-4 border-t">
              <Button onClick={() => setViewingTest(null)} variant="outline">
                {lang === 'ar' ? 'إغلاق' : 'Close'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Delete Confirmation Dialog */}
      {deleteConfirm && (
        <Dialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-red-600">
                <ExclamationTriangleIcon className="h-5 w-5" />
                {t.confirmDelete}
              </DialogTitle>
              <DialogDescription>
                {t.deleteMessage}
              </DialogDescription>
            </DialogHeader>

            <div className="flex justify-end space-x-2 rtl:space-x-reverse pt-4">
              <Button variant="outline" onClick={() => setDeleteConfirm(null)}>
                {t.cancel}
              </Button>
              <Button variant="destructive" onClick={() => handleDeleteTest(deleteConfirm)}>
                {t.delete}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
