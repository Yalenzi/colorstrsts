'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Language } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  HomeIcon,
  UsersIcon,
  BeakerIcon,
  CreditCardIcon,
  ChartBarIcon,
  Cog6ToothIcon,
  BellIcon,
  MagnifyingGlassIcon,
  Bars3Icon,
  XMarkIcon,
  ShieldCheckIcon,
  DocumentTextIcon,
  CircleStackIcon,
  ServerIcon,
  LockClosedIcon,
  BanknotesIcon,
  EyeIcon,
  PlusIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import { AdminSettings } from './AdminSettings';
import { TestManagement } from './TestManagement';

// Import existing admin components
import { EnhancedTestsManagement } from './EnhancedTestsManagement';
import ColorResultsManagement from './ColorResultsManagement';
import { ComprehensiveUserManagement } from './ComprehensiveUserManagement';
import { SubscriptionManagement } from './SubscriptionManagement';
import { EnhancedCharts } from './charts/EnhancedCharts';
import { EnhancedSystemSettings } from './EnhancedSystemSettings';

interface ProfessionalAdminDashboardProps {
  lang: Language;
}

interface SidebarItem {
  id: string;
  label: string;
  icon: React.ComponentType<any>;
  badge?: string;
  children?: SidebarItem[];
}

export function ProfessionalAdminDashboard({ lang }: ProfessionalAdminDashboardProps) {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();
  const isRTL = lang === 'ar';

  const handleLogout = () => {
    // Clear admin session
    localStorage.removeItem('admin_session');
    // Redirect to login
    router.push(`/${lang}/admin/login`);
  };

  const texts = {
    ar: {
      dashboard: 'لوحة التحكم',
      overview: 'نظرة عامة',
      users: 'المستخدمون',
      tests: 'الاختبارات',
      colorResults: 'النتائج اللونية',
      subscriptions: 'الاشتراكات',
      reports: 'التقارير',
      settings: 'الإعدادات',
      system: 'النظام',
      database: 'قاعدة البيانات',
      security: 'الأمان',
      search: 'البحث...',
      notifications: 'الإشعارات',
      profile: 'الملف الشخصي',
      logout: 'تسجيل الخروج',
      welcome: 'مرحباً',
      admin: 'مدير',
      totalUsers: 'إجمالي المستخدمين',
      activeTests: 'الاختبارات النشطة',
      monthlyRevenue: 'الإيرادات الشهرية',
      systemHealth: 'صحة النظام'
    },
    en: {
      dashboard: 'Dashboard',
      overview: 'Overview',
      users: 'Users',
      tests: 'Tests',
      colorResults: 'Color Results',
      subscriptions: 'Subscriptions',
      reports: 'Reports',
      settings: 'Settings',
      system: 'System',
      database: 'Database',
      security: 'Security',
      search: 'Search...',
      notifications: 'Notifications',
      profile: 'Profile',
      logout: 'Logout',
      welcome: 'Welcome',
      admin: 'Admin',
      totalUsers: 'Total Users',
      activeTests: 'Active Tests',
      monthlyRevenue: 'Monthly Revenue',
      systemHealth: 'System Health'
    }
  };

  const t = texts[lang];

  const sidebarItems: SidebarItem[] = [
    {
      id: 'dashboard',
      label: t.overview,
      icon: HomeIcon
    },
    {
      id: 'users',
      label: t.users,
      icon: UsersIcon,
      badge: '156'
    },
    {
      id: 'tests',
      label: t.tests,
      icon: BeakerIcon,
      badge: '12'
    },
    {
      id: 'test-management',
      label: lang === 'ar' ? 'إدارة الاختبارات' : 'Test Management',
      icon: BeakerIcon
    },
    {
      id: 'color-results',
      label: t.colorResults,
      icon: ChartBarIcon,
      badge: '248'
    },
    {
      id: 'subscriptions',
      label: t.subscriptions,
      icon: CreditCardIcon,
      badge: '34'
    },
    {
      id: 'reports',
      label: t.reports,
      icon: DocumentTextIcon
    },
    {
      id: 'system',
      label: t.system,
      icon: Cog6ToothIcon,
      children: [
        {
          id: 'database',
          label: t.database,
          icon: CircleStackIcon
        },
        {
          id: 'security',
          label: t.security,
          icon: LockClosedIcon
        },
        {
          id: 'settings',
          label: t.settings,
          icon: ServerIcon
        },
        {
          id: 'admin-settings',
          label: lang === 'ar' ? 'إعدادات الإدارة' : 'Admin Settings',
          icon: Cog6ToothIcon
        }
      ]
    }
  ];

  const mockStats = {
    totalUsers: 1247,
    activeTests: 12,
    monthlyRevenue: 15420,
    systemHealth: 98.5
  };

  const renderSidebar = () => (
    <div className={`${sidebarOpen ? 'w-64' : 'w-16'} transition-all duration-300 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 flex flex-col h-full`}>
      {/* Sidebar Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          {sidebarOpen && (
            <div className="flex items-center space-x-3 rtl:space-x-reverse">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <ShieldCheckIcon className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                  ColorTests
                </h2>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Admin Panel
                </p>
              </div>
            </div>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-1"
          >
            {sidebarOpen ? <XMarkIcon className="w-4 h-4" /> : <Bars3Icon className="w-4 h-4" />}
          </Button>
        </div>
      </div>

      {/* Search */}
      {sidebarOpen && (
        <div className="p-4">
          <div className="relative">
            <MagnifyingGlassIcon className="w-4 h-4 absolute left-3 rtl:right-3 rtl:left-auto top-1/2 transform -translate-y-1/2 text-gray-400" />
            <Input
              placeholder={t.search}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 rtl:pr-10 rtl:pl-3"
            />
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {sidebarItems.map((item) => (
          <div key={item.id}>
            <Button
              variant={activeTab === item.id ? "default" : "ghost"}
              className={`w-full justify-start ${!sidebarOpen && 'px-2'}`}
              onClick={() => setActiveTab(item.id)}
            >
              <item.icon className={`w-5 h-5 ${sidebarOpen ? 'mr-3 rtl:ml-3 rtl:mr-0' : ''}`} />
              {sidebarOpen && (
                <>
                  <span className="flex-1 text-left rtl:text-right">{item.label}</span>
                  {item.badge && (
                    <Badge variant="secondary" className="ml-auto rtl:mr-auto rtl:ml-0">
                      {item.badge}
                    </Badge>
                  )}
                </>
              )}
            </Button>
            
            {/* Sub-items */}
            {item.children && sidebarOpen && activeTab === item.id && (
              <div className="ml-6 rtl:mr-6 rtl:ml-0 mt-2 space-y-1">
                {item.children.map((child) => (
                  <Button
                    key={child.id}
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start text-sm"
                    onClick={() => setActiveTab(child.id)}
                  >
                    <child.icon className="w-4 h-4 mr-2 rtl:ml-2 rtl:mr-0" />
                    {child.label}
                  </Button>
                ))}
              </div>
            )}
          </div>
        ))}
      </nav>

      {/* User Profile */}
      {sidebarOpen && (
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3 rtl:space-x-reverse">
            <Avatar>
              <AvatarFallback className="bg-blue-600 text-white">
                A
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                {t.admin}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                admin@colortest.com
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderTopBar = () => (
    <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {sidebarItems.find(item => item.id === activeTab)?.label || t.dashboard}
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {t.welcome} {t.admin}
          </p>
        </div>
        
        <div className="flex items-center space-x-4 rtl:space-x-reverse">
          <Button variant="ghost" size="sm">
            <BellIcon className="w-5 h-5" />
          </Button>
          <Button variant="ghost" size="sm">
            <Cog6ToothIcon className="w-5 h-5" />
          </Button>
          <Button variant="outline" size="sm" onClick={handleLogout}>
            <ArrowPathIcon className="w-4 h-4 mr-2 rtl:ml-2 rtl:mr-0" />
            {isRTL ? 'تسجيل الخروج' : 'Logout'}
          </Button>
        </div>
      </div>
    </div>
  );

  const renderDashboardOverview = () => (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  {t.totalUsers}
                </p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">
                  {mockStats.totalUsers.toLocaleString()}
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
                <UsersIcon className="w-6 h-6 text-blue-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center">
              <span className="text-sm text-green-600">+12.5%</span>
              <span className="text-sm text-gray-500 dark:text-gray-400 ml-2 rtl:mr-2 rtl:ml-0">
                {isRTL ? 'من الشهر الماضي' : 'from last month'}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  {t.activeTests}
                </p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">
                  {mockStats.activeTests}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
                <BeakerIcon className="w-6 h-6 text-green-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center">
              <span className="text-sm text-green-600">+3</span>
              <span className="text-sm text-gray-500 dark:text-gray-400 ml-2 rtl:mr-2 rtl:ml-0">
                {isRTL ? 'اختبارات جديدة' : 'new tests'}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  {t.monthlyRevenue}
                </p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">
                  ${mockStats.monthlyRevenue.toLocaleString()}
                </p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900/20 rounded-lg flex items-center justify-center">
                <BanknotesIcon className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center">
              <span className="text-sm text-green-600">+15.3%</span>
              <span className="text-sm text-gray-500 dark:text-gray-400 ml-2 rtl:mr-2 rtl:ml-0">
                {isRTL ? 'نمو شهري' : 'monthly growth'}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  {t.systemHealth}
                </p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">
                  {mockStats.systemHealth}%
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-center justify-center">
                <ServerIcon className="w-6 h-6 text-purple-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center">
              <span className="text-sm text-green-600">Excellent</span>
              <span className="text-sm text-gray-500 dark:text-gray-400 ml-2 rtl:mr-2 rtl:ml-0">
                {isRTL ? 'حالة ممتازة' : 'status'}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <EnhancedCharts lang={lang} />
    </div>
  );

  const renderMainContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return renderDashboardOverview();
      case 'users':
        return <ComprehensiveUserManagement lang={lang} />;
      case 'tests':
        return <EnhancedTestsManagement lang={lang} />;
      case 'test-management':
        return <TestManagement lang={lang} />;
      case 'color-results':
        return <ColorResultsManagement lang={lang} />;
      case 'subscriptions':
        return <SubscriptionManagement lang={lang} />;
      case 'reports':
        return <EnhancedCharts lang={lang} />;
      case 'admin-settings':
        return <AdminSettings lang={lang} />;
      case 'settings':
      case 'database':
      case 'security':
      case 'system':
        return <EnhancedSystemSettings lang={lang} />;
      default:
        return renderDashboardOverview();
    }
  };

  return (
    <div className={`min-h-screen bg-gray-50 dark:bg-gray-950 flex ${isRTL ? 'rtl' : 'ltr'}`} dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Sidebar */}
      {renderSidebar()}
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        {renderTopBar()}
        
        {/* Content Area */}
        <main className="flex-1 overflow-y-auto p-6">
          {renderMainContent()}
        </main>
      </div>
    </div>
  );
}
