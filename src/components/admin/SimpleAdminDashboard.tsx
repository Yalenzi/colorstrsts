'use client';

import React, { useState } from 'react';
import { Language } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  UsersIcon,
  BeakerIcon,
  CreditCardIcon,
  ChartBarIcon,
  EyeIcon,
  PlusIcon,
  ArrowPathIcon,
  BellIcon,
  SunIcon,
  MoonIcon
} from '@heroicons/react/24/outline';

interface SimpleAdminDashboardProps {
  lang: Language;
}

export function SimpleAdminDashboard({ lang }: SimpleAdminDashboardProps) {
  const [darkMode, setDarkMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const isRTL = lang === 'ar';

  const texts = {
    title: isRTL ? 'لوحة التحكم الإدارية المحسنة' : 'Enhanced Admin Dashboard',
    description: isRTL ? 'نظرة عامة شاملة على إحصائيات النظام' : 'Comprehensive system overview',
    totalUsers: isRTL ? 'إجمالي المستخدمين' : 'Total Users',
    totalTests: isRTL ? 'إجمالي الاختبارات' : 'Total Tests',
    activeSubscriptions: isRTL ? 'الاشتراكات النشطة' : 'Active Subscriptions',
    monthlyRevenue: isRTL ? 'الإيرادات الشهرية' : 'Monthly Revenue',
    recentUsers: isRTL ? 'المستخدمون الجدد' : 'Recent Users',
    systemHealth: isRTL ? 'صحة النظام' : 'System Health',
    viewAll: isRTL ? 'عرض الكل' : 'View All',
    refresh: isRTL ? 'تحديث' : 'Refresh',
    addNew: isRTL ? 'إضافة جديد' : 'Add New',
    active: isRTL ? 'نشط' : 'Active',
    pending: isRTL ? 'معلق' : 'Pending',
    darkMode: isRTL ? 'الوضع المظلم' : 'Dark Mode',
    lightMode: isRTL ? 'الوضع الفاتح' : 'Light Mode'
  };

  const handleRefresh = async () => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setLoading(false);
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    document.documentElement.classList.toggle('dark');
  };

  const mockStats = [
    {
      title: texts.totalUsers,
      value: '1,247',
      change: '+12.5%',
      changeType: 'positive' as const,
      icon: <UsersIcon className="h-6 w-6 text-blue-600" />
    },
    {
      title: texts.totalTests,
      value: '35',
      change: '+3',
      changeType: 'positive' as const,
      icon: <BeakerIcon className="h-6 w-6 text-green-600" />
    },
    {
      title: texts.activeSubscriptions,
      value: '89',
      change: '+8.2%',
      changeType: 'positive' as const,
      icon: <CreditCardIcon className="h-6 w-6 text-purple-600" />
    },
    {
      title: texts.monthlyRevenue,
      value: '$12,450',
      change: '+15.3%',
      changeType: 'positive' as const,
      icon: <ChartBarIcon className="h-6 w-6 text-yellow-600" />
    }
  ];

  const mockUsers = [
    { name: 'أحمد محمد', email: 'ahmed@example.com', status: 'active', tests: 5 },
    { name: 'Sarah Johnson', email: 'sarah@example.com', status: 'pending', tests: 2 },
    { name: 'محمد علي', email: 'mohammed@example.com', status: 'active', tests: 8 }
  ];

  return (
    <div className={`min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300 ${darkMode ? 'dark' : ''}`} dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Enhanced Header */}
      <header className="bg-white dark:bg-gray-800 shadow-lg border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center">
                  <BeakerIcon className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                    {isRTL ? 'إدارة الاختبارات الكيميائية' : 'Chemical Tests Admin'}
                  </h1>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {texts.description}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleDarkMode}
                className="p-2"
                title={darkMode ? texts.lightMode : texts.darkMode}
              >
                {darkMode ? <SunIcon className="h-5 w-5" /> : <MoonIcon className="h-5 w-5" />}
              </Button>
              
              <Button variant="ghost" size="sm" className="p-2">
                <BellIcon className="h-5 w-5" />
              </Button>
              
              <Button variant="ghost" size="sm" className="p-2">
                <ChartBarIcon className="h-5 w-5" />
              </Button>
              
              <div className="h-8 w-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
                A
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
              {texts.title}
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              {texts.description}
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={loading}
              className="transition-all duration-200 hover:scale-105"
            >
              <ArrowPathIcon className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              {texts.refresh}
            </Button>
            <Button size="sm" className="transition-all duration-200 hover:scale-105">
              <PlusIcon className="h-4 w-4 mr-2" />
              {texts.addNew}
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {mockStats.map((stat, index) => (
            <Card key={index} className="transition-all duration-200 hover:shadow-lg hover:-translate-y-1">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      {stat.title}
                    </p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
                      {stat.value}
                    </p>
                    <div className="flex items-center mt-2">
                      <ArrowPathIcon className="h-4 w-4 text-green-600 mr-1" />
                      <span className="text-sm font-medium text-green-600">
                        {stat.change}
                      </span>
                    </div>
                  </div>
                  <div className="p-3 bg-gray-100 dark:bg-gray-700 rounded-lg">
                    {stat.icon}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Charts and Tables */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* System Health */}
          <Card className="transition-all duration-200 hover:shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ChartBarIcon className="h-5 w-5 text-blue-600" />
                {texts.systemHealth}
              </CardTitle>
              <CardDescription>
                {isRTL ? 'مؤشرات الأداء الرئيسية' : 'Key performance indicators'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{isRTL ? 'وقت التشغيل' : 'Uptime'}</span>
                  <span className="text-sm font-bold text-green-600">99.9%</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div className="bg-green-600 h-2 rounded-full" style={{ width: '99.9%' }}></div>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{isRTL ? 'استخدام الذاكرة' : 'Memory Usage'}</span>
                  <span className="text-sm font-bold text-blue-600">67%</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div className="bg-blue-600 h-2 rounded-full" style={{ width: '67%' }}></div>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{isRTL ? 'استخدام المعالج' : 'CPU Usage'}</span>
                  <span className="text-sm font-bold text-yellow-600">45%</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div className="bg-yellow-600 h-2 rounded-full" style={{ width: '45%' }}></div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recent Users */}
          <Card className="transition-all duration-200 hover:shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <UsersIcon className="h-5 w-5 text-purple-600" />
                  {texts.recentUsers}
                </div>
                <Button variant="ghost" size="sm">
                  {texts.viewAll}
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockUsers.map((user, index) => (
                  <div key={index} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
                        {user.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">{user.name}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{user.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={user.status === 'active' ? 'default' : 'secondary'}>
                        {user.status === 'active' ? texts.active : texts.pending}
                      </Badge>
                      <Button variant="ghost" size="sm">
                        <EyeIcon className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
