'use client';

import React, { useState } from 'react';
import { Language } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { 
  SunIcon, 
  MoonIcon, 
  BeakerIcon, 
  ExclamationTriangleIcon,
  CheckCircleIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';

interface DarkModeTestPageProps {
  params: { lang: Language };
}

export default function DarkModeTestPage({ params }: DarkModeTestPageProps) {
  const lang = params.lang;
  const [inputValue, setInputValue] = useState('');

  const isRTL = lang === 'ar';

  const texts = {
    ar: {
      title: 'اختبار التوافق مع الوضع المظلم',
      description: 'صفحة اختبار شاملة للتأكد من توافق جميع المكونات مع الوضع المظلم',
      themeToggle: 'تبديل الثيم',
      components: 'المكونات',
      buttons: 'الأزرار',
      inputs: 'حقول الإدخال',
      cards: 'البطاقات',
      badges: 'الشارات',
      colors: 'الألوان',
      typography: 'الطباعة',
      status: 'حالات الحالة',
      placeholder: 'اكتب شيئاً هنا...',
      primary: 'أساسي',
      secondary: 'ثانوي',
      success: 'نجح',
      warning: 'تحذير',
      error: 'خطأ',
      info: 'معلومات',
      high: 'عالي',
      medium: 'متوسط',
      low: 'منخفض',
      testResults: 'نتائج الاختبار',
      allGood: 'جميع المكونات تعمل بشكل صحيح',
      instructions: 'التعليمات',
      step1: 'استخدم زر تبديل الثيم أعلاه للتبديل بين الأوضاع',
      step2: 'تحقق من وضوح جميع النصوص والألوان',
      step3: 'تأكد من أن جميع الأزرار والحقول قابلة للاستخدام',
      step4: 'اختبر التفاعل مع جميع العناصر'
    },
    en: {
      title: 'Dark Mode Compatibility Test',
      description: 'Comprehensive test page to ensure all components work properly with dark mode',
      themeToggle: 'Theme Toggle',
      components: 'Components',
      buttons: 'Buttons',
      inputs: 'Inputs',
      cards: 'Cards',
      badges: 'Badges',
      colors: 'Colors',
      typography: 'Typography',
      status: 'Status States',
      placeholder: 'Type something here...',
      primary: 'Primary',
      secondary: 'Secondary',
      success: 'Success',
      warning: 'Warning',
      error: 'Error',
      info: 'Info',
      high: 'High',
      medium: 'Medium',
      low: 'Low',
      testResults: 'Test Results',
      allGood: 'All components working correctly',
      instructions: 'Instructions',
      step1: 'Use the theme toggle above to switch between modes',
      step2: 'Check that all text and colors are clearly visible',
      step3: 'Ensure all buttons and inputs are usable',
      step4: 'Test interaction with all elements'
    }
  };

  const t = texts[lang];

  return (
    <div className={`min-h-screen bg-gray-50 dark:bg-gray-950 p-4 ${isRTL ? 'rtl' : 'ltr'}`} dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="flex items-center justify-center space-x-4 rtl:space-x-reverse mb-4">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              {t.title}
            </h1>
            <ThemeToggle />
          </div>
          <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            {t.description}
          </p>
        </div>

        {/* Instructions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <InformationCircleIcon className="h-5 w-5 mr-2 rtl:ml-2 rtl:mr-0" />
              {t.instructions}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="space-y-2 list-decimal list-inside">
              <li className="text-gray-700 dark:text-gray-300">{t.step1}</li>
              <li className="text-gray-700 dark:text-gray-300">{t.step2}</li>
              <li className="text-gray-700 dark:text-gray-300">{t.step3}</li>
              <li className="text-gray-700 dark:text-gray-300">{t.step4}</li>
            </ol>
          </CardContent>
        </Card>

        {/* Buttons Test */}
        <Card>
          <CardHeader>
            <CardTitle>{t.buttons}</CardTitle>
            <CardDescription>Testing all button variants in dark mode</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Button variant="default">{t.primary}</Button>
              <Button variant="secondary">{t.secondary}</Button>
              <Button variant="outline">Outline</Button>
              <Button variant="ghost">Ghost</Button>
              <Button variant="link">Link</Button>
              <Button variant="success">{t.success}</Button>
              <Button variant="warning">{t.warning}</Button>
              <Button variant="scientific">Scientific</Button>
            </div>
          </CardContent>
        </Card>

        {/* Inputs Test */}
        <Card>
          <CardHeader>
            <CardTitle>{t.inputs}</CardTitle>
            <CardDescription>Testing input fields and form elements</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Input 
                placeholder={t.placeholder}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
              />
              <Input placeholder="Disabled input" disabled />
              <Input placeholder="Error state" className="border-red-500 dark:border-red-400" />
            </div>
          </CardContent>
        </Card>

        {/* Badges Test */}
        <Card>
          <CardHeader>
            <CardTitle>{t.badges}</CardTitle>
            <CardDescription>Testing badge variants and colors</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              <Badge variant="default">{t.primary}</Badge>
              <Badge variant="secondary">{t.secondary}</Badge>
              <Badge variant="outline">Outline</Badge>
              <Badge variant="destructive">{t.error}</Badge>
              <Badge className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300">
                {t.success}
              </Badge>
              <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300">
                {t.warning}
              </Badge>
              <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300">
                {t.info}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Status Colors Test */}
        <Card>
          <CardHeader>
            <CardTitle>{t.status}</CardTitle>
            <CardDescription>Testing status colors and states</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg">
                <div className="flex items-center">
                  <CheckCircleIcon className="h-5 w-5 text-green-600 dark:text-green-400 mr-2" />
                  <span className="text-green-800 dark:text-green-300 font-medium">{t.success}</span>
                </div>
                <p className="text-green-700 dark:text-green-400 text-sm mt-1">
                  This is a success message in dark mode
                </p>
              </div>

              <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg">
                <div className="flex items-center">
                  <ExclamationTriangleIcon className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mr-2" />
                  <span className="text-yellow-800 dark:text-yellow-300 font-medium">{t.warning}</span>
                </div>
                <p className="text-yellow-700 dark:text-yellow-400 text-sm mt-1">
                  This is a warning message in dark mode
                </p>
              </div>

              <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg">
                <div className="flex items-center">
                  <ExclamationTriangleIcon className="h-5 w-5 text-red-600 dark:text-red-400 mr-2" />
                  <span className="text-red-800 dark:text-red-300 font-medium">{t.error}</span>
                </div>
                <p className="text-red-700 dark:text-red-400 text-sm mt-1">
                  This is an error message in dark mode
                </p>
              </div>

              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg">
                <div className="flex items-center">
                  <InformationCircleIcon className="h-5 w-5 text-blue-600 dark:text-blue-400 mr-2" />
                  <span className="text-blue-800 dark:text-blue-300 font-medium">{t.info}</span>
                </div>
                <p className="text-blue-700 dark:text-blue-400 text-sm mt-1">
                  This is an info message in dark mode
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Typography Test */}
        <Card>
          <CardHeader>
            <CardTitle>{t.typography}</CardTitle>
            <CardDescription>Testing text hierarchy and readability</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100">Heading 1</h1>
              <h2 className="text-3xl font-semibold text-gray-800 dark:text-gray-200">Heading 2</h2>
              <h3 className="text-2xl font-medium text-gray-700 dark:text-gray-300">Heading 3</h3>
              <p className="text-gray-600 dark:text-gray-400">
                This is regular paragraph text. It should be easily readable in both light and dark modes.
                The contrast should be sufficient for accessibility standards.
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-500">
                This is smaller text that might be used for captions or secondary information.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Scientific Theme Test */}
        <Card>
          <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20">
            <CardTitle className="flex items-center">
              <BeakerIcon className="h-6 w-6 mr-2 rtl:ml-2 rtl:mr-0 text-blue-600 dark:text-blue-400" />
              Scientific Theme Test
            </CardTitle>
            <CardDescription>Testing scientific/laboratory theme colors</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-700 rounded-lg">
                <h4 className="font-semibold text-purple-800 dark:text-purple-300 mb-2">Chemical Components</h4>
                <ul className="space-y-1">
                  <li className="text-purple-700 dark:text-purple-300">• Marquis Reagent</li>
                  <li className="text-purple-700 dark:text-purple-300">• Sulfuric Acid</li>
                  <li className="text-purple-700 dark:text-purple-300">• Formaldehyde</li>
                </ul>
              </div>

              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg">
                <h4 className="font-semibold text-blue-800 dark:text-blue-300 mb-2">Test Instructions</h4>
                <ol className="space-y-1 list-decimal list-inside">
                  <li className="text-blue-700 dark:text-blue-300">Add sample to plate</li>
                  <li className="text-blue-700 dark:text-blue-300">Add 2-3 drops of reagent</li>
                  <li className="text-blue-700 dark:text-blue-300">Observe color change</li>
                </ol>
              </div>

              <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg">
                <h4 className="font-semibold text-red-800 dark:text-red-300 mb-2">Safety Warnings</h4>
                <ul className="space-y-1">
                  <li className="text-red-700 dark:text-red-300">⚠️ Wear protective equipment</li>
                  <li className="text-red-700 dark:text-red-300">⚠️ Avoid skin contact</li>
                  <li className="text-red-700 dark:text-red-300">⚠️ Use in ventilated area</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Test Results */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-green-600 dark:text-green-400">
              <CheckCircleIcon className="h-6 w-6 mr-2 rtl:ml-2 rtl:mr-0" />
              {t.testResults}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-green-700 dark:text-green-300 text-lg">
              ✅ {t.allGood}
            </p>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              If you can see this message clearly and all components above look good in both light and dark modes, 
              then the dark mode compatibility is working correctly.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
