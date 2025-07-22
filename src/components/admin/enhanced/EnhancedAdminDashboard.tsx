'use client';

import React, { useState, useEffect } from 'react';
import { Language } from '@/types';
import { AdminLayout, AdminPageWrapper, AdminGrid, AdminStatsCard } from '../layout/AdminLayout';
import { AdminPieChart, AdminBarChart, AdminLineChart, AdminStatsOverview } from '../charts/AdminCharts';
import { AdminTable, TableColumn, TableAction } from '../tables/AdminTable';
import { AdminFadeIn, AdminStaggerContainer, AdminCountUp } from '../animations/AdminAnimations';
import { AdminNotificationProvider, useAdminNotifications } from '../notifications/AdminNotifications';
import { useResponsive, AdminResponsiveGrid, AdminResponsiveCard } from '../responsive/AdminResponsive';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  UsersIcon,
  BeakerIcon,
  CreditCardIcon,
  ChartBarIcon,
  TrendingUpIcon,
  TrendingDownIcon,
  EyeIcon,
  PlusIcon,
  ArrowPathIcon,
  CalendarIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  BellIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';

interface EnhancedAdminDashboardProps {
  lang: Language;
}

// Enhanced mock data with real-time updates
const useRealTimeStats = () => {
  const [stats, setStats] = useState({
    totalUsers: 1247,
    totalTests: 35,
    activeSubscriptions: 89,
    monthlyRevenue: 12450,
    testsThisMonth: 2847,
    newUsersThisWeek: 23,
    conversionRate: 12.5,
    systemUptime: 99.9
  });

  useEffect(() => {
    // Simulate real-time updates
    const interval = setInterval(() => {
      setStats(prev => ({
        ...prev,
        totalUsers: prev.totalUsers + Math.floor(Math.random() * 3),
        testsThisMonth: prev.testsThisMonth + Math.floor(Math.random() * 5),
        newUsersThisWeek: prev.newUsersThisWeek + Math.floor(Math.random() * 2)
      }));
    }, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, []);

  return stats;
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
    testsCount: 5,
    avatar: ''
  },
  {
    id: 2,
    name: 'Sarah Johnson',
    email: 'sarah@example.com',
    status: 'pending',
    joinDate: '2024-01-19',
    testsCount: 2,
    avatar: ''
  },
  {
    id: 3,
    name: 'محمد علي',
    email: 'mohammed@example.com',
    status: 'active',
    joinDate: '2024-01-18',
    testsCount: 8,
    avatar: ''
  }
];

function DashboardContent({ lang }: { lang: Language }) {
  const stats = useRealTimeStats();
  const { addNotification } = useAdminNotifications();
  const { isMobile, isTablet } = useResponsive();
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const isRTL = lang === 'ar';

  const texts = {
    title: isRTL ? 'لوحة التحكم الرئيسية' : 'Enhanced Admin Dashboard',
    description: isRTL ? 'نظرة عامة شاملة على إحصائيات النظام والأنشطة الحديثة' : 'Comprehensive overview of system statistics and recent activities',
    totalUsers: isRTL ? 'إجمالي المستخدمين' : 'Total Users',
    totalTests: isRTL ? 'إجمالي الاختبارات' : 'Total Tests',
    activeSubscriptions: isRTL ? 'الاشتراكات النشطة' : 'Active Subscriptions',
    monthlyRevenue: isRTL ? 'الإيرادات الشهرية' : 'Monthly Revenue',
    testsDistribution: isRTL ? 'توزيع الاختبارات' : 'Tests Distribution',
    dailyUsage: isRTL ? 'الاستخدام اليومي' : 'Daily Usage',
    recentUsers: isRTL ? 'المستخدمون الجدد' : 'Recent Users',
    systemHealth: isRTL ? 'صحة النظام' : 'System Health',
    viewAll: isRTL ? 'عرض الكل' : 'View All',
    refresh: isRTL ? 'تحديث' : 'Refresh',
    addNew: isRTL ? 'إضافة جديد' : 'Add New',
    active: isRTL ? 'نشط' : 'Active',
    pending: isRTL ? 'معلق' : 'Pending',
    testNotification: isRTL ? 'إشعار تجريبي' : 'Test Notification'
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setRefreshing(false);
    
    addNotification({
      type: 'success',
      title: isRTL ? 'تم التحديث' : 'Refreshed',
      message: isRTL ? 'تم تحديث البيانات بنجاح' : 'Data refreshed successfully'
    });
  };

  const handleTestNotification = () => {
    addNotification({
      type: 'info',
      title: texts.testNotification,
      message: isRTL ? 'هذا إشعار تجريبي لاختبار النظام' : 'This is a test notification to demonstrate the system',
      action: {
        label: isRTL ? 'عرض التفاصيل' : 'View Details',
        onClick: () => console.log('Notification action clicked')
      }
    });
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
          {value === 'active' ? texts.active : texts.pending}
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

  // Responsive grid columns
  const getGridCols = () => {
    if (isMobile) return { xs: 1, sm: 2 };
    if (isTablet) return { xs: 1, sm: 2, md: 3 };
    return { xs: 1, sm: 2, md: 3, lg: 4 };
  };

  return (
    <AdminPageWrapper
      title={texts.title}
      description={texts.description}
      lang={lang}
      actions={
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleTestNotification}
          >
            <BellIcon className="h-4 w-4 mr-2" />
            {texts.testNotification}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={refreshing}
          >
            <ArrowPathIcon className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            {texts.refresh}
          </Button>
          <Button size="sm">
            <PlusIcon className="h-4 w-4 mr-2" />
            {texts.addNew}
          </Button>
        </div>
      }
    >
      {/* Animated Stats Overview */}
      <AdminStaggerContainer staggerDelay={100}>
        <AdminResponsiveGrid cols={getGridCols()} gap="normal">
          <AdminFadeIn delay={0}>
            <AdminStatsCard
              title={texts.totalUsers}
              value={<AdminCountUp end={stats.totalUsers} />}
              change="+12.5%"
              changeType="positive"
              icon={<UsersIcon className="h-6 w-6 text-blue-600" />}
              lang={lang}
            />
          </AdminFadeIn>
          <AdminFadeIn delay={100}>
            <AdminStatsCard
              title={texts.totalTests}
              value={<AdminCountUp end={stats.totalTests} />}
              change="+3"
              changeType="positive"
              icon={<BeakerIcon className="h-6 w-6 text-green-600" />}
              lang={lang}
            />
          </AdminFadeIn>
          <AdminFadeIn delay={200}>
            <AdminStatsCard
              title={texts.activeSubscriptions}
              value={<AdminCountUp end={stats.activeSubscriptions} />}
              change="+8.2%"
              changeType="positive"
              icon={<CreditCardIcon className="h-6 w-6 text-purple-600" />}
              lang={lang}
            />
          </AdminFadeIn>
          <AdminFadeIn delay={300}>
            <AdminStatsCard
              title={texts.monthlyRevenue}
              value={<AdminCountUp end={stats.monthlyRevenue} prefix="$" />}
              change="+15.3%"
              changeType="positive"
              icon={<ChartBarIcon className="h-6 w-6 text-yellow-600" />}
              lang={lang}
            />
          </AdminFadeIn>
        </AdminResponsiveGrid>
      </AdminStaggerContainer>

      {/* Charts Section */}
      <AdminStaggerContainer staggerDelay={150}>
        <AdminResponsiveGrid 
          cols={isMobile ? { xs: 1 } : { xs: 1, md: 2 }} 
          gap="normal"
        >
          <AdminFadeIn delay={400}>
            <AdminPieChart
              data={mockTestsData}
              title={texts.testsDistribution}
              description={isRTL ? 'توزيع استخدام الاختبارات الكيميائية' : 'Distribution of chemical test usage'}
              lang={lang}
              size={isMobile ? 'small' : 'medium'}
            />
          </AdminFadeIn>
          <AdminFadeIn delay={500}>
            <AdminLineChart
              data={mockUsageData}
              title={texts.dailyUsage}
              description={isRTL ? 'إحصائيات الاستخدام اليومي للأسبوع الماضي' : 'Daily usage statistics for the past week'}
              lang={lang}
              trend="up"
            />
          </AdminFadeIn>
        </AdminResponsiveGrid>
      </AdminStaggerContainer>

      {/* System Health Overview */}
      <AdminFadeIn delay={600}>
        <AdminStatsOverview
          title={texts.systemHealth}
          lang={lang}
          stats={[
            {
              label: isRTL ? 'وقت التشغيل' : 'Uptime',
              value: `${stats.systemUptime}%`,
              change: '+0.1%',
              changeType: 'positive',
              icon: <CheckCircleIcon className="h-6 w-6 text-green-600" />
            },
            {
              label: isRTL ? 'الاختبارات هذا الشهر' : 'Tests This Month',
              value: <AdminCountUp end={stats.testsThisMonth} />,
              change: '+23%',
              changeType: 'positive',
              icon: <TrendingUpIcon className="h-6 w-6 text-blue-600" />
            },
            {
              label: isRTL ? 'مستخدمون جدد' : 'New Users',
              value: <AdminCountUp end={stats.newUsersThisWeek} />,
              change: '+5',
              changeType: 'positive',
              icon: <UsersIcon className="h-6 w-6 text-purple-600" />
            },
            {
              label: isRTL ? 'معدل التحويل' : 'Conversion Rate',
              value: `${stats.conversionRate}%`,
              change: '+2.1%',
              changeType: 'positive',
              icon: <ChartBarIcon className="h-6 w-6 text-yellow-600" />
            }
          ]}
        />
      </AdminFadeIn>

      {/* Recent Users Table */}
      <AdminFadeIn delay={700}>
        <AdminResponsiveCard>
          <AdminTable
            data={mockRecentUsers}
            columns={userColumns}
            actions={userActions}
            title={texts.recentUsers}
            searchable={!isMobile}
            pagination={false}
            lang={lang}
          />
        </AdminResponsiveCard>
      </AdminFadeIn>
    </AdminPageWrapper>
  );
}

export function EnhancedAdminDashboard({ lang }: EnhancedAdminDashboardProps) {
  return (
    <AdminNotificationProvider>
      <AdminLayout lang={lang}>
        <DashboardContent lang={lang} />
      </AdminLayout>
    </AdminNotificationProvider>
  );
}
