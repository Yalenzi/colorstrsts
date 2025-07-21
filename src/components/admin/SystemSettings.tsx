'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { Settings, Save, RefreshCw, Shield, Globe, Bell } from 'lucide-react';

interface SystemSettings {
  siteName: string;
  siteNameAr: string;
  maintenanceMode: boolean;
  registrationEnabled: boolean;
  emailNotifications: boolean;
  maxTestsPerDay: number;
  sessionTimeout: number;
  defaultLanguage: 'ar' | 'en';
  enableAnalytics: boolean;
  backupFrequency: 'daily' | 'weekly' | 'monthly';
}

export function SystemSettings({ lang }: { lang: string }) {
  const isRTL = lang === 'ar';
  const [settings, setSettings] = useState<SystemSettings>({
    siteName: 'Color Testing System',
    siteNameAr: 'نظام اختبار الألوان',
    maintenanceMode: false,
    registrationEnabled: true,
    emailNotifications: true,
    maxTestsPerDay: 50,
    sessionTimeout: 30,
    defaultLanguage: 'en',
    enableAnalytics: true,
    backupFrequency: 'daily'
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setLoading(true);
    try {
      // محاكاة تحميل الإعدادات من قاعدة البيانات
      const savedSettings = localStorage.getItem('system_settings');
      if (savedSettings) {
        setSettings(JSON.parse(savedSettings));
      }
    } catch (error) {
      console.error('Error loading settings:', error);
      toast.error(isRTL ? 'خطأ في تحميل الإعدادات' : 'Error loading settings');
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    setSaving(true);
    try {
      // حفظ الإعدادات في localStorage (في التطبيق الحقيقي سيتم حفظها في قاعدة البيانات)
      localStorage.setItem('system_settings', JSON.stringify(settings));
      
      // محاكاة تأخير الشبكة
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success(isRTL ? 'تم حفظ الإعدادات بنجاح' : 'Settings saved successfully');
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error(isRTL ? 'خطأ في حفظ الإعدادات' : 'Error saving settings');
    } finally {
      setSaving(false);
    }
  };

  const resetSettings = () => {
    setSettings({
      siteName: 'Color Testing System',
      siteNameAr: 'نظام اختبار الألوان',
      maintenanceMode: false,
      registrationEnabled: true,
      emailNotifications: true,
      maxTestsPerDay: 50,
      sessionTimeout: 30,
      defaultLanguage: 'en',
      enableAnalytics: true,
      backupFrequency: 'daily'
    });
    toast.success(isRTL ? 'تم إعادة تعيين الإعدادات' : 'Settings reset to defaults');
  };

  const clearCache = async () => {
    try {
      // مسح cache المتصفح
      if ('caches' in window) {
        const cacheNames = await caches.keys();
        await Promise.all(
          cacheNames.map(cacheName => caches.delete(cacheName))
        );
      }
      
      // مسح localStorage المؤقت
      const keysToKeep = ['system_settings', 'user_profile', 'auth_token'];
      const allKeys = Object.keys(localStorage);
      allKeys.forEach(key => {
        if (!keysToKeep.includes(key)) {
          localStorage.removeItem(key);
        }
      });
      
      toast.success(isRTL ? 'تم مسح التخزين المؤقت' : 'Cache cleared successfully');
    } catch (error) {
      console.error('Error clearing cache:', error);
      toast.error(isRTL ? 'خطأ في مسح التخزين المؤقت' : 'Error clearing cache');
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-2">{isRTL ? 'جاري التحميل...' : 'Loading...'}</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            {isRTL ? 'إعدادات النظام' : 'System Settings'}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* إعدادات الموقع */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium flex items-center gap-2">
              <Globe className="w-5 h-5" />
              {isRTL ? 'إعدادات الموقع' : 'Site Settings'}
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="siteName">
                  {isRTL ? 'اسم الموقع (إنجليزي)' : 'Site Name (English)'}
                </Label>
                <Input
                  id="siteName"
                  value={settings.siteName}
                  onChange={(e) => setSettings(prev => ({ ...prev, siteName: e.target.value }))}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="siteNameAr">
                  {isRTL ? 'اسم الموقع (عربي)' : 'Site Name (Arabic)'}
                </Label>
                <Input
                  id="siteNameAr"
                  value={settings.siteNameAr}
                  onChange={(e) => setSettings(prev => ({ ...prev, siteNameAr: e.target.value }))}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="defaultLanguage">
                {isRTL ? 'اللغة الافتراضية' : 'Default Language'}
              </Label>
              <select
                id="defaultLanguage"
                value={settings.defaultLanguage}
                onChange={(e) => setSettings(prev => ({ ...prev, defaultLanguage: e.target.value as 'ar' | 'en' }))}
                className="w-full p-2 border border-gray-300 rounded-md"
              >
                <option value="en">{isRTL ? 'الإنجليزية' : 'English'}</option>
                <option value="ar">{isRTL ? 'العربية' : 'Arabic'}</option>
              </select>
            </div>
          </div>

          {/* إعدادات الأمان */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium flex items-center gap-2">
              <Shield className="w-5 h-5" />
              {isRTL ? 'إعدادات الأمان' : 'Security Settings'}
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="maxTestsPerDay">
                  {isRTL ? 'الحد الأقصى للاختبارات يومياً' : 'Max Tests Per Day'}
                </Label>
                <Input
                  id="maxTestsPerDay"
                  type="number"
                  value={settings.maxTestsPerDay}
                  onChange={(e) => setSettings(prev => ({ ...prev, maxTestsPerDay: parseInt(e.target.value) }))}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="sessionTimeout">
                  {isRTL ? 'انتهاء الجلسة (دقيقة)' : 'Session Timeout (minutes)'}
                </Label>
                <Input
                  id="sessionTimeout"
                  type="number"
                  value={settings.sessionTimeout}
                  onChange={(e) => setSettings(prev => ({ ...prev, sessionTimeout: parseInt(e.target.value) }))}
                />
              </div>
            </div>
          </div>

          {/* إعدادات النظام */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium flex items-center gap-2">
              <Bell className="w-5 h-5" />
              {isRTL ? 'إعدادات النظام' : 'System Settings'}
            </h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>{isRTL ? 'وضع الصيانة' : 'Maintenance Mode'}</Label>
                  <p className="text-sm text-gray-600">
                    {isRTL ? 'تعطيل الموقع مؤقتاً للصيانة' : 'Temporarily disable site for maintenance'}
                  </p>
                </div>
                <Switch
                  checked={settings.maintenanceMode}
                  onCheckedChange={(checked) => setSettings(prev => ({ ...prev, maintenanceMode: checked }))}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>{isRTL ? 'تفعيل التسجيل' : 'Registration Enabled'}</Label>
                  <p className="text-sm text-gray-600">
                    {isRTL ? 'السماح للمستخدمين الجدد بالتسجيل' : 'Allow new users to register'}
                  </p>
                </div>
                <Switch
                  checked={settings.registrationEnabled}
                  onCheckedChange={(checked) => setSettings(prev => ({ ...prev, registrationEnabled: checked }))}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>{isRTL ? 'إشعارات البريد الإلكتروني' : 'Email Notifications'}</Label>
                  <p className="text-sm text-gray-600">
                    {isRTL ? 'إرسال إشعارات عبر البريد الإلكتروني' : 'Send email notifications'}
                  </p>
                </div>
                <Switch
                  checked={settings.emailNotifications}
                  onCheckedChange={(checked) => setSettings(prev => ({ ...prev, emailNotifications: checked }))}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>{isRTL ? 'تفعيل التحليلات' : 'Enable Analytics'}</Label>
                  <p className="text-sm text-gray-600">
                    {isRTL ? 'جمع بيانات الاستخدام والتحليلات' : 'Collect usage data and analytics'}
                  </p>
                </div>
                <Switch
                  checked={settings.enableAnalytics}
                  onCheckedChange={(checked) => setSettings(prev => ({ ...prev, enableAnalytics: checked }))}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="backupFrequency">
                {isRTL ? 'تكرار النسخ الاحتياطي' : 'Backup Frequency'}
              </Label>
              <select
                id="backupFrequency"
                value={settings.backupFrequency}
                onChange={(e) => setSettings(prev => ({ ...prev, backupFrequency: e.target.value as 'daily' | 'weekly' | 'monthly' }))}
                className="w-full p-2 border border-gray-300 rounded-md"
              >
                <option value="daily">{isRTL ? 'يومياً' : 'Daily'}</option>
                <option value="weekly">{isRTL ? 'أسبوعياً' : 'Weekly'}</option>
                <option value="monthly">{isRTL ? 'شهرياً' : 'Monthly'}</option>
              </select>
            </div>
          </div>

          {/* أزرار الإجراءات */}
          <div className="flex flex-wrap gap-4 pt-6 border-t">
            <Button 
              onClick={saveSettings} 
              disabled={saving}
              className="flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              {saving ? 
                (isRTL ? 'جاري الحفظ...' : 'Saving...') : 
                (isRTL ? 'حفظ الإعدادات' : 'Save Settings')
              }
            </Button>

            <Button 
              onClick={resetSettings} 
              variant="outline"
              className="flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              {isRTL ? 'إعادة تعيين' : 'Reset to Defaults'}
            </Button>

            <Button 
              onClick={clearCache} 
              variant="outline"
              className="flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              {isRTL ? 'مسح التخزين المؤقت' : 'Clear Cache'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}