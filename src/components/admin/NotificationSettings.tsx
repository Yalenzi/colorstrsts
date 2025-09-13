'use client';

import { useState, useEffect } from 'react';
import { Language } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { db } from '@/lib/firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import toast from 'react-hot-toast';
import {
  BellIcon,
  EnvelopeIcon,
  DevicePhoneMobileIcon,
  SpeakerWaveIcon,
  ClockIcon,
  UserGroupIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  InformationCircleIcon,
  ArrowPathIcon,
  PaperAirplaneIcon
} from '@heroicons/react/24/outline';

interface NotificationTemplate {
  id: string;
  name: string;
  name_ar: string;
  subject: string;
  subject_ar: string;
  content: string;
  content_ar: string;
  type: 'email' | 'sms' | 'push';
  enabled: boolean;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  variables: string[];
}

interface NotificationSettings {
  // Email Settings
  emailEnabled: boolean;
  emailProvider: 'smtp' | 'sendgrid' | 'mailgun';
  smtpHost: string;
  smtpPort: number;
  smtpUser: string;
  smtpPassword: string;
  fromEmail: string;
  fromName: string;
  
  // SMS Settings
  smsEnabled: boolean;
  smsProvider: 'twilio' | 'nexmo' | 'custom';
  smsApiKey: string;
  smsApiSecret: string;
  smsFromNumber: string;
  
  // Push Notification Settings
  pushEnabled: boolean;
  firebaseServerKey: string;
  vapidPublicKey: string;
  vapidPrivateKey: string;
  
  // Notification Triggers
  triggers: {
    userRegistration: boolean;
    testCompletion: boolean;
    subscriptionExpiry: boolean;
    paymentSuccess: boolean;
    paymentFailure: boolean;
    systemMaintenance: boolean;
    securityAlert: boolean;
    dataBackup: boolean;
    systemError: boolean;
    lowStorage: boolean;
    highTraffic: boolean;
  };
  
  // Scheduling
  quietHours: {
    enabled: boolean;
    startTime: string;
    endTime: string;
    timezone: string;
  };
  
  // Rate Limiting
  rateLimiting: {
    enabled: boolean;
    maxEmailsPerHour: number;
    maxSmsPerHour: number;
    maxPushPerHour: number;
  };
  
  // Templates
  templates: NotificationTemplate[];
}

interface NotificationSettingsProps {
  lang: Language;
}

export function NotificationSettings({ lang }: NotificationSettingsProps) {
  const [settings, setSettings] = useState<NotificationSettings>({
    emailEnabled: true,
    emailProvider: 'smtp',
    smtpHost: '',
    smtpPort: 587,
    smtpUser: '',
    smtpPassword: '',
    fromEmail: 'noreply@colorstest.com',
    fromName: 'ColorTest System',
    smsEnabled: false,
    smsProvider: 'twilio',
    smsApiKey: '',
    smsApiSecret: '',
    smsFromNumber: '',
    pushEnabled: true,
    firebaseServerKey: '',
    vapidPublicKey: '',
    vapidPrivateKey: '',
    triggers: {
      userRegistration: true,
      testCompletion: true,
      subscriptionExpiry: true,
      paymentSuccess: true,
      paymentFailure: true,
      systemMaintenance: true,
      securityAlert: true,
      dataBackup: true,
      systemError: true,
      lowStorage: false,
      highTraffic: false
    },
    quietHours: {
      enabled: false,
      startTime: '22:00',
      endTime: '08:00',
      timezone: 'Asia/Riyadh'
    },
    rateLimiting: {
      enabled: true,
      maxEmailsPerHour: 100,
      maxSmsPerHour: 50,
      maxPushPerHour: 200
    },
    templates: []
  });

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [testingEmail, setTestingEmail] = useState(false);
  const [testEmail, setTestEmail] = useState('');

  const isRTL = lang === 'ar';

  const texts = {
    title: isRTL ? 'إعدادات الإشعارات' : 'Notification Settings',
    subtitle: isRTL ? 'إدارة إشعارات البريد الإلكتروني والرسائل النصية والإشعارات الفورية' : 'Manage email, SMS, and push notifications',
    
    // Tabs
    email: isRTL ? 'البريد الإلكتروني' : 'Email',
    sms: isRTL ? 'الرسائل النصية' : 'SMS',
    push: isRTL ? 'الإشعارات الفورية' : 'Push Notifications',
    triggers: isRTL ? 'المحفزات' : 'Triggers',
    templates: isRTL ? 'القوالب' : 'Templates',
    scheduling: isRTL ? 'الجدولة' : 'Scheduling',
    
    // Email Settings
    emailEnabled: isRTL ? 'تفعيل البريد الإلكتروني' : 'Enable Email',
    emailProvider: isRTL ? 'مزود البريد الإلكتروني' : 'Email Provider',
    smtpHost: isRTL ? 'خادم SMTP' : 'SMTP Host',
    smtpPort: isRTL ? 'منفذ SMTP' : 'SMTP Port',
    smtpUser: isRTL ? 'مستخدم SMTP' : 'SMTP User',
    smtpPassword: isRTL ? 'كلمة مرور SMTP' : 'SMTP Password',
    fromEmail: isRTL ? 'البريد المرسل' : 'From Email',
    fromName: isRTL ? 'اسم المرسل' : 'From Name',
    
    // SMS Settings
    smsEnabled: isRTL ? 'تفعيل الرسائل النصية' : 'Enable SMS',
    smsProvider: isRTL ? 'مزود الرسائل النصية' : 'SMS Provider',
    smsApiKey: isRTL ? 'مفتاح API للرسائل' : 'SMS API Key',
    smsApiSecret: isRTL ? 'سر API للرسائل' : 'SMS API Secret',
    smsFromNumber: isRTL ? 'رقم المرسل' : 'From Number',
    
    // Push Settings
    pushEnabled: isRTL ? 'تفعيل الإشعارات الفورية' : 'Enable Push Notifications',
    firebaseServerKey: isRTL ? 'مفتاح خادم Firebase' : 'Firebase Server Key',
    vapidPublicKey: isRTL ? 'مفتاح VAPID العام' : 'VAPID Public Key',
    vapidPrivateKey: isRTL ? 'مفتاح VAPID الخاص' : 'VAPID Private Key',
    
    // Triggers
    userRegistration: isRTL ? 'تسجيل المستخدم' : 'User Registration',
    testCompletion: isRTL ? 'إكمال الاختبار' : 'Test Completion',
    subscriptionExpiry: isRTL ? 'انتهاء الاشتراك' : 'Subscription Expiry',
    paymentSuccess: isRTL ? 'نجاح الدفع' : 'Payment Success',
    paymentFailure: isRTL ? 'فشل الدفع' : 'Payment Failure',
    systemMaintenance: isRTL ? 'صيانة النظام' : 'System Maintenance',
    securityAlert: isRTL ? 'تنبيه أمني' : 'Security Alert',
    
    // Scheduling
    quietHours: isRTL ? 'ساعات الهدوء' : 'Quiet Hours',
    quietHoursEnabled: isRTL ? 'تفعيل ساعات الهدوء' : 'Enable Quiet Hours',
    startTime: isRTL ? 'وقت البداية' : 'Start Time',
    endTime: isRTL ? 'وقت النهاية' : 'End Time',
    timezone: isRTL ? 'المنطقة الزمنية' : 'Timezone',
    
    // Rate Limiting
    rateLimiting: isRTL ? 'تحديد المعدل' : 'Rate Limiting',
    rateLimitingEnabled: isRTL ? 'تفعيل تحديد المعدل' : 'Enable Rate Limiting',
    maxEmailsPerHour: isRTL ? 'الحد الأقصى للإيميلات في الساعة' : 'Max Emails Per Hour',
    maxSmsPerHour: isRTL ? 'الحد الأقصى للرسائل في الساعة' : 'Max SMS Per Hour',
    maxPushPerHour: isRTL ? 'الحد الأقصى للإشعارات في الساعة' : 'Max Push Per Hour',
    
    // Actions
    save: isRTL ? 'حفظ' : 'Save',
    test: isRTL ? 'اختبار' : 'Test',
    testEmail: isRTL ? 'اختبار البريد الإلكتروني' : 'Test Email',
    sendTestEmail: isRTL ? 'إرسال بريد تجريبي' : 'Send Test Email',
    
    // Messages
    saving: isRTL ? 'جاري الحفظ...' : 'Saving...',
    saved: isRTL ? 'تم الحفظ بنجاح' : 'Settings saved successfully',
    error: isRTL ? 'حدث خطأ' : 'An error occurred',
    testEmailSent: isRTL ? 'تم إرسال البريد التجريبي' : 'Test email sent successfully',
    
    // Descriptions
    emailDesc: isRTL ? 'إعدادات إرسال الإشعارات عبر البريد الإلكتروني' : 'Configure email notification delivery',
    smsDesc: isRTL ? 'إعدادات إرسال الرسائل النصية' : 'Configure SMS message delivery',
    pushDesc: isRTL ? 'إعدادات الإشعارات الفورية للمتصفح والتطبيق' : 'Configure browser and app push notifications',
    quietHoursDesc: isRTL ? 'منع إرسال الإشعارات خلال ساعات محددة' : 'Prevent notifications during specified hours',
    rateLimitingDesc: isRTL ? 'تحديد عدد الإشعارات المرسلة في الساعة' : 'Limit the number of notifications sent per hour',
  };

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const settingsRef = doc(db, 'settings', 'notifications');
      const settingsDoc = await getDoc(settingsRef);
      
      if (settingsDoc.exists()) {
        const data = settingsDoc.data();
        setSettings(prev => ({ ...prev, ...data }));
      }
    } catch (error) {
      console.error('Error loading notification settings:', error);
      toast.error(texts.error);
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    try {
      setSaving(true);
      const settingsRef = doc(db, 'settings', 'notifications');
      
      await setDoc(settingsRef, {
        ...settings,
        updatedAt: new Date().toISOString(),
        createdAt: new Date().toISOString()
      }, { merge: true });
      
      toast.success(texts.saved);
    } catch (error) {
      console.error('Error saving notification settings:', error);
      toast.error(texts.error);
    } finally {
      setSaving(false);
    }
  };

  const sendTestEmail = async () => {
    if (!testEmail) {
      toast.error(isRTL ? 'يرجى إدخال بريد إلكتروني للاختبار' : 'Please enter a test email address');
      return;
    }

    try {
      setTestingEmail(true);
      // Simulate sending test email
      await new Promise(resolve => setTimeout(resolve, 2000));
      toast.success(texts.testEmailSent);
    } catch (error) {
      toast.error(texts.error);
    } finally {
      setTestingEmail(false);
    }
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
        <Button onClick={saveSettings} disabled={saving}>
          {saving ? (
            <ArrowPathIcon className="h-4 w-4 mr-2 rtl:ml-2 rtl:mr-0 animate-spin" />
          ) : (
            <CheckCircleIcon className="h-4 w-4 mr-2 rtl:ml-2 rtl:mr-0" />
          )}
          {saving ? texts.saving : texts.save}
        </Button>
      </div>

      {/* Notification Settings Tabs */}
      <Tabs defaultValue="email" className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="email">{texts.email}</TabsTrigger>
          <TabsTrigger value="sms">{texts.sms}</TabsTrigger>
          <TabsTrigger value="push">{texts.push}</TabsTrigger>
          <TabsTrigger value="triggers">{texts.triggers}</TabsTrigger>
          <TabsTrigger value="scheduling">{texts.scheduling}</TabsTrigger>
          <TabsTrigger value="templates">{texts.templates}</TabsTrigger>
        </TabsList>

        {/* Email Settings */}
        <TabsContent value="email">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 rtl:space-x-reverse">
                <EnvelopeIcon className="h-5 w-5" />
                <span>{texts.email}</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base font-medium">{texts.emailEnabled}</Label>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {texts.emailDesc}
                  </p>
                </div>
                <Switch
                  checked={settings.emailEnabled}
                  onCheckedChange={(checked) =>
                    setSettings(prev => ({ ...prev, emailEnabled: checked }))
                  }
                />
              </div>

              {settings.emailEnabled && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="fromEmail">{texts.fromEmail}</Label>
                      <Input
                        id="fromEmail"
                        type="email"
                        value={settings.fromEmail}
                        onChange={(e) => setSettings(prev => ({ ...prev, fromEmail: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="fromName">{texts.fromName}</Label>
                      <Input
                        id="fromName"
                        value={settings.fromName}
                        onChange={(e) => setSettings(prev => ({ ...prev, fromName: e.target.value }))}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="smtpHost">{texts.smtpHost}</Label>
                      <Input
                        id="smtpHost"
                        value={settings.smtpHost}
                        onChange={(e) => setSettings(prev => ({ ...prev, smtpHost: e.target.value }))}
                        placeholder="smtp.gmail.com"
                      />
                    </div>
                    <div>
                      <Label htmlFor="smtpPort">{texts.smtpPort}</Label>
                      <Input
                        id="smtpPort"
                        type="number"
                        value={settings.smtpPort}
                        onChange={(e) => setSettings(prev => ({ ...prev, smtpPort: parseInt(e.target.value) || 587 }))}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="smtpUser">{texts.smtpUser}</Label>
                      <Input
                        id="smtpUser"
                        value={settings.smtpUser}
                        onChange={(e) => setSettings(prev => ({ ...prev, smtpUser: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="smtpPassword">{texts.smtpPassword}</Label>
                      <Input
                        id="smtpPassword"
                        type="password"
                        value={settings.smtpPassword}
                        onChange={(e) => setSettings(prev => ({ ...prev, smtpPassword: e.target.value }))}
                      />
                    </div>
                  </div>

                  {/* Test Email */}
                  <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                    <Label className="text-base font-medium">{texts.testEmail}</Label>
                    <div className="flex space-x-2 rtl:space-x-reverse mt-2">
                      <Input
                        value={testEmail}
                        onChange={(e) => setTestEmail(e.target.value)}
                        placeholder={isRTL ? 'أدخل بريد إلكتروني للاختبار' : 'Enter test email address'}
                        type="email"
                      />
                      <Button onClick={sendTestEmail} disabled={testingEmail}>
                        {testingEmail ? (
                          <ArrowPathIcon className="h-4 w-4 animate-spin" />
                        ) : (
                          <PaperAirplaneIcon className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* SMS Settings */}
        <TabsContent value="sms">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 rtl:space-x-reverse">
                <DevicePhoneMobileIcon className="h-5 w-5" />
                <span>{texts.sms}</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base font-medium">{texts.smsEnabled}</Label>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {texts.smsDesc}
                  </p>
                </div>
                <Switch
                  checked={settings.smsEnabled}
                  onCheckedChange={(checked) =>
                    setSettings(prev => ({ ...prev, smsEnabled: checked }))
                  }
                />
              </div>

              {settings.smsEnabled && (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="smsProvider">{texts.smsProvider}</Label>
                    <Select
                      value={settings.smsProvider}
                      onValueChange={(value: 'twilio' | 'nexmo' | 'custom') =>
                        setSettings(prev => ({ ...prev, smsProvider: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="twilio">Twilio</SelectItem>
                        <SelectItem value="nexmo">Vonage (Nexmo)</SelectItem>
                        <SelectItem value="custom">{isRTL ? 'مخصص' : 'Custom'}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="smsApiKey">{texts.smsApiKey}</Label>
                      <Input
                        id="smsApiKey"
                        type="password"
                        value={settings.smsApiKey}
                        onChange={(e) => setSettings(prev => ({ ...prev, smsApiKey: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="smsApiSecret">{texts.smsApiSecret}</Label>
                      <Input
                        id="smsApiSecret"
                        type="password"
                        value={settings.smsApiSecret}
                        onChange={(e) => setSettings(prev => ({ ...prev, smsApiSecret: e.target.value }))}
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="smsFromNumber">{texts.smsFromNumber}</Label>
                    <Input
                      id="smsFromNumber"
                      value={settings.smsFromNumber}
                      onChange={(e) => setSettings(prev => ({ ...prev, smsFromNumber: e.target.value }))}
                      placeholder="+1234567890"
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Push Notifications */}
        <TabsContent value="push">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 rtl:space-x-reverse">
                <BellIcon className="h-5 w-5" />
                <span>{texts.push}</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base font-medium">{texts.pushEnabled}</Label>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {texts.pushDesc}
                  </p>
                </div>
                <Switch
                  checked={settings.pushEnabled}
                  onCheckedChange={(checked) =>
                    setSettings(prev => ({ ...prev, pushEnabled: checked }))
                  }
                />
              </div>

              {settings.pushEnabled && (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="firebaseServerKey">{texts.firebaseServerKey}</Label>
                    <Input
                      id="firebaseServerKey"
                      type="password"
                      value={settings.firebaseServerKey}
                      onChange={(e) => setSettings(prev => ({ ...prev, firebaseServerKey: e.target.value }))}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="vapidPublicKey">{texts.vapidPublicKey}</Label>
                      <Input
                        id="vapidPublicKey"
                        value={settings.vapidPublicKey}
                        onChange={(e) => setSettings(prev => ({ ...prev, vapidPublicKey: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="vapidPrivateKey">{texts.vapidPrivateKey}</Label>
                      <Input
                        id="vapidPrivateKey"
                        type="password"
                        value={settings.vapidPrivateKey}
                        onChange={(e) => setSettings(prev => ({ ...prev, vapidPrivateKey: e.target.value }))}
                      />
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notification Triggers */}
        <TabsContent value="triggers">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 rtl:space-x-reverse">
                <SpeakerWaveIcon className="h-5 w-5" />
                <span>{texts.triggers}</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {Object.entries(settings.triggers).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between">
                  <Label className="text-base font-medium">
                    {texts[key as keyof typeof texts] || key}
                  </Label>
                  <Switch
                    checked={value}
                    onCheckedChange={(checked) =>
                      setSettings(prev => ({
                        ...prev,
                        triggers: { ...prev.triggers, [key]: checked }
                      }))
                    }
                  />
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Scheduling */}
        <TabsContent value="scheduling">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 rtl:space-x-reverse">
                <ClockIcon className="h-5 w-5" />
                <span>{texts.scheduling}</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Quiet Hours */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base font-medium">{texts.quietHours}</Label>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {texts.quietHoursDesc}
                    </p>
                  </div>
                  <Switch
                    checked={settings.quietHours.enabled}
                    onCheckedChange={(checked) =>
                      setSettings(prev => ({
                        ...prev,
                        quietHours: { ...prev.quietHours, enabled: checked }
                      }))
                    }
                  />
                </div>

                {settings.quietHours.enabled && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="startTime">{texts.startTime}</Label>
                      <Input
                        id="startTime"
                        type="time"
                        value={settings.quietHours.startTime}
                        onChange={(e) => setSettings(prev => ({
                          ...prev,
                          quietHours: { ...prev.quietHours, startTime: e.target.value }
                        }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="endTime">{texts.endTime}</Label>
                      <Input
                        id="endTime"
                        type="time"
                        value={settings.quietHours.endTime}
                        onChange={(e) => setSettings(prev => ({
                          ...prev,
                          quietHours: { ...prev.quietHours, endTime: e.target.value }
                        }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="timezone">{texts.timezone}</Label>
                      <Select
                        value={settings.quietHours.timezone}
                        onValueChange={(value) =>
                          setSettings(prev => ({
                            ...prev,
                            quietHours: { ...prev.quietHours, timezone: value }
                          }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Asia/Riyadh">Asia/Riyadh</SelectItem>
                          <SelectItem value="UTC">UTC</SelectItem>
                          <SelectItem value="America/New_York">America/New_York</SelectItem>
                          <SelectItem value="Europe/London">Europe/London</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                )}
              </div>

              {/* Rate Limiting */}
              <div className="space-y-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base font-medium">{texts.rateLimiting}</Label>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {texts.rateLimitingDesc}
                    </p>
                  </div>
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
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="maxEmailsPerHour">{texts.maxEmailsPerHour}</Label>
                      <Input
                        id="maxEmailsPerHour"
                        type="number"
                        value={settings.rateLimiting.maxEmailsPerHour}
                        onChange={(e) => setSettings(prev => ({
                          ...prev,
                          rateLimiting: { 
                            ...prev.rateLimiting, 
                            maxEmailsPerHour: parseInt(e.target.value) || 100 
                          }
                        }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="maxSmsPerHour">{texts.maxSmsPerHour}</Label>
                      <Input
                        id="maxSmsPerHour"
                        type="number"
                        value={settings.rateLimiting.maxSmsPerHour}
                        onChange={(e) => setSettings(prev => ({
                          ...prev,
                          rateLimiting: { 
                            ...prev.rateLimiting, 
                            maxSmsPerHour: parseInt(e.target.value) || 50 
                          }
                        }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="maxPushPerHour">{texts.maxPushPerHour}</Label>
                      <Input
                        id="maxPushPerHour"
                        type="number"
                        value={settings.rateLimiting.maxPushPerHour}
                        onChange={(e) => setSettings(prev => ({
                          ...prev,
                          rateLimiting: { 
                            ...prev.rateLimiting, 
                            maxPushPerHour: parseInt(e.target.value) || 200 
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

        {/* Templates */}
        <TabsContent value="templates">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center space-x-2 rtl:space-x-reverse">
                  <UserGroupIcon className="h-5 w-5" />
                  <span>{texts.templates}</span>
                </div>
                <Button variant="outline">
                  {isRTL ? 'إضافة قالب' : 'Add Template'}
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <InformationCircleIcon className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-600 dark:text-gray-400">
                  {isRTL ? 'لا توجد قوالب إشعارات حالياً' : 'No notification templates available'}
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
