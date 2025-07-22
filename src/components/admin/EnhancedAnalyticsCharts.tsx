'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Language } from '@/types';
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown,
  Users,
  TestTube,
  DollarSign,
  Calendar,
  Download,
  RefreshCw,
  Filter,
  Eye,
  Activity,
  Target,
  Zap
} from 'lucide-react';

interface AnalyticsData {
  userGrowth: ChartDataPoint[];
  testUsage: ChartDataPoint[];
  revenue: ChartDataPoint[];
  popularTests: PopularTest[];
  userActivity: ActivityData[];
  systemMetrics: SystemMetric[];
}

interface ChartDataPoint {
  date: string;
  value: number;
  label: string;
  labelAr: string;
}

interface PopularTest {
  id: string;
  name: string;
  nameAr: string;
  usage: number;
  growth: number;
  category: string;
}

interface ActivityData {
  hour: number;
  users: number;
  tests: number;
}

interface SystemMetric {
  name: string;
  nameAr: string;
  value: number;
  unit: string;
  status: 'good' | 'warning' | 'error';
  trend: 'up' | 'down' | 'stable';
}

interface EnhancedAnalyticsChartsProps {
  lang: Language;
}

export function EnhancedAnalyticsCharts({ lang }: EnhancedAnalyticsChartsProps) {
  const isRTL = lang === 'ar';
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState<string>('7d');
  const [selectedChart, setSelectedChart] = useState<string>('overview');

  useEffect(() => {
    loadAnalyticsData();
  }, [selectedPeriod]);

  const loadAnalyticsData = async () => {
    setLoading(true);
    try {
      // محاكاة تحميل البيانات التحليلية
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockData: AnalyticsData = {
        userGrowth: [
          { date: '2024-01-15', value: 120, label: 'Jan 15', labelAr: '15 يناير' },
          { date: '2024-01-16', value: 135, label: 'Jan 16', labelAr: '16 يناير' },
          { date: '2024-01-17', value: 142, label: 'Jan 17', labelAr: '17 يناير' },
          { date: '2024-01-18', value: 156, label: 'Jan 18', labelAr: '18 يناير' },
          { date: '2024-01-19', value: 168, label: 'Jan 19', labelAr: '19 يناير' },
          { date: '2024-01-20', value: 175, label: 'Jan 20', labelAr: '20 يناير' },
          { date: '2024-01-21', value: 189, label: 'Jan 21', labelAr: '21 يناير' }
        ],
        testUsage: [
          { date: '2024-01-15', value: 45, label: 'Jan 15', labelAr: '15 يناير' },
          { date: '2024-01-16', value: 52, label: 'Jan 16', labelAr: '16 يناير' },
          { date: '2024-01-17', value: 48, label: 'Jan 17', labelAr: '17 يناير' },
          { date: '2024-01-18', value: 67, label: 'Jan 18', labelAr: '18 يناير' },
          { date: '2024-01-19', value: 73, label: 'Jan 19', labelAr: '19 يناير' },
          { date: '2024-01-20', value: 81, label: 'Jan 20', labelAr: '20 يناير' },
          { date: '2024-01-21', value: 89, label: 'Jan 21', labelAr: '21 يناير' }
        ],
        revenue: [
          { date: '2024-01-15', value: 1200, label: 'Jan 15', labelAr: '15 يناير' },
          { date: '2024-01-16', value: 1350, label: 'Jan 16', labelAr: '16 يناير' },
          { date: '2024-01-17', value: 1420, label: 'Jan 17', labelAr: '17 يناير' },
          { date: '2024-01-18', value: 1560, label: 'Jan 18', labelAr: '18 يناير' },
          { date: '2024-01-19', value: 1680, label: 'Jan 19', labelAr: '19 يناير' },
          { date: '2024-01-20', value: 1750, label: 'Jan 20', labelAr: '20 يناير' },
          { date: '2024-01-21', value: 1890, label: 'Jan 21', labelAr: '21 يناير' }
        ],
        popularTests: [
          { id: '1', name: 'Marquis Test', nameAr: 'اختبار ماركيز', usage: 156, growth: 12.5, category: 'Stimulants' },
          { id: '2', name: 'Mecke Test', nameAr: 'اختبار ميكي', usage: 89, growth: 8.3, category: 'Opioids' },
          { id: '3', name: 'Mandelin Test', nameAr: 'اختبار مانديلين', usage: 67, growth: -2.1, category: 'Psychedelics' },
          { id: '4', name: 'Ehrlich Test', nameAr: 'اختبار إيرليش', usage: 45, growth: 15.7, category: 'Psychedelics' },
          { id: '5', name: 'Simon Test', nameAr: 'اختبار سايمون', usage: 34, growth: 6.2, category: 'Stimulants' }
        ],
        userActivity: [
          { hour: 0, users: 12, tests: 5 },
          { hour: 1, users: 8, tests: 3 },
          { hour: 2, users: 6, tests: 2 },
          { hour: 3, users: 4, tests: 1 },
          { hour: 4, users: 3, tests: 1 },
          { hour: 5, users: 5, tests: 2 },
          { hour: 6, users: 15, tests: 8 },
          { hour: 7, users: 25, tests: 12 },
          { hour: 8, users: 35, tests: 18 },
          { hour: 9, users: 45, tests: 25 },
          { hour: 10, users: 52, tests: 32 },
          { hour: 11, users: 48, tests: 28 },
          { hour: 12, users: 55, tests: 35 },
          { hour: 13, users: 58, tests: 38 },
          { hour: 14, users: 62, tests: 42 },
          { hour: 15, users: 68, tests: 45 },
          { hour: 16, users: 65, tests: 43 },
          { hour: 17, users: 72, tests: 48 },
          { hour: 18, users: 78, tests: 52 },
          { hour: 19, users: 75, tests: 50 },
          { hour: 20, users: 68, tests: 45 },
          { hour: 21, users: 58, tests: 38 },
          { hour: 22, users: 42, tests: 25 },
          { hour: 23, users: 28, tests: 15 }
        ],
        systemMetrics: [
          { name: 'Response Time', nameAr: 'وقت الاستجابة', value: 245, unit: 'ms', status: 'good', trend: 'down' },
          { name: 'CPU Usage', nameAr: 'استخدام المعالج', value: 68, unit: '%', status: 'warning', trend: 'up' },
          { name: 'Memory Usage', nameAr: 'استخدام الذاكرة', value: 72, unit: '%', status: 'good', trend: 'stable' },
          { name: 'Database Connections', nameAr: 'اتصالات قاعدة البيانات', value: 45, unit: '', status: 'good', trend: 'stable' },
          { name: 'Error Rate', nameAr: 'معدل الأخطاء', value: 0.2, unit: '%', status: 'good', trend: 'down' },
          { name: 'Uptime', nameAr: 'وقت التشغيل', value: 99.9, unit: '%', status: 'good', trend: 'stable' }
        ]
      };

      setAnalyticsData(mockData);
      toast.success(isRTL ? 'تم تحميل البيانات التحليلية بنجاح' : 'Analytics data loaded successfully');
    } catch (error) {
      console.error('Error loading analytics data:', error);
      toast.error(isRTL ? 'خطأ في تحميل البيانات التحليلية' : 'Error loading analytics data');
    } finally {
      setLoading(false);
    }
  };

  // رندر مخطط بسيط باستخدام CSS
  const renderSimpleChart = (data: ChartDataPoint[], color: string, title: string) => {
    const maxValue = Math.max(...data.map(d => d.value));
    
    return (
      <div className="space-y-3">
        <h4 className="font-medium text-gray-900 dark:text-gray-100">{title}</h4>
        <div className="flex items-end space-x-1 rtl:space-x-reverse h-32">
          {data.map((point, index) => (
            <div key={index} className="flex-1 flex flex-col items-center">
              <div
                className={`w-full ${color} rounded-t transition-all duration-300 hover:opacity-80`}
                style={{ height: `${(point.value / maxValue) * 100}%` }}
                title={`${isRTL ? point.labelAr : point.label}: ${point.value}`}
              />
              <span className="text-xs text-gray-500 mt-1 transform rotate-45 origin-left">
                {isRTL ? point.labelAr.split(' ')[0] : point.label.split(' ')[1]}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // رندر مقياس النشاط اليومي
  const renderActivityHeatmap = () => {
    if (!analyticsData) return null;
    
    const maxUsers = Math.max(...analyticsData.userActivity.map(a => a.users));
    
    return (
      <div className="space-y-3">
        <h4 className="font-medium text-gray-900 dark:text-gray-100">
          {isRTL ? 'نشاط المستخدمين على مدار اليوم' : 'User Activity Throughout the Day'}
        </h4>
        <div className="grid grid-cols-12 gap-1">
          {analyticsData.userActivity.map((activity, index) => {
            const intensity = (activity.users / maxUsers) * 100;
            const bgColor = intensity > 75 ? 'bg-blue-600' : 
                           intensity > 50 ? 'bg-blue-400' : 
                           intensity > 25 ? 'bg-blue-200' : 'bg-gray-100';
            
            return (
              <div
                key={index}
                className={`h-8 ${bgColor} rounded flex items-center justify-center text-xs font-medium transition-all duration-200 hover:scale-110`}
                title={`${activity.hour}:00 - ${activity.users} ${isRTL ? 'مستخدم' : 'users'}, ${activity.tests} ${isRTL ? 'اختبار' : 'tests'}`}
              >
                {activity.hour}
              </div>
            );
          })}
        </div>
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>{isRTL ? 'أقل نشاط' : 'Less Active'}</span>
          <div className="flex space-x-1 rtl:space-x-reverse">
            <div className="w-3 h-3 bg-gray-100 rounded"></div>
            <div className="w-3 h-3 bg-blue-200 rounded"></div>
            <div className="w-3 h-3 bg-blue-400 rounded"></div>
            <div className="w-3 h-3 bg-blue-600 rounded"></div>
          </div>
          <span>{isRTL ? 'أكثر نشاط' : 'More Active'}</span>
        </div>
      </div>
    );
  };

  // رندر مقاييس النظام
  const renderSystemMetrics = () => {
    if (!analyticsData) return null;
    
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {analyticsData.systemMetrics.map((metric, index) => {
          const statusColor = metric.status === 'good' ? 'text-green-600' : 
                             metric.status === 'warning' ? 'text-yellow-600' : 'text-red-600';
          const trendIcon = metric.trend === 'up' ? TrendingUp : 
                           metric.trend === 'down' ? TrendingDown : Activity;
          const TrendIcon = trendIcon;
          
          return (
            <div key={index} className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {isRTL ? metric.nameAr : metric.name}
                </span>
                <TrendIcon className={`w-4 h-4 ${statusColor}`} />
              </div>
              <div className="flex items-baseline space-x-1 rtl:space-x-reverse">
                <span className={`text-2xl font-bold ${statusColor}`}>
                  {metric.value}
                </span>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {metric.unit}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className={`space-y-6 ${isRTL ? 'rtl' : 'ltr'}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            {isRTL ? 'التحليلات والرسوم البيانية' : 'Analytics & Charts'}
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            {isRTL ? 'تحليل شامل لأداء النظام والمستخدمين' : 'Comprehensive analysis of system and user performance'}
          </p>
        </div>
        <div className="flex space-x-2 rtl:space-x-reverse">
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="1d">{isRTL ? 'آخر يوم' : 'Last Day'}</option>
            <option value="7d">{isRTL ? 'آخر 7 أيام' : 'Last 7 Days'}</option>
            <option value="30d">{isRTL ? 'آخر 30 يوم' : 'Last 30 Days'}</option>
            <option value="90d">{isRTL ? 'آخر 90 يوم' : 'Last 90 Days'}</option>
          </select>
          <Button variant="outline" onClick={loadAnalyticsData}>
            <RefreshCw className="w-4 h-4 mr-2 rtl:ml-2 rtl:mr-0" />
            {isRTL ? 'تحديث' : 'Refresh'}
          </Button>
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2 rtl:ml-2 rtl:mr-0" />
            {isRTL ? 'تصدير' : 'Export'}
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2 rtl:mr-2 rtl:ml-0 text-gray-600 dark:text-gray-400">
            {isRTL ? 'جاري تحميل البيانات التحليلية...' : 'Loading analytics data...'}
          </span>
        </div>
      ) : analyticsData ? (
        <div className="space-y-6">
          {/* Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 rtl:space-x-reverse">
                  <Users className="w-5 h-5 text-blue-600" />
                  <span>{isRTL ? 'نمو المستخدمين' : 'User Growth'}</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {renderSimpleChart(analyticsData.userGrowth, 'bg-blue-500', '')}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 rtl:space-x-reverse">
                  <TestTube className="w-5 h-5 text-green-600" />
                  <span>{isRTL ? 'استخدام الاختبارات' : 'Test Usage'}</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {renderSimpleChart(analyticsData.testUsage, 'bg-green-500', '')}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 rtl:space-x-reverse">
                  <DollarSign className="w-5 h-5 text-purple-600" />
                  <span>{isRTL ? 'الإيرادات' : 'Revenue'}</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {renderSimpleChart(analyticsData.revenue, 'bg-purple-500', '')}
              </CardContent>
            </Card>
          </div>

          {/* Activity Heatmap */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 rtl:space-x-reverse">
                <Activity className="w-5 h-5 text-orange-600" />
                <span>{isRTL ? 'خريطة النشاط اليومي' : 'Daily Activity Heatmap'}</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {renderActivityHeatmap()}
            </CardContent>
          </Card>

          {/* System Metrics */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 rtl:space-x-reverse">
                <Zap className="w-5 h-5 text-yellow-600" />
                <span>{isRTL ? 'مقاييس النظام' : 'System Metrics'}</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {renderSystemMetrics()}
            </CardContent>
          </Card>
        </div>
      ) : (
        <div className="text-center py-12 text-gray-500 dark:text-gray-400">
          <BarChart3 className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>{isRTL ? 'لا توجد بيانات تحليلية متاحة' : 'No analytics data available'}</p>
        </div>
      )}
    </div>
  );
}
