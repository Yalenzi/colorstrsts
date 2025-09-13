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
  ShieldCheckIcon,
  KeyIcon,
  LockClosedIcon,
  ExclamationTriangleIcon,
  EyeIcon,
  ComputerDesktopIcon,
  ClockIcon,
  UserGroupIcon,
  CheckCircleIcon,
  InformationCircleIcon,
  ArrowPathIcon,
  BellIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline';

interface SecurityAuditLog {
  id: string;
  timestamp: string;
  event: string;
  user: string;
  ip: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  details: string;
}

interface SecuritySettings {
  // Authentication Policies
  authentication: {
    requireEmailVerification: boolean;
    twoFactorEnabled: boolean;
    passwordMinLength: number;
    passwordRequireUppercase: boolean;
    passwordRequireLowercase: boolean;
    passwordRequireNumbers: boolean;
    passwordRequireSymbols: boolean;
    passwordExpirationDays: number;
    maxLoginAttempts: number;
    lockoutDuration: number; // in minutes
    sessionTimeout: number; // in minutes
  };
  
  // Two-Factor Authentication
  twoFactor: {
    enabled: boolean;
    required: boolean;
    methods: {
      sms: boolean;
      email: boolean;
      authenticator: boolean;
    };
    backupCodes: boolean;
  };
  
  // IP Security
  ipSecurity: {
    whitelistEnabled: boolean;
    whitelist: string[];
    blacklistEnabled: boolean;
    blacklist: string[];
    geoBlocking: {
      enabled: boolean;
      allowedCountries: string[];
      blockedCountries: string[];
    };
  };
  
  // Rate Limiting & DDoS Protection
  rateLimiting: {
    enabled: boolean;
    requestsPerMinute: number;
    requestsPerHour: number;
    requestsPerDay: number;
    ddosProtection: boolean;
    captchaThreshold: number;
  };
  
  // Security Monitoring
  monitoring: {
    enabled: boolean;
    logFailedLogins: boolean;
    logSuccessfulLogins: boolean;
    logAdminActions: boolean;
    logDataChanges: boolean;
    alertOnSuspiciousActivity: boolean;
    alertEmails: string[];
  };
  
  // Data Protection
  dataProtection: {
    encryptionEnabled: boolean;
    encryptionAlgorithm: string;
    dataRetentionDays: number;
    anonymizeData: boolean;
    gdprCompliance: boolean;
    rightToBeForgotten: boolean;
  };
  
  // API Security
  apiSecurity: {
    requireApiKey: boolean;
    apiKeyRotationDays: number;
    corsEnabled: boolean;
    allowedOrigins: string[];
    rateLimitPerApiKey: number;
  };
}

interface SecuritySettingsProps {
  lang: Language;
}

export function SecuritySettings({ lang }: SecuritySettingsProps) {
  const [settings, setSettings] = useState<SecuritySettings>({
    authentication: {
      requireEmailVerification: true,
      twoFactorEnabled: true,
      passwordMinLength: 8,
      passwordRequireUppercase: true,
      passwordRequireLowercase: true,
      passwordRequireNumbers: true,
      passwordRequireSymbols: false,
      passwordExpirationDays: 90,
      maxLoginAttempts: 5,
      lockoutDuration: 15,
      sessionTimeout: 60
    },
    twoFactor: {
      enabled: true,
      required: false,
      methods: {
        sms: true,
        email: true,
        authenticator: true
      },
      backupCodes: true
    },
    ipSecurity: {
      whitelistEnabled: false,
      whitelist: [],
      blacklistEnabled: true,
      blacklist: [],
      geoBlocking: {
        enabled: false,
        allowedCountries: ['SA', 'AE', 'KW', 'QA', 'BH', 'OM'],
        blockedCountries: []
      }
    },
    rateLimiting: {
      enabled: true,
      requestsPerMinute: 60,
      requestsPerHour: 1000,
      requestsPerDay: 10000,
      ddosProtection: true,
      captchaThreshold: 5
    },
    monitoring: {
      enabled: true,
      logFailedLogins: true,
      logSuccessfulLogins: false,
      logAdminActions: true,
      logDataChanges: true,
      alertOnSuspiciousActivity: true,
      alertEmails: ['admin@colorstest.com']
    },
    dataProtection: {
      encryptionEnabled: true,
      encryptionAlgorithm: 'AES-256',
      dataRetentionDays: 365,
      anonymizeData: true,
      gdprCompliance: true,
      rightToBeForgotten: true
    },
    apiSecurity: {
      requireApiKey: true,
      apiKeyRotationDays: 30,
      corsEnabled: true,
      allowedOrigins: ['https://colorstest.com'],
      rateLimitPerApiKey: 1000
    }
  });

  const [auditLogs, setAuditLogs] = useState<SecurityAuditLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const isRTL = lang === 'ar';

  const texts = {
    title: isRTL ? 'إعدادات الأمان' : 'Security Settings',
    subtitle: isRTL ? 'إدارة أمان النظام والحماية من التهديدات' : 'Manage system security and threat protection',
    
    // Tabs
    authentication: isRTL ? 'المصادقة' : 'Authentication',
    twoFactor: isRTL ? 'المصادقة الثنائية' : 'Two-Factor Auth',
    ipSecurity: isRTL ? 'أمان IP' : 'IP Security',
    rateLimiting: isRTL ? 'تحديد المعدل' : 'Rate Limiting',
    monitoring: isRTL ? 'المراقبة' : 'Monitoring',
    dataProtection: isRTL ? 'حماية البيانات' : 'Data Protection',
    apiSecurity: isRTL ? 'أمان API' : 'API Security',
    auditLogs: isRTL ? 'سجلات التدقيق' : 'Audit Logs',
    
    // Authentication
    requireEmailVerification: isRTL ? 'تأكيد البريد الإلكتروني مطلوب' : 'Require Email Verification',
    passwordMinLength: isRTL ? 'الحد الأدنى لطول كلمة المرور' : 'Password Min Length',
    passwordRequireUppercase: isRTL ? 'تتطلب أحرف كبيرة' : 'Require Uppercase',
    passwordRequireLowercase: isRTL ? 'تتطلب أحرف صغيرة' : 'Require Lowercase',
    passwordRequireNumbers: isRTL ? 'تتطلب أرقام' : 'Require Numbers',
    passwordRequireSymbols: isRTL ? 'تتطلب رموز' : 'Require Symbols',
    passwordExpirationDays: isRTL ? 'انتهاء صلاحية كلمة المرور (أيام)' : 'Password Expiration (days)',
    maxLoginAttempts: isRTL ? 'الحد الأقصى لمحاولات تسجيل الدخول' : 'Max Login Attempts',
    lockoutDuration: isRTL ? 'مدة القفل (دقائق)' : 'Lockout Duration (minutes)',
    sessionTimeout: isRTL ? 'انتهاء الجلسة (دقائق)' : 'Session Timeout (minutes)',
    
    // Two-Factor Authentication
    twoFactorEnabled: isRTL ? 'تفعيل المصادقة الثنائية' : 'Enable Two-Factor Auth',
    twoFactorRequired: isRTL ? 'المصادقة الثنائية مطلوبة' : 'Two-Factor Required',
    smsMethod: isRTL ? 'طريقة SMS' : 'SMS Method',
    emailMethod: isRTL ? 'طريقة البريد الإلكتروني' : 'Email Method',
    authenticatorMethod: isRTL ? 'تطبيق المصادقة' : 'Authenticator App',
    backupCodes: isRTL ? 'رموز النسخ الاحتياطي' : 'Backup Codes',
    
    // IP Security
    whitelistEnabled: isRTL ? 'تفعيل القائمة البيضاء' : 'Enable Whitelist',
    blacklistEnabled: isRTL ? 'تفعيل القائمة السوداء' : 'Enable Blacklist',
    geoBlocking: isRTL ? 'الحظر الجغرافي' : 'Geo Blocking',
    allowedCountries: isRTL ? 'البلدان المسموحة' : 'Allowed Countries',
    blockedCountries: isRTL ? 'البلدان المحظورة' : 'Blocked Countries',
    
    // Rate Limiting
    rateLimitingEnabled: isRTL ? 'تفعيل تحديد المعدل' : 'Enable Rate Limiting',
    requestsPerMinute: isRTL ? 'الطلبات في الدقيقة' : 'Requests Per Minute',
    requestsPerHour: isRTL ? 'الطلبات في الساعة' : 'Requests Per Hour',
    requestsPerDay: isRTL ? 'الطلبات في اليوم' : 'Requests Per Day',
    ddosProtection: isRTL ? 'حماية DDoS' : 'DDoS Protection',
    captchaThreshold: isRTL ? 'حد CAPTCHA' : 'CAPTCHA Threshold',
    
    // Monitoring
    monitoringEnabled: isRTL ? 'تفعيل المراقبة' : 'Enable Monitoring',
    logFailedLogins: isRTL ? 'تسجيل محاولات الدخول الفاشلة' : 'Log Failed Logins',
    logSuccessfulLogins: isRTL ? 'تسجيل محاولات الدخول الناجحة' : 'Log Successful Logins',
    logAdminActions: isRTL ? 'تسجيل إجراءات المدير' : 'Log Admin Actions',
    logDataChanges: isRTL ? 'تسجيل تغييرات البيانات' : 'Log Data Changes',
    alertOnSuspiciousActivity: isRTL ? 'تنبيه عند النشاط المشبوه' : 'Alert on Suspicious Activity',
    alertEmails: isRTL ? 'إيميلات التنبيه' : 'Alert Emails',
    
    // Data Protection
    encryptionEnabled: isRTL ? 'تفعيل التشفير' : 'Enable Encryption',
    encryptionAlgorithm: isRTL ? 'خوارزمية التشفير' : 'Encryption Algorithm',
    dataRetentionDays: isRTL ? 'أيام الاحتفاظ بالبيانات' : 'Data Retention Days',
    anonymizeData: isRTL ? 'إخفاء هوية البيانات' : 'Anonymize Data',
    gdprCompliance: isRTL ? 'الامتثال لـ GDPR' : 'GDPR Compliance',
    rightToBeForgotten: isRTL ? 'الحق في النسيان' : 'Right to be Forgotten',
    
    // API Security
    requireApiKey: isRTL ? 'تتطلب مفتاح API' : 'Require API Key',
    apiKeyRotationDays: isRTL ? 'دوران مفتاح API (أيام)' : 'API Key Rotation (days)',
    corsEnabled: isRTL ? 'تفعيل CORS' : 'Enable CORS',
    allowedOrigins: isRTL ? 'المصادر المسموحة' : 'Allowed Origins',
    rateLimitPerApiKey: isRTL ? 'حد المعدل لكل مفتاح API' : 'Rate Limit Per API Key',
    
    // Audit Logs
    timestamp: isRTL ? 'الوقت' : 'Timestamp',
    event: isRTL ? 'الحدث' : 'Event',
    user: isRTL ? 'المستخدم' : 'User',
    severity: isRTL ? 'الخطورة' : 'Severity',
    details: isRTL ? 'التفاصيل' : 'Details',
    
    // Severity Levels
    low: isRTL ? 'منخفض' : 'Low',
    medium: isRTL ? 'متوسط' : 'Medium',
    high: isRTL ? 'عالي' : 'High',
    critical: isRTL ? 'حرج' : 'Critical',
    
    // Actions
    save: isRTL ? 'حفظ' : 'Save',
    test: isRTL ? 'اختبار' : 'Test',
    generateApiKey: isRTL ? 'إنشاء مفتاح API' : 'Generate API Key',
    exportLogs: isRTL ? 'تصدير السجلات' : 'Export Logs',
    
    // Messages
    saving: isRTL ? 'جاري الحفظ...' : 'Saving...',
    saved: isRTL ? 'تم الحفظ بنجاح' : 'Settings saved successfully',
    error: isRTL ? 'حدث خطأ' : 'An error occurred',
    
    // Descriptions
    authDesc: isRTL ? 'إعدادات سياسات المصادقة وكلمات المرور' : 'Authentication policies and password settings',
    twoFactorDesc: isRTL ? 'إعدادات المصادقة الثنائية للأمان الإضافي' : 'Two-factor authentication for additional security',
    ipSecurityDesc: isRTL ? 'التحكم في الوصول بناءً على عنوان IP والموقع' : 'Control access based on IP address and location',
    rateLimitingDesc: isRTL ? 'حماية من الهجمات والاستخدام المفرط' : 'Protection against attacks and excessive usage',
    monitoringDesc: isRTL ? 'مراقبة الأنشطة الأمنية وتسجيل الأحداث' : 'Monitor security activities and log events',
    dataProtectionDesc: isRTL ? 'حماية البيانات والامتثال للوائح' : 'Data protection and regulatory compliance',
    apiSecurityDesc: isRTL ? 'أمان واجهة برمجة التطبيقات والتحكم في الوصول' : 'API security and access control',
  };

  useEffect(() => {
    loadSettings();
    loadAuditLogs();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const settingsRef = doc(db, 'settings', 'security');
      const settingsDoc = await getDoc(settingsRef);
      
      if (settingsDoc.exists()) {
        const data = settingsDoc.data();
        setSettings(prev => ({ ...prev, ...data }));
      }
    } catch (error) {
      console.error('Error loading security settings:', error);
      toast.error(texts.error);
    } finally {
      setLoading(false);
    }
  };

  const loadAuditLogs = async () => {
    // Simulate loading audit logs
    const mockLogs: SecurityAuditLog[] = [
      {
        id: '1',
        timestamp: new Date().toISOString(),
        event: 'Failed Login Attempt',
        user: 'unknown@example.com',
        ip: '192.168.1.100',
        severity: 'medium',
        details: 'Multiple failed login attempts detected'
      },
      {
        id: '2',
        timestamp: new Date(Date.now() - 3600000).toISOString(),
        event: 'Admin Settings Changed',
        user: 'admin@colorstest.com',
        ip: '192.168.1.1',
        severity: 'high',
        details: 'Security settings modified'
      },
      {
        id: '3',
        timestamp: new Date(Date.now() - 7200000).toISOString(),
        event: 'Suspicious API Access',
        user: 'api_user',
        ip: '10.0.0.1',
        severity: 'critical',
        details: 'Unusual API access pattern detected'
      }
    ];
    setAuditLogs(mockLogs);
  };

  const saveSettings = async () => {
    try {
      setSaving(true);
      const settingsRef = doc(db, 'settings', 'security');
      
      await setDoc(settingsRef, {
        ...settings,
        updatedAt: new Date().toISOString(),
        createdAt: new Date().toISOString()
      }, { merge: true });
      
      toast.success(texts.saved);
    } catch (error) {
      console.error('Error saving security settings:', error);
      toast.error(texts.error);
    } finally {
      setSaving(false);
    }
  };

  const getSeverityBadge = (severity: string) => {
    const variants = {
      low: 'default',
      medium: 'secondary',
      high: 'destructive',
      critical: 'destructive'
    } as const;

    const colors = {
      low: 'bg-green-100 text-green-800',
      medium: 'bg-yellow-100 text-yellow-800',
      high: 'bg-orange-100 text-orange-800',
      critical: 'bg-red-100 text-red-800'
    };

    return (
      <Badge className={colors[severity as keyof typeof colors]}>
        {texts[severity as keyof typeof texts] || severity}
      </Badge>
    );
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

      {/* Security Alert */}
      <Alert>
        <ShieldCheckIcon className="h-4 w-4" />
        <AlertDescription>
          {isRTL 
            ? 'إعدادات الأمان حساسة. تأكد من فهم تأثير كل تغيير قبل الحفظ.'
            : 'Security settings are sensitive. Make sure you understand the impact of each change before saving.'
          }
        </AlertDescription>
      </Alert>

      {/* Security Settings Tabs */}
      <Tabs defaultValue="authentication" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 lg:grid-cols-8">
          <TabsTrigger value="authentication">{texts.authentication}</TabsTrigger>
          <TabsTrigger value="twoFactor">{texts.twoFactor}</TabsTrigger>
          <TabsTrigger value="ipSecurity">{texts.ipSecurity}</TabsTrigger>
          <TabsTrigger value="rateLimiting">{texts.rateLimiting}</TabsTrigger>
          <TabsTrigger value="monitoring">{texts.monitoring}</TabsTrigger>
          <TabsTrigger value="dataProtection">{texts.dataProtection}</TabsTrigger>
          <TabsTrigger value="apiSecurity">{texts.apiSecurity}</TabsTrigger>
          <TabsTrigger value="auditLogs">{texts.auditLogs}</TabsTrigger>
        </TabsList>

        {/* Authentication Settings */}
        <TabsContent value="authentication">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 rtl:space-x-reverse">
                <LockClosedIcon className="h-5 w-5" />
                <span>{texts.authentication}</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base font-medium">{texts.requireEmailVerification}</Label>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {texts.authDesc}
                  </p>
                </div>
                <Switch
                  checked={settings.authentication.requireEmailVerification}
                  onCheckedChange={(checked) =>
                    setSettings(prev => ({
                      ...prev,
                      authentication: { ...prev.authentication, requireEmailVerification: checked }
                    }))
                  }
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="passwordMinLength">{texts.passwordMinLength}</Label>
                  <Input
                    id="passwordMinLength"
                    type="number"
                    min="6"
                    max="32"
                    value={settings.authentication.passwordMinLength}
                    onChange={(e) => setSettings(prev => ({
                      ...prev,
                      authentication: { 
                        ...prev.authentication, 
                        passwordMinLength: parseInt(e.target.value) || 8 
                      }
                    }))}
                  />
                </div>
                <div>
                  <Label htmlFor="maxLoginAttempts">{texts.maxLoginAttempts}</Label>
                  <Input
                    id="maxLoginAttempts"
                    type="number"
                    min="3"
                    max="10"
                    value={settings.authentication.maxLoginAttempts}
                    onChange={(e) => setSettings(prev => ({
                      ...prev,
                      authentication: { 
                        ...prev.authentication, 
                        maxLoginAttempts: parseInt(e.target.value) || 5 
                      }
                    }))}
                  />
                </div>
                <div>
                  <Label htmlFor="sessionTimeout">{texts.sessionTimeout}</Label>
                  <Input
                    id="sessionTimeout"
                    type="number"
                    min="15"
                    max="480"
                    value={settings.authentication.sessionTimeout}
                    onChange={(e) => setSettings(prev => ({
                      ...prev,
                      authentication: { 
                        ...prev.authentication, 
                        sessionTimeout: parseInt(e.target.value) || 60 
                      }
                    }))}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-base font-medium">
                  {isRTL ? 'متطلبات كلمة المرور' : 'Password Requirements'}
                </Label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm">{texts.passwordRequireUppercase}</Label>
                    <Switch
                      checked={settings.authentication.passwordRequireUppercase}
                      onCheckedChange={(checked) =>
                        setSettings(prev => ({
                          ...prev,
                          authentication: { ...prev.authentication, passwordRequireUppercase: checked }
                        }))
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label className="text-sm">{texts.passwordRequireLowercase}</Label>
                    <Switch
                      checked={settings.authentication.passwordRequireLowercase}
                      onCheckedChange={(checked) =>
                        setSettings(prev => ({
                          ...prev,
                          authentication: { ...prev.authentication, passwordRequireLowercase: checked }
                        }))
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label className="text-sm">{texts.passwordRequireNumbers}</Label>
                    <Switch
                      checked={settings.authentication.passwordRequireNumbers}
                      onCheckedChange={(checked) =>
                        setSettings(prev => ({
                          ...prev,
                          authentication: { ...prev.authentication, passwordRequireNumbers: checked }
                        }))
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label className="text-sm">{texts.passwordRequireSymbols}</Label>
                    <Switch
                      checked={settings.authentication.passwordRequireSymbols}
                      onCheckedChange={(checked) =>
                        setSettings(prev => ({
                          ...prev,
                          authentication: { ...prev.authentication, passwordRequireSymbols: checked }
                        }))
                      }
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Two-Factor Authentication */}
        <TabsContent value="twoFactor">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 rtl:space-x-reverse">
                <KeyIcon className="h-5 w-5" />
                <span>{texts.twoFactor}</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base font-medium">{texts.twoFactorEnabled}</Label>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {texts.twoFactorDesc}
                  </p>
                </div>
                <Switch
                  checked={settings.twoFactor.enabled}
                  onCheckedChange={(checked) =>
                    setSettings(prev => ({
                      ...prev,
                      twoFactor: { ...prev.twoFactor, enabled: checked }
                    }))
                  }
                />
              </div>

              {settings.twoFactor.enabled && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label className="text-base font-medium">{texts.twoFactorRequired}</Label>
                    <Switch
                      checked={settings.twoFactor.required}
                      onCheckedChange={(checked) =>
                        setSettings(prev => ({
                          ...prev,
                          twoFactor: { ...prev.twoFactor, required: checked }
                        }))
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-base font-medium">
                      {isRTL ? 'طرق المصادقة المتاحة' : 'Available Authentication Methods'}
                    </Label>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="flex items-center justify-between">
                        <Label className="text-sm">{texts.smsMethod}</Label>
                        <Switch
                          checked={settings.twoFactor.methods.sms}
                          onCheckedChange={(checked) =>
                            setSettings(prev => ({
                              ...prev,
                              twoFactor: { 
                                ...prev.twoFactor, 
                                methods: { ...prev.twoFactor.methods, sms: checked }
                              }
                            }))
                          }
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label className="text-sm">{texts.emailMethod}</Label>
                        <Switch
                          checked={settings.twoFactor.methods.email}
                          onCheckedChange={(checked) =>
                            setSettings(prev => ({
                              ...prev,
                              twoFactor: { 
                                ...prev.twoFactor, 
                                methods: { ...prev.twoFactor.methods, email: checked }
                              }
                            }))
                          }
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label className="text-sm">{texts.authenticatorMethod}</Label>
                        <Switch
                          checked={settings.twoFactor.methods.authenticator}
                          onCheckedChange={(checked) =>
                            setSettings(prev => ({
                              ...prev,
                              twoFactor: { 
                                ...prev.twoFactor, 
                                methods: { ...prev.twoFactor.methods, authenticator: checked }
                              }
                            }))
                          }
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <Label className="text-base font-medium">{texts.backupCodes}</Label>
                    <Switch
                      checked={settings.twoFactor.backupCodes}
                      onCheckedChange={(checked) =>
                        setSettings(prev => ({
                          ...prev,
                          twoFactor: { ...prev.twoFactor, backupCodes: checked }
                        }))
                      }
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Rate Limiting */}
        <TabsContent value="rateLimiting">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 rtl:space-x-reverse">
                <ClockIcon className="h-5 w-5" />
                <span>{texts.rateLimiting}</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base font-medium">{texts.rateLimitingEnabled}</Label>
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
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="requestsPerMinute">{texts.requestsPerMinute}</Label>
                      <Input
                        id="requestsPerMinute"
                        type="number"
                        value={settings.rateLimiting.requestsPerMinute}
                        onChange={(e) => setSettings(prev => ({
                          ...prev,
                          rateLimiting: { 
                            ...prev.rateLimiting, 
                            requestsPerMinute: parseInt(e.target.value) || 60 
                          }
                        }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="requestsPerHour">{texts.requestsPerHour}</Label>
                      <Input
                        id="requestsPerHour"
                        type="number"
                        value={settings.rateLimiting.requestsPerHour}
                        onChange={(e) => setSettings(prev => ({
                          ...prev,
                          rateLimiting: { 
                            ...prev.rateLimiting, 
                            requestsPerHour: parseInt(e.target.value) || 1000 
                          }
                        }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="requestsPerDay">{texts.requestsPerDay}</Label>
                      <Input
                        id="requestsPerDay"
                        type="number"
                        value={settings.rateLimiting.requestsPerDay}
                        onChange={(e) => setSettings(prev => ({
                          ...prev,
                          rateLimiting: { 
                            ...prev.rateLimiting, 
                            requestsPerDay: parseInt(e.target.value) || 10000 
                          }
                        }))}
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <Label className="text-base font-medium">{texts.ddosProtection}</Label>
                    <Switch
                      checked={settings.rateLimiting.ddosProtection}
                      onCheckedChange={(checked) =>
                        setSettings(prev => ({
                          ...prev,
                          rateLimiting: { ...prev.rateLimiting, ddosProtection: checked }
                        }))
                      }
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Audit Logs */}
        <TabsContent value="auditLogs">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center space-x-2 rtl:space-x-reverse">
                  <DocumentTextIcon className="h-5 w-5" />
                  <span>{texts.auditLogs}</span>
                </div>
                <Button variant="outline">
                  {texts.exportLogs}
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {auditLogs.map((log) => (
                  <div key={log.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 rtl:space-x-reverse">
                        <span className="font-medium">{log.event}</span>
                        {getSeverityBadge(log.severity)}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {log.user} • {log.ip} • {new Date(log.timestamp).toLocaleString()}
                      </div>
                      <div className="text-sm text-gray-500 mt-1">
                        {log.details}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
