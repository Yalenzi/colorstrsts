'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/components/safe-providers';
import { getUserUsageStats, TestUsage } from '@/lib/subscription-service';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { 
  User, 
  Crown, 
  Star, 
  Calendar, 
  BarChart3, 
  Settings,
  LogOut,
  TestTube,
  Clock,
  TrendingUp,
  Award,
  Target,
  Activity,
  Download,
  Share2,
  Bell,
  Shield,
  CreditCard,
  FileText,
  HelpCircle
} from 'lucide-react';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';

interface UsageStats {
  freeTestsUsed: number;
  totalTestsUsed: number;
  freeTestsRemaining: number;
  recentTests: TestUsage[];
  weeklyStats?: {
    testsThisWeek: number;
    averageScore: number;
    improvementRate: number;
  };
  achievements?: {
    id: string;
    name: string;
    description: string;
    earned: boolean;
    earnedDate?: Date;
  }[];
}

interface EnhancedUserDashboardProps {
  lang?: 'ar' | 'en';
}

export function EnhancedUserDashboard({ lang = 'ar' }: EnhancedUserDashboardProps) {
  const { user, userProfile, logout } = useAuth();
  const [usageStats, setUsageStats] = useState<UsageStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('overview');

  const isRTL = lang === 'ar';
  const isSubscribed = userProfile?.subscription?.status === 'active';

  const texts = {
    ar: {
      welcome: 'مرحباً',
      premiumUser: 'مشترك مميز',
      freeUser: 'مستخدم مجاني',
      overview: 'نظرة عامة',
      statistics: 'الإحصائيات',
      achievements: 'الإنجازات',
      settings: 'الإعدادات',
      freeTests: 'الاختبارات المجانية',
      remaining: 'متبقية من 5',
      totalTests: 'إجمالي الاختبارات',
      completed: 'اختبار مكتمل',
      subscriptionStatus: 'حالة الاشتراك',
      active: 'نشط',
      inactive: 'غير نشط',
      expires: 'ينتهي',
      recentTests: 'آخر الاختبارات',
      noTests: 'لم تقم بأي اختبارات بعد',
      free: 'مجاني',
      premium: 'مميز',
      manageSubscription: 'إدارة الاشتراك',
      upgradeNow: 'اشترك الآن',
      weeklyProgress: 'التقدم الأسبوعي',
      testsThisWeek: 'اختبارات هذا الأسبوع',
      averageScore: 'متوسط النتيجة',
      improvement: 'معدل التحسن',
      quickActions: 'إجراءات سريعة',
      newTest: 'اختبار جديد',
      viewResults: 'عرض النتائج',
      downloadReport: 'تحميل التقرير',
      shareProgress: 'مشاركة التقدم',
      notifications: 'الإشعارات',
      security: 'الأمان',
      billing: 'الفواتير',
      help: 'المساعدة',
      signOut: 'تسجيل الخروج'
    },
    en: {
      welcome: 'Welcome',
      premiumUser: 'Premium User',
      freeUser: 'Free User',
      overview: 'Overview',
      statistics: 'Statistics',
      achievements: 'Achievements',
      settings: 'Settings',
      freeTests: 'Free Tests',
      remaining: 'remaining of 5',
      totalTests: 'Total Tests',
      completed: 'completed',
      subscriptionStatus: 'Subscription Status',
      active: 'Active',
      inactive: 'Inactive',
      expires: 'Expires',
      recentTests: 'Recent Tests',
      noTests: 'No tests completed yet',
      free: 'Free',
      premium: 'Premium',
      manageSubscription: 'Manage Subscription',
      upgradeNow: 'Upgrade Now',
      weeklyProgress: 'Weekly Progress',
      testsThisWeek: 'Tests This Week',
      averageScore: 'Average Score',
      improvement: 'Improvement Rate',
      quickActions: 'Quick Actions',
      newTest: 'New Test',
      viewResults: 'View Results',
      downloadReport: 'Download Report',
      shareProgress: 'Share Progress',
      notifications: 'Notifications',
      security: 'Security',
      billing: 'Billing',
      help: 'Help',
      signOut: 'Sign Out'
    }
  };

  const t = texts[lang];

  useEffect(() => {
    const loadUsageStats = async () => {
      if (!user) return;

      try {
        const stats = await getUserUsageStats(user.uid);
        
        // Add mock enhanced data
        const enhancedStats = {
          ...stats,
          weeklyStats: {
            testsThisWeek: 3,
            averageScore: 85.5,
            improvementRate: 12.3
          },
          achievements: [
            {
              id: 'first-test',
              name: lang === 'ar' ? 'أول اختبار' : 'First Test',
              description: lang === 'ar' ? 'أكمل أول اختبار لك' : 'Complete your first test',
              earned: stats.totalTestsUsed > 0,
              earnedDate: stats.totalTestsUsed > 0 ? new Date() : undefined
            },
            {
              id: 'five-tests',
              name: lang === 'ar' ? 'خمسة اختبارات' : 'Five Tests',
              description: lang === 'ar' ? 'أكمل 5 اختبارات' : 'Complete 5 tests',
              earned: stats.totalTestsUsed >= 5,
              earnedDate: stats.totalTestsUsed >= 5 ? new Date() : undefined
            },
            {
              id: 'premium-user',
              name: lang === 'ar' ? 'مستخدم مميز' : 'Premium User',
              description: lang === 'ar' ? 'اشترك في الخطة المميزة' : 'Subscribe to premium plan',
              earned: isSubscribed,
              earnedDate: isSubscribed ? new Date() : undefined
            }
          ]
        };
        
        setUsageStats(enhancedStats);
      } catch (error) {
        console.error('Error loading usage stats:', error);
        setError(lang === 'ar' ? 'حدث خطأ في تحميل الإحصائيات' : 'Error loading statistics');
      } finally {
        setLoading(false);
      }
    };

    loadUsageStats();
  }, [user, lang, isSubscribed]);

  const formatDate = (date: Date | string) => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return format(dateObj, 'dd/MM/yyyy', { locale: isRTL ? ar : undefined });
  };

  const handleManageSubscription = async () => {
    try {
      // This would integrate with your payment provider
      toast.info(lang === 'ar' ? 'سيتم إعادة التوجيه لإدارة الاشتراك' : 'Redirecting to subscription management');
    } catch (error) {
      console.error('Error managing subscription:', error);
      toast.error(lang === 'ar' ? 'خطأ في إدارة الاشتراك' : 'Error managing subscription');
    }
  };

  const handleQuickAction = (action: string) => {
    switch (action) {
      case 'new-test':
        window.location.href = `/${lang}/tests`;
        break;
      case 'view-results':
        window.location.href = `/${lang}/results`;
        break;
      case 'download-report':
        toast.info(lang === 'ar' ? 'سيتم تحميل التقرير قريباً' : 'Report download coming soon');
        break;
      case 'share-progress':
        toast.info(lang === 'ar' ? 'ميزة المشاركة قريباً' : 'Share feature coming soon');
        break;
      default:
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
                  {t.welcome}، {userProfile?.displayName || user?.email?.split('@')[0] || 'User'}
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
            
            <Button
              onClick={logout}
              variant="outline"
              className="flex items-center space-x-2 rtl:space-x-reverse"
            >
              <LogOut className="w-4 h-4" />
              <span>{t.signOut}</span>
            </Button>
          </div>

          {error && (
            <Card className="border-red-200 bg-red-50 dark:bg-red-900/20">
              <CardContent className="p-4">
                <p className="text-red-700 dark:text-red-300">{error}</p>
              </CardContent>
            </Card>
          )}

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-4 mb-8">
              <TabsTrigger value="overview" className="flex items-center space-x-2 rtl:space-x-reverse">
                <BarChart3 className="h-4 w-4" />
                <span className="hidden sm:inline">{t.overview}</span>
              </TabsTrigger>
              <TabsTrigger value="statistics" className="flex items-center space-x-2 rtl:space-x-reverse">
                <TrendingUp className="h-4 w-4" />
                <span className="hidden sm:inline">{t.statistics}</span>
              </TabsTrigger>
              <TabsTrigger value="achievements" className="flex items-center space-x-2 rtl:space-x-reverse">
                <Award className="h-4 w-4" />
                <span className="hidden sm:inline">{t.achievements}</span>
              </TabsTrigger>
              <TabsTrigger value="settings" className="flex items-center space-x-2 rtl:space-x-reverse">
                <Settings className="h-4 w-4" />
                <span className="hidden sm:inline">{t.settings}</span>
              </TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6">
              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{t.freeTests}</p>
                        <p className="text-3xl font-bold text-blue-600">
                          {usageStats?.freeTestsRemaining || 0}
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
                          {usageStats?.totalTestsUsed || 0}
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
                        {isSubscribed && userProfile?.subscription?.currentPeriodEnd && (
                          <p className="text-xs text-gray-500">
                            {t.expires}: {formatDate(userProfile.subscription.currentPeriodEnd)}
                          </p>
                        )}
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
                      onClick={() => handleQuickAction('download-report')}
                      className="flex flex-col items-center space-y-2 h-auto py-4"
                      variant="outline"
                    >
                      <Download className="h-6 w-6" />
                      <span className="text-sm">{t.downloadReport}</span>
                    </Button>
                    <Button
                      onClick={() => handleQuickAction('share-progress')}
                      className="flex flex-col items-center space-y-2 h-auto py-4"
                      variant="outline"
                    >
                      <Share2 className="h-6 w-6" />
                      <span className="text-sm">{t.shareProgress}</span>
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Recent Tests */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2 rtl:space-x-reverse">
                    <Clock className="h-5 w-5" />
                    <span>{t.recentTests}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {usageStats?.recentTests && usageStats.recentTests.length > 0 ? (
                    <div className="space-y-3">
                      {usageStats.recentTests.slice(0, 5).map((test, index) => (
                        <div key={index} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                          <div className="flex items-center space-x-3 rtl:space-x-reverse">
                            <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                              <TestTube className="w-5 h-5 text-blue-600" />
                            </div>
                            <div>
                              <p className="font-medium text-gray-900 dark:text-white">{test.testName}</p>
                              <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center">
                                <Clock className="w-4 h-4 mr-1 rtl:ml-1 rtl:mr-0" />
                                {formatDate(test.timestamp)}
                              </p>
                            </div>
                          </div>
                          <Badge variant={test.isFree ? "secondary" : "default"}>
                            {test.isFree ? t.free : t.premium}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <TestTube className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600 dark:text-gray-400">{t.noTests}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Statistics Tab */}
            <TabsContent value="statistics" className="space-y-6">
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
                        {usageStats?.weeklyStats?.testsThisWeek || 0}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{t.testsThisWeek}</p>
                    </div>
                    <div className="text-center p-6 bg-green-50 dark:bg-green-900/20 rounded-lg">
                      <Target className="w-8 h-8 text-green-600 mx-auto mb-2" />
                      <p className="text-2xl font-bold text-green-600">
                        {usageStats?.weeklyStats?.averageScore || 0}%
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{t.averageScore}</p>
                    </div>
                    <div className="text-center p-6 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                      <TrendingUp className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                      <p className="text-2xl font-bold text-purple-600">
                        +{usageStats?.weeklyStats?.improvementRate || 0}%
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{t.improvement}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Achievements Tab */}
            <TabsContent value="achievements" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2 rtl:space-x-reverse">
                    <Award className="h-5 w-5" />
                    <span>{t.achievements}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {usageStats?.achievements?.map((achievement) => (
                      <div
                        key={achievement.id}
                        className={`p-6 rounded-lg border-2 transition-all ${
                          achievement.earned
                            ? 'border-yellow-300 bg-yellow-50 dark:bg-yellow-900/20'
                            : 'border-gray-200 bg-gray-50 dark:bg-gray-800'
                        }`}
                      >
                        <div className="flex items-center space-x-3 rtl:space-x-reverse mb-3">
                          <div className={`p-2 rounded-lg ${
                            achievement.earned
                              ? 'bg-yellow-100 dark:bg-yellow-900/30'
                              : 'bg-gray-100 dark:bg-gray-700'
                          }`}>
                            <Award className={`w-6 h-6 ${
                              achievement.earned ? 'text-yellow-600' : 'text-gray-400'
                            }`} />
                          </div>
                          <div>
                            <h3 className={`font-semibold ${
                              achievement.earned ? 'text-yellow-800 dark:text-yellow-200' : 'text-gray-600 dark:text-gray-400'
                            }`}>
                              {achievement.name}
                            </h3>
                            {achievement.earned && achievement.earnedDate && (
                              <p className="text-xs text-yellow-600 dark:text-yellow-400">
                                {formatDate(achievement.earnedDate)}
                              </p>
                            )}
                          </div>
                        </div>
                        <p className={`text-sm ${
                          achievement.earned ? 'text-yellow-700 dark:text-yellow-300' : 'text-gray-500 dark:text-gray-400'
                        }`}>
                          {achievement.description}
                        </p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Settings Tab */}
            <TabsContent value="settings" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => window.location.href = `/${lang}/profile`}>
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-4 rtl:space-x-reverse">
                      <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                        <User className="w-6 h-6 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white">Profile</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {lang === 'ar' ? 'إدارة معلومات ملفك الشخصي' : 'Manage your profile information'}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => toast.info(t.notifications)}>
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-4 rtl:space-x-reverse">
                      <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-lg">
                        <Bell className="w-6 h-6 text-green-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white">{t.notifications}</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {lang === 'ar' ? 'إدارة إعدادات الإشعارات' : 'Manage notification settings'}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => toast.info(t.security)}>
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-4 rtl:space-x-reverse">
                      <div className="p-3 bg-red-100 dark:bg-red-900/20 rounded-lg">
                        <Shield className="w-6 h-6 text-red-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white">{t.security}</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {lang === 'ar' ? 'إعدادات الأمان وكلمة المرور' : 'Security and password settings'}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={handleManageSubscription}>
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-4 rtl:space-x-reverse">
                      <div className="p-3 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
                        <CreditCard className="w-6 h-6 text-purple-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white">{t.billing}</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {lang === 'ar' ? 'إدارة الاشتراك والفواتير' : 'Manage subscription and billing'}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
