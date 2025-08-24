'use client';

import { useState, useEffect } from 'react';
import { Language } from '@/types';
import { getTranslationsSync } from '@/lib/translations';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  ChartBarIcon,
  BeakerIcon,
  UsersIcon,
  CreditCardIcon,
  Cog6ToothIcon,
  DocumentTextIcon,
  EyeIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

interface SimpleAdminDashboardProps {
  lang: Language;
}

interface DashboardStats {
  totalTests: number;
  totalUsers: number;
  totalSessions: number;
  systemHealth: string;
}

export function SimpleAdminDashboard({ lang }: SimpleAdminDashboardProps) {
  const [stats, setStats] = useState<DashboardStats>({
    totalTests: 0,
    totalUsers: 0,
    totalSessions: 0,
    systemHealth: 'good'
  });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  const t = getTranslationsSync(lang) || {};
  const isRTL = lang === 'ar';

  useEffect(() => {
    // Load basic stats
    const loadStats = async () => {
      try {
        // Simulate loading stats
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        setStats({
          totalTests: 35,
          totalUsers: 156,
          totalSessions: 1247,
          systemHealth: 'good'
        });
      } catch (error) {
        console.error('Error loading stats:', error);
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, []);

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
            <Button variant="outline" className="h-20 flex flex-col gap-2">
              <BeakerIcon className="w-6 h-6" />
              <span className="text-sm">{isRTL ? 'إدارة الاختبارات' : 'Manage Tests'}</span>
            </Button>
            
            <Button variant="outline" className="h-20 flex flex-col gap-2">
              <UsersIcon className="w-6 h-6" />
              <span className="text-sm">{isRTL ? 'إدارة المستخدمين' : 'Manage Users'}</span>
            </Button>
            
            <Button variant="outline" className="h-20 flex flex-col gap-2">
              <CreditCardIcon className="w-6 h-6" />
              <span className="text-sm">{isRTL ? 'الاشتراكات' : 'Subscriptions'}</span>
            </Button>
            
            <Button variant="outline" className="h-20 flex flex-col gap-2">
              <Cog6ToothIcon className="w-6 h-6" />
              <span className="text-sm">{isRTL ? 'الإعدادات' : 'Settings'}</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* System Status */}
      <Card>
        <CardHeader>
          <CardTitle>{isRTL ? 'حالة النظام' : 'System Status'}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">{isRTL ? 'قاعدة البيانات' : 'Database'}</span>
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                {isRTL ? 'متصل' : 'Connected'}
              </Badge>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">{isRTL ? 'خدمة المصادقة' : 'Authentication Service'}</span>
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                {isRTL ? 'يعمل' : 'Running'}
              </Badge>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">{isRTL ? 'التخزين السحابي' : 'Cloud Storage'}</span>
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                {isRTL ? 'متاح' : 'Available'}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderComingSoon = (feature: string) => (
    <Card>
      <CardHeader>
        <CardTitle>{feature}</CardTitle>
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
            {isRTL ? 'لوحة تحكم المدير' : 'Admin Dashboard'}
          </h1>
          <p className="text-gray-600 mt-2">
            {isRTL ? 'إدارة النظام والمحتوى' : 'System and content management'}
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8 rtl:space-x-reverse">
              <button
                onClick={() => setActiveTab('overview')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'overview'
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {isRTL ? 'نظرة عامة' : 'Overview'}
              </button>
              
              <button
                onClick={() => setActiveTab('tests')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'tests'
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {isRTL ? 'الاختبارات' : 'Tests'}
              </button>
              
              <button
                onClick={() => setActiveTab('users')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'users'
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {isRTL ? 'المستخدمون' : 'Users'}
              </button>
            </nav>
          </div>
        </div>

        {/* Content */}
        <div>
          {activeTab === 'overview' && renderOverview()}
          {activeTab === 'tests' && renderComingSoon(isRTL ? 'إدارة الاختبارات' : 'Tests Management')}
          {activeTab === 'users' && renderComingSoon(isRTL ? 'إدارة المستخدمين' : 'Users Management')}
        </div>
      </div>
    </div>
  );
}
