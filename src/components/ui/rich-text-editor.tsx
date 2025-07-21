'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Language } from '@/types';
import { Button } from '@/components/ui/button';
import { 
  BoldIcon,
  ItalicIcon,
  UnderlineIcon,
  ListBulletIcon,
  NumberedListIcon,
  LinkIcon,
  PhotoIcon,
  CodeBracketIcon
} from '@heroicons/react/24/outline';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  lang: Language;
  className?: string;
  minHeight?: number;
}

export function RichTextEditor({ 
  value, 
  onChange, 
  placeholder, 
  lang, 
  className = '',
  minHeight = 200 
}: RichTextEditorProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [selectedText, setSelectedText] = useState('');
  const editorRef = useRef<HTMLDivElement>(null);
  const isRTL = lang === 'ar';

  useEffect(() => {
    if (editorRef.current && value !== editorRef.current.innerHTML) {
      editorRef.current.innerHTML = value;
    }
  }, [value]);

  const handleInput = () => {
    if (editorRef.current) {
      const content = editorRef.current.innerHTML;
      onChange(content);
    }
  };

  const handleSelectionChange = () => {
    const selection = window.getSelection();
    if (selection && selection.toString()) {
      setSelectedText(selection.toString());
    } else {
      setSelectedText('');
    }
  };

  const execCommand = (command: string, value?: string) => {
    document.execCommand(command, false, value);
    if (editorRef.current) {
      editorRef.current.focus();
      handleInput();
    }
  };

  const insertLink = () => {
    const url = prompt(lang === 'ar' ? 'أدخل رابط URL:' : 'Enter URL:');
    if (url) {
      execCommand('createLink', url);
    }
  };

  const insertImage = () => {
    const url = prompt(lang === 'ar' ? 'أدخل رابط الصورة:' : 'Enter image URL:');
    if (url) {
      execCommand('insertImage', url);
    }
  };

  const formatText = (format: string) => {
    switch (format) {
      case 'bold':
        execCommand('bold');
        break;
      case 'italic':
        execCommand('italic');
        break;
      case 'underline':
        execCommand('underline');
        break;
      case 'unorderedList':
        execCommand('insertUnorderedList');
        break;
      case 'orderedList':
        execCommand('insertOrderedList');
        break;
      case 'link':
        insertLink();
        break;
      case 'image':
        insertImage();
        break;
      case 'code':
        execCommand('formatBlock', 'pre');
        break;
      default:
        break;
    }
  };

  const toolbarButtons = [
    { 
      id: 'bold', 
      icon: BoldIcon, 
      title: lang === 'ar' ? 'غامق' : 'Bold',
      action: () => formatText('bold')
    },
    { 
      id: 'italic', 
      icon: ItalicIcon, 
      title: lang === 'ar' ? 'مائل' : 'Italic',
      action: () => formatText('italic')
    },
    { 
      id: 'underline', 
      icon: UnderlineIcon, 
      title: lang === 'ar' ? 'تحته خط' : 'Underline',
      action: () => formatText('underline')
    },
    { 
      id: 'unorderedList', 
      icon: ListBulletIcon, 
      title: lang === 'ar' ? 'قائمة نقطية' : 'Bullet List',
      action: () => formatText('unorderedList')
    },
    { 
      id: 'orderedList', 
      icon: NumberedListIcon, 
      title: lang === 'ar' ? 'قائمة مرقمة' : 'Numbered List',
      action: () => formatText('orderedList')
    },
    { 
      id: 'link', 
      icon: LinkIcon, 
      title: lang === 'ar' ? 'رابط' : 'Link',
      action: () => formatText('link')
    },
    { 
      id: 'image', 
      icon: PhotoIcon, 
      title: lang === 'ar' ? 'صورة' : 'Image',
      action: () => formatText('image')
    },
    { 
      id: 'code', 
      icon: CodeBracketIcon, 
      title: lang === 'ar' ? 'كود' : 'Code',
      action: () => formatText('code')
    }
  ];

  const headingOptions = [
    { value: 'p', label: lang === 'ar' ? 'نص عادي' : 'Normal Text' },
    { value: 'h1', label: lang === 'ar' ? 'عنوان 1' : 'Heading 1' },
    { value: 'h2', label: lang === 'ar' ? 'عنوان 2' : 'Heading 2' },
    { value: 'h3', label: lang === 'ar' ? 'عنوان 3' : 'Heading 3' },
    { value: 'h4', label: lang === 'ar' ? 'عنوان 4' : 'Heading 4' }
  ];

  return (
    <div className={`border border-gray-300 rounded-lg overflow-hidden ${className}`}>
      {/* Toolbar */}
      <div className="bg-gray-50 dark:bg-gray-800 border-b border-gray-300 p-2">
        <div className="flex items-center space-x-1 rtl:space-x-reverse flex-wrap gap-1">
          {/* Heading Selector */}
          <select
            onChange={(e) => execCommand('formatBlock', e.target.value)}
            className="px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
            title={lang === 'ar' ? 'نوع النص' : 'Text Type'}
          >
            {headingOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          <div className="w-px h-6 bg-gray-300 mx-1" />

          {/* Format Buttons */}
          {toolbarButtons.map(button => (
            <Button
              key={button.id}
              variant="ghost"
              size="sm"
              onClick={button.action}
              title={button.title}
              className="h-8 w-8 p-0"
            >
              <button.icon className="h-4 w-4" />
            </Button>
          ))}

          <div className="w-px h-6 bg-gray-300 mx-1" />

          {/* Color Picker */}
          <input
            type="color"
            onChange={(e) => execCommand('foreColor', e.target.value)}
            className="w-8 h-8 border border-gray-300 rounded cursor-pointer"
            title={lang === 'ar' ? 'لون النص' : 'Text Color'}
          />

          <input
            type="color"
            onChange={(e) => execCommand('hiliteColor', e.target.value)}
            className="w-8 h-8 border border-gray-300 rounded cursor-pointer"
            title={lang === 'ar' ? 'لون الخلفية' : 'Background Color'}
          />
        </div>
      </div>

      {/* Editor */}
      <div
        ref={editorRef}
        contentEditable
        onInput={handleInput}
        onMouseUp={handleSelectionChange}
        onKeyUp={handleSelectionChange}
        onFocus={() => setIsEditing(true)}
        onBlur={() => setIsEditing(false)}
        className={`
          p-4 outline-none overflow-y-auto
          ${isRTL ? 'text-right' : 'text-left'}
          prose prose-sm max-w-none
          dark:prose-invert
          focus:ring-2 focus:ring-blue-500 focus:ring-inset
        `}
        style={{ 
          minHeight: `${minHeight}px`,
          direction: isRTL ? 'rtl' : 'ltr'
        }}
        dir={isRTL ? 'rtl' : 'ltr'}
        suppressContentEditableWarning={true}
        data-placeholder={placeholder}
      />

      {/* Status Bar */}
      <div className="bg-gray-50 dark:bg-gray-800 border-t border-gray-300 px-4 py-2 text-xs text-gray-500">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4 rtl:space-x-reverse">
            <span>
              {lang === 'ar' ? 'الأحرف:' : 'Characters:'} {value.replace(/<[^>]*>/g, '').length}
            </span>
            <span>
              {lang === 'ar' ? 'الكلمات:' : 'Words:'} {value.replace(/<[^>]*>/g, '').split(/\s+/).filter(word => word.length > 0).length}
            </span>
          </div>
          
          {selectedText && (
            <span>
              {lang === 'ar' ? 'محدد:' : 'Selected:'} {selectedText.length} {lang === 'ar' ? 'حرف' : 'chars'}
            </span>
          )}
        </div>
      </div>

      {/* Help Text */}
      {!value && !isEditing && (
        <div className="absolute inset-0 flex items-start justify-start pointer-events-none">
          <div className="p-4 text-gray-400 italic">
            {placeholder || (lang === 'ar' ? 'ابدأ الكتابة...' : 'Start typing...')}
          </div>
        </div>
      )}
    </div>
  );
}

// Additional utility component for simple text editing
export function SimpleTextEditor({ 
  value, 
  onChange, 
  placeholder, 
  lang,
  rows = 4 
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  lang: Language;
  rows?: number;
}) {
  const isRTL = lang === 'ar';

  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      rows={rows}
      className={`
        w-full px-3 py-2 border border-gray-300 rounded-md
        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
        resize-vertical
        ${isRTL ? 'text-right' : 'text-left'}
      `}
      dir={isRTL ? 'rtl' : 'ltr'}
    />
  );
}
