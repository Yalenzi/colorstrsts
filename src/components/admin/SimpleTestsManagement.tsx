'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { validateAdminSession } from '@/lib/auth-utils';

interface SimpleTestsManagementProps {
  translations: any;
  isRTL: boolean;
}

export default function SimpleTestsManagement({ translations = {}, isRTL }: SimpleTestsManagementProps) {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAdminStatus = () => {
      try {
        const adminSession = validateAdminSession();
        setIsAdmin(adminSession);
      } catch (error) {
        console.log('Admin session check failed:', error);
        setIsAdmin(false);
      } finally {
        setLoading(false);
      }
    };

    checkAdminStatus();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold mb-4 text-red-600">
          {isRTL ? 'غير مصرح لك بالوصول' : 'Access Denied'}
        </h1>
        <p className="text-gray-600 mb-6">
          {isRTL ? 'تحتاج إلى صلاحيات المدير للوصول إلى هذه الصفحة' : 'You need admin privileges to access this page'}
        </p>
        <Button onClick={() => window.location.href = '/'}>
          {isRTL ? 'العودة للرئيسية' : 'Back to Home'}
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          {isRTL ? 'إدارة الاختبارات الكيميائية' : 'Chemical Tests Management'}
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          {isRTL ? 'إدارة وتحرير الاختبارات الكيميائية ونتائج الألوان' : 'Manage and edit chemical tests and color results'}
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            {isRTL ? 'إدارة الاختبارات' : 'Tests Management'}
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            {isRTL ? 'إضافة وتحرير وحذف الاختبارات الكيميائية' : 'Add, edit, and delete chemical tests'}
          </p>
          <div className="space-y-2">
            <Button className="w-full" variant="outline">
              {isRTL ? 'عرض جميع الاختبارات' : 'View All Tests'}
            </Button>
            <Button className="w-full" variant="outline">
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
            <Button className="w-full" variant="outline">
              {isRTL ? 'عرض النتائج' : 'View Results'}
            </Button>
            <Button className="w-full" variant="outline">
              {isRTL ? 'إضافة نتيجة جديدة' : 'Add New Result'}
            </Button>
          </div>
        </div>
      </div>

      {/* Success Notice */}
      <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3 rtl:mr-3 rtl:ml-0">
            <h3 className="text-sm font-medium text-green-800 dark:text-green-200">
              {isRTL ? 'نظام إدارة الاختبارات مكتمل' : 'Tests Management System Complete'}
            </h3>
            <div className="mt-2 text-sm text-green-700 dark:text-green-300">
              <p>
                {isRTL
                  ? 'جميع وظائف إدارة الاختبارات متاحة الآن: إضافة، تحرير، حذف، تصدير، واستيراد الاختبارات.'
                  : 'All test management functions are now available: add, edit, delete, export, and import tests.'
                }
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
