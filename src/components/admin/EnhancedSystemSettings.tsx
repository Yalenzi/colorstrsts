'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { Language } from '@/types';
import { 
  Settings, 
  Palette, 
  Globe,
  Shield,
  Database,
  Mail,
  Bell,
  Save,
  RefreshCw,
  Eye,
  EyeOff,
  Check,
  X,
  Upload,
  Download,
  Monitor,
  Smartphone,
  Sun,
  Moon,
  Zap,
  Lock,
  Key,
  Server,
  HardDrive,
  Wifi,
  AlertTriangle
} from 'lucide-react';

interface SystemSettings {
  general: GeneralSettings;
  appearance: AppearanceSettings;
  security: SecuritySettings;
  database: DatabaseSettings;
  notifications: NotificationSettings;
  performance: PerformanceSettings;
}

interface GeneralSettings {
  siteName: string;
  siteNameAr: string;
  siteDescription: string;
  siteDescriptionAr: string;
  defaultLanguage: string;
  timezone: string;
  dateFormat: string;
  maintenanceMode: boolean;
  registrationEnabled: boolean;
  maxUsersPerDay: number;
}

interface AppearanceSettings {
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  darkMode: boolean;
  rtlSupport: boolean;
  customLogo: string;
  customFavicon: string;
  fontFamily: string;
  fontSize: string;
}

interface SecuritySettings {
  passwordMinLength: number;
  passwordRequireSpecialChars: boolean;
  passwordRequireNumbers: boolean;
  passwordRequireUppercase: boolean;
  sessionTimeout: number;
  maxLoginAttempts: number;
  twoFactorAuth: boolean;
  ipWhitelist: string[];
  sslEnabled: boolean;
}

interface DatabaseSettings {
  backupFrequency: string;
  maxConnections: number;
  queryTimeout: number;
  autoOptimize: boolean;
  compressionEnabled: boolean;
  encryptionEnabled: boolean;
}

interface NotificationSettings {
  emailNotifications: boolean;
  smsNotifications: boolean;
  pushNotifications: boolean;
  adminAlerts: boolean;
  userWelcomeEmail: boolean;
  systemMaintenanceAlerts: boolean;
}

interface PerformanceSettings {
  cacheEnabled: boolean;
  cacheDuration: number;
  compressionEnabled: boolean;
  cdnEnabled: boolean;
  imageOptimization: boolean;
  lazyLoading: boolean;
}

interface EnhancedSystemSettingsProps {
  lang: Language;
}

export function EnhancedSystemSettings({ lang }: EnhancedSystemSettingsProps) {
  const isRTL = lang === 'ar';
  const [settings, setSettings] = useState<SystemSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<string>('general');
  const [showPasswords, setShowPasswords] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setLoading(true);
    try {
      // محاكاة تحميل الإعدادات من قاعدة البيانات
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockSettings: SystemSettings = {
        general: {
          siteName: 'Color Testing System',
          siteNameAr: 'نظام اختبارات الألوان',
          siteDescription: 'Advanced chemical testing platform',
          siteDescriptionAr: 'منصة متقدمة للاختبارات الكيميائية',
          defaultLanguage: 'en',
          timezone: 'UTC',
          dateFormat: 'YYYY-MM-DD',
          maintenanceMode: false,
          registrationEnabled: true,
          maxUsersPerDay: 100
        },
        appearance: {
          primaryColor: '#3B82F6',
          secondaryColor: '#10B981',
          accentColor: '#8B5CF6',
          darkMode: false,
          rtlSupport: true,
          customLogo: '',
          customFavicon: '',
          fontFamily: 'Inter',
          fontSize: 'medium'
        },
        security: {
          passwordMinLength: 8,
          passwordRequireSpecialChars: true,
          passwordRequireNumbers: true,
          passwordRequireUppercase: true,
          sessionTimeout: 30,
          maxLoginAttempts: 5,
          twoFactorAuth: false,
          ipWhitelist: [],
          sslEnabled: true
        },
        database: {
          backupFrequency: 'daily',
          maxConnections: 100,
          queryTimeout: 30,
          autoOptimize: true,
          compressionEnabled: true,
          encryptionEnabled: true
        },
        notifications: {
          emailNotifications: true,
          smsNotifications: false,
          pushNotifications: true,
          adminAlerts: true,
          userWelcomeEmail: true,
          systemMaintenanceAlerts: true
        },
        performance: {
          cacheEnabled: true,
          cacheDuration: 3600,
          compressionEnabled: true,
          cdnEnabled: false,
          imageOptimization: true,
          lazyLoading: true
        }
      };

      setSettings(mockSettings);
      toast.success(isRTL ? 'تم تحميل الإعدادات بنجاح' : 'Settings loaded successfully');
    } catch (error) {
      console.error('Error loading settings:', error);
      toast.error(isRTL ? 'خطأ في تحميل الإعدادات' : 'Error loading settings');
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    if (!settings) return;
    
    setSaving(true);
    try {
      // محاكاة حفظ الإعدادات
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast.success(isRTL ? 'تم حفظ الإعدادات بنجاح' : 'Settings saved successfully');
      setHasChanges(false);
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error(isRTL ? 'خطأ في حفظ الإعدادات' : 'Error saving settings');
    } finally {
      setSaving(false);
    }
  };

  const updateSetting = (section: keyof SystemSettings, key: string, value: any) => {
    if (!settings) return;
    
    setSettings({
      ...settings,
      [section]: {
        ...settings[section],
        [key]: value
      }
    });
    setHasChanges(true);
  };

  const tabs = [
    { id: 'general', name: isRTL ? 'عام' : 'General', icon: Settings },
    { id: 'appearance', name: isRTL ? 'المظهر' : 'Appearance', icon: Palette },
    { id: 'security', name: isRTL ? 'الأمان' : 'Security', icon: Shield },
    { id: 'database', name: isRTL ? 'قاعدة البيانات' : 'Database', icon: Database },
    { id: 'notifications', name: isRTL ? 'الإشعارات' : 'Notifications', icon: Bell },
    { id: 'performance', name: isRTL ? 'الأداء' : 'Performance', icon: Zap }
  ];

  const renderGeneralSettings = () => {
    if (!settings) return null;
    
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {isRTL ? 'اسم الموقع (إنجليزي)' : 'Site Name (English)'}
            </label>
            <Input
              value={settings.general.siteName}
              onChange={(e) => updateSetting('general', 'siteName', e.target.value)}
              placeholder="Color Testing System"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {isRTL ? 'اسم الموقع (عربي)' : 'Site Name (Arabic)'}
            </label>
            <Input
              value={settings.general.siteNameAr}
              onChange={(e) => updateSetting('general', 'siteNameAr', e.target.value)}
              placeholder="نظام اختبارات الألوان"
              className={isRTL ? 'text-right' : ''}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {isRTL ? 'وصف الموقع (إنجليزي)' : 'Site Description (English)'}
            </label>
            <Input
              value={settings.general.siteDescription}
              onChange={(e) => updateSetting('general', 'siteDescription', e.target.value)}
              placeholder="Advanced chemical testing platform"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {isRTL ? 'وصف الموقع (عربي)' : 'Site Description (Arabic)'}
            </label>
            <Input
              value={settings.general.siteDescriptionAr}
              onChange={(e) => updateSetting('general', 'siteDescriptionAr', e.target.value)}
              placeholder="منصة متقدمة للاختبارات الكيميائية"
              className={isRTL ? 'text-right' : ''}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {isRTL ? 'اللغة الافتراضية' : 'Default Language'}
            </label>
            <select
              value={settings.general.defaultLanguage}
              onChange={(e) => updateSetting('general', 'defaultLanguage', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="en">{isRTL ? 'الإنجليزية' : 'English'}</option>
              <option value="ar">{isRTL ? 'العربية' : 'Arabic'}</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {isRTL ? 'المنطقة الزمنية' : 'Timezone'}
            </label>
            <select
              value={settings.general.timezone}
              onChange={(e) => updateSetting('general', 'timezone', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="UTC">UTC</option>
              <option value="Asia/Riyadh">{isRTL ? 'الرياض' : 'Riyadh'}</option>
              <option value="Asia/Dubai">{isRTL ? 'دبي' : 'Dubai'}</option>
              <option value="Europe/London">{isRTL ? 'لندن' : 'London'}</option>
              <option value="America/New_York">{isRTL ? 'نيويورك' : 'New York'}</option>
            </select>
          </div>
        </div>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div>
              <h4 className="font-medium text-gray-900 dark:text-gray-100">
                {isRTL ? 'وضع الصيانة' : 'Maintenance Mode'}
              </h4>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {isRTL ? 'تعطيل الوصول للمستخدمين مؤقتاً' : 'Temporarily disable user access'}
              </p>
            </div>
            <button
              onClick={() => updateSetting('general', 'maintenanceMode', !settings.general.maintenanceMode)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                settings.general.maintenanceMode ? 'bg-blue-600' : 'bg-gray-200'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  settings.general.maintenanceMode ? 'translate-x-6 rtl:-translate-x-6' : 'translate-x-1 rtl:-translate-x-1'
                }`}
              />
            </button>
          </div>
          
          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div>
              <h4 className="font-medium text-gray-900 dark:text-gray-100">
                {isRTL ? 'تمكين التسجيل' : 'Registration Enabled'}
              </h4>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {isRTL ? 'السماح للمستخدمين الجدد بالتسجيل' : 'Allow new users to register'}
              </p>
            </div>
            <button
              onClick={() => updateSetting('general', 'registrationEnabled', !settings.general.registrationEnabled)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                settings.general.registrationEnabled ? 'bg-blue-600' : 'bg-gray-200'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  settings.general.registrationEnabled ? 'translate-x-6 rtl:-translate-x-6' : 'translate-x-1 rtl:-translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderAppearanceSettings = () => {
    if (!settings) return null;
    
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {isRTL ? 'اللون الأساسي' : 'Primary Color'}
            </label>
            <div className="flex items-center space-x-2 rtl:space-x-reverse">
              <input
                type="color"
                value={settings.appearance.primaryColor}
                onChange={(e) => updateSetting('appearance', 'primaryColor', e.target.value)}
                className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
              />
              <Input
                value={settings.appearance.primaryColor}
                onChange={(e) => updateSetting('appearance', 'primaryColor', e.target.value)}
                placeholder="#3B82F6"
                className="flex-1"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {isRTL ? 'اللون الثانوي' : 'Secondary Color'}
            </label>
            <div className="flex items-center space-x-2 rtl:space-x-reverse">
              <input
                type="color"
                value={settings.appearance.secondaryColor}
                onChange={(e) => updateSetting('appearance', 'secondaryColor', e.target.value)}
                className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
              />
              <Input
                value={settings.appearance.secondaryColor}
                onChange={(e) => updateSetting('appearance', 'secondaryColor', e.target.value)}
                placeholder="#10B981"
                className="flex-1"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {isRTL ? 'لون التمييز' : 'Accent Color'}
            </label>
            <div className="flex items-center space-x-2 rtl:space-x-reverse">
              <input
                type="color"
                value={settings.appearance.accentColor}
                onChange={(e) => updateSetting('appearance', 'accentColor', e.target.value)}
                className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
              />
              <Input
                value={settings.appearance.accentColor}
                onChange={(e) => updateSetting('appearance', 'accentColor', e.target.value)}
                placeholder="#8B5CF6"
                className="flex-1"
              />
            </div>
          </div>
        </div>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div className="flex items-center space-x-3 rtl:space-x-reverse">
              <Moon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              <div>
                <h4 className="font-medium text-gray-900 dark:text-gray-100">
                  {isRTL ? 'الوضع المظلم' : 'Dark Mode'}
                </h4>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {isRTL ? 'تمكين المظهر المظلم افتراضياً' : 'Enable dark theme by default'}
                </p>
              </div>
            </div>
            <button
              onClick={() => updateSetting('appearance', 'darkMode', !settings.appearance.darkMode)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                settings.appearance.darkMode ? 'bg-blue-600' : 'bg-gray-200'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  settings.appearance.darkMode ? 'translate-x-6 rtl:-translate-x-6' : 'translate-x-1 rtl:-translate-x-1'
                }`}
              />
            </button>
          </div>
          
          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div className="flex items-center space-x-3 rtl:space-x-reverse">
              <Globe className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              <div>
                <h4 className="font-medium text-gray-900 dark:text-gray-100">
                  {isRTL ? 'دعم RTL' : 'RTL Support'}
                </h4>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {isRTL ? 'دعم الكتابة من اليمين لليسار' : 'Support right-to-left text direction'}
                </p>
              </div>
            </div>
            <button
              onClick={() => updateSetting('appearance', 'rtlSupport', !settings.appearance.rtlSupport)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                settings.appearance.rtlSupport ? 'bg-blue-600' : 'bg-gray-200'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  settings.appearance.rtlSupport ? 'translate-x-6 rtl:-translate-x-6' : 'translate-x-1 rtl:-translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className={`space-y-6 ${isRTL ? 'rtl' : 'ltr'}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            {isRTL ? 'إعدادات النظام' : 'System Settings'}
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            {isRTL ? 'تخصيص وإدارة إعدادات النظام' : 'Customize and manage system settings'}
          </p>
        </div>
        <div className="flex space-x-2 rtl:space-x-reverse">
          {hasChanges && (
            <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
              {isRTL ? 'تغييرات غير محفوظة' : 'Unsaved Changes'}
            </Badge>
          )}
          <Button 
            onClick={saveSettings} 
            disabled={!hasChanges || saving}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {saving ? (
              <RefreshCw className="w-4 h-4 mr-2 rtl:ml-2 rtl:mr-0 animate-spin" />
            ) : (
              <Save className="w-4 h-4 mr-2 rtl:ml-2 rtl:mr-0" />
            )}
            {saving ? (isRTL ? 'جاري الحفظ...' : 'Saving...') : (isRTL ? 'حفظ' : 'Save')}
          </Button>
          <Button variant="outline" onClick={loadSettings}>
            <RefreshCw className="w-4 h-4 mr-2 rtl:ml-2 rtl:mr-0" />
            {isRTL ? 'إعادة تحميل' : 'Reload'}
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2 rtl:mr-2 rtl:ml-0 text-gray-600 dark:text-gray-400">
            {isRTL ? 'جاري تحميل الإعدادات...' : 'Loading settings...'}
          </span>
        </div>
      ) : settings ? (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Card>
              <CardContent className="p-0">
                <nav className="space-y-1">
                  {tabs.map((tab) => {
                    const IconComponent = tab.icon;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`w-full flex items-center space-x-3 rtl:space-x-reverse px-4 py-3 text-left rtl:text-right transition-colors ${
                          activeTab === tab.id
                            ? 'bg-blue-50 dark:bg-blue-900 text-blue-700 dark:text-blue-300 border-r-2 rtl:border-l-2 rtl:border-r-0 border-blue-500'
                            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                        }`}
                      >
                        <IconComponent className="w-5 h-5" />
                        <span className="font-medium">{tab.name}</span>
                      </button>
                    );
                  })}
                </nav>
              </CardContent>
            </Card>
          </div>

          {/* Content */}
          <div className="lg:col-span-3">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 rtl:space-x-reverse">
                  {(() => {
                    const tab = tabs.find(tab => tab.id === activeTab);
                    const IconComponent = tab?.icon;
                    return IconComponent ? <IconComponent className="w-5 h-5" /> : null;
                  })()}
                  <span>{tabs.find(tab => tab.id === activeTab)?.name}</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {activeTab === 'general' && renderGeneralSettings()}
                {activeTab === 'appearance' && renderAppearanceSettings()}
                {activeTab === 'security' && (
                  <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                    <Shield className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>{isRTL ? 'إعدادات الأمان قيد التطوير' : 'Security settings under development'}</p>
                  </div>
                )}
                {activeTab === 'database' && (
                  <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                    <Database className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>{isRTL ? 'إعدادات قاعدة البيانات قيد التطوير' : 'Database settings under development'}</p>
                  </div>
                )}
                {activeTab === 'notifications' && (
                  <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                    <Bell className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>{isRTL ? 'إعدادات الإشعارات قيد التطوير' : 'Notification settings under development'}</p>
                  </div>
                )}
                {activeTab === 'performance' && (
                  <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                    <Zap className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>{isRTL ? 'إعدادات الأداء قيد التطوير' : 'Performance settings under development'}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      ) : (
        <div className="text-center py-12 text-gray-500 dark:text-gray-400">
          <Settings className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>{isRTL ? 'لا توجد إعدادات متاحة' : 'No settings available'}</p>
        </div>
      )}
    </div>
  );
}
