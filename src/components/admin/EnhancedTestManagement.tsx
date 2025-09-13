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
  ArrowUpTrayIcon,
  ArrowDownTrayIcon,
  DocumentDuplicateIcon,
  CheckCircleIcon,
  XMarkIcon,
  MagnifyingGlassIcon,
  FunnelIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import { db } from '@/lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';

interface EnhancedTestManagementProps {
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
  chemical_components?: Array<{
    name: string;
    name_ar: string;
    formula?: string;
    concentration?: string;
  }>;
  test_instructions?: string[];
  test_instructions_ar?: string[];
  expected_results?: Array<{
    substance: string;
    substance_ar: string;
    color: string;
    color_ar: string;
    description?: string;
    description_ar?: string;
  }>;
  category?: string;
  difficulty?: 'basic' | 'intermediate' | 'advanced';
  duration?: string;
  created_at?: string;
  updated_at?: string;
}

export default function EnhancedTestManagement({ lang }: EnhancedTestManagementProps) {
  const [tests, setTests] = useState<ChemicalTest[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [editingTest, setEditingTest] = useState<ChemicalTest | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [pendingImport, setPendingImport] = useState<ChemicalTest[]>([]);


  // Load tests from DB.json
  const loadTestsFromDB = async () => {
    try {
      setLoading(true);
      console.log('🔄 Loading tests from DB (API first, then Firestore)...');

      // Try API
      try {
        const response = await fetch('/api/tests/load-from-db');
        const contentType = response.headers.get('content-type') || '';
        if (response.ok && contentType.includes('application/json')) {
          const data = await response.json();
          const loaded = Array.isArray(data?.tests) ? data.tests : (data?.chemical_tests || []);
          if (loaded.length > 0) {
            console.log('✅ Loaded tests via API:', loaded.length);
            setTests(loaded);
            toast.success(
              lang === 'ar'
                ? `تم تحميل ${loaded.length} اختبار من قاعدة البيانات`
                : `Loaded ${loaded.length} tests from database`
            );
            return;
          }
        } else {
          console.warn('⚠️ API not available or non-JSON, will try Firestore client');
        }
      } catch (apiErr) {
        console.warn('⚠️ API load failed, trying Firestore client...', apiErr);
      }

      // Fallback: Firestore client (works on static hosting)
      try {
        const snap = await getDoc(doc(db, 'config', 'chemical_tests'));
        if (snap.exists()) {
          const data: any = snap.data();
          const loaded = Array.isArray(data?.chemical_tests) ? data.chemical_tests : [];
          if (loaded.length > 0) {
            console.log('✅ Loaded tests via Firestore client:', loaded.length);
            setTests(loaded);
            toast.success(
              lang === 'ar'
                ? `تم تحميل ${loaded.length} اختبار من قاعدة البيانات`
                : `Loaded ${loaded.length} tests from database`
            );
            return;
          }
        }
      } catch (fsErr) {
        console.warn('⚠️ Firestore client load failed:', fsErr);
      }

      // Final fallback
      console.warn('⚠️ No tests found, falling back to empty list');
      setTests([]);
    } finally {
      setLoading(false);
    }
  };

  // Save tests to DB.json
  const saveTestsToDB = async (updatedTests: ChemicalTest[]) => {
    try {
      console.log('🔄 Saving tests (API first, then Firestore client fallback)...');

      // Try API first
      try {
        const response = await fetch('/api/tests/save-to-db', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ tests: updatedTests }),
        });

        const contentType = response.headers.get('content-type') || '';
        const isJsonResponse = contentType.includes('application/json');

        if (response.ok && isJsonResponse) {
          const result = await response.json();
          console.log('✅ Saved via API:', result);
          toast.success(
            lang === 'ar'
              ? `تم حفظ ${updatedTests.length} اختبار في قاعدة البيانات`
              : `Saved ${updatedTests.length} tests to database`
          );
          return true;
        }
        console.warn('⚠️ API not available or non-JSON. Will try Firestore client. Status:', response.status);
      } catch (apiErr: any) {
        console.warn('⚠️ API save failed, trying Firestore client...', apiErr?.message || apiErr);
      }

      // Fallback: save directly to Firestore from client (works on static hosting)
      try {
        const payload: any = {
          chemical_tests: updatedTests,
          last_updated: new Date().toISOString(),
          version: '1.0.0',
          total_tests: updatedTests.length,
        };
        await setDoc(doc(db, 'config', 'chemical_tests'), payload, { merge: true });
        console.log('✅ Saved via Firestore client');
        toast.success(
          lang === 'ar'
            ? `تم حفظ ${updatedTests.length} اختبار في قاعدة البيانات`
            : `Saved ${updatedTests.length} tests to database`
        );
        return true;
      } catch (fsErr) {
        console.error('❌ Firestore client save failed:', fsErr);
      }

      // Final fallback to localStorage
      console.warn('⚠️ Falling back to localStorage save');
      localStorage.setItem('chemical_tests_data', JSON.stringify({ chemical_tests: updatedTests }));
      toast.success(
        lang === 'ar'
          ? `تم حفظ ${updatedTests.length} اختبار محلياً`
          : `Saved ${updatedTests.length} tests locally`
      );
      return true;
    } catch (error: any) {
      console.error('❌ Error saving tests:', error);
      toast.error(
        lang === 'ar'
          ? 'فشل في حفظ الاختبارات في قاعدة البيانات'
          : 'Failed to save tests to database'
      );
      return false;
    }
  };

  // Delete test
  const deleteTest = async (testId: string) => {
    if (!confirm(lang === 'ar' ? 'هل تريد حذف هذا الاختبار؟' : 'Are you sure you want to delete this test?')) {
      return;
    }

    try {
      console.log('🗑️ Deleting test:', testId);

      const updatedTests = tests.filter(test => test.id !== testId);

      // Save to DB.json
      const saved = await saveTestsToDB(updatedTests);
      if (saved) {
        setTests(updatedTests);
        toast.success(
          lang === 'ar'
            ? 'تم حذف الاختبار بنجاح'
            : 'Test deleted successfully'
        );
      }
    } catch (error) {
      console.error('❌ Error deleting test:', error);
      toast.error(
        lang === 'ar'
          ? 'فشل في حذف الاختبار'
          : 'Failed to delete test'
      );
    }
  };

  // Export tests to JSON
  const exportTests = () => {
    try {
      const dataStr = JSON.stringify(tests, null, 2);
      const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);

      const exportFileDefaultName = `chemical-tests-${new Date().toISOString().split('T')[0]}.json`;

      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', exportFileDefaultName);
      linkElement.click();

      toast.success(
        lang === 'ar'
          ? 'تم تصدير الاختبارات بنجاح'
          : 'Tests exported successfully'
      );
    } catch (error) {
      console.error('❌ Error exporting tests:', error);
      toast.error(
        lang === 'ar'
          ? 'فشل في تصدير الاختبارات'
          : 'Failed to export tests'
      );
    }
  };

  // Import tests from JSON
  const importTests = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const content = e.target?.result as string;
        const importedTests = JSON.parse(content);

        if (!Array.isArray(importedTests)) {
          throw new Error('Invalid file format');
        }

        // Validate test structure
        const validTests = importedTests.filter(test =>
          test.id && test.method_name && test.method_name_ar
        );

        if (validTests.length === 0) {
          throw new Error('No valid tests found in file');
        }

        // Merge with existing tests (avoid duplicates)
        const existingIds = tests.map(test => test.id);
        const newTests = validTests.filter(test => !existingIds.includes(test.id));
        const updatedTests = [...tests, ...newTests];

        // Save to DB.json
        const saved = await saveTestsToDB(updatedTests);
        if (saved) {
          setTests(updatedTests);
          toast.success(
            lang === 'ar'
              ? `تم استيراد ${newTests.length} اختبار جديد`
              : `Imported ${newTests.length} new tests`
          );
        }
      } catch (error) {
        console.error('❌ Error importing tests:', error);
        toast.error(
          lang === 'ar'
            ? 'فشل في استيراد الاختبارات'
            : 'Failed to import tests'
        );
      }
    };
    reader.readAsText(file);

    // Reset input
    event.target.value = '';
  };

  // Filter tests
  const filteredTests = tests.filter(test => {
    const matchesSearch =
      test.method_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      test.method_name_ar.includes(searchTerm) ||
      test.id.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory = selectedCategory === 'all' || test.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  // Get unique categories
  const categories = ['all', ...Array.from(new Set(tests.map(test => test.category).filter(Boolean)))];

  useEffect(() => {
    loadTestsFromDB();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        <span className="ml-2 text-gray-600 dark:text-gray-400">
          {lang === 'ar' ? 'جاري تحميل الاختبارات...' : 'Loading tests...'}
        </span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            {lang === 'ar' ? 'إدارة الاختبارات المحسنة' : 'Enhanced Test Management'}
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            {lang === 'ar'
              ? `إدارة ${tests.length} اختبار كيميائي`
              : `Manage ${tests.length} chemical tests`
            }
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button onClick={() => setShowAddForm(true)} className="flex items-center gap-2">
            <PlusIcon className="h-4 w-4" />
            {lang === 'ar' ? 'إضافة اختبار' : 'Add Test'}
          </Button>

          <Button onClick={exportTests} variant="outline" className="flex items-center gap-2">
            <ArrowDownTrayIcon className="h-4 w-4" />
            {lang === 'ar' ? 'تصدير' : 'Export'}
          </Button>

          <label className="cursor-pointer">
            <Button variant="outline" className="flex items-center gap-2" asChild>
              <span>
                <ArrowUpTrayIcon className="h-4 w-4" />
                {lang === 'ar' ? 'استيراد ملف' : 'Import File'}
              </span>
            </Button>
            <input
              type="file"
              accept=".json"
              onChange={importTests}
              className="hidden"
            />
          </label>

          <Button onClick={async () => {
            try {
              const res = await fetch('/data/Db.json', { cache: 'no-store' });
              if (!res.ok) throw new Error('Failed to fetch Db.json');
              const json = await res.json();
              const list = Array.isArray(json?.chemical_tests) ? json.chemical_tests : (Array.isArray(json) ? json : []);
              if (list.length === 0) throw new Error('No tests found in Db.json');
              setPendingImport(list as ChemicalTest[]);
              setImportOpen(true);
            } catch (e: any) {
              console.error('Import from Db.json failed', e);
              toast.error(lang === 'ar' ? 'فشل استيراد Db.json' : 'Failed to import Db.json');
            }
          }} variant="outline" className="flex items-center gap-2">
            <DocumentDuplicateIcon className="h-4 w-4" />
            {lang === 'ar' ? 'استيراد من Db.json' : 'Import from Db.json'}
          </Button>

          <Button onClick={loadTestsFromDB} variant="outline" className="flex items-center gap-2">
            <DocumentDuplicateIcon className="h-4 w-4" />
            {lang === 'ar' ? 'إعادة تحميل' : 'Reload'}
          </Button>
        </div>
      </div>


      {/* Import Preview Dialog */}
      <Dialog open={importOpen} onOpenChange={setImportOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {lang === 'ar' ? 'تأكيد الاستيراد من Db.json' : 'Confirm import from Db.json'}
            </DialogTitle>
            <DialogDescription>
              {lang === 'ar'
                ? `سيتم استيراد ${pendingImport.length} اختبار.`
                : `You are about to import ${pendingImport.length} tests.`}
            </DialogDescription>
          </DialogHeader>

          <div className="max-h-60 overflow-auto text-sm space-y-2">
            <div className="text-muted-foreground">
              {lang === 'ar' ? 'معاينة أول العناصر:' : 'Preview of first items:'}
            </div>
            <ul className="list-disc pl-5 rtl:pl-0 rtl:pr-5">
              {pendingImport.slice(0, 10).map((t: any, i: number) => (
                <li key={t?.id || i}>
                  {(lang === 'ar' ? (t?.method_name_ar || t?.method_name) : (t?.method_name || t?.method_name_ar)) || t?.id || (lang === 'ar' ? 'بدون اسم' : 'Untitled')}
                </li>
              ))}
            </ul>
            {pendingImport.length > 10 && (
              <p className="text-xs text-gray-500">
                {lang === 'ar' ? `و${pendingImport.length - 10} عنصر إضافي...` : `and ${pendingImport.length - 10} more...`}
              </p>
            )}
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setImportOpen(false)}>
              {lang === 'ar' ? 'إلغاء' : 'Cancel'}
            </Button>
            <Button onClick={async () => {
              const saved = await saveTestsToDB(pendingImport);
              if (saved) {
                setTests(pendingImport);
                toast.success(lang === 'ar' ? `تم الاستيراد من Db.json (${pendingImport.length}) وحفظه` : `Imported from Db.json (${pendingImport.length}) and saved`);
                setImportOpen(false);
              }
            }}>
              {lang === 'ar' ? 'تأكيد الاستيراد والحفظ' : 'Confirm import & save'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Search and Filter */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <MagnifyingGlassIcon className="absolute left-3 rtl:right-3 rtl:left-auto top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder={lang === 'ar' ? 'البحث في الاختبارات...' : 'Search tests...'}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 rtl:pr-10 rtl:pl-3"
              />
            </div>

            <div className="flex items-center gap-2">
              <FunnelIcon className="h-4 w-4 text-gray-400" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-800 dark:border-gray-600"
              >
                <option value="all">{lang === 'ar' ? 'جميع الفئات' : 'All Categories'}</option>
                {categories.slice(1).map(category => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tests Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTests.map((test) => (
          <Card key={test.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <CardTitle className="text-lg">
                    {lang === 'ar' ? test.method_name_ar : test.method_name}
                  </CardTitle>
                  <CardDescription className="mt-1">
                    ID: {test.id}
                  </CardDescription>
                </div>
                {test.category && (
                  <Badge variant="secondary">{test.category}</Badge>
                )}
              </div>
            </CardHeader>

            <CardContent>
              <div className="space-y-3">
                {test.description && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                    {lang === 'ar' ? test.description_ar : test.description}
                  </p>
                )}

                {test.chemical_components && test.chemical_components.length > 0 && (
                  <div>
                    <p className="text-xs font-medium text-gray-500 mb-1">
                      {lang === 'ar' ? 'المكونات الكيميائية:' : 'Chemical Components:'}
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {test.chemical_components.slice(0, 3).map((component, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {lang === 'ar' ? component.name_ar : component.name}
                        </Badge>
                      ))}
                      {test.chemical_components.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{test.chemical_components.length - 3}
                        </Badge>
                      )}
                    </div>
                  </div>
                )}

                <div className="flex justify-between items-center pt-2">
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => setEditingTest(test)}>
                      <PencilIcon className="h-3 w-3" />
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => deleteTest(test.id)}>
                      <TrashIcon className="h-3 w-3" />
                    </Button>
                  </div>

                  {test.difficulty && (
                    <Badge
                      variant={
                        test.difficulty === 'basic' ? 'default' :
                        test.difficulty === 'intermediate' ? 'secondary' : 'destructive'
                      }
                      className="text-xs"
                    >
                      {test.difficulty}
                    </Badge>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredTests.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400">
              {lang === 'ar' ? 'لا توجد اختبارات مطابقة للبحث' : 'No tests match your search'}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
