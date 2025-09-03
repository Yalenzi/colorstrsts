'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { SaveTestsButton } from './SaveTestsButton';
import { UnifiedTestEditForm } from './UnifiedTestEditForm';
import { toast } from 'sonner';
import { Language } from '@/types';
import chemicalTestsData from '@/data/chemical-tests.json';
import {
  TestTube,
  Search,
  Plus,
  Edit,
  Trash2,
  Save,
  X,
  Eye,
  Filter,
  Download,
  Upload,
  Palette,
  Clock,
  CheckCircle,
  AlertTriangle,
  BarChart3,
  FileText,
  Beaker,
  Zap,
  Target,
  Activity
} from 'lucide-react';

interface ChemicalTest {
  id: string;
  method_name: string;
  method_name_ar: string;
  description: string;
  description_ar: string;
  category: string;
  safety_level: string;
  preparation_time: number;
  icon: string;
  color_primary: string;
  created_at: string;
  prepare: string;
  prepare_ar: string;
  test_type: string;
  test_number: string;
  color_result: string;
  color_result_ar: string;
  color_hex: string;
  possible_substance: string;
  possible_substance_ar: string;
  confidence_level: string;
  reference: string;
  status?: 'active' | 'inactive' | 'draft';
  usageCount?: number;
  successRate?: number;
}

interface TestStep {
  id: string;
  stepNumber: number;
  instruction: string;
  instructionAr: string;
  expectedResult: string;
  expectedResultAr: string;
  safetyWarning?: string;
  safetyWarningAr?: string;
}

interface ColorResult {
  id: string;
  color: string;
  colorName: string;
  colorNameAr: string;
  substance: string;
  substanceAr: string;
  confidence: number;
}

interface EnhancedTestsManagementProps {
  lang: Language;
}

export function EnhancedTestsManagement({ lang }: EnhancedTestsManagementProps) {
  const isRTL = lang === 'ar';
  const [tests, setTests] = useState<ChemicalTest[]>([]);
  const [filteredTests, setFilteredTests] = useState<ChemicalTest[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTest, setSelectedTest] = useState<ChemicalTest | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [editingTest, setEditingTest] = useState<ChemicalTest | null>(null);
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  useEffect(() => {
    loadTests();
  }, []);

  // Filter tests when search term or filters change
  useEffect(() => {
    const filtered = tests.filter(test => {
      const matchesSearch = test.method_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           test.method_name_ar.includes(searchTerm) ||
                           test.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = filterCategory === 'all' || test.category === filterCategory;
      const matchesStatus = filterStatus === 'all' || test.status === filterStatus;
      return matchesSearch && matchesCategory && matchesStatus;
    });
    setFilteredTests(filtered);
  }, [tests, searchTerm, filterCategory, filterStatus]);

  const loadTests = async () => {
    setLoading(true);
    try {
      console.log('🔄 بدء تحميل الاختبارات من ملف البيانات...');

      // تحميل الاختبارات الحقيقية من ملف البيانات
      const realTests = chemicalTestsData.map((test: any) => ({
        ...test,
        status: 'active' as const,
        usageCount: Math.floor(Math.random() * 100) + 50,
        successRate: Math.floor(Math.random() * 30) + 70
      }));

      console.log(`✅ تم تحميل ${realTests.length} اختبار بنجاح من ملف البيانات`);
      setTests(realTests);
      setFilteredTests(realTests);
      toast.success(isRTL ? `تم تحميل ${realTests.length} اختبار بنجاح` : `${realTests.length} tests loaded successfully`);
    } catch (error) {
      console.error('❌ خطأ في تحميل الاختبارات:', error);
      toast.error(isRTL ? 'خطأ في تحميل الاختبارات' : 'Error loading tests');
    } finally {
      setLoading(false);
    }
  };



  // إضافة اختبار جديد
  const handleAddTest = () => {
    const testName = prompt(
      isRTL ? 'أدخل اسم الاختبار الجديد:' : 'Enter new test name:',
      isRTL ? 'اختبار جديد' : 'New Test'
    );

    if (testName && testName.trim()) {
      const newTest: ChemicalTest = {
        id: `test-${Date.now()}`,
        method_name: testName.trim(),
        method_name_ar: isRTL ? testName.trim() : `اختبار ${testName.trim()}`,
        description: isRTL ? 'وصف الاختبار الجديد' : 'New test description',
        description_ar: isRTL ? 'وصف الاختبار الجديد' : 'وصف الاختبار الجديد',
        category: 'general',
        safety_level: 'medium',
        preparation_time: 10,
        icon: 'test-tube',
        color_primary: '#3B82F6',
        created_at: new Date().toISOString(),
        status: 'active',
        usageCount: 0,
        successRate: 100
      };

      const updatedTests = [...tests, newTest];
      setTests(updatedTests);

      // Save to localStorage
      localStorage.setItem('chemical_tests_admin', JSON.stringify(updatedTests));

      toast.success(isRTL ? 'تم إضافة الاختبار بنجاح' : 'Test added successfully');
    }
  };

  // تعديل اختبار
  const handleEditTest = (test: ChemicalTest) => {
    console.log('🔧 Opening edit form for test:', test);
    console.log('📊 Test data:', {
      id: test.id,
      name: test.method_name,
      name_ar: test.method_name_ar,
      description: test.description,
      category: test.category,
      results: test.results?.length || 0,
      components: test.chemical_components?.length || 0
    });

    setEditingTest(test);
    setShowEditForm(true);
  };

  // حفظ الاختبار المحرر
  const handleSaveEditedTest = async (updatedTest: any) => {
    try {
      console.log('💾 Saving edited test:', updatedTest);

      const updatedTests = tests.map(t =>
        t.id === updatedTest.id ? { ...t, ...updatedTest } : t
      );

      setTests(updatedTests);

      // حفظ في localStorage مع التركيب الصحيح
      const dataToSave = {
        chemical_tests: updatedTests,
        last_updated: new Date().toISOString(),
        version: "1.0.0",
        total_tests: updatedTests.length
      };
      localStorage.setItem('chemical_tests_admin', JSON.stringify(dataToSave));

      setShowEditForm(false);
      setEditingTest(null);

      toast.success(isRTL ? 'تم تحديث الاختبار بنجاح' : 'Test updated successfully');
    } catch (error) {
      console.error('❌ Error saving edited test:', error);
      toast.error(isRTL ? 'فشل في حفظ الاختبار' : 'Failed to save test');
    }
  };

  // إلغاء التحرير
  const handleCancelEdit = () => {
    setShowEditForm(false);
    setEditingTest(null);
  };

  // عرض تفاصيل الاختبار
  const handleViewTest = (test: ChemicalTest) => {
    const testInfo = `
${isRTL ? 'تفاصيل الاختبار:' : 'Test Details:'}

${isRTL ? 'الاسم:' : 'Name:'} ${test.method_name}
${isRTL ? 'الاسم بالعربية:' : 'Arabic Name:'} ${test.method_name_ar}
${isRTL ? 'الوصف:' : 'Description:'} ${test.description}
${isRTL ? 'الفئة:' : 'Category:'} ${test.category}
${isRTL ? 'مستوى الأمان:' : 'Safety Level:'} ${test.safety_level}
${isRTL ? 'وقت التحضير:' : 'Preparation Time:'} ${test.preparation_time} ${isRTL ? 'دقيقة' : 'minutes'}
${isRTL ? 'عدد الاستخدامات:' : 'Usage Count:'} ${test.usageCount || 0}
${isRTL ? 'معدل النجاح:' : 'Success Rate:'} ${test.successRate || 0}%
${isRTL ? 'الحالة:' : 'Status:'} ${test.status}
${isRTL ? 'تاريخ الإنشاء:' : 'Created:'} ${new Date(test.created_at).toLocaleDateString()}
    `;

    alert(testInfo);
  };

  // حذف اختبار
  const handleDeleteTest = (testId: string) => {
    const test = tests.find(t => t.id === testId);
    const confirmMessage = isRTL
      ? `⚠️ تحذير: هل أنت متأكد من حذف الاختبار؟\n\nالاسم: ${test?.method_name}\nالفئة: ${test?.category}\n\nهذا الإجراء لا يمكن التراجع عنه!`
      : `⚠️ Warning: Are you sure you want to delete this test?\n\nName: ${test?.method_name}\nCategory: ${test?.category}\n\nThis action cannot be undone!`;

    if (confirm(confirmMessage)) {
      const updatedTests = tests.filter(test => test.id !== testId);
      setTests(updatedTests);

      // حفظ في localStorage مع التركيب الصحيح
      const dataToSave = {
        chemical_tests: updatedTests,
        last_updated: new Date().toISOString(),
        version: "1.0.0",
        total_tests: updatedTests.length
      };
      localStorage.setItem('chemical_tests_admin', JSON.stringify(dataToSave));

      toast.success(isRTL ? 'تم حذف الاختبار بنجاح' : 'Test deleted successfully');
    }
  };

  // Import tests handler
  const handleImportTests = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';

    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          try {
            const importedTests = JSON.parse(event.target?.result as string);
            if (Array.isArray(importedTests)) {
              const mergedTests = [...tests, ...importedTests];
              setTests(mergedTests);
              localStorage.setItem('chemical_tests_admin', JSON.stringify(mergedTests));
              toast.success(isRTL ? `تم استيراد ${importedTests.length} اختبار` : `Imported ${importedTests.length} tests`);
            } else {
              toast.error(isRTL ? 'تنسيق الملف غير صحيح' : 'Invalid file format');
            }
          } catch (error) {
            toast.error(isRTL ? 'خطأ في قراءة الملف' : 'Error reading file');
          }
        };
        reader.readAsText(file);
      }
    };

    input.click();
  };

  // Export tests handler
  const handleExportTests = () => {
    try {
      const dataStr = JSON.stringify(tests, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);

      const link = document.createElement('a');
      link.href = url;
      link.download = `chemical-tests-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success(isRTL ? 'تم تصدير الاختبارات بنجاح' : 'Tests exported successfully');
    } catch (error) {
      toast.error(isRTL ? 'خطأ في تصدير الاختبارات' : 'Error exporting tests');
    }
  };

  // تغيير حالة الاختبار
  const handleToggleTestStatus = (testId: string) => {
    setTests(tests.map(test => 
      test.id === testId 
        ? { ...test, status: test.status === 'active' ? 'inactive' : 'active' }
        : test
    ));
    toast.success(isRTL ? 'تم تغيير حالة الاختبار' : 'Test status changed');
  };

  // رندر شارة الصعوبة
  const renderDifficultyBadge = (difficulty: string) => {
    const difficultyConfig = {
      low: { color: 'bg-green-100 text-green-800', text: isRTL ? 'أمان منخفض' : 'Low Risk' },
      medium: { color: 'bg-yellow-100 text-yellow-800', text: isRTL ? 'أمان متوسط' : 'Medium Risk' },
      high: { color: 'bg-red-100 text-red-800', text: isRTL ? 'أمان عالي' : 'High Risk' }
    };

    const config = difficultyConfig[difficulty as keyof typeof difficultyConfig] || difficultyConfig.medium;
    return (
      <Badge className={config.color}>
        {config.text}
      </Badge>
    );
  };

  // رندر شارة الحالة
  const renderStatusBadge = (status: string) => {
    const statusConfig = {
      active: { color: 'bg-green-100 text-green-800', text: isRTL ? 'نشط' : 'Active', icon: CheckCircle },
      inactive: { color: 'bg-gray-100 text-gray-800', text: isRTL ? 'غير نشط' : 'Inactive', icon: X },
      draft: { color: 'bg-yellow-100 text-yellow-800', text: isRTL ? 'مسودة' : 'Draft', icon: Edit }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.active;
    const IconComponent = config.icon;

    return (
      <Badge className={`${config.color} flex items-center space-x-1 rtl:space-x-reverse`}>
        <IconComponent className="w-3 h-3" />
        <span>{config.text}</span>
      </Badge>
    );
  };

  return (
    <div className={`space-y-6 ${isRTL ? 'rtl' : 'ltr'}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            {isRTL ? 'إدارة الاختبارات' : 'Tests Management'}
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            {isRTL ? 'إدارة وتنظيم الاختبارات الكيميائية' : 'Manage and organize chemical tests'}
          </p>
        </div>
        <div className="flex space-x-2 rtl:space-x-reverse">
          <Button onClick={handleAddTest} className="bg-blue-600 hover:bg-blue-700">
            <Plus className="w-4 h-4 mr-2 rtl:ml-2 rtl:mr-0" />
            {isRTL ? 'إضافة اختبار' : 'Add Test'}
          </Button>
          <Button variant="outline" onClick={handleImportTests}>
            <Upload className="w-4 h-4 mr-2 rtl:ml-2 rtl:mr-0" />
            {isRTL ? 'استيراد' : 'Import'}
          </Button>
          <Button variant="outline" onClick={handleExportTests}>
            <Download className="w-4 h-4 mr-2 rtl:ml-2 rtl:mr-0" />
            {isRTL ? 'تصدير' : 'Export'}
          </Button>
        </div>

        {/* Save Tests Button */}
        <div className="mt-4">
          <SaveTestsButton
            tests={tests}
            onSaveSuccess={() => {
              toast.success(isRTL ? 'تم حفظ الاختبارات بنجاح في قاعدة البيانات' : 'Tests saved successfully to database');
            }}
            onSaveError={(error) => {
              toast.error(isRTL ? `فشل في حفظ الاختبارات: ${error}` : `Failed to save tests: ${error}`);
            }}
            lang={lang}
          />
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  {isRTL ? 'إجمالي الاختبارات' : 'Total Tests'}
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-2">
                  {tests.length}
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-xl flex items-center justify-center">
                <TestTube className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  {isRTL ? 'الاختبارات النشطة' : 'Active Tests'}
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-2">
                  {tests.filter(t => t.status === 'active').length}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-xl flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  {isRTL ? 'إجمالي الاستخدامات' : 'Total Usage'}
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-2">
                  {tests.reduce((sum, test) => sum + test.usageCount, 0)}
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-xl flex items-center justify-center">
                <Activity className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  {isRTL ? 'معدل النجاح' : 'Success Rate'}
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-2">
                  {tests.length > 0 ? Math.round(tests.reduce((sum, test) => sum + test.successRate, 0) / tests.length) : 0}%
                </p>
              </div>
              <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900 rounded-xl flex items-center justify-center">
                <Target className="h-6 w-6 text-orange-600 dark:text-orange-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2 rtl:space-x-reverse">
              <TestTube className="w-5 h-5" />
              <span>{isRTL ? 'قائمة الاختبارات' : 'Tests List'}</span>
            </CardTitle>
            <div className="flex items-center space-x-2 rtl:space-x-reverse">
              <div className="relative">
                <Search className="absolute left-3 rtl:right-3 rtl:left-auto top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  type="text"
                  placeholder={isRTL ? 'البحث عن اختبار...' : 'Search tests...'}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 rtl:pr-10 rtl:pl-3 w-64"
                />
              </div>
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">{isRTL ? 'جميع الفئات' : 'All Categories'}</option>
                <option value="Stimulants">{isRTL ? 'المنشطات' : 'Stimulants'}</option>
                <option value="Opioids">{isRTL ? 'المواد الأفيونية' : 'Opioids'}</option>
                <option value="Psychedelics">{isRTL ? 'المواد المهلوسة' : 'Psychedelics'}</option>
              </select>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">{isRTL ? 'جميع الحالات' : 'All Status'}</option>
                <option value="active">{isRTL ? 'نشط' : 'Active'}</option>
                <option value="inactive">{isRTL ? 'غير نشط' : 'Inactive'}</option>
                <option value="draft">{isRTL ? 'مسودة' : 'Draft'}</option>
              </select>
              <Button variant="outline" size="sm">
                <Filter className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-2 rtl:mr-2 rtl:ml-0 text-gray-600 dark:text-gray-400">
                {isRTL ? 'جاري التحميل...' : 'Loading...'}
              </span>
            </div>
          ) : filteredTests.length === 0 ? (
            <div className="text-center py-12 text-gray-500 dark:text-gray-400">
              <TestTube className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>{isRTL ? 'لا توجد اختبارات' : 'No tests found'}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTests.map((test) => (
                <Card key={test.id} className="hover:shadow-lg transition-shadow duration-200">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                          {isRTL ? test.method_name_ar : test.method_name}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                          {test.category}
                        </p>
                        <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                          {isRTL ? test.description_ar : test.description}
                        </p>
                      </div>
                      {renderStatusBadge(test.status)}
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                      {isRTL ? test.descriptionAr : test.description}
                    </p>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          {isRTL ? 'مستوى الأمان:' : 'Safety Level:'}
                        </span>
                        {renderDifficultyBadge(test.safety_level)}
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          {isRTL ? 'المدة:' : 'Duration:'}
                        </span>
                        <div className="flex items-center space-x-1 rtl:space-x-reverse">
                          <Clock className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            {test.preparation_time} {isRTL ? 'دقيقة' : 'min'}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          {isRTL ? 'الاستخدامات:' : 'Usage:'}
                        </span>
                        <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          {test.usageCount}
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          {isRTL ? 'معدل النجاح:' : 'Success Rate:'}
                        </span>
                        <span className="text-sm font-medium text-green-600">
                          {test.successRate}%
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleViewTest(test)}
                        className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                      >
                        <Eye className="w-4 h-4 mr-1 rtl:ml-1 rtl:mr-0" />
                        {isRTL ? 'عرض' : 'View'}
                      </Button>

                      <div className="flex items-center space-x-1 rtl:space-x-reverse">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditTest(test)}
                          className="text-gray-600 hover:text-gray-700 hover:bg-gray-50"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>

                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteTest(test.id)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
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

      {/* Edit Form Modal */}
      {showEditForm && editingTest && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-6xl w-full max-h-[95vh] overflow-y-auto">
            <UnifiedTestEditForm
              test={editingTest}
              lang={lang}
              onSave={handleSaveEditedTest}
              onCancel={handleCancelEdit}
              isCreating={false}
            />
          </div>
        </div>
      )}
    </div>
  );
}
