'use client';

import React, { useState, useEffect } from 'react';
import { Language } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { db } from '@/lib/firebase';
import { collection, getDocs, doc, updateDoc, addDoc, deleteDoc, query, orderBy } from 'firebase/firestore';
import toast from 'react-hot-toast';
import {
  BeakerIcon,
  DocumentTextIcon,
  PhotoIcon,
  LanguageIcon,
  TagIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  StarIcon,
  LockClosedIcon,
  GiftIcon,
  ArrowPathIcon,
  InformationCircleIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ClockIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline';

interface ChemicalTest {
  id: string;
  name: string;
  nameAr: string;
  slug: string;
  description: string;
  descriptionAr: string;
  category: string;
  categoryAr: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  subscriptionLevel: 'free' | 'basic' | 'premium' | 'pro';
  price?: number;
  estimatedTime: number;
  safetyLevel: 'low' | 'medium' | 'high';
  equipment: string[];
  equipmentAr: string[];
  chemicals: string[];
  chemicalsAr: string[];
  steps: TestStep[];
  expectedResults: ExpectedResult[];
  images: TestImage[];
  videos?: string[];
  tags: string[];
  tagsAr: string[];
  isActive: boolean;
  isFeatured: boolean;
  createdAt: string;
  updatedAt: string;
  viewCount: number;
  completionCount: number;
  rating: number;
  ratingCount: number;
}

interface TestStep {
  id: string;
  stepNumber: number;
  title: string;
  titleAr: string;
  description: string;
  descriptionAr: string;
  image?: string;
  video?: string;
  duration: number;
  safetyNotes: string;
  safetyNotesAr: string;
  tips: string;
  tipsAr: string;
}

interface ExpectedResult {
  id: string;
  condition: string;
  conditionAr: string;
  result: string;
  resultAr: string;
  color?: string;
  image?: string;
  interpretation: string;
  interpretationAr: string;
  confidence: number;
}

interface TestImage {
  id: string;
  url: string;
  alt: string;
  altAr: string;
  type: 'equipment' | 'step' | 'result' | 'safety';
  stepId?: string;
  resultId?: string;
}

interface ChemicalTestsManagementProps {
  lang: Language;
}

export function ChemicalTestsManagement({ lang }: ChemicalTestsManagementProps) {
  const [tests, setTests] = useState<ChemicalTest[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editingTest, setEditingTest] = useState<ChemicalTest | null>(null);
  const [selectedTest, setSelectedTest] = useState<ChemicalTest | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterLevel, setFilterLevel] = useState('all');

  const isRTL = lang === 'ar';

  const texts = {
    title: isRTL ? 'إدارة الاختبارات الكيميائية' : 'Chemical Tests Management',
    subtitle: isRTL ? 'إدارة شاملة لمحتوى الاختبارات الكيميائية والمواد التعليمية' : 'Comprehensive management of chemical tests content and educational materials',
    
    // Tabs
    tests: isRTL ? 'الاختبارات' : 'Tests',
    categories: isRTL ? 'التصنيفات' : 'Categories',
    media: isRTL ? 'الوسائط' : 'Media',
    translations: isRTL ? 'الترجمات' : 'Translations',
    
    // Test Management
    addTest: isRTL ? 'إضافة اختبار' : 'Add Test',
    editTest: isRTL ? 'تعديل الاختبار' : 'Edit Test',
    deleteTest: isRTL ? 'حذف الاختبار' : 'Delete Test',
    viewTest: isRTL ? 'عرض الاختبار' : 'View Test',
    duplicateTest: isRTL ? 'نسخ الاختبار' : 'Duplicate Test',
    
    // Test Properties
    testName: isRTL ? 'اسم الاختبار' : 'Test Name',
    testNameAr: isRTL ? 'اسم الاختبار بالعربية' : 'Test Name (Arabic)',
    slug: isRTL ? 'الرابط المختصر' : 'Slug',
    description: isRTL ? 'الوصف' : 'Description',
    descriptionAr: isRTL ? 'الوصف بالعربية' : 'Description (Arabic)',
    category: isRTL ? 'التصنيف' : 'Category',
    categoryAr: isRTL ? 'التصنيف بالعربية' : 'Category (Arabic)',
    difficulty: isRTL ? 'مستوى الصعوبة' : 'Difficulty Level',
    subscriptionLevel: isRTL ? 'مستوى الاشتراك' : 'Subscription Level',
    price: isRTL ? 'السعر' : 'Price',
    estimatedTime: isRTL ? 'الوقت المقدر (دقيقة)' : 'Estimated Time (minutes)',
    safetyLevel: isRTL ? 'مستوى الأمان' : 'Safety Level',
    
    // Difficulty Levels
    beginner: isRTL ? 'مبتدئ' : 'Beginner',
    intermediate: isRTL ? 'متوسط' : 'Intermediate',
    advanced: isRTL ? 'متقدم' : 'Advanced',
    
    // Subscription Levels
    free: isRTL ? 'مجاني' : 'Free',
    basic: isRTL ? 'أساسي' : 'Basic',
    premium: isRTL ? 'مميز' : 'Premium',
    pro: isRTL ? 'احترافي' : 'Pro',
    
    // Safety Levels
    low: isRTL ? 'منخفض' : 'Low',
    medium: isRTL ? 'متوسط' : 'Medium',
    high: isRTL ? 'عالي' : 'High',
    
    // Test Components
    equipment: isRTL ? 'المعدات' : 'Equipment',
    chemicals: isRTL ? 'المواد الكيميائية' : 'Chemicals',
    steps: isRTL ? 'خطوات الاختبار' : 'Test Steps',
    expectedResults: isRTL ? 'النتائج المتوقعة' : 'Expected Results',
    images: isRTL ? 'الصور' : 'Images',
    videos: isRTL ? 'الفيديوهات' : 'Videos',
    tags: isRTL ? 'العلامات' : 'Tags',
    
    // Status
    isActive: isRTL ? 'نشط' : 'Active',
    isFeatured: isRTL ? 'مميز' : 'Featured',
    inactive: isRTL ? 'غير نشط' : 'Inactive',
    
    // Statistics
    viewCount: isRTL ? 'عدد المشاهدات' : 'View Count',
    completionCount: isRTL ? 'عدد الإكمالات' : 'Completion Count',
    rating: isRTL ? 'التقييم' : 'Rating',
    ratingCount: isRTL ? 'عدد التقييمات' : 'Rating Count',
    
    // Actions
    save: isRTL ? 'حفظ' : 'Save',
    cancel: isRTL ? 'إلغاء' : 'Cancel',
    delete: isRTL ? 'حذف' : 'Delete',
    edit: isRTL ? 'تعديل' : 'Edit',
    view: isRTL ? 'عرض' : 'View',
    duplicate: isRTL ? 'نسخ' : 'Duplicate',
    refresh: isRTL ? 'تحديث' : 'Refresh',
    search: isRTL ? 'بحث' : 'Search',
    filter: isRTL ? 'تصفية' : 'Filter',
    
    // Messages
    saving: isRTL ? 'جاري الحفظ...' : 'Saving...',
    saved: isRTL ? 'تم الحفظ بنجاح' : 'Saved successfully',
    error: isRTL ? 'حدث خطأ' : 'An error occurred',
    deleteConfirm: isRTL ? 'هل أنت متأكد من حذف هذا الاختبار؟' : 'Are you sure you want to delete this test?',
    
    // Validation
    required: isRTL ? 'هذا الحقل مطلوب' : 'This field is required',
    invalidSlug: isRTL ? 'الرابط المختصر غير صحيح' : 'Invalid slug format',
    
    // Placeholders
    searchPlaceholder: isRTL ? 'البحث في الاختبارات...' : 'Search tests...',
    selectCategory: isRTL ? 'اختر التصنيف' : 'Select category',
    selectDifficulty: isRTL ? 'اختر مستوى الصعوبة' : 'Select difficulty',
    selectSubscription: isRTL ? 'اختر مستوى الاشتراك' : 'Select subscription level',
    selectSafety: isRTL ? 'اختر مستوى الأمان' : 'Select safety level',
    
    // Categories
    all: isRTL ? 'الكل' : 'All',
    drugTesting: isRTL ? 'فحص المخدرات' : 'Drug Testing',
    forensics: isRTL ? 'الطب الشرعي' : 'Forensics',
    qualitative: isRTL ? 'التحليل النوعي' : 'Qualitative Analysis',
    quantitative: isRTL ? 'التحليل الكمي' : 'Quantitative Analysis',
    organic: isRTL ? 'الكيمياء العضوية' : 'Organic Chemistry',
    inorganic: isRTL ? 'الكيمياء غير العضوية' : 'Inorganic Chemistry',
  };

  useEffect(() => {
    loadTests();
  }, []);

  const loadTests = async () => {
    try {
      setLoading(true);
      console.log('🔄 بدء تحميل الاختبارات...');
      
      const testsRef = collection(db, 'tests');
      const testsQuery = query(testsRef, orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(testsQuery);
      
      const testsList: ChemicalTest[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        testsList.push({
          id: doc.id,
          name: data.name || '',
          nameAr: data.nameAr || '',
          slug: data.slug || '',
          description: data.description || '',
          descriptionAr: data.descriptionAr || '',
          category: data.category || 'general',
          categoryAr: data.categoryAr || 'عام',
          difficulty: data.difficulty || 'beginner',
          subscriptionLevel: data.subscriptionLevel || 'free',
          price: data.price || 0,
          estimatedTime: data.estimatedTime || 30,
          safetyLevel: data.safetyLevel || 'medium',
          equipment: data.equipment || [],
          equipmentAr: data.equipmentAr || [],
          chemicals: data.chemicals || [],
          chemicalsAr: data.chemicalsAr || [],
          steps: data.steps || [],
          expectedResults: data.expectedResults || [],
          images: data.images || [],
          videos: data.videos || [],
          tags: data.tags || [],
          tagsAr: data.tagsAr || [],
          isActive: data.isActive !== false,
          isFeatured: data.isFeatured || false,
          createdAt: data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
          updatedAt: data.updatedAt?.toDate?.()?.toISOString() || new Date().toISOString(),
          viewCount: data.viewCount || 0,
          completionCount: data.completionCount || 0,
          rating: data.rating || 0,
          ratingCount: data.ratingCount || 0,
        } as ChemicalTest);
      });
      
      console.log(`✅ تم تحميل ${testsList.length} اختبار بنجاح`);
      setTests(testsList);
    } catch (error: any) {
      console.error('❌ خطأ في تحميل الاختبارات:', error);
      toast.error(isRTL ? 'خطأ في تحميل الاختبارات' : 'Error loading tests');
    } finally {
      setLoading(false);
    }
  };

  const saveTest = async (test: Omit<ChemicalTest, 'id'>) => {
    try {
      setSaving(true);
      
      if (editingTest) {
        // Update existing test
        const testRef = doc(db, 'tests', editingTest.id);
        await updateDoc(testRef, {
          ...test,
          updatedAt: new Date()
        });
        toast.success(isRTL ? 'تم تحديث الاختبار بنجاح' : 'Test updated successfully');
      } else {
        // Add new test
        const testsRef = collection(db, 'tests');
        await addDoc(testsRef, {
          ...test,
          createdAt: new Date(),
          updatedAt: new Date()
        });
        toast.success(isRTL ? 'تم إضافة الاختبار بنجاح' : 'Test added successfully');
      }
      
      setShowAddDialog(false);
      setShowEditDialog(false);
      setEditingTest(null);
      await loadTests();
    } catch (error: any) {
      console.error('Error saving test:', error);
      toast.error(texts.error);
    } finally {
      setSaving(false);
    }
  };

  const deleteTest = async (testId: string) => {
    try {
      if (!confirm(texts.deleteConfirm)) return;
      
      const testRef = doc(db, 'tests', testId);
      await deleteDoc(testRef);
      
      toast.success(isRTL ? 'تم حذف الاختبار بنجاح' : 'Test deleted successfully');
      await loadTests();
    } catch (error: any) {
      console.error('Error deleting test:', error);
      toast.error(texts.error);
    }
  };

  const duplicateTest = async (test: ChemicalTest) => {
    try {
      const duplicatedTest = {
        ...test,
        name: `${test.name} (Copy)`,
        nameAr: `${test.nameAr} (نسخة)`,
        slug: `${test.slug}-copy-${Date.now()}`,
        isActive: false,
        isFeatured: false,
        viewCount: 0,
        completionCount: 0,
        rating: 0,
        ratingCount: 0
      };
      
      delete (duplicatedTest as any).id;
      delete (duplicatedTest as any).createdAt;
      delete (duplicatedTest as any).updatedAt;
      
      await saveTest(duplicatedTest);
    } catch (error: any) {
      console.error('Error duplicating test:', error);
      toast.error(texts.error);
    }
  };

  const getSubscriptionBadge = (level: ChemicalTest['subscriptionLevel']) => {
    const config = {
      free: { color: 'bg-green-100 text-green-800', text: texts.free, icon: GiftIcon },
      basic: { color: 'bg-blue-100 text-blue-800', text: texts.basic, icon: TagIcon },
      premium: { color: 'bg-purple-100 text-purple-800', text: texts.premium, icon: StarIcon },
      pro: { color: 'bg-orange-100 text-orange-800', text: texts.pro, icon: LockClosedIcon }
    };
    
    const levelConfig = config[level] || config.free;
    const IconComponent = levelConfig.icon;
    
    return (
      <Badge className={levelConfig.color}>
        <IconComponent className="h-3 w-3 mr-1 rtl:ml-1 rtl:mr-0" />
        {levelConfig.text}
      </Badge>
    );
  };

  const getDifficultyBadge = (difficulty: ChemicalTest['difficulty']) => {
    const config = {
      beginner: { color: 'bg-green-100 text-green-800', text: texts.beginner },
      intermediate: { color: 'bg-yellow-100 text-yellow-800', text: texts.intermediate },
      advanced: { color: 'bg-red-100 text-red-800', text: texts.advanced }
    };
    
    const difficultyConfig = config[difficulty] || config.beginner;
    return <Badge className={difficultyConfig.color}>{difficultyConfig.text}</Badge>;
  };

  const getSafetyBadge = (safety: ChemicalTest['safetyLevel']) => {
    const config = {
      low: { color: 'bg-green-100 text-green-800', text: texts.low },
      medium: { color: 'bg-yellow-100 text-yellow-800', text: texts.medium },
      high: { color: 'bg-red-100 text-red-800', text: texts.high }
    };
    
    const safetyConfig = config[safety] || config.medium;
    return <Badge className={safetyConfig.color}>{safetyConfig.text}</Badge>;
  };

  const filteredTests = tests.filter(test => {
    const matchesSearch = test.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         test.nameAr.includes(searchTerm) ||
                         test.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         test.descriptionAr.includes(searchTerm);
    
    const matchesCategory = filterCategory === 'all' || test.category === filterCategory;
    const matchesLevel = filterLevel === 'all' || test.subscriptionLevel === filterLevel;
    
    return matchesSearch && matchesCategory && matchesLevel;
  });

  return (
    <div className={`space-y-6 ${isRTL ? 'rtl' : 'ltr'}`} dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center space-x-2 rtl:space-x-reverse">
            <BeakerIcon className="h-6 w-6" />
            <span>{texts.title}</span>
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            {texts.subtitle}
          </p>
        </div>
        <div className="flex space-x-2 rtl:space-x-reverse">
          <Button variant="outline" onClick={loadTests}>
            <ArrowPathIcon className="h-4 w-4 mr-2 rtl:ml-2 rtl:mr-0" />
            {texts.refresh}
          </Button>
          <Button onClick={() => setShowAddDialog(true)}>
            <PlusIcon className="h-4 w-4 mr-2 rtl:ml-2 rtl:mr-0" />
            {texts.addTest}
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label>{texts.search}</Label>
              <Input
                placeholder={texts.searchPlaceholder}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>{texts.category}</Label>
              <Select value={filterCategory} onValueChange={setFilterCategory}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{texts.all}</SelectItem>
                  <SelectItem value="drugTesting">{texts.drugTesting}</SelectItem>
                  <SelectItem value="forensics">{texts.forensics}</SelectItem>
                  <SelectItem value="qualitative">{texts.qualitative}</SelectItem>
                  <SelectItem value="quantitative">{texts.quantitative}</SelectItem>
                  <SelectItem value="organic">{texts.organic}</SelectItem>
                  <SelectItem value="inorganic">{texts.inorganic}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>{texts.subscriptionLevel}</Label>
              <Select value={filterLevel} onValueChange={setFilterLevel}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{texts.all}</SelectItem>
                  <SelectItem value="free">{texts.free}</SelectItem>
                  <SelectItem value="basic">{texts.basic}</SelectItem>
                  <SelectItem value="premium">{texts.premium}</SelectItem>
                  <SelectItem value="pro">{texts.pro}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {isRTL ? `${filteredTests.length} من ${tests.length} اختبار` : `${filteredTests.length} of ${tests.length} tests`}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
