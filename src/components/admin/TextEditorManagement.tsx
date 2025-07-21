'use client';

import React, { useState, useEffect } from 'react';
import { Language } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  PencilSquareIcon,
  DocumentTextIcon,
  EyeIcon,
  CheckIcon,
  XMarkIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline';
import { RichTextEditor } from '@/components/ui/rich-text-editor';
import toast from 'react-hot-toast';

interface TextEditorManagementProps {
  lang: Language;
}

interface TextContent {
  id: string;
  key: string;
  title_en: string;
  title_ar: string;
  content_en: string;
  content_ar: string;
  category: string;
  is_active: boolean;
  last_modified: string;
  modified_by: string;
}

export function TextEditorManagement({ lang }: TextEditorManagementProps) {
  const [textContents, setTextContents] = useState<TextContent[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [editingContent, setEditingContent] = useState<TextContent | null>(null);
  const [previewContent, setPreviewContent] = useState<TextContent | null>(null);

  const isRTL = lang === 'ar';

  const categories = [
    { id: 'homepage', name_en: 'Homepage', name_ar: 'الصفحة الرئيسية' },
    { id: 'about', name_en: 'About Us', name_ar: 'من نحن' },
    { id: 'tests', name_en: 'Tests', name_ar: 'الاختبارات' },
    { id: 'help', name_en: 'Help & Support', name_ar: 'المساعدة والدعم' },
    { id: 'legal', name_en: 'Legal', name_ar: 'قانوني' },
    { id: 'notifications', name_en: 'Notifications', name_ar: 'الإشعارات' }
  ];

  useEffect(() => {
    loadTextContents();
  }, []);

  const loadTextContents = async () => {
    try {
      setLoading(true);
      
      // Mock data for text contents
      const mockContents: TextContent[] = [
        {
          id: 'welcome-message',
          key: 'homepage.welcome.title',
          title_en: 'Welcome Message',
          title_ar: 'رسالة الترحيب',
          content_en: '<h1>Welcome to Color Test System</h1><p>Advanced chemical testing through color analysis</p>',
          content_ar: '<h1>مرحباً بك في نظام اختبار الألوان</h1><p>اختبار كيميائي متقدم من خلال تحليل الألوان</p>',
          category: 'homepage',
          is_active: true,
          last_modified: new Date().toISOString(),
          modified_by: 'admin'
        },
        {
          id: 'about-description',
          key: 'about.description',
          title_en: 'About Description',
          title_ar: 'وصف من نحن',
          content_en: '<p>Our system provides accurate chemical substance identification through advanced color analysis techniques.</p>',
          content_ar: '<p>يوفر نظامنا تحديد دقيق للمواد الكيميائية من خلال تقنيات تحليل الألوان المتقدمة.</p>',
          category: 'about',
          is_active: true,
          last_modified: new Date().toISOString(),
          modified_by: 'admin'
        },
        {
          id: 'test-instructions',
          key: 'tests.instructions',
          title_en: 'Test Instructions',
          title_ar: 'تعليمات الاختبار',
          content_en: '<h2>How to Perform Tests</h2><ol><li>Select the appropriate test</li><li>Follow safety guidelines</li><li>Record color changes</li></ol>',
          content_ar: '<h2>كيفية إجراء الاختبارات</h2><ol><li>اختر الاختبار المناسب</li><li>اتبع إرشادات السلامة</li><li>سجل تغيرات الألوان</li></ol>',
          category: 'tests',
          is_active: true,
          last_modified: new Date().toISOString(),
          modified_by: 'admin'
        },
        {
          id: 'privacy-policy',
          key: 'legal.privacy',
          title_en: 'Privacy Policy',
          title_ar: 'سياسة الخصوصية',
          content_en: '<h1>Privacy Policy</h1><p>We respect your privacy and protect your personal information...</p>',
          content_ar: '<h1>سياسة الخصوصية</h1><p>نحن نحترم خصوصيتك ونحمي معلوماتك الشخصية...</p>',
          category: 'legal',
          is_active: true,
          last_modified: new Date().toISOString(),
          modified_by: 'admin'
        },
        {
          id: 'help-faq',
          key: 'help.faq',
          title_en: 'Frequently Asked Questions',
          title_ar: 'الأسئلة الشائعة',
          content_en: '<h2>FAQ</h2><h3>How accurate are the tests?</h3><p>Our tests provide high accuracy when performed correctly...</p>',
          content_ar: '<h2>الأسئلة الشائعة</h2><h3>ما مدى دقة الاختبارات؟</h3><p>توفر اختباراتنا دقة عالية عند إجرائها بشكل صحيح...</p>',
          category: 'help',
          is_active: true,
          last_modified: new Date().toISOString(),
          modified_by: 'admin'
        }
      ];

      setTextContents(mockContents);
      console.log(`📝 Loaded ${mockContents.length} text contents`);
      
    } catch (error) {
      console.error('Error loading text contents:', error);
      toast.error(lang === 'ar' ? 'خطأ في تحميل المحتويات النصية' : 'Error loading text contents');
    } finally {
      setLoading(false);
    }
  };

  const filteredContents = textContents.filter(content => {
    const matchesSearch = searchTerm === '' || 
      content.title_en.toLowerCase().includes(searchTerm.toLowerCase()) ||
      content.title_ar.includes(searchTerm) ||
      content.key.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = selectedCategory === '' || content.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  const handleSaveContent = async (content: TextContent) => {
    try {
      const updatedContents = textContents.map(c => 
        c.id === content.id 
          ? { 
              ...content, 
              last_modified: new Date().toISOString(),
              modified_by: 'admin'
            }
          : c
      );
      
      setTextContents(updatedContents);
      setEditingContent(null);
      toast.success(lang === 'ar' ? 'تم حفظ المحتوى بنجاح' : 'Content saved successfully');
      
    } catch (error) {
      console.error('Error saving content:', error);
      toast.error(lang === 'ar' ? 'خطأ في حفظ المحتوى' : 'Error saving content');
    }
  };

  const getCategoryName = (categoryId: string) => {
    const category = categories.find(c => c.id === categoryId);
    return category ? (isRTL ? category.name_ar : category.name_en) : categoryId;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2">{lang === 'ar' ? 'جاري التحميل...' : 'Loading...'}</span>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${isRTL ? 'rtl' : 'ltr'}`} dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3 rtl:space-x-reverse">
          <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-center justify-center">
            <PencilSquareIcon className="h-6 w-6 text-purple-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {lang === 'ar' ? 'محرر النصوص' : 'Text Editor Management'}
            </h1>
            <p className="text-gray-500">
              {lang === 'ar' 
                ? `إدارة ${textContents.length} محتوى نصي في النظام`
                : `Managing ${textContents.length} text contents in the system`
              }
            </p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 rtl:right-3 rtl:left-auto top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
              <Input
                type="text"
                placeholder={lang === 'ar' ? 'البحث في المحتويات...' : 'Search contents...'}
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
              <option value="">{lang === 'ar' ? 'جميع الفئات' : 'All Categories'}</option>
              {categories.map(category => (
                <option key={category.id} value={category.id}>
                  {isRTL ? category.name_ar : category.name_en}
                </option>
              ))}
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Content List */}
      <div className="space-y-4">
        {filteredContents.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <DocumentTextIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                {lang === 'ar' ? 'لا توجد محتويات' : 'No Contents Found'}
              </h3>
              <p className="text-gray-500">
                {lang === 'ar' 
                  ? 'لم يتم العثور على محتويات تطابق البحث المحدد'
                  : 'No contents found matching the current search criteria'
                }
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredContents.map((content) => (
            <Card key={content.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 rtl:space-x-reverse mb-3">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                        {isRTL ? content.title_ar : content.title_en}
                      </h3>
                      <Badge variant="outline" className="text-xs">
                        {getCategoryName(content.category)}
                      </Badge>
                      <Badge variant={content.is_active ? 'default' : 'secondary'} className="text-xs">
                        {content.is_active 
                          ? (lang === 'ar' ? 'نشط' : 'Active')
                          : (lang === 'ar' ? 'غير نشط' : 'Inactive')
                        }
                      </Badge>
                    </div>
                    
                    <p className="text-sm text-gray-500 mb-2">
                      <span className="font-medium">{lang === 'ar' ? 'المفتاح:' : 'Key:'}</span> {content.key}
                    </p>
                    
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      <span className="font-medium">{lang === 'ar' ? 'آخر تعديل:' : 'Last modified:'}</span>{' '}
                      {new Date(content.last_modified).toLocaleDateString(lang === 'ar' ? 'ar-SA' : 'en-US')} 
                      {lang === 'ar' ? ' بواسطة ' : ' by '} {content.modified_by}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2 rtl:space-x-reverse ml-4 rtl:mr-4 rtl:ml-0">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setPreviewContent(content)}
                    >
                      <EyeIcon className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setEditingContent(content)}
                    >
                      <PencilSquareIcon className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Edit Modal */}
      {editingContent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>
                  {lang === 'ar' ? 'تحرير المحتوى' : 'Edit Content'}: {isRTL ? editingContent.title_ar : editingContent.title_en}
                </span>
                <Button variant="ghost" size="sm" onClick={() => setEditingContent(null)}>
                  <XMarkIcon className="h-4 w-4" />
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    {lang === 'ar' ? 'العنوان (إنجليزي)' : 'Title (English)'}
                  </label>
                  <Input
                    value={editingContent.title_en}
                    onChange={(e) => setEditingContent(prev => prev ? { ...prev, title_en: e.target.value } : null)}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    {lang === 'ar' ? 'العنوان (عربي)' : 'Title (Arabic)'}
                  </label>
                  <Input
                    value={editingContent.title_ar}
                    onChange={(e) => setEditingContent(prev => prev ? { ...prev, title_ar: e.target.value } : null)}
                    dir="rtl"
                  />
                </div>
              </div>

              {/* Content Editors */}
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    {lang === 'ar' ? 'المحتوى (إنجليزي)' : 'Content (English)'}
                  </label>
                  <RichTextEditor
                    value={editingContent.content_en}
                    onChange={(value) => setEditingContent(prev => prev ? { ...prev, content_en: value } : null)}
                    placeholder="Enter content in English..."
                    lang="en"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    {lang === 'ar' ? 'المحتوى (عربي)' : 'Content (Arabic)'}
                  </label>
                  <RichTextEditor
                    value={editingContent.content_ar}
                    onChange={(value) => setEditingContent(prev => prev ? { ...prev, content_ar: value } : null)}
                    placeholder="أدخل المحتوى بالعربية..."
                    lang="ar"
                  />
                </div>
              </div>

              {/* Settings */}
              <div className="flex items-center space-x-4 rtl:space-x-reverse">
                <div className="flex items-center space-x-2 rtl:space-x-reverse">
                  <input
                    type="checkbox"
                    id="is_active_edit"
                    checked={editingContent.is_active}
                    onChange={(e) => setEditingContent(prev => prev ? { ...prev, is_active: e.target.checked } : null)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <label htmlFor="is_active_edit" className="text-sm font-medium">
                    {lang === 'ar' ? 'محتوى نشط' : 'Active Content'}
                  </label>
                </div>
              </div>

              <div className="flex justify-end space-x-2 rtl:space-x-reverse pt-4 border-t">
                <Button variant="outline" onClick={() => setEditingContent(null)}>
                  {lang === 'ar' ? 'إلغاء' : 'Cancel'}
                </Button>
                <Button onClick={() => handleSaveContent(editingContent)}>
                  {lang === 'ar' ? 'حفظ التغييرات' : 'Save Changes'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Preview Modal */}
      {previewContent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>
                  {lang === 'ar' ? 'معاينة المحتوى' : 'Content Preview'}: {isRTL ? previewContent.title_ar : previewContent.title_en}
                </span>
                <Button variant="ghost" size="sm" onClick={() => setPreviewContent(null)}>
                  <XMarkIcon className="h-4 w-4" />
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-gray-100">
                    {lang === 'ar' ? 'النسخة الإنجليزية' : 'English Version'}
                  </h3>
                  <div
                    className="prose prose-sm max-w-none border rounded-lg p-4 bg-gray-50 dark:bg-gray-800"
                    dangerouslySetInnerHTML={{ __html: previewContent.content_en }}
                  />
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-gray-100">
                    {lang === 'ar' ? 'النسخة العربية' : 'Arabic Version'}
                  </h3>
                  <div
                    className="prose prose-sm max-w-none border rounded-lg p-4 bg-gray-50 dark:bg-gray-800"
                    dangerouslySetInnerHTML={{ __html: previewContent.content_ar }}
                    dir="rtl"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-4 border-t">
                <Button onClick={() => setPreviewContent(null)}>
                  {lang === 'ar' ? 'إغلاق' : 'Close'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
