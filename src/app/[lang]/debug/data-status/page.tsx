'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckIcon, XMarkIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import { databaseColorTestService } from '@/lib/database-color-test-service';
import { getChemicalTestsLocal } from '@/lib/local-data-service';

interface DataStatusPageProps {
  params: {
    lang: 'ar' | 'en';
  };
}

interface DataStatus {
  source: string;
  count: number;
  status: 'success' | 'error' | 'loading';
  error?: string;
  sampleIds?: string[];
}

export default function DataStatusPage({ params }: DataStatusPageProps) {
  const { lang } = params;
  const [dataStatus, setDataStatus] = useState<DataStatus[]>([]);
  const [loading, setLoading] = useState(true);

  const checkDataSources = async () => {
    setLoading(true);
    const statuses: DataStatus[] = [];

    // Check Database Color Test Service
    try {
      const dbTests = await databaseColorTestService.getAllTests();
      statuses.push({
        source: 'Database Color Test Service',
        count: dbTests.length,
        status: 'success',
        sampleIds: dbTests.slice(0, 5).map(t => t.id)
      });
    } catch (error) {
      statuses.push({
        source: 'Database Color Test Service',
        count: 0,
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }

    // Check Local Data Service
    try {
      const localTests = getChemicalTestsLocal();
      statuses.push({
        source: 'Local Data Service',
        count: localTests.length,
        status: 'success',
        sampleIds: localTests.slice(0, 5).map(t => t.id)
      });
    } catch (error) {
      statuses.push({
        source: 'Local Data Service',
        count: 0,
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }

    // Check localStorage
    try {
      const localStorageKeys = [
        'chemical_tests_local',
        'chemical_tests_db',
        'chemical_tests_data',
        'database_color_tests'
      ];

      for (const key of localStorageKeys) {
        const data = localStorage.getItem(key);
        if (data) {
          const parsed = JSON.parse(data);
          const tests = Array.isArray(parsed) ? parsed : parsed.chemical_tests || [];
          statuses.push({
            source: `localStorage: ${key}`,
            count: tests.length,
            status: 'success',
            sampleIds: tests.slice(0, 3).map((t: any) => t.id || 'no-id')
          });
        } else {
          statuses.push({
            source: `localStorage: ${key}`,
            count: 0,
            status: 'error',
            error: 'No data found'
          });
        }
      }
    } catch (error) {
      statuses.push({
        source: 'localStorage',
        count: 0,
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }

    setDataStatus(statuses);
    setLoading(false);
  };

  useEffect(() => {
    checkDataSources();
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckIcon className="h-5 w-5 text-green-600" />;
      case 'error':
        return <XMarkIcon className="h-5 w-5 text-red-600" />;
      case 'loading':
        return <ArrowPathIcon className="h-5 w-5 text-blue-600 animate-spin" />;
      default:
        return null;
    }
  };

  const getStatusBadge = (status: string, count: number) => {
    switch (status) {
      case 'success':
        return <Badge variant="default" className="bg-green-100 text-green-800">{count} tests</Badge>;
      case 'error':
        return <Badge variant="destructive">Error</Badge>;
      case 'loading':
        return <Badge variant="secondary">Loading...</Badge>;
      default:
        return null;
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            {lang === 'ar' ? 'حالة مصادر البيانات' : 'Data Sources Status'}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {lang === 'ar' 
              ? 'تحقق من حالة جميع مصادر البيانات في التطبيق'
              : 'Check the status of all data sources in the application'
            }
          </p>
        </div>

        <div className="flex justify-center">
          <Button onClick={checkDataSources} disabled={loading}>
            <ArrowPathIcon className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            {lang === 'ar' ? 'إعادة فحص' : 'Refresh Check'}
          </Button>
        </div>

        <div className="grid gap-4">
          {dataStatus.map((status, index) => (
            <Card key={index} className={`${
              status.status === 'error' ? 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950' :
              status.status === 'success' ? 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950' :
              'border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950'
            }`}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 rtl:space-x-reverse">
                    {getStatusIcon(status.status)}
                    <span className="text-lg">{status.source}</span>
                  </div>
                  {getStatusBadge(status.status, status.count)}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {status.status === 'error' && status.error && (
                  <div className="text-red-600 dark:text-red-400 text-sm mb-2">
                    <strong>{lang === 'ar' ? 'خطأ:' : 'Error:'}</strong> {status.error}
                  </div>
                )}
                
                {status.status === 'success' && status.sampleIds && status.sampleIds.length > 0 && (
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      {lang === 'ar' ? 'عينة من المعرفات:' : 'Sample IDs:'}
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {status.sampleIds.map((id, idx) => (
                        <Badge key={idx} variant="outline" className="text-xs">
                          {id}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Summary */}
        <Card className="border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950">
          <CardHeader>
            <CardTitle className="text-blue-800 dark:text-blue-200">
              {lang === 'ar' ? 'ملخص' : 'Summary'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>{lang === 'ar' ? 'مصادر البيانات الناجحة:' : 'Successful data sources:'}</span>
                <span className="font-bold text-green-600">
                  {dataStatus.filter(s => s.status === 'success').length}
                </span>
              </div>
              <div className="flex justify-between">
                <span>{lang === 'ar' ? 'مصادر البيانات بأخطاء:' : 'Data sources with errors:'}</span>
                <span className="font-bold text-red-600">
                  {dataStatus.filter(s => s.status === 'error').length}
                </span>
              </div>
              <div className="flex justify-between">
                <span>{lang === 'ar' ? 'أعلى عدد اختبارات:' : 'Highest test count:'}</span>
                <span className="font-bold text-blue-600">
                  {Math.max(...dataStatus.filter(s => s.status === 'success').map(s => s.count), 0)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex space-x-4 rtl:space-x-reverse">
          <Button 
            variant="outline" 
            onClick={() => window.history.back()}
            className="flex-1"
          >
            {lang === 'ar' ? 'العودة' : 'Go Back'}
          </Button>
          <Button 
            onClick={() => window.location.href = `/${lang}/debug/clear-cache`}
            variant="secondary"
            className="flex-1"
          >
            {lang === 'ar' ? 'مسح ذاكرة التخزين' : 'Clear Cache'}
          </Button>
        </div>
      </div>
    </div>
  );
}
