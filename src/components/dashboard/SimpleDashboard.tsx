'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/components/safe-providers';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { 
  User, 
  Crown, 
  Star, 
  BarChart3, 
  Settings,
  TestTube,
  Clock,
  TrendingUp,
  Award,
  Target,
  Activity
} from 'lucide-react';

interface SimpleDashboardProps {
  lang?: 'ar' | 'en';
}

export function SimpleDashboard({ lang = 'ar' }: SimpleDashboardProps) {
  const { user, userProfile } = useAuth();
  const [loading, setLoading] = useState(true);

  const isRTL = lang === 'ar';
  const isSubscribed = userProfile?.subscription?.status === 'active';

  const texts = {
    ar: {
      welcome: 'مرحباً',
      premiumUser: 'مشترك مميز',
      freeUser: 'مستخدم مجاني',
      freeTests: 'الاختبارات المجانية',
      remaining: 'متبقية',
      totalTests: 'إجمالي الاختبارات',
      completed: 'مكتمل',
      subscriptionStatus: 'حالة الاشتراك',
      active: 'نشط',
      inactive: 'غير نشط',
      quickActions: 'إجراءات سريعة',
      newTest: 'اختبار جديد',
      viewResults: 'عرض النتائج',
      manageProfile: 'إدارة الملف الشخصي',
      settings: 'الإعدادات',
      weeklyProgress: 'التقدم الأسبوعي',
      testsThisWeek: 'اختبارات هذا الأسبوع',
      averageScore: 'متوسط النتيجة',
      improvement: 'معدل التحسن',
      recentActivity: 'النشاط الأخير',
      noActivity: 'لا يوجد نشاط حديث',
      upgradePrompt: 'ترقية للاشتراك المميز للحصول على ميزات إضافية'
    },
    en: {
      welcome: 'Welcome',
      premiumUser: 'Premium User',
      freeUser: 'Free User',
      freeTests: 'Free Tests',
      remaining: 'remaining',
      totalTests: 'Total Tests',
      completed: 'completed',
      subscriptionStatus: 'Subscription Status',
      active: 'Active',
      inactive: 'Inactive',
      quickActions: 'Quick Actions',
      newTest: 'New Test',
      viewResults: 'View Results',
      manageProfile: 'Manage Profile',
      settings: 'Settings',
      weeklyProgress: 'Weekly Progress',
      testsThisWeek: 'Tests This Week',
      averageScore: 'Average Score',
      improvement: 'Improvement Rate',
      recentActivity: 'Recent Activity',
      noActivity: 'No recent activity',
      upgradePrompt: 'Upgrade to premium for additional features'
    }
  };

  const t = texts[lang];

  // بيانات وهمية للعرض
  const mockStats = {
    freeTestsRemaining: 3,
    totalTestsUsed: 7,
    weeklyTests: 2,
    averageScore: 85,
    improvementRate: 12
  };

  useEffect(() => {
    // محاكاة تحميل البيانات
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const handleQuickAction = (action: string) => {
    switch (action) {
      case 'new-test':
        window.location.href = `/${lang}/tests`;
        break;
      case 'view-results':
        window.location.href = `/${lang}/results`;
        break;
      case 'manage-profile':
        window.location.href = `/${lang}/profile`;
        break;
      case 'settings':
        window.location.href = `/${lang}/settings`;
        break;
      default:
        toast.info(lang === 'ar' ? 'هذه الميزة قيد التطوير' : 'This feature is under development');
        break;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            {lang === 'ar' ? 'جاري التحميل...' : 'Loading...'}
          </h2>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 dark:from-gray-950 dark:via-background dark:to-blue-950 ${isRTL ? 'rtl' : 'ltr'}`} dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center space-x-4 rtl:space-x-reverse">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
                <User className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  {t.welcome}، {user?.displayName || user?.email?.split('@')[0] || 'User'}
                </h1>
                <div className="flex items-center mt-2">
                  {isSubscribed ? (
                    <>
                      <Crown className="w-5 h-5 text-yellow-500 mr-2 rtl:ml-2 rtl:mr-0" />
                      <Badge variant="default" className="bg-yellow-500 text-white">
                        {t.premiumUser}
                      </Badge>
                    </>
                  ) : (
                    <>
                      <Star className="w-5 h-5 text-gray-400 mr-2 rtl:ml-2 rtl:mr-0" />
                      <Badge variant="secondary">
                        {t.freeUser}
                      </Badge>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{t.freeTests}</p>
                    <p className="text-3xl font-bold text-blue-600">
                      {mockStats.freeTestsRemaining}
                    </p>
                    <p className="text-xs text-gray-500">{t.remaining}</p>
                  </div>
                  <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                    <Star className="w-8 h-8 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{t.totalTests}</p>
                    <p className="text-3xl font-bold text-green-600">
                      {mockStats.totalTestsUsed}
                    </p>
                    <p className="text-xs text-gray-500">{t.completed}</p>
                  </div>
                  <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-lg">
                    <TestTube className="w-8 h-8 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{t.subscriptionStatus}</p>
                    <p className={`text-3xl font-bold ${isSubscribed ? 'text-yellow-600' : 'text-gray-600'}`}>
                      {isSubscribed ? t.active : t.inactive}
                    </p>
                  </div>
                  <div className="p-3 bg-yellow-100 dark:bg-yellow-900/20 rounded-lg">
                    <Crown className={`w-8 h-8 ${isSubscribed ? 'text-yellow-600' : 'text-gray-400'}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 rtl:space-x-reverse">
                <Target className="h-5 w-5" />
                <span>{t.quickActions}</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Button
                  onClick={() => handleQuickAction('new-test')}
                  className="flex flex-col items-center space-y-2 h-auto py-4"
                  variant="outline"
                >
                  <TestTube className="h-6 w-6" />
                  <span className="text-sm">{t.newTest}</span>
                </Button>
                <Button
                  onClick={() => handleQuickAction('view-results')}
                  className="flex flex-col items-center space-y-2 h-auto py-4"
                  variant="outline"
                >
                  <BarChart3 className="h-6 w-6" />
                  <span className="text-sm">{t.viewResults}</span>
                </Button>
                <Button
                  onClick={() => handleQuickAction('manage-profile')}
                  className="flex flex-col items-center space-y-2 h-auto py-4"
                  variant="outline"
                >
                  <User className="h-6 w-6" />
                  <span className="text-sm">{t.manageProfile}</span>
                </Button>
                <Button
                  onClick={() => handleQuickAction('settings')}
                  className="flex flex-col items-center space-y-2 h-auto py-4"
                  variant="outline"
                >
                  <Settings className="h-6 w-6" />
                  <span className="text-sm">{t.settings}</span>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Weekly Progress */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 rtl:space-x-reverse">
                <TrendingUp className="h-5 w-5" />
                <span>{t.weeklyProgress}</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center p-6 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <Activity className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-blue-600">
                    {mockStats.weeklyTests}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{t.testsThisWeek}</p>
                </div>
                <div className="text-center p-6 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <Target className="w-8 h-8 text-green-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-green-600">
                    {mockStats.averageScore}%
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{t.averageScore}</p>
                </div>
                <div className="text-center p-6 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                  <TrendingUp className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-purple-600">
                    +{mockStats.improvementRate}%
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{t.improvement}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 rtl:space-x-reverse">
                <Clock className="h-5 w-5" />
                <span>{t.recentActivity}</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <TestTube className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-400 mb-4">{t.noActivity}</p>
                <Button onClick={() => handleQuickAction('new-test')}>
                  {t.newTest}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Upgrade Prompt for Free Users */}
          {!isSubscribed && (
            <Card className="border-yellow-200 bg-yellow-50 dark:bg-yellow-900/20">
              <CardContent className="p-6">
                <div className="flex items-center space-x-4 rtl:space-x-reverse">
                  <div className="p-3 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
                    <Crown className="w-8 h-8 text-yellow-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-yellow-800 dark:text-yellow-200 mb-2">
                      {lang === 'ar' ? 'ترقية للاشتراك المميز' : 'Upgrade to Premium'}
                    </h3>
                    <p className="text-yellow-700 dark:text-yellow-300 mb-4">
                      {t.upgradePrompt}
                    </p>
                    <Button className="bg-yellow-600 hover:bg-yellow-700 text-white">
                      {lang === 'ar' ? 'اشترك الآن' : 'Subscribe Now'}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
