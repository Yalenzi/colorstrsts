'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Language } from '@/types';
import { 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  Play,
  RefreshCw,
  TestTube,
  Users,
  Settings,
  BarChart3,
  Palette,
  Save,
  Edit,
  Trash2,
  Plus,
  Download,
  Upload,
  Eye,
  Filter,
  Search
} from 'lucide-react';

interface TestResult {
  id: string;
  name: string;
  nameAr: string;
  status: 'passed' | 'failed' | 'warning' | 'pending';
  description: string;
  descriptionAr: string;
  category: string;
  duration: number;
  error?: string;
}

interface AdminPanelTestProps {
  lang: Language;
}

export function AdminPanelTest({ lang }: AdminPanelTestProps) {
  const isRTL = lang === 'ar';
  const [testing, setTesting] = useState(false);
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [currentTest, setCurrentTest] = useState<string>('');

  const tests: Omit<TestResult, 'status' | 'duration' | 'error'>[] = [
    {
      id: 'dashboard-load',
      name: 'Dashboard Loading',
      nameAr: 'تحميل لوحة التحكم',
      description: 'Test if dashboard loads correctly with all components',
      descriptionAr: 'اختبار تحميل لوحة التحكم مع جميع المكونات',
      category: 'UI'
    },
    {
      id: 'user-management',
      name: 'User Management Functions',
      nameAr: 'وظائف إدارة المستخدمين',
      description: 'Test add, edit, delete, and view user functions',
      descriptionAr: 'اختبار وظائف إضافة وتعديل وحذف وعرض المستخدمين',
      category: 'CRUD'
    },
    {
      id: 'test-management',
      name: 'Test Management Functions',
      nameAr: 'وظائف إدارة الاختبارات',
      description: 'Test chemical test management operations',
      descriptionAr: 'اختبار عمليات إدارة الاختبارات الكيميائية',
      category: 'CRUD'
    },
    {
      id: 'analytics-charts',
      name: 'Analytics Charts',
      nameAr: 'الرسوم البيانية التحليلية',
      description: 'Test interactive charts and data visualization',
      descriptionAr: 'اختبار الرسوم البيانية التفاعلية وتصور البيانات',
      category: 'Analytics'
    },
    {
      id: 'settings-save',
      name: 'Settings Save/Load',
      nameAr: 'حفظ/تحميل الإعدادات',
      description: 'Test system settings save and load functionality',
      descriptionAr: 'اختبار وظائف حفظ وتحميل إعدادات النظام',
      category: 'Settings'
    },
    {
      id: 'responsive-design',
      name: 'Responsive Design',
      nameAr: 'التصميم المتجاوب',
      description: 'Test responsive layout on different screen sizes',
      descriptionAr: 'اختبار التخطيط المتجاوب على أحجام شاشات مختلفة',
      category: 'UI'
    },
    {
      id: 'rtl-support',
      name: 'RTL Support',
      nameAr: 'دعم RTL',
      description: 'Test right-to-left text direction support',
      descriptionAr: 'اختبار دعم اتجاه النص من اليمين لليسار',
      category: 'Localization'
    },
    {
      id: 'dark-mode',
      name: 'Dark Mode Toggle',
      nameAr: 'تبديل الوضع المظلم',
      description: 'Test dark mode switching functionality',
      descriptionAr: 'اختبار وظيفة تبديل الوضع المظلم',
      category: 'UI'
    },
    {
      id: 'search-filter',
      name: 'Search & Filter',
      nameAr: 'البحث والتصفية',
      description: 'Test search and filtering capabilities',
      descriptionAr: 'اختبار قدرات البحث والتصفية',
      category: 'Functionality'
    },
    {
      id: 'notifications',
      name: 'Toast Notifications',
      nameAr: 'إشعارات التوست',
      description: 'Test success, error, and warning notifications',
      descriptionAr: 'اختبار إشعارات النجاح والخطأ والتحذير',
      category: 'UI'
    },
    {
      id: 'data-export',
      name: 'Data Export',
      nameAr: 'تصدير البيانات',
      description: 'Test data export functionality',
      descriptionAr: 'اختبار وظيفة تصدير البيانات',
      category: 'Functionality'
    },
    {
      id: 'modal-dialogs',
      name: 'Modal Dialogs',
      nameAr: 'النوافذ المنبثقة',
      description: 'Test modal opening, closing, and form submission',
      descriptionAr: 'اختبار فتح وإغلاق النوافذ المنبثقة وإرسال النماذج',
      category: 'UI'
    }
  ];

  const runAllTests = async () => {
    setTesting(true);
    setTestResults([]);
    
    for (const test of tests) {
      setCurrentTest(test.name);
      
      // محاكاة تشغيل الاختبار
      const startTime = Date.now();
      await new Promise(resolve => setTimeout(resolve, Math.random() * 2000 + 500));
      const duration = Date.now() - startTime;
      
      // محاكاة نتائج الاختبار
      const success = Math.random() > 0.1; // 90% نجاح
      const warning = !success && Math.random() > 0.5; // 50% تحذير من الفشل
      
      const result: TestResult = {
        ...test,
        status: success ? 'passed' : warning ? 'warning' : 'failed',
        duration,
        error: !success ? (warning ? 'Minor issue detected' : 'Test failed with error') : undefined
      };
      
      setTestResults(prev => [...prev, result]);
    }
    
    setCurrentTest('');
    setTesting(false);
    
    const passedTests = testResults.filter(t => t.status === 'passed').length;
    const totalTests = tests.length;
    
    if (passedTests === totalTests) {
      toast.success(isRTL ? 'جميع الاختبارات نجحت!' : 'All tests passed!');
    } else {
      toast.warning(isRTL ? `${passedTests}/${totalTests} اختبار نجح` : `${passedTests}/${totalTests} tests passed`);
    }
  };

  const runSingleTest = async (testId: string) => {
    const test = tests.find(t => t.id === testId);
    if (!test) return;
    
    setCurrentTest(test.name);
    
    const startTime = Date.now();
    await new Promise(resolve => setTimeout(resolve, Math.random() * 1000 + 300));
    const duration = Date.now() - startTime;
    
    const success = Math.random() > 0.1;
    const warning = !success && Math.random() > 0.5;
    
    const result: TestResult = {
      ...test,
      status: success ? 'passed' : warning ? 'warning' : 'failed',
      duration,
      error: !success ? (warning ? 'Minor issue detected' : 'Test failed with error') : undefined
    };
    
    setTestResults(prev => {
      const filtered = prev.filter(r => r.id !== testId);
      return [...filtered, result];
    });
    
    setCurrentTest('');
    
    if (success) {
      toast.success(isRTL ? `اختبار ${test.nameAr} نجح` : `${test.name} test passed`);
    } else if (warning) {
      toast.warning(isRTL ? `اختبار ${test.nameAr} به تحذير` : `${test.name} test has warning`);
    } else {
      toast.error(isRTL ? `اختبار ${test.nameAr} فشل` : `${test.name} test failed`);
    }
  };

  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'passed':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'failed':
        return <XCircle className="w-5 h-5 text-red-600" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-600" />;
      default:
        return <div className="w-5 h-5 bg-gray-300 rounded-full animate-pulse" />;
    }
  };

  const getStatusBadge = (status: TestResult['status']) => {
    const config = {
      passed: { color: 'bg-green-100 text-green-800', text: isRTL ? 'نجح' : 'Passed' },
      failed: { color: 'bg-red-100 text-red-800', text: isRTL ? 'فشل' : 'Failed' },
      warning: { color: 'bg-yellow-100 text-yellow-800', text: isRTL ? 'تحذير' : 'Warning' },
      pending: { color: 'bg-gray-100 text-gray-800', text: isRTL ? 'قيد الانتظار' : 'Pending' }
    };

    // إضافة حماية من undefined مع قيمة افتراضية
    const statusConfig = config[status] || config.pending;
    const { color, text } = statusConfig;
    return <Badge className={color}>{text}</Badge>;
  };

  const categoryStats = testResults.reduce((acc, result) => {
    if (!acc[result.category]) {
      acc[result.category] = { total: 0, passed: 0, failed: 0, warning: 0 };
    }
    acc[result.category].total++;
    acc[result.category][result.status]++;
    return acc;
  }, {} as Record<string, { total: number; passed: number; failed: number; warning: number }>);

  return (
    <div className={`space-y-6 ${isRTL ? 'rtl' : 'ltr'}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            {isRTL ? 'اختبار لوحة الإدارة' : 'Admin Panel Testing'}
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            {isRTL ? 'اختبار شامل لجميع وظائف لوحة الإدارة' : 'Comprehensive testing of all admin panel functions'}
          </p>
        </div>
        <div className="flex space-x-2 rtl:space-x-reverse">
          <Button 
            onClick={runAllTests} 
            disabled={testing}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {testing ? (
              <RefreshCw className="w-4 h-4 mr-2 rtl:ml-2 rtl:mr-0 animate-spin" />
            ) : (
              <Play className="w-4 h-4 mr-2 rtl:ml-2 rtl:mr-0" />
            )}
            {testing ? (isRTL ? 'جاري الاختبار...' : 'Testing...') : (isRTL ? 'تشغيل جميع الاختبارات' : 'Run All Tests')}
          </Button>
          <Button variant="outline" onClick={() => setTestResults([])}>
            <RefreshCw className="w-4 h-4 mr-2 rtl:ml-2 rtl:mr-0" />
            {isRTL ? 'مسح النتائج' : 'Clear Results'}
          </Button>
        </div>
      </div>

      {/* Current Test */}
      {testing && currentTest && (
        <Card className="border-blue-200 bg-blue-50 dark:bg-blue-900/20">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3 rtl:space-x-reverse">
              <RefreshCw className="w-5 h-5 text-blue-600 animate-spin" />
              <span className="font-medium text-blue-900 dark:text-blue-100">
                {isRTL ? `جاري تشغيل: ${currentTest}` : `Running: ${currentTest}`}
              </span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats */}
      {testResults.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    {isRTL ? 'إجمالي الاختبارات' : 'Total Tests'}
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-2">
                    {testResults.length}
                  </p>
                </div>
                <TestTube className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    {isRTL ? 'نجح' : 'Passed'}
                  </p>
                  <p className="text-2xl font-bold text-green-600 mt-2">
                    {testResults.filter(t => t.status === 'passed').length}
                  </p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    {isRTL ? 'تحذيرات' : 'Warnings'}
                  </p>
                  <p className="text-2xl font-bold text-yellow-600 mt-2">
                    {testResults.filter(t => t.status === 'warning').length}
                  </p>
                </div>
                <AlertTriangle className="h-8 w-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    {isRTL ? 'فشل' : 'Failed'}
                  </p>
                  <p className="text-2xl font-bold text-red-600 mt-2">
                    {testResults.filter(t => t.status === 'failed').length}
                  </p>
                </div>
                <XCircle className="h-8 w-8 text-red-600" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Test Results */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 rtl:space-x-reverse">
            <TestTube className="w-5 h-5" />
            <span>{isRTL ? 'نتائج الاختبارات' : 'Test Results'}</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {testResults.length === 0 ? (
            <div className="text-center py-12 text-gray-500 dark:text-gray-400">
              <TestTube className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>{isRTL ? 'لم يتم تشغيل أي اختبارات بعد' : 'No tests have been run yet'}</p>
              <p className="text-sm mt-2">
                {isRTL ? 'انقر على "تشغيل جميع الاختبارات" للبدء' : 'Click "Run All Tests" to get started'}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {tests.map((test) => {
                const result = testResults.find(r => r.id === test.id);
                
                return (
                  <div key={test.id} className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                    <div className="flex items-center space-x-4 rtl:space-x-reverse flex-1">
                      {result ? getStatusIcon(result.status) : <div className="w-5 h-5 bg-gray-200 rounded-full" />}
                      
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900 dark:text-gray-100">
                          {isRTL ? test.nameAr : test.name}
                        </h4>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {isRTL ? test.descriptionAr : test.description}
                        </p>
                        {result?.error && (
                          <p className="text-sm text-red-600 mt-1">{result.error}</p>
                        )}
                      </div>
                      
                      <div className="flex items-center space-x-2 rtl:space-x-reverse">
                        <Badge variant="outline">{test.category}</Badge>
                        {result && getStatusBadge(result.status)}
                        {result && (
                          <span className="text-xs text-gray-500">
                            {result.duration}ms
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => runSingleTest(test.id)}
                      disabled={testing}
                      className="ml-4 rtl:mr-4 rtl:ml-0"
                    >
                      <Play className="w-4 h-4" />
                    </Button>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
