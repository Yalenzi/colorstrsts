'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Language } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { auth, db } from '@/lib/firebase';
import { doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { updateProfile, updatePassword, updateEmail, sendEmailVerification } from 'firebase/auth';
import { onAuthStateChanged, User } from 'firebase/auth';
import toast from 'react-hot-toast';
import {
  Cog6ToothIcon,
  LanguageIcon,
  MoonIcon,
  SunIcon,
  BellIcon,
  ShieldCheckIcon,
  UserIcon,
  ArrowLeftIcon,
  CheckIcon,
  DevicePhoneMobileIcon,
  CloudArrowUpIcon,
  TrashIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XMarkIcon,
  EyeIcon,
  EyeSlashIcon,
  KeyIcon,
  EnvelopeIcon,
  PaintBrushIcon,
  GlobeAltIcon
} from '@heroicons/react/24/outline';

interface SettingsPageProps {
  lang: Language;
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
  };
  privacy: {
    profileVisibility: 'public' | 'private';
    shareResults: boolean;
    analyticsOptOut: boolean;
  };
  testPreferences: {
    autoSave: boolean;
    defaultView: 'grid' | 'list';
    showAdvanced: boolean;
    confirmDelete: boolean;
    showConfidence: boolean;
  };
  display: {
    colorScheme: 'default' | 'colorblind' | 'high-contrast';
    fontSize: 'small' | 'medium' | 'large';
    animations: boolean;
    compactView: boolean;
  };
}

const defaultSettings: UserSettings = {
  theme: 'system',
  language: 'en',
  notifications: {
    email: true,
    push: true,
    testReminders: true,
    resultUpdates: true,
    securityAlerts: true,
  },
  privacy: {
    profileVisibility: 'private',
    shareResults: false,
    analyticsOptOut: false,
  },
  testPreferences: {
    autoSave: true,
    defaultView: 'grid',
    showAdvanced: false,
    confirmDelete: true,
    showConfidence: true,
  },
  display: {
    colorScheme: 'default',
    fontSize: 'medium',
    animations: true,
    compactView: false,
  },
};

export default function SettingsPage({ lang }: SettingsPageProps) {
  const [user, setUser] = useState<User | null>(null);
  const [settings, setSettings] = useState<UserSettings>(defaultSettings);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Form states
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const router = useRouter();
  const isRTL = lang === 'ar';

  const texts = {
    title: isRTL ? 'الإعدادات' : 'Settings',
    subtitle: isRTL ? 'تخصيص إعدادات التطبيق والتفضيلات' : 'Customize app settings and preferences',
    profile: isRTL ? 'الملف الشخصي' : 'Profile',
    account: isRTL ? 'الحساب' : 'Account',
    notifications: isRTL ? 'الإشعارات' : 'Notifications',
    privacy: isRTL ? 'الخصوصية' : 'Privacy',
    display: isRTL ? 'العرض' : 'Display',
    advanced: isRTL ? 'متقدم' : 'Advanced',
    save: isRTL ? 'حفظ' : 'Save',
    saving: isRTL ? 'جاري الحفظ...' : 'Saving...',
    saved: isRTL ? 'تم الحفظ!' : 'Saved!',
    cancel: isRTL ? 'إلغاء' : 'Cancel',
    delete: isRTL ? 'حذف' : 'Delete',
    confirm: isRTL ? 'تأكيد' : 'Confirm',
    back: isRTL ? 'رجوع' : 'Back',

    // Profile
    displayName: isRTL ? 'الاسم المعروض' : 'Display Name',
    emailAddress: isRTL ? 'البريد الإلكتروني' : 'Email Address',
    currentPassword: isRTL ? 'كلمة المرور الحالية' : 'Current Password',
    newPassword: isRTL ? 'كلمة المرور الجديدة' : 'New Password',
    confirmPassword: isRTL ? 'تأكيد كلمة المرور' : 'Confirm Password',
    changePassword: isRTL ? 'تغيير كلمة المرور' : 'Change Password',
    verifyEmail: isRTL ? 'تأكيد البريد الإلكتروني' : 'Verify Email',
    emailVerified: isRTL ? 'البريد الإلكتروني مؤكد' : 'Email Verified',
    updateProfile: isRTL ? 'تحديث الملف الشخصي' : 'Update Profile',

    // Notifications
    emailNotifications: isRTL ? 'إشعارات البريد الإلكتروني' : 'Email Notifications',
    pushNotifications: isRTL ? 'الإشعارات المنبثقة' : 'Push Notifications',
    testReminders: isRTL ? 'تذكيرات الاختبارات' : 'Test Reminders',
    resultUpdates: isRTL ? 'تحديثات النتائج' : 'Result Updates',
    securityAlerts: isRTL ? 'تنبيهات الأمان' : 'Security Alerts',

    // Privacy
    profileVisibility: isRTL ? 'رؤية الملف الشخصي' : 'Profile Visibility',
    public: isRTL ? 'عام' : 'Public',
    private: isRTL ? 'خاص' : 'Private',
    shareResults: isRTL ? 'مشاركة النتائج' : 'Share Results',
    analyticsOptOut: isRTL ? 'إلغاء الاشتراك في التحليلات' : 'Opt out of Analytics',

    // Display
    theme: isRTL ? 'المظهر' : 'Theme',
    light: isRTL ? 'فاتح' : 'Light',
    dark: isRTL ? 'داكن' : 'Dark',
    system: isRTL ? 'النظام' : 'System',
    language: isRTL ? 'اللغة' : 'Language',
    arabic: isRTL ? 'العربية' : 'Arabic',
    english: isRTL ? 'الإنجليزية' : 'English',
    colorScheme: isRTL ? 'نظام الألوان' : 'Color Scheme',
    default: isRTL ? 'افتراضي' : 'Default',
    colorblind: isRTL ? 'عمى الألوان' : 'Colorblind',
    highContrast: isRTL ? 'تباين عالي' : 'High Contrast',
    fontSize: isRTL ? 'حجم الخط' : 'Font Size',
    small: isRTL ? 'صغير' : 'Small',
    medium: isRTL ? 'متوسط' : 'Medium',
    large: isRTL ? 'كبير' : 'Large',
    animations: isRTL ? 'الحركات' : 'Animations',
    compactView: isRTL ? 'العرض المضغوط' : 'Compact View',

    // Test Preferences
    autoSave: isRTL ? 'الحفظ التلقائي' : 'Auto Save',
    defaultView: isRTL ? 'العرض الافتراضي' : 'Default View',
    grid: isRTL ? 'شبكة' : 'Grid',
    list: isRTL ? 'قائمة' : 'List',
    showAdvanced: isRTL ? 'إظهار الخيارات المتقدمة' : 'Show Advanced Options',
    confirmDelete: isRTL ? 'تأكيد الحذف' : 'Confirm Delete',
    showConfidence: isRTL ? 'إظهار مستوى الثقة' : 'Show Confidence Level',

    // Advanced
    exportData: isRTL ? 'تصدير البيانات' : 'Export Data',
    importData: isRTL ? 'استيراد البيانات' : 'Import Data',
    clearCache: isRTL ? 'مسح التخزين المؤقت' : 'Clear Cache',
    deleteAccount: isRTL ? 'حذف الحساب' : 'Delete Account',
    dangerZone: isRTL ? 'منطقة الخطر' : 'Danger Zone',
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        setDisplayName(currentUser.displayName || '');
        setEmail(currentUser.email || '');
        await loadUserSettings(currentUser.uid);
      } else {
        router.push(`/${lang}/auth/login`);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [lang, router]);

  const loadUserSettings = async (userId: string) => {
    try {
      const userDoc = await getDoc(doc(db, 'users', userId));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        if (userData.settings) {
          setSettings({ ...defaultSettings, ...userData.settings });
        }
      }
    } catch (error) {
      console.error('Error loading user settings:', error);
    }
  };

  const saveSettings = async () => {
    if (!user) return;

    setSaving(true);
    try {
      await updateDoc(doc(db, 'users', user.uid), {
        settings: settings,
        updatedAt: serverTimestamp()
      });

      // Apply theme immediately
      applyTheme(settings.theme);

      // Save to localStorage for immediate access
      localStorage.setItem('app_settings', JSON.stringify(settings));

      toast.success(isRTL ? 'تم حفظ الإعدادات بنجاح' : 'Settings saved successfully');
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error(isRTL ? 'خطأ في حفظ الإعدادات' : 'Error saving settings');
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
        updatedAt: serverTimestamp()
      });

      toast.success(isRTL ? 'تم تحديث الملف الشخصي' : 'Profile updated successfully');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error(isRTL ? 'خطأ في تحديث الملف الشخصي' : 'Error updating profile');
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

  const sendVerificationEmail = async () => {
    if (!user) return;

    try {
      await sendEmailVerification(user);
      toast.success(isRTL ? 'تم إرسال رسالة التأكيد' : 'Verification email sent');
    } catch (error) {
      console.error('Error sending verification email:', error);
      toast.error(isRTL ? 'خطأ في إرسال رسالة التأكيد' : 'Error sending verification email');
    }
  };

  const handleLanguageChange = (newLang: 'ar' | 'en') => {
    setSettings(prev => ({ ...prev, language: newLang }));
    // Navigate to the new language
    const currentPath = window.location.pathname;
    const newPath = currentPath.replace(`/${lang}/`, `/${newLang}/`);
    router.push(newPath);
  };

  const exportUserData = async () => {
    if (!user) return;

    try {
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      const userData = userDoc.exists() ? userDoc.data() : {};

      const exportData = {
        profile: {
          displayName: user.displayName,
          email: user.email,
          emailVerified: user.emailVerified,
        },
        settings: settings,
        exportDate: new Date().toISOString(),
      };

      const dataStr = JSON.stringify(exportData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);

      const link = document.createElement('a');
      link.href = url;
      link.download = `user-data-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success(isRTL ? 'تم تصدير البيانات بنجاح' : 'Data exported successfully');
    } catch (error) {
      console.error('Error exporting data:', error);
      toast.error(isRTL ? 'خطأ في تصدير البيانات' : 'Error exporting data');
    }
  };

  const clearCache = () => {
    localStorage.clear();
    sessionStorage.clear();
    toast.success(isRTL ? 'تم مسح التخزين المؤقت' : 'Cache cleared successfully');
  };

  const deleteAccount = async () => {
    if (!user) return;

    const confirmMessage = isRTL
      ? '⚠️ تحذير: هل أنت متأكد من حذف حسابك؟\n\nسيتم حذف جميع بياناتك نهائياً ولا يمكن استرجاعها!\n\nاكتب "DELETE" للتأكيد:'
      : '⚠️ Warning: Are you sure you want to delete your account?\n\nAll your data will be permanently deleted and cannot be recovered!\n\nType "DELETE" to confirm:';

    const confirmation = prompt(confirmMessage);

    if (confirmation === 'DELETE') {
      try {
        // Delete user data from Firestore
        await updateDoc(doc(db, 'users', user.uid), {
          deleted: true,
          deletedAt: serverTimestamp()
        });

        // Delete Firebase Auth account
        await user.delete();

        toast.success(isRTL ? 'تم حذف الحساب' : 'Account deleted');
        router.push(`/${lang}/`);
      } catch (error) {
        console.error('Error deleting account:', error);
        toast.error(isRTL ? 'خطأ في حذف الحساب' : 'Error deleting account');
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            {isRTL ? 'جاري تحميل الإعدادات...' : 'Loading settings...'}
          </h2>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 dark:from-gray-950 dark:via-background dark:to-blue-950 ${isRTL ? 'rtl' : 'ltr'}`} dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-4 rtl:space-x-reverse">
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.back()}
                className="flex items-center space-x-2 rtl:space-x-reverse"
              >
                <ArrowLeftIcon className={`h-4 w-4 ${isRTL ? 'rotate-180' : ''}`} />
                <span>{texts.back}</span>
              </Button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                  {texts.title}
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                  {texts.subtitle}
                </p>
              </div>
            </div>
            <Cog6ToothIcon className="h-8 w-8 text-blue-600" />
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-6 mb-8">
              <TabsTrigger value="profile" className="flex items-center space-x-2 rtl:space-x-reverse">
                <UserIcon className="h-4 w-4" />
                <span className="hidden sm:inline">{texts.profile}</span>
              </TabsTrigger>
              <TabsTrigger value="account" className="flex items-center space-x-2 rtl:space-x-reverse">
                <KeyIcon className="h-4 w-4" />
                <span className="hidden sm:inline">{texts.account}</span>
              </TabsTrigger>
              <TabsTrigger value="notifications" className="flex items-center space-x-2 rtl:space-x-reverse">
                <BellIcon className="h-4 w-4" />
                <span className="hidden sm:inline">{texts.notifications}</span>
              </TabsTrigger>
              <TabsTrigger value="privacy" className="flex items-center space-x-2 rtl:space-x-reverse">
                <ShieldCheckIcon className="h-4 w-4" />
                <span className="hidden sm:inline">{texts.privacy}</span>
              </TabsTrigger>
              <TabsTrigger value="display" className="flex items-center space-x-2 rtl:space-x-reverse">
                <PaintBrushIcon className="h-4 w-4" />
                <span className="hidden sm:inline">{texts.display}</span>
              </TabsTrigger>
              <TabsTrigger value="advanced" className="flex items-center space-x-2 rtl:space-x-reverse">
                <Cog6ToothIcon className="h-4 w-4" />
                <span className="hidden sm:inline">{texts.advanced}</span>
              </TabsTrigger>
            </TabsList>

            {/* Profile Tab */}
            <TabsContent value="profile" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2 rtl:space-x-reverse">
                    <UserIcon className="h-5 w-5" />
                    <span>{texts.profile}</span>
                  </CardTitle>
                  <CardDescription>
                    {isRTL ? 'إدارة معلومات ملفك الشخصي' : 'Manage your profile information'}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="displayName">{texts.displayName}</Label>
                      <Input
                        id="displayName"
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        placeholder={isRTL ? 'أدخل اسمك المعروض' : 'Enter your display name'}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">{texts.emailAddress}</Label>
                      <div className="flex items-center space-x-2 rtl:space-x-reverse">
                        <Input
                          id="email"
                          value={email}
                          disabled
                          className="flex-1"
                        />
                        {user?.emailVerified ? (
                          <Badge variant="default" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                            <CheckCircleIcon className="h-3 w-3 mr-1 rtl:ml-1 rtl:mr-0" />
                            {texts.emailVerified}
                          </Badge>
                        ) : (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={sendVerificationEmail}
                            className="whitespace-nowrap"
                          >
                            {texts.verifyEmail}
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>

                  <Button onClick={updateUserProfile} disabled={saving}>
                    {saving ? texts.saving : texts.updateProfile}
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Account Tab */}
            <TabsContent value="account" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2 rtl:space-x-reverse">
                    <KeyIcon className="h-5 w-5" />
                    <span>{texts.changePassword}</span>
                  </CardTitle>
                  <CardDescription>
                    {isRTL ? 'تغيير كلمة مرور حسابك' : 'Change your account password'}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="currentPassword">{texts.currentPassword}</Label>
                    <div className="relative">
                      <Input
                        id="currentPassword"
                        type={showPassword ? 'text' : 'password'}
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        placeholder={isRTL ? 'أدخل كلمة المرور الحالية' : 'Enter current password'}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeSlashIcon className="h-4 w-4" />
                        ) : (
                          <EyeIcon className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="newPassword">{texts.newPassword}</Label>
                    <div className="relative">
                      <Input
                        id="newPassword"
                        type={showNewPassword ? 'text' : 'password'}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder={isRTL ? 'أدخل كلمة المرور الجديدة' : 'Enter new password'}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                      >
                        {showNewPassword ? (
                          <EyeSlashIcon className="h-4 w-4" />
                        ) : (
                          <EyeIcon className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">{texts.confirmPassword}</Label>
                    <div className="relative">
                      <Input
                        id="confirmPassword"
                        type={showConfirmPassword ? 'text' : 'password'}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder={isRTL ? 'أكد كلمة المرور الجديدة' : 'Confirm new password'}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      >
                        {showConfirmPassword ? (
                          <EyeSlashIcon className="h-4 w-4" />
                        ) : (
                          <EyeIcon className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>

                  <Button
                    onClick={changePassword}
                    disabled={saving || !currentPassword || !newPassword || newPassword !== confirmPassword}
                  >
                    {saving ? texts.saving : texts.changePassword}
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Notifications Tab */}
            <TabsContent value="notifications" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2 rtl:space-x-reverse">
                    <BellIcon className="h-5 w-5" />
                    <span>{texts.notifications}</span>
                  </CardTitle>
                  <CardDescription>
                    {isRTL ? 'إدارة تفضيلات الإشعارات' : 'Manage your notification preferences'}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label className="text-base">{texts.emailNotifications}</Label>
                        <p className="text-sm text-muted-foreground">
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

                    <Separator />

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label className="text-base">{texts.pushNotifications}</Label>
                        <p className="text-sm text-muted-foreground">
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

                    <Separator />

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label className="text-base">{texts.testReminders}</Label>
                        <p className="text-sm text-muted-foreground">
                          {isRTL ? 'تذكيرات بالاختبارات المجدولة' : 'Reminders for scheduled tests'}
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

                    <Separator />

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label className="text-base">{texts.resultUpdates}</Label>
                        <p className="text-sm text-muted-foreground">
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

                    <Separator />

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label className="text-base">{texts.securityAlerts}</Label>
                        <p className="text-sm text-muted-foreground">
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
                </CardContent>
              </Card>
            </TabsContent>

            {/* Privacy Tab */}
            <TabsContent value="privacy" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2 rtl:space-x-reverse">
                    <ShieldCheckIcon className="h-5 w-5" />
                    <span>{texts.privacy}</span>
                  </CardTitle>
                  <CardDescription>
                    {isRTL ? 'إدارة إعدادات الخصوصية والأمان' : 'Manage your privacy and security settings'}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="space-y-3">
                      <Label className="text-base">{texts.profileVisibility}</Label>
                      <Select
                        value={settings.privacy.profileVisibility}
                        onValueChange={(value: 'public' | 'private') =>
                          setSettings(prev => ({
                            ...prev,
                            privacy: { ...prev.privacy, profileVisibility: value }
                          }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="public">{texts.public}</SelectItem>
                          <SelectItem value="private">{texts.private}</SelectItem>
                        </SelectContent>
                      </Select>
                      <p className="text-sm text-muted-foreground">
                        {isRTL ? 'تحديد من يمكنه رؤية ملفك الشخصي' : 'Control who can see your profile'}
                      </p>
                    </div>

                    <Separator />

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label className="text-base">{texts.shareResults}</Label>
                        <p className="text-sm text-muted-foreground">
                          {isRTL ? 'السماح بمشاركة نتائج اختباراتك' : 'Allow sharing of your test results'}
                        </p>
                      </div>
                      <Switch
                        checked={settings.privacy.shareResults}
                        onCheckedChange={(checked) =>
                          setSettings(prev => ({
                            ...prev,
                            privacy: { ...prev.privacy, shareResults: checked }
                          }))
                        }
                      />
                    </div>

                    <Separator />

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label className="text-base">{texts.analyticsOptOut}</Label>
                        <p className="text-sm text-muted-foreground">
                          {isRTL ? 'إلغاء الاشتراك في جمع البيانات التحليلية' : 'Opt out of analytics data collection'}
                        </p>
                      </div>
                      <Switch
                        checked={settings.privacy.analyticsOptOut}
                        onCheckedChange={(checked) =>
                          setSettings(prev => ({
                            ...prev,
                            privacy: { ...prev.privacy, analyticsOptOut: checked }
                          }))
                        }
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Display Tab */}
            <TabsContent value="display" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Theme Settings */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2 rtl:space-x-reverse">
                      <SunIcon className="h-5 w-5" />
                      <span>{texts.theme}</span>
                    </CardTitle>
                    <CardDescription>
                      {isRTL ? 'اختر مظهر التطبيق' : 'Choose app theme'}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { value: 'light', label: texts.light, icon: SunIcon },
                        { value: 'dark', label: texts.dark, icon: MoonIcon },
                        { value: 'system', label: texts.system, icon: DevicePhoneMobileIcon }
                      ].map((theme) => (
                        <button
                          key={theme.value}
                          onClick={() => setSettings(prev => ({ ...prev, theme: theme.value as any }))}
                          className={`p-4 rounded-lg border text-center transition-all ${
                            settings.theme === theme.value
                              ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                              : 'border-gray-300 dark:border-gray-600 hover:border-gray-400'
                          }`}
                        >
                          <theme.icon className="h-6 w-6 mx-auto mb-2" />
                          <div className="text-sm font-medium">{theme.label}</div>
                        </button>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Language Settings */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2 rtl:space-x-reverse">
                      <GlobeAltIcon className="h-5 w-5" />
                      <span>{texts.language}</span>
                    </CardTitle>
                    <CardDescription>
                      {isRTL ? 'اختر لغة التطبيق' : 'Choose app language'}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        onClick={() => handleLanguageChange('ar')}
                        className={`p-4 rounded-lg border text-center transition-all ${
                          settings.language === 'ar'
                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                            : 'border-gray-300 dark:border-gray-600 hover:border-gray-400'
                        }`}
                      >
                        <div className="text-2xl mb-2">🇸🇦</div>
                        <div className="font-medium">{texts.arabic}</div>
                      </button>
                      <button
                        onClick={() => handleLanguageChange('en')}
                        className={`p-4 rounded-lg border text-center transition-all ${
                          settings.language === 'en'
                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                            : 'border-gray-300 dark:border-gray-600 hover:border-gray-400'
                        }`}
                      >
                        <div className="text-2xl mb-2">🇺🇸</div>
                        <div className="font-medium">{texts.english}</div>
                      </button>
                    </div>
                  </CardContent>
                </Card>

                {/* Display Preferences */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2 rtl:space-x-reverse">
                      <PaintBrushIcon className="h-5 w-5" />
                      <span>{texts.display}</span>
                    </CardTitle>
                    <CardDescription>
                      {isRTL ? 'تخصيص تفضيلات العرض' : 'Customize display preferences'}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      <Label className="text-base">{texts.colorScheme}</Label>
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
                          <SelectItem value="default">{texts.default}</SelectItem>
                          <SelectItem value="colorblind">{texts.colorblind}</SelectItem>
                          <SelectItem value="high-contrast">{texts.highContrast}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-3">
                      <Label className="text-base">{texts.fontSize}</Label>
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
                          <SelectItem value="small">{texts.small}</SelectItem>
                          <SelectItem value="medium">{texts.medium}</SelectItem>
                          <SelectItem value="large">{texts.large}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label className="text-base">{texts.animations}</Label>
                        <p className="text-sm text-muted-foreground">
                          {isRTL ? 'تفعيل الحركات والانتقالات' : 'Enable animations and transitions'}
                        </p>
                      </div>
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
                      <div className="space-y-0.5">
                        <Label className="text-base">{texts.compactView}</Label>
                        <p className="text-sm text-muted-foreground">
                          {isRTL ? 'عرض أكثر كثافة للمحتوى' : 'More dense content display'}
                        </p>
                      </div>
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
                  </CardContent>
                </Card>

                {/* Test Preferences */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2 rtl:space-x-reverse">
                      <Cog6ToothIcon className="h-5 w-5" />
                      <span>{isRTL ? 'تفضيلات الاختبار' : 'Test Preferences'}</span>
                    </CardTitle>
                    <CardDescription>
                      {isRTL ? 'تخصيص سلوك الاختبارات' : 'Customize test behavior'}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      <Label className="text-base">{texts.defaultView}</Label>
                      <Select
                        value={settings.testPreferences.defaultView}
                        onValueChange={(value: 'grid' | 'list') =>
                          setSettings(prev => ({
                            ...prev,
                            testPreferences: { ...prev.testPreferences, defaultView: value }
                          }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="grid">{texts.grid}</SelectItem>
                          <SelectItem value="list">{texts.list}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label className="text-base">{texts.autoSave}</Label>
                        <p className="text-sm text-muted-foreground">
                          {isRTL ? 'حفظ النتائج تلقائياً' : 'Automatically save results'}
                        </p>
                      </div>
                      <Switch
                        checked={settings.testPreferences.autoSave}
                        onCheckedChange={(checked) =>
                          setSettings(prev => ({
                            ...prev,
                            testPreferences: { ...prev.testPreferences, autoSave: checked }
                          }))
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label className="text-base">{texts.showAdvanced}</Label>
                        <p className="text-sm text-muted-foreground">
                          {isRTL ? 'إظهار الخيارات المتقدمة' : 'Show advanced options'}
                        </p>
                      </div>
                      <Switch
                        checked={settings.testPreferences.showAdvanced}
                        onCheckedChange={(checked) =>
                          setSettings(prev => ({
                            ...prev,
                            testPreferences: { ...prev.testPreferences, showAdvanced: checked }
                          }))
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label className="text-base">{texts.showConfidence}</Label>
                        <p className="text-sm text-muted-foreground">
                          {isRTL ? 'عرض نسبة الثقة في النتائج' : 'Display confidence percentage in results'}
                        </p>
                      </div>
                      <Switch
                        checked={settings.testPreferences.showConfidence}
                        onCheckedChange={(checked) =>
                          setSettings(prev => ({
                            ...prev,
                            testPreferences: { ...prev.testPreferences, showConfidence: checked }
                          }))
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label className="text-base">{texts.confirmDelete}</Label>
                        <p className="text-sm text-muted-foreground">
                          {isRTL ? 'طلب تأكيد قبل الحذف' : 'Ask for confirmation before deleting'}
                        </p>
                      </div>
                      <Switch
                        checked={settings.testPreferences.confirmDelete}
                        onCheckedChange={(checked) =>
                          setSettings(prev => ({
                            ...prev,
                            testPreferences: { ...prev.testPreferences, confirmDelete: checked }
                          }))
                        }
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Appearance Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 rtl:space-x-reverse">
                  <SunIcon className="h-5 w-5" />
                  <span>{isRTL ? 'المظهر' : 'Appearance'}</span>
                </CardTitle>
                <CardDescription>
                  {isRTL ? 'تخصيص مظهر التطبيق' : 'Customize the app appearance'}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    {isRTL ? 'المظهر' : 'Theme'}
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { value: 'light', label: isRTL ? 'فاتح' : 'Light', icon: SunIcon },
                      { value: 'dark', label: isRTL ? 'داكن' : 'Dark', icon: MoonIcon },
                      { value: 'system', label: isRTL ? 'النظام' : 'System', icon: Cog6ToothIcon }
                    ].map((theme) => (
                      <button
                        key={theme.value}
                        onClick={() => setSettings(prev => ({ ...prev, theme: theme.value as any }))}
                        className={`p-3 rounded-lg border text-center transition-all ${
                          settings.theme === theme.value
                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                            : 'border-gray-300 dark:border-gray-600 hover:border-gray-400'
                        }`}
                      >
                        <theme.icon className="h-5 w-5 mx-auto mb-1" />
                        <div className="text-xs">{theme.label}</div>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium">
                      {isRTL ? 'العرض المضغوط' : 'Compact View'}
                    </label>
                    <p className="text-xs text-gray-500">
                      {isRTL ? 'عرض أكثر كثافة للمحتوى' : 'More dense content display'}
                    </p>
                  </div>
                  <button
                    onClick={() => setSettings(prev => ({ ...prev, compactView: !prev.compactView }))}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      settings.compactView ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        settings.compactView ? 'translate-x-6 rtl:-translate-x-6' : 'translate-x-1 rtl:-translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </CardContent>
            </Card>

            {/* Language Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 rtl:space-x-reverse">
                  <LanguageIcon className="h-5 w-5" />
                  <span>{isRTL ? 'اللغة' : 'Language'}</span>
                </CardTitle>
                <CardDescription>
                  {isRTL ? 'اختر لغة التطبيق' : 'Choose app language'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => handleLanguageChange('ar')}
                    className={`p-4 rounded-lg border text-center transition-all ${
                      settings.language === 'ar'
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                        : 'border-gray-300 dark:border-gray-600 hover:border-gray-400'
                    }`}
                  >
                    <div className="text-2xl mb-2">🇸🇦</div>
                    <div className="font-medium">العربية</div>
                    <div className="text-xs text-gray-500">Arabic</div>
                  </button>
                  <button
                    onClick={() => handleLanguageChange('en')}
                    className={`p-4 rounded-lg border text-center transition-all ${
                      settings.language === 'en'
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                        : 'border-gray-300 dark:border-gray-600 hover:border-gray-400'
                    }`}
                  >
                    <div className="text-2xl mb-2">🇺🇸</div>
                    <div className="font-medium">English</div>
                    <div className="text-xs text-gray-500">الإنجليزية</div>
                  </button>
                </div>
              </CardContent>
            </Card>

            {/* Test Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 rtl:space-x-reverse">
                  <ShieldCheckIcon className="h-5 w-5" />
                  <span>{isRTL ? 'إعدادات الاختبار' : 'Test Settings'}</span>
                </CardTitle>
                <CardDescription>
                  {isRTL ? 'تخصيص سلوك الاختبارات' : 'Customize test behavior'}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium">
                      {isRTL ? 'الحفظ التلقائي' : 'Auto Save'}
                    </label>
                    <p className="text-xs text-gray-500">
                      {isRTL ? 'حفظ النتائج تلقائياً' : 'Automatically save results'}
                    </p>
                  </div>
                  <button
                    onClick={() => setSettings(prev => ({ ...prev, autoSave: !prev.autoSave }))}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      settings.autoSave ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        settings.autoSave ? 'translate-x-6 rtl:-translate-x-6' : 'translate-x-1 rtl:-translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium">
                      {isRTL ? 'إظهار مستوى الثقة' : 'Show Confidence Level'}
                    </label>
                    <p className="text-xs text-gray-500">
                      {isRTL ? 'عرض نسبة الثقة في النتائج' : 'Display confidence percentage in results'}
                    </p>
                  </div>
                  <button
                    onClick={() => setSettings(prev => ({ ...prev, showConfidence: !prev.showConfidence }))}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      settings.showConfidence ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        settings.showConfidence ? 'translate-x-6 rtl:-translate-x-6' : 'translate-x-1 rtl:-translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </CardContent>
            </Card>

            {/* Notifications */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 rtl:space-x-reverse">
                  <BellIcon className="h-5 w-5" />
                  <span>{isRTL ? 'الإشعارات' : 'Notifications'}</span>
                </CardTitle>
                <CardDescription>
                  {isRTL ? 'إدارة إشعارات التطبيق' : 'Manage app notifications'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium">
                      {isRTL ? 'تفعيل الإشعارات' : 'Enable Notifications'}
                    </label>
                    <p className="text-xs text-gray-500">
                      {isRTL ? 'تلقي إشعارات حول النتائج والتحديثات' : 'Receive notifications about results and updates'}
                    </p>
                  </div>
                  <button
                    onClick={() => setSettings(prev => ({ ...prev, notifications: !prev.notifications }))}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      settings.notifications ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        settings.notifications ? 'translate-x-6 rtl:-translate-x-6' : 'translate-x-1 rtl:-translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Advanced Settings */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 rtl:space-x-reverse">
                <Cog6ToothIcon className="h-5 w-5" />
                <span>{isRTL ? 'الإعدادات المتقدمة' : 'Advanced Settings'}</span>
              </CardTitle>
              <CardDescription>
                {isRTL ? 'إدارة البيانات والإعدادات المتقدمة' : 'Manage data and advanced settings'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Button variant="outline" className="w-full">
                  <CloudArrowUpIcon className="h-4 w-4 mr-2 rtl:ml-2 rtl:mr-0" />
                  {isRTL ? 'تصدير البيانات' : 'Export Data'}
                </Button>

                <Button variant="outline" className="w-full">
                  <TrashIcon className="h-4 w-4 mr-2 rtl:ml-2 rtl:mr-0" />
                  {isRTL ? 'مسح التخزين المؤقت' : 'Clear Cache'}
                </Button>

                <Button variant="destructive" className="w-full">
                  <ExclamationTriangleIcon className="h-4 w-4 mr-2 rtl:ml-2 rtl:mr-0" />
                  {isRTL ? 'حذف الحساب' : 'Delete Account'}
                </Button>
              </div>
            </CardContent>
          </Card>
          </Tabs>

          {/* Save Button */}
          <div className="mt-8 flex justify-center">
            <Button
              onClick={saveSettings}
              className="px-8 py-3 text-lg"
            >
              <CheckIcon className="h-5 w-5 mr-2 rtl:ml-2 rtl:mr-0" />
              {isRTL ? 'حفظ الإعدادات' : 'Save Settings'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
