'use client';

import { useState, useEffect } from 'react';
import { Language } from '@/types';
import { getTranslationsSync } from '@/lib/translations';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';

// Icons
import {
  ChartBarIcon,
  BeakerIcon,
  SwatchIcon,
  UsersIcon,
  DocumentArrowDownIcon,
  DocumentArrowUpIcon,
  CircleStackIcon,
  TableCellsIcon,
  DocumentTextIcon,
  BanknotesIcon as CreditCardIcon,
  Cog6ToothIcon,
  ListBulletIcon,
  PencilSquareIcon,
  BanknotesIcon,
  ChartPieIcon,
  Cog8ToothIcon,
  CloudArrowUpIcon,
  DocumentDuplicateIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';

// Core Management Components
import { ReportsSystem } from './reports-system';
import { DatabaseManagement } from './database-management';
import { ExcelManagement } from './excel-management';
import { EnhancedTestsManagement } from './EnhancedTestsManagement';
import NewTestsManagement from './NewTestsManagement';
import { UserManagement } from './UserManagement';

// Advanced Management Components
import { ColorResultsManagement } from './color-results-management';
import { SubscriptionManagement } from './SubscriptionManagement';
import SubscriptionSettingsWrapper from './SubscriptionSettingsWrapper';
import { SubscriptionPlansManagement } from './SubscriptionPlansManagement';
import { EnhancedTestStepsManagement } from './EnhancedTestStepsManagement';
import { ChemicalComponentsManagement } from './ChemicalComponentsManagement';
import { TextEditorManagement } from './TextEditorManagement';

// System Components
import { FirebaseConnectionTest } from './FirebaseConnectionTest';
import FirebaseDebugger from './FirebaseDebugger';
import { STCPaySettings } from './STCPaySettings';
import { UsageChart } from './UsageChart';

interface ComprehensiveAdminDashboardProps {
  lang: Language;
}

interface DashboardStats {
  totalTests: number;
  totalUsers: number;
  totalSessions: number;
  systemHealth: string;
}

interface TabConfig {
  id: string;
  label: string;
  labelAr: string;
  icon: any;
  category: 'core' | 'advanced' | 'system';
  component?: React.ComponentType<any>;
}

export function ComprehensiveAdminDashboard({ lang }: ComprehensiveAdminDashboardProps) {
  const isRTL = lang === 'ar';
  const t = getTranslationsSync(lang) || {};
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats>({
    totalTests: 35,
    totalUsers: 156,
    totalSessions: 1247,
    systemHealth: 'good'
  });

  // Tab Configuration
  const tabsConfig: TabConfig[] = [
    // Overview
    { id: 'overview', label: 'Overview', labelAr: 'نظرة عامة', icon: ChartBarIcon, category: 'core' },
    
    // Core Management
    { id: 'tests', label: 'Tests Management', labelAr: 'إدارة الاختبارات', icon: BeakerIcon, category: 'core', component: EnhancedTestsManagement },
    { id: 'new-tests', label: 'New Tests', labelAr: 'اختبارات جديدة', icon: DocumentArrowUpIcon, category: 'core', component: NewTestsManagement },
    { id: 'users', label: 'Users Management', labelAr: 'إدارة المستخدمين', icon: UsersIcon, category: 'core', component: UserManagement },
    { id: 'database', label: 'Database Management', labelAr: 'إدارة قاعدة البيانات', icon: CircleStackIcon, category: 'core', component: DatabaseManagement },
    { id: 'subscriptions', label: 'Subscriptions', labelAr: 'إدارة الاشتراكات', icon: CreditCardIcon, category: 'core', component: SubscriptionManagement },
    { id: 'reports', label: 'Reports System', labelAr: 'نظام التقارير', icon: DocumentTextIcon, category: 'core', component: ReportsSystem },
    { id: 'excel', label: 'Excel Management', labelAr: 'إدارة Excel', icon: TableCellsIcon, category: 'core', component: ExcelManagement },
    
    // Advanced Management
    { id: 'colors', label: 'Color Results', labelAr: 'نتائج الألوان', icon: SwatchIcon, category: 'advanced', component: ColorResultsManagement },
    { id: 'test-steps', label: 'Test Steps', labelAr: 'خطوات الاختبار', icon: ListBulletIcon, category: 'advanced', component: EnhancedTestStepsManagement },
    { id: 'chemical-components', label: 'Chemical Components', labelAr: 'المكونات الكيميائية', icon: BeakerIcon, category: 'advanced', component: ChemicalComponentsManagement },
    { id: 'text-editor', label: 'Text Editor', labelAr: 'محرر النصوص', icon: PencilSquareIcon, category: 'advanced', component: TextEditorManagement },
    { id: 'subscription-plans', label: 'Subscription Plans', labelAr: 'خطط الاشتراك', icon: BanknotesIcon, category: 'advanced', component: SubscriptionPlansManagement },
    { id: 'subscription-settings', label: 'Subscription Settings', labelAr: 'إعدادات الاشتراك', icon: Cog6ToothIcon, category: 'advanced', component: SubscriptionSettingsWrapper },
    { id: 'usage-charts', label: 'Usage Analytics', labelAr: 'تحليلات الاستخدام', icon: ChartPieIcon, category: 'advanced', component: UsageChart },
    
    // System Management
    { id: 'firebase-connection', label: 'Firebase Connection', labelAr: 'اتصال Firebase', icon: CloudArrowUpIcon, category: 'system', component: FirebaseConnectionTest },
    { id: 'firebase-debugger', label: 'Firebase Debugger', labelAr: 'مصحح Firebase', icon: Cog8ToothIcon, category: 'system', component: FirebaseDebugger },
    { id: 'stc-pay', label: 'STC Pay Settings', labelAr: 'إعدادات STC Pay', icon: CreditCardIcon, category: 'system', component: STCPaySettings },
    { id: 'backup', label: 'Backup Management', labelAr: 'النسخ الاحتياطي', icon: DocumentDuplicateIcon, category: 'system' }
  ];

  useEffect(() => {
    const loadStats = async () => {
      try {
        // Simulate loading
        await new Promise(resolve => setTimeout(resolve, 1000));
        setLoading(false);
      } catch (error) {
        console.error('Error loading stats:', error);
        setLoading(false);
      }
    };
    loadStats();
  }, []);

  // Render Overview Tab
  const renderOverview = () => (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {isRTL ? 'إجمالي الاختبارات' : 'Total Tests'}
            </CardTitle>
            <BeakerIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalTests}</div>
            <p className="text-xs text-muted-foreground">
              {isRTL ? 'اختبار كيميائي متاح' : 'Chemical tests available'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {isRTL ? 'إجمالي المستخدمين' : 'Total Users'}
            </CardTitle>
            <UsersIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers}</div>
            <p className="text-xs text-muted-foreground">
              {isRTL ? 'مستخدم مسجل' : 'Registered users'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {isRTL ? 'إجمالي الجلسات' : 'Total Sessions'}
            </CardTitle>
            <ChartBarIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalSessions}</div>
            <p className="text-xs text-muted-foreground">
              {isRTL ? 'جلسة اختبار' : 'Test sessions'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {isRTL ? 'حالة النظام' : 'System Health'}
            </CardTitle>
            <CheckCircleIcon className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                {isRTL ? 'جيد' : 'Good'}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              {isRTL ? 'جميع الأنظمة تعمل' : 'All systems operational'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>{isRTL ? 'الإجراءات السريعة' : 'Quick Actions'}</CardTitle>
          <CardDescription>
            {isRTL ? 'الوظائف الأساسية لإدارة النظام' : 'Essential system management functions'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {tabsConfig.filter(tab => tab.category === 'core' && tab.id !== 'overview').slice(0, 4).map((tab) => (
              <Button 
                key={tab.id}
                variant="outline" 
                className="h-20 flex flex-col gap-2"
                onClick={() => setActiveTab(tab.id)}
              >
                <tab.icon className="w-6 h-6" />
                <span className="text-sm">{isRTL ? tab.labelAr : tab.label}</span>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  // Render Component for Tab
  const renderTabContent = (tabId: string) => {
    if (tabId === 'overview') {
      return renderOverview();
    }

    const tab = tabsConfig.find(t => t.id === tabId);
    if (!tab?.component) {
      return (
        <Card>
          <CardHeader>
            <CardTitle>{isRTL ? tab?.labelAr : tab?.label}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <Cog6ToothIcon className="w-12 h-12 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-500">
                {isRTL ? 'هذه الميزة قيد التطوير' : 'This feature is under development'}
              </p>
            </div>
          </CardContent>
        </Card>
      );
    }

    const Component = tab.component;
    return <Component lang={lang} isRTL={isRTL} />;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-500">
            {isRTL ? 'جاري التحميل...' : 'Loading...'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-gray-50 ${isRTL ? 'rtl' : 'ltr'}`}>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            {isRTL ? 'لوحة تحكم المدير الشاملة' : 'Comprehensive Admin Dashboard'}
          </h1>
          <p className="text-gray-600 mt-2">
            {isRTL ? 'إدارة شاملة لجميع جوانب النظام' : 'Complete management of all system aspects'}
          </p>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-1">
            {tabsConfig.map((tab) => (
              <TabsTrigger 
                key={tab.id} 
                value={tab.id}
                className="flex items-center gap-2 text-xs"
              >
                <tab.icon className="w-4 h-4" />
                <span className="hidden sm:inline">
                  {isRTL ? tab.labelAr : tab.label}
                </span>
              </TabsTrigger>
            ))}
          </TabsList>

          {/* Tab Contents */}
          {tabsConfig.map((tab) => (
            <TabsContent key={tab.id} value={tab.id}>
              {renderTabContent(tab.id)}
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </div>
  );
}
