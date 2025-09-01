'use client';

import React, { useState } from 'react';
import { Language } from '@/types';
import { Button } from '@/components/ui/button';
import EnhancedTestManagement from '@/components/admin/EnhancedTestManagement';
import ColorResultsManagement from '@/components/admin/ColorResultsManagement';
import DataMigrationPanel from '@/components/admin/DataMigrationPanel';
import SystemStatistics from '@/components/admin/SystemStatistics';
import TextEditorModal from '@/components/admin/TextEditorModal';


interface TestsManagementClientProps {
  lang: Language;
}

export default function TestsManagementClient({ lang }: TestsManagementClientProps) {
  const isRTL = lang === 'ar';
  const [activeView, setActiveView] = useState<'overview' | 'tests' | 'results' | 'migration' | 'statistics'>('overview');


  const renderContent = () => {
    switch (activeView) {
      case 'tests':
        return (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
            <EnhancedTestManagement
              lang={lang}
            />
          </div>
        );
      case 'results':
        return (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
            <ColorResultsManagement
              isRTL={isRTL}
              lang={lang}
            />
          </div>
        );
      case 'migration':
        return (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
            <DataMigrationPanel
              isRTL={isRTL}
              lang={lang}
            />
          </div>
        );
      case 'statistics':
        return (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
            <SystemStatistics
              isRTL={isRTL}
              lang={lang}
            />
          </div>
        );
      default:
        return (
          <>
            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                    <svg className="h-6 w-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="ml-4 rtl:mr-4 rtl:ml-0">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      {isRTL ? 'إجمالي الاختبارات' : 'Total Tests'}
                    </p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">15</p>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                    <svg className="h-6 w-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                    </svg>
                  </div>
                  <div className="ml-4 rtl:mr-4 rtl:ml-0">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      {isRTL ? 'النتائج اللونية' : 'Color Results'}
                    </p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">55</p>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                    <svg className="h-6 w-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                    </svg>
                  </div>
                  <div className="ml-4 rtl:mr-4 rtl:ml-0">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      {isRTL ? 'المستخدمين النشطين' : 'Active Users'}
                    </p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">24</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Management Options */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                  {isRTL ? 'إدارة الاختبارات' : 'Tests Management'}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  {isRTL ? 'إضافة وتحرير وحذف الاختبارات الكيميائية' : 'Add, edit, and delete chemical tests'}
                </p>
                <div className="space-y-2">
                  <Button
                    className="w-full"
                    variant="outline"
                    onClick={() => setActiveView('tests')}
                  >
                    {isRTL ? 'عرض جميع الاختبارات' : 'View All Tests'}
                  </Button>
                  <Button
                    className="w-full"
                    onClick={() => setActiveView('tests')}
                  >
                    {isRTL ? 'إضافة اختبار جديد' : 'Add New Test'}
                  </Button>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                  {isRTL ? 'إدارة النتائج' : 'Results Management'}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  {isRTL ? 'إدارة نتائج الألوان والتفسيرات' : 'Manage color results and interpretations'}
                </p>
                <div className="space-y-2">
                  <Button
                    className="w-full"
                    variant="outline"
                    onClick={() => setActiveView('results')}
                  >
                    {isRTL ? 'عرض النتائج' : 'View Results'}
                  </Button>
                  <Button
                    className="w-full"
                    onClick={() => setActiveView('results')}
                  >
                    {isRTL ? 'إضافة نتيجة جديدة' : 'Add New Result'}
                  </Button>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                  {isRTL ? 'نقل البيانات' : 'Data Migration'}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  {isRTL ? 'نقل ومزامنة البيانات بين المحلية و Firebase' : 'Transfer and sync data between Local and Firebase'}
                </p>
                <div className="space-y-2">
                  <Button
                    className="w-full"
                    variant="outline"
                    onClick={() => setActiveView('migration')}
                  >
                    {isRTL ? 'مقارنة البيانات' : 'Compare Data'}
                  </Button>
                  <Button
                    className="w-full"
                    onClick={() => setActiveView('migration')}
                  >
                    {isRTL ? 'نقل البيانات' : 'Migrate Data'}
                  </Button>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                  {isRTL ? 'إحصائيات النظام' : 'System Statistics'}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  {isRTL ? 'أرقام وإحصائيات شاملة للنظام' : 'Comprehensive system numbers and statistics'}
                </p>
                <div className="space-y-2">
                  <Button
                    className="w-full"
                    variant="outline"
                    onClick={() => setActiveView('statistics')}
                  >
                    {isRTL ? 'عرض الإحصائيات' : 'View Statistics'}
                  </Button>
                  <Button
                    className="w-full"
                    onClick={() => setActiveView('statistics')}
                  >
                    {isRTL ? 'إعادة حساب الأرقام' : 'Recalculate Numbers'}
                  </Button>
                </div>
              </div>
            </div>
          </>
        );
    }
  };

  return (
    <div className={`min-h-screen bg-gray-50 ${isRTL ? 'rtl' : 'ltr'}`}>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header with Navigation */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                  {isRTL ? 'إدارة الاختبارات' : 'Tests Management'}
                </h1>
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                  {activeView === 'tests'
                    ? (isRTL ? 'إدارة الاختبارات الكيميائية' : 'Manage chemical tests')
                    : activeView === 'results'
                    ? (isRTL ? 'إدارة نتائج الألوان' : 'Manage color results')
                    : activeView === 'migration'
                    ? (isRTL ? 'نقل ومزامنة البيانات' : 'Data migration and sync')
                    : activeView === 'statistics'
                    ? (isRTL ? 'إحصائيات وأرقام النظام' : 'System statistics and numbers')
                    : (isRTL ? 'نظرة عامة على النظام' : 'System overview')
                  }
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                <Button
                  variant={activeView === 'overview' ? 'default' : 'outline'}
                  onClick={() => setActiveView('overview')}
                >
                  {isRTL ? 'النظرة العامة' : 'Overview'}
                </Button>
                <Button
                  variant={activeView === 'tests' ? 'default' : 'outline'}
                  onClick={() => setActiveView('tests')}
                >
                  {isRTL ? 'الاختبارات' : 'Tests'}
                </Button>
                <Button
                  variant={activeView === 'results' ? 'default' : 'outline'}
                  onClick={() => setActiveView('results')}
                >
                  {isRTL ? 'النتائج' : 'Results'}
                </Button>
                <Button
                  variant={activeView === 'migration' ? 'default' : 'outline'}
                  onClick={() => setActiveView('migration')}
                >
                  {isRTL ? 'نقل البيانات' : 'Data Migration'}
                </Button>
                <Button
                  variant={activeView === 'statistics' ? 'default' : 'outline'}
                  onClick={() => setActiveView('statistics')}
                >
                  {isRTL ? 'الإحصائيات' : 'Statistics'}
                </Button>
                <TextEditorModal
                  isRTL={isRTL}
                  lang={lang}
                />
              </div>
            </div>
          </div>

          {/* Dynamic Content */}
          {renderContent()}
        </div>
      </div>
    </div>
  );
}

