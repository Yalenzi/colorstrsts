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
import { db } from '@/lib/firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import toast from 'react-hot-toast';
import {
  CpuChipIcon,
  CloudIcon,
  PhotoIcon,
  ChartBarIcon,
  ServerIcon,
  ClockIcon,
  ArrowPathIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';

interface PerformanceSettings {
  // Cache Settings
  cacheEnabled: boolean;
  cacheDuration: number; // in seconds
  cacheSize: number; // in MB
  cacheType: 'memory' | 'disk' | 'hybrid';
  
  // Database Optimization
  queryOptimization: boolean;
  indexOptimization: boolean;
  connectionPoolSize: number;
  queryTimeout: number;
  
  // Image Optimization
  imageCompression: boolean;
  imageQuality: number; // 1-100
  imageResize: boolean;
  maxImageSize: number; // in MB
  supportedFormats: string[];
  
  // CDN Configuration
  cdnEnabled: boolean;
  cdnProvider: 'cloudflare' | 'aws' | 'custom';
  cdnUrl: string;
  cdnCacheControl: string;
  
  // Performance Monitoring
  monitoringEnabled: boolean;
  performanceThreshold: number; // in ms
  alertsEnabled: boolean;
  reportingInterval: number; // in minutes
  
  // Resource Limits
  maxConcurrentUsers: number;
  maxRequestsPerMinute: number;
  maxFileUploads: number;
  memoryLimit: number; // in MB
}

interface PerformanceSettingsProps {
  lang: Language;
}

export function PerformanceSettings({ lang }: PerformanceSettingsProps) {
  const [settings, setSettings] = useState<PerformanceSettings>({
    cacheEnabled: true,
    cacheDuration: 3600,
    cacheSize: 100,
    cacheType: 'hybrid',
    queryOptimization: true,
    indexOptimization: true,
    connectionPoolSize: 10,
    queryTimeout: 30,
    imageCompression: true,
    imageQuality: 80,
    imageResize: true,
    maxImageSize: 5,
    supportedFormats: ['jpg', 'png', 'webp'],
    cdnEnabled: false,
    cdnProvider: 'cloudflare',
    cdnUrl: '',
    cdnCacheControl: 'public, max-age=31536000',
    monitoringEnabled: true,
    performanceThreshold: 2000,
    alertsEnabled: true,
    reportingInterval: 15,
    maxConcurrentUsers: 1000,
    maxRequestsPerMinute: 100,
    maxFileUploads: 10,
    memoryLimit: 512
  });

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [performanceData, setPerformanceData] = useState({
    currentUsers: 45,
    avgResponseTime: 1200,
    cacheHitRate: 85,
    memoryUsage: 65
  });

  const isRTL = lang === 'ar';

  const texts = {
    title: isRTL ? 'إعدادات الأداء' : 'Performance Settings',
    subtitle: isRTL ? 'تحسين أداء النظام والموارد' : 'Optimize system performance and resources',
    
    // Cache Settings
    cacheSettings: isRTL ? 'إعدادات التخزين المؤقت' : 'Cache Settings',
    cacheEnabled: isRTL ? 'تفعيل التخزين المؤقت' : 'Enable Cache',
    cacheDuration: isRTL ? 'مدة التخزين المؤقت (ثانية)' : 'Cache Duration (seconds)',
    cacheSize: isRTL ? 'حجم التخزين المؤقت (MB)' : 'Cache Size (MB)',
    cacheType: isRTL ? 'نوع التخزين المؤقت' : 'Cache Type',
    
    // Database Optimization
    databaseOptimization: isRTL ? 'تحسين قاعدة البيانات' : 'Database Optimization',
    queryOptimization: isRTL ? 'تحسين الاستعلامات' : 'Query Optimization',
    indexOptimization: isRTL ? 'تحسين الفهارس' : 'Index Optimization',
    connectionPoolSize: isRTL ? 'حجم مجموعة الاتصالات' : 'Connection Pool Size',
    queryTimeout: isRTL ? 'انتهاء وقت الاستعلام (ثانية)' : 'Query Timeout (seconds)',
    
    // Image Optimization
    imageOptimization: isRTL ? 'تحسين الصور' : 'Image Optimization',
    imageCompression: isRTL ? 'ضغط الصور' : 'Image Compression',
    imageQuality: isRTL ? 'جودة الصور (%)' : 'Image Quality (%)',
    imageResize: isRTL ? 'تغيير حجم الصور' : 'Image Resize',
    maxImageSize: isRTL ? 'الحد الأقصى لحجم الصورة (MB)' : 'Max Image Size (MB)',
    
    // CDN Configuration
    cdnConfiguration: isRTL ? 'إعدادات CDN' : 'CDN Configuration',
    cdnEnabled: isRTL ? 'تفعيل CDN' : 'Enable CDN',
    cdnProvider: isRTL ? 'مزود CDN' : 'CDN Provider',
    cdnUrl: isRTL ? 'رابط CDN' : 'CDN URL',
    
    // Performance Monitoring
    performanceMonitoring: isRTL ? 'مراقبة الأداء' : 'Performance Monitoring',
    monitoringEnabled: isRTL ? 'تفعيل المراقبة' : 'Enable Monitoring',
    performanceThreshold: isRTL ? 'حد الأداء (مللي ثانية)' : 'Performance Threshold (ms)',
    alertsEnabled: isRTL ? 'تفعيل التنبيهات' : 'Enable Alerts',
    
    // Resource Limits
    resourceLimits: isRTL ? 'حدود الموارد' : 'Resource Limits',
    maxConcurrentUsers: isRTL ? 'الحد الأقصى للمستخدمين المتزامنين' : 'Max Concurrent Users',
    maxRequestsPerMinute: isRTL ? 'الحد الأقصى للطلبات في الدقيقة' : 'Max Requests Per Minute',
    memoryLimit: isRTL ? 'حد الذاكرة (MB)' : 'Memory Limit (MB)',
    
    // Performance Stats
    currentUsers: isRTL ? 'المستخدمون الحاليون' : 'Current Users',
    avgResponseTime: isRTL ? 'متوسط وقت الاستجابة' : 'Avg Response Time',
    cacheHitRate: isRTL ? 'معدل إصابة التخزين المؤقت' : 'Cache Hit Rate',
    memoryUsage: isRTL ? 'استخدام الذاكرة' : 'Memory Usage',
    
    // Cache Types
    memory: isRTL ? 'ذاكرة' : 'Memory',
    disk: isRTL ? 'قرص' : 'Disk',
    hybrid: isRTL ? 'مختلط' : 'Hybrid',
    
    // CDN Providers
    cloudflare: 'Cloudflare',
    aws: 'AWS CloudFront',
    custom: isRTL ? 'مخصص' : 'Custom',
    
    // Actions
    save: isRTL ? 'حفظ' : 'Save',
    test: isRTL ? 'اختبار' : 'Test',
    optimize: isRTL ? 'تحسين' : 'Optimize',
    clearCache: isRTL ? 'مسح التخزين المؤقت' : 'Clear Cache',
    
    // Messages
    saving: isRTL ? 'جاري الحفظ...' : 'Saving...',
    saved: isRTL ? 'تم الحفظ بنجاح' : 'Settings saved successfully',
    error: isRTL ? 'حدث خطأ' : 'An error occurred',
    cacheCleared: isRTL ? 'تم مسح التخزين المؤقت' : 'Cache cleared successfully',
    
    // Descriptions
    cacheDesc: isRTL ? 'يحسن الأداء عبر تخزين البيانات مؤقتاً' : 'Improves performance by temporarily storing data',
    cdnDesc: isRTL ? 'يسرع تحميل المحتوى عبر الشبكة العالمية' : 'Speeds up content delivery through global network',
    monitoringDesc: isRTL ? 'يراقب أداء النظام ويرسل تنبيهات' : 'Monitors system performance and sends alerts',
  };

  useEffect(() => {
    loadSettings();
    // Simulate performance data updates
    const interval = setInterval(() => {
      setPerformanceData(prev => ({
        currentUsers: Math.floor(Math.random() * 100) + 20,
        avgResponseTime: Math.floor(Math.random() * 1000) + 800,
        cacheHitRate: Math.floor(Math.random() * 20) + 80,
        memoryUsage: Math.floor(Math.random() * 30) + 50
      }));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const settingsRef = doc(db, 'settings', 'performance');
      const settingsDoc = await getDoc(settingsRef);
      
      if (settingsDoc.exists()) {
        const data = settingsDoc.data();
        setSettings(prev => ({ ...prev, ...data }));
      }
    } catch (error) {
      console.error('Error loading performance settings:', error);
      toast.error(texts.error);
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    try {
      setSaving(true);
      const settingsRef = doc(db, 'settings', 'performance');
      
      await setDoc(settingsRef, {
        ...settings,
        updatedAt: new Date().toISOString(),
        createdAt: new Date().toISOString()
      }, { merge: true });
      
      toast.success(texts.saved);
    } catch (error) {
      console.error('Error saving performance settings:', error);
      toast.error(texts.error);
    } finally {
      setSaving(false);
    }
  };

  const clearCache = async () => {
    try {
      // Simulate cache clearing
      toast.success(texts.cacheCleared);
    } catch (error) {
      toast.error(texts.error);
    }
  };

  const getPerformanceColor = (value: number, threshold: number) => {
    if (value < threshold * 0.7) return 'text-green-600';
    if (value < threshold) return 'text-yellow-600';
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
          <Button variant="outline" onClick={clearCache}>
            <ArrowPathIcon className="h-4 w-4 mr-2 rtl:ml-2 rtl:mr-0" />
            {texts.clearCache}
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

      {/* Performance Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">{texts.currentUsers}</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{performanceData.currentUsers}</p>
              </div>
              <CpuChipIcon className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">{texts.avgResponseTime}</p>
                <p className={`text-2xl font-bold ${getPerformanceColor(performanceData.avgResponseTime, 2000)}`}>
                  {performanceData.avgResponseTime}ms
                </p>
              </div>
              <ClockIcon className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">{texts.cacheHitRate}</p>
                <p className="text-2xl font-bold text-green-600">{performanceData.cacheHitRate}%</p>
              </div>
              <ChartBarIcon className="h-8 w-8 text-purple-600" />
            </div>
            <Progress value={performanceData.cacheHitRate} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">{texts.memoryUsage}</p>
                <p className={`text-2xl font-bold ${getPerformanceColor(performanceData.memoryUsage, 80)}`}>
                  {performanceData.memoryUsage}%
                </p>
              </div>
              <ServerIcon className="h-8 w-8 text-orange-600" />
            </div>
            <Progress value={performanceData.memoryUsage} className="mt-2" />
          </CardContent>
        </Card>
      </div>

      {/* Cache Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 rtl:space-x-reverse">
            <ServerIcon className="h-5 w-5" />
            <span>{texts.cacheSettings}</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-base font-medium">{texts.cacheEnabled}</Label>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {texts.cacheDesc}
              </p>
            </div>
            <Switch
              checked={settings.cacheEnabled}
              onCheckedChange={(checked) =>
                setSettings(prev => ({ ...prev, cacheEnabled: checked }))
              }
            />
          </div>

          {settings.cacheEnabled && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="cacheDuration">{texts.cacheDuration}</Label>
                <Input
                  id="cacheDuration"
                  type="number"
                  value={settings.cacheDuration}
                  onChange={(e) => setSettings(prev => ({ 
                    ...prev, 
                    cacheDuration: parseInt(e.target.value) || 3600 
                  }))}
                />
              </div>
              <div>
                <Label htmlFor="cacheSize">{texts.cacheSize}</Label>
                <Input
                  id="cacheSize"
                  type="number"
                  value={settings.cacheSize}
                  onChange={(e) => setSettings(prev => ({ 
                    ...prev, 
                    cacheSize: parseInt(e.target.value) || 100 
                  }))}
                />
              </div>
              <div>
                <Label htmlFor="cacheType">{texts.cacheType}</Label>
                <Select
                  value={settings.cacheType}
                  onValueChange={(value: 'memory' | 'disk' | 'hybrid') =>
                    setSettings(prev => ({ ...prev, cacheType: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="memory">{texts.memory}</SelectItem>
                    <SelectItem value="disk">{texts.disk}</SelectItem>
                    <SelectItem value="hybrid">{texts.hybrid}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Image Optimization */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 rtl:space-x-reverse">
            <PhotoIcon className="h-5 w-5" />
            <span>{texts.imageOptimization}</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label className="text-base font-medium">{texts.imageCompression}</Label>
            <Switch
              checked={settings.imageCompression}
              onCheckedChange={(checked) =>
                setSettings(prev => ({ ...prev, imageCompression: checked }))
              }
            />
          </div>

          {settings.imageCompression && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="imageQuality">{texts.imageQuality}</Label>
                <Input
                  id="imageQuality"
                  type="number"
                  min="1"
                  max="100"
                  value={settings.imageQuality}
                  onChange={(e) => setSettings(prev => ({ 
                    ...prev, 
                    imageQuality: parseInt(e.target.value) || 80 
                  }))}
                />
              </div>
              <div>
                <Label htmlFor="maxImageSize">{texts.maxImageSize}</Label>
                <Input
                  id="maxImageSize"
                  type="number"
                  value={settings.maxImageSize}
                  onChange={(e) => setSettings(prev => ({ 
                    ...prev, 
                    maxImageSize: parseInt(e.target.value) || 5 
                  }))}
                />
              </div>
              <div className="flex items-center">
                <Label className="text-base font-medium">{texts.imageResize}</Label>
                <Switch
                  checked={settings.imageResize}
                  onCheckedChange={(checked) =>
                    setSettings(prev => ({ ...prev, imageResize: checked }))
                  }
                  className="ml-auto"
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* CDN Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 rtl:space-x-reverse">
            <CloudIcon className="h-5 w-5" />
            <span>{texts.cdnConfiguration}</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-base font-medium">{texts.cdnEnabled}</Label>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {texts.cdnDesc}
              </p>
            </div>
            <Switch
              checked={settings.cdnEnabled}
              onCheckedChange={(checked) =>
                setSettings(prev => ({ ...prev, cdnEnabled: checked }))
              }
            />
          </div>

          {settings.cdnEnabled && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="cdnProvider">{texts.cdnProvider}</Label>
                <Select
                  value={settings.cdnProvider}
                  onValueChange={(value: 'cloudflare' | 'aws' | 'custom') =>
                    setSettings(prev => ({ ...prev, cdnProvider: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cloudflare">{texts.cloudflare}</SelectItem>
                    <SelectItem value="aws">{texts.aws}</SelectItem>
                    <SelectItem value="custom">{texts.custom}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="cdnUrl">{texts.cdnUrl}</Label>
                <Input
                  id="cdnUrl"
                  value={settings.cdnUrl}
                  onChange={(e) => setSettings(prev => ({ ...prev, cdnUrl: e.target.value }))}
                  placeholder="https://cdn.example.com"
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
