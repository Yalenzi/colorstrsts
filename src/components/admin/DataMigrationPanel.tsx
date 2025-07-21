'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
  ArrowRightIcon,
  ArrowLeftIcon,
  ArrowPathIcon,
  CloudIcon,
  ComputerDesktopIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
  ChartBarIcon,
  Cog6ToothIcon
} from '@heroicons/react/24/outline';
import { dataMigrationService, MigrationResult, MigrationOptions } from '@/lib/data-migration-service';
import toast from 'react-hot-toast';

interface DataMigrationPanelProps {
  isRTL: boolean;
  lang: 'ar' | 'en';
}

export default function DataMigrationPanel({ isRTL, lang }: DataMigrationPanelProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [migrationResult, setMigrationResult] = useState<MigrationResult | null>(null);
  const [comparisonData, setComparisonData] = useState<any>(null);
  const [migrationOptions, setMigrationOptions] = useState<MigrationOptions>({
    overwrite: false,
    validateData: true,
    batchSize: 10,
    skipExisting: true
  });

  const t = {
    title: lang === 'ar' ? 'نقل البيانات' : 'Data Migration',
    subtitle: lang === 'ar' ? 'نقل ومزامنة البيانات بين المحلية و Firebase' : 'Transfer and sync data between Local and Firebase',
    localToFirebase: lang === 'ar' ? 'نقل من المحلية إلى Firebase' : 'Local to Firebase',
    firebaseToLocal: lang === 'ar' ? 'نقل من Firebase إلى المحلية' : 'Firebase to Local',
    synchronize: lang === 'ar' ? 'مزامنة البيانات' : 'Synchronize Data',
    compareData: lang === 'ar' ? 'مقارنة البيانات' : 'Compare Data',
    options: lang === 'ar' ? 'خيارات النقل' : 'Migration Options',
    overwrite: lang === 'ar' ? 'استبدال البيانات الموجودة' : 'Overwrite existing data',
    validateData: lang === 'ar' ? 'التحقق من صحة البيانات' : 'Validate data',
    skipExisting: lang === 'ar' ? 'تخطي البيانات الموجودة' : 'Skip existing data',
    batchSize: lang === 'ar' ? 'حجم الدفعة' : 'Batch size',
    status: lang === 'ar' ? 'الحالة' : 'Status',
    results: lang === 'ar' ? 'النتائج' : 'Results',
    transferred: lang === 'ar' ? 'تم النقل' : 'Transferred',
    failed: lang === 'ar' ? 'فشل' : 'Failed',
    duration: lang === 'ar' ? 'المدة' : 'Duration',
    errors: lang === 'ar' ? 'الأخطاء' : 'Errors',
    localCount: lang === 'ar' ? 'عدد الاختبارات المحلية' : 'Local Tests Count',
    firebaseCount: lang === 'ar' ? 'عدد اختبارات Firebase' : 'Firebase Tests Count',
    onlyInLocal: lang === 'ar' ? 'موجود في المحلية فقط' : 'Only in Local',
    onlyInFirebase: lang === 'ar' ? 'موجود في Firebase فقط' : 'Only in Firebase',
    differences: lang === 'ar' ? 'الاختلافات' : 'Differences'
  };

  useEffect(() => {
    loadComparisonData();
  }, []);

  const loadComparisonData = async () => {
    try {
      const data = await dataMigrationService.compareData();
      setComparisonData(data);
    } catch (error) {
      console.error('Failed to load comparison data:', error);
    }
  };

  const handleMigration = async (direction: 'localToFirebase' | 'firebaseToLocal' | 'synchronize') => {
    setIsLoading(true);
    setMigrationResult(null);

    try {
      let result: MigrationResult;

      switch (direction) {
        case 'localToFirebase':
          result = await dataMigrationService.migrateLocalToFirebase(migrationOptions);
          break;
        case 'firebaseToLocal':
          result = await dataMigrationService.migrateFirebaseToLocal(migrationOptions);
          break;
        case 'synchronize':
          result = await dataMigrationService.synchronizeData();
          break;
      }

      setMigrationResult(result);

      if (result.success) {
        toast.success(lang === 'ar' ? result.message_ar : result.message);
      } else {
        toast.error(lang === 'ar' ? result.message_ar : result.message);
      }

      // إعادة تحميل بيانات المقارنة
      await loadComparisonData();

    } catch (error) {
      console.error('Migration failed:', error);
      toast.error(lang === 'ar' ? 'فشل في النقل' : 'Migration failed');
    } finally {
      setIsLoading(false);
    }
  };

  const formatDuration = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`;
    }
    return `${seconds}s`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          {t.title}
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          {t.subtitle}
        </p>
      </div>

      {/* Data Comparison */}
      {comparisonData && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ChartBarIcon className="h-5 w-5" />
              {t.compareData}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <ComputerDesktopIcon className="h-5 w-5 text-blue-500" />
                  <span className="font-medium">{t.localCount}</span>
                </div>
                <div className="text-2xl font-bold text-blue-600">
                  {comparisonData.localCount}
                </div>
              </div>
              
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <CloudIcon className="h-5 w-5 text-green-500" />
                  <span className="font-medium">{t.firebaseCount}</span>
                </div>
                <div className="text-2xl font-bold text-green-600">
                  {comparisonData.firebaseCount}
                </div>
              </div>

              <div className="text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <span className="font-medium">{t.onlyInLocal}</span>
                </div>
                <div className="text-2xl font-bold text-orange-600">
                  {comparisonData.onlyInLocal.length}
                </div>
              </div>

              <div className="text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <span className="font-medium">{t.onlyInFirebase}</span>
                </div>
                <div className="text-2xl font-bold text-purple-600">
                  {comparisonData.onlyInFirebase.length}
                </div>
              </div>
            </div>

            {comparisonData.differences.length > 0 && (
              <div className="mt-4">
                <Badge variant="outline" className="text-yellow-600">
                  {comparisonData.differences.length} {t.differences}
                </Badge>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Migration Options */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Cog6ToothIcon className="h-5 w-5" />
            {t.options}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center space-x-2">
              <Switch
                id="overwrite"
                checked={migrationOptions.overwrite}
                onCheckedChange={(checked) => 
                  setMigrationOptions(prev => ({ ...prev, overwrite: checked }))
                }
              />
              <Label htmlFor="overwrite">{t.overwrite}</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="validateData"
                checked={migrationOptions.validateData}
                onCheckedChange={(checked) => 
                  setMigrationOptions(prev => ({ ...prev, validateData: checked }))
                }
              />
              <Label htmlFor="validateData">{t.validateData}</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="skipExisting"
                checked={migrationOptions.skipExisting}
                onCheckedChange={(checked) => 
                  setMigrationOptions(prev => ({ ...prev, skipExisting: checked }))
                }
              />
              <Label htmlFor="skipExisting">{t.skipExisting}</Label>
            </div>

            <div className="space-y-2">
              <Label htmlFor="batchSize">{t.batchSize}</Label>
              <select
                id="batchSize"
                value={migrationOptions.batchSize}
                onChange={(e) => 
                  setMigrationOptions(prev => ({ ...prev, batchSize: parseInt(e.target.value) }))
                }
                className="w-full p-2 border rounded-md"
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Migration Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-600">
              <ComputerDesktopIcon className="h-5 w-5" />
              <ArrowRightIcon className="h-4 w-4" />
              <CloudIcon className="h-5 w-5" />
            </CardTitle>
            <CardDescription>{t.localToFirebase}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={() => handleMigration('localToFirebase')}
              disabled={isLoading}
              className="w-full"
              variant="outline"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                  {lang === 'ar' ? 'جاري النقل...' : 'Migrating...'}
                </div>
              ) : (
                t.localToFirebase
              )}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-600">
              <CloudIcon className="h-5 w-5" />
              <ArrowLeftIcon className="h-4 w-4" />
              <ComputerDesktopIcon className="h-5 w-5" />
            </CardTitle>
            <CardDescription>{t.firebaseToLocal}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={() => handleMigration('firebaseToLocal')}
              disabled={isLoading}
              className="w-full"
              variant="outline"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                  {lang === 'ar' ? 'جاري النقل...' : 'Migrating...'}
                </div>
              ) : (
                t.firebaseToLocal
              )}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-purple-600">
              <ArrowPathIcon className="h-5 w-5" />
            </CardTitle>
            <CardDescription>{t.synchronize}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={() => handleMigration('synchronize')}
              disabled={isLoading}
              className="w-full"
              variant="outline"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                  {lang === 'ar' ? 'جاري المزامنة...' : 'Synchronizing...'}
                </div>
              ) : (
                t.synchronize
              )}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Migration Results */}
      {migrationResult && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {migrationResult.success ? (
                <CheckCircleIcon className="h-5 w-5 text-green-500" />
              ) : (
                <ExclamationTriangleIcon className="h-5 w-5 text-red-500" />
              )}
              {t.results}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-sm text-gray-600 dark:text-gray-400">{t.transferred}</div>
                <div className="text-2xl font-bold text-green-600">
                  {migrationResult.transferred}
                </div>
              </div>
              
              <div className="text-center">
                <div className="text-sm text-gray-600 dark:text-gray-400">{t.failed}</div>
                <div className="text-2xl font-bold text-red-600">
                  {migrationResult.failed}
                </div>
              </div>

              <div className="text-center">
                <div className="text-sm text-gray-600 dark:text-gray-400">{t.duration}</div>
                <div className="text-2xl font-bold text-blue-600">
                  {formatDuration(migrationResult.duration)}
                </div>
              </div>
            </div>

            <div className="text-sm text-gray-600 dark:text-gray-400">
              {lang === 'ar' ? migrationResult.message_ar : migrationResult.message}
            </div>

            {migrationResult.errors.length > 0 && (
              <div className="space-y-2">
                <div className="text-sm font-medium text-red-600">{t.errors}:</div>
                <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded-md">
                  {migrationResult.errors.map((error, index) => (
                    <div key={index} className="text-sm text-red-700 dark:text-red-300">
                      • {error}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Refresh Button */}
      <div className="text-center">
        <Button
          onClick={loadComparisonData}
          variant="outline"
          className="flex items-center gap-2"
        >
          <ArrowPathIcon className="h-4 w-4" />
          {lang === 'ar' ? 'تحديث البيانات' : 'Refresh Data'}
        </Button>
      </div>
    </div>
  );
}
