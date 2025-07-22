'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { UserManagement } from './UserManagement';
import { ReportsManagement } from './ReportsManagement';
import { SystemSettings } from './SystemSettings';
import { ExcelManagement } from './excel-management';
import { TestsManagement } from './tests-management';
import { ColorResultsManagement } from './color-results-management';
import { SubscriptionManagement } from './SubscriptionManagement';
import { UsageChart } from './UsageChart';
import { toast } from 'sonner';
import {
  Users,
  BarChart3,
  Settings,
  FileSpreadsheet,
  TestTube,
  Crown,
  TrendingUp,
  DollarSign,
  Palette,
  CreditCard,
  Shield,
  Activity,
  Database,
  Bell,
  Menu,
  X,
  Home,
  ChevronDown,
  Search,
  Moon,
  Sun
} from 'lucide-react';

interface AdminDashboardProps {
  lang: string;
}

interface DashboardStats {
  totalUsers: number;
  premiumUsers: number;
  totalTests: number;
  monthlyRevenue: number;
  growthRate: number;
  activeUsers: number;
  totalSessions: number;
  systemHealth: 'excellent' | 'good' | 'warning' | 'error';
}

export function AdminDashboard({ lang }: AdminDashboardProps) {
  const isRTL = lang === 'ar';
  const [activeTab, setActiveTab] = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    premiumUsers: 0,
    totalTests: 0,
    monthlyRevenue: 0,
    growthRate: 0,
    activeUsers: 0,
    totalSessions: 0,
    systemHealth: 'good'
  });

  // تحميل البيانات
  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      // محاكاة تحميل البيانات من قاعدة البيانات
      await new Promise(resolve => setTimeout(resolve, 1000));

      setStats({
        totalUsers: 156,
        premiumUsers: 34,
        totalTests: 1247,
        monthlyRevenue: 12450,
        growthRate: 15.3,
        activeUsers: 89,
        totalSessions: 2341,
        systemHealth: 'excellent'
      });

      toast.success(isRTL ? 'تم تحميل البيانات بنجاح' : 'Data loaded successfully');
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      toast.error(isRTL ? 'خطأ في تحميل البيانات' : 'Error loading data');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">
          {isRTL ? 'لوحة تحكم المدير' : 'Admin Dashboard'}
        </h1>
        <div className="text-sm text-gray-600">
          {isRTL ? 'آخر تحديث: الآن' : 'Last updated: Now'}
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            {isRTL ? 'نظرة عامة' : 'Overview'}
          </TabsTrigger>
          <TabsTrigger value="users" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            {isRTL ? 'المستخدمين' : 'Users'}
          </TabsTrigger>
          <TabsTrigger value="reports" className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            {isRTL ? 'التقارير' : 'Reports'}
          </TabsTrigger>
          <TabsTrigger value="excel" className="flex items-center gap-2">
            <FileSpreadsheet className="w-4 h-4" />
            {isRTL ? 'Excel' : 'Excel'}
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Settings className="w-4 h-4" />
            {isRTL ? 'الإعدادات' : 'Settings'}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* إحصائيات سريعة */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <Users className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{stats.totalUsers}</p>
                    <p className="text-sm text-gray-600">{isRTL ? 'إجمالي المستخدمين' : 'Total Users'}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-green-100 rounded-lg">
                    <Crown className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{stats.premiumUsers}</p>
                    <p className="text-sm text-gray-600">{isRTL ? 'مشتركين مميزين' : 'Premium Users'}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-purple-100 rounded-lg">
                    <TestTube className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{stats.totalTests}</p>
                    <p className="text-sm text-gray-600">{isRTL ? 'إجمالي الاختبارات' : 'Total Tests'}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-yellow-100 rounded-lg">
                    <DollarSign className="w-6 h-6 text-yellow-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{stats.monthlyRevenue.toLocaleString()}</p>
                    <p className="text-sm text-gray-600">{isRTL ? 'الإيرادات الشهرية (ريال)' : 'Monthly Revenue (SAR)'}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* الرسوم البيانية والتحليلات */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  {isRTL ? 'نمو المستخدمين' : 'User Growth'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span>{isRTL ? 'معدل النمو الشهري' : 'Monthly Growth Rate'}</span>
                    <span className="text-green-600 font-bold">+{stats.growthRate}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-600 h-2 rounded-full" 
                      style={{ width: `${stats.growthRate}%` }}
                    ></div>
                  </div>
                  <p className="text-sm text-gray-600">
                    {isRTL ? 'نمو ممتاز مقارنة بالشهر الماضي' : 'Excellent growth compared to last month'}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TestTube className="w-5 h-5" />
                  {isRTL ? 'الاختبارات الشائعة' : 'Popular Tests'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { name: 'Marquis Test', nameAr: 'اختبار ماركيز', usage: 85 },
                    { name: 'Mecke Test', nameAr: 'اختبار ميك', usage: 72 },
                    { name: 'Mandelin Test', nameAr: 'اختبار مانديلين', usage: 68 }
                  ].map((test, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-sm">{isRTL ? test.nameAr : test.name}</span>
                      <div className="flex items-center gap-2">
                        <div className="w-20 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full" 
                            style={{ width: `${test.usage}%` }}
                          ></div>
                        </div>
                        <span className="text-xs text-gray-600">{test.usage}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* إجراءات سريعة */}
          <Card>
            <CardHeader>
              <CardTitle>{isRTL ? 'إجراءات سريعة' : 'Quick Actions'}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Button 
                  onClick={() => setActiveTab('users')}
                  variant="outline" 
                  className="h-20 flex flex-col gap-2"
                >
                  <Users className="w-6 h-6" />
                  <span className="text-sm">{isRTL ? 'إدارة المستخدمين' : 'Manage Users'}</span>
                </Button>
                
                <Button 
                  onClick={() => setActiveTab('reports')}
                  variant="outline" 
                  className="h-20 flex flex-col gap-2"
                >
                  <BarChart3 className="w-6 h-6" />
                  <span className="text-sm">{isRTL ? 'عرض التقارير' : 'View Reports'}</span>
                </Button>
                
                <Button 
                  onClick={() => setActiveTab('excel')}
                  variant="outline" 
                  className="h-20 flex flex-col gap-2"
                >
                  <FileSpreadsheet className="w-6 h-6" />
                  <span className="text-sm">{isRTL ? 'إدارة Excel' : 'Excel Management'}</span>
                </Button>
                
                <Button 
                  onClick={() => setActiveTab('settings')}
                  variant="outline" 
                  className="h-20 flex flex-col gap-2"
                >
                  <Settings className="w-6 h-6" />
                  <span className="text-sm">{isRTL ? 'إعدادات النظام' : 'System Settings'}</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users">
          <UserManagement lang={lang} />
        </TabsContent>

        <TabsContent value="reports">
          <ReportsManagement lang={lang} />
        </TabsContent>

        <TabsContent value="excel">
          <ExcelManagement lang={lang} />
        </TabsContent>

        <TabsContent value="settings">
          <SystemSettings lang={lang} />
        </TabsContent>
      </Tabs>
    </div>
  );
}