'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  BoldIcon, 
  ItalicIcon,
  UnderlineIcon,
  ListBulletIcon,
  NumberedListIcon,
  LinkIcon,
  PhotoIcon,
  DocumentIcon,
  XMarkIcon,
  CheckIcon
} from '@heroicons/react/24/outline';
import { Language } from '@/types';

interface RichTextEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
  lang: Language;
  className?: string;
  minHeight?: number;
}

interface TextContentManagementProps {
  lang: Language;
}

export function RichTextEditor({ 
  content, 
  onChange, 
  placeholder, 
  lang,
  className = '',
  minHeight = 200
}: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const [isEditing, setIsEditing] = useState(false);
  const isRTL = lang === 'ar';

  const handleCommand = (command: string, value?: string) => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
    updateContent();
  };

  const updateContent = () => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  const handleInput = () => {
    updateContent();
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const text = e.clipboardData.getData('text/plain');
    document.execCommand('insertText', false, text);
  };

  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== content) {
      editorRef.current.innerHTML = content;
    }
  }, [content]);

  const toolbarButtons = [
    { command: 'bold', icon: BoldIcon, title: isRTL ? 'عريض' : 'Bold' },
    { command: 'italic', icon: ItalicIcon, title: isRTL ? 'مائل' : 'Italic' },
    { command: 'underline', icon: UnderlineIcon, title: isRTL ? 'تحته خط' : 'Underline' },
    { command: 'insertUnorderedList', icon: ListBulletIcon, title: isRTL ? 'قائمة نقطية' : 'Bullet List' },
    { command: 'insertOrderedList', icon: NumberedListIcon, title: isRTL ? 'قائمة مرقمة' : 'Numbered List' },
  ];

  return (
    <div className={`border border-gray-300 dark:border-gray-600 rounded-lg ${className}`}>
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-1 p-2 bg-gray-50 dark:bg-gray-800 border-b border-gray-300 dark:border-gray-600 rounded-t-lg">
        {toolbarButtons.map((button, index) => (
          <Button
            key={index}
            variant="ghost"
            size="sm"
            onClick={() => handleCommand(button.command)}
            title={button.title}
            className="p-2"
          >
            <button.icon className="h-4 w-4" />
          </Button>
        ))}
        
        <div className="h-6 w-px bg-gray-300 dark:bg-gray-600 mx-1" />
        
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleCommand('removeFormat')}
          title={isRTL ? 'إزالة التنسيق' : 'Remove Formatting'}
          className="p-2"
        >
          <XMarkIcon className="h-4 w-4" />
        </Button>
      </div>

      {/* Editor */}
      <div
        ref={editorRef}
        contentEditable
        className={`p-4 focus:outline-none min-h-[${minHeight}px] ${
          isRTL ? 'text-right' : 'text-left'
        }`}
        style={{ minHeight: `${minHeight}px` }}
        dir={isRTL ? 'rtl' : 'ltr'}
        onInput={handleInput}
        onPaste={handlePaste}
        data-placeholder={placeholder}
        suppressContentEditableWarning={true}
      />
      
      <style jsx>{`
        [contenteditable]:empty:before {
          content: attr(data-placeholder);
          color: #9ca3af;
          pointer-events: none;
        }
      `}</style>
    </div>
  );
}

interface TextContentItem {
  id: string;
  key: string;
  title: string;
  title_ar: string;
  content: string;
  content_ar: string;
  category: string;
  editable: boolean;
  lastModified: string;
}

export function TextContentManagement({ lang }: TextContentManagementProps) {
  const [textContents, setTextContents] = useState<TextContentItem[]>([]);
  const [selectedContent, setSelectedContent] = useState<TextContentItem | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const isRTL = lang === 'ar';

  const texts = {
    title: isRTL ? 'إدارة محتوى النصوص' : 'Text Content Management',
    subtitle: isRTL ? 'تحرير وإدارة نصوص الموقع' : 'Edit and manage website text content',
    search: isRTL ? 'البحث في المحتوى...' : 'Search content...',
    category: isRTL ? 'الفئة' : 'Category',
    allCategories: isRTL ? 'جميع الفئات' : 'All Categories',
    contentTitle: isRTL ? 'عنوان المحتوى' : 'Content Title',
    contentText: isRTL ? 'نص المحتوى' : 'Content Text',
    edit: isRTL ? 'تحرير' : 'Edit',
    save: isRTL ? 'حفظ' : 'Save',
    cancel: isRTL ? 'إلغاء' : 'Cancel',
    preview: isRTL ? 'معاينة' : 'Preview',
    lastModified: isRTL ? 'آخر تعديل' : 'Last Modified',
    noContent: isRTL ? 'لا يوجد محتوى' : 'No content found',
    saveSuccess: isRTL ? 'تم حفظ المحتوى بنجاح' : 'Content saved successfully',
    errorOccurred: isRTL ? 'حدث خطأ' : 'An error occurred'
  };

  // Initialize text content data
  useEffect(() => {
    initializeTextContent();
  }, []);

  const initializeTextContent = () => {
    // Sample text content that could be edited
    const sampleContent: TextContentItem[] = [
      {
        id: '1',
        key: 'home.hero.title',
        title: 'Home Page Hero Title',
        title_ar: 'عنوان الصفحة الرئيسية',
        content: 'Professional Chemical Testing Platform',
        content_ar: 'منصة الاختبارات الكيميائية المهنية',
        category: 'homepage',
        editable: true,
        lastModified: new Date().toISOString()
      },
      {
        id: '2',
        key: 'home.hero.description',
        title: 'Home Page Hero Description',
        title_ar: 'وصف الصفحة الرئيسية',
        content: 'Comprehensive chemical testing tools and resources for professionals and researchers.',
        content_ar: 'أدوات وموارد شاملة للاختبارات الكيميائية للمهنيين والباحثين.',
        category: 'homepage',
        editable: true,
        lastModified: new Date().toISOString()
      },
      {
        id: '3',
        key: 'tests.instructions.safety',
        title: 'Safety Instructions',
        title_ar: 'تعليمات السلامة',
        content: '<strong>Important Safety Guidelines:</strong><br>• Always wear protective equipment<br>• Ensure proper ventilation<br>• Follow all safety protocols',
        content_ar: '<strong>إرشادات السلامة المهمة:</strong><br>• ارتدِ دائماً معدات الحماية<br>• تأكد من التهوية المناسبة<br>• اتبع جميع بروتوكولات السلامة',
        category: 'safety',
        editable: true,
        lastModified: new Date().toISOString()
      },
      {
        id: '4',
        key: 'tests.general.disclaimer',
        title: 'General Disclaimer',
        title_ar: 'إخلاء المسؤولية العام',
        content: 'These tests are for educational and research purposes only. Always consult with qualified professionals.',
        content_ar: 'هذه الاختبارات لأغراض تعليمية وبحثية فقط. استشر دائماً المهنيين المؤهلين.',
        category: 'legal',
        editable: true,
        lastModified: new Date().toISOString()
      },
      {
        id: '5',
        key: 'about.company.description',
        title: 'About Company Description',
        title_ar: 'وصف الشركة',
        content: 'We are dedicated to providing accurate and reliable chemical testing solutions.',
        content_ar: 'نحن ملتزمون بتوفير حلول اختبار كيميائية دقيقة وموثوقة.',
        category: 'about',
        editable: true,
        lastModified: new Date().toISOString()
      }
    ];

    setTextContents(sampleContent);
  };

  const filteredContent = textContents.filter(content => {
    const matchesSearch = 
      content.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      content.title_ar.includes(searchQuery) ||
      content.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      content.content_ar.includes(searchQuery);
    
    const matchesCategory = selectedCategory === 'all' || content.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  const categories = [
    { value: 'all', label: texts.allCategories },
    { value: 'homepage', label: isRTL ? 'الصفحة الرئيسية' : 'Homepage' },
    { value: 'safety', label: isRTL ? 'السلامة' : 'Safety' },
    { value: 'legal', label: isRTL ? 'قانوني' : 'Legal' },
    { value: 'about', label: isRTL ? 'حول' : 'About' },
  ];

  const handleEdit = (content: TextContentItem) => {
    setSelectedContent({ ...content });
    setEditMode(true);
  };

  const handleSave = () => {
    if (!selectedContent) return;

    setLoading(true);
    
    // Update the content in the state
    setTextContents(prev => prev.map(item => 
      item.id === selectedContent.id 
        ? { ...selectedContent, lastModified: new Date().toISOString() }
        : item
    ));

    // Here you would typically save to your backend/database
    // await saveContentToBackend(selectedContent);

    setTimeout(() => {
      setLoading(false);
      setEditMode(false);
      setSelectedContent(null);
      // Show success message
    }, 1000);
  };

  const handleCancel = () => {
    setEditMode(false);
    setSelectedContent(null);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return isRTL 
      ? date.toLocaleDateString('ar-SA')
      : date.toLocaleDateString('en-US');
  };

  return (
    <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          {texts.title}
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          {texts.subtitle}
        </p>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder={texts.search}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="w-full sm:w-48">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800"
              >
                {categories.map(category => (
                  <option key={category.value} value={category.value}>
                    {category.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Content List */}
      <div className="grid gap-4">
        {filteredContent.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <DocumentIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400">{texts.noContent}</p>
            </CardContent>
          </Card>
        ) : (
          filteredContent.map((content) => (
            <Card key={content.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">
                      {isRTL ? content.title_ar : content.title}
                    </CardTitle>
                    <CardDescription>
                      {content.key} • {content.category} • {texts.lastModified}: {formatDate(content.lastModified)}
                    </CardDescription>
                  </div>
                  <Button
                    onClick={() => handleEdit(content)}
                    variant="outline"
                    size="sm"
                    disabled={!content.editable}
                  >
                    {texts.edit}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div 
                  className="text-sm text-gray-600 dark:text-gray-400 line-clamp-3"
                  dangerouslySetInnerHTML={{ 
                    __html: isRTL ? content.content_ar : content.content 
                  }}
                />
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Edit Modal */}
      {selectedContent && editMode && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-4xl max-h-[90vh] overflow-hidden">
            <CardHeader>
              <CardTitle>
                {texts.edit} - {isRTL ? selectedContent.title_ar : selectedContent.title}
              </CardTitle>
            </CardHeader>
            <CardContent className="overflow-y-auto space-y-4">
              <div>
                <Label htmlFor="title">{texts.contentTitle}</Label>
                <Input
                  id="title"
                  value={isRTL ? selectedContent.title_ar : selectedContent.title}
                  onChange={(e) => setSelectedContent({
                    ...selectedContent,
                    [isRTL ? 'title_ar' : 'title']: e.target.value
                  })}
                />
              </div>

              <div>
                <Label htmlFor="content">{texts.contentText}</Label>
                <RichTextEditor
                  content={isRTL ? selectedContent.content_ar : selectedContent.content}
                  onChange={(newContent) => setSelectedContent({
                    ...selectedContent,
                    [isRTL ? 'content_ar' : 'content']: newContent
                  })}
                  lang={lang}
                  placeholder={`${texts.contentText}...`}
                  minHeight={300}
                />
              </div>

              <div className="flex justify-end space-x-2 pt-4 border-t border-gray-200 dark:border-gray-700">
                <Button onClick={handleCancel} variant="outline">
                  {texts.cancel}
                </Button>
                <Button onClick={handleSave} disabled={loading}>
                  {loading ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  ) : (
                    <CheckIcon className="h-4 w-4 mr-2" />
                  )}
                  {texts.save}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
