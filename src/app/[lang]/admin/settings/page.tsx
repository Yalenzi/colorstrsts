'use client';

import { useState } from 'react';
import { Language } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  ShieldCheckIcon,
  CircleStackIcon as DatabaseIcon,
  BellIcon,
  ChartBarIcon,
  CogIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

interface AdminSettingsPageProps {
  params: {
    lang: Language;
  };
}

export default function AdminSettingsPage({ params }: AdminSettingsPageProps) {
  const { lang } = params;
  const [loading, setLoading] = useState(false);

  // Security Settings State
  const [securitySettings, setSecuritySettings] = useState({
    twoFactorAuth: false,
    sessionTimeout: 30,
    maxLoginAttempts: 5,
    passwordComplexity: true,
    ipWhitelist: '',
    auditLogging: true,
    encryptionLevel: 'AES-256',
    backupFrequency: 'daily'
  });

  // Database Settings State
  const [databaseSettings, setDatabaseSettings] = useState({
    autoBackup: true,
    backupRetention: 30,
    compressionEnabled: true,
    indexOptimization: true,
    connectionPoolSize: 10,
    queryTimeout: 30,
    maintenanceWindow: '02:00',
    replicationEnabled: false
  });

  // Notification Settings State
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    smsNotifications: false,
    pushNotifications: true,
    adminAlerts: true,
    userRegistration: true,
    systemErrors: true,
    performanceAlerts: true,
    securityAlerts: true,
    emailServer: 'smtp.gmail.com',
    emailPort: 587,
    emailUsername: '',
    emailPassword: ''
  });

  // Performance Settings State
  const [performanceSettings, setPerformanceSettings] = useState({
    cacheEnabled: true,
    cacheTimeout: 3600,
    compressionEnabled: true,
    cdnEnabled: false,
    imageOptimization: true,
    lazyLoading: true,
    minification: true,
    gzipCompression: true,
    maxConcurrentUsers: 1000,
    rateLimiting: true,
    rateLimitRequests: 100,
    rateLimitWindow: 60
  });

  const handleSaveSettings = async (settingsType: string, settings: any) => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      console.log(`Saving ${settingsType} settings:`, settings);
      
      toast.success(
        lang === 'ar' 
          ? `تم حفظ إعدادات ${settingsType} بنجاح`
          : `${settingsType} settings saved successfully`
      );
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error(
        lang === 'ar' 
          ? 'فشل في حفظ الإعدادات'
          : 'Failed to save settings'
      );
    } finally {
      setLoading(false);
    }
  };

  const resetToDefaults = (settingsType: string) => {
    if (confirm(lang === 'ar' ? 'هل تريد إعادة تعيين الإعدادات للقيم الافتراضية؟' : 'Reset settings to default values?')) {
      switch (settingsType) {
        case 'security':
          setSecuritySettings({
            twoFactorAuth: false,
            sessionTimeout: 30,
            maxLoginAttempts: 5,
            passwordComplexity: true,
            ipWhitelist: '',
            auditLogging: true,
            encryptionLevel: 'AES-256',
            backupFrequency: 'daily'
          });
          break;
        case 'database':
          setDatabaseSettings({
            autoBackup: true,
            backupRetention: 30,
            compressionEnabled: true,
            indexOptimization: true,
            connectionPoolSize: 10,
            queryTimeout: 30,
            maintenanceWindow: '02:00',
            replicationEnabled: false
          });
          break;
        case 'notifications':
          setNotificationSettings({
            emailNotifications: true,
            smsNotifications: false,
            pushNotifications: true,
            adminAlerts: true,
            userRegistration: true,
            systemErrors: true,
            performanceAlerts: true,
            securityAlerts: true,
            emailServer: 'smtp.gmail.com',
            emailPort: 587,
            emailUsername: '',
            emailPassword: ''
          });
          break;
        case 'performance':
          setPerformanceSettings({
            cacheEnabled: true,
            cacheTimeout: 3600,
            compressionEnabled: true,
            cdnEnabled: false,
            imageOptimization: true,
            lazyLoading: true,
            minification: true,
            gzipCompression: true,
            maxConcurrentUsers: 1000,
            rateLimiting: true,
            rateLimitRequests: 100,
            rateLimitWindow: 60
          });
          break;
      }
      toast.success(
        lang === 'ar' 
          ? 'تم إعادة تعيين الإعدادات'
          : 'Settings reset to defaults'
      );
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="space-y-6">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            {lang === 'ar' ? 'إعدادات النظام المتقدمة' : 'Advanced System Settings'}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {lang === 'ar' 
              ? 'إدارة جميع إعدادات النظام والأمان وقاعدة البيانات'
              : 'Manage all system, security, database, and performance settings'
            }
          </p>
        </div>

        {/* Settings Tabs */}
        <Tabs defaultValue="security" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="security" className="flex items-center space-x-2">
              <ShieldCheckIcon className="h-4 w-4" />
              <span>{lang === 'ar' ? 'الأمان' : 'Security'}</span>
            </TabsTrigger>
            <TabsTrigger value="database" className="flex items-center space-x-2">
              <DatabaseIcon className="h-4 w-4" />
              <span>{lang === 'ar' ? 'قاعدة البيانات' : 'Database'}</span>
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center space-x-2">
              <BellIcon className="h-4 w-4" />
              <span>{lang === 'ar' ? 'الإشعارات' : 'Notifications'}</span>
            </TabsTrigger>
            <TabsTrigger value="performance" className="flex items-center space-x-2">
              <ChartBarIcon className="h-4 w-4" />
              <span>{lang === 'ar' ? 'الأداء' : 'Performance'}</span>
            </TabsTrigger>
          </TabsList>

          {/* Security Settings */}
          <TabsContent value="security" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <ShieldCheckIcon className="h-5 w-5 text-green-600" />
                  <span>{lang === 'ar' ? 'إعدادات الأمان' : 'Security Settings'}</span>
                  <Badge variant="secondary">
                    {lang === 'ar' ? 'متقدم' : 'Advanced'}
                  </Badge>
                </CardTitle>
                <CardDescription>
                  {lang === 'ar' 
                    ? 'إدارة إعدادات الأمان والحماية للنظام'
                    : 'Manage system security and protection settings'
                  }
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Two-Factor Authentication */}
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">
                      {lang === 'ar' ? 'المصادقة الثنائية' : 'Two-Factor Authentication'}
                    </Label>
                    <p className="text-sm text-gray-500">
                      {lang === 'ar' 
                        ? 'تفعيل المصادقة الثنائية لحماية إضافية'
                        : 'Enable two-factor authentication for extra security'
                      }
                    </p>
                  </div>
                  <Switch
                    checked={securitySettings.twoFactorAuth}
                    onCheckedChange={(checked) => 
                      setSecuritySettings(prev => ({ ...prev, twoFactorAuth: checked }))
                    }
                  />
                </div>

                {/* Session Timeout */}
                <div className="space-y-2">
                  <Label htmlFor="sessionTimeout">
                    {lang === 'ar' ? 'انتهاء صلاحية الجلسة (دقيقة)' : 'Session Timeout (minutes)'}
                  </Label>
                  <Input
                    id="sessionTimeout"
                    type="number"
                    value={securitySettings.sessionTimeout}
                    onChange={(e) => 
                      setSecuritySettings(prev => ({ ...prev, sessionTimeout: parseInt(e.target.value) }))
                    }
                    className="max-w-xs"
                  />
                </div>

                {/* Max Login Attempts */}
                <div className="space-y-2">
                  <Label htmlFor="maxLoginAttempts">
                    {lang === 'ar' ? 'الحد الأقصى لمحاولات تسجيل الدخول' : 'Max Login Attempts'}
                  </Label>
                  <Input
                    id="maxLoginAttempts"
                    type="number"
                    value={securitySettings.maxLoginAttempts}
                    onChange={(e) => 
                      setSecuritySettings(prev => ({ ...prev, maxLoginAttempts: parseInt(e.target.value) }))
                    }
                    className="max-w-xs"
                  />
                </div>

                {/* IP Whitelist */}
                <div className="space-y-2">
                  <Label htmlFor="ipWhitelist">
                    {lang === 'ar' ? 'قائمة IP المسموحة' : 'IP Whitelist'}
                  </Label>
                  <Textarea
                    id="ipWhitelist"
                    placeholder={lang === 'ar' ? 'أدخل عناوين IP مفصولة بفواصل' : 'Enter IP addresses separated by commas'}
                    value={securitySettings.ipWhitelist}
                    onChange={(e) => 
                      setSecuritySettings(prev => ({ ...prev, ipWhitelist: e.target.value }))
                    }
                    className="max-w-md"
                  />
                </div>

                {/* Encryption Level */}
                <div className="space-y-2">
                  <Label htmlFor="encryptionLevel">
                    {lang === 'ar' ? 'مستوى التشفير' : 'Encryption Level'}
                  </Label>
                  <select
                    id="encryptionLevel"
                    value={securitySettings.encryptionLevel}
                    onChange={(e) => 
                      setSecuritySettings(prev => ({ ...prev, encryptionLevel: e.target.value }))
                    }
                    className="max-w-xs px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="AES-128">AES-128</option>
                    <option value="AES-256">AES-256</option>
                    <option value="RSA-2048">RSA-2048</option>
                    <option value="RSA-4096">RSA-4096</option>
                  </select>
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-4 pt-4">
                  <Button 
                    onClick={() => handleSaveSettings('Security', securitySettings)}
                    disabled={loading}
                  >
                    <CheckCircleIcon className="h-4 w-4 mr-2" />
                    {loading ? (lang === 'ar' ? 'جاري الحفظ...' : 'Saving...') : (lang === 'ar' ? 'حفظ الإعدادات' : 'Save Settings')}
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => resetToDefaults('security')}
                  >
                    {lang === 'ar' ? 'إعادة تعيين' : 'Reset to Defaults'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Database Settings */}
          <TabsContent value="database" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <DatabaseIcon className="h-5 w-5 text-blue-600" />
                  <span>{lang === 'ar' ? 'إعدادات قاعدة البيانات' : 'Database Settings'}</span>
                  <Badge variant="secondary">
                    {lang === 'ar' ? 'متقدم' : 'Advanced'}
                  </Badge>
                </CardTitle>
                <CardDescription>
                  {lang === 'ar' 
                    ? 'إدارة إعدادات قاعدة البيانات والنسخ الاحتياطي'
                    : 'Manage database and backup settings'
                  }
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Auto Backup */}
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">
                      {lang === 'ar' ? 'النسخ الاحتياطي التلقائي' : 'Auto Backup'}
                    </Label>
                    <p className="text-sm text-gray-500">
                      {lang === 'ar' 
                        ? 'تفعيل النسخ الاحتياطي التلقائي لقاعدة البيانات'
                        : 'Enable automatic database backups'
                      }
                    </p>
                  </div>
                  <Switch
                    checked={databaseSettings.autoBackup}
                    onCheckedChange={(checked) => 
                      setDatabaseSettings(prev => ({ ...prev, autoBackup: checked }))
                    }
                  />
                </div>

                {/* Backup Retention */}
                <div className="space-y-2">
                  <Label htmlFor="backupRetention">
                    {lang === 'ar' ? 'مدة الاحتفاظ بالنسخ الاحتياطية (أيام)' : 'Backup Retention (days)'}
                  </Label>
                  <Input
                    id="backupRetention"
                    type="number"
                    value={databaseSettings.backupRetention}
                    onChange={(e) => 
                      setDatabaseSettings(prev => ({ ...prev, backupRetention: parseInt(e.target.value) }))
                    }
                    className="max-w-xs"
                  />
                </div>

                {/* Connection Pool Size */}
                <div className="space-y-2">
                  <Label htmlFor="connectionPoolSize">
                    {lang === 'ar' ? 'حجم مجموعة الاتصالات' : 'Connection Pool Size'}
                  </Label>
                  <Input
                    id="connectionPoolSize"
                    type="number"
                    value={databaseSettings.connectionPoolSize}
                    onChange={(e) => 
                      setDatabaseSettings(prev => ({ ...prev, connectionPoolSize: parseInt(e.target.value) }))
                    }
                    className="max-w-xs"
                  />
                </div>

                {/* Maintenance Window */}
                <div className="space-y-2">
                  <Label htmlFor="maintenanceWindow">
                    {lang === 'ar' ? 'نافذة الصيانة' : 'Maintenance Window'}
                  </Label>
                  <Input
                    id="maintenanceWindow"
                    type="time"
                    value={databaseSettings.maintenanceWindow}
                    onChange={(e) => 
                      setDatabaseSettings(prev => ({ ...prev, maintenanceWindow: e.target.value }))
                    }
                    className="max-w-xs"
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-4 pt-4">
                  <Button 
                    onClick={() => handleSaveSettings('Database', databaseSettings)}
                    disabled={loading}
                  >
                    <CheckCircleIcon className="h-4 w-4 mr-2" />
                    {loading ? (lang === 'ar' ? 'جاري الحفظ...' : 'Saving...') : (lang === 'ar' ? 'حفظ الإعدادات' : 'Save Settings')}
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => resetToDefaults('database')}
                  >
                    {lang === 'ar' ? 'إعادة تعيين' : 'Reset to Defaults'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notifications Settings */}
          <TabsContent value="notifications" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <BellIcon className="h-5 w-5 text-yellow-600" />
                  <span>{lang === 'ar' ? 'إعدادات الإشعارات' : 'Notification Settings'}</span>
                  <Badge variant="secondary">
                    {lang === 'ar' ? 'متقدم' : 'Advanced'}
                  </Badge>
                </CardTitle>
                <CardDescription>
                  {lang === 'ar'
                    ? 'إدارة إعدادات الإشعارات والتنبيهات'
                    : 'Manage notification and alert settings'
                  }
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Email Notifications */}
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">
                      {lang === 'ar' ? 'إشعارات البريد الإلكتروني' : 'Email Notifications'}
                    </Label>
                    <p className="text-sm text-gray-500">
                      {lang === 'ar'
                        ? 'تفعيل إشعارات البريد الإلكتروني'
                        : 'Enable email notifications'
                      }
                    </p>
                  </div>
                  <Switch
                    checked={notificationSettings.emailNotifications}
                    onCheckedChange={(checked) =>
                      setNotificationSettings(prev => ({ ...prev, emailNotifications: checked }))
                    }
                  />
                </div>

                {/* Admin Alerts */}
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">
                      {lang === 'ar' ? 'تنبيهات المدير' : 'Admin Alerts'}
                    </Label>
                    <p className="text-sm text-gray-500">
                      {lang === 'ar'
                        ? 'تفعيل التنبيهات الخاصة بالمدير'
                        : 'Enable admin-specific alerts'
                      }
                    </p>
                  </div>
                  <Switch
                    checked={notificationSettings.adminAlerts}
                    onCheckedChange={(checked) =>
                      setNotificationSettings(prev => ({ ...prev, adminAlerts: checked }))
                    }
                  />
                </div>

                {/* Email Server Settings */}
                <div className="space-y-4 border-t pt-4">
                  <h4 className="font-medium text-gray-900 dark:text-white">
                    {lang === 'ar' ? 'إعدادات خادم البريد الإلكتروني' : 'Email Server Settings'}
                  </h4>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="emailServer">
                        {lang === 'ar' ? 'خادم SMTP' : 'SMTP Server'}
                      </Label>
                      <Input
                        id="emailServer"
                        value={notificationSettings.emailServer}
                        onChange={(e) =>
                          setNotificationSettings(prev => ({ ...prev, emailServer: e.target.value }))
                        }
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="emailPort">
                        {lang === 'ar' ? 'منفذ SMTP' : 'SMTP Port'}
                      </Label>
                      <Input
                        id="emailPort"
                        type="number"
                        value={notificationSettings.emailPort}
                        onChange={(e) =>
                          setNotificationSettings(prev => ({ ...prev, emailPort: parseInt(e.target.value) }))
                        }
                      />
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-4 pt-4">
                  <Button
                    onClick={() => handleSaveSettings('Notifications', notificationSettings)}
                    disabled={loading}
                  >
                    <CheckCircleIcon className="h-4 w-4 mr-2" />
                    {loading ? (lang === 'ar' ? 'جاري الحفظ...' : 'Saving...') : (lang === 'ar' ? 'حفظ الإعدادات' : 'Save Settings')}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => resetToDefaults('notifications')}
                  >
                    {lang === 'ar' ? 'إعادة تعيين' : 'Reset to Defaults'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Performance Settings */}
          <TabsContent value="performance" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <ChartBarIcon className="h-5 w-5 text-purple-600" />
                  <span>{lang === 'ar' ? 'إعدادات الأداء' : 'Performance Settings'}</span>
                  <Badge variant="secondary">
                    {lang === 'ar' ? 'متقدم' : 'Advanced'}
                  </Badge>
                </CardTitle>
                <CardDescription>
                  {lang === 'ar'
                    ? 'إدارة إعدادات الأداء والتحسين'
                    : 'Manage performance and optimization settings'
                  }
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Cache Settings */}
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">
                      {lang === 'ar' ? 'تفعيل التخزين المؤقت' : 'Enable Caching'}
                    </Label>
                    <p className="text-sm text-gray-500">
                      {lang === 'ar'
                        ? 'تفعيل التخزين المؤقت لتحسين الأداء'
                        : 'Enable caching for better performance'
                      }
                    </p>
                  </div>
                  <Switch
                    checked={performanceSettings.cacheEnabled}
                    onCheckedChange={(checked) =>
                      setPerformanceSettings(prev => ({ ...prev, cacheEnabled: checked }))
                    }
                  />
                </div>

                {/* Cache Timeout */}
                <div className="space-y-2">
                  <Label htmlFor="cacheTimeout">
                    {lang === 'ar' ? 'مهلة التخزين المؤقت (ثانية)' : 'Cache Timeout (seconds)'}
                  </Label>
                  <Input
                    id="cacheTimeout"
                    type="number"
                    value={performanceSettings.cacheTimeout}
                    onChange={(e) =>
                      setPerformanceSettings(prev => ({ ...prev, cacheTimeout: parseInt(e.target.value) }))
                    }
                    className="max-w-xs"
                  />
                </div>

                {/* Max Concurrent Users */}
                <div className="space-y-2">
                  <Label htmlFor="maxConcurrentUsers">
                    {lang === 'ar' ? 'الحد الأقصى للمستخدمين المتزامنين' : 'Max Concurrent Users'}
                  </Label>
                  <Input
                    id="maxConcurrentUsers"
                    type="number"
                    value={performanceSettings.maxConcurrentUsers}
                    onChange={(e) =>
                      setPerformanceSettings(prev => ({ ...prev, maxConcurrentUsers: parseInt(e.target.value) }))
                    }
                    className="max-w-xs"
                  />
                </div>

                {/* Rate Limiting */}
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">
                      {lang === 'ar' ? 'تحديد معدل الطلبات' : 'Rate Limiting'}
                    </Label>
                    <p className="text-sm text-gray-500">
                      {lang === 'ar'
                        ? 'تفعيل تحديد معدل الطلبات لمنع الإفراط'
                        : 'Enable rate limiting to prevent abuse'
                      }
                    </p>
                  </div>
                  <Switch
                    checked={performanceSettings.rateLimiting}
                    onCheckedChange={(checked) =>
                      setPerformanceSettings(prev => ({ ...prev, rateLimiting: checked }))
                    }
                  />
                </div>

                {/* Optimization Features */}
                <div className="space-y-4 border-t pt-4">
                  <h4 className="font-medium text-gray-900 dark:text-white">
                    {lang === 'ar' ? 'ميزات التحسين' : 'Optimization Features'}
                  </h4>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm">
                        {lang === 'ar' ? 'ضغط الصور' : 'Image Optimization'}
                      </Label>
                      <Switch
                        checked={performanceSettings.imageOptimization}
                        onCheckedChange={(checked) =>
                          setPerformanceSettings(prev => ({ ...prev, imageOptimization: checked }))
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <Label className="text-sm">
                        {lang === 'ar' ? 'التحميل التدريجي' : 'Lazy Loading'}
                      </Label>
                      <Switch
                        checked={performanceSettings.lazyLoading}
                        onCheckedChange={(checked) =>
                          setPerformanceSettings(prev => ({ ...prev, lazyLoading: checked }))
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <Label className="text-sm">
                        {lang === 'ar' ? 'ضغط GZIP' : 'GZIP Compression'}
                      </Label>
                      <Switch
                        checked={performanceSettings.gzipCompression}
                        onCheckedChange={(checked) =>
                          setPerformanceSettings(prev => ({ ...prev, gzipCompression: checked }))
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <Label className="text-sm">
                        {lang === 'ar' ? 'تصغير الملفات' : 'Minification'}
                      </Label>
                      <Switch
                        checked={performanceSettings.minification}
                        onCheckedChange={(checked) =>
                          setPerformanceSettings(prev => ({ ...prev, minification: checked }))
                        }
                      />
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-4 pt-4">
                  <Button
                    onClick={() => handleSaveSettings('Performance', performanceSettings)}
                    disabled={loading}
                  >
                    <CheckCircleIcon className="h-4 w-4 mr-2" />
                    {loading ? (lang === 'ar' ? 'جاري الحفظ...' : 'Saving...') : (lang === 'ar' ? 'حفظ الإعدادات' : 'Save Settings')}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => resetToDefaults('performance')}
                  >
                    {lang === 'ar' ? 'إعادة تعيين' : 'Reset to Defaults'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* System Status */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <InformationCircleIcon className="h-5 w-5 text-blue-600" />
              <span>{lang === 'ar' ? 'حالة النظام' : 'System Status'}</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center space-x-2">
                <CheckCircleIcon className="h-5 w-5 text-green-600" />
                <span className="text-sm">
                  {lang === 'ar' ? 'النظام يعمل بشكل طبيعي' : 'System running normally'}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircleIcon className="h-5 w-5 text-green-600" />
                <span className="text-sm">
                  {lang === 'ar' ? 'قاعدة البيانات متصلة' : 'Database connected'}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircleIcon className="h-5 w-5 text-green-600" />
                <span className="text-sm">
                  {lang === 'ar' ? 'جميع الخدمات تعمل' : 'All services operational'}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
