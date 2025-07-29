'use client';

import React, { useState, useEffect } from 'react';
import { Language } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { db } from '@/lib/firebase';
import { doc, setDoc, getDoc, collection, getDocs, updateDoc, addDoc, deleteDoc } from 'firebase/firestore';
import toast from 'react-hot-toast';
import {
  LockClosedIcon,
  ShieldCheckIcon,
  KeyIcon,
  UserGroupIcon,
  BeakerIcon,
  TagIcon,
  StarIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  InformationCircleIcon,
  ArrowPathIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  CogIcon,
  ClockIcon,
  GlobeAltIcon
} from '@heroicons/react/24/outline';

interface AccessRule {
  id: string;
  name: string;
  nameAr: string;
  description: string;
  descriptionAr: string;
  type: 'test' | 'category' | 'difficulty' | 'feature' | 'global';
  targetId: string;
  targetName: string;
  targetNameAr: string;
  requiredPlans: string[];
  enabled: boolean;
  priority: number;
  conditions: {
    userRoles?: string[];
    subscriptionStatus?: string[];
    trialAllowed?: boolean;
    geoRestrictions?: string[];
    timeRestrictions?: {
      startTime?: string;
      endTime?: string;
      timezone?: string;
      daysOfWeek?: number[];
    };
    deviceRestrictions?: string[];
    ipWhitelist?: string[];
    ipBlacklist?: string[];
  };
  actions: {
    allowAccess: boolean;
    showUpgradePrompt: boolean;
    redirectUrl?: string;
    customMessage?: string;
    customMessageAr?: string;
    logAccess: boolean;
    notifyAdmin: boolean;
  };
  statistics: {
    totalAttempts: number;
    allowedAttempts: number;
    deniedAttempts: number;
    lastAccessed: string;
  };
}

interface GlobalAccessSettings {
  freeAccessEnabled: boolean;
  freeTestsLimit: number;
  trialAccessEnabled: boolean;
  trialDuration: number;
  maintenanceMode: boolean;
  maintenanceMessage: string;
  maintenanceMessageAr: string;
  geoBlocking: {
    enabled: boolean;
    allowedCountries: string[];
    blockedCountries: string[];
  };
  rateLimit: {
    enabled: boolean;
    requestsPerMinute: number;
    requestsPerHour: number;
    requestsPerDay: number;
  };
  securitySettings: {
    requireEmailVerification: boolean;
    requirePhoneVerification: boolean;
    enableTwoFactor: boolean;
    sessionTimeout: number;
    maxConcurrentSessions: number;
  };
}

interface UpgradePrompt {
  id: string;
  title: string;
  titleAr: string;
  message: string;
  messageAr: string;
  targetPlan: string;
  buttonText: string;
  buttonTextAr: string;
  enabled: boolean;
  showForTests: string[];
  showForCategories: string[];
  showForDifficulties: string[];
  design: {
    theme: 'default' | 'premium' | 'urgent';
    showDiscount: boolean;
    discountPercentage?: number;
    showTimer: boolean;
    timerDuration?: number;
  };
}

interface AccessControlManagementProps {
  lang: Language;
}

export function AccessControlManagement({ lang }: AccessControlManagementProps) {
  const [accessRules, setAccessRules] = useState<AccessRule[]>([]);
  const [globalSettings, setGlobalSettings] = useState<GlobalAccessSettings | null>(null);
  const [upgradePrompts, setUpgradePrompts] = useState<UpgradePrompt[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showAddRuleDialog, setShowAddRuleDialog] = useState(false);
  const [showEditRuleDialog, setShowEditRuleDialog] = useState(false);
  const [showPromptDialog, setShowPromptDialog] = useState(false);
  const [editingRule, setEditingRule] = useState<AccessRule | null>(null);
  const [editingPrompt, setEditingPrompt] = useState<UpgradePrompt | null>(null);

  const isRTL = lang === 'ar';

  const texts = {
    title: isRTL ? 'إدارة التحكم في الوصول' : 'Access Control Management',
    subtitle: isRTL ? 'إدارة شاملة لقواعد الوصول والتحكم في المحتوى والأمان' : 'Comprehensive access rules, content control and security management',
    
    // Tabs
    accessRules: isRTL ? 'قواعد الوصول' : 'Access Rules',
    globalSettings: isRTL ? 'الإعدادات العامة' : 'Global Settings',
    upgradePrompts: isRTL ? 'رسائل الترقية' : 'Upgrade Prompts',
    analytics: isRTL ? 'التحليلات' : 'Analytics',
    
    // Access Rules
    addRule: isRTL ? 'إضافة قاعدة' : 'Add Rule',
    editRule: isRTL ? 'تعديل القاعدة' : 'Edit Rule',
    deleteRule: isRTL ? 'حذف القاعدة' : 'Delete Rule',
    ruleName: isRTL ? 'اسم القاعدة' : 'Rule Name',
    ruleNameAr: isRTL ? 'اسم القاعدة بالعربية' : 'Rule Name (Arabic)',
    ruleType: isRTL ? 'نوع القاعدة' : 'Rule Type',
    targetId: isRTL ? 'الهدف' : 'Target',
    requiredPlans: isRTL ? 'الخطط المطلوبة' : 'Required Plans',
    priority: isRTL ? 'الأولوية' : 'Priority',
    enabled: isRTL ? 'مفعل' : 'Enabled',
    
    // Rule Types
    test: isRTL ? 'اختبار' : 'Test',
    category: isRTL ? 'تصنيف' : 'Category',
    difficulty: isRTL ? 'صعوبة' : 'Difficulty',
    feature: isRTL ? 'ميزة' : 'Feature',
    global: isRTL ? 'عام' : 'Global',
    
    // Conditions
    conditions: isRTL ? 'الشروط' : 'Conditions',
    userRoles: isRTL ? 'أدوار المستخدمين' : 'User Roles',
    subscriptionStatus: isRTL ? 'حالة الاشتراك' : 'Subscription Status',
    trialAllowed: isRTL ? 'السماح للتجربة المجانية' : 'Trial Allowed',
    geoRestrictions: isRTL ? 'القيود الجغرافية' : 'Geo Restrictions',
    timeRestrictions: isRTL ? 'القيود الزمنية' : 'Time Restrictions',
    deviceRestrictions: isRTL ? 'قيود الأجهزة' : 'Device Restrictions',
    ipWhitelist: isRTL ? 'قائمة IP المسموحة' : 'IP Whitelist',
    ipBlacklist: isRTL ? 'قائمة IP المحظورة' : 'IP Blacklist',
    
    // Actions
    actions: isRTL ? 'الإجراءات' : 'Actions',
    allowAccess: isRTL ? 'السماح بالوصول' : 'Allow Access',
    showUpgradePrompt: isRTL ? 'عرض رسالة الترقية' : 'Show Upgrade Prompt',
    redirectUrl: isRTL ? 'رابط التوجيه' : 'Redirect URL',
    customMessage: isRTL ? 'رسالة مخصصة' : 'Custom Message',
    customMessageAr: isRTL ? 'رسالة مخصصة بالعربية' : 'Custom Message (Arabic)',
    logAccess: isRTL ? 'تسجيل الوصول' : 'Log Access',
    notifyAdmin: isRTL ? 'إشعار المدير' : 'Notify Admin',
    
    // Global Settings
    freeAccessEnabled: isRTL ? 'تفعيل الوصول المجاني' : 'Enable Free Access',
    freeTestsLimit: isRTL ? 'حد الاختبارات المجانية' : 'Free Tests Limit',
    trialAccessEnabled: isRTL ? 'تفعيل وصول التجربة المجانية' : 'Enable Trial Access',
    trialDuration: isRTL ? 'مدة التجربة المجانية' : 'Trial Duration',
    maintenanceMode: isRTL ? 'وضع الصيانة' : 'Maintenance Mode',
    maintenanceMessage: isRTL ? 'رسالة الصيانة' : 'Maintenance Message',
    maintenanceMessageAr: isRTL ? 'رسالة الصيانة بالعربية' : 'Maintenance Message (Arabic)',
    
    // Geo Blocking
    geoBlocking: isRTL ? 'الحظر الجغرافي' : 'Geo Blocking',
    geoBlockingEnabled: isRTL ? 'تفعيل الحظر الجغرافي' : 'Enable Geo Blocking',
    allowedCountries: isRTL ? 'البلدان المسموحة' : 'Allowed Countries',
    blockedCountries: isRTL ? 'البلدان المحظورة' : 'Blocked Countries',
    
    // Rate Limiting
    rateLimit: isRTL ? 'تحديد المعدل' : 'Rate Limiting',
    rateLimitEnabled: isRTL ? 'تفعيل تحديد المعدل' : 'Enable Rate Limiting',
    requestsPerMinute: isRTL ? 'طلبات في الدقيقة' : 'Requests Per Minute',
    requestsPerHour: isRTL ? 'طلبات في الساعة' : 'Requests Per Hour',
    requestsPerDay: isRTL ? 'طلبات في اليوم' : 'Requests Per Day',
    
    // Security Settings
    securitySettings: isRTL ? 'إعدادات الأمان' : 'Security Settings',
    requireEmailVerification: isRTL ? 'يتطلب تأكيد البريد الإلكتروني' : 'Require Email Verification',
    requirePhoneVerification: isRTL ? 'يتطلب تأكيد الهاتف' : 'Require Phone Verification',
    enableTwoFactor: isRTL ? 'تفعيل المصادقة الثنائية' : 'Enable Two Factor',
    sessionTimeout: isRTL ? 'انتهاء الجلسة (دقيقة)' : 'Session Timeout (minutes)',
    maxConcurrentSessions: isRTL ? 'الحد الأقصى للجلسات المتزامنة' : 'Max Concurrent Sessions',
    
    // Upgrade Prompts
    addPrompt: isRTL ? 'إضافة رسالة ترقية' : 'Add Upgrade Prompt',
    editPrompt: isRTL ? 'تعديل رسالة الترقية' : 'Edit Upgrade Prompt',
    deletePrompt: isRTL ? 'حذف رسالة الترقية' : 'Delete Upgrade Prompt',
    promptTitle: isRTL ? 'عنوان الرسالة' : 'Prompt Title',
    promptTitleAr: isRTL ? 'عنوان الرسالة بالعربية' : 'Prompt Title (Arabic)',
    promptMessage: isRTL ? 'نص الرسالة' : 'Prompt Message',
    promptMessageAr: isRTL ? 'نص الرسالة بالعربية' : 'Prompt Message (Arabic)',
    targetPlan: isRTL ? 'الخطة المستهدفة' : 'Target Plan',
    buttonText: isRTL ? 'نص الزر' : 'Button Text',
    buttonTextAr: isRTL ? 'نص الزر بالعربية' : 'Button Text (Arabic)',
    showForTests: isRTL ? 'عرض للاختبارات' : 'Show For Tests',
    showForCategories: isRTL ? 'عرض للتصنيفات' : 'Show For Categories',
    showForDifficulties: isRTL ? 'عرض لمستويات الصعوبة' : 'Show For Difficulties',
    
    // Design
    design: isRTL ? 'التصميم' : 'Design',
    theme: isRTL ? 'المظهر' : 'Theme',
    showDiscount: isRTL ? 'عرض الخصم' : 'Show Discount',
    discountPercentage: isRTL ? 'نسبة الخصم' : 'Discount Percentage',
    showTimer: isRTL ? 'عرض المؤقت' : 'Show Timer',
    timerDuration: isRTL ? 'مدة المؤقت (ثواني)' : 'Timer Duration (seconds)',
    
    // Themes
    default: isRTL ? 'افتراضي' : 'Default',
    premium: isRTL ? 'مميز' : 'Premium',
    urgent: isRTL ? 'عاجل' : 'Urgent',
    
    // Statistics
    statistics: isRTL ? 'الإحصائيات' : 'Statistics',
    totalAttempts: isRTL ? 'إجمالي المحاولات' : 'Total Attempts',
    allowedAttempts: isRTL ? 'المحاولات المسموحة' : 'Allowed Attempts',
    deniedAttempts: isRTL ? 'المحاولات المرفوضة' : 'Denied Attempts',
    lastAccessed: isRTL ? 'آخر وصول' : 'Last Accessed',
    accessRate: isRTL ? 'معدل الوصول' : 'Access Rate',
    
    // Actions
    save: isRTL ? 'حفظ' : 'Save',
    cancel: isRTL ? 'إلغاء' : 'Cancel',
    delete: isRTL ? 'حذف' : 'Delete',
    edit: isRTL ? 'تعديل' : 'Edit',
    view: isRTL ? 'عرض' : 'View',
    refresh: isRTL ? 'تحديث' : 'Refresh',
    test: isRTL ? 'اختبار' : 'Test',
    
    // Messages
    saving: isRTL ? 'جاري الحفظ...' : 'Saving...',
    saved: isRTL ? 'تم الحفظ بنجاح' : 'Saved successfully',
    error: isRTL ? 'حدث خطأ' : 'An error occurred',
    deleteConfirm: isRTL ? 'هل أنت متأكد من حذف هذه القاعدة؟' : 'Are you sure you want to delete this rule?',
    
    // Validation
    required: isRTL ? 'هذا الحقل مطلوب' : 'This field is required',
    invalidNumber: isRTL ? 'رقم غير صحيح' : 'Invalid number',
    invalidUrl: isRTL ? 'رابط غير صحيح' : 'Invalid URL',
  };

  useEffect(() => {
    loadAccessRules();
    loadGlobalSettings();
    loadUpgradePrompts();
  }, []);

  const loadAccessRules = async () => {
    try {
      setLoading(true);
      console.log('🔄 بدء تحميل قواعد الوصول...');
      
      const rulesRef = collection(db, 'access_rules');
      const snapshot = await getDocs(rulesRef);
      
      const rulesList: AccessRule[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        rulesList.push({
          id: doc.id,
          ...data
        } as AccessRule);
      });
      
      console.log(`✅ تم تحميل ${rulesList.length} قاعدة وصول بنجاح`);
      setAccessRules(rulesList);
    } catch (error: any) {
      console.error('❌ خطأ في تحميل قواعد الوصول:', error);
      toast.error(isRTL ? 'خطأ في تحميل قواعد الوصول' : 'Error loading access rules');
    } finally {
      setLoading(false);
    }
  };

  const loadGlobalSettings = async () => {
    try {
      console.log('🔄 بدء تحميل الإعدادات العامة...');
      
      const settingsRef = doc(db, 'settings', 'access_control');
      const settingsDoc = await getDoc(settingsRef);
      
      if (settingsDoc.exists()) {
        setGlobalSettings(settingsDoc.data() as GlobalAccessSettings);
        console.log('✅ تم تحميل الإعدادات العامة بنجاح');
      } else {
        // Create default settings
        const defaultSettings: GlobalAccessSettings = {
          freeAccessEnabled: true,
          freeTestsLimit: 3,
          trialAccessEnabled: true,
          trialDuration: 7,
          maintenanceMode: false,
          maintenanceMessage: 'System is under maintenance. Please try again later.',
          maintenanceMessageAr: 'النظام قيد الصيانة. يرجى المحاولة لاحقاً.',
          geoBlocking: {
            enabled: false,
            allowedCountries: [],
            blockedCountries: []
          },
          rateLimit: {
            enabled: false,
            requestsPerMinute: 60,
            requestsPerHour: 1000,
            requestsPerDay: 10000
          },
          securitySettings: {
            requireEmailVerification: true,
            requirePhoneVerification: false,
            enableTwoFactor: false,
            sessionTimeout: 60,
            maxConcurrentSessions: 3
          }
        };
        
        await setDoc(settingsRef, defaultSettings);
        setGlobalSettings(defaultSettings);
        console.log('✅ تم إنشاء الإعدادات العامة الافتراضية');
      }
    } catch (error: any) {
      console.error('❌ خطأ في تحميل الإعدادات العامة:', error);
    }
  };

  const loadUpgradePrompts = async () => {
    try {
      console.log('🔄 بدء تحميل رسائل الترقية...');
      
      const promptsRef = collection(db, 'upgrade_prompts');
      const snapshot = await getDocs(promptsRef);
      
      const promptsList: UpgradePrompt[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        promptsList.push({
          id: doc.id,
          ...data
        } as UpgradePrompt);
      });
      
      console.log(`✅ تم تحميل ${promptsList.length} رسالة ترقية بنجاح`);
      setUpgradePrompts(promptsList);
    } catch (error: any) {
      console.error('❌ خطأ في تحميل رسائل الترقية:', error);
    }
  };

  const saveGlobalSettings = async (settings: GlobalAccessSettings) => {
    try {
      setSaving(true);
      
      const settingsRef = doc(db, 'settings', 'access_control');
      await setDoc(settingsRef, {
        ...settings,
        updatedAt: new Date()
      });
      
      setGlobalSettings(settings);
      toast.success(isRTL ? 'تم حفظ الإعدادات العامة بنجاح' : 'Global settings saved successfully');
    } catch (error: any) {
      console.error('Error saving global settings:', error);
      toast.error(texts.error);
    } finally {
      setSaving(false);
    }
  };

  const getRuleTypeBadge = (type: AccessRule['type']) => {
    const config = {
      test: { color: 'bg-blue-100 text-blue-800', text: texts.test, icon: BeakerIcon },
      category: { color: 'bg-green-100 text-green-800', text: texts.category, icon: TagIcon },
      difficulty: { color: 'bg-yellow-100 text-yellow-800', text: texts.difficulty, icon: StarIcon },
      feature: { color: 'bg-purple-100 text-purple-800', text: texts.feature, icon: CogIcon },
      global: { color: 'bg-gray-100 text-gray-800', text: texts.global, icon: GlobeAltIcon }
    };
    
    const typeConfig = config[type] || config.global;
    const IconComponent = typeConfig.icon;
    
    return (
      <Badge className={typeConfig.color}>
        <IconComponent className="h-3 w-3 mr-1 rtl:ml-1 rtl:mr-0" />
        {typeConfig.text}
      </Badge>
    );
  };

  const calculateAccessRate = (rule: AccessRule) => {
    if (rule.statistics.totalAttempts === 0) return 0;
    return Math.round((rule.statistics.allowedAttempts / rule.statistics.totalAttempts) * 100);
  };

  return (
    <div className={`space-y-6 ${isRTL ? 'rtl' : 'ltr'}`} dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center space-x-2 rtl:space-x-reverse">
            <LockClosedIcon className="h-6 w-6" />
            <span>{texts.title}</span>
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            {texts.subtitle}
          </p>
        </div>
        <div className="flex space-x-2 rtl:space-x-reverse">
          <Button variant="outline" onClick={loadAccessRules}>
            <ArrowPathIcon className="h-4 w-4 mr-2 rtl:ml-2 rtl:mr-0" />
            {texts.refresh}
          </Button>
          <Button onClick={() => setShowAddRuleDialog(true)}>
            <PlusIcon className="h-4 w-4 mr-2 rtl:ml-2 rtl:mr-0" />
            {texts.addRule}
          </Button>
        </div>
      </div>

      {/* Access Control Tabs */}
      <Tabs defaultValue="accessRules" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="accessRules">{texts.accessRules}</TabsTrigger>
          <TabsTrigger value="globalSettings">{texts.globalSettings}</TabsTrigger>
          <TabsTrigger value="upgradePrompts">{texts.upgradePrompts}</TabsTrigger>
          <TabsTrigger value="analytics">{texts.analytics}</TabsTrigger>
        </TabsList>

        {/* Access Rules Tab */}
        <TabsContent value="accessRules">
          <div className="space-y-4">
            {accessRules.map((rule) => (
              <Card key={rule.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 rtl:space-x-reverse mb-2">
                        <h3 className="font-medium text-lg">{isRTL ? rule.nameAr : rule.name}</h3>
                        {getRuleTypeBadge(rule.type)}
                        <Badge variant={rule.enabled ? 'default' : 'secondary'}>
                          {rule.enabled ? texts.enabled : (isRTL ? 'معطل' : 'Disabled')}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                        {isRTL ? rule.descriptionAr : rule.description}
                      </p>
                      <div className="flex items-center space-x-4 rtl:space-x-reverse text-sm">
                        <span>
                          <strong>{texts.priority}:</strong> {rule.priority}
                        </span>
                        <span>
                          <strong>{texts.targetId}:</strong> {isRTL ? rule.targetNameAr : rule.targetName}
                        </span>
                        <span>
                          <strong>{texts.accessRate}:</strong> {calculateAccessRate(rule)}%
                        </span>
                      </div>
                    </div>
                    <div className="flex space-x-2 rtl:space-x-reverse">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setEditingRule(rule);
                          setShowEditRuleDialog(true);
                        }}
                      >
                        <PencilIcon className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {}}
                        className="text-red-600 hover:text-red-700"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            
            {accessRules.length === 0 && (
              <Card>
                <CardContent className="p-8 text-center">
                  <LockClosedIcon className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    {isRTL ? 'لا توجد قواعد وصول' : 'No access rules'}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    {isRTL ? 'ابدأ بإضافة قاعدة وصول جديدة' : 'Start by adding a new access rule'}
                  </p>
                  <Button onClick={() => setShowAddRuleDialog(true)}>
                    <PlusIcon className="h-4 w-4 mr-2 rtl:ml-2 rtl:mr-0" />
                    {texts.addRule}
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* Global Settings Tab */}
        <TabsContent value="globalSettings">
          {globalSettings && (
            <div className="space-y-6">
              {/* Free Access Settings */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2 rtl:space-x-reverse">
                    <GlobeAltIcon className="h-5 w-5" />
                    <span>{isRTL ? 'إعدادات الوصول المجاني' : 'Free Access Settings'}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center space-x-2 rtl:space-x-reverse">
                    <Switch
                      checked={globalSettings.freeAccessEnabled}
                      onCheckedChange={(checked) => 
                        setGlobalSettings(prev => prev ? { ...prev, freeAccessEnabled: checked } : null)
                      }
                    />
                    <Label>{texts.freeAccessEnabled}</Label>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>{texts.freeTestsLimit}</Label>
                      <Input
                        type="number"
                        value={globalSettings.freeTestsLimit}
                        onChange={(e) => 
                          setGlobalSettings(prev => prev ? { 
                            ...prev, 
                            freeTestsLimit: parseInt(e.target.value) || 0 
                          } : null)
                        }
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>{texts.trialDuration}</Label>
                      <Input
                        type="number"
                        value={globalSettings.trialDuration}
                        onChange={(e) => 
                          setGlobalSettings(prev => prev ? { 
                            ...prev, 
                            trialDuration: parseInt(e.target.value) || 0 
                          } : null)
                        }
                      />
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 rtl:space-x-reverse">
                    <Switch
                      checked={globalSettings.trialAccessEnabled}
                      onCheckedChange={(checked) => 
                        setGlobalSettings(prev => prev ? { ...prev, trialAccessEnabled: checked } : null)
                      }
                    />
                    <Label>{texts.trialAccessEnabled}</Label>
                  </div>
                </CardContent>
              </Card>

              {/* Maintenance Mode */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2 rtl:space-x-reverse">
                    <CogIcon className="h-5 w-5" />
                    <span>{isRTL ? 'وضع الصيانة' : 'Maintenance Mode'}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center space-x-2 rtl:space-x-reverse">
                    <Switch
                      checked={globalSettings.maintenanceMode}
                      onCheckedChange={(checked) => 
                        setGlobalSettings(prev => prev ? { ...prev, maintenanceMode: checked } : null)
                      }
                    />
                    <Label>{texts.maintenanceMode}</Label>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>{texts.maintenanceMessage}</Label>
                      <Input
                        value={globalSettings.maintenanceMessage}
                        onChange={(e) => 
                          setGlobalSettings(prev => prev ? { 
                            ...prev, 
                            maintenanceMessage: e.target.value 
                          } : null)
                        }
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>{texts.maintenanceMessageAr}</Label>
                      <Input
                        value={globalSettings.maintenanceMessageAr}
                        onChange={(e) => 
                          setGlobalSettings(prev => prev ? { 
                            ...prev, 
                            maintenanceMessageAr: e.target.value 
                          } : null)
                        }
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Security Settings */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2 rtl:space-x-reverse">
                    <ShieldCheckIcon className="h-5 w-5" />
                    <span>{texts.securitySettings}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div className="flex items-center space-x-2 rtl:space-x-reverse">
                      <Switch
                        checked={globalSettings.securitySettings.requireEmailVerification}
                        onCheckedChange={(checked) => 
                          setGlobalSettings(prev => prev ? { 
                            ...prev, 
                            securitySettings: { 
                              ...prev.securitySettings, 
                              requireEmailVerification: checked 
                            }
                          } : null)
                        }
                      />
                      <Label>{texts.requireEmailVerification}</Label>
                    </div>

                    <div className="flex items-center space-x-2 rtl:space-x-reverse">
                      <Switch
                        checked={globalSettings.securitySettings.requirePhoneVerification}
                        onCheckedChange={(checked) => 
                          setGlobalSettings(prev => prev ? { 
                            ...prev, 
                            securitySettings: { 
                              ...prev.securitySettings, 
                              requirePhoneVerification: checked 
                            }
                          } : null)
                        }
                      />
                      <Label>{texts.requirePhoneVerification}</Label>
                    </div>

                    <div className="flex items-center space-x-2 rtl:space-x-reverse">
                      <Switch
                        checked={globalSettings.securitySettings.enableTwoFactor}
                        onCheckedChange={(checked) => 
                          setGlobalSettings(prev => prev ? { 
                            ...prev, 
                            securitySettings: { 
                              ...prev.securitySettings, 
                              enableTwoFactor: checked 
                            }
                          } : null)
                        }
                      />
                      <Label>{texts.enableTwoFactor}</Label>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>{texts.sessionTimeout}</Label>
                      <Input
                        type="number"
                        value={globalSettings.securitySettings.sessionTimeout}
                        onChange={(e) => 
                          setGlobalSettings(prev => prev ? { 
                            ...prev, 
                            securitySettings: { 
                              ...prev.securitySettings, 
                              sessionTimeout: parseInt(e.target.value) || 0 
                            }
                          } : null)
                        }
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>{texts.maxConcurrentSessions}</Label>
                      <Input
                        type="number"
                        value={globalSettings.securitySettings.maxConcurrentSessions}
                        onChange={(e) => 
                          setGlobalSettings(prev => prev ? { 
                            ...prev, 
                            securitySettings: { 
                              ...prev.securitySettings, 
                              maxConcurrentSessions: parseInt(e.target.value) || 0 
                            }
                          } : null)
                        }
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="flex justify-end">
                <Button onClick={() => globalSettings && saveGlobalSettings(globalSettings)} disabled={saving}>
                  {saving ? texts.saving : texts.save}
                </Button>
              </div>
            </div>
          )}
        </TabsContent>

        {/* Upgrade Prompts Tab */}
        <TabsContent value="upgradePrompts">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 rtl:space-x-reverse">
                <ExclamationTriangleIcon className="h-5 w-5" />
                <span>{texts.upgradePrompts}</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Alert>
                <InformationCircleIcon className="h-4 w-4" />
                <AlertDescription>
                  {isRTL 
                    ? 'إدارة رسائل الترقية ستكون متاحة قريباً'
                    : 'Upgrade prompts management will be available soon'
                  }
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{texts.totalAttempts}</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {accessRules.reduce((sum, rule) => sum + rule.statistics.totalAttempts, 0).toLocaleString()}
                    </p>
                  </div>
                  <LockClosedIcon className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{texts.allowedAttempts}</p>
                    <p className="text-2xl font-bold text-green-600">
                      {accessRules.reduce((sum, rule) => sum + rule.statistics.allowedAttempts, 0).toLocaleString()}
                    </p>
                  </div>
                  <CheckCircleIcon className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{texts.deniedAttempts}</p>
                    <p className="text-2xl font-bold text-red-600">
                      {accessRules.reduce((sum, rule) => sum + rule.statistics.deniedAttempts, 0).toLocaleString()}
                    </p>
                  </div>
                  <ExclamationTriangleIcon className="h-8 w-8 text-red-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{texts.accessRate}</p>
                    <p className="text-2xl font-bold text-purple-600">
                      {accessRules.length > 0 
                        ? Math.round(accessRules.reduce((sum, rule) => sum + calculateAccessRate(rule), 0) / accessRules.length)
                        : 0
                      }%
                    </p>
                  </div>
                  <UserGroupIcon className="h-8 w-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
