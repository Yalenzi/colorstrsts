'use client';

import React, { useState } from 'react';
import { useTheme, CustomTheme, themeUtils } from './ThemeProvider';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  SunIcon,
  MoonIcon,
  PaletteIcon,
  CheckIcon,
  SwatchIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';

interface ThemeControllerProps {
  lang?: 'ar' | 'en';
  className?: string;
}

export function ThemeController({ lang = 'en', className = '' }: ThemeControllerProps) {
  const { mode, customTheme, toggleMode, setCustomTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const isRTL = lang === 'ar';

  const texts = {
    title: isRTL ? 'إعدادات الثيم' : 'Theme Settings',
    description: isRTL ? 'تخصيص مظهر لوحة التحكم' : 'Customize dashboard appearance',
    lightMode: isRTL ? 'الوضع الفاتح' : 'Light Mode',
    darkMode: isRTL ? 'الوضع المظلم' : 'Dark Mode',
    colorThemes: isRTL ? 'ألوان الثيم' : 'Color Themes',
    currentTheme: isRTL ? 'الثيم الحالي' : 'Current Theme',
    preview: isRTL ? 'معاينة' : 'Preview',
    apply: isRTL ? 'تطبيق' : 'Apply',
    reset: isRTL ? 'إعادة تعيين' : 'Reset'
  };

  const handleThemeChange = (theme: CustomTheme) => {
    setCustomTheme(theme);
  };

  const resetToDefault = () => {
    setCustomTheme('blue');
  };

  return (
    <div className={`relative ${className}`}>
      {/* Theme Toggle Button */}
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-lg border-2 border-gray-200 hover:border-gray-300 transition-all duration-200"
        title={texts.title}
      >
        <PaletteIcon className="h-5 w-5" />
        <SparklesIcon className="h-3 w-3 absolute -top-1 -right-1 text-blue-500" />
      </Button>

      {/* Theme Panel */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Panel */}
          <Card className={`absolute ${isRTL ? 'left-0' : 'right-0'} top-12 w-80 z-50 shadow-xl border-2`}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <PaletteIcon className="h-5 w-5 text-blue-600" />
                    {texts.title}
                  </CardTitle>
                  <CardDescription className="text-sm mt-1">
                    {texts.description}
                  </CardDescription>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsOpen(false)}
                  className="h-8 w-8 p-0"
                >
                  ×
                </Button>
              </div>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Mode Toggle */}
              <div className="space-y-3">
                <h4 className="font-medium text-sm text-gray-700 dark:text-gray-300">
                  {mode === 'light' ? texts.lightMode : texts.darkMode}
                </h4>
                <div className="flex items-center gap-2">
                  <Button
                    variant={mode === 'light' ? 'default' : 'outline'}
                    size="sm"
                    onClick={toggleMode}
                    className="flex-1 justify-center gap-2"
                  >
                    <SunIcon className="h-4 w-4" />
                    {texts.lightMode}
                  </Button>
                  <Button
                    variant={mode === 'dark' ? 'default' : 'outline'}
                    size="sm"
                    onClick={toggleMode}
                    className="flex-1 justify-center gap-2"
                  >
                    <MoonIcon className="h-4 w-4" />
                    {texts.darkMode}
                  </Button>
                </div>
              </div>

              {/* Color Themes */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-sm text-gray-700 dark:text-gray-300">
                    {texts.colorThemes}
                  </h4>
                  <Badge variant="secondary" className="text-xs">
                    {texts.currentTheme}: {themeUtils.themePresets[customTheme][isRTL ? 'name_ar' : 'name']}
                  </Badge>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {Object.entries(themeUtils.themePresets).map(([key, preset]) => (
                    <button
                      key={key}
                      onClick={() => handleThemeChange(key as CustomTheme)}
                      className={`
                        relative p-3 rounded-lg border-2 transition-all duration-200 text-left
                        ${customTheme === key 
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                        }
                      `}
                    >
                      {/* Color Preview */}
                      <div className="flex items-center gap-2 mb-2">
                        <div 
                          className="w-4 h-4 rounded-full border-2 border-white shadow-sm"
                          style={{ backgroundColor: preset.primary }}
                        />
                        <span className="font-medium text-sm">
                          {preset[isRTL ? 'name_ar' : 'name']}
                        </span>
                        {customTheme === key && (
                          <CheckIcon className="h-4 w-4 text-blue-600 ml-auto" />
                        )}
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {preset[isRTL ? 'description_ar' : 'description']}
                      </p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Preview Section */}
              <div className="space-y-3">
                <h4 className="font-medium text-sm text-gray-700 dark:text-gray-300">
                  {texts.preview}
                </h4>
                <div className="p-3 rounded-lg border bg-gray-50 dark:bg-gray-800">
                  <div className="flex items-center gap-2 mb-2">
                    <div 
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: themeUtils.themePresets[customTheme].primary }}
                    />
                    <span className="text-sm font-medium">Sample Button</span>
                  </div>
                  <div className="flex gap-2">
                    <div 
                      className="px-3 py-1 rounded text-xs text-white"
                      style={{ backgroundColor: themeUtils.themePresets[customTheme].primary }}
                    >
                      Primary
                    </div>
                    <div className="px-3 py-1 rounded text-xs bg-gray-200 text-gray-700">
                      Secondary
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-2 border-t">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={resetToDefault}
                  className="flex-1"
                >
                  {texts.reset}
                </Button>
                <Button
                  size="sm"
                  onClick={() => setIsOpen(false)}
                  className="flex-1"
                >
                  {texts.apply}
                </Button>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}

// Quick theme toggle component
export function QuickThemeToggle({ lang = 'en' }: { lang?: 'ar' | 'en' }) {
  const { mode, toggleMode } = useTheme();
  const isRTL = lang === 'ar';

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={toggleMode}
      className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
      title={mode === 'light' ? (isRTL ? 'تبديل للوضع المظلم' : 'Switch to dark mode') : (isRTL ? 'تبديل للوضع الفاتح' : 'Switch to light mode')}
    >
      {mode === 'light' ? (
        <MoonIcon className="h-5 w-5" />
      ) : (
        <SunIcon className="h-5 w-5" />
      )}
    </Button>
  );
}

// Theme status indicator
export function ThemeStatusIndicator({ lang = 'en' }: { lang?: 'ar' | 'en' }) {
  const { mode, customTheme } = useTheme();
  const isRTL = lang === 'ar';

  return (
    <div className="flex items-center gap-2 text-xs text-gray-500">
      <div className="flex items-center gap-1">
        {mode === 'light' ? <SunIcon className="h-3 w-3" /> : <MoonIcon className="h-3 w-3" />}
        <span>{mode === 'light' ? (isRTL ? 'فاتح' : 'Light') : (isRTL ? 'مظلم' : 'Dark')}</span>
      </div>
      <span>•</span>
      <div className="flex items-center gap-1">
        <div 
          className="w-2 h-2 rounded-full"
          style={{ backgroundColor: themeUtils.themePresets[customTheme].primary }}
        />
        <span>{themeUtils.themePresets[customTheme][isRTL ? 'name_ar' : 'name']}</span>
      </div>
    </div>
  );
}
