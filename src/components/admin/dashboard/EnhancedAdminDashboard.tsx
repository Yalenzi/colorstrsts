'use client';

import React, { useState, useEffect } from 'react';
import { Language } from '@/types';
import { AdminLayout, AdminPageWrapper, AdminGrid, AdminStatsCard } from '../layout/AdminLayout';
import { AdminPieChart, AdminBarChart, AdminLineChart, AdminStatsOverview } from '../charts/AdminCharts';
import { AdminTable, TableColumn, TableAction } from '../tables/AdminTable';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  UsersIcon,
  BeakerIcon,
  BanknotesIcon as CreditCardIcon,
  ChartBarIcon,
  TrendingUpIcon,
  TrendingDownIcon,
  EyeIcon,
  PlusIcon,
  ArrowPathIcon,
  CalendarIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

interface EnhancedAdminDashboardProps {
  lang: Language;
}

// Mock data - في التطبيق الحقيقي، ستأتي من API
const mockStats = {
  totalUsers: 1247,
  totalTests: 35,
  activeSubscriptions: 89,
  monthlyRevenue: 12450,
  testsThisMonth: 2847,
  newUsersThisWeek: 23,
  conversionRate: 12.5,
  systemUptime: 99.9
};

const mockTestsData = [
  { label: 'Marquis Test', value: 450, color: '#3b82f6' },
  { label: 'Mecke Test', value: 320, color: '#10b981' },
  { label: 'Ehrlich Test', value: 280, color: '#f59e0b' },
  { label: 'Simon Test', value: 190, color: '#ef4444' },
  { label: 'Fast Blue B', value: 160, color: '#8b5cf6' }
];

const mockUsageData = [
  { date: '2024-01-15', value: 45 },
  { date: '2024-01-16', value: 52 },
  { date: '2024-01-17', value: 48 },
  { date: '2024-01-18', value: 61 },
  { date: '2024-01-19', value: 55 },
  { date: '2024-01-20', value: 67 },
  { date: '2024-01-21', value: 73 }
];

const mockRecentUsers = [
  {
    id: 1,
    name: 'أحمد محمد',
    email: 'ahmed@example.com',
    status: 'active',
    joinDate: '2024-01-20',
    testsCount: 5
  },
  {
    id: 2,
    name: 'Sarah Johnson',
    email: 'sarah@example.com',
    status: 'pending',
    joinDate: '2024-01-19',
    testsCount: 2
  },
  {
    id: 3,
    name: 'محمد علي',
    email: 'mohammed@example.com',
    status: 'active',
    joinDate: '2024-01-18',
    testsCount: 8
  }
];

const mockRecentActivity = [
  {
    id: 1,
    type: 'test_completed',
    user: 'أحمد محمد',
    action: 'completed Marquis Test',
    time: '5 minutes ago',
    status: 'success'
  },
  {
    id: 2,
    type: 'user_registered',
    user: 'Sarah Johnson',
    action: 'registered new account',
    time: '15 minutes ago',
    status: 'info'
  },
  {
    id: 3,
    type: 'subscription_created',
    user: 'محمد علي',
    action: 'subscribed to Pro plan',
    time: '1 hour ago',
    status: 'success'
  }
];

export function EnhancedAdminDashboard({ lang }: EnhancedAdminDashboardProps) {
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const isRTL = lang === 'ar';

  const texts = {
    title: isRTL ? 'لوحة التحكم الرئيسية' : 'Admin Dashboard',
    description: isRTL ? 'نظرة عامة على إحصائيات النظام والأنشطة الحديثة' : 'Overview of system statistics and recent activities',
    totalUsers: isRTL ? 'إجمالي المستخدمين' : 'Total Users',
    totalTests: isRTL ? 'إجمالي الاختبارات' : 'Total Tests',
    activeSubscriptions: isRTL ? 'الاشتراكات النشطة' : 'Active Subscriptions',
    monthlyRevenue: isRTL ? 'الإيرادات الشهرية' : 'Monthly Revenue',
    testsDistribution: isRTL ? 'توزيع الاختبارات' : 'Tests Distribution',
    dailyUsage: isRTL ? 'الاستخدام اليومي' : 'Daily Usage',
    recentUsers: isRTL ? 'المستخدمون الجدد' : 'Recent Users',
    recentActivity: isRTL ? 'النشاط الحديث' : 'Recent Activity',
    systemHealth: isRTL ? 'صحة النظام' : 'System Health',
    viewAll: isRTL ? 'عرض الكل' : 'View All',
    refresh: isRTL ? 'تحديث' : 'Refresh',
    addNew: isRTL ? 'إضافة جديد' : 'Add New',
    active: isRTL ? 'نشط' : 'Active',
    pending: isRTL ? 'معلق' : 'Pending',
    inactive: isRTL ? 'غير نشط' : 'Inactive'
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setRefreshing(false);
  };

  const userColumns: TableColumn[] = [
    {
      key: 'name',
      label: isRTL ? 'الاسم' : 'Name',
      sortable: true
    },
    {
      key: 'email',
      label: isRTL ? 'البريد الإلكتروني' : 'Email',
      sortable: true
    },
    {
      key: 'status',
      label: isRTL ? 'الحالة' : 'Status',
      render: (value) => (
        <Badge 
          variant={value === 'active' ? 'default' : value === 'pending' ? 'secondary' : 'destructive'}
        >
          {value === 'active' ? texts.active : value === 'pending' ? texts.pending : texts.inactive}
        </Badge>
      )
    },
    {
      key: 'testsCount',
      label: isRTL ? 'عدد الاختبارات' : 'Tests',
      align: 'center'
    }
  ];

  const userActions: TableAction[] = [
    {
      label: isRTL ? 'عرض' : 'View',
      icon: <EyeIcon className="h-4 w-4" />,
      onClick: (row) => console.log('View user:', row)
    }
  ];

  return (
    <AdminLayout lang={lang}>
      <AdminPageWrapper
        title={texts.title}
        description={texts.description}
        lang={lang}
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={refreshing}
            >
              <ArrowPathIcon className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
              {texts.refresh}
            </Button>
            <Button size="sm">
              <PlusIcon className="h-4 w-4 mr-2" />
              {texts.addNew}
            </Button>
          </div>
        }
      >
        {/* Stats Overview */}
        <AdminGrid cols="4" gap="normal">
          <AdminStatsCard
            title={texts.totalUsers}
            value={mockStats.totalUsers.toLocaleString()}
            change="+12.5%"
            changeType="positive"
            icon={<UsersIcon className="h-6 w-6 text-blue-600" />}
            lang={lang}
          />
          <AdminStatsCard
            title={texts.totalTests}
            value={mockStats.totalTests}
            change="+3"
            changeType="positive"
            icon={<BeakerIcon className="h-6 w-6 text-green-600" />}
            lang={lang}
          />
          <AdminStatsCard
            title={texts.activeSubscriptions}
            value={mockStats.activeSubscriptions}
            change="+8.2%"
            changeType="positive"
            icon={<CreditCardIcon className="h-6 w-6 text-purple-600" />}
            lang={lang}
          />
          <AdminStatsCard
            title={texts.monthlyRevenue}
            value={`$${mockStats.monthlyRevenue.toLocaleString()}`}
            change="+15.3%"
            changeType="positive"
            icon={<ChartBarIcon className="h-6 w-6 text-yellow-600" />}
            lang={lang}
          />
        </AdminGrid>

        {/* Charts Section */}
        <AdminGrid cols="2" gap="normal">
          <AdminPieChart
            data={mockTestsData}
            title={texts.testsDistribution}
            description={isRTL ? 'توزيع استخدام الاختبارات الكيميائية' : 'Distribution of chemical test usage'}
            lang={lang}
          />
          <AdminLineChart
            data={mockUsageData}
            title={texts.dailyUsage}
            description={isRTL ? 'إحصائيات الاستخدام اليومي للأسبوع الماضي' : 'Daily usage statistics for the past week'}
            lang={lang}
            trend="up"
          />
        </AdminGrid>

        {/* System Health Overview */}
        <AdminStatsOverview
          title={texts.systemHealth}
          lang={lang}
          stats={[
            {
              label: isRTL ? 'وقت التشغيل' : 'Uptime',
              value: `${mockStats.systemUptime}%`,
              change: '+0.1%',
              changeType: 'positive',
              icon: <CheckCircleIcon className="h-6 w-6 text-green-600" />
            },
            {
              label: isRTL ? 'الاختبارات هذا الشهر' : 'Tests This Month',
              value: mockStats.testsThisMonth.toLocaleString(),
              change: '+23%',
              changeType: 'positive',
              icon: <TrendingUpIcon className="h-6 w-6 text-blue-600" />
            },
            {
              label: isRTL ? 'مستخدمون جدد' : 'New Users',
              value: mockStats.newUsersThisWeek,
              change: '+5',
              changeType: 'positive',
              icon: <UsersIcon className="h-6 w-6 text-purple-600" />
            },
            {
              label: isRTL ? 'معدل التحويل' : 'Conversion Rate',
              value: `${mockStats.conversionRate}%`,
              change: '+2.1%',
              changeType: 'positive',
              icon: <ChartBarIcon className="h-6 w-6 text-yellow-600" />
            }
          ]}
        />

        {/* Tables Section */}
        <AdminGrid cols="2" gap="normal">
          <AdminTable
            data={mockRecentUsers}
            columns={userColumns}
            actions={userActions}
            title={texts.recentUsers}
            searchable={false}
            pagination={false}
            lang={lang}
          />
          
          {/* Recent Activity */}
          <div className="admin-card">
            <div className="admin-card-header">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  {texts.recentActivity}
                </h3>
                <Button variant="ghost" size="sm">
                  {texts.viewAll}
                </Button>
              </div>
            </div>
            <div className="admin-card-body space-y-4">
              {mockRecentActivity.map((activity) => (
                <div key={activity.id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800">
                  <div className={`w-2 h-2 rounded-full mt-2 ${
                    activity.status === 'success' ? 'bg-green-500' :
                    activity.status === 'info' ? 'bg-blue-500' :
                    'bg-yellow-500'
                  }`} />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {activity.user}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {activity.action}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                      {activity.time}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </AdminGrid>
      </AdminPageWrapper>
    </AdminLayout>
  );
}
