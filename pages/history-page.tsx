'use client';

import { useState, useEffect } from 'react';
import { Language } from '@/types';
import { getTranslationsSync } from '@/lib/translations';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import {
  ClockIcon,
  BeakerIcon,
  EyeIcon,
  TrashIcon,
  CalendarIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';
import { databaseColorTestService } from '@/lib/database-color-test-service';

interface HistoryPageProps {
  lang: Language;
}

interface HistoryItem {
  id: string;
  testId: string;
  testName: string;
  visitedAt: Date;
  colorSelected?: string;
  resultSaved?: boolean;
}

export function HistoryPage({ lang }: HistoryPageProps) {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [allTests, setAllTests] = useState<any[]>([]);
  const isRTL = lang === 'ar';

  // Get translations
  const t = getTranslationsSync(lang) || {};

  useEffect(() => {
    loadHistory();
    loadAllTests();
  }, []);

  const loadAllTests = async () => {
    try {
      const tests = await databaseColorTestService.getAllTests();
      console.log(`📊 Loaded ${tests.length} tests for history page`);
      setAllTests(tests);
    } catch (error) {
      console.error('Error loading tests for history:', error);
    }
  };

  const loadHistory = () => {
    try {
      const savedHistory = localStorage.getItem('test_history');
      if (savedHistory) {
        const parsedHistory = JSON.parse(savedHistory).map((item: any) => ({
          ...item,
          visitedAt: new Date(item.visitedAt)
        }));
        
        // Sort by visit date (newest first)
        parsedHistory.sort((a: HistoryItem, b: HistoryItem) => 
          b.visitedAt.getTime() - a.visitedAt.getTime()
        );
        
        setHistory(parsedHistory);
      }
    } catch (error) {
      console.error('Error loading history:', error);
    } finally {
      setLoading(false);
    }
  };

  const clearHistory = () => {
    localStorage.removeItem('test_history');
    setHistory([]);
  };

  const removeHistoryItem = (id: string) => {
    const updatedHistory = history.filter(item => item.id !== id);
    setHistory(updatedHistory);
    localStorage.setItem('test_history', JSON.stringify(updatedHistory));
  };

  const getTestDisplayName = (testId: string): string => {
    // First, try to find the test in the loaded tests data
    if (allTests.length > 0) {
      const test = allTests.find(t => t.id === testId);
      if (test) {
        return isRTL ? test.method_name_ar : test.method_name;
      }
    }

    // Fallback to static test names for backward compatibility
    const testNames: { [key: string]: { ar: string; en: string } } = {
      'marquis-test': { ar: 'اختبار ماركيز', en: 'Marquis Test' },
      'mecke-test': { ar: 'اختبار ميكي', en: 'Mecke Test' },
      'ferric-sulfate-test': { ar: 'اختبار كبريتات الحديد', en: 'Ferric Sulfate Test' },
      'nitric-acid-test': { ar: 'اختبار حمض النيتريك', en: 'Nitric Acid Test' },
      'fast-blue-b-test': { ar: 'اختبار الأزرق السريع ب', en: 'Fast Blue B Test' },
      'duquenois-levine-test': { ar: 'اختبار دوكينويس ليفين', en: 'Duquenois-Levine Test' },
      'cobalt-thiocyanate-test': { ar: 'اختبار ثيوسيانات الكوبالت', en: 'Cobalt Thiocyanate Test' },
      'modified-cobalt-thiocyanate-test': { ar: 'اختبار ثيوسيانات الكوبالت المعدل', en: 'Modified Cobalt Thiocyanate Test' },
      'wagner-test': { ar: 'اختبار واجنر', en: 'Wagner Test' },
      'simon-test': { ar: 'اختبار سايمون', en: 'Simon Test' },
      'ehrlich-test': { ar: 'اختبار إيرليش', en: 'Ehrlich Test' },
      'liebermann-test': { ar: 'اختبار ليبرمان', en: 'Liebermann Test' },
      'potassium-dichromate-test': { ar: 'اختبار ثنائي كرومات البوتاسيوم', en: 'Potassium Dichromate Test' },
      'chen-kao-test': { ar: 'اختبار تشين كاو', en: 'Chen-Kao Test' },
      'nitric-sulfuric-test': { ar: 'اختبار النيتريك الكبريتي', en: 'Nitric-Sulfuric Test' },
      'dinitrobenzene-14-test': { ar: 'اختبار دينيتروبنزين 1,4', en: 'Dinitrobenzene 1,4 Test' }
    };

    const testName = testNames[testId];
    if (testName) {
      return testName[lang] || testName.en;
    }

    // Final fallback to formatted test ID
    console.warn(`⚠️ Test not found: ${testId}`);
    return testId.split('-').map(word =>
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  const formatDate = (date: Date): string => {
    return date.toLocaleString(lang === 'ar' ? 'ar-SA' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className={`min-h-screen bg-gray-50 dark:bg-gray-900 py-8 ${isRTL ? 'rtl' : 'ltr'}`} dir={isRTL ? 'rtl' : 'ltr'}>
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-2">{lang === 'ar' ? 'جاري التحميل...' : 'Loading...'}</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-gray-50 dark:bg-gray-900 py-8 ${isRTL ? 'rtl' : 'ltr'}`} dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                  {lang === 'ar' ? 'آخر الاختبارات السابقة' : 'Recent Tests History'}
                </h1>
                <p className="text-lg text-gray-600 dark:text-gray-400">
                  {lang === 'ar' ? 'الاختبارات التي زرتها مؤخراً' : 'Tests you have recently visited'}
                </p>
              </div>
              {history.length > 0 && (
                <Button variant="outline" onClick={clearHistory}>
                  <TrashIcon className="h-4 w-4 mr-2 rtl:ml-2 rtl:mr-0" />
                  {lang === 'ar' ? 'مسح السجل' : 'Clear History'}
                </Button>
              )}
            </div>
            
            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center">
                    <ChartBarIcon className="h-8 w-8 text-blue-600 mr-3 rtl:ml-3 rtl:mr-0" />
                    <div>
                      <p className="text-2xl font-bold">{history.length}</p>
                      <p className="text-sm text-gray-600">{lang === 'ar' ? 'إجمالي الزيارات' : 'Total Visits'}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center">
                    <BeakerIcon className="h-8 w-8 text-green-600 mr-3 rtl:ml-3 rtl:mr-0" />
                    <div>
                      <p className="text-2xl font-bold">{new Set(history.map(h => h.testId)).size}</p>
                      <p className="text-sm text-gray-600">{lang === 'ar' ? 'اختبارات مختلفة' : 'Unique Tests'}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center">
                    <CalendarIcon className="h-8 w-8 text-purple-600 mr-3 rtl:ml-3 rtl:mr-0" />
                    <div>
                      <p className="text-2xl font-bold">{history.filter(h => h.resultSaved).length}</p>
                      <p className="text-sm text-gray-600">{lang === 'ar' ? 'نتائج محفوظة' : 'Saved Results'}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* History List */}
          {history.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <ClockIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-medium text-gray-900 dark:text-gray-100 mb-2">
                  {lang === 'ar' ? 'لا يوجد سجل' : 'No History'}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  {lang === 'ar' 
                    ? 'لم تقم بزيارة أي اختبارات بعد. ابدأ بتصفح الاختبارات المتاحة.'
                    : 'You haven\'t visited any tests yet. Start by browsing available tests.'
                  }
                </p>
                <Link href={`/${lang}/tests`}>
                  <Button>
                    <BeakerIcon className="h-4 w-4 mr-2 rtl:ml-2 rtl:mr-0" />
                    {lang === 'ar' ? 'تصفح الاختبارات' : 'Browse Tests'}
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {history.map((item) => (
                <Card key={item.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4 rtl:space-x-reverse">
                        <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
                          <BeakerIcon className="h-6 w-6 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-900 dark:text-gray-100">
                            {getTestDisplayName(item.testId)}
                          </h3>
                          <div className="flex items-center space-x-4 rtl:space-x-reverse text-sm text-gray-600 dark:text-gray-400">
                            <span className="flex items-center">
                              <CalendarIcon className="h-4 w-4 mr-1 rtl:ml-1 rtl:mr-0" />
                              {formatDate(item.visitedAt)}
                            </span>
                            {item.colorSelected && (
                              <span className="flex items-center">
                                <div 
                                  className="w-4 h-4 rounded-full border mr-1 rtl:ml-1 rtl:mr-0"
                                  style={{ backgroundColor: item.colorSelected }}
                                />
                                {lang === 'ar' ? 'لون محدد' : 'Color selected'}
                              </span>
                            )}
                            {item.resultSaved && (
                              <Badge variant="secondary" className="text-xs">
                                {lang === 'ar' ? 'نتيجة محفوظة' : 'Result saved'}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2 rtl:space-x-reverse">
                        <Link href={`/${lang}/tests/${item.testId}`}>
                          <Button variant="outline" size="sm">
                            <EyeIcon className="h-4 w-4 mr-1 rtl:ml-1 rtl:mr-0" />
                            {lang === 'ar' ? 'عرض' : 'View'}
                          </Button>
                        </Link>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => removeHistoryItem(item.id)}
                        >
                          <TrashIcon className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default HistoryPage;
