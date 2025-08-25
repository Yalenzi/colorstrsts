'use client';

import { useState, useEffect } from 'react';
import { Language } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

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
  CheckCircleIcon,
  ShieldCheckIcon,
  CubeIcon
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

interface OrganizedAdminDashboardProps {
  lang: Language;
}

interface TabConfig {
  id: string;
  label: string;
  labelAr: string;
  icon: React.ComponentType<any>;
  category: 'overview' | 'tests' | 'data' | 'users' | 'system';
  component?: React.ComponentType<any>;
  description?: string;
  descriptionAr?: string;
}

export function OrganizedAdminDashboard({ lang }: OrganizedAdminDashboardProps) {
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const isRTL = lang === 'ar';

  const [stats, setStats] = useState({
    totalTests: 35,
    totalUsers: 156,
    totalSessions: 1247,
    systemHealth: 'good'
  });

  // تكوين التبويبات المنظمة
  const tabsConfig: TabConfig[] = [
    // نظرة عامة
    { 
      id: 'overview', 
      label: 'Overview', 
      labelAr: 'نظرة عامة', 
      icon: ChartBarIcon, 
      category: 'overview',
      description: 'System overview and statistics',
      descriptionAr: 'نظرة عامة على النظام والإحصائيات'
    },
    
    // إدارة الاختبارات
    { 
      id: 'tests-management', 
      label: 'Tests Management', 
      labelAr: 'إدارة الاختبارات', 
      icon: BeakerIcon, 
      category: 'tests',
      component: EnhancedTestsManagement,
      description: 'Manage chemical tests and procedures',
      descriptionAr: 'إدارة الاختبارات الكيميائية والإجراءات'
    },
    { 
      id: 'test-steps', 
      label: 'Test Steps', 
      labelAr: 'خطوات الاختبار', 
      icon: ListBulletIcon, 
      category: 'tests',
      component: EnhancedTestStepsManagement,
      description: 'Manage test procedures and instructions',
      descriptionAr: 'إدارة إجراءات الاختبار والتعليمات'
    },
    { 
      id: 'chemical-components', 
      label: 'Chemical Components', 
      labelAr: 'المكونات الكيميائية', 
      icon: CubeIcon, 
      category: 'tests',
      component: ChemicalComponentsManagement,
      description: 'Manage chemical substances and reagents',
      descriptionAr: 'إدارة المواد الكيميائية والكواشف'
    },
    { 
      id: 'color-results', 
      label: 'Color Results', 
      labelAr: 'نتائج الألوان', 
      icon: SwatchIcon, 
      category: 'tests',
      component: ColorResultsManagement,
      description: 'Manage test color results and interpretations',
      descriptionAr: 'إدارة نتائج ألوان الاختبارات والتفسيرات'
    },
    
    // إدارة البيانات
    { 
      id: 'database', 
      label: 'Database Management', 
      labelAr: 'إدارة قاعدة البيانات', 
      icon: CircleStackIcon, 
      category: 'data',
      component: DatabaseManagement,
      description: 'Database operations and maintenance',
      descriptionAr: 'عمليات قاعدة البيانات والصيانة'
    },
    { 
      id: 'excel', 
      label: 'Excel Management', 
      labelAr: 'إدارة Excel', 
      icon: TableCellsIcon, 
      category: 'data',
      component: ExcelManagement,
      description: 'Import and export Excel files',
      descriptionAr: 'استيراد وتصدير ملفات Excel'
    },
    { 
      id: 'reports', 
      label: 'Reports System', 
      labelAr: 'نظام التقارير', 
      icon: DocumentTextIcon, 
      category: 'data',
      component: ReportsSystem,
      description: 'Generate and manage reports',
      descriptionAr: 'إنشاء وإدارة التقارير'
    },
    
    // إدارة المستخدمين
    { 
      id: 'users', 
      label: 'Users Management', 
      labelAr: 'إدارة المستخدمين', 
      icon: UsersIcon, 
      category: 'users',
      component: UserManagement,
      description: 'Manage user accounts and permissions',
      descriptionAr: 'إدارة حسابات المستخدمين والصلاحيات'
    },
    { 
      id: 'subscriptions', 
      label: 'Subscriptions', 
      labelAr: 'إدارة الاشتراكات', 
      icon: CreditCardIcon, 
      category: 'users',
      component: SubscriptionManagement,
      description: 'Manage user subscriptions and billing',
      descriptionAr: 'إدارة اشتراكات المستخدمين والفواتير'
    },
    { 
      id: 'subscription-plans', 
      label: 'Subscription Plans', 
      labelAr: 'خطط الاشتراك', 
      icon: BanknotesIcon, 
      category: 'users',
      component: SubscriptionPlansManagement,
      description: 'Configure subscription plans and pricing',
      descriptionAr: 'تكوين خطط الاشتراك والأسعار'
    },
    
    // إدارة النظام
    { 
      id: 'subscription-settings', 
      label: 'Subscription Settings', 
      labelAr: 'إعدادات الاشتراك', 
      icon: Cog6ToothIcon, 
      category: 'system',
      component: SubscriptionSettingsWrapper,
      description: 'Configure subscription system settings',
      descriptionAr: 'تكوين إعدادات نظام الاشتراك'
    },
    { 
      id: 'text-editor', 
      label: 'Text Editor', 
      labelAr: 'محرر النصوص', 
      icon: PencilSquareIcon, 
      category: 'system',
      component: TextEditorManagement,
      description: 'Manage system texts and translations',
      descriptionAr: 'إدارة نصوص النظام والترجمات'
    }
  ];

  useEffect(() => {
    const loadStats = async () => {
      try {
        // محاكاة تحميل الإحصائيات
        await new Promise(resolve => setTimeout(resolve, 1000));
        setLoading(false);
      } catch (error) {
        console.error('Error loading stats:', error);
        setLoading(false);
      }
    };

    loadStats();
  }, []);

  const renderOverview = () => (
    <div className="space-y-6">
      {/* إحصائيات سريعة */}
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
              {isRTL ? 'اختبار كيميائي' : 'Chemical tests'}
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

      {/* أقسام سريعة */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* إدارة الاختبارات */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BeakerIcon className="h-5 w-5 text-blue-600" />
              {isRTL ? 'إدارة الاختبارات' : 'Tests Management'}
            </CardTitle>
            <CardDescription>
              {isRTL ? 'إدارة الاختبارات الكيميائية والمكونات' : 'Manage chemical tests and components'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button 
              variant="outline" 
              className="w-full justify-start"
              onClick={() => setActiveTab('tests-management')}
            >
              <BeakerIcon className="h-4 w-4 mr-2" />
              {isRTL ? 'إدارة الاختبارات' : 'Tests Management'}
            </Button>
            <Button 
              variant="outline" 
              className="w-full justify-start"
              onClick={() => setActiveTab('test-steps')}
            >
              <ListBulletIcon className="h-4 w-4 mr-2" />
              {isRTL ? 'خطوات الاختبار' : 'Test Steps'}
            </Button>
            <Button 
              variant="outline" 
              className="w-full justify-start"
              onClick={() => setActiveTab('chemical-components')}
            >
              <CubeIcon className="h-4 w-4 mr-2" />
              {isRTL ? 'المكونات الكيميائية' : 'Chemical Components'}
            </Button>
            <Button 
              variant="outline" 
              className="w-full justify-start"
              onClick={() => setActiveTab('color-results')}
            >
              <SwatchIcon className="h-4 w-4 mr-2" />
              {isRTL ? 'نتائج الألوان' : 'Color Results'}
            </Button>
          </CardContent>
        </Card>

        {/* إدارة البيانات */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CircleStackIcon className="h-5 w-5 text-green-600" />
              {isRTL ? 'إدارة البيانات' : 'Data Management'}
            </CardTitle>
            <CardDescription>
              {isRTL ? 'إدارة قواعد البيانات والتقارير' : 'Manage databases and reports'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button 
              variant="outline" 
              className="w-full justify-start"
              onClick={() => setActiveTab('database')}
            >
              <CircleStackIcon className="h-4 w-4 mr-2" />
              {isRTL ? 'إدارة قاعدة البيانات' : 'Database Management'}
            </Button>
            <Button 
              variant="outline" 
              className="w-full justify-start"
              onClick={() => setActiveTab('excel')}
            >
              <TableCellsIcon className="h-4 w-4 mr-2" />
              {isRTL ? 'إدارة Excel' : 'Excel Management'}
            </Button>
            <Button 
              variant="outline" 
              className="w-full justify-start"
              onClick={() => setActiveTab('reports')}
            >
              <DocumentTextIcon className="h-4 w-4 mr-2" />
              {isRTL ? 'نظام التقارير' : 'Reports System'}
            </Button>
          </CardContent>
        </Card>

        {/* إدارة المستخدمين */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UsersIcon className="h-5 w-5 text-purple-600" />
              {isRTL ? 'إدارة المستخدمين' : 'User Management'}
            </CardTitle>
            <CardDescription>
              {isRTL ? 'إدارة المستخدمين والاشتراكات' : 'Manage users and subscriptions'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button 
              variant="outline" 
              className="w-full justify-start"
              onClick={() => setActiveTab('users')}
            >
              <UsersIcon className="h-4 w-4 mr-2" />
              {isRTL ? 'إدارة المستخدمين' : 'Users Management'}
            </Button>
            <Button 
              variant="outline" 
              className="w-full justify-start"
              onClick={() => setActiveTab('subscriptions')}
            >
              <CreditCardIcon className="h-4 w-4 mr-2" />
              {isRTL ? 'إدارة الاشتراكات' : 'Subscriptions'}
            </Button>
            <Button 
              variant="outline" 
              className="w-full justify-start"
              onClick={() => setActiveTab('subscription-plans')}
            >
              <BanknotesIcon className="h-4 w-4 mr-2" />
              {isRTL ? 'خطط الاشتراك' : 'Subscription Plans'}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* تنبيهات النظام */}
      <Alert>
        <CheckCircleIcon className="h-4 w-4" />
        <AlertDescription>
          {isRTL 
            ? 'جميع الأنظمة تعمل بشكل طبيعي. آخر تحديث: اليوم'
            : 'All systems are operating normally. Last updated: Today'
          }
        </AlertDescription>
      </Alert>
    </div>
  );

  const renderTabContent = (tabId: string) => {
    if (tabId === 'overview') {
      return renderOverview();
    }

    const tab = tabsConfig.find(t => t.id === tabId);
    if (!tab?.component) {
      return (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <tab?.icon className="h-5 w-5" />
              {isRTL ? tab?.labelAr : tab?.label}
            </CardTitle>
            <CardDescription>
              {isRTL ? tab?.descriptionAr : tab?.description}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Alert>
              <ExclamationTriangleIcon className="h-4 w-4" />
              <AlertDescription>
                {isRTL 
                  ? 'هذا القسم قيد التطوير'
                  : 'This section is under development'
                }
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      );
    }

    const Component = tab.component;
    return <Component lang={lang} />;
  };

  const getCategoryTabs = (category: string) => {
    return tabsConfig.filter(tab => tab.category === category);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">
            {isRTL ? 'جاري تحميل لوحة التحكم...' : 'Loading admin dashboard...'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${isRTL ? 'rtl' : 'ltr'}`}>
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          {isRTL ? 'لوحة التحكم الشاملة' : 'Comprehensive Admin Dashboard'}
        </h1>
        <p className="text-gray-600">
          {isRTL ? 'إدارة شاملة لجميع جوانب النظام' : 'Complete system management interface'}
        </p>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-1">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <ChartBarIcon className="w-4 h-4" />
            <span className="hidden sm:inline">
              {isRTL ? 'نظرة عامة' : 'Overview'}
            </span>
          </TabsTrigger>
          <TabsTrigger value="tests-category" className="flex items-center gap-2">
            <BeakerIcon className="w-4 h-4" />
            <span className="hidden sm:inline">
              {isRTL ? 'الاختبارات' : 'Tests'}
            </span>
          </TabsTrigger>
          <TabsTrigger value="data-category" className="flex items-center gap-2">
            <CircleStackIcon className="w-4 h-4" />
            <span className="hidden sm:inline">
              {isRTL ? 'البيانات' : 'Data'}
            </span>
          </TabsTrigger>
          <TabsTrigger value="users-category" className="flex items-center gap-2">
            <UsersIcon className="w-4 h-4" />
            <span className="hidden sm:inline">
              {isRTL ? 'المستخدمين' : 'Users'}
            </span>
          </TabsTrigger>
          <TabsTrigger value="system-category" className="flex items-center gap-2">
            <Cog8ToothIcon className="w-4 h-4" />
            <span className="hidden sm:inline">
              {isRTL ? 'النظام' : 'System'}
            </span>
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview">
          {renderOverview()}
        </TabsContent>

        {/* Tests Category */}
        <TabsContent value="tests-category">
          <Tabs defaultValue="tests-management" className="space-y-4">
            <TabsList className="grid w-full grid-cols-2 md:grid-cols-4">
              {getCategoryTabs('tests').map((tab) => (
                <TabsTrigger key={tab.id} value={tab.id} className="flex items-center gap-2 text-xs">
                  <tab.icon className="w-4 h-4" />
                  <span className="hidden sm:inline">
                    {isRTL ? tab.labelAr : tab.label}
                  </span>
                </TabsTrigger>
              ))}
            </TabsList>
            {getCategoryTabs('tests').map((tab) => (
              <TabsContent key={tab.id} value={tab.id}>
                {tab.component ? <tab.component lang={lang} /> : (
                  <Card>
                    <CardContent className="pt-6">
                      <Alert>
                        <ExclamationTriangleIcon className="h-4 w-4" />
                        <AlertDescription>
                          {isRTL ? 'هذا القسم قيد التطوير' : 'This section is under development'}
                        </AlertDescription>
                      </Alert>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>
            ))}
          </Tabs>
        </TabsContent>

        {/* Data Category */}
        <TabsContent value="data-category">
          <Tabs defaultValue="database" className="space-y-4">
            <TabsList className="grid w-full grid-cols-1 md:grid-cols-3">
              {getCategoryTabs('data').map((tab) => (
                <TabsTrigger key={tab.id} value={tab.id} className="flex items-center gap-2">
                  <tab.icon className="w-4 h-4" />
                  {isRTL ? tab.labelAr : tab.label}
                </TabsTrigger>
              ))}
            </TabsList>
            {getCategoryTabs('data').map((tab) => (
              <TabsContent key={tab.id} value={tab.id}>
                {tab.component ? <tab.component lang={lang} /> : (
                  <Card>
                    <CardContent className="pt-6">
                      <Alert>
                        <ExclamationTriangleIcon className="h-4 w-4" />
                        <AlertDescription>
                          {isRTL ? 'هذا القسم قيد التطوير' : 'This section is under development'}
                        </AlertDescription>
                      </Alert>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>
            ))}
          </Tabs>
        </TabsContent>

        {/* Users Category */}
        <TabsContent value="users-category">
          <Tabs defaultValue="users" className="space-y-4">
            <TabsList className="grid w-full grid-cols-1 md:grid-cols-3">
              {getCategoryTabs('users').map((tab) => (
                <TabsTrigger key={tab.id} value={tab.id} className="flex items-center gap-2">
                  <tab.icon className="w-4 h-4" />
                  {isRTL ? tab.labelAr : tab.label}
                </TabsTrigger>
              ))}
            </TabsList>
            {getCategoryTabs('users').map((tab) => (
              <TabsContent key={tab.id} value={tab.id}>
                {tab.component ? <tab.component lang={lang} /> : (
                  <Card>
                    <CardContent className="pt-6">
                      <Alert>
                        <ExclamationTriangleIcon className="h-4 w-4" />
                        <AlertDescription>
                          {isRTL ? 'هذا القسم قيد التطوير' : 'This section is under development'}
                        </AlertDescription>
                      </Alert>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>
            ))}
          </Tabs>
        </TabsContent>

        {/* System Category */}
        <TabsContent value="system-category">
          <Tabs defaultValue="subscription-settings" className="space-y-4">
            <TabsList className="grid w-full grid-cols-1 md:grid-cols-2">
              {getCategoryTabs('system').map((tab) => (
                <TabsTrigger key={tab.id} value={tab.id} className="flex items-center gap-2">
                  <tab.icon className="w-4 h-4" />
                  {isRTL ? tab.labelAr : tab.label}
                </TabsTrigger>
              ))}
            </TabsList>
            {getCategoryTabs('system').map((tab) => (
              <TabsContent key={tab.id} value={tab.id}>
                {tab.component ? <tab.component lang={lang} /> : (
                  <Card>
                    <CardContent className="pt-6">
                      <Alert>
                        <ExclamationTriangleIcon className="h-4 w-4" />
                        <AlertDescription>
                          {isRTL ? 'هذا القسم قيد التطوير' : 'This section is under development'}
                        </AlertDescription>
                      </Alert>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>
            ))}
          </Tabs>
        </TabsContent>
      </Tabs>
    </div>
  );
}
