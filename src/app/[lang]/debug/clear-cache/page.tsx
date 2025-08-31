'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrashIcon, ArrowPathIcon, CheckIcon } from '@heroicons/react/24/outline';
import { databaseColorTestService } from '@/lib/database-color-test-service';
import { initializeLocalStorage } from '@/lib/local-data-service';

interface ClearCachePageProps {
  params: {
    lang: 'ar' | 'en';
  };
}

export default function ClearCachePage({ params }: ClearCachePageProps) {
  const { lang } = params;
  const [clearing, setClearing] = useState(false);
  const [reloading, setReloading] = useState(false);
  const [cleared, setCleared] = useState(false);
  const [reloaded, setReloaded] = useState(false);

  const clearAllCache = async () => {
    setClearing(true);
    try {
      // Clear all localStorage data
      const keysToRemove = [
        'chemical_tests_local',
        'chemical_tests_db', 
        'chemical_tests_data',
        'database_color_tests',
        'color_results_local',
        'subscription_settings_local',
        'user_preferences',
        'test_results'
      ];

      keysToRemove.forEach(key => {
        localStorage.removeItem(key);
        console.log(`🗑️ Removed ${key} from localStorage`);
      });

      setCleared(true);
      console.log('✅ All cache cleared successfully');
    } catch (error) {
      console.error('❌ Error clearing cache:', error);
    } finally {
      setClearing(false);
    }
  };

  const forceReloadData = async () => {
    setReloading(true);
    try {
      // Force reload from database service
      await databaseColorTestService.forceReload();
      
      // Reinitialize local storage
      initializeLocalStorage();
      
      // Get fresh data
      const tests = await databaseColorTestService.getAllTests();
      console.log(`🔄 Force reloaded ${tests.length} tests`);
      
      setReloaded(true);
      console.log('✅ Data reloaded successfully');
    } catch (error) {
      console.error('❌ Error reloading data:', error);
    } finally {
      setReloading(false);
    }
  };

  const refreshPage = () => {
    window.location.reload();
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <div className="space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            {lang === 'ar' ? 'مسح ذاكرة التخزين المؤقت' : 'Clear Cache & Reload Data'}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {lang === 'ar' 
              ? 'استخدم هذه الأدوات لحل مشاكل تحميل البيانات'
              : 'Use these tools to fix data loading issues'
            }
          </p>
        </div>

        {/* Clear Cache */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 rtl:space-x-reverse">
              <TrashIcon className="h-5 w-5" />
              <span>
                {lang === 'ar' ? 'مسح ذاكرة التخزين المؤقت' : 'Clear Local Storage Cache'}
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {lang === 'ar'
                ? 'يمسح جميع البيانات المحفوظة محلياً ويجبر التطبيق على تحميل البيانات الجديدة'
                : 'Clears all locally stored data and forces the app to load fresh data'
              }
            </p>
            <Button 
              onClick={clearAllCache} 
              disabled={clearing}
              variant={cleared ? "default" : "destructive"}
              className="w-full"
            >
              {clearing ? (
                <ArrowPathIcon className="h-4 w-4 mr-2 animate-spin" />
              ) : cleared ? (
                <CheckIcon className="h-4 w-4 mr-2" />
              ) : (
                <TrashIcon className="h-4 w-4 mr-2" />
              )}
              {clearing 
                ? (lang === 'ar' ? 'جاري المسح...' : 'Clearing...')
                : cleared 
                ? (lang === 'ar' ? 'تم المسح' : 'Cleared')
                : (lang === 'ar' ? 'مسح ذاكرة التخزين' : 'Clear Cache')
              }
            </Button>
          </CardContent>
        </Card>

        {/* Force Reload */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 rtl:space-x-reverse">
              <ArrowPathIcon className="h-5 w-5" />
              <span>
                {lang === 'ar' ? 'إعادة تحميل البيانات' : 'Force Reload Data'}
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {lang === 'ar'
                ? 'يجبر إعادة تحميل البيانات من ملفات قاعدة البيانات الأصلية'
                : 'Forces reload of data from the original database files'
              }
            </p>
            <Button 
              onClick={forceReloadData} 
              disabled={reloading}
              variant={reloaded ? "default" : "outline"}
              className="w-full"
            >
              {reloading ? (
                <ArrowPathIcon className="h-4 w-4 mr-2 animate-spin" />
              ) : reloaded ? (
                <CheckIcon className="h-4 w-4 mr-2" />
              ) : (
                <ArrowPathIcon className="h-4 w-4 mr-2" />
              )}
              {reloading 
                ? (lang === 'ar' ? 'جاري إعادة التحميل...' : 'Reloading...')
                : reloaded 
                ? (lang === 'ar' ? 'تم إعادة التحميل' : 'Reloaded')
                : (lang === 'ar' ? 'إعادة تحميل البيانات' : 'Force Reload Data')
              }
            </Button>
          </CardContent>
        </Card>

        {/* Refresh Page */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 rtl:space-x-reverse">
              <ArrowPathIcon className="h-5 w-5" />
              <span>
                {lang === 'ar' ? 'تحديث الصفحة' : 'Refresh Page'}
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {lang === 'ar'
                ? 'ينصح بتحديث الصفحة بعد مسح ذاكرة التخزين وإعادة تحميل البيانات'
                : 'Recommended after clearing cache and reloading data'
              }
            </p>
            <Button 
              onClick={refreshPage}
              variant="secondary"
              className="w-full"
            >
              <ArrowPathIcon className="h-4 w-4 mr-2" />
              {lang === 'ar' ? 'تحديث الصفحة' : 'Refresh Page'}
            </Button>
          </CardContent>
        </Card>

        {/* Status */}
        {(cleared || reloaded) && (
          <Card className="border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950">
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2 rtl:space-x-reverse text-green-800 dark:text-green-200">
                <CheckIcon className="h-5 w-5" />
                <span className="font-medium">
                  {lang === 'ar' 
                    ? 'تم تنفيذ العمليات بنجاح. يمكنك الآن العودة إلى الصفحة الرئيسية.'
                    : 'Operations completed successfully. You can now return to the main page.'
                  }
                </span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Navigation */}
        <div className="flex space-x-4 rtl:space-x-reverse">
          <Button 
            variant="outline" 
            onClick={() => window.history.back()}
            className="flex-1"
          >
            {lang === 'ar' ? 'العودة' : 'Go Back'}
          </Button>
          <Button 
            onClick={() => window.location.href = `/${lang}/tests`}
            className="flex-1"
          >
            {lang === 'ar' ? 'صفحة الاختبارات' : 'Tests Page'}
          </Button>
        </div>
      </div>
    </div>
  );
}
