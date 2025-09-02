'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/components/safe-providers';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { updateProfile, updatePassword } from 'firebase/auth';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import {
  User,
  Settings,
  Bell,
  Shield,
  Palette,
  Globe,
  Key,
  Trash2,
  Save,
  Eye,
  EyeOff,
  Smartphone,
  Mail,
  Lock,
  Download,
  Upload,
  RefreshCw,
  AlertTriangle
} from 'lucide-react';

interface EnhancedSettingsPageProps {
  lang?: 'ar' | 'en';
}

interface UserSettings {
  theme: 'light' | 'dark' | 'system';
  language: 'ar' | 'en';
  notifications: {
    email: boolean;
    push: boolean;
    testReminders: boolean;
    resultUpdates: boolean;
    securityAlerts: boolean;
    marketing: boolean;
  };
  privacy: {
    profileVisibility: 'public' | 'private';
    shareResults: boolean;
    analyticsOptOut: boolean;
    dataCollection: boolean;
  };
  testPreferences: {
    autoSave: boolean;
    defaultView: 'grid' | 'list';
    showAdvanced: boolean;
    confirmDelete: boolean;
    showConfidence: boolean;
    soundEffects: boolean;
  };
  display: {
    colorScheme: 'default' | 'colorblind' | 'high-contrast';
    fontSize: 'small' | 'medium' | 'large';
    animations: boolean;
    compactView: boolean;
    showTooltips: boolean;
  };
}

const defaultSettings: UserSettings = {
  theme: 'system',
  language: 'ar',
  notifications: {
    email: true,
    push: true,
    testReminders: true,
    resultUpdates: true,
    securityAlerts: true,
    marketing: false,
  },
  privacy: {
    profileVisibility: 'private',
    shareResults: false,
    analyticsOptOut: false,
    dataCollection: true,
  },
  testPreferences: {
    autoSave: true,
    defaultView: 'grid',
    showAdvanced: false,
    confirmDelete: true,
    showConfidence: true,
    soundEffects: true,
  },
  display: {
    colorScheme: 'default',
    fontSize: 'medium',
    animations: true,
    compactView: false,
    showTooltips: true,
  },
};

export function EnhancedSettingsPage({ lang = 'ar' }: EnhancedSettingsPageProps) {
  const { user, userProfile } = useAuth();
  const [settings, setSettings] = useState<UserSettings>(defaultSettings);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  
  // Profile form states
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [bio, setBio] = useState('');
  
  // Password change states
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });

  const isRTL = lang === 'ar';

  const texts = {
    ar: {
      title: 'الإعدادات',
      subtitle: 'إدارة إعدادات حسابك وتفضيلاتك',
      profile: 'الملف الشخصي',
      account: 'الحساب',
      notifications: 'الإشعارات',
      privacy: 'الخصوصية',
      display: 'العرض',
      advanced: 'متقدم',
      save: 'حفظ',
      saving: 'جاري الحفظ...',
      saved: 'تم الحفظ بنجاح',
      error: 'حدث خطأ',
      displayName: 'اسم العرض',
      email: 'البريد الإلكتروني',
      bio: 'نبذة شخصية',
      currentPassword: 'كلمة المرور الحالية',
      newPassword: 'كلمة المرور الجديدة',
      confirmPassword: 'تأكيد كلمة المرور',
      changePassword: 'تغيير كلمة المرور',
      theme: 'المظهر',
      language: 'اللغة',
      emailNotifications: 'إشعارات البريد الإلكتروني',
      pushNotifications: 'الإشعارات المنبثقة',
      testReminders: 'تذكيرات الاختبارات',
      resultUpdates: 'تحديثات النتائج',
      securityAlerts: 'تنبيهات الأمان',
      marketingEmails: 'رسائل التسويق',
      profileVisibility: 'رؤية الملف الشخصي',
      shareResults: 'مشاركة النتائج',
      analyticsOptOut: 'إلغاء الاشتراك في التحليلات',
      dataCollection: 'جمع البيانات',
      autoSave: 'الحفظ التلقائي',
      defaultView: 'العرض الافتراضي',
      showAdvanced: 'إظهار الخيارات المتقدمة',
      confirmDelete: 'تأكيد الحذف',
      showConfidence: 'إظهار مستوى الثقة',
      soundEffects: 'المؤثرات الصوتية',
      colorScheme: 'نظام الألوان',
      fontSize: 'حجم الخط',
      animations: 'الحركات',
      compactView: 'العرض المضغوط',
      showTooltips: 'إظهار التلميحات',
      exportData: 'تصدير البيانات',
      importData: 'استيراد البيانات',
      resetSettings: 'إعادة تعيين الإعدادات',
      deleteAccount: 'حذف الحساب',
      dangerZone: 'منطقة الخطر',
      light: 'فاتح',
      dark: 'داكن',
      system: 'النظام',
      arabic: 'العربية',
      english: 'الإنجليزية',
      public: 'عام',
      private: 'خاص',
      grid: 'شبكة',
      list: 'قائمة',
      default: 'افتراضي',
      colorblind: 'عمى الألوان',
      highContrast: 'تباين عالي',
      small: 'صغير',
      medium: 'متوسط',
      large: 'كبير'
    },
    en: {
      title: 'Settings',
      subtitle: 'Manage your account settings and preferences',
      profile: 'Profile',
      account: 'Account',
      notifications: 'Notifications',
      privacy: 'Privacy',
      display: 'Display',
      advanced: 'Advanced',
      save: 'Save',
      saving: 'Saving...',
      saved: 'Saved successfully',
      error: 'An error occurred',
      displayName: 'Display Name',
      email: 'Email',
      bio: 'Bio',
      currentPassword: 'Current Password',
      newPassword: 'New Password',
      confirmPassword: 'Confirm Password',
      changePassword: 'Change Password',
      theme: 'Theme',
      language: 'Language',
      emailNotifications: 'Email Notifications',
      pushNotifications: 'Push Notifications',
      testReminders: 'Test Reminders',
      resultUpdates: 'Result Updates',
      securityAlerts: 'Security Alerts',
      marketingEmails: 'Marketing Emails',
      profileVisibility: 'Profile Visibility',
      shareResults: 'Share Results',
      analyticsOptOut: 'Analytics Opt-out',
      dataCollection: 'Data Collection',
      autoSave: 'Auto Save',
      defaultView: 'Default View',
      showAdvanced: 'Show Advanced Options',
      confirmDelete: 'Confirm Delete',
      showConfidence: 'Show Confidence Level',
      soundEffects: 'Sound Effects',
      colorScheme: 'Color Scheme',
      fontSize: 'Font Size',
      animations: 'Animations',
      compactView: 'Compact View',
      showTooltips: 'Show Tooltips',
      exportData: 'Export Data',
      importData: 'Import Data',
      resetSettings: 'Reset Settings',
      deleteAccount: 'Delete Account',
      dangerZone: 'Danger Zone',
      light: 'Light',
      dark: 'Dark',
      system: 'System',
      arabic: 'Arabic',
      english: 'English',
      public: 'Public',
      private: 'Private',
      grid: 'Grid',
      list: 'List',
      default: 'Default',
      colorblind: 'Colorblind',
      highContrast: 'High Contrast',
      small: 'Small',
      medium: 'Medium',
      large: 'Large'
    }
  };

  const t = texts[lang];

  useEffect(() => {
    const loadSettings = async () => {
      if (!user) return;

      try {
        // Load user settings from localStorage or database
        const savedSettings = localStorage.getItem('app_settings');
        if (savedSettings) {
          setSettings({ ...defaultSettings, ...JSON.parse(savedSettings) });
        }

        // Load profile data
        setDisplayName(user.displayName || '');
        setEmail(user.email || '');
        setBio(userProfile?.bio || '');
      } catch (error) {
        console.error('Error loading settings:', error);
        toast.error(t.error);
      } finally {
        setLoading(false);
      }
    };

    loadSettings();
  }, [user, userProfile, t.error]);

  const saveSettings = async () => {
    if (!user) return;

    setSaving(true);
    try {
      // Save to Firestore
      await updateDoc(doc(db, 'users', user.uid), {
        settings: settings,
        updatedAt: serverTimestamp()
      });

      // Save to localStorage for immediate access
      localStorage.setItem('app_settings', JSON.stringify(settings));

      // Apply theme immediately
      applyTheme(settings.theme);

      toast.success(t.saved);
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error(t.error);
    } finally {
      setSaving(false);
    }
  };

  const applyTheme = (theme: 'light' | 'dark' | 'system') => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else if (theme === 'light') {
      document.documentElement.classList.remove('dark');
    } else {
      // System theme
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (prefersDark) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  };

  const updateUserProfile = async () => {
    if (!user) return;

    setSaving(true);
    try {
      await updateProfile(user, {
        displayName: displayName
      });

      await updateDoc(doc(db, 'users', user.uid), {
        displayName: displayName,
        bio: bio,
        updatedAt: serverTimestamp()
      });

      toast.success(t.saved);
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error(t.error);
    } finally {
      setSaving(false);
    }
  };

  const changePassword = async () => {
    if (!user || !currentPassword || !newPassword || newPassword !== confirmPassword) {
      toast.error(isRTL ? 'يرجى التحقق من البيانات المدخلة' : 'Please check the entered data');
      return;
    }

    setSaving(true);
    try {
      await updatePassword(user, newPassword);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      toast.success(isRTL ? 'تم تغيير كلمة المرور' : 'Password changed successfully');
    } catch (error) {
      console.error('Error changing password:', error);
      toast.error(isRTL ? 'خطأ في تغيير كلمة المرور' : 'Error changing password');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            {isRTL ? 'جاري تحميل الإعدادات...' : 'Loading settings...'}
          </h2>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 dark:from-gray-950 dark:via-background dark:to-blue-950 ${isRTL ? 'rtl' : 'ltr'}`} dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                {t.title}
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                {t.subtitle}
              </p>
            </div>
            <Settings className="h-8 w-8 text-blue-600" />
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-6 mb-8">
              <TabsTrigger value="profile" className="flex items-center space-x-2 rtl:space-x-reverse">
                <User className="h-4 w-4" />
                <span className="hidden sm:inline">{t.profile}</span>
              </TabsTrigger>
              <TabsTrigger value="account" className="flex items-center space-x-2 rtl:space-x-reverse">
                <Key className="h-4 w-4" />
                <span className="hidden sm:inline">{t.account}</span>
              </TabsTrigger>
              <TabsTrigger value="notifications" className="flex items-center space-x-2 rtl:space-x-reverse">
                <Bell className="h-4 w-4" />
                <span className="hidden sm:inline">{t.notifications}</span>
              </TabsTrigger>
              <TabsTrigger value="privacy" className="flex items-center space-x-2 rtl:space-x-reverse">
                <Shield className="h-4 w-4" />
                <span className="hidden sm:inline">{t.privacy}</span>
              </TabsTrigger>
              <TabsTrigger value="display" className="flex items-center space-x-2 rtl:space-x-reverse">
                <Palette className="h-4 w-4" />
                <span className="hidden sm:inline">{t.display}</span>
              </TabsTrigger>
              <TabsTrigger value="advanced" className="flex items-center space-x-2 rtl:space-x-reverse">
                <Settings className="h-4 w-4" />
                <span className="hidden sm:inline">{t.advanced}</span>
              </TabsTrigger>
            </TabsList>

            {/* Profile Tab */}
            <TabsContent value="profile" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2 rtl:space-x-reverse">
                    <User className="h-5 w-5" />
                    <span>{t.profile}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="displayName">{t.displayName}</Label>
                      <Input
                        id="displayName"
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        placeholder={t.displayName}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">{t.email}</Label>
                      <Input
                        id="email"
                        value={email}
                        disabled
                        className="bg-gray-50 dark:bg-gray-800"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="bio">{t.bio}</Label>
                    <Textarea
                      id="bio"
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      placeholder={isRTL ? 'اكتب نبذة عن نفسك...' : 'Tell us about yourself...'}
                      rows={3}
                    />
                  </div>
                  <Button onClick={updateUserProfile} disabled={saving}>
                    {saving ? (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2 rtl:ml-2 rtl:mr-0 animate-spin" />
                        {t.saving}
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2 rtl:ml-2 rtl:mr-0" />
                        {t.save}
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Account Tab */}
            <TabsContent value="account" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2 rtl:space-x-reverse">
                    <Key className="h-5 w-5" />
                    <span>{t.changePassword}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="currentPassword">{t.currentPassword}</Label>
                      <div className="relative">
                        <Input
                          id="currentPassword"
                          type={showPasswords.current ? 'text' : 'password'}
                          value={currentPassword}
                          onChange={(e) => setCurrentPassword(e.target.value)}
                          placeholder={t.currentPassword}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-2 rtl:right-auto rtl:left-2 top-1/2 transform -translate-y-1/2"
                          onClick={() => setShowPasswords(prev => ({ ...prev, current: !prev.current }))}
                        >
                          {showPasswords.current ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="newPassword">{t.newPassword}</Label>
                      <div className="relative">
                        <Input
                          id="newPassword"
                          type={showPasswords.new ? 'text' : 'password'}
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          placeholder={t.newPassword}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-2 rtl:right-auto rtl:left-2 top-1/2 transform -translate-y-1/2"
                          onClick={() => setShowPasswords(prev => ({ ...prev, new: !prev.new }))}
                        >
                          {showPasswords.new ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">{t.confirmPassword}</Label>
                      <div className="relative">
                        <Input
                          id="confirmPassword"
                          type={showPasswords.confirm ? 'text' : 'password'}
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          placeholder={t.confirmPassword}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-2 rtl:right-auto rtl:left-2 top-1/2 transform -translate-y-1/2"
                          onClick={() => setShowPasswords(prev => ({ ...prev, confirm: !prev.confirm }))}
                        >
                          {showPasswords.confirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                      </div>
                    </div>
                  </div>
                  <Button onClick={changePassword} disabled={saving || !currentPassword || !newPassword || newPassword !== confirmPassword}>
                    {saving ? (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2 rtl:ml-2 rtl:mr-0 animate-spin" />
                        {t.saving}
                      </>
                    ) : (
                      <>
                        <Lock className="h-4 w-4 mr-2 rtl:ml-2 rtl:mr-0" />
                        {t.changePassword}
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Notifications Tab */}
            <TabsContent value="notifications" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2 rtl:space-x-reverse">
                    <Bell className="h-5 w-5" />
                    <span>{t.notifications}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <Label>{t.emailNotifications}</Label>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {isRTL ? 'تلقي إشعارات عبر البريد الإلكتروني' : 'Receive notifications via email'}
                        </p>
                      </div>
                      <Switch
                        checked={settings.notifications.email}
                        onCheckedChange={(checked) =>
                          setSettings(prev => ({
                            ...prev,
                            notifications: { ...prev.notifications, email: checked }
                          }))
                        }
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <Label>{t.pushNotifications}</Label>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {isRTL ? 'تلقي إشعارات منبثقة في المتصفح' : 'Receive push notifications in browser'}
                        </p>
                      </div>
                      <Switch
                        checked={settings.notifications.push}
                        onCheckedChange={(checked) =>
                          setSettings(prev => ({
                            ...prev,
                            notifications: { ...prev.notifications, push: checked }
                          }))
                        }
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <Label>{t.testReminders}</Label>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {isRTL ? 'تذكيرات لإجراء الاختبارات' : 'Reminders to take tests'}
                        </p>
                      </div>
                      <Switch
                        checked={settings.notifications.testReminders}
                        onCheckedChange={(checked) =>
                          setSettings(prev => ({
                            ...prev,
                            notifications: { ...prev.notifications, testReminders: checked }
                          }))
                        }
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <Label>{t.resultUpdates}</Label>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {isRTL ? 'إشعارات عند توفر نتائج جديدة' : 'Notifications when new results are available'}
                        </p>
                      </div>
                      <Switch
                        checked={settings.notifications.resultUpdates}
                        onCheckedChange={(checked) =>
                          setSettings(prev => ({
                            ...prev,
                            notifications: { ...prev.notifications, resultUpdates: checked }
                          }))
                        }
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <Label>{t.securityAlerts}</Label>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {isRTL ? 'تنبيهات أمنية مهمة' : 'Important security alerts'}
                        </p>
                      </div>
                      <Switch
                        checked={settings.notifications.securityAlerts}
                        onCheckedChange={(checked) =>
                          setSettings(prev => ({
                            ...prev,
                            notifications: { ...prev.notifications, securityAlerts: checked }
                          }))
                        }
                      />
                    </div>
                  </div>
                  <Button onClick={saveSettings} disabled={saving}>
                    {saving ? (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2 rtl:ml-2 rtl:mr-0 animate-spin" />
                        {t.saving}
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2 rtl:ml-2 rtl:mr-0" />
                        {t.save}
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Display Tab */}
            <TabsContent value="display" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2 rtl:space-x-reverse">
                    <Palette className="h-5 w-5" />
                    <span>{t.display}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label>{t.theme}</Label>
                      <Select
                        value={settings.theme}
                        onValueChange={(value: 'light' | 'dark' | 'system') =>
                          setSettings(prev => ({ ...prev, theme: value }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="light">{t.light}</SelectItem>
                          <SelectItem value="dark">{t.dark}</SelectItem>
                          <SelectItem value="system">{t.system}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>{t.language}</Label>
                      <Select
                        value={settings.language}
                        onValueChange={(value: 'ar' | 'en') =>
                          setSettings(prev => ({ ...prev, language: value }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="ar">{t.arabic}</SelectItem>
                          <SelectItem value="en">{t.english}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>{t.fontSize}</Label>
                      <Select
                        value={settings.display.fontSize}
                        onValueChange={(value: 'small' | 'medium' | 'large') =>
                          setSettings(prev => ({
                            ...prev,
                            display: { ...prev.display, fontSize: value }
                          }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="small">{t.small}</SelectItem>
                          <SelectItem value="medium">{t.medium}</SelectItem>
                          <SelectItem value="large">{t.large}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>{t.colorScheme}</Label>
                      <Select
                        value={settings.display.colorScheme}
                        onValueChange={(value: 'default' | 'colorblind' | 'high-contrast') =>
                          setSettings(prev => ({
                            ...prev,
                            display: { ...prev.display, colorScheme: value }
                          }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="default">{t.default}</SelectItem>
                          <SelectItem value="colorblind">{t.colorblind}</SelectItem>
                          <SelectItem value="high-contrast">{t.highContrast}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label>{t.animations}</Label>
                      <Switch
                        checked={settings.display.animations}
                        onCheckedChange={(checked) =>
                          setSettings(prev => ({
                            ...prev,
                            display: { ...prev.display, animations: checked }
                          }))
                        }
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label>{t.compactView}</Label>
                      <Switch
                        checked={settings.display.compactView}
                        onCheckedChange={(checked) =>
                          setSettings(prev => ({
                            ...prev,
                            display: { ...prev.display, compactView: checked }
                          }))
                        }
                      />
                    </div>
                  </div>
                  <Button onClick={saveSettings} disabled={saving}>
                    {saving ? (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2 rtl:ml-2 rtl:mr-0 animate-spin" />
                        {t.saving}
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2 rtl:ml-2 rtl:mr-0" />
                        {t.save}
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Advanced Tab */}
            <TabsContent value="advanced" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2 rtl:space-x-reverse">
                    <Settings className="h-5 w-5" />
                    <span>{t.advanced}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Button variant="outline" className="flex items-center space-x-2 rtl:space-x-reverse">
                      <Download className="h-4 w-4" />
                      <span>{t.exportData}</span>
                    </Button>
                    <Button variant="outline" className="flex items-center space-x-2 rtl:space-x-reverse">
                      <Upload className="h-4 w-4" />
                      <span>{t.importData}</span>
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Danger Zone */}
              <Card className="border-red-200 dark:border-red-800">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2 rtl:space-x-reverse text-red-600 dark:text-red-400">
                    <AlertTriangle className="h-5 w-5" />
                    <span>{t.dangerZone}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button variant="outline" className="w-full border-red-200 text-red-600 hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-900/20">
                    <RefreshCw className="h-4 w-4 mr-2 rtl:ml-2 rtl:mr-0" />
                    {t.resetSettings}
                  </Button>
                  <Button variant="destructive" className="w-full">
                    <Trash2 className="h-4 w-4 mr-2 rtl:ml-2 rtl:mr-0" />
                    {t.deleteAccount}
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
