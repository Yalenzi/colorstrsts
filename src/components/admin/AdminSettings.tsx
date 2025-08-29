'use client';

import React, { useState, useEffect } from 'react';
import { Language } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  ShieldCheckIcon, 
  DatabaseIcon, 
  BellIcon, 
  ChartBarIcon,
  KeyIcon,
  ServerIcon,
  MailIcon,
  DevicePhoneMobileIcon,
  ClockIcon,
  UserGroupIcon,
  DocumentTextIcon,
  CogIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import { AdminErrorBoundary } from './AdminErrorBoundary';

interface AdminSettingsProps {
  lang: Language;
}

interface SecuritySettings {
  passwordPolicy: {
    minLength: number;
    requireUppercase: boolean;
    requireLowercase: boolean;
    requireNumbers: boolean;
    requireSpecialChars: boolean;
    maxAge: number;
  };
  sessionManagement: {
    sessionTimeout: number;
    maxConcurrentSessions: number;
    requireReauth: boolean;
  };
  accessControl: {
    maxLoginAttempts: number;
    lockoutDuration: number;
    ipWhitelist: string[];
    twoFactorRequired: boolean;
  };
  auditLogging: {
    enabled: boolean;
    logLevel: 'basic' | 'detailed' | 'verbose';
    retentionDays: number;
  };
}

interface DatabaseSettings {
  backup: {
    autoBackup: boolean;
    backupInterval: number;
    maxBackups: number;
    backupLocation: string;
  };
  performance: {
    cacheEnabled: boolean;
    cacheSize: number;
    queryTimeout: number;
    connectionPoolSize: number;
  };
  maintenance: {
    autoOptimize: boolean;
    optimizeInterval: number;
    vacuumEnabled: boolean;
  };
}

interface NotificationSettings {
  email: {
    enabled: boolean;
    smtpServer: string;
    smtpPort: number;
    username: string;
    password: string;
    fromAddress: string;
    templates: {
      userRegistration: boolean;
      testCompletion: boolean;
      systemAlerts: boolean;
      adminNotifications: boolean;
    };
  };
  sms: {
    enabled: boolean;
    provider: 'twilio' | 'aws' | 'local';
    apiKey: string;
    fromNumber: string;
    templates: {
      criticalAlerts: boolean;
      testResults: boolean;
      systemMaintenance: boolean;
    };
  };
  push: {
    enabled: boolean;
    firebaseKey: string;
    vapidKey: string;
    templates: {
      newTests: boolean;
      systemUpdates: boolean;
      userActivity: boolean;
    };
  };
}

interface PerformanceSettings {
  caching: {
    enabled: boolean;
    strategy: 'memory' | 'redis' | 'file';
    ttl: number;
    maxSize: number;
  };
  optimization: {
    imageCompression: boolean;
    minifyAssets: boolean;
    gzipCompression: boolean;
    cdnEnabled: boolean;
  };
  monitoring: {
    enabled: boolean;
    metricsInterval: number;
    alertThresholds: {
      cpuUsage: number;
      memoryUsage: number;
      responseTime: number;
      errorRate: number;
    };
  };
}

export function AdminSettings({ lang }: AdminSettingsProps) {
  const [activeTab, setActiveTab] = useState('security');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Settings state
  const [securitySettings, setSecuritySettings] = useState<SecuritySettings>({
    passwordPolicy: {
      minLength: 8,
      requireUppercase: true,
      requireLowercase: true,
      requireNumbers: true,
      requireSpecialChars: true,
      maxAge: 90
    },
    sessionManagement: {
      sessionTimeout: 3600,
      maxConcurrentSessions: 3,
      requireReauth: true
    },
    accessControl: {
      maxLoginAttempts: 5,
      lockoutDuration: 900,
      ipWhitelist: [],
      twoFactorRequired: false
    },
    auditLogging: {
      enabled: true,
      logLevel: 'detailed',
      retentionDays: 90
    }
  });

  const [databaseSettings, setDatabaseSettings] = useState<DatabaseSettings>({
    backup: {
      autoBackup: true,
      backupInterval: 24,
      maxBackups: 30,
      backupLocation: '/backups'
    },
    performance: {
      cacheEnabled: true,
      cacheSize: 512,
      queryTimeout: 30,
      connectionPoolSize: 10
    },
    maintenance: {
      autoOptimize: true,
      optimizeInterval: 168,
      vacuumEnabled: true
    }
  });

  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>({
    email: {
      enabled: true,
      smtpServer: 'smtp.gmail.com',
      smtpPort: 587,
      username: 'aburakan4551@gmail.com',
      password: '',
      fromAddress: 'aburakan4551@gmail.com',
      templates: {
        userRegistration: true,
        testCompletion: true,
        systemAlerts: true,
        adminNotifications: true
      }
    },
    sms: {
      enabled: false,
      provider: 'twilio',
      apiKey: '',
      fromNumber: '',
      templates: {
        criticalAlerts: true,
        testResults: false,
        systemMaintenance: true
      }
    },
    push: {
      enabled: true,
      firebaseKey: '',
      vapidKey: '',
      templates: {
        newTests: true,
        systemUpdates: true,
        userActivity: false
      }
    }
  });

  const [performanceSettings, setPerformanceSettings] = useState<PerformanceSettings>({
    caching: {
      enabled: true,
      strategy: 'memory',
      ttl: 3600,
      maxSize: 100
    },
    optimization: {
      imageCompression: true,
      minifyAssets: true,
      gzipCompression: true,
      cdnEnabled: false
    },
    monitoring: {
      enabled: true,
      metricsInterval: 60,
      alertThresholds: {
        cpuUsage: 80,
        memoryUsage: 85,
        responseTime: 2000,
        errorRate: 5
      }
    }
  });

  const isRTL = lang === 'ar';

  const texts = {
    ar: {
      title: 'إعدادات الإدارة',
      description: 'إدارة إعدادات النظام والأمان والأداء',
      security: 'الأمان',
      database: 'قاعدة البيانات',
      notifications: 'الإشعارات',
      performance: 'الأداء',
      save: 'حفظ الإعدادات',
      saving: 'جاري الحفظ...',
      saved: 'تم حفظ الإعدادات بنجاح',
      error: 'حدث خطأ أثناء الحفظ',
      passwordPolicy: 'سياسة كلمات المرور',
      sessionManagement: 'إدارة الجلسات',
      accessControl: 'التحكم في الوصول',
      auditLogging: 'سجل التدقيق',
      backupSettings: 'إعدادات النسخ الاحتياطي',
      performanceSettings: 'إعدادات الأداء',
      maintenanceSettings: 'إعدادات الصيانة',
      emailSettings: 'إعدادات البريد الإلكتروني',
      smsSettings: 'إعدادات الرسائل النصية',
      pushSettings: 'إعدادات الإشعارات الفورية',
      cachingSettings: 'إعدادات التخزين المؤقت',
      optimizationSettings: 'إعدادات التحسين',
      monitoringSettings: 'إعدادات المراقبة'
    },
    en: {
      title: 'Admin Settings',
      description: 'Manage system, security, and performance settings',
      security: 'Security',
      database: 'Database',
      notifications: 'Notifications',
      performance: 'Performance',
      save: 'Save Settings',
      saving: 'Saving...',
      saved: 'Settings saved successfully',
      error: 'Error saving settings',
      passwordPolicy: 'Password Policy',
      sessionManagement: 'Session Management',
      accessControl: 'Access Control',
      auditLogging: 'Audit Logging',
      backupSettings: 'Backup Settings',
      performanceSettings: 'Performance Settings',
      maintenanceSettings: 'Maintenance Settings',
      emailSettings: 'Email Settings',
      smsSettings: 'SMS Settings',
      pushSettings: 'Push Notification Settings',
      cachingSettings: 'Caching Settings',
      optimizationSettings: 'Optimization Settings',
      monitoringSettings: 'Monitoring Settings'
    }
  };

  const t = texts[lang];

  // Load settings on component mount
  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setLoading(true);
    try {
      // Load settings from localStorage or API
      const savedSecuritySettings = localStorage.getItem('admin_security_settings');
      if (savedSecuritySettings) {
        setSecuritySettings(JSON.parse(savedSecuritySettings));
      }

      const savedDatabaseSettings = localStorage.getItem('admin_database_settings');
      if (savedDatabaseSettings) {
        setDatabaseSettings(JSON.parse(savedDatabaseSettings));
      }

      const savedNotificationSettings = localStorage.getItem('admin_notification_settings');
      if (savedNotificationSettings) {
        setNotificationSettings(JSON.parse(savedNotificationSettings));
      }

      const savedPerformanceSettings = localStorage.getItem('admin_performance_settings');
      if (savedPerformanceSettings) {
        setPerformanceSettings(JSON.parse(savedPerformanceSettings));
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    setSaving(true);
    try {
      // Save settings to localStorage and/or API
      localStorage.setItem('admin_security_settings', JSON.stringify(securitySettings));
      localStorage.setItem('admin_database_settings', JSON.stringify(databaseSettings));
      localStorage.setItem('admin_notification_settings', JSON.stringify(notificationSettings));
      localStorage.setItem('admin_performance_settings', JSON.stringify(performanceSettings));

      // Here you would also send to your backend API
      // await saveSettingsToAPI({ security, database, notifications, performance });

      toast.success(t.saved);
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error(t.error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <AdminErrorBoundary lang={lang}>
      <div className={`space-y-6 ${isRTL ? 'rtl' : 'ltr'}`} dir={isRTL ? 'rtl' : 'ltr'}>
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">{t.title}</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">{t.description}</p>
        </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="security" className="flex items-center space-x-2 rtl:space-x-reverse">
            <ShieldCheckIcon className="h-4 w-4" />
            <span>{t.security}</span>
          </TabsTrigger>
          <TabsTrigger value="database" className="flex items-center space-x-2 rtl:space-x-reverse">
            <DatabaseIcon className="h-4 w-4" />
            <span>{t.database}</span>
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center space-x-2 rtl:space-x-reverse">
            <BellIcon className="h-4 w-4" />
            <span>{t.notifications}</span>
          </TabsTrigger>
          <TabsTrigger value="performance" className="flex items-center space-x-2 rtl:space-x-reverse">
            <ChartBarIcon className="h-4 w-4" />
            <span>{t.performance}</span>
          </TabsTrigger>
        </TabsList>

        {/* Security Settings Tab */}
        <TabsContent value="security" className="space-y-6">
          {/* Password Policy */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 rtl:space-x-reverse">
                <KeyIcon className="h-5 w-5" />
                <span>{t.passwordPolicy}</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    {lang === 'ar' ? 'الحد الأدنى لطول كلمة المرور' : 'Minimum Password Length'}
                  </label>
                  <Input
                    type="number"
                    value={securitySettings.passwordPolicy.minLength}
                    onChange={(e) => setSecuritySettings(prev => ({
                      ...prev,
                      passwordPolicy: { ...prev.passwordPolicy, minLength: parseInt(e.target.value) }
                    }))}
                    min="6"
                    max="32"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    {lang === 'ar' ? 'انتهاء صلاحية كلمة المرور (أيام)' : 'Password Expiry (days)'}
                  </label>
                  <Input
                    type="number"
                    value={securitySettings.passwordPolicy.maxAge}
                    onChange={(e) => setSecuritySettings(prev => ({
                      ...prev,
                      passwordPolicy: { ...prev.passwordPolicy, maxAge: parseInt(e.target.value) }
                    }))}
                    min="30"
                    max="365"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="flex items-center space-x-2 rtl:space-x-reverse">
                  <Switch
                    checked={securitySettings.passwordPolicy.requireUppercase}
                    onCheckedChange={(checked) => setSecuritySettings(prev => ({
                      ...prev,
                      passwordPolicy: { ...prev.passwordPolicy, requireUppercase: checked }
                    }))}
                  />
                  <label className="text-sm">
                    {lang === 'ar' ? 'أحرف كبيرة' : 'Uppercase'}
                  </label>
                </div>
                <div className="flex items-center space-x-2 rtl:space-x-reverse">
                  <Switch
                    checked={securitySettings.passwordPolicy.requireLowercase}
                    onCheckedChange={(checked) => setSecuritySettings(prev => ({
                      ...prev,
                      passwordPolicy: { ...prev.passwordPolicy, requireLowercase: checked }
                    }))}
                  />
                  <label className="text-sm">
                    {lang === 'ar' ? 'أحرف صغيرة' : 'Lowercase'}
                  </label>
                </div>
                <div className="flex items-center space-x-2 rtl:space-x-reverse">
                  <Switch
                    checked={securitySettings.passwordPolicy.requireNumbers}
                    onCheckedChange={(checked) => setSecuritySettings(prev => ({
                      ...prev,
                      passwordPolicy: { ...prev.passwordPolicy, requireNumbers: checked }
                    }))}
                  />
                  <label className="text-sm">
                    {lang === 'ar' ? 'أرقام' : 'Numbers'}
                  </label>
                </div>
                <div className="flex items-center space-x-2 rtl:space-x-reverse">
                  <Switch
                    checked={securitySettings.passwordPolicy.requireSpecialChars}
                    onCheckedChange={(checked) => setSecuritySettings(prev => ({
                      ...prev,
                      passwordPolicy: { ...prev.passwordPolicy, requireSpecialChars: checked }
                    }))}
                  />
                  <label className="text-sm">
                    {lang === 'ar' ? 'رموز خاصة' : 'Special Chars'}
                  </label>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Session Management */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 rtl:space-x-reverse">
                <ClockIcon className="h-5 w-5" />
                <span>{t.sessionManagement}</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    {lang === 'ar' ? 'انتهاء الجلسة (ثواني)' : 'Session Timeout (seconds)'}
                  </label>
                  <Input
                    type="number"
                    value={securitySettings.sessionManagement.sessionTimeout}
                    onChange={(e) => setSecuritySettings(prev => ({
                      ...prev,
                      sessionManagement: { ...prev.sessionManagement, sessionTimeout: parseInt(e.target.value) }
                    }))}
                    min="300"
                    max="86400"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    {lang === 'ar' ? 'الحد الأقصى للجلسات المتزامنة' : 'Max Concurrent Sessions'}
                  </label>
                  <Input
                    type="number"
                    value={securitySettings.sessionManagement.maxConcurrentSessions}
                    onChange={(e) => setSecuritySettings(prev => ({
                      ...prev,
                      sessionManagement: { ...prev.sessionManagement, maxConcurrentSessions: parseInt(e.target.value) }
                    }))}
                    min="1"
                    max="10"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2 rtl:space-x-reverse">
                <Switch
                  checked={securitySettings.sessionManagement.requireReauth}
                  onCheckedChange={(checked) => setSecuritySettings(prev => ({
                    ...prev,
                    sessionManagement: { ...prev.sessionManagement, requireReauth: checked }
                  }))}
                />
                <label className="text-sm">
                  {lang === 'ar' ? 'طلب إعادة المصادقة للعمليات الحساسة' : 'Require re-authentication for sensitive operations'}
                </label>
              </div>
            </CardContent>
          </Card>

          {/* Access Control */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 rtl:space-x-reverse">
                <UserGroupIcon className="h-5 w-5" />
                <span>{t.accessControl}</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    {lang === 'ar' ? 'الحد الأقصى لمحاولات تسجيل الدخول' : 'Max Login Attempts'}
                  </label>
                  <Input
                    type="number"
                    value={securitySettings.accessControl.maxLoginAttempts}
                    onChange={(e) => setSecuritySettings(prev => ({
                      ...prev,
                      accessControl: { ...prev.accessControl, maxLoginAttempts: parseInt(e.target.value) }
                    }))}
                    min="3"
                    max="10"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    {lang === 'ar' ? 'مدة الحظر (ثواني)' : 'Lockout Duration (seconds)'}
                  </label>
                  <Input
                    type="number"
                    value={securitySettings.accessControl.lockoutDuration}
                    onChange={(e) => setSecuritySettings(prev => ({
                      ...prev,
                      accessControl: { ...prev.accessControl, lockoutDuration: parseInt(e.target.value) }
                    }))}
                    min="300"
                    max="3600"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2 rtl:space-x-reverse">
                <Switch
                  checked={securitySettings.accessControl.twoFactorRequired}
                  onCheckedChange={(checked) => setSecuritySettings(prev => ({
                    ...prev,
                    accessControl: { ...prev.accessControl, twoFactorRequired: checked }
                  }))}
                />
                <label className="text-sm">
                  {lang === 'ar' ? 'طلب المصادقة الثنائية' : 'Require Two-Factor Authentication'}
                </label>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Database Settings Tab */}
        <TabsContent value="database" className="space-y-6">
          {/* Backup Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 rtl:space-x-reverse">
                <DatabaseIcon className="h-5 w-5" />
                <span>{t.backupSettings}</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2 rtl:space-x-reverse mb-4">
                <Switch
                  checked={databaseSettings.backup.autoBackup}
                  onCheckedChange={(checked) => setDatabaseSettings(prev => ({
                    ...prev,
                    backup: { ...prev.backup, autoBackup: checked }
                  }))}
                />
                <label className="text-sm font-medium">
                  {lang === 'ar' ? 'تفعيل النسخ الاحتياطي التلقائي' : 'Enable Automatic Backup'}
                </label>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    {lang === 'ar' ? 'فترة النسخ الاحتياطي (ساعات)' : 'Backup Interval (hours)'}
                  </label>
                  <Input
                    type="number"
                    value={databaseSettings.backup.backupInterval}
                    onChange={(e) => setDatabaseSettings(prev => ({
                      ...prev,
                      backup: { ...prev.backup, backupInterval: parseInt(e.target.value) }
                    }))}
                    min="1"
                    max="168"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    {lang === 'ar' ? 'الحد الأقصى للنسخ الاحتياطية' : 'Max Backups'}
                  </label>
                  <Input
                    type="number"
                    value={databaseSettings.backup.maxBackups}
                    onChange={(e) => setDatabaseSettings(prev => ({
                      ...prev,
                      backup: { ...prev.backup, maxBackups: parseInt(e.target.value) }
                    }))}
                    min="5"
                    max="100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    {lang === 'ar' ? 'مجلد النسخ الاحتياطي' : 'Backup Location'}
                  </label>
                  <Input
                    value={databaseSettings.backup.backupLocation}
                    onChange={(e) => setDatabaseSettings(prev => ({
                      ...prev,
                      backup: { ...prev.backup, backupLocation: e.target.value }
                    }))}
                    placeholder="/backups"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Performance Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 rtl:space-x-reverse">
                <ServerIcon className="h-5 w-5" />
                <span>{t.performanceSettings}</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2 rtl:space-x-reverse mb-4">
                <Switch
                  checked={databaseSettings.performance.cacheEnabled}
                  onCheckedChange={(checked) => setDatabaseSettings(prev => ({
                    ...prev,
                    performance: { ...prev.performance, cacheEnabled: checked }
                  }))}
                />
                <label className="text-sm font-medium">
                  {lang === 'ar' ? 'تفعيل التخزين المؤقت' : 'Enable Database Cache'}
                </label>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    {lang === 'ar' ? 'حجم التخزين المؤقت (MB)' : 'Cache Size (MB)'}
                  </label>
                  <Input
                    type="number"
                    value={databaseSettings.performance.cacheSize}
                    onChange={(e) => setDatabaseSettings(prev => ({
                      ...prev,
                      performance: { ...prev.performance, cacheSize: parseInt(e.target.value) }
                    }))}
                    min="64"
                    max="2048"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    {lang === 'ar' ? 'انتهاء وقت الاستعلام (ثواني)' : 'Query Timeout (seconds)'}
                  </label>
                  <Input
                    type="number"
                    value={databaseSettings.performance.queryTimeout}
                    onChange={(e) => setDatabaseSettings(prev => ({
                      ...prev,
                      performance: { ...prev.performance, queryTimeout: parseInt(e.target.value) }
                    }))}
                    min="10"
                    max="300"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    {lang === 'ar' ? 'حجم مجموعة الاتصالات' : 'Connection Pool Size'}
                  </label>
                  <Input
                    type="number"
                    value={databaseSettings.performance.connectionPoolSize}
                    onChange={(e) => setDatabaseSettings(prev => ({
                      ...prev,
                      performance: { ...prev.performance, connectionPoolSize: parseInt(e.target.value) }
                    }))}
                    min="5"
                    max="50"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications Settings Tab */}
        <TabsContent value="notifications" className="space-y-6">
          {/* Email Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 rtl:space-x-reverse">
                <MailIcon className="h-5 w-5" />
                <span>{t.emailSettings}</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2 rtl:space-x-reverse mb-4">
                <Switch
                  checked={notificationSettings.email.enabled}
                  onCheckedChange={(checked) => setNotificationSettings(prev => ({
                    ...prev,
                    email: { ...prev.email, enabled: checked }
                  }))}
                />
                <label className="text-sm font-medium">
                  {lang === 'ar' ? 'تفعيل إشعارات البريد الإلكتروني' : 'Enable Email Notifications'}
                </label>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    {lang === 'ar' ? 'خادم SMTP' : 'SMTP Server'}
                  </label>
                  <Input
                    value={notificationSettings.email.smtpServer}
                    onChange={(e) => setNotificationSettings(prev => ({
                      ...prev,
                      email: { ...prev.email, smtpServer: e.target.value }
                    }))}
                    placeholder="smtp.gmail.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    {lang === 'ar' ? 'منفذ SMTP' : 'SMTP Port'}
                  </label>
                  <Input
                    type="number"
                    value={notificationSettings.email.smtpPort}
                    onChange={(e) => setNotificationSettings(prev => ({
                      ...prev,
                      email: { ...prev.email, smtpPort: parseInt(e.target.value) }
                    }))}
                    placeholder="587"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    {lang === 'ar' ? 'اسم المستخدم' : 'Username'}
                  </label>
                  <Input
                    value={notificationSettings.email.username}
                    onChange={(e) => setNotificationSettings(prev => ({
                      ...prev,
                      email: { ...prev.email, username: e.target.value }
                    }))}
                    placeholder="aburakan4551@gmail.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    {lang === 'ar' ? 'عنوان المرسل' : 'From Address'}
                  </label>
                  <Input
                    value={notificationSettings.email.fromAddress}
                    onChange={(e) => setNotificationSettings(prev => ({
                      ...prev,
                      email: { ...prev.email, fromAddress: e.target.value }
                    }))}
                    placeholder="aburakan4551@gmail.com"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-medium">{lang === 'ar' ? 'قوالب الإشعارات' : 'Notification Templates'}</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="flex items-center space-x-2 rtl:space-x-reverse">
                    <Switch
                      checked={notificationSettings.email.templates.userRegistration}
                      onCheckedChange={(checked) => setNotificationSettings(prev => ({
                        ...prev,
                        email: {
                          ...prev.email,
                          templates: { ...prev.email.templates, userRegistration: checked }
                        }
                      }))}
                    />
                    <label className="text-sm">
                      {lang === 'ar' ? 'تسجيل المستخدمين' : 'User Registration'}
                    </label>
                  </div>
                  <div className="flex items-center space-x-2 rtl:space-x-reverse">
                    <Switch
                      checked={notificationSettings.email.templates.testCompletion}
                      onCheckedChange={(checked) => setNotificationSettings(prev => ({
                        ...prev,
                        email: {
                          ...prev.email,
                          templates: { ...prev.email.templates, testCompletion: checked }
                        }
                      }))}
                    />
                    <label className="text-sm">
                      {lang === 'ar' ? 'إكمال الاختبارات' : 'Test Completion'}
                    </label>
                  </div>
                  <div className="flex items-center space-x-2 rtl:space-x-reverse">
                    <Switch
                      checked={notificationSettings.email.templates.systemAlerts}
                      onCheckedChange={(checked) => setNotificationSettings(prev => ({
                        ...prev,
                        email: {
                          ...prev.email,
                          templates: { ...prev.email.templates, systemAlerts: checked }
                        }
                      }))}
                    />
                    <label className="text-sm">
                      {lang === 'ar' ? 'تنبيهات النظام' : 'System Alerts'}
                    </label>
                  </div>
                  <div className="flex items-center space-x-2 rtl:space-x-reverse">
                    <Switch
                      checked={notificationSettings.email.templates.adminNotifications}
                      onCheckedChange={(checked) => setNotificationSettings(prev => ({
                        ...prev,
                        email: {
                          ...prev.email,
                          templates: { ...prev.email.templates, adminNotifications: checked }
                        }
                      }))}
                    />
                    <label className="text-sm">
                      {lang === 'ar' ? 'إشعارات الإدارة' : 'Admin Notifications'}
                    </label>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Performance Settings Tab */}
        <TabsContent value="performance" className="space-y-6">
          {/* Caching Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 rtl:space-x-reverse">
                <ServerIcon className="h-5 w-5" />
                <span>{t.cachingSettings}</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2 rtl:space-x-reverse mb-4">
                <Switch
                  checked={performanceSettings.caching.enabled}
                  onCheckedChange={(checked) => setPerformanceSettings(prev => ({
                    ...prev,
                    caching: { ...prev.caching, enabled: checked }
                  }))}
                />
                <label className="text-sm font-medium">
                  {lang === 'ar' ? 'تفعيل التخزين المؤقت' : 'Enable Caching'}
                </label>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    {lang === 'ar' ? 'استراتيجية التخزين المؤقت' : 'Cache Strategy'}
                  </label>
                  <select
                    value={performanceSettings.caching.strategy}
                    onChange={(e) => setPerformanceSettings(prev => ({
                      ...prev,
                      caching: { ...prev.caching, strategy: e.target.value as 'memory' | 'redis' | 'file' }
                    }))}
                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800"
                  >
                    <option value="memory">{lang === 'ar' ? 'الذاكرة' : 'Memory'}</option>
                    <option value="redis">Redis</option>
                    <option value="file">{lang === 'ar' ? 'ملف' : 'File'}</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    {lang === 'ar' ? 'مدة البقاء (ثواني)' : 'TTL (seconds)'}
                  </label>
                  <Input
                    type="number"
                    value={performanceSettings.caching.ttl}
                    onChange={(e) => setPerformanceSettings(prev => ({
                      ...prev,
                      caching: { ...prev.caching, ttl: parseInt(e.target.value) }
                    }))}
                    min="60"
                    max="86400"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    {lang === 'ar' ? 'الحد الأقصى للحجم (MB)' : 'Max Size (MB)'}
                  </label>
                  <Input
                    type="number"
                    value={performanceSettings.caching.maxSize}
                    onChange={(e) => setPerformanceSettings(prev => ({
                      ...prev,
                      caching: { ...prev.caching, maxSize: parseInt(e.target.value) }
                    }))}
                    min="10"
                    max="1000"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Optimization Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 rtl:space-x-reverse">
                <CogIcon className="h-5 w-5" />
                <span>{t.optimizationSettings}</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="flex items-center space-x-2 rtl:space-x-reverse">
                  <Switch
                    checked={performanceSettings.optimization.imageCompression}
                    onCheckedChange={(checked) => setPerformanceSettings(prev => ({
                      ...prev,
                      optimization: { ...prev.optimization, imageCompression: checked }
                    }))}
                  />
                  <label className="text-sm">
                    {lang === 'ar' ? 'ضغط الصور' : 'Image Compression'}
                  </label>
                </div>
                <div className="flex items-center space-x-2 rtl:space-x-reverse">
                  <Switch
                    checked={performanceSettings.optimization.minifyAssets}
                    onCheckedChange={(checked) => setPerformanceSettings(prev => ({
                      ...prev,
                      optimization: { ...prev.optimization, minifyAssets: checked }
                    }))}
                  />
                  <label className="text-sm">
                    {lang === 'ar' ? 'تصغير الملفات' : 'Minify Assets'}
                  </label>
                </div>
                <div className="flex items-center space-x-2 rtl:space-x-reverse">
                  <Switch
                    checked={performanceSettings.optimization.gzipCompression}
                    onCheckedChange={(checked) => setPerformanceSettings(prev => ({
                      ...prev,
                      optimization: { ...prev.optimization, gzipCompression: checked }
                    }))}
                  />
                  <label className="text-sm">
                    {lang === 'ar' ? 'ضغط Gzip' : 'Gzip Compression'}
                  </label>
                </div>
                <div className="flex items-center space-x-2 rtl:space-x-reverse">
                  <Switch
                    checked={performanceSettings.optimization.cdnEnabled}
                    onCheckedChange={(checked) => setPerformanceSettings(prev => ({
                      ...prev,
                      optimization: { ...prev.optimization, cdnEnabled: checked }
                    }))}
                  />
                  <label className="text-sm">
                    {lang === 'ar' ? 'تفعيل CDN' : 'Enable CDN'}
                  </label>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Monitoring Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 rtl:space-x-reverse">
                <ChartBarIcon className="h-5 w-5" />
                <span>{t.monitoringSettings}</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2 rtl:space-x-reverse mb-4">
                <Switch
                  checked={performanceSettings.monitoring.enabled}
                  onCheckedChange={(checked) => setPerformanceSettings(prev => ({
                    ...prev,
                    monitoring: { ...prev.monitoring, enabled: checked }
                  }))}
                />
                <label className="text-sm font-medium">
                  {lang === 'ar' ? 'تفعيل مراقبة الأداء' : 'Enable Performance Monitoring'}
                </label>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    {lang === 'ar' ? 'فترة جمع المقاييس (ثواني)' : 'Metrics Interval (seconds)'}
                  </label>
                  <Input
                    type="number"
                    value={performanceSettings.monitoring.metricsInterval}
                    onChange={(e) => setPerformanceSettings(prev => ({
                      ...prev,
                      monitoring: { ...prev.monitoring, metricsInterval: parseInt(e.target.value) }
                    }))}
                    min="30"
                    max="300"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-medium">{lang === 'ar' ? 'عتبات التنبيه' : 'Alert Thresholds'}</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      {lang === 'ar' ? 'استخدام المعالج (%)' : 'CPU Usage (%)'}
                    </label>
                    <Input
                      type="number"
                      value={performanceSettings.monitoring.alertThresholds.cpuUsage}
                      onChange={(e) => setPerformanceSettings(prev => ({
                        ...prev,
                        monitoring: {
                          ...prev.monitoring,
                          alertThresholds: {
                            ...prev.monitoring.alertThresholds,
                            cpuUsage: parseInt(e.target.value)
                          }
                        }
                      }))}
                      min="50"
                      max="95"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      {lang === 'ar' ? 'استخدام الذاكرة (%)' : 'Memory Usage (%)'}
                    </label>
                    <Input
                      type="number"
                      value={performanceSettings.monitoring.alertThresholds.memoryUsage}
                      onChange={(e) => setPerformanceSettings(prev => ({
                        ...prev,
                        monitoring: {
                          ...prev.monitoring,
                          alertThresholds: {
                            ...prev.monitoring.alertThresholds,
                            memoryUsage: parseInt(e.target.value)
                          }
                        }
                      }))}
                      min="60"
                      max="95"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      {lang === 'ar' ? 'وقت الاستجابة (ms)' : 'Response Time (ms)'}
                    </label>
                    <Input
                      type="number"
                      value={performanceSettings.monitoring.alertThresholds.responseTime}
                      onChange={(e) => setPerformanceSettings(prev => ({
                        ...prev,
                        monitoring: {
                          ...prev.monitoring,
                          alertThresholds: {
                            ...prev.monitoring.alertThresholds,
                            responseTime: parseInt(e.target.value)
                          }
                        }
                      }))}
                      min="500"
                      max="5000"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      {lang === 'ar' ? 'معدل الأخطاء (%)' : 'Error Rate (%)'}
                    </label>
                    <Input
                      type="number"
                      value={performanceSettings.monitoring.alertThresholds.errorRate}
                      onChange={(e) => setPerformanceSettings(prev => ({
                        ...prev,
                        monitoring: {
                          ...prev.monitoring,
                          alertThresholds: {
                            ...prev.monitoring.alertThresholds,
                            errorRate: parseInt(e.target.value)
                          }
                        }
                      }))}
                      min="1"
                      max="20"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Save Button */}
        <div className="flex justify-end">
          <Button
            onClick={saveSettings}
            disabled={saving}
            className="min-w-32"
          >
            {saving ? t.saving : t.save}
          </Button>
        </div>
      </Tabs>
      </div>
    </AdminErrorBoundary>
  );
}
