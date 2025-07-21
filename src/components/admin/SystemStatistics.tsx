'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  ChartBarIcon,
  ArrowPathIcon,
  BeakerIcon,
  SwatchIcon,
  TagIcon,
  ShieldCheckIcon,
  ClockIcon,
  DocumentTextIcon,
  CalculatorIcon,
  CpuChipIcon
} from '@heroicons/react/24/outline';
import { ChemicalTest } from '@/types';
import { databaseColorTestService } from '@/lib/database-color-test-service';
import toast from 'react-hot-toast';

interface SystemStatisticsProps {
  isRTL: boolean;
  lang: 'ar' | 'en';
}

interface SystemStats {
  tests: {
    total: number;
    categories: number;
    safetyLevels: number;
    colorResults: number;
    averageResultsPerTest: number;
  };
  categories: {
    [key: string]: number;
  };
  safetyLevels: {
    [key: string]: number;
  };
  colorResults: {
    total: number;
    unique: number;
    mostCommon: string;
    averagePerTest: number;
  };
  system: {
    lastUpdated: string;
    dataIntegrity: number;
    completeness: number;
  };
}

export default function SystemStatistics({ isRTL, lang }: SystemStatisticsProps) {
  const [stats, setStats] = useState<SystemStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [recalculating, setRecalculating] = useState(false);

  const t = {
    title: lang === 'ar' ? 'إحصائيات النظام' : 'System Statistics',
    subtitle: lang === 'ar' ? 'أرقام وإحصائيات شاملة للنظام' : 'Comprehensive system numbers and statistics',
    recalculate: lang === 'ar' ? 'إعادة حساب' : 'Recalculate',
    refresh: lang === 'ar' ? 'تحديث' : 'Refresh',
    loading: lang === 'ar' ? 'جاري التحميل...' : 'Loading...',
    recalculating: lang === 'ar' ? 'جاري إعادة الحساب...' : 'Recalculating...',
    
    // Test Statistics
    testStats: lang === 'ar' ? 'إحصائيات الاختبارات' : 'Test Statistics',
    totalTests: lang === 'ar' ? 'إجمالي الاختبارات' : 'Total Tests',
    totalCategories: lang === 'ar' ? 'إجمالي الفئات' : 'Total Categories',
    safetyLevels: lang === 'ar' ? 'مستويات الأمان' : 'Safety Levels',
    colorResults: lang === 'ar' ? 'النتائج اللونية' : 'Color Results',
    averageResults: lang === 'ar' ? 'متوسط النتائج لكل اختبار' : 'Average Results per Test',
    
    // Category Distribution
    categoryDistribution: lang === 'ar' ? 'توزيع الفئات' : 'Category Distribution',
    safetyDistribution: lang === 'ar' ? 'توزيع مستويات الأمان' : 'Safety Level Distribution',
    
    // Color Results
    colorResultsStats: lang === 'ar' ? 'إحصائيات النتائج اللونية' : 'Color Results Statistics',
    totalColorResults: lang === 'ar' ? 'إجمالي النتائج اللونية' : 'Total Color Results',
    uniqueColors: lang === 'ar' ? 'الألوان الفريدة' : 'Unique Colors',
    mostCommonColor: lang === 'ar' ? 'اللون الأكثر شيوعاً' : 'Most Common Color',
    
    // System Health
    systemHealth: lang === 'ar' ? 'صحة النظام' : 'System Health',
    lastUpdated: lang === 'ar' ? 'آخر تحديث' : 'Last Updated',
    dataIntegrity: lang === 'ar' ? 'سلامة البيانات' : 'Data Integrity',
    completeness: lang === 'ar' ? 'اكتمال البيانات' : 'Data Completeness',
    
    // Messages
    statsRecalculated: lang === 'ar' ? 'تم إعادة حساب الإحصائيات بنجاح' : 'Statistics recalculated successfully',
    errorRecalculating: lang === 'ar' ? 'خطأ في إعادة حساب الإحصائيات' : 'Error recalculating statistics',
    errorLoading: lang === 'ar' ? 'خطأ في تحميل الإحصائيات' : 'Error loading statistics'
  };

  useEffect(() => {
    loadStatistics();
  }, []);

  const loadStatistics = async () => {
    try {
      setLoading(true);
      console.log('📊 Loading statistics...');

      const tests = await databaseColorTestService.getAllTests();
      console.log(`📊 Loaded ${tests?.length || 0} tests for statistics`);

      if (!tests || !Array.isArray(tests)) {
        console.warn('⚠️ No valid tests data received');
        setStats(null);
        return;
      }

      const calculatedStats = calculateStatistics(tests);
      console.log('📊 Statistics calculated successfully:', calculatedStats);
      setStats(calculatedStats);

    } catch (error) {
      console.error('Error loading statistics:', error);
      toast.error(t.errorLoading);

      // Set safe default stats
      setStats({
        tests: {
          total: 0,
          categories: 0,
          safetyLevels: 0,
          colorResults: 0,
          averageResultsPerTest: 0
        },
        categories: {},
        safetyLevels: {},
        colorResults: {
          total: 0,
          unique: 0,
          mostCommon: 'N/A',
          averagePerTest: 0
        },
        system: {
          lastUpdated: new Date().toISOString(),
          dataIntegrity: 0,
          completeness: 0
        }
      });
    } finally {
      setLoading(false);
    }
  };

  const calculateStatistics = (tests: ChemicalTest[]): SystemStats => {
    // Ensure tests is an array
    if (!tests || !Array.isArray(tests)) {
      console.warn('⚠️ Invalid tests data for statistics calculation');
      tests = [];
    }

    // Basic test statistics
    const totalTests = tests.length;
    const categories = [...new Set(tests.map(test => test?.category).filter(Boolean))];
    const safetyLevels = [...new Set(tests.map(test => test?.safety_level).filter(Boolean))];

    // Color results statistics with safe access
    const allColorResults = tests.flatMap(test => {
      const results = test?.color_results || [];
      return Array.isArray(results) ? results : [];
    }).filter(result => result && result.color); // Filter out invalid results

    const totalColorResults = allColorResults.length;
    const uniqueColors = [...new Set(allColorResults.map(result => result.color).filter(Boolean))];

    // Category distribution
    const categoryDistribution: { [key: string]: number } = {};
    tests.forEach(test => {
      if (test?.category) {
        categoryDistribution[test.category] = (categoryDistribution[test.category] || 0) + 1;
      }
    });

    // Safety level distribution
    const safetyDistribution: { [key: string]: number } = {};
    tests.forEach(test => {
      if (test?.safety_level) {
        safetyDistribution[test.safety_level] = (safetyDistribution[test.safety_level] || 0) + 1;
      }
    });

    // Most common color with safe access
    const colorFrequency: { [key: string]: number } = {};
    allColorResults.forEach(result => {
      if (result?.color) {
        colorFrequency[result.color] = (colorFrequency[result.color] || 0) + 1;
      }
    });

    const mostCommonColor = Object.keys(colorFrequency).length > 0
      ? Object.keys(colorFrequency).reduce((a, b) =>
          colorFrequency[a] > colorFrequency[b] ? a : b
        )
      : 'N/A';

    // Data integrity and completeness with safe access
    const testsWithAllFields = tests.filter(test =>
      test?.method_name &&
      test?.method_name_ar &&
      test?.description &&
      test?.description_ar &&
      test?.color_results &&
      Array.isArray(test.color_results) &&
      test.color_results.length > 0
    );

    const dataIntegrity = totalTests > 0
      ? Math.round((testsWithAllFields.length / totalTests) * 100)
      : 0;

    const completeTests = tests.filter(test =>
      test?.category &&
      test?.safety_level &&
      test?.reference
    );

    const completeness = totalTests > 0
      ? Math.round((completeTests.length / totalTests) * 100)
      : 0;

    return {
      tests: {
        total: totalTests,
        categories: categories.length,
        safetyLevels: safetyLevels.length,
        colorResults: totalColorResults,
        averageResultsPerTest: totalTests > 0 ? Math.round(totalColorResults / totalTests * 10) / 10 : 0
      },
      categories: categoryDistribution,
      safetyLevels: safetyDistribution,
      colorResults: {
        total: totalColorResults,
        unique: uniqueColors.length,
        mostCommon: mostCommonColor,
        averagePerTest: totalTests > 0 ? Math.round(totalColorResults / totalTests * 10) / 10 : 0
      },
      system: {
        lastUpdated: new Date().toISOString(),
        dataIntegrity,
        completeness
      }
    };
  };

  const handleRecalculate = async () => {
    try {
      setRecalculating(true);
      await loadStatistics();
      toast.success(t.statsRecalculated);
    } catch (error) {
      console.error('Error recalculating statistics:', error);
      toast.error(t.errorRecalculating);
    } finally {
      setRecalculating(false);
    }
  };

  const getHealthColor = (percentage: number) => {
    if (percentage >= 90) return 'text-green-600';
    if (percentage >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getHealthBadgeColor = (percentage: number) => {
    if (percentage >= 90) return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
    if (percentage >= 70) return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
    return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2">{t.loading}</span>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 dark:text-gray-400">No statistics available</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            {t.title}
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            {t.subtitle}
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={handleRecalculate}
            disabled={recalculating}
            className="flex items-center gap-2"
          >
            <CalculatorIcon className="h-4 w-4" />
            {recalculating ? t.recalculating : t.recalculate}
          </Button>
          <Button
            onClick={loadStatistics}
            variant="outline"
            className="flex items-center gap-2"
          >
            <ArrowPathIcon className="h-4 w-4" />
            {t.refresh}
          </Button>
        </div>
      </div>

      {/* Main Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <BeakerIcon className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  {t.totalTests}
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {stats.tests.total}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <TagIcon className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  {t.totalCategories}
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {stats.tests.categories}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <ShieldCheckIcon className="h-8 w-8 text-orange-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  {t.safetyLevels}
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {stats.tests.safetyLevels}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <SwatchIcon className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  {t.colorResults}
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {stats.tests.colorResults}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <ChartBarIcon className="h-8 w-8 text-indigo-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  {t.averageResults}
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {stats.tests.averageResultsPerTest}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Statistics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TagIcon className="h-5 w-5" />
              {t.categoryDistribution}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(stats.categories).map(([category, count]) => (
                <div key={category} className="flex items-center justify-between">
                  <span className="text-sm font-medium">{category}</span>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{count}</Badge>
                    <span className="text-xs text-gray-500">
                      {Math.round((count / stats.tests.total) * 100)}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Safety Level Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShieldCheckIcon className="h-5 w-5" />
              {t.safetyDistribution}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(stats.safetyLevels).map(([level, count]) => (
                <div key={level} className="flex items-center justify-between">
                  <span className="text-sm font-medium capitalize">{level}</span>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{count}</Badge>
                    <span className="text-xs text-gray-500">
                      {Math.round((count / stats.tests.total) * 100)}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Color Results & System Health */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Color Results Statistics */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <SwatchIcon className="h-5 w-5" />
              {t.colorResultsStats}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">{t.totalColorResults}</span>
                <Badge variant="outline">{stats.colorResults.total}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">{t.uniqueColors}</span>
                <Badge variant="outline">{stats.colorResults.unique}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">{t.mostCommonColor}</span>
                <Badge variant="outline">{stats.colorResults.mostCommon}</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* System Health */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CpuChipIcon className="h-5 w-5" />
              {t.systemHealth}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">{t.dataIntegrity}</span>
                <Badge className={getHealthBadgeColor(stats.system.dataIntegrity)}>
                  {stats.system.dataIntegrity}%
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">{t.completeness}</span>
                <Badge className={getHealthBadgeColor(stats.system.completeness)}>
                  {stats.system.completeness}%
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">{t.lastUpdated}</span>
                <span className="text-xs text-gray-500">
                  {new Date(stats.system.lastUpdated).toLocaleString(
                    lang === 'ar' ? 'ar-SA' : 'en-US'
                  )}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
