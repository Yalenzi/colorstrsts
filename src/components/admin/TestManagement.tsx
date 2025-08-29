'use client';

import React, { useState, useEffect } from 'react';
import { Language } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { 
  PlusIcon, 
  PencilIcon, 
  TrashIcon, 
  EyeIcon,
  BeakerIcon,
  DocumentTextIcon,
  ShieldCheckIcon,
  CubeIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

interface TestManagementProps {
  lang: Language;
}

interface ChemicalTest {
  id: string;
  method_name: string;
  method_name_ar: string;
  description?: string;
  description_ar?: string;
  safety_instructions?: string[];
  safety_instructions_ar?: string[];
  required_equipment?: string[];
  required_equipment_ar?: string[];
  handling_procedures?: string[];
  handling_procedures_ar?: string[];
  chemical_components?: Array<{
    name: string;
    name_ar: string;
    formula?: string;
    concentration?: string;
  }>;
  test_instructions?: string[];
  test_instructions_ar?: string[];
  color_results?: Array<{
    id: string;
    color_hex: string;
    color_result: string;
    color_result_ar: string;
    possible_substance?: string;
    possible_substance_ar?: string;
    confidence_level: string;
  }>;
  safety_acknowledgment_required?: boolean;
  created_at?: string;
  updated_at?: string;
}

export function TestManagement({ lang }: TestManagementProps) {
  const [tests, setTests] = useState<ChemicalTest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTest, setSelectedTest] = useState<ChemicalTest | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const isRTL = lang === 'ar';

  const texts = {
    ar: {
      title: 'إدارة الاختبارات',
      description: 'إدارة شاملة لجميع الاختبارات الكيميائية في النظام',
      addNewTest: 'إضافة اختبار جديد',
      editTest: 'تعديل الاختبار',
      deleteTest: 'حذف الاختبار',
      previewTest: 'معاينة الاختبار',
      searchTests: 'البحث في الاختبارات...',
      testName: 'اسم الاختبار',
      testNameAr: 'اسم الاختبار بالعربية',
      description: 'الوصف',
      descriptionAr: 'الوصف بالعربية',
      safetyInstructions: 'تعليمات السلامة',
      safetyInstructionsAr: 'تعليمات السلامة بالعربية',
      requiredEquipment: 'المعدات المطلوبة',
      requiredEquipmentAr: 'المعدات المطلوبة بالعربية',
      handlingProcedures: 'إجراءات التعامل',
      handlingProceduresAr: 'إجراءات التعامل بالعربية',
      chemicalComponents: 'المكونات الكيميائية',
      testInstructions: 'تعليمات الاختبار',
      testInstructionsAr: 'تعليمات الاختبار بالعربية',
      colorResults: 'نتائج الألوان',
      save: 'حفظ',
      cancel: 'إلغاء',
      delete: 'حذف',
      edit: 'تعديل',
      preview: 'معاينة',
      confirmDelete: 'هل أنت متأكد من حذف هذا الاختبار؟',
      deleteSuccess: 'تم حذف الاختبار بنجاح',
      saveSuccess: 'تم حفظ الاختبار بنجاح',
      saveError: 'حدث خطأ أثناء الحفظ',
      loadError: 'حدث خطأ أثناء تحميل الاختبارات',
      noTests: 'لا توجد اختبارات',
      noTestsFound: 'لم يتم العثور على اختبارات مطابقة',
      requiredField: 'هذا الحقل مطلوب',
      componentName: 'اسم المكون',
      componentNameAr: 'اسم المكون بالعربية',
      formula: 'الصيغة الكيميائية',
      concentration: 'التركيز',
      addComponent: 'إضافة مكون',
      removeComponent: 'إزالة المكون',
      colorHex: 'كود اللون',
      colorResult: 'نتيجة اللون',
      colorResultAr: 'نتيجة اللون بالعربية',
      possibleSubstance: 'المادة المحتملة',
      possibleSubstanceAr: 'المادة المحتملة بالعربية',
      confidenceLevel: 'مستوى الثقة',
      addColorResult: 'إضافة نتيجة لون',
      removeColorResult: 'إزالة نتيجة اللون',
      safetyAcknowledgmentRequired: 'يتطلب إقرار السلامة'
    },
    en: {
      title: 'Test Management',
      description: 'Comprehensive management of all chemical tests in the system',
      addNewTest: 'Add New Test',
      editTest: 'Edit Test',
      deleteTest: 'Delete Test',
      previewTest: 'Preview Test',
      searchTests: 'Search tests...',
      testName: 'Test Name',
      testNameAr: 'Test Name (Arabic)',
      description: 'Description',
      descriptionAr: 'Description (Arabic)',
      safetyInstructions: 'Safety Instructions',
      safetyInstructionsAr: 'Safety Instructions (Arabic)',
      requiredEquipment: 'Required Equipment',
      requiredEquipmentAr: 'Required Equipment (Arabic)',
      handlingProcedures: 'Handling Procedures',
      handlingProceduresAr: 'Handling Procedures (Arabic)',
      chemicalComponents: 'Chemical Components',
      testInstructions: 'Test Instructions',
      testInstructionsAr: 'Test Instructions (Arabic)',
      colorResults: 'Color Results',
      save: 'Save',
      cancel: 'Cancel',
      delete: 'Delete',
      edit: 'Edit',
      preview: 'Preview',
      confirmDelete: 'Are you sure you want to delete this test?',
      deleteSuccess: 'Test deleted successfully',
      saveSuccess: 'Test saved successfully',
      saveError: 'Error saving test',
      loadError: 'Error loading tests',
      noTests: 'No tests available',
      noTestsFound: 'No matching tests found',
      requiredField: 'This field is required',
      componentName: 'Component Name',
      componentNameAr: 'Component Name (Arabic)',
      formula: 'Chemical Formula',
      concentration: 'Concentration',
      addComponent: 'Add Component',
      removeComponent: 'Remove Component',
      colorHex: 'Color Code',
      colorResult: 'Color Result',
      colorResultAr: 'Color Result (Arabic)',
      possibleSubstance: 'Possible Substance',
      possibleSubstanceAr: 'Possible Substance (Arabic)',
      confidenceLevel: 'Confidence Level',
      addColorResult: 'Add Color Result',
      removeColorResult: 'Remove Color Result',
      safetyAcknowledgmentRequired: 'Safety Acknowledgment Required'
    }
  };

  const t = texts[lang];

  // Initialize empty test for creation
  const createEmptyTest = (): ChemicalTest => ({
    id: '',
    method_name: '',
    method_name_ar: '',
    description: '',
    description_ar: '',
    safety_instructions: [''],
    safety_instructions_ar: [''],
    required_equipment: [''],
    required_equipment_ar: [''],
    handling_procedures: [''],
    handling_procedures_ar: [''],
    chemical_components: [{
      name: '',
      name_ar: '',
      formula: '',
      concentration: ''
    }],
    test_instructions: [''],
    test_instructions_ar: [''],
    color_results: [{
      id: '',
      color_hex: '#000000',
      color_result: '',
      color_result_ar: '',
      possible_substance: '',
      possible_substance_ar: '',
      confidence_level: 'medium'
    }],
    safety_acknowledgment_required: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  });

  // Load tests from localStorage (simulating database)
  useEffect(() => {
    loadTests();
  }, []);

  const loadTests = async () => {
    setLoading(true);
    try {
      // Load from localStorage first
      const savedTests = localStorage.getItem('chemical_tests_db');
      if (savedTests) {
        setTests(JSON.parse(savedTests));
      } else {
        // Load from Db.json if no localStorage data
        const response = await fetch('/api/tests');
        if (response.ok) {
          const data = await response.json();
          setTests(data.tests || []);
        }
      }
    } catch (error) {
      console.error('Error loading tests:', error);
      toast.error(t.loadError);
    } finally {
      setLoading(false);
    }
  };

  const saveTestsToStorage = (updatedTests: ChemicalTest[]) => {
    try {
      localStorage.setItem('chemical_tests_db', JSON.stringify(updatedTests));
      // Here you would also sync with Db.json file
      // await syncWithDatabase(updatedTests);
    } catch (error) {
      console.error('Error saving tests:', error);
      throw error;
    }
  };

  const handleCreateTest = () => {
    setSelectedTest(createEmptyTest());
    setIsCreating(true);
    setIsEditing(true);
  };

  const handleEditTest = (test: ChemicalTest) => {
    setSelectedTest({ ...test });
    setIsCreating(false);
    setIsEditing(true);
  };

  const handleDeleteTest = async (testId: string) => {
    if (!confirm(t.confirmDelete)) return;

    try {
      const updatedTests = tests.filter(test => test.id !== testId);
      setTests(updatedTests);
      saveTestsToStorage(updatedTests);
      toast.success(t.deleteSuccess);
    } catch (error) {
      console.error('Error deleting test:', error);
      toast.error(t.saveError);
    }
  };

  const handleSaveTest = async () => {
    if (!selectedTest) return;

    // Validation
    if (!selectedTest.method_name.trim() || !selectedTest.method_name_ar.trim()) {
      toast.error(t.requiredField);
      return;
    }

    try {
      let updatedTests: ChemicalTest[];
      
      if (isCreating) {
        // Generate new ID
        const newId = `test-${Date.now()}`;
        const newTest = {
          ...selectedTest,
          id: newId,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        updatedTests = [...tests, newTest];
      } else {
        // Update existing test
        const updatedTest = {
          ...selectedTest,
          updated_at: new Date().toISOString()
        };
        updatedTests = tests.map(test => 
          test.id === selectedTest.id ? updatedTest : test
        );
      }

      setTests(updatedTests);
      saveTestsToStorage(updatedTests);
      setIsEditing(false);
      setSelectedTest(null);
      toast.success(t.saveSuccess);
    } catch (error) {
      console.error('Error saving test:', error);
      toast.error(t.saveError);
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setSelectedTest(null);
    setIsCreating(false);
  };

  const filteredTests = tests.filter(test =>
    test.method_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    test.method_name_ar.includes(searchTerm) ||
    (test.description && test.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (test.description_ar && test.description_ar.includes(searchTerm))
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${isRTL ? 'rtl' : 'ltr'}`} dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">{t.title}</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">{t.description}</p>
        </div>
        <Button onClick={handleCreateTest} className="flex items-center space-x-2 rtl:space-x-reverse">
          <PlusIcon className="h-4 w-4" />
          <span>{t.addNewTest}</span>
        </Button>
      </div>

      {/* Search */}
      <div className="max-w-md">
        <Input
          placeholder={t.searchTests}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full"
        />
      </div>

      {/* Tests List */}
      {!isEditing && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTests.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <BeakerIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400">
                {searchTerm ? t.noTestsFound : t.noTests}
              </p>
            </div>
          ) : (
            filteredTests.map((test) => (
              <Card key={test.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="truncate">
                      {lang === 'ar' ? test.method_name_ar : test.method_name}
                    </span>
                    <Badge variant="outline">
                      {test.color_results?.length || 0} {lang === 'ar' ? 'نتيجة' : 'results'}
                    </Badge>
                  </CardTitle>
                  {test.description && (
                    <CardDescription className="line-clamp-2">
                      {lang === 'ar' ? test.description_ar : test.description}
                    </CardDescription>
                  )}
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 mb-4">
                    {test.chemical_components && test.chemical_components.length > 0 && (
                      <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                        <CubeIcon className="h-4 w-4 mr-2 rtl:ml-2 rtl:mr-0" />
                        <span>
                          {test.chemical_components.length} {lang === 'ar' ? 'مكون كيميائي' : 'chemical components'}
                        </span>
                      </div>
                    )}
                    {test.safety_instructions && test.safety_instructions.length > 0 && (
                      <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                        <ShieldCheckIcon className="h-4 w-4 mr-2 rtl:ml-2 rtl:mr-0" />
                        <span>
                          {test.safety_instructions.length} {lang === 'ar' ? 'تعليمات سلامة' : 'safety instructions'}
                        </span>
                      </div>
                    )}
                    {test.test_instructions && test.test_instructions.length > 0 && (
                      <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                        <DocumentTextIcon className="h-4 w-4 mr-2 rtl:ml-2 rtl:mr-0" />
                        <span>
                          {test.test_instructions.length} {lang === 'ar' ? 'خطوة' : 'steps'}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="flex justify-between items-center">
                    <div className="flex space-x-2 rtl:space-x-reverse">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditTest(test)}
                      >
                        <PencilIcon className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowPreview(true)}
                      >
                        <EyeIcon className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteTest(test.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {test.updated_at && new Date(test.updated_at).toLocaleDateString(lang === 'ar' ? 'ar-SA' : 'en-US')}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}
    </div>
  );
}
