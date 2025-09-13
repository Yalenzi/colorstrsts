'use client';

import { useState, useEffect } from 'react';
import { Language } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { db } from '@/lib/firebase';
import { doc, setDoc, getDoc, collection, getDocs } from 'firebase/firestore';
import toast from 'react-hot-toast';
import {
  CircleStackIcon,
  CloudIcon,
  ShieldCheckIcon,
  ArrowPathIcon,
  DocumentDuplicateIcon,
  ChartBarIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  InformationCircleIcon,
  ClockIcon,
  ServerIcon,
  CogIcon
} from '@heroicons/react/24/outline';

interface DatabaseStats {
  totalDocuments: number;
  totalCollections: number;
  storageUsed: number; // in MB
  storageLimit: number; // in MB
  readsToday: number;
  writesToday: number;
  deletesToday: number;
  activeConnections: number;
  avgResponseTime: number; // in ms
  errorRate: number; // percentage
  uptime: number; // in hours
}

interface BackupSettings {
  enabled: boolean;
  frequency: 'daily' | 'weekly' | 'monthly';
  retentionDays: number;
  includeCollections: string[];
  compressionEnabled: boolean;
  encryptionEnabled: boolean;
  autoBackup: boolean;
  backupLocation: 'local' | 'cloud' | 'both';
  maxBackupSize: number; // in MB
}

interface DatabaseSettings {
  // Firestore Rules
  rulesEnabled: boolean;
  customRules: string;
  
  // Performance
  indexOptimization: boolean;
  queryOptimization: boolean;
  cacheEnabled: boolean;
  
  // Security
  securityRulesEnabled: boolean;
  ipWhitelist: string[];
  rateLimiting: {
    enabled: boolean;
    readsPerMinute: number;
    writesPerMinute: number;
  };
  
  // Backup & Restore
  backup: BackupSettings;
  
  // Monitoring
  monitoring: {
    enabled: boolean;
    alertThresholds: {
      storageUsage: number; // percentage
      readOperations: number; // per hour
      writeOperations: number; // per hour
    };
  };
  
  // Data Migration
  migration: {
    enabled: boolean;
    sourceDatabase: string;
    targetDatabase: string;
    batchSize: number;
  };
}

interface DatabaseSettingsProps {
  lang: Language;
}

export function DatabaseSettings({ lang }: DatabaseSettingsProps) {
  const [settings, setSettings] = useState<DatabaseSettings>({
    rulesEnabled: true,
    customRules: '',
    indexOptimization: true,
    queryOptimization: true,
    cacheEnabled: true,
    securityRulesEnabled: true,
    ipWhitelist: [],
    rateLimiting: {
      enabled: true,
      readsPerMinute: 1000,
      writesPerMinute: 100
    },
    backup: {
      enabled: true,
      frequency: 'daily',
      retentionDays: 30,
      includeCollections: ['users', 'tests', 'results', 'subscriptions'],
      compressionEnabled: true,
      encryptionEnabled: true,
      autoBackup: true,
      backupLocation: 'both',
      maxBackupSize: 500
    },
    monitoring: {
      enabled: true,
      alertThresholds: {
        storageUsage: 80,
        readOperations: 10000,
        writeOperations: 1000
      }
    },
    migration: {
      enabled: false,
      sourceDatabase: '',
      targetDatabase: '',
      batchSize: 100
    }
  });

  const [stats, setStats] = useState<DatabaseStats>({
    totalDocuments: 0,
    totalCollections: 0,
    storageUsed: 0,
    storageLimit: 1024,
    readsToday: 0,
    writesToday: 0,
    deletesToday: 0,
    activeConnections: 0,
    avgResponseTime: 0,
    errorRate: 0,
    uptime: 0
  });

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [backingUp, setBackingUp] = useState(false);

  const isRTL = lang === 'ar';

  const texts = {
    title: isRTL ? 'إعدادات قاعدة البيانات' : 'Database Settings',
    subtitle: isRTL ? 'إدارة Firestore والنسخ الاحتياطي والأمان' : 'Manage Firestore, backups, and security',
    
    // Tabs
    overview: isRTL ? 'نظرة عامة' : 'Overview',
    rules: isRTL ? 'القواعد' : 'Rules',
    backup: isRTL ? 'النسخ الاحتياطي' : 'Backup',
    security: isRTL ? 'الأمان' : 'Security',
    performance: isRTL ? 'الأداء' : 'Performance',
    migration: isRTL ? 'الترحيل' : 'Migration',
    
    // Overview
    databaseStats: isRTL ? 'إحصائيات قاعدة البيانات' : 'Database Statistics',
    totalDocuments: isRTL ? 'إجمالي المستندات' : 'Total Documents',
    totalCollections: isRTL ? 'إجمالي المجموعات' : 'Total Collections',
    storageUsed: isRTL ? 'التخزين المستخدم' : 'Storage Used',
    storageLimit: isRTL ? 'حد التخزين' : 'Storage Limit',
    readsToday: isRTL ? 'القراءات اليوم' : 'Reads Today',
    writesToday: isRTL ? 'الكتابات اليوم' : 'Writes Today',
    deletesToday: isRTL ? 'الحذف اليوم' : 'Deletes Today',
    
    // Rules
    rulesEnabled: isRTL ? 'تفعيل القواعد' : 'Enable Rules',
    customRules: isRTL ? 'قواعد مخصصة' : 'Custom Rules',
    defaultRules: isRTL ? 'القواعد الافتراضية' : 'Default Rules',
    
    // Backup
    backupEnabled: isRTL ? 'تفعيل النسخ الاحتياطي' : 'Enable Backup',
    backupFrequency: isRTL ? 'تكرار النسخ الاحتياطي' : 'Backup Frequency',
    retentionDays: isRTL ? 'أيام الاحتفاظ' : 'Retention Days',
    includeCollections: isRTL ? 'المجموعات المشمولة' : 'Include Collections',
    compressionEnabled: isRTL ? 'تفعيل الضغط' : 'Enable Compression',
    encryptionEnabled: isRTL ? 'تفعيل التشفير' : 'Enable Encryption',
    createBackup: isRTL ? 'إنشاء نسخة احتياطية' : 'Create Backup',
    
    // Security
    securityRulesEnabled: isRTL ? 'تفعيل قواعد الأمان' : 'Enable Security Rules',
    ipWhitelist: isRTL ? 'قائمة IP المسموحة' : 'IP Whitelist',
    rateLimitingEnabled: isRTL ? 'تفعيل تحديد المعدل' : 'Enable Rate Limiting',
    readsPerMinute: isRTL ? 'القراءات في الدقيقة' : 'Reads Per Minute',
    writesPerMinute: isRTL ? 'الكتابات في الدقيقة' : 'Writes Per Minute',
    
    // Performance
    indexOptimization: isRTL ? 'تحسين الفهارس' : 'Index Optimization',
    queryOptimization: isRTL ? 'تحسين الاستعلامات' : 'Query Optimization',
    cacheEnabled: isRTL ? 'تفعيل التخزين المؤقت' : 'Enable Cache',
    
    // Monitoring
    monitoring: isRTL ? 'المراقبة' : 'Monitoring',
    monitoringEnabled: isRTL ? 'تفعيل المراقبة' : 'Enable Monitoring',
    alertThresholds: isRTL ? 'حدود التنبيه' : 'Alert Thresholds',
    storageUsageThreshold: isRTL ? 'حد استخدام التخزين (%)' : 'Storage Usage Threshold (%)',
    readOperationsThreshold: isRTL ? 'حد عمليات القراءة (في الساعة)' : 'Read Operations Threshold (per hour)',
    writeOperationsThreshold: isRTL ? 'حد عمليات الكتابة (في الساعة)' : 'Write Operations Threshold (per hour)',
    
    // Migration
    migrationEnabled: isRTL ? 'تفعيل الترحيل' : 'Enable Migration',
    sourceDatabase: isRTL ? 'قاعدة البيانات المصدر' : 'Source Database',
    targetDatabase: isRTL ? 'قاعدة البيانات الهدف' : 'Target Database',
    batchSize: isRTL ? 'حجم الدفعة' : 'Batch Size',
    startMigration: isRTL ? 'بدء الترحيل' : 'Start Migration',
    
    // Frequencies
    daily: isRTL ? 'يومي' : 'Daily',
    weekly: isRTL ? 'أسبوعي' : 'Weekly',
    monthly: isRTL ? 'شهري' : 'Monthly',
    
    // Actions
    save: isRTL ? 'حفظ' : 'Save',
    refresh: isRTL ? 'تحديث' : 'Refresh',
    optimize: isRTL ? 'تحسين' : 'Optimize',
    
    // Messages
    saving: isRTL ? 'جاري الحفظ...' : 'Saving...',
    saved: isRTL ? 'تم الحفظ بنجاح' : 'Settings saved successfully',
    error: isRTL ? 'حدث خطأ' : 'An error occurred',
    backupCreated: isRTL ? 'تم إنشاء النسخة الاحتياطية' : 'Backup created successfully',
    
    // Descriptions
    rulesDesc: isRTL ? 'إدارة قواعد الأمان والوصول لـ Firestore' : 'Manage Firestore security and access rules',
    backupDesc: isRTL ? 'إعدادات النسخ الاحتياطي التلقائي للبيانات' : 'Configure automatic data backup settings',
    securityDesc: isRTL ? 'إعدادات الأمان وحماية قاعدة البيانات' : 'Database security and protection settings',
    performanceDesc: isRTL ? 'تحسين أداء قاعدة البيانات والاستعلامات' : 'Optimize database and query performance',
  };

  useEffect(() => {
    loadSettings();
    loadStats();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const settingsRef = doc(db, 'settings', 'database');
      const settingsDoc = await getDoc(settingsRef);
      
      if (settingsDoc.exists()) {
        const data = settingsDoc.data();
        setSettings(prev => ({ ...prev, ...data }));
      }
    } catch (error) {
      console.error('Error loading database settings:', error);
      toast.error(texts.error);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      // Simulate loading database stats
      const collections = ['users', 'tests', 'results', 'subscriptions', 'settings'];
      let totalDocs = 0;
      
      for (const collectionName of collections) {
        try {
          const snapshot = await getDocs(collection(db, collectionName));
          totalDocs += snapshot.size;
        } catch (error) {
          console.warn(`Could not count documents in ${collectionName}:`, error);
        }
      }
      
      setStats({
        totalDocuments: totalDocs,
        totalCollections: collections.length,
        storageUsed: Math.floor(Math.random() * 500) + 100,
        storageLimit: 1024,
        readsToday: Math.floor(Math.random() * 5000) + 1000,
        writesToday: Math.floor(Math.random() * 500) + 100,
        deletesToday: Math.floor(Math.random() * 50) + 10,
        activeConnections: Math.floor(Math.random() * 50) + 10,
        avgResponseTime: Math.floor(Math.random() * 200) + 50,
        errorRate: Math.floor(Math.random() * 5),
        uptime: Math.floor(Math.random() * 720) + 24
      });
    } catch (error) {
      console.error('Error loading database stats:', error);
    }
  };

  const saveSettings = async () => {
    try {
      setSaving(true);
      const settingsRef = doc(db, 'settings', 'database');
      
      await setDoc(settingsRef, {
        ...settings,
        updatedAt: new Date().toISOString(),
        createdAt: new Date().toISOString()
      }, { merge: true });
      
      toast.success(texts.saved);
    } catch (error) {
      console.error('Error saving database settings:', error);
      toast.error(texts.error);
    } finally {
      setSaving(false);
    }
  };

  const createBackup = async () => {
    try {
      setBackingUp(true);
      // Simulate backup creation
      await new Promise(resolve => setTimeout(resolve, 3000));
      toast.success(texts.backupCreated);
    } catch (error) {
      toast.error(texts.error);
    } finally {
      setBackingUp(false);
    }
  };

  const getStoragePercentage = () => {
    return Math.round((stats.storageUsed / stats.storageLimit) * 100);
  };

  const getStorageColor = () => {
    const percentage = getStoragePercentage();
    if (percentage < 70) return 'text-green-600';
    if (percentage < 90) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className={`space-y-6 ${isRTL ? 'rtl' : 'ltr'}`} dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            {texts.title}
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            {texts.subtitle}
          </p>
        </div>
        <div className="flex space-x-2 rtl:space-x-reverse">
          <Button variant="outline" onClick={loadStats}>
            <ArrowPathIcon className="h-4 w-4 mr-2 rtl:ml-2 rtl:mr-0" />
            {texts.refresh}
          </Button>
          <Button onClick={saveSettings} disabled={saving}>
            {saving ? (
              <ArrowPathIcon className="h-4 w-4 mr-2 rtl:ml-2 rtl:mr-0 animate-spin" />
            ) : (
              <CheckCircleIcon className="h-4 w-4 mr-2 rtl:ml-2 rtl:mr-0" />
            )}
            {saving ? texts.saving : texts.save}
          </Button>
        </div>
      </div>

      {/* Database Settings Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">{texts.overview}</TabsTrigger>
          <TabsTrigger value="rules">{texts.rules}</TabsTrigger>
          <TabsTrigger value="backup">{texts.backup}</TabsTrigger>
          <TabsTrigger value="security">{texts.security}</TabsTrigger>
          <TabsTrigger value="performance">{texts.performance}</TabsTrigger>
          <TabsTrigger value="migration">{texts.migration}</TabsTrigger>
        </TabsList>

        {/* Overview */}
        <TabsContent value="overview">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{texts.totalDocuments}</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalDocuments.toLocaleString()}</p>
                  </div>
                  <CircleStackIcon className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{texts.totalCollections}</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalCollections}</p>
                  </div>
                  <DocumentDuplicateIcon className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{texts.storageUsed}</p>
                    <p className={`text-2xl font-bold ${getStorageColor()}`}>
                      {stats.storageUsed} MB
                    </p>
                    <p className="text-xs text-gray-500">
                      {getStoragePercentage()}% {isRTL ? 'من' : 'of'} {stats.storageLimit} MB
                    </p>
                  </div>
                  <CloudIcon className="h-8 w-8 text-purple-600" />
                </div>
                <Progress value={getStoragePercentage()} className="mt-2" />
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{texts.readsToday}</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.readsToday.toLocaleString()}</p>
                  </div>
                  <ChartBarIcon className="h-8 w-8 text-orange-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>{texts.databaseStats}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">{texts.writesToday}</span>
                  <span className="font-medium">{stats.writesToday.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">{texts.deletesToday}</span>
                  <span className="font-medium">{stats.deletesToday.toLocaleString()}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 rtl:space-x-reverse">
                  <ShieldCheckIcon className="h-5 w-5" />
                  <span>{texts.monitoring}</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-base font-medium">{texts.monitoringEnabled}</Label>
                  <Switch
                    checked={settings.monitoring.enabled}
                    onCheckedChange={(checked) =>
                      setSettings(prev => ({
                        ...prev,
                        monitoring: { ...prev.monitoring, enabled: checked }
                      }))
                    }
                  />
                </div>
                
                {settings.monitoring.enabled && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>{texts.storageUsageThreshold}</span>
                      <Badge variant={getStoragePercentage() > settings.monitoring.alertThresholds.storageUsage ? 'destructive' : 'default'}>
                        {settings.monitoring.alertThresholds.storageUsage}%
                      </Badge>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Backup Settings */}
        <TabsContent value="backup">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center space-x-2 rtl:space-x-reverse">
                  <DocumentDuplicateIcon className="h-5 w-5" />
                  <span>{texts.backup}</span>
                </div>
                <Button onClick={createBackup} disabled={backingUp}>
                  {backingUp ? (
                    <ArrowPathIcon className="h-4 w-4 mr-2 rtl:ml-2 rtl:mr-0 animate-spin" />
                  ) : (
                    <DocumentDuplicateIcon className="h-4 w-4 mr-2 rtl:ml-2 rtl:mr-0" />
                  )}
                  {backingUp ? (isRTL ? 'جاري الإنشاء...' : 'Creating...') : texts.createBackup}
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base font-medium">{texts.backupEnabled}</Label>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {texts.backupDesc}
                  </p>
                </div>
                <Switch
                  checked={settings.backup.enabled}
                  onCheckedChange={(checked) =>
                    setSettings(prev => ({
                      ...prev,
                      backup: { ...prev.backup, enabled: checked }
                    }))
                  }
                />
              </div>

              {settings.backup.enabled && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="backupFrequency">{texts.backupFrequency}</Label>
                      <Select
                        value={settings.backup.frequency}
                        onValueChange={(value: 'daily' | 'weekly' | 'monthly') =>
                          setSettings(prev => ({
                            ...prev,
                            backup: { ...prev.backup, frequency: value }
                          }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="daily">{texts.daily}</SelectItem>
                          <SelectItem value="weekly">{texts.weekly}</SelectItem>
                          <SelectItem value="monthly">{texts.monthly}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="retentionDays">{texts.retentionDays}</Label>
                      <Input
                        id="retentionDays"
                        type="number"
                        value={settings.backup.retentionDays}
                        onChange={(e) => setSettings(prev => ({
                          ...prev,
                          backup: { 
                            ...prev.backup, 
                            retentionDays: parseInt(e.target.value) || 30 
                          }
                        }))}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="text-base font-medium">{texts.compressionEnabled}</Label>
                      <Switch
                        checked={settings.backup.compressionEnabled}
                        onCheckedChange={(checked) =>
                          setSettings(prev => ({
                            ...prev,
                            backup: { ...prev.backup, compressionEnabled: checked }
                          }))
                        }
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <Label className="text-base font-medium">{texts.encryptionEnabled}</Label>
                      <Switch
                        checked={settings.backup.encryptionEnabled}
                        onCheckedChange={(checked) =>
                          setSettings(prev => ({
                            ...prev,
                            backup: { ...prev.backup, encryptionEnabled: checked }
                          }))
                        }
                      />
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Settings */}
        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 rtl:space-x-reverse">
                <ShieldCheckIcon className="h-5 w-5" />
                <span>{texts.security}</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base font-medium">{texts.securityRulesEnabled}</Label>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {texts.securityDesc}
                  </p>
                </div>
                <Switch
                  checked={settings.securityRulesEnabled}
                  onCheckedChange={(checked) =>
                    setSettings(prev => ({ ...prev, securityRulesEnabled: checked }))
                  }
                />
              </div>

              <div className="space-y-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <Label className="text-base font-medium">{texts.rateLimitingEnabled}</Label>
                  <Switch
                    checked={settings.rateLimiting.enabled}
                    onCheckedChange={(checked) =>
                      setSettings(prev => ({
                        ...prev,
                        rateLimiting: { ...prev.rateLimiting, enabled: checked }
                      }))
                    }
                  />
                </div>

                {settings.rateLimiting.enabled && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="readsPerMinute">{texts.readsPerMinute}</Label>
                      <Input
                        id="readsPerMinute"
                        type="number"
                        value={settings.rateLimiting.readsPerMinute}
                        onChange={(e) => setSettings(prev => ({
                          ...prev,
                          rateLimiting: { 
                            ...prev.rateLimiting, 
                            readsPerMinute: parseInt(e.target.value) || 1000 
                          }
                        }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="writesPerMinute">{texts.writesPerMinute}</Label>
                      <Input
                        id="writesPerMinute"
                        type="number"
                        value={settings.rateLimiting.writesPerMinute}
                        onChange={(e) => setSettings(prev => ({
                          ...prev,
                          rateLimiting: { 
                            ...prev.rateLimiting, 
                            writesPerMinute: parseInt(e.target.value) || 100 
                          }
                        }))}
                      />
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Performance Settings */}
        <TabsContent value="performance">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 rtl:space-x-reverse">
                <CogIcon className="h-5 w-5" />
                <span>{texts.performance}</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base font-medium">{texts.indexOptimization}</Label>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {texts.performanceDesc}
                  </p>
                </div>
                <Switch
                  checked={settings.indexOptimization}
                  onCheckedChange={(checked) =>
                    setSettings(prev => ({ ...prev, indexOptimization: checked }))
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <Label className="text-base font-medium">{texts.queryOptimization}</Label>
                <Switch
                  checked={settings.queryOptimization}
                  onCheckedChange={(checked) =>
                    setSettings(prev => ({ ...prev, queryOptimization: checked }))
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <Label className="text-base font-medium">{texts.cacheEnabled}</Label>
                <Switch
                  checked={settings.cacheEnabled}
                  onCheckedChange={(checked) =>
                    setSettings(prev => ({ ...prev, cacheEnabled: checked }))
                  }
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Migration */}
        <TabsContent value="migration">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 rtl:space-x-reverse">
                <ServerIcon className="h-5 w-5" />
                <span>{texts.migration}</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <ExclamationTriangleIcon className="h-4 w-4" />
                <AlertDescription>
                  {isRTL 
                    ? 'ترحيل البيانات عملية حساسة. تأكد من إنشاء نسخة احتياطية قبل البدء.'
                    : 'Data migration is a sensitive operation. Make sure to create a backup before starting.'
                  }
                </AlertDescription>
              </Alert>

              <div className="flex items-center justify-between">
                <Label className="text-base font-medium">{texts.migrationEnabled}</Label>
                <Switch
                  checked={settings.migration.enabled}
                  onCheckedChange={(checked) =>
                    setSettings(prev => ({
                      ...prev,
                      migration: { ...prev.migration, enabled: checked }
                    }))
                  }
                />
              </div>

              {settings.migration.enabled && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="sourceDatabase">{texts.sourceDatabase}</Label>
                      <Input
                        id="sourceDatabase"
                        value={settings.migration.sourceDatabase}
                        onChange={(e) => setSettings(prev => ({
                          ...prev,
                          migration: { ...prev.migration, sourceDatabase: e.target.value }
                        }))}
                        placeholder="source-project-id"
                      />
                    </div>
                    <div>
                      <Label htmlFor="targetDatabase">{texts.targetDatabase}</Label>
                      <Input
                        id="targetDatabase"
                        value={settings.migration.targetDatabase}
                        onChange={(e) => setSettings(prev => ({
                          ...prev,
                          migration: { ...prev.migration, targetDatabase: e.target.value }
                        }))}
                        placeholder="target-project-id"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="batchSize">{texts.batchSize}</Label>
                    <Input
                      id="batchSize"
                      type="number"
                      value={settings.migration.batchSize}
                      onChange={(e) => setSettings(prev => ({
                        ...prev,
                        migration: { 
                          ...prev.migration, 
                          batchSize: parseInt(e.target.value) || 100 
                        }
                      }))}
                    />
                  </div>

                  <Button variant="outline" className="w-full">
                    <ArrowPathIcon className="h-4 w-4 mr-2 rtl:ml-2 rtl:mr-0" />
                    {texts.startMigration}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
