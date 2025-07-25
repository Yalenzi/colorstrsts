'use client';

import React, { useState } from 'react';
import { Language } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  ChartBarIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  UsersIcon,
  BeakerIcon,
  CreditCardIcon,
  EyeIcon
} from '@heroicons/react/24/outline';

interface EnhancedChartsProps {
  lang: Language;
}

interface ChartData {
  name: string;
  value: number;
  change?: number;
  color: string;
}

export function EnhancedCharts({ lang }: EnhancedChartsProps) {
  const [timeRange, setTimeRange] = useState('7d');
  const isRTL = lang === 'ar';

  const texts = {
    analytics: isRTL ? 'التحليلات' : 'Analytics',
    overview: isRTL ? 'نظرة عامة' : 'Overview',
    userGrowth: isRTL ? 'نمو المستخدمين' : 'User Growth',
    testUsage: isRTL ? 'استخدام الاختبارات' : 'Test Usage',
    revenue: isRTL ? 'الإيرادات' : 'Revenue',
    last7Days: isRTL ? 'آخر 7 أيام' : 'Last 7 days',
    last30Days: isRTL ? 'آخر 30 يوم' : 'Last 30 days',
    totalUsers: isRTL ? 'إجمالي المستخدمين' : 'Total Users',
    completedTests: isRTL ? 'الاختبارات المكتملة' : 'Completed Tests',
    monthlyRevenue: isRTL ? 'الإيرادات الشهرية' : 'Monthly Revenue',
    subscriptions: isRTL ? 'الاشتراكات' : 'Subscriptions',
    viewDetails: isRTL ? 'عرض التفاصيل' : 'View Details',
    increase: isRTL ? 'زيادة' : 'increase',
    decrease: isRTL ? 'انخفاض' : 'decrease'
  };

  const testUsageData: ChartData[] = [
    { name: 'Marquis Test', value: 145, change: 12, color: '#3b82f6' },
    { name: 'Mecke Test', value: 132, change: 8, color: '#10b981' },
    { name: 'Liebermann Test', value: 98, change: -3, color: '#f59e0b' },
    { name: 'Simon Test', value: 87, change: 15, color: '#ef4444' },
    { name: 'Ehrlich Test', value: 76, change: 5, color: '#8b5cf6' }
  ];

  const subscriptionData: ChartData[] = [
    { name: 'Premium', value: 245, change: 18.2, color: '#10b981' },
    { name: 'Basic', value: 156, change: 8.7, color: '#f59e0b' },
    { name: 'Free', value: 889, change: 5.3, color: '#6b7280' }
  ];

  const SimpleBarChart = ({ data, title, color = '#3b82f6' }: { data: ChartData[], title: string, color?: string }) => {
    const maxValue = Math.max(...data.map(d => d.value));
    
    return (
      <div className="space-y-4">
        <h4 className="font-medium text-gray-900 dark:text-white">{title}</h4>
        <div className="space-y-3">
          {data && data.length > 0 ? data.map((item, index) => {
            if (!item || typeof item !== 'object') return null;
            return (
            <div key={index} className="space-y-1">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">{item.name || 'Unknown'}</span>
                <div className="flex items-center gap-2">
                  <span className="font-medium text-gray-900 dark:text-white">{item.value || 0}</span>
                  {item.change !== undefined && (
                    <span className={`text-xs flex items-center gap-1 ${
                      item.change > 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {item.change > 0 ? (
                        <ArrowTrendingUpIcon className="h-3 w-3" />
                      ) : (
                        <ArrowTrendingDownIcon className="h-3 w-3" />
                      )}
                      {Math.abs(item.change)}%
                    </span>
                  )}
                </div>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                  className="h-2 rounded-full transition-all duration-500"
                  style={{
                    width: `${((item.value || 0) / (maxValue || 1)) * 100}%`,
                    backgroundColor: (item && item.color) ? item.color : (color || '#3B82F6')
                  }}
                />
              </div>
            </div>
            );
          }) : (
            <div className="text-center text-gray-500 dark:text-gray-400 py-4">
              No data available
            </div>
          )}
        </div>
      </div>
    );
  };

  const StatCard = ({ 
    title, 
    value, 
    change, 
    icon: Icon, 
    color = 'blue' 
  }: { 
    title: string; 
    value: string | number; 
    change?: number; 
    icon: any; 
    color?: string; 
  }) => {
    const colorClasses = {
      blue: 'bg-blue-100 dark:bg-blue-900/20 text-blue-600',
      green: 'bg-green-100 dark:bg-green-900/20 text-green-600',
      yellow: 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-600',
      purple: 'bg-purple-100 dark:bg-purple-900/20 text-purple-600'
    };

    return (
      <Card className="transition-all duration-200 hover:shadow-lg hover:-translate-y-1">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                {title}
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {typeof value === 'number' ? value.toLocaleString() : value}
              </p>
              {change !== undefined && (
                <div className={`flex items-center gap-1 text-sm ${
                  change > 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {change > 0 ? (
                    <ArrowTrendingUpIcon className="h-4 w-4" />
                  ) : (
                    <ArrowTrendingDownIcon className="h-4 w-4" />
                  )}
                  <span>
                    {Math.abs(change)}% {change > 0 ? texts.increase : texts.decrease}
                  </span>
                </div>
              )}
            </div>
            <div className={`p-3 rounded-lg ${colorClasses[color as keyof typeof colorClasses]}`}>
              <Icon className="h-6 w-6" />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            {texts.analytics}
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            {texts.overview}
          </p>
        </div>
        <Button variant="outline" size="sm">
          <EyeIcon className="h-4 w-4 mr-2" />
          {texts.viewDetails}
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title={texts.totalUsers}
          value={1290}
          change={12.5}
          icon={UsersIcon}
          color="blue"
        />
        <StatCard
          title={texts.completedTests}
          value={540}
          change={8.3}
          icon={BeakerIcon}
          color="green"
        />
        <StatCard
          title={texts.monthlyRevenue}
          value="$10,000"
          change={15.7}
          icon={CreditCardIcon}
          color="yellow"
        />
        <StatCard
          title={texts.subscriptions}
          value={245}
          change={18.2}
          icon={ChartBarIcon}
          color="purple"
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Test Usage Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BeakerIcon className="h-5 w-5 text-green-600" />
              {texts.testUsage}
            </CardTitle>
            <CardDescription>
              {isRTL ? 'أكثر الاختبارات استخداماً' : 'Most used tests'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <SimpleBarChart data={testUsageData} title="" />
          </CardContent>
        </Card>

        {/* Subscription Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCardIcon className="h-5 w-5 text-yellow-600" />
              {texts.subscriptions}
            </CardTitle>
            <CardDescription>
              {isRTL ? 'توزيع الاشتراكات' : 'Subscription distribution'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <SimpleBarChart data={subscriptionData} title="" />
          </CardContent>
        </Card>

        {/* Activity Overview */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ChartBarIcon className="h-5 w-5 text-purple-600" />
              {isRTL ? 'نظرة عامة على النشاط' : 'Activity Overview'}
            </CardTitle>
            <CardDescription>
              {isRTL ? 'ملخص النشاط اليومي' : 'Daily activity summary'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="flex items-center justify-between p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {isRTL ? 'مستخدمون جدد' : 'New Users'}
                  </span>
                </div>
                <span className="text-lg font-bold text-blue-600">+15</span>
              </div>
              
              <div className="flex items-center justify-between p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-green-600 rounded-full"></div>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {isRTL ? 'اختبارات مكتملة' : 'Tests Completed'}
                  </span>
                </div>
                <span className="text-lg font-bold text-green-600">+87</span>
              </div>
              
              <div className="flex items-center justify-between p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-yellow-600 rounded-full"></div>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {isRTL ? 'اشتراكات جديدة' : 'New Subscriptions'}
                  </span>
                </div>
                <span className="text-lg font-bold text-yellow-600">+12</span>
              </div>
              
              <div className="flex items-center justify-between p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-purple-600 rounded-full"></div>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {isRTL ? 'إيرادات اليوم' : 'Today Revenue'}
                  </span>
                </div>
                <span className="text-lg font-bold text-purple-600">$1,250</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
