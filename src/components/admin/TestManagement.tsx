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
import { databaseColorTestService } from '@/lib/database-color-test-service';
import { getChemicalTestsLocal } from '@/lib/local-data-service';
import { AdminErrorBoundary } from './AdminErrorBoundary';
import { db } from '@/lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

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
      console.log('🔄 Loading tests for admin management...');

      // First try to load directly from Db.json
      try {
        const response = await fetch('/data/Db.json');
        if (response.ok) {
          const data = await response.json();
          if (data.chemical_tests && data.chemical_tests.length > 0) {
            console.log(`✅ تم تحميل ${data.chemical_tests.length} اختبار من Db.json`);
            setTests(data.chemical_tests);
            return;
          }
        }
      } catch (dbError) {
        console.warn('⚠️ Could not load from Db.json, trying database service');
      }

      // Fallback to database service
      try {
        await databaseColorTestService.forceReload();
        const testsFromService = await databaseColorTestService.getAllTests();
        if (testsFromService && testsFromService.length > 0) {
          console.log(`✅ تم تحميل ${testsFromService.length} اختبار بنجاح من خدمة قاعدة البيانات`);
          setTests(testsFromService);
          return;
        }
      } catch (serviceError) {
        console.warn('⚠️ Could not load from database service, trying API fallback');

        // Try to load from API as fallback
        try {
          const response = await fetch('/api/tests/load-from-db');
          if (response.ok) {
            const data = await response.json();
            if (data.success && data.tests && data.tests.length > 0) {
              console.log(`✅ تم تحميل ${data.tests.length} اختبار من API`);
              setTests(data.tests);
              return;
            }
          }
        } catch (apiError) {
          console.warn('⚠️ API fallback failed, trying local data service');
        }
      }

      // Try Firestore client before local service (works on static hosting)
      try {
        const snap = await getDoc(doc(db, 'config', 'chemical_tests'));
        if (snap.exists()) {
          const data: any = snap.data();
          const fsTests = Array.isArray(data?.chemical_tests) ? data.chemical_tests : [];
          if (fsTests.length > 0) {
            console.log(`✅ تم تحميل ${fsTests.length} اختبار من Firestore (client)`);
            setTests(fsTests);
            return;
          }
        }
      } catch (fsErr) {
        console.warn('⚠️ Firestore client load failed', fsErr);
      }

      // Fallback to local data service (same as other components)
      try {
        const localTests = getChemicalTestsLocal();
        if (localTests && localTests.length > 0) {
          console.log(`✅ تم تحميل ${localTests.length} اختبار بنجاح من الخدمة المحلية`);
          setTests(localTests);
          return;
        }
      } catch (localError) {
        console.warn('⚠️ Could not load from local data service');
      }

      // Final fallback to localStorage with multiple keys
      const storedTests = localStorage.getItem('chemical_tests_admin') ||
                         localStorage.getItem('chemical_tests_data') ||
                         localStorage.getItem('chemical_tests_db') ||
                         localStorage.getItem('database_color_tests');

      if (storedTests) {
        try {
          const parsedData = JSON.parse(storedTests);
          const testsArray = Array.isArray(parsedData) ? parsedData : parsedData.chemical_tests || [];
          console.log(`✅ تم تحميل ${testsArray.length} اختبار من localStorage`);
          setTests(testsArray);
        } catch (parseError) {
          console.error('❌ Error parsing stored tests:', parseError);
          setTests([]);
        }
      } else {
        console.warn('⚠️ No tests found in any data source');
        setTests([]);
      }
    } catch (error) {
      console.error('❌ Error loading tests:', error);
      toast.error(t.loadError);
      setTests([]);
    } finally {
      setLoading(false);
    }
  };

  const saveTestsToStorage = async (updatedTests: ChemicalTest[]) => {
    try {
      // Create unified data structure for Db.json
      const unifiedData = {
        chemical_tests: updatedTests,
        last_updated: new Date().toISOString(),
        version: "1.0.0",
        total_tests: updatedTests.length
      };

      // Save to localStorage with unified structure - multiple keys for compatibility
      localStorage.setItem('chemical_tests_db', JSON.stringify(updatedTests));
      localStorage.setItem('chemical_tests_data', JSON.stringify(unifiedData));
      localStorage.setItem('database_color_tests', JSON.stringify(updatedTests));
      localStorage.setItem('chemical_tests_admin', JSON.stringify(unifiedData));

      console.log(`💾 تم حفظ ${updatedTests.length} اختبار في التخزين المحلي`);

      // Try to save to Db.json via API (only if API is available)
      try {
        console.log('🔄 Attempting to save to Db.json...', { testsCount: updatedTests.length });

        const response = await fetch('/api/save-db', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(unifiedData),
        });

        console.log('📡 API Response status:', response.status);

        // Check if response is JSON (API available) or HTML (404 page)
        const contentType = response.headers.get('content-type');
        const isJsonResponse = contentType && contentType.includes('application/json');

        if (!isJsonResponse || !response.ok) {
          console.warn('⚠️ API not available or failed - trying Firestore client save');
          try {
            await setDoc(doc(db, 'config', 'chemical_tests'), unifiedData, { merge: true });
            console.log(`✅ تم حفظ ${updatedTests.length} اختبار في Firestore (client)`);
          } catch (fsErr) {
            console.warn('⚠️ Firestore client save failed:', fsErr);
            toast.success(`تم حفظ ${updatedTests.length} اختبار محلياً`);
          }
          return;
        }

        const result = await response.json();
        console.log(`✅ تم حفظ ${result.count || updatedTests.length} اختبار في Db.json`);

        // Force reload of data services to ensure sync
        try {
          await databaseColorTestService.forceReload();
          console.log('🔄 تم إعادة تحميل خدمة قاعدة البيانات');

          // Also force reload of local data service
          if (typeof window !== 'undefined') {
            const { forceReloadLocalStorage } = await import('@/lib/local-data-service');
            forceReloadLocalStorage();
            console.log('🔄 تم إعادة تحميل الخدمة المحلية');
          }
        } catch (reloadError) {
          console.warn('⚠️ فشل في إعادة تحميل خدمات البيانات:', reloadError);
        }

        toast.success(`تم حفظ ${updatedTests.length} اختبار بنجاح في قاعدة البيانات`);

      } catch (apiError: any) {
        console.error('❌ Save error:', apiError);
        // Attempt Firestore client save
        try {
          await setDoc(doc(db, 'config', 'chemical_tests'), unifiedData, { merge: true });
          console.log(`✅ تم حفظ ${updatedTests.length} اختبار في Firestore (client)`);
          toast.success(`تم حفظ ${updatedTests.length} اختبار بنجاح في قاعدة البيانات`);
        } catch (fsErr) {
          console.error('❌ Firestore client save failed:', fsErr);
          toast.warning('تم الحفظ محلياً فقط - فشل في حفظ قاعدة البيانات');
        }
        // Don't throw here - localStorage save was successful
      }
    } catch (error) {
      console.error('❌ Error saving tests:', error);
      throw error;
    }
  };

  const handleCreateTest = () => {
    setSelectedTest(createEmptyTest());
    setIsCreating(true);
    setIsEditing(true);
  };

  const handleEditTest = (test: ChemicalTest) => {
    // Convert real database structure to editable format
    const editableTest = {
      ...test,
      // Extract safety instructions from instructions array
      safety_instructions: test.instructions?.map(inst => inst.instruction) || [''],
      safety_instructions_ar: test.instructions?.map(inst => inst.instruction_ar) || [''],

      // Extract equipment from multiple sources
      required_equipment: (() => {
        const equipment = [];
        // من المكونات الكيميائية
        if (test.chemical_components) {
          equipment.push(...test.chemical_components.map(comp => comp.name));
        }
        // معدات إضافية مستخرجة من التعليمات
        const additionalEquipment = [
          'Spot plate',
          'Glass rod or spatula',
          'Protective gloves',
          'Safety goggles',
          'Dropper bottles'
        ];
        equipment.push(...additionalEquipment);
        return equipment.length > 0 ? equipment : [''];
      })(),
      required_equipment_ar: (() => {
        const equipment = [];
        // من المكونات الكيميائية
        if (test.chemical_components) {
          equipment.push(...test.chemical_components.map(comp => comp.name_ar));
        }
        // معدات إضافية مستخرجة من التعليمات
        const additionalEquipment = [
          'طبق نقطي',
          'قضيب زجاجي أو ملعقة',
          'قفازات واقية',
          'نظارات أمان',
          'قوارير قطارة'
        ];
        equipment.push(...additionalEquipment);
        return equipment.length > 0 ? equipment : [''];
      })(),

      // Extract handling procedures from prepare field
      handling_procedures: test.prepare ? test.prepare.split('\n').filter(step => step.trim()) : [''],
      handling_procedures_ar: test.prepare_ar ? test.prepare_ar.split('\n').filter(step => step.trim()) : [''],

      // Extract test instructions from prepare field (same as handling for now)
      test_instructions: test.prepare ? test.prepare.split('\n').filter(step => step.trim()) : [''],
      test_instructions_ar: test.prepare_ar ? test.prepare_ar.split('\n').filter(step => step.trim()) : [''],

      // Keep existing chemical components
      chemical_components: test.chemical_components && test.chemical_components.length > 0
        ? test.chemical_components
        : [{
            name: '',
            name_ar: '',
            formula: '',
            concentration: ''
          }]
    };

    setSelectedTest(editableTest);
    setIsCreating(false);
    setIsEditing(true);
    console.log('🔧 تحرير الاختبار:', editableTest.method_name);
    console.log('📊 البيانات المحملة:', {
      safety_instructions: editableTest.safety_instructions.length,
      required_equipment: editableTest.required_equipment.length,
      handling_procedures: editableTest.handling_procedures.length,
      chemical_components: editableTest.chemical_components.length
    });
  };

  const handleDeleteTest = async (testId: string) => {
    if (!confirm(t.confirmDelete)) return;

    try {
      const updatedTests = tests.filter(test => test.id !== testId);
      setTests(updatedTests);
      await saveTestsToStorage(updatedTests);
      toast.success(t.deleteSuccess);
    } catch (error) {
      console.error('Error deleting test:', error);
      toast.error(t.saveError);
    }
  };

  const handleSaveTest = async () => {
    if (!selectedTest) {
      console.error('❌ No test selected for saving');
      return;
    }

    // Validation
    if (!selectedTest.method_name?.trim() || !selectedTest.method_name_ar?.trim()) {
      toast.error(t.requiredField);
      return;
    }

    try {
      let updatedTests: ChemicalTest[];
      let savedTest: ChemicalTest;

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
        savedTest = newTest;
        console.log(`✅ إنشاء اختبار جديد: ${newTest.method_name}`);
      } else {
        // Update existing test - with null check
        if (!selectedTest.id) {
          console.error('❌ Selected test has no ID');
          toast.error(t.saveError);
          return;
        }

        const updatedTest = {
          ...selectedTest,
          updated_at: new Date().toISOString()
        };
        updatedTests = tests.map(test =>
          test.id === selectedTest.id ? updatedTest : test
        );
        savedTest = updatedTest;
        console.log(`✅ تحديث اختبار موجود: ${updatedTest.method_name}`);
      }

      setTests(updatedTests);
      await saveTestsToStorage(updatedTests);

      // Also save individual test via API for better reliability
      try {
        const response = await fetch('/api/test-save', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            testData: savedTest
          }),
        });

        if (!response.ok) {
          console.warn('API save failed, but localStorage save succeeded');
        }
      } catch (apiError) {
        console.warn('API save error:', apiError);
      }

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

  const handlePreviewTest = (test: ChemicalTest) => {
    setSelectedTest(test);
    setShowPreview(true);
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
    <AdminErrorBoundary lang={lang}>
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

      {/* Edit/Create Form */}
      {isEditing && selectedTest && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>{isCreating ? t.addNewTest : t.editTest}</span>
              <Button variant="outline" size="sm" onClick={handleCancelEdit}>
                <XMarkIcon className="h-4 w-4" />
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">{t.testName} *</label>
                <Input
                  value={selectedTest.method_name || ''}
                  onChange={(e) => setSelectedTest(prev => prev ? { ...prev, method_name: e.target.value } : null)}
                  placeholder="Marquis Test"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">{t.testNameAr} *</label>
                <Input
                  value={selectedTest.method_name_ar || ''}
                  onChange={(e) => setSelectedTest(prev => prev ? { ...prev, method_name_ar: e.target.value } : null)}
                  placeholder="اختبار ماركيز"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">{t.description}</label>
                <Textarea
                  value={selectedTest.description || ''}
                  onChange={(e) => setSelectedTest(prev => prev ? { ...prev, description: e.target.value } : null)}
                  placeholder="Test description..."
                  rows={3}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">{t.descriptionAr}</label>
                <Textarea
                  value={selectedTest.description_ar || ''}
                  onChange={(e) => setSelectedTest(prev => prev ? { ...prev, description_ar: e.target.value } : null)}
                  placeholder="وصف الاختبار..."
                  rows={3}
                />
              </div>
            </div>

            {/* Safety Instructions */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center">
                <ShieldCheckIcon className="h-5 w-5 mr-2 rtl:ml-2 rtl:mr-0" />
                {t.safetyInstructions}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">{t.safetyInstructions}</label>
                  {selectedTest.safety_instructions?.map((instruction, index) => (
                    <div key={index} className="flex items-center space-x-2 rtl:space-x-reverse mb-2">
                      <Input
                        value={instruction}
                        onChange={(e) => {
                          const newInstructions = [...(selectedTest.safety_instructions || [])];
                          newInstructions[index] = e.target.value;
                          setSelectedTest(prev => prev ? { ...prev, safety_instructions: newInstructions } : null);
                        }}
                        placeholder="Safety instruction..."
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const newInstructions = selectedTest.safety_instructions?.filter((_, i) => i !== index) || [];
                          setSelectedTest(prev => prev ? { ...prev, safety_instructions: newInstructions } : null);
                        }}
                      >
                        <XMarkIcon className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const newInstructions = [...(selectedTest.safety_instructions || []), ''];
                      setSelectedTest(prev => prev ? { ...prev, safety_instructions: newInstructions } : null);
                    }}
                  >
                    <PlusIcon className="h-4 w-4 mr-1" />
                    Add
                  </Button>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">{t.safetyInstructionsAr}</label>
                  {selectedTest.safety_instructions_ar?.map((instruction, index) => (
                    <div key={index} className="flex items-center space-x-2 rtl:space-x-reverse mb-2">
                      <Input
                        value={instruction}
                        onChange={(e) => {
                          const newInstructions = [...(selectedTest.safety_instructions_ar || [])];
                          newInstructions[index] = e.target.value;
                          setSelectedTest(prev => prev ? { ...prev, safety_instructions_ar: newInstructions } : null);
                        }}
                        placeholder="تعليمات السلامة..."
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const newInstructions = selectedTest.safety_instructions_ar?.filter((_, i) => i !== index) || [];
                          setSelectedTest(prev => prev ? { ...prev, safety_instructions_ar: newInstructions } : null);
                        }}
                      >
                        <XMarkIcon className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const newInstructions = [...(selectedTest.safety_instructions_ar || []), ''];
                      setSelectedTest(prev => prev ? { ...prev, safety_instructions_ar: newInstructions } : null);
                    }}
                  >
                    <PlusIcon className="h-4 w-4 mr-1" />
                    إضافة
                  </Button>
                </div>
              </div>
            </div>

            {/* Required Equipment */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center">
                <CubeIcon className="h-5 w-5 mr-2 rtl:ml-2 rtl:mr-0" />
                {t.requiredEquipment}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">{t.requiredEquipment}</label>
                  {selectedTest.required_equipment?.map((equipment, index) => (
                    <div key={index} className="flex items-center space-x-2 rtl:space-x-reverse mb-2">
                      <Input
                        value={equipment}
                        onChange={(e) => {
                          const newEquipment = [...(selectedTest.required_equipment || [])];
                          newEquipment[index] = e.target.value;
                          setSelectedTest(prev => prev ? { ...prev, required_equipment: newEquipment } : null);
                        }}
                        placeholder="Required equipment..."
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const newEquipment = selectedTest.required_equipment?.filter((_, i) => i !== index) || [];
                          setSelectedTest(prev => prev ? { ...prev, required_equipment: newEquipment } : null);
                        }}
                      >
                        <XMarkIcon className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const newEquipment = [...(selectedTest.required_equipment || []), ''];
                      setSelectedTest(prev => prev ? { ...prev, required_equipment: newEquipment } : null);
                    }}
                  >
                    <PlusIcon className="h-4 w-4 mr-1" />
                    Add
                  </Button>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">{t.requiredEquipmentAr}</label>
                  {selectedTest.required_equipment_ar?.map((equipment, index) => (
                    <div key={index} className="flex items-center space-x-2 rtl:space-x-reverse mb-2">
                      <Input
                        value={equipment}
                        onChange={(e) => {
                          const newEquipment = [...(selectedTest.required_equipment_ar || [])];
                          newEquipment[index] = e.target.value;
                          setSelectedTest(prev => prev ? { ...prev, required_equipment_ar: newEquipment } : null);
                        }}
                        placeholder="المعدات المطلوبة..."
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const newEquipment = selectedTest.required_equipment_ar?.filter((_, i) => i !== index) || [];
                          setSelectedTest(prev => prev ? { ...prev, required_equipment_ar: newEquipment } : null);
                        }}
                      >
                        <XMarkIcon className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const newEquipment = [...(selectedTest.required_equipment_ar || []), ''];
                      setSelectedTest(prev => prev ? { ...prev, required_equipment_ar: newEquipment } : null);
                    }}
                  >
                    <PlusIcon className="h-4 w-4 mr-1" />
                    إضافة
                  </Button>
                </div>
              </div>
            </div>

            {/* Handling Procedures */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center">
                <DocumentTextIcon className="h-5 w-5 mr-2 rtl:ml-2 rtl:mr-0" />
                {t.handlingProcedures}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">{t.handlingProcedures}</label>
                  {selectedTest.handling_procedures?.map((procedure, index) => (
                    <div key={index} className="flex items-center space-x-2 rtl:space-x-reverse mb-2">
                      <Input
                        value={procedure}
                        onChange={(e) => {
                          const newProcedures = [...(selectedTest.handling_procedures || [])];
                          newProcedures[index] = e.target.value;
                          setSelectedTest(prev => prev ? { ...prev, handling_procedures: newProcedures } : null);
                        }}
                        placeholder="Handling procedure..."
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const newProcedures = selectedTest.handling_procedures?.filter((_, i) => i !== index) || [];
                          setSelectedTest(prev => prev ? { ...prev, handling_procedures: newProcedures } : null);
                        }}
                      >
                        <XMarkIcon className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const newProcedures = [...(selectedTest.handling_procedures || []), ''];
                      setSelectedTest(prev => prev ? { ...prev, handling_procedures: newProcedures } : null);
                    }}
                  >
                    <PlusIcon className="h-4 w-4 mr-1" />
                    Add
                  </Button>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">{t.handlingProceduresAr}</label>
                  {selectedTest.handling_procedures_ar?.map((procedure, index) => (
                    <div key={index} className="flex items-center space-x-2 rtl:space-x-reverse mb-2">
                      <Input
                        value={procedure}
                        onChange={(e) => {
                          const newProcedures = [...(selectedTest.handling_procedures_ar || [])];
                          newProcedures[index] = e.target.value;
                          setSelectedTest(prev => prev ? { ...prev, handling_procedures_ar: newProcedures } : null);
                        }}
                        placeholder="إجراءات التعامل..."
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const newProcedures = selectedTest.handling_procedures_ar?.filter((_, i) => i !== index) || [];
                          setSelectedTest(prev => prev ? { ...prev, handling_procedures_ar: newProcedures } : null);
                        }}
                      >
                        <XMarkIcon className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const newProcedures = [...(selectedTest.handling_procedures_ar || []), ''];
                      setSelectedTest(prev => prev ? { ...prev, handling_procedures_ar: newProcedures } : null);
                    }}
                  >
                    <PlusIcon className="h-4 w-4 mr-1" />
                    إضافة
                  </Button>
                </div>
              </div>
            </div>

            {/* Chemical Components */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center">
                <BeakerIcon className="h-5 w-5 mr-2 rtl:ml-2 rtl:mr-0" />
                {t.chemicalComponents}
              </h3>
              {selectedTest.chemical_components?.map((component, index) => (
                <Card key={index} className="p-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">{t.componentName}</label>
                      <Input
                        value={component.name}
                        onChange={(e) => {
                          const newComponents = [...(selectedTest.chemical_components || [])];
                          newComponents[index] = { ...newComponents[index], name: e.target.value };
                          setSelectedTest(prev => prev ? { ...prev, chemical_components: newComponents } : null);
                        }}
                        placeholder="Sulfuric Acid"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">{t.componentNameAr}</label>
                      <Input
                        value={component.name_ar}
                        onChange={(e) => {
                          const newComponents = [...(selectedTest.chemical_components || [])];
                          newComponents[index] = { ...newComponents[index], name_ar: e.target.value };
                          setSelectedTest(prev => prev ? { ...prev, chemical_components: newComponents } : null);
                        }}
                        placeholder="حمض الكبريتيك"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">{t.formula}</label>
                      <Input
                        value={component.formula || ''}
                        onChange={(e) => {
                          const newComponents = [...(selectedTest.chemical_components || [])];
                          newComponents[index] = { ...newComponents[index], formula: e.target.value };
                          setSelectedTest(prev => prev ? { ...prev, chemical_components: newComponents } : null);
                        }}
                        placeholder="H₂SO₄"
                      />
                    </div>
                    <div className="flex items-end space-x-2 rtl:space-x-reverse">
                      <div className="flex-1">
                        <label className="block text-sm font-medium mb-2">{t.concentration}</label>
                        <Input
                          value={component.concentration || ''}
                          onChange={(e) => {
                            const newComponents = [...(selectedTest.chemical_components || [])];
                            newComponents[index] = { ...newComponents[index], concentration: e.target.value };
                            setSelectedTest(prev => prev ? { ...prev, chemical_components: newComponents } : null);
                          }}
                          placeholder="98%"
                        />
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const newComponents = selectedTest.chemical_components?.filter((_, i) => i !== index) || [];
                          setSelectedTest(prev => prev ? { ...prev, chemical_components: newComponents } : null);
                        }}
                      >
                        <TrashIcon className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
              <Button
                variant="outline"
                onClick={() => {
                  const newComponents = [...(selectedTest.chemical_components || []), {
                    name: '',
                    name_ar: '',
                    formula: '',
                    concentration: ''
                  }];
                  setSelectedTest(prev => prev ? { ...prev, chemical_components: newComponents } : null);
                }}
              >
                <PlusIcon className="h-4 w-4 mr-2" />
                {t.addComponent}
              </Button>
            </div>

            {/* Test Instructions */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center">
                <DocumentTextIcon className="h-5 w-5 mr-2 rtl:ml-2 rtl:mr-0" />
                {t.testInstructions}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">{t.testInstructions}</label>
                  {selectedTest.test_instructions?.map((instruction, index) => (
                    <div key={index} className="flex items-center space-x-2 rtl:space-x-reverse mb-2">
                      <Input
                        value={instruction}
                        onChange={(e) => {
                          const newInstructions = [...(selectedTest.test_instructions || [])];
                          newInstructions[index] = e.target.value;
                          setSelectedTest(prev => prev ? { ...prev, test_instructions: newInstructions } : null);
                        }}
                        placeholder="Test instruction step..."
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const newInstructions = selectedTest.test_instructions?.filter((_, i) => i !== index) || [];
                          setSelectedTest(prev => prev ? { ...prev, test_instructions: newInstructions } : null);
                        }}
                      >
                        <XMarkIcon className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const newInstructions = [...(selectedTest.test_instructions || []), ''];
                      setSelectedTest(prev => prev ? { ...prev, test_instructions: newInstructions } : null);
                    }}
                  >
                    <PlusIcon className="h-4 w-4 mr-1" />
                    Add Step
                  </Button>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">{t.testInstructionsAr}</label>
                  {selectedTest.test_instructions_ar?.map((instruction, index) => (
                    <div key={index} className="flex items-center space-x-2 rtl:space-x-reverse mb-2">
                      <Input
                        value={instruction}
                        onChange={(e) => {
                          const newInstructions = [...(selectedTest.test_instructions_ar || [])];
                          newInstructions[index] = e.target.value;
                          setSelectedTest(prev => prev ? { ...prev, test_instructions_ar: newInstructions } : null);
                        }}
                        placeholder="خطوة تعليمات الاختبار..."
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const newInstructions = selectedTest.test_instructions_ar?.filter((_, i) => i !== index) || [];
                          setSelectedTest(prev => prev ? { ...prev, test_instructions_ar: newInstructions } : null);
                        }}
                      >
                        <XMarkIcon className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const newInstructions = [...(selectedTest.test_instructions_ar || []), ''];
                      setSelectedTest(prev => prev ? { ...prev, test_instructions_ar: newInstructions } : null);
                    }}
                  >
                    <PlusIcon className="h-4 w-4 mr-1" />
                    إضافة خطوة
                  </Button>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-4 rtl:space-x-reverse pt-6 border-t">
              <Button variant="outline" onClick={handleCancelEdit}>
                {t.cancel}
              </Button>
              <Button onClick={handleSaveTest}>
                {t.save}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Preview Modal */}
      {showPreview && selectedTest && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50" onClick={() => setShowPreview(false)}>
          <Card className="w-full max-w-5xl max-h-[90vh] overflow-y-auto bg-white dark:bg-gray-900 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <CardHeader className="border-b border-gray-200 dark:border-gray-700">
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center space-x-3 rtl:space-x-reverse">
                  <EyeIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  <span className="text-xl">{t.previewTest}</span>
                </div>
                <Button variant="outline" size="sm" onClick={() => setShowPreview(false)} className="hover:bg-gray-100 dark:hover:bg-gray-800">
                  <XMarkIcon className="h-4 w-4" />
                </Button>
              </CardTitle>
              <div className="mt-2">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {lang === 'ar' ? selectedTest.method_name_ar : selectedTest.method_name}
                </h2>
                {selectedTest.description && (
                  <p className="text-gray-600 dark:text-gray-400 mt-1">
                    {lang === 'ar' ? selectedTest.description_ar : selectedTest.description}
                  </p>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Test Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold mb-2">{t.testName}</h4>
                  <p className="text-gray-600 dark:text-gray-400">{selectedTest.method_name}</p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">{t.testNameAr}</h4>
                  <p className="text-gray-600 dark:text-gray-400">{selectedTest.method_name_ar}</p>
                </div>
              </div>

              {selectedTest.description && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold mb-2">{t.description}</h4>
                    <p className="text-gray-600 dark:text-gray-400">{selectedTest.description}</p>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">{t.descriptionAr}</h4>
                    <p className="text-gray-600 dark:text-gray-400">{selectedTest.description_ar}</p>
                  </div>
                </div>
              )}

              {/* Safety Instructions */}
              {selectedTest.instructions && selectedTest.instructions.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-2 flex items-center">
                    <ShieldCheckIcon className="h-5 w-5 mr-2 rtl:ml-2 rtl:mr-0" />
                    {t.safetyInstructions}
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h5 className="font-medium mb-2">English</h5>
                      <ul className="list-disc list-inside space-y-1">
                        {selectedTest.instructions.map((instruction, index) => (
                          <li key={index} className="text-gray-600 dark:text-gray-400">
                            <strong>{instruction.instruction}</strong>
                            {instruction.safety_warning && (
                              <div className="text-red-600 dark:text-red-400 text-sm mt-1">
                                ⚠️ {instruction.safety_warning}
                              </div>
                            )}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h5 className="font-medium mb-2">العربية</h5>
                      <ul className="list-disc list-inside space-y-1">
                        {selectedTest.instructions.map((instruction, index) => (
                          <li key={index} className="text-gray-600 dark:text-gray-400">
                            <strong>{instruction.instruction_ar}</strong>
                            {instruction.safety_warning_ar && (
                              <div className="text-red-600 dark:text-red-400 text-sm mt-1">
                                ⚠️ {instruction.safety_warning_ar}
                              </div>
                            )}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              {/* Chemical Components (Equipment) */}
              {selectedTest.chemical_components && selectedTest.chemical_components.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-2 flex items-center">
                    <CubeIcon className="h-5 w-5 mr-2 rtl:ml-2 rtl:mr-0" />
                    {t.chemicalComponents}
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {selectedTest.chemical_components.map((component, index) => (
                      <div key={index} className="border rounded-lg p-3 bg-gray-50 dark:bg-gray-700">
                        <h5 className="font-medium text-gray-900 dark:text-gray-100">{component.name}</h5>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{component.name_ar}</p>
                        {component.formula && (
                          <p className="text-sm font-mono text-blue-600 dark:text-blue-400">{component.formula}</p>
                        )}
                        {component.concentration && (
                          <p className="text-sm text-green-600 dark:text-green-400">{component.concentration}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Test Procedures */}
              {(selectedTest.prepare || selectedTest.prepare_ar) && (
                <div>
                  <h4 className="font-semibold mb-2 flex items-center">
                    <DocumentTextIcon className="h-5 w-5 mr-2 rtl:ml-2 rtl:mr-0" />
                    {t.testInstructions}
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h5 className="font-medium mb-2">English</h5>
                      <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                        <pre className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap font-sans">
                          {selectedTest.prepare}
                        </pre>
                      </div>
                    </div>
                    <div>
                      <h5 className="font-medium mb-2">العربية</h5>
                      <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                        <pre className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap font-sans">
                          {selectedTest.prepare_ar}
                        </pre>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Chemical Components */}
              {selectedTest.chemical_components && selectedTest.chemical_components.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-2 flex items-center">
                    <CubeIcon className="h-5 w-5 mr-2 rtl:ml-2 rtl:mr-0" />
                    {t.chemicalComponents}
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {selectedTest.chemical_components.map((component, index) => (
                      <div key={index} className="border rounded-lg p-3">
                        <h5 className="font-medium">{component.name}</h5>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{component.name_ar}</p>
                        {component.formula && (
                          <p className="text-sm font-mono">{component.formula}</p>
                        )}
                        {component.concentration && (
                          <p className="text-sm text-blue-600 dark:text-blue-400">{component.concentration}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Test Instructions */}
              {selectedTest.test_instructions && selectedTest.test_instructions.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-2 flex items-center">
                    <DocumentTextIcon className="h-5 w-5 mr-2 rtl:ml-2 rtl:mr-0" />
                    {t.testInstructions}
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h5 className="font-medium mb-2">English</h5>
                      <ol className="list-decimal list-inside space-y-1">
                        {selectedTest.test_instructions.map((instruction, index) => (
                          <li key={index} className="text-gray-600 dark:text-gray-400">{instruction}</li>
                        ))}
                      </ol>
                    </div>
                    <div>
                      <h5 className="font-medium mb-2">العربية</h5>
                      <ol className="list-decimal list-inside space-y-1">
                        {selectedTest.test_instructions_ar?.map((instruction, index) => (
                          <li key={index} className="text-gray-600 dark:text-gray-400">{instruction}</li>
                        ))}
                      </ol>
                    </div>
                  </div>
                </div>
              )}

              {/* Color Results */}
              {selectedTest.color_results && selectedTest.color_results.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-2">{t.colorResults}</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {selectedTest.color_results.map((result, index) => (
                      <div key={index} className="border rounded-lg p-3 flex items-center space-x-3 rtl:space-x-reverse">
                        <div
                          className="w-8 h-8 rounded-full border-2 border-gray-300"
                          style={{ backgroundColor: result.color_hex }}
                        />
                        <div>
                          <p className="font-medium">{result.color_result}</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{result.color_result_ar}</p>
                          <p className="text-xs text-gray-500">{result.possible_substance}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

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
                        onClick={() => handlePreviewTest(test)}
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
    </AdminErrorBoundary>
  );
}
