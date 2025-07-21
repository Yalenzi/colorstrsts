'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  PencilIcon,
  GlobeAltIcon,
  LanguageIcon,
  DocumentTextIcon,
  CheckIcon,
  XMarkIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

interface TextEditorModalProps {
  isRTL: boolean;
  lang: 'ar' | 'en';
}

interface SiteText {
  id: string;
  key: string;
  english: string;
  arabic: string;
  category: string;
  description: string;
}

const defaultTexts: SiteText[] = [
  {
    id: 'site-title',
    key: 'site.title',
    english: 'Chemical Tests Management',
    arabic: 'إدارة الاختبارات الكيميائية',
    category: 'general',
    description: 'Main site title'
  },
  {
    id: 'site-subtitle',
    key: 'site.subtitle',
    english: 'Add, edit and delete tests',
    arabic: 'إضافة وتحرير وحذف الاختبارات',
    category: 'general',
    description: 'Site subtitle/description'
  },
  {
    id: 'nav-home',
    key: 'nav.home',
    english: 'Home',
    arabic: 'الرئيسية',
    category: 'navigation',
    description: 'Home navigation link'
  },
  {
    id: 'nav-tests',
    key: 'nav.tests',
    english: 'Tests',
    arabic: 'الاختبارات',
    category: 'navigation',
    description: 'Tests navigation link'
  },
  {
    id: 'nav-admin',
    key: 'nav.admin',
    english: 'Admin',
    arabic: 'الإدارة',
    category: 'navigation',
    description: 'Admin navigation link'
  },
  {
    id: 'btn-add-new',
    key: 'buttons.addNew',
    english: 'Add New',
    arabic: 'إضافة جديد',
    category: 'buttons',
    description: 'Add new button text'
  },
  {
    id: 'btn-edit',
    key: 'buttons.edit',
    english: 'Edit',
    arabic: 'تحرير',
    category: 'buttons',
    description: 'Edit button text'
  },
  {
    id: 'btn-delete',
    key: 'buttons.delete',
    english: 'Delete',
    arabic: 'حذف',
    category: 'buttons',
    description: 'Delete button text'
  },
  {
    id: 'btn-save',
    key: 'buttons.save',
    english: 'Save',
    arabic: 'حفظ',
    category: 'buttons',
    description: 'Save button text'
  },
  {
    id: 'btn-cancel',
    key: 'buttons.cancel',
    english: 'Cancel',
    arabic: 'إلغاء',
    category: 'buttons',
    description: 'Cancel button text'
  },
  {
    id: 'msg-success',
    key: 'messages.success',
    english: 'Operation completed successfully',
    arabic: 'تمت العملية بنجاح',
    category: 'messages',
    description: 'Generic success message'
  },
  {
    id: 'msg-error',
    key: 'messages.error',
    english: 'An error occurred',
    arabic: 'حدث خطأ',
    category: 'messages',
    description: 'Generic error message'
  }
];

export default function TextEditorModal({ isRTL, lang }: TextEditorModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [texts, setTexts] = useState<SiteText[]>(defaultTexts);
  const [editingText, setEditingText] = useState<SiteText | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [filteredTexts, setFilteredTexts] = useState<SiteText[]>(texts);

  const t = {
    title: lang === 'ar' ? 'محرر النصوص الأساسية' : 'Basic Text Editor',
    subtitle: lang === 'ar' ? 'تحرير النصوص الأساسية للموقع' : 'Edit basic site texts',
    openEditor: lang === 'ar' ? 'فتح محرر النصوص' : 'Open Text Editor',
    search: lang === 'ar' ? 'البحث...' : 'Search...',
    category: lang === 'ar' ? 'الفئة' : 'Category',
    all: lang === 'ar' ? 'الكل' : 'All',
    general: lang === 'ar' ? 'عام' : 'General',
    navigation: lang === 'ar' ? 'التنقل' : 'Navigation',
    buttons: lang === 'ar' ? 'الأزرار' : 'Buttons',
    messages: lang === 'ar' ? 'الرسائل' : 'Messages',
    key: lang === 'ar' ? 'المفتاح' : 'Key',
    english: lang === 'ar' ? 'الإنجليزية' : 'English',
    arabic: lang === 'ar' ? 'العربية' : 'Arabic',
    description: lang === 'ar' ? 'الوصف' : 'Description',
    edit: lang === 'ar' ? 'تحرير' : 'Edit',
    save: lang === 'ar' ? 'حفظ' : 'Save',
    cancel: lang === 'ar' ? 'إلغاء' : 'Cancel',
    reset: lang === 'ar' ? 'إعادة تعيين' : 'Reset',
    editText: lang === 'ar' ? 'تحرير النص' : 'Edit Text',
    textSaved: lang === 'ar' ? 'تم حفظ النص بنجاح' : 'Text saved successfully',
    textsReset: lang === 'ar' ? 'تم إعادة تعيين النصوص' : 'Texts reset successfully'
  };

  useEffect(() => {
    // Load texts from localStorage
    const savedTexts = localStorage.getItem('site_texts');
    if (savedTexts) {
      try {
        const parsed = JSON.parse(savedTexts);
        setTexts(parsed);
      } catch (error) {
        console.error('Error loading saved texts:', error);
      }
    }
  }, []);

  useEffect(() => {
    // Filter texts based on search and category
    let filtered = texts;

    if (searchTerm) {
      filtered = filtered.filter(text =>
        text.key.toLowerCase().includes(searchTerm.toLowerCase()) ||
        text.english.toLowerCase().includes(searchTerm.toLowerCase()) ||
        text.arabic.includes(searchTerm) ||
        text.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(text => text.category === selectedCategory);
    }

    setFilteredTexts(filtered);
  }, [texts, searchTerm, selectedCategory]);

  const handleSaveText = (updatedText: SiteText) => {
    const updatedTexts = texts.map(text =>
      text.id === updatedText.id ? updatedText : text
    );
    setTexts(updatedTexts);
    localStorage.setItem('site_texts', JSON.stringify(updatedTexts));
    setEditingText(null);
    toast.success(t.textSaved);
  };

  const handleResetTexts = () => {
    setTexts(defaultTexts);
    localStorage.removeItem('site_texts');
    toast.success(t.textsReset);
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'general': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'navigation': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'buttons': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      case 'messages': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    }
  };

  return (
    <>
      {/* Trigger Button */}
      <Button
        onClick={() => setIsOpen(true)}
        variant="outline"
        className="flex items-center gap-2"
      >
        <DocumentTextIcon className="h-4 w-4" />
        {t.openEditor}
      </Button>

      {/* Main Dialog */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <DocumentTextIcon className="h-5 w-5" />
              {t.title}
            </DialogTitle>
            <DialogDescription>
              {t.subtitle}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Controls */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <Input
                  placeholder={t.search}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="flex gap-2">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
                >
                  <option value="all">{t.all}</option>
                  <option value="general">{t.general}</option>
                  <option value="navigation">{t.navigation}</option>
                  <option value="buttons">{t.buttons}</option>
                  <option value="messages">{t.messages}</option>
                </select>
                <Button
                  onClick={handleResetTexts}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <ArrowPathIcon className="h-4 w-4" />
                  {t.reset}
                </Button>
              </div>
            </div>

            {/* Texts List */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {filteredTexts.map((text) => (
                <Card key={text.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-sm font-mono text-gray-600 dark:text-gray-400">
                          {text.key}
                        </CardTitle>
                        <CardDescription className="mt-1">
                          {text.description}
                        </CardDescription>
                      </div>
                      <Badge className={getCategoryColor(text.category)}>
                        {t[text.category as keyof typeof t] || text.category}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <Label className="text-xs font-medium text-gray-500">
                        {t.english}
                      </Label>
                      <p className="text-sm mt-1">{text.english}</p>
                    </div>
                    <div>
                      <Label className="text-xs font-medium text-gray-500">
                        {t.arabic}
                      </Label>
                      <p className="text-sm mt-1" dir="rtl">{text.arabic}</p>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setEditingText(text)}
                      className="w-full flex items-center gap-2"
                    >
                      <PencilIcon className="h-3 w-3" />
                      {t.edit}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Text Dialog */}
      {editingText && (
        <EditTextDialog
          text={editingText}
          isOpen={!!editingText}
          onClose={() => setEditingText(null)}
          onSave={handleSaveText}
          lang={lang}
        />
      )}
    </>
  );
}

// Edit Text Dialog Component
interface EditTextDialogProps {
  text: SiteText;
  isOpen: boolean;
  onClose: () => void;
  onSave: (text: SiteText) => void;
  lang: 'ar' | 'en';
}

function EditTextDialog({ text, isOpen, onClose, onSave, lang }: EditTextDialogProps) {
  const [formData, setFormData] = useState({
    english: text.english,
    arabic: text.arabic,
    description: text.description
  });

  const t = {
    editText: lang === 'ar' ? 'تحرير النص' : 'Edit Text',
    english: lang === 'ar' ? 'النص الإنجليزي' : 'English Text',
    arabic: lang === 'ar' ? 'النص العربي' : 'Arabic Text',
    description: lang === 'ar' ? 'الوصف' : 'Description',
    save: lang === 'ar' ? 'حفظ' : 'Save',
    cancel: lang === 'ar' ? 'إلغاء' : 'Cancel'
  };

  const handleSave = () => {
    onSave({
      ...text,
      english: formData.english,
      arabic: formData.arabic,
      description: formData.description
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{t.editText}</DialogTitle>
          <DialogDescription>
            Key: <code className="bg-gray-100 px-2 py-1 rounded text-sm">{text.key}</code>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label htmlFor="english">{t.english}</Label>
            <Input
              id="english"
              value={formData.english}
              onChange={(e) => setFormData(prev => ({ ...prev, english: e.target.value }))}
              placeholder="English text..."
            />
          </div>

          <div>
            <Label htmlFor="arabic">{t.arabic}</Label>
            <Input
              id="arabic"
              value={formData.arabic}
              onChange={(e) => setFormData(prev => ({ ...prev, arabic: e.target.value }))}
              placeholder="النص العربي..."
              dir="rtl"
            />
          </div>

          <div>
            <Label htmlFor="description">{t.description}</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Description..."
              rows={2}
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={onClose}>
              {t.cancel}
            </Button>
            <Button onClick={handleSave}>
              {t.save}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
