'use client';

import { useState, useEffect } from 'react';
import { Language } from '@/types';
import { getTranslationsSync } from '@/lib/translations';
import { getChemicalTestsLocal, initializeLocalStorage } from '@/lib/local-data-service';
import { Button } from '@/components/ui/button';
import { ReportsSystem } from './reports-system';
import { DatabaseManagement } from './database-management';
import { ExcelManagement } from './excel-management';
import { TestsManagement } from './tests-management';
import NewTestsManagement from './NewTestsManagement';
import { ColorResultsManagement } from './color-results-management';
import { SubscriptionManagement } from './SubscriptionManagement';
import SubscriptionSettingsWrapper from './SubscriptionSettingsWrapper';
import { UserManagement } from './UserManagement';
import { FirebaseConnectionTest } from './FirebaseConnectionTest';
import FirebaseDebugger from './FirebaseDebugger';
import { STCPaySettings } from './STCPaySettings';
import { UsageChart } from './UsageChart';
import { TestStepsManagement } from './TestStepsManagement';
import { TextEditorManagement } from './TextEditorManagement';
import { SubscriptionPlansManagement } from './SubscriptionPlansManagement';
import { exportTests } from '@/lib/firebase-tests';
import {
  ChartBarIcon,
  BeakerIcon,
  SwatchIcon,
  UsersIcon,
  DocumentArrowDownIcon,
  DocumentArrowUpIcon,
  TrashIcon,
  EyeIcon,
  ClockIcon,
  CheckCircleIcon,
  CircleStackIcon,
  TableCellsIcon,
  DocumentTextIcon,
  BanknotesIcon as CreditCardIcon,
  Cog6ToothIcon,
  LockOpenIcon,
  ListBulletIcon,
  PencilSquareIcon,
  BanknotesIcon,
  ChartPieIcon,
  Cog8ToothIcon,
  CloudArrowUpIcon,
  DocumentDuplicateIcon,
  Bars3Icon,
  XMarkIcon,
  HomeIcon,
  ChevronRightIcon,
  ChevronLeftIcon
} from '@heroicons/react/24/outline';

interface EnhancedAdminDashboardProps {
  lang: Language;
}

interface DashboardStats {
  totalTests: number;
  totalColors: number;
  totalSessions: number;
  recentActivity: any[];
  popularTests: any[];
  systemHealth: string;
}

interface SidebarItem {
  id: string;
  name: string;
  nameAr: string;
  icon: any;
  category?: string;
  categoryAr?: string;
  badge?: string;
}

export function EnhancedAdminDashboard({ lang }: EnhancedAdminDashboardProps) {
  const [stats, setStats] = useState<DashboardStats>({
    totalTests: 0,
    totalColors: 0,
    totalSessions: 0,
    recentActivity: [],
    popularTests: [],
    systemHealth: 'good'
  });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const t = getTranslationsSync(lang) || {};
  const isRTL = lang === 'ar';

  // تنظيم التبويبات في مجموعات للشريط الجانبي
  const sidebarItems: SidebarItem[] = [
    // الرئيسية
    { id: 'dashboard', name: 'Dashboard', nameAr: 'لوحة التحكم', icon: HomeIcon, category: 'Main', categoryAr: 'الرئيسية' },
    
    // إدارة المحتوى
    { id: 'tests', name: 'Tests Management', nameAr: 'إدارة الاختبارات', icon: BeakerIcon, category: 'Content', categoryAr: 'إدارة المحتوى' },
    { id: 'test-steps', name: 'Test Steps', nameAr: 'خطوات الاختبار', icon: ListBulletIcon, category: 'Content', categoryAr: 'إدارة المحتوى' },
    { id: 'colors', name: 'Color Results', nameAr: 'النتائج اللونية', icon: SwatchIcon, category: 'Content', categoryAr: 'إدارة المحتوى' },
    { id: 'text-editor', name: 'Text Editor', nameAr: 'محرر النصوص', icon: PencilSquareIcon, category: 'Content', categoryAr: 'إدارة المحتوى' },
    
    // إدارة المستخدمين والاشتراكات
    { id: 'users', name: 'Users', nameAr: 'إدارة المستخدمين', icon: UsersIcon, category: 'Users', categoryAr: 'المستخدمون' },
    { id: 'subscriptions', name: 'Subscriptions', nameAr: 'الاشتراكات', icon: CreditCardIcon, category: 'Users', categoryAr: 'المستخدمون' },
    { id: 'subscription-plans', name: 'Plans', nameAr: 'خطط الاشتراك', icon: BanknotesIcon, category: 'Users', categoryAr: 'المستخدمون' },
    { id: 'subscription-settings', name: 'Access Settings', nameAr: 'إعدادات الوصول', icon: LockOpenIcon, category: 'Users', categoryAr: 'المستخدمون' },
    
    // التقارير والتحليلات
    { id: 'reports', name: 'Reports', nameAr: 'التقارير', icon: DocumentTextIcon, category: 'Analytics', categoryAr: 'التحليلات' },
    { id: 'analytics', name: 'Analytics', nameAr: 'التحليلات', icon: ChartPieIcon, category: 'Analytics', categoryAr: 'التحليلات' },
    
    // النظام والبيانات
    { id: 'database', name: 'Database', nameAr: 'قاعدة البيانات', icon: CircleStackIcon, category: 'System', categoryAr: 'النظام' },
    { id: 'excel', name: 'Excel Files', nameAr: 'ملفات Excel', icon: TableCellsIcon, category: 'System', categoryAr: 'النظام' },
    { id: 'backup', name: 'Backup', nameAr: 'النسخ الاحتياطي', icon: CloudArrowUpIcon, category: 'System', categoryAr: 'النظام' },
    { id: 'logs', name: 'System Logs', nameAr: 'سجلات النظام', icon: DocumentDuplicateIcon, category: 'System', categoryAr: 'النظام' },
    
    // الإعدادات والتطوير
    { id: 'payments', name: 'Payments', nameAr: 'إعدادات الدفع', icon: Cog6ToothIcon, category: 'Settings', categoryAr: 'الإعدادات' },
    { id: 'system-settings', name: 'System Settings', nameAr: 'إعدادات النظام', icon: Cog8ToothIcon, category: 'Settings', categoryAr: 'الإعدادات' },
    { id: 'firebase-debugger', name: 'Firebase Debug', nameAr: 'مصحح Firebase', icon: Cog6ToothIcon, category: 'Development', categoryAr: 'التطوير', badge: 'DEV' },
    { id: 'firebase-connection', name: 'Connection Test', nameAr: 'اختبار الاتصال', icon: Cog6ToothIcon, category: 'Development', categoryAr: 'التطوير', badge: 'TEST' }
  ];

  // تجميع العناصر حسب الفئة
  const groupedItems = sidebarItems.reduce((acc, item) => {
    const category = item.category || 'Other';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(item);
    return acc;
  }, {} as Record<string, SidebarItem[]>);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true);

        if (typeof window === 'undefined') {
          setLoading(false);
          return;
        }

        let tests: any[] = [];
        try {
          initializeLocalStorage();
          tests = getChemicalTestsLocal();
        } catch (error) {
          console.error('Error loading tests from local storage:', error);
          tests = [];
        }

        let sessions: any[] = [];
        try {
          const sessionsData = localStorage.getItem('test_results');
          sessions = sessionsData ? JSON.parse(sessionsData) : [];
        } catch (error) {
          console.error('Error loading sessions from localStorage:', error);
          sessions = [];
        }

        const recentSessions = sessions.slice(-10).reverse();

        const testCounts = sessions.reduce((acc: any, session: any) => {
          if (session && session.testId) {
            acc[session.testId] = (acc[session.testId] || 0) + 1;
          }
          return acc;
        }, {});

        const popularTests = Object.entries(testCounts)
          .map(([testId, count]) => ({ testId, count }))
          .sort((a: any, b: any) => b.count - a.count)
          .slice(0, 5);

        setStats({
          totalTests: tests?.length || 0,
          totalColors: 0,
          totalSessions: sessions?.length || 0,
          recentActivity: recentSessions || [],
          popularTests: popularTests || [],
          systemHealth: 'good'
        });

      } catch (error) {
        console.error('Error loading dashboard data:', error);
        setStats({
          totalTests: 0,
          totalColors: 0,
          totalSessions: 0,
          recentActivity: [],
          popularTests: [],
          systemHealth: 'error'
        });
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  const handleExportData = async () => {
    try {
      await exportTests();
      console.log('Data exported successfully');
    } catch (error) {
      console.error('Error exporting data:', error);
    }
  };

  // دالة عرض المحتوى حسب التبويب النشط
  const renderTabContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return renderDashboard();
      case 'tests':
        return <NewTestsManagement lang={lang} />;
      case 'test-steps':
        return <TestStepsManagement lang={lang} />;
      case 'colors':
        return <ColorResultsManagement lang={lang} />;
      case 'subscriptions':
        return <SubscriptionManagement lang={lang} />;
      case 'subscription-plans':
        return <SubscriptionPlansManagement lang={lang} />;
      case 'text-editor':
        return <TextEditorManagement lang={lang} />;
      case 'subscription-settings':
        return <SubscriptionSettingsWrapper lang={lang} />;
      case 'firebase-debugger':
        return <FirebaseDebugger lang={lang} />;
      case 'firebase-connection':
        return <FirebaseConnectionTest lang={lang} />;
      case 'payments':
        return <STCPaySettings lang={lang} />;
      case 'reports':
        return <ReportsSystem lang={lang} />;
      case 'database':
        return <DatabaseManagement lang={lang} />;
      case 'excel':
        return <ExcelManagement lang={lang} />;
      case 'users':
        return <UserManagement lang={lang} />;
      case 'analytics':
        return renderAnalytics();
      case 'system-settings':
        return renderSystemSettings();
      case 'backup':
        return renderBackupManagement();
      case 'logs':
        return renderSystemLogs();
      default:
        return renderDashboard();
    }
  };

  // باقي الدوال ستكون في الجزء التالي...
  const renderDashboard = () => (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">
              {isRTL ? 'مرحباً بك في لوحة الإدارة' : 'Welcome to Admin Dashboard'}
            </h1>
            <p className="text-blue-100">
              {isRTL ? 'إدارة شاملة لنظام اختبارات الألوان' : 'Comprehensive management for color testing system'}
            </p>
          </div>
          <div className="hidden md:block">
            <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center">
              <ChartBarIcon className="h-10 w-10 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* إحصائيات سريعة */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                {isRTL ? 'إجمالي الاختبارات' : 'Total Tests'}
              </p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.totalTests}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
              <BeakerIcon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                {isRTL ? 'الجلسات النشطة' : 'Active Sessions'}
              </p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.totalSessions}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
              <UsersIcon className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                {isRTL ? 'النتائج اللونية' : 'Color Results'}
              </p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.totalColors}</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center">
              <SwatchIcon className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                {isRTL ? 'حالة النظام' : 'System Health'}
              </p>
              <p className="text-lg font-semibold text-green-600 dark:text-green-400 capitalize">
                {stats.systemHealth === 'good' ? (isRTL ? 'ممتاز' : 'Excellent') : stats.systemHealth}
              </p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900 rounded-lg flex items-center justify-center">
              <CheckCircleIcon className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
            </div>
          </div>
        </div>
      </div>

      {/* الرسوم البيانية والنشاط الأخير */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            {isRTL ? 'الاختبارات الأكثر استخداماً' : 'Most Popular Tests'}
          </h3>
          <div className="space-y-3">
            {stats.popularTests.slice(0, 5).map((test: any, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {isRTL ? `اختبار ${test.testId}` : `Test ${test.testId}`}
                </span>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {test.count} {isRTL ? 'مرة' : 'times'}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            {isRTL ? 'النشاط الأخير' : 'Recent Activity'}
          </h3>
          <div className="space-y-3">
            {stats.recentActivity.slice(0, 5).map((activity: any, index) => (
              <div key={index} className="flex items-center space-x-3 rtl:space-x-reverse p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {isRTL ? `اختبار ${activity.testId || 'غير محدد'}` : `Test ${activity.testId || 'Unknown'}`}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {activity.timestamp ? new Date(activity.timestamp).toLocaleString() : 'Unknown time'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  // باقي الدوال المساعدة
  const renderAnalytics = () => (
    <div className="space-y-6">
      <UsageChart lang={lang} />
    </div>
  );

  const renderSystemSettings = () => (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
        <h2 className="text-xl font-bold mb-4">
          {isRTL ? 'إعدادات النظام' : 'System Settings'}
        </h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <span>{isRTL ? 'الوضع المظلم' : 'Dark Mode'}</span>
            <button className="px-4 py-2 bg-primary-600 text-white rounded-lg">
              {isRTL ? 'تفعيل' : 'Enable'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderBackupManagement = () => (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
        <h2 className="text-xl font-bold mb-4">
          {isRTL ? 'إدارة النسخ الاحتياطي' : 'Backup Management'}
        </h2>
        <button
          onClick={handleExportData}
          className="w-full p-4 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center justify-center gap-2"
        >
          <CloudArrowUpIcon className="h-5 w-5" />
          {isRTL ? 'إنشاء نسخة احتياطية' : 'Create Backup'}
        </button>
      </div>
    </div>
  );

  const renderSystemLogs = () => (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
        <h2 className="text-xl font-bold mb-4">
          {isRTL ? 'سجلات النظام' : 'System Logs'}
        </h2>
        <div className="space-y-2">
          <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded border-l-4 border-blue-500">
            <div className="flex justify-between items-center">
              <span className="text-sm">{isRTL ? 'تسجيل دخول مدير' : 'Admin login'}</span>
              <span className="text-xs text-gray-500">{new Date().toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className={`min-h-screen bg-gray-50 dark:bg-gray-900 ${isRTL ? 'rtl' : 'ltr'}`}>
      {/* Enhanced Sidebar */}
      <div
        className={`fixed inset-y-0 z-50 flex w-72 flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          mobileSidebarOpen ? 'translate-x-0' : isRTL ? 'translate-x-full' : '-translate-x-full'
        } ${isRTL ? 'right-0' : 'left-0'} lg:${isRTL ? 'right-0' : 'left-0'} ${
          sidebarCollapsed ? 'lg:w-20' : 'lg:w-72'
        }`}
      >
        {/* Sidebar Background */}
        <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 shadow-xl">
          {/* Sidebar Header */}
          <div className="flex h-16 shrink-0 items-center justify-between px-6 border-b border-gray-200 dark:border-gray-700">
            {!sidebarCollapsed && (
              <div className="flex items-center space-x-3 rtl:space-x-reverse">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                  <BeakerIcon className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-lg font-bold text-gray-900 dark:text-white">
                    {isRTL ? 'لوحة الإدارة' : 'Admin Panel'}
                  </h1>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {isRTL ? 'نظام إدارة الاختبارات' : 'Test Management System'}
                  </p>
                </div>
              </div>
            )}

            {/* Collapse Button */}
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="hidden lg:flex p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              {sidebarCollapsed ? (
                isRTL ? <ChevronLeftIcon className="w-5 h-5" /> : <ChevronRightIcon className="w-5 h-5" />
              ) : (
                isRTL ? <ChevronRightIcon className="w-5 h-5" /> : <ChevronLeftIcon className="w-5 h-5" />
              )}
            </button>

            {/* Mobile Close Button */}
            <button
              onClick={() => setMobileSidebarOpen(false)}
              className="lg:hidden p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex flex-1 flex-col px-4 pb-4">
            <div className="space-y-6">
              {Object.entries(groupedItems).map(([category, items]) => (
                <div key={category}>
                  {!sidebarCollapsed && (
                    <h3 className="px-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
                      {isRTL ? items[0]?.categoryAr || category : category}
                    </h3>
                  )}
                  <div className="space-y-1">
                    {items.map((item) => (
                      <button
                        key={item.id}
                        onClick={() => {
                          setActiveTab(item.id);
                          setMobileSidebarOpen(false);
                        }}
                        className={`group flex w-full items-center rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
                          activeTab === item.id
                            ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white'
                        }`}
                        title={sidebarCollapsed ? (isRTL ? item.nameAr : item.name) : undefined}
                      >
                        <item.icon
                          className={`h-5 w-5 shrink-0 ${
                            activeTab === item.id
                              ? 'text-white'
                              : 'text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300'
                          } ${sidebarCollapsed ? '' : 'mr-3 rtl:ml-3 rtl:mr-0'}`}
                        />
                        {!sidebarCollapsed && (
                          <div className="flex items-center justify-between w-full">
                            <span className="truncate">
                              {isRTL ? item.nameAr : item.name}
                            </span>
                            {item.badge && (
                              <span className="ml-2 rtl:mr-2 rtl:ml-0 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200">
                                {item.badge}
                              </span>
                            )}
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </nav>
        </div>
      </div>

      {/* Mobile Sidebar Overlay */}
      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <div
        className={`transition-all duration-300 ${
          sidebarCollapsed ? 'lg:pl-20' : 'lg:pl-72'
        } ${isRTL ? (sidebarCollapsed ? 'lg:pr-20 lg:pl-0' : 'lg:pr-72 lg:pl-0') : ''}`}
      >
        {/* Top Header */}
        <div className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
          {/* Mobile Menu Button */}
          <button
            type="button"
            className="lg:hidden -m-2.5 p-2.5 text-gray-700 dark:text-gray-300"
            onClick={() => setMobileSidebarOpen(true)}
          >
            <Bars3Icon className="h-6 w-6" />
          </button>

          {/* Breadcrumb */}
          <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
            <div className="flex items-center">
              <nav className="flex" aria-label="Breadcrumb">
                <ol className="flex items-center space-x-2 rtl:space-x-reverse">
                  <li>
                    <div className="flex items-center">
                      <HomeIcon className="h-4 w-4 text-gray-400" />
                      <span className="ml-2 rtl:mr-2 rtl:ml-0 text-sm font-medium text-gray-500 dark:text-gray-400">
                        {isRTL ? 'الإدارة' : 'Admin'}
                      </span>
                    </div>
                  </li>
                  <li>
                    <div className="flex items-center">
                      <ChevronRightIcon className="h-4 w-4 text-gray-400 rtl:rotate-180" />
                      <span className="ml-2 rtl:mr-2 rtl:ml-0 text-sm font-medium text-gray-900 dark:text-white">
                        {isRTL
                          ? sidebarItems.find(item => item.id === activeTab)?.nameAr
                          : sidebarItems.find(item => item.id === activeTab)?.name
                        }
                      </span>
                    </div>
                  </li>
                </ol>
              </nav>
            </div>
          </div>

          {/* Header Actions */}
          <div className="flex items-center gap-x-4 lg:gap-x-6">
            {/* Status Indicator */}
            <div className="flex items-center space-x-2 rtl:space-x-reverse">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {isRTL ? 'متصل' : 'Online'}
              </span>
            </div>
          </div>
        </div>

        {/* Page Content */}
        <main className="py-8">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            {loading ? (
              <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              </div>
            ) : (
              renderTabContent()
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
