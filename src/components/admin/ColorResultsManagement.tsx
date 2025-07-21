'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Eye,
  Download,
  Upload,
  Palette
} from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import toast from 'react-hot-toast';

interface ColorResult {
  id: string;
  test_id: string;
  test_name: string;
  test_name_ar: string;
  color_result: string;
  color_result_ar: string;
  color_hex: string;
  possible_substance: string;
  possible_substance_ar: string;
  confidence_level: number;
  category: string;
  reference: string;
  created_at: string;
  updated_at: string;
}

interface ColorResultsManagementProps {
  isRTL: boolean;
  lang?: 'ar' | 'en';
}

export default function ColorResultsManagement({ isRTL, lang = 'en' }: ColorResultsManagementProps) {
  const [results, setResults] = useState<ColorResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingResult, setEditingResult] = useState<ColorResult | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [resultToDelete, setResultToDelete] = useState<ColorResult | null>(null);

  // Sample data - في التطبيق الحقيقي، سيتم جلب البيانات من قاعدة البيانات
  const sampleResults: ColorResult[] = [
    {
      id: '1',
      test_id: 'marquis-test',
      test_name: 'Marquis Test',
      test_name_ar: 'اختبار ماركيز',
      color_result: 'Purple/Violet',
      color_result_ar: 'بنفسجي/أرجواني',
      color_hex: '#8A2BE2',
      possible_substance: 'MDMA/Ecstasy',
      possible_substance_ar: 'إكستاسي/MDMA',
      confidence_level: 85,
      category: 'stimulant',
      reference: 'REF-001',
      created_at: '2025-01-13T10:00:00Z',
      updated_at: '2025-01-13T10:00:00Z'
    },
    {
      id: '2',
      test_id: 'mecke-test',
      test_name: 'Mecke Test',
      test_name_ar: 'اختبار ميكي',
      color_result: 'Blue/Green',
      color_result_ar: 'أزرق/أخضر',
      color_hex: '#0080FF',
      possible_substance: 'Cocaine',
      possible_substance_ar: 'كوكايين',
      confidence_level: 78,
      category: 'stimulant',
      reference: 'REF-002',
      created_at: '2025-01-13T11:00:00Z',
      updated_at: '2025-01-13T11:00:00Z'
    },
    {
      id: '3',
      test_id: 'duquenois-levine-test',
      test_name: 'Duquenois-Levine Test',
      test_name_ar: 'اختبار دوكينويس-ليفين',
      color_result: 'Purple/Blue',
      color_result_ar: 'بنفسجي/أزرق',
      color_hex: '#4B0082',
      possible_substance: 'Cannabis/THC',
      possible_substance_ar: 'حشيش/THC',
      confidence_level: 92,
      category: 'cannabis',
      reference: 'REF-003',
      created_at: '2025-01-13T12:00:00Z',
      updated_at: '2025-01-13T12:00:00Z'
    }
  ];

  useEffect(() => {
    // محاكاة تحميل البيانات
    setTimeout(() => {
      setResults(sampleResults);
      setLoading(false);
    }, 1000);
  }, []);

  const filteredResults = results.filter(result => {
    const matchesSearch = searchTerm === '' || 
      result.test_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      result.test_name_ar.toLowerCase().includes(searchTerm.toLowerCase()) ||
      result.color_result.toLowerCase().includes(searchTerm.toLowerCase()) ||
      result.color_result_ar.toLowerCase().includes(searchTerm.toLowerCase()) ||
      result.possible_substance.toLowerCase().includes(searchTerm.toLowerCase()) ||
      result.possible_substance_ar.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory = selectedCategory === 'all' || result.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  const handleAddResult = () => {
    setIsAddModalOpen(true);
  };

  const handleEditResult = (result: ColorResult) => {
    setEditingResult(result);
    setIsAddModalOpen(true);
  };

  const handleDeleteResult = (result: ColorResult) => {
    setResultToDelete(result);
    setDeleteConfirmOpen(true);
  };

  const confirmDelete = () => {
    if (resultToDelete) {
      setResults(prev => prev.filter(r => r.id !== resultToDelete.id));
      toast.success(lang === 'ar' ? 'تم حذف النتيجة بنجاح' : 'Result deleted successfully');
      setDeleteConfirmOpen(false);
      setResultToDelete(null);
    }
  };

  const handleExport = () => {
    const dataStr = JSON.stringify(filteredResults, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `color-results-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    toast.success(lang === 'ar' ? 'تم تصدير النتائج بنجاح' : 'Results exported successfully');
  };

  const getCategoryBadgeColor = (category: string) => {
    switch (category) {
      case 'stimulant': return 'bg-red-100 text-red-800';
      case 'depressant': return 'bg-blue-100 text-blue-800';
      case 'cannabis': return 'bg-green-100 text-green-800';
      case 'psychedelic': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getConfidenceBadgeColor = (confidence: number) => {
    if (confidence >= 90) return 'bg-green-100 text-green-800';
    if (confidence >= 70) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <div className="text-lg font-medium text-gray-900 dark:text-gray-100">
            {lang === 'ar' ? 'جاري تحميل النتائج...' : 'Loading results...'}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            {lang === 'ar' ? 'إدارة النتائج اللونية' : 'Color Results Management'}
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            {lang === 'ar' ? 'إدارة نتائج الألوان والتفسيرات' : 'Manage color results and interpretations'}
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button onClick={handleAddResult}>
            <Plus className="h-4 w-4 mr-2" />
            {lang === 'ar' ? 'إضافة نتيجة' : 'Add Result'}
          </Button>
          
          <Button variant="outline" onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" />
            {lang === 'ar' ? 'تصدير' : 'Export'}
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4 pointer-events-none" />
                <Input
                  type="text"
                  placeholder={lang === 'ar' ? 'البحث في النتائج...' : 'Search results...'}
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
            
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">{lang === 'ar' ? 'جميع الفئات' : 'All Categories'}</option>
              <option value="stimulant">{lang === 'ar' ? 'منشطات' : 'Stimulants'}</option>
              <option value="depressant">{lang === 'ar' ? 'مثبطات' : 'Depressants'}</option>
              <option value="cannabis">{lang === 'ar' ? 'حشيش' : 'Cannabis'}</option>
              <option value="psychedelic">{lang === 'ar' ? 'مهلوسات' : 'Psychedelics'}</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Results Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5" />
            {lang === 'ar' ? 'النتائج اللونية' : 'Color Results'}
            <Badge variant="secondary">{filteredResults.length}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{lang === 'ar' ? 'الاختبار' : 'Test'}</TableHead>
                  <TableHead>{lang === 'ar' ? 'النتيجة اللونية' : 'Color Result'}</TableHead>
                  <TableHead>{lang === 'ar' ? 'المادة المحتملة' : 'Possible Substance'}</TableHead>
                  <TableHead>{lang === 'ar' ? 'مستوى الثقة' : 'Confidence'}</TableHead>
                  <TableHead>{lang === 'ar' ? 'الفئة' : 'Category'}</TableHead>
                  <TableHead>{lang === 'ar' ? 'الإجراءات' : 'Actions'}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredResults.map((result) => (
                  <TableRow key={result.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">
                          {isRTL ? result.test_name_ar : result.test_name}
                        </div>
                        <div className="text-sm text-gray-500">{result.reference}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-4 h-4 rounded-full border"
                          style={{ backgroundColor: result.color_hex }}
                        ></div>
                        <span>{isRTL ? result.color_result_ar : result.color_result}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {isRTL ? result.possible_substance_ar : result.possible_substance}
                    </TableCell>
                    <TableCell>
                      <Badge className={getConfidenceBadgeColor(result.confidence_level)}>
                        {result.confidence_level}%
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={getCategoryBadgeColor(result.category)}>
                        {result.category}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditResult(result)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteResult(result)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          
          {filteredResults.length === 0 && (
            <div className="text-center py-8">
              <Palette className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">
                {lang === 'ar' ? 'لا توجد نتائج مطابقة' : 'No matching results found'}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add/Edit Result Dialog */}
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingResult
                ? (lang === 'ar' ? 'تحرير النتيجة' : 'Edit Result')
                : (lang === 'ar' ? 'إضافة نتيجة جديدة' : 'Add New Result')
              }
            </DialogTitle>
            <DialogDescription>
              {lang === 'ar'
                ? 'أدخل تفاصيل النتيجة اللونية والتفسير'
                : 'Enter the color result details and interpretation'
              }
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
            <div>
              <label className="text-sm font-medium mb-2 block">
                {lang === 'ar' ? 'اسم الاختبار' : 'Test Name'}
              </label>
              <Input placeholder={lang === 'ar' ? 'مثال: اختبار ماركيز' : 'e.g., Marquis Test'} />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">
                {lang === 'ar' ? 'اسم الاختبار (عربي)' : 'Test Name (Arabic)'}
              </label>
              <Input placeholder={lang === 'ar' ? 'مثال: اختبار ماركيز' : 'e.g., اختبار ماركيز'} />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">
                {lang === 'ar' ? 'النتيجة اللونية' : 'Color Result'}
              </label>
              <Input placeholder={lang === 'ar' ? 'مثال: بنفسجي' : 'e.g., Purple'} />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">
                {lang === 'ar' ? 'النتيجة اللونية (عربي)' : 'Color Result (Arabic)'}
              </label>
              <Input placeholder={lang === 'ar' ? 'مثال: بنفسجي' : 'e.g., بنفسجي'} />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">
                {lang === 'ar' ? 'كود اللون (Hex)' : 'Color Hex Code'}
              </label>
              <Input placeholder="#8A2BE2" />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">
                {lang === 'ar' ? 'مستوى الثقة (%)' : 'Confidence Level (%)'}
              </label>
              <Input type="number" min="0" max="100" placeholder="85" />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">
                {lang === 'ar' ? 'المادة المحتملة' : 'Possible Substance'}
              </label>
              <Input placeholder={lang === 'ar' ? 'مثال: إكستاسي' : 'e.g., MDMA'} />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">
                {lang === 'ar' ? 'المادة المحتملة (عربي)' : 'Possible Substance (Arabic)'}
              </label>
              <Input placeholder={lang === 'ar' ? 'مثال: إكستاسي' : 'e.g., إكستاسي'} />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">
                {lang === 'ar' ? 'الفئة' : 'Category'}
              </label>
              <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="stimulant">{lang === 'ar' ? 'منشطات' : 'Stimulant'}</option>
                <option value="depressant">{lang === 'ar' ? 'مثبطات' : 'Depressant'}</option>
                <option value="cannabis">{lang === 'ar' ? 'حشيش' : 'Cannabis'}</option>
                <option value="psychedelic">{lang === 'ar' ? 'مهلوسات' : 'Psychedelic'}</option>
              </select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">
                {lang === 'ar' ? 'المرجع' : 'Reference'}
              </label>
              <Input placeholder="REF-001" />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsAddModalOpen(false);
                setEditingResult(null);
              }}
            >
              {lang === 'ar' ? 'إلغاء' : 'Cancel'}
            </Button>
            <Button
              onClick={() => {
                // هنا سيتم حفظ البيانات
                toast.success(lang === 'ar' ? 'تم حفظ النتيجة بنجاح' : 'Result saved successfully');
                setIsAddModalOpen(false);
                setEditingResult(null);
              }}
            >
              {lang === 'ar' ? 'حفظ' : 'Save'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {lang === 'ar' ? 'تأكيد الحذف' : 'Confirm Delete'}
            </DialogTitle>
            <DialogDescription>
              {lang === 'ar'
                ? 'هل أنت متأكد من حذف هذه النتيجة؟ لا يمكن التراجع عن هذا الإجراء.'
                : 'Are you sure you want to delete this result? This action cannot be undone.'
              }
            </DialogDescription>
          </DialogHeader>

          {resultToDelete && (
            <div className="py-4">
              <div className="text-sm text-gray-600 mb-2">
                {lang === 'ar' ? 'النتيجة:' : 'Result:'}
              </div>
              <div className="font-medium">
                {isRTL ? resultToDelete.test_name_ar : resultToDelete.test_name} - {isRTL ? resultToDelete.color_result_ar : resultToDelete.color_result}
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteConfirmOpen(false)}
            >
              {lang === 'ar' ? 'إلغاء' : 'Cancel'}
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDelete}
            >
              {lang === 'ar' ? 'حذف' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
