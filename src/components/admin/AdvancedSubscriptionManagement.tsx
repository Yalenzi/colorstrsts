'use client';

import React, { useState, useEffect } from 'react';
import { Language } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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
  CreditCardIcon,
  StarIcon,
  LockClosedIcon,
  GiftIcon,
  ClockIcon,
  UserGroupIcon,
  ChartBarIcon,
  CogIcon,
  ShieldCheckIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  ArrowPathIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  CalendarIcon,
  BanknotesIcon,
  TagIcon
} from '@heroicons/react/24/outline';

interface SubscriptionPlan {
  id: string;
  name: string;
  nameAr: string;
  description: string;
  descriptionAr: string;
  price: number;
  currency: string;
  billingPeriod: 'monthly' | 'yearly' | 'lifetime';
  trialDays: number;
  enabled: boolean;
  featured: boolean;
  maxTests: number;
  maxUsers: number;
  features: {
    unlimitedTests: boolean;
    prioritySupport: boolean;
    advancedAnalytics: boolean;
    customBranding: boolean;
    apiAccess: boolean;
    exportData: boolean;
    multiLanguage: boolean;
    whiteLabel: boolean;
    premiumContent: boolean;
    videoTutorials: boolean;
    certificateGeneration: boolean;
    bulkTesting: boolean;
  };
  restrictions: {
    maxTestsPerDay: number;
    maxTestsPerMonth: number;
    storageLimit: number;
    supportLevel: 'basic' | 'standard' | 'premium';
    accessLevel: 'basic' | 'intermediate' | 'advanced' | 'all';
  };
  discounts: {
    enabled: boolean;
    percentage: number;
    validUntil?: string;
    couponCode?: string;
    firstTimeDiscount?: number;
    loyaltyDiscount?: number;
  };
  statistics: {
    totalSubscribers: number;
    activeSubscribers: number;
    revenue: number;
    conversionRate: number;
    churnRate: number;
    averageLifetime: number;
  };
  accessControl: {
    allowedCategories: string[];
    blockedCategories: string[];
    allowedDifficulties: string[];
    blockedDifficulties: string[];
    customPermissions: string[];
  };
}

interface AccessRule {
  id: string;
  name: string;
  nameAr: string;
  description: string;
  descriptionAr: string;
  type: 'test' | 'category' | 'difficulty' | 'feature';
  targetId: string;
  requiredPlan: string[];
  enabled: boolean;
  priority: number;
  conditions: {
    userRole?: string[];
    subscriptionStatus?: string[];
    trialAllowed?: boolean;
    geoRestrictions?: string[];
    timeRestrictions?: {
      startTime?: string;
      endTime?: string;
      timezone?: string;
    };
  };
}

interface TrialSettings {
  enabled: boolean;
  duration: number;
  maxTrialsPerUser: number;
  requirePaymentMethod: boolean;
  autoConvert: boolean;
  reminderDays: number[];
  gracePeriod: number;
  features: {
    fullAccess: boolean;
    limitedTests: number;
    supportAccess: boolean;
    analyticsAccess: boolean;
  };
}

interface AdvancedSubscriptionManagementProps {
  lang: Language;
}

export function AdvancedSubscriptionManagement({ lang }: AdvancedSubscriptionManagementProps) {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [accessRules, setAccessRules] = useState<AccessRule[]>([]);
  const [trialSettings, setTrialSettings] = useState<TrialSettings | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showAddPlanDialog, setShowAddPlanDialog] = useState(false);
  const [showEditPlanDialog, setShowEditPlanDialog] = useState(false);
  const [showAccessRuleDialog, setShowAccessRuleDialog] = useState(false);
  const [editingPlan, setEditingPlan] = useState<SubscriptionPlan | null>(null);
  const [editingRule, setEditingRule] = useState<AccessRule | null>(null);

  const isRTL = lang === 'ar';

  const texts = {
    title: isRTL ? 'إدارة الاشتراكات المتقدمة' : 'Advanced Subscription Management',
    subtitle: isRTL ? 'إدارة شاملة لخطط الاشتراك وقواعد الوصول والتحكم في المحتوى' : 'Comprehensive subscription plans, access rules and content control management',
    
    // Tabs
    plans: isRTL ? 'خطط الاشتراك' : 'Subscription Plans',
    accessRules: isRTL ? 'قواعد الوصول' : 'Access Rules',
    trialSettings: isRTL ? 'إعدادات التجربة المجانية' : 'Trial Settings',
    analytics: isRTL ? 'التحليلات' : 'Analytics',
    
    // Plan Management
    addPlan: isRTL ? 'إضافة خطة' : 'Add Plan',
    editPlan: isRTL ? 'تعديل الخطة' : 'Edit Plan',
    deletePlan: isRTL ? 'حذف الخطة' : 'Delete Plan',
    duplicatePlan: isRTL ? 'نسخ الخطة' : 'Duplicate Plan',
    
    // Plan Properties
    planName: isRTL ? 'اسم الخطة' : 'Plan Name',
    planNameAr: isRTL ? 'اسم الخطة بالعربية' : 'Plan Name (Arabic)',
    description: isRTL ? 'الوصف' : 'Description',
    descriptionAr: isRTL ? 'الوصف بالعربية' : 'Description (Arabic)',
    price: isRTL ? 'السعر' : 'Price',
    currency: isRTL ? 'العملة' : 'Currency',
    billingPeriod: isRTL ? 'فترة الفوترة' : 'Billing Period',
    trialDays: isRTL ? 'أيام التجربة المجانية' : 'Trial Days',
    enabled: isRTL ? 'مفعل' : 'Enabled',
    featured: isRTL ? 'مميز' : 'Featured',
    maxTests: isRTL ? 'الحد الأقصى للاختبارات' : 'Max Tests',
    maxUsers: isRTL ? 'الحد الأقصى للمستخدمين' : 'Max Users',
    
    // Billing Periods
    monthly: isRTL ? 'شهري' : 'Monthly',
    yearly: isRTL ? 'سنوي' : 'Yearly',
    lifetime: isRTL ? 'مدى الحياة' : 'Lifetime',
    
    // Features
    features: isRTL ? 'المزايا' : 'Features',
    unlimitedTests: isRTL ? 'اختبارات غير محدودة' : 'Unlimited Tests',
    prioritySupport: isRTL ? 'دعم أولوية' : 'Priority Support',
    advancedAnalytics: isRTL ? 'تحليلات متقدمة' : 'Advanced Analytics',
    customBranding: isRTL ? 'علامة تجارية مخصصة' : 'Custom Branding',
    apiAccess: isRTL ? 'وصول API' : 'API Access',
    exportData: isRTL ? 'تصدير البيانات' : 'Export Data',
    multiLanguage: isRTL ? 'متعدد اللغات' : 'Multi-Language',
    whiteLabel: isRTL ? 'علامة بيضاء' : 'White Label',
    premiumContent: isRTL ? 'محتوى مميز' : 'Premium Content',
    videoTutorials: isRTL ? 'دروس فيديو' : 'Video Tutorials',
    certificateGeneration: isRTL ? 'إنشاء الشهادات' : 'Certificate Generation',
    bulkTesting: isRTL ? 'اختبار مجمع' : 'Bulk Testing',
    
    // Restrictions
    restrictions: isRTL ? 'القيود' : 'Restrictions',
    maxTestsPerDay: isRTL ? 'الحد الأقصى للاختبارات يومياً' : 'Max Tests Per Day',
    maxTestsPerMonth: isRTL ? 'الحد الأقصى للاختبارات شهرياً' : 'Max Tests Per Month',
    storageLimit: isRTL ? 'حد التخزين (MB)' : 'Storage Limit (MB)',
    supportLevel: isRTL ? 'مستوى الدعم' : 'Support Level',
    accessLevel: isRTL ? 'مستوى الوصول' : 'Access Level',
    
    // Support Levels
    basic: isRTL ? 'أساسي' : 'Basic',
    standard: isRTL ? 'قياسي' : 'Standard',
    premium: isRTL ? 'مميز' : 'Premium',
    
    // Access Levels
    intermediate: isRTL ? 'متوسط' : 'Intermediate',
    advanced: isRTL ? 'متقدم' : 'Advanced',
    all: isRTL ? 'الكل' : 'All',
    
    // Access Control
    accessControl: isRTL ? 'التحكم في الوصول' : 'Access Control',
    allowedCategories: isRTL ? 'التصنيفات المسموحة' : 'Allowed Categories',
    blockedCategories: isRTL ? 'التصنيفات المحظورة' : 'Blocked Categories',
    allowedDifficulties: isRTL ? 'مستويات الصعوبة المسموحة' : 'Allowed Difficulties',
    blockedDifficulties: isRTL ? 'مستويات الصعوبة المحظورة' : 'Blocked Difficulties',
    customPermissions: isRTL ? 'صلاحيات مخصصة' : 'Custom Permissions',
    
    // Discounts
    discounts: isRTL ? 'الخصومات' : 'Discounts',
    discountEnabled: isRTL ? 'تفعيل الخصم' : 'Enable Discount',
    discountPercentage: isRTL ? 'نسبة الخصم (%)' : 'Discount Percentage (%)',
    validUntil: isRTL ? 'صالح حتى' : 'Valid Until',
    couponCode: isRTL ? 'كود الكوبون' : 'Coupon Code',
    firstTimeDiscount: isRTL ? 'خصم المرة الأولى' : 'First Time Discount',
    loyaltyDiscount: isRTL ? 'خصم الولاء' : 'Loyalty Discount',
    
    // Statistics
    statistics: isRTL ? 'الإحصائيات' : 'Statistics',
    totalSubscribers: isRTL ? 'إجمالي المشتركين' : 'Total Subscribers',
    activeSubscribers: isRTL ? 'المشتركون النشطون' : 'Active Subscribers',
    revenue: isRTL ? 'الإيرادات' : 'Revenue',
    conversionRate: isRTL ? 'معدل التحويل' : 'Conversion Rate',
    churnRate: isRTL ? 'معدل الإلغاء' : 'Churn Rate',
    averageLifetime: isRTL ? 'متوسط مدة الاشتراك' : 'Average Lifetime',
    
    // Access Rules
    addRule: isRTL ? 'إضافة قاعدة' : 'Add Rule',
    editRule: isRTL ? 'تعديل القاعدة' : 'Edit Rule',
    deleteRule: isRTL ? 'حذف القاعدة' : 'Delete Rule',
    ruleName: isRTL ? 'اسم القاعدة' : 'Rule Name',
    ruleType: isRTL ? 'نوع القاعدة' : 'Rule Type',
    targetId: isRTL ? 'الهدف' : 'Target',
    requiredPlan: isRTL ? 'الخطة المطلوبة' : 'Required Plan',
    priority: isRTL ? 'الأولوية' : 'Priority',
    
    // Rule Types
    test: isRTL ? 'اختبار' : 'Test',
    category: isRTL ? 'تصنيف' : 'Category',
    difficulty: isRTL ? 'صعوبة' : 'Difficulty',
    feature: isRTL ? 'ميزة' : 'Feature',
    
    // Trial Settings
    trialEnabled: isRTL ? 'تفعيل التجربة المجانية' : 'Enable Trial',
    trialDuration: isRTL ? 'مدة التجربة (أيام)' : 'Trial Duration (days)',
    maxTrialsPerUser: isRTL ? 'الحد الأقصى للتجارب لكل مستخدم' : 'Max Trials Per User',
    requirePaymentMethod: isRTL ? 'يتطلب طريقة دفع' : 'Require Payment Method',
    autoConvert: isRTL ? 'تحويل تلقائي' : 'Auto Convert',
    reminderDays: isRTL ? 'أيام التذكير' : 'Reminder Days',
    gracePeriod: isRTL ? 'فترة السماح (أيام)' : 'Grace Period (days)',
    fullAccess: isRTL ? 'وصول كامل' : 'Full Access',
    limitedTests: isRTL ? 'اختبارات محدودة' : 'Limited Tests',
    supportAccess: isRTL ? 'وصول للدعم' : 'Support Access',
    analyticsAccess: isRTL ? 'وصول للتحليلات' : 'Analytics Access',
    
    // Actions
    save: isRTL ? 'حفظ' : 'Save',
    cancel: isRTL ? 'إلغاء' : 'Cancel',
    delete: isRTL ? 'حذف' : 'Delete',
    edit: isRTL ? 'تعديل' : 'Edit',
    view: isRTL ? 'عرض' : 'View',
    duplicate: isRTL ? 'نسخ' : 'Duplicate',
    refresh: isRTL ? 'تحديث' : 'Refresh',
    
    // Messages
    saving: isRTL ? 'جاري الحفظ...' : 'Saving...',
    saved: isRTL ? 'تم الحفظ بنجاح' : 'Saved successfully',
    error: isRTL ? 'حدث خطأ' : 'An error occurred',
    deleteConfirm: isRTL ? 'هل أنت متأكد من حذف هذه الخطة؟' : 'Are you sure you want to delete this plan?',
    
    // Validation
    required: isRTL ? 'هذا الحقل مطلوب' : 'This field is required',
    invalidPrice: isRTL ? 'السعر غير صحيح' : 'Invalid price',
    invalidPercentage: isRTL ? 'النسبة المئوية غير صحيحة' : 'Invalid percentage',
  };

  useEffect(() => {
    loadPlans();
    loadAccessRules();
    loadTrialSettings();
  }, []);

  const loadPlans = async () => {
    try {
      setLoading(true);
      console.log('🔄 بدء تحميل خطط الاشتراك...');
      
      const plansRef = collection(db, 'subscription_plans');
      const snapshot = await getDocs(plansRef);
      
      const plansList: SubscriptionPlan[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        plansList.push({
          id: doc.id,
          ...data
        } as SubscriptionPlan);
      });
      
      console.log(`✅ تم تحميل ${plansList.length} خطة اشتراك بنجاح`);
      setPlans(plansList);
    } catch (error: any) {
      console.error('❌ خطأ في تحميل خطط الاشتراك:', error);
      toast.error(isRTL ? 'خطأ في تحميل خطط الاشتراك' : 'Error loading subscription plans');
    } finally {
      setLoading(false);
    }
  };

  const loadAccessRules = async () => {
    try {
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
    }
  };

  const loadTrialSettings = async () => {
    try {
      console.log('🔄 بدء تحميل إعدادات التجربة المجانية...');
      
      const settingsRef = doc(db, 'settings', 'trial');
      const settingsDoc = await getDoc(settingsRef);
      
      if (settingsDoc.exists()) {
        setTrialSettings(settingsDoc.data() as TrialSettings);
        console.log('✅ تم تحميل إعدادات التجربة المجانية بنجاح');
      } else {
        // Create default trial settings
        const defaultSettings: TrialSettings = {
          enabled: true,
          duration: 7,
          maxTrialsPerUser: 1,
          requirePaymentMethod: false,
          autoConvert: false,
          reminderDays: [3, 1],
          gracePeriod: 3,
          features: {
            fullAccess: false,
            limitedTests: 5,
            supportAccess: true,
            analyticsAccess: false
          }
        };
        
        await setDoc(settingsRef, defaultSettings);
        setTrialSettings(defaultSettings);
        console.log('✅ تم إنشاء إعدادات التجربة المجانية الافتراضية');
      }
    } catch (error: any) {
      console.error('❌ خطأ في تحميل إعدادات التجربة المجانية:', error);
    }
  };

  const savePlan = async (plan: Omit<SubscriptionPlan, 'id'>) => {
    try {
      setSaving(true);
      
      if (editingPlan) {
        // Update existing plan
        const planRef = doc(db, 'subscription_plans', editingPlan.id);
        await updateDoc(planRef, {
          ...plan,
          updatedAt: new Date()
        });
        toast.success(isRTL ? 'تم تحديث الخطة بنجاح' : 'Plan updated successfully');
      } else {
        // Add new plan
        const plansRef = collection(db, 'subscription_plans');
        await addDoc(plansRef, {
          ...plan,
          createdAt: new Date(),
          updatedAt: new Date()
        });
        toast.success(isRTL ? 'تم إضافة الخطة بنجاح' : 'Plan added successfully');
      }
      
      setShowAddPlanDialog(false);
      setShowEditPlanDialog(false);
      setEditingPlan(null);
      await loadPlans();
    } catch (error: any) {
      console.error('Error saving plan:', error);
      toast.error(texts.error);
    } finally {
      setSaving(false);
    }
  };

  const saveTrialSettings = async (settings: TrialSettings) => {
    try {
      setSaving(true);
      
      const settingsRef = doc(db, 'settings', 'trial');
      await setDoc(settingsRef, {
        ...settings,
        updatedAt: new Date()
      });
      
      setTrialSettings(settings);
      toast.success(isRTL ? 'تم حفظ إعدادات التجربة المجانية بنجاح' : 'Trial settings saved successfully');
    } catch (error: any) {
      console.error('Error saving trial settings:', error);
      toast.error(texts.error);
    } finally {
      setSaving(false);
    }
  };

  const getPlanBadge = (billingPeriod: SubscriptionPlan['billingPeriod']) => {
    const config = {
      monthly: { color: 'bg-blue-100 text-blue-800', text: texts.monthly, icon: CalendarIcon },
      yearly: { color: 'bg-purple-100 text-purple-800', text: texts.yearly, icon: StarIcon },
      lifetime: { color: 'bg-gold-100 text-gold-800', text: texts.lifetime, icon: ShieldCheckIcon }
    };
    
    const periodConfig = config[billingPeriod] || config.monthly;
    const IconComponent = periodConfig.icon;
    
    return (
      <Badge className={periodConfig.color}>
        <IconComponent className="h-3 w-3 mr-1 rtl:ml-1 rtl:mr-0" />
        {periodConfig.text}
      </Badge>
    );
  };

  return (
    <div className={`space-y-6 ${isRTL ? 'rtl' : 'ltr'}`} dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center space-x-2 rtl:space-x-reverse">
            <CreditCardIcon className="h-6 w-6" />
            <span>{texts.title}</span>
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            {texts.subtitle}
          </p>
        </div>
        <div className="flex space-x-2 rtl:space-x-reverse">
          <Button variant="outline" onClick={loadPlans}>
            <ArrowPathIcon className="h-4 w-4 mr-2 rtl:ml-2 rtl:mr-0" />
            {texts.refresh}
          </Button>
          <Button onClick={() => setShowAddPlanDialog(true)}>
            <PlusIcon className="h-4 w-4 mr-2 rtl:ml-2 rtl:mr-0" />
            {texts.addPlan}
          </Button>
        </div>
      </div>

      {/* Subscription Management Tabs */}
      <Tabs defaultValue="plans" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="plans">{texts.plans}</TabsTrigger>
          <TabsTrigger value="accessRules">{texts.accessRules}</TabsTrigger>
          <TabsTrigger value="trialSettings">{texts.trialSettings}</TabsTrigger>
          <TabsTrigger value="analytics">{texts.analytics}</TabsTrigger>
        </TabsList>

        {/* Plans Tab */}
        <TabsContent value="plans">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {plans.map((plan) => (
              <Card key={plan.id} className={`relative ${plan.featured ? 'ring-2 ring-purple-500' : ''}`}>
                {plan.featured && (
                  <div className="absolute -top-2 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-purple-500 text-white">
                      <StarIcon className="h-3 w-3 mr-1" />
                      {isRTL ? 'مميز' : 'Featured'}
                    </Badge>
                  </div>
                )}
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2 rtl:space-x-reverse">
                      <CardTitle className="text-lg">{isRTL ? plan.nameAr : plan.name}</CardTitle>
                    </div>
                    <div className="flex items-center space-x-1 rtl:space-x-reverse">
                      <Badge variant={plan.enabled ? 'default' : 'secondary'}>
                        {plan.enabled ? texts.enabled : (isRTL ? 'معطل' : 'Disabled')}
                      </Badge>
                      {getPlanBadge(plan.billingPeriod)}
                    </div>
                  </div>
                  <div className="text-2xl font-bold text-purple-600">
                    {plan.price.toLocaleString()} {plan.currency}
                    <span className="text-sm font-normal text-gray-600">
                      /{texts[plan.billingPeriod]}
                    </span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {isRTL ? plan.descriptionAr : plan.description}
                  </p>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600 dark:text-gray-400">{texts.maxTests}</p>
                      <p className="font-semibold">
                        {plan.features.unlimitedTests ? (isRTL ? 'غير محدود' : 'Unlimited') : plan.maxTests.toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600 dark:text-gray-400">{texts.trialDays}</p>
                      <p className="font-semibold">{plan.trialDays} {isRTL ? 'أيام' : 'days'}</p>
                    </div>
                    <div>
                      <p className="text-gray-600 dark:text-gray-400">{texts.activeSubscribers}</p>
                      <p className="font-semibold text-green-600">{plan.statistics.activeSubscribers.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-gray-600 dark:text-gray-400">{texts.revenue}</p>
                      <p className="font-semibold">{plan.statistics.revenue.toLocaleString()} {plan.currency}</p>
                    </div>
                  </div>

                  {plan.discounts.enabled && (
                    <div className="p-2 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded">
                      <div className="flex items-center space-x-1 rtl:space-x-reverse">
                        <GiftIcon className="h-4 w-4 text-green-600" />
                        <span className="text-sm text-green-800 dark:text-green-200">
                          {plan.discounts.percentage}% {isRTL ? 'خصم' : 'discount'}
                          {plan.discounts.couponCode && ` - ${plan.discounts.couponCode}`}
                        </span>
                      </div>
                    </div>
                  )}

                  <div className="flex space-x-2 rtl:space-x-reverse">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setEditingPlan(plan);
                        setShowEditPlanDialog(true);
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
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Access Rules Tab */}
        <TabsContent value="accessRules">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 rtl:space-x-reverse">
                <LockClosedIcon className="h-5 w-5" />
                <span>{texts.accessRules}</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Alert>
                <InformationCircleIcon className="h-4 w-4" />
                <AlertDescription>
                  {isRTL 
                    ? 'إدارة قواعد الوصول ستكون متاحة قريباً'
                    : 'Access rules management will be available soon'
                  }
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Trial Settings Tab */}
        <TabsContent value="trialSettings">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 rtl:space-x-reverse">
                <GiftIcon className="h-5 w-5" />
                <span>{texts.trialSettings}</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {trialSettings && (
                <div className="space-y-6">
                  <div className="flex items-center space-x-2 rtl:space-x-reverse">
                    <Switch
                      checked={trialSettings.enabled}
                      onCheckedChange={(checked) => 
                        setTrialSettings(prev => prev ? { ...prev, enabled: checked } : null)
                      }
                    />
                    <Label>{texts.trialEnabled}</Label>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>{texts.trialDuration}</Label>
                      <Input
                        type="number"
                        value={trialSettings.duration}
                        onChange={(e) => 
                          setTrialSettings(prev => prev ? { ...prev, duration: parseInt(e.target.value) || 0 } : null)
                        }
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>{texts.maxTrialsPerUser}</Label>
                      <Input
                        type="number"
                        value={trialSettings.maxTrialsPerUser}
                        onChange={(e) => 
                          setTrialSettings(prev => prev ? { ...prev, maxTrialsPerUser: parseInt(e.target.value) || 0 } : null)
                        }
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>{texts.gracePeriod}</Label>
                      <Input
                        type="number"
                        value={trialSettings.gracePeriod}
                        onChange={(e) => 
                          setTrialSettings(prev => prev ? { ...prev, gracePeriod: parseInt(e.target.value) || 0 } : null)
                        }
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>{texts.limitedTests}</Label>
                      <Input
                        type="number"
                        value={trialSettings.features.limitedTests}
                        onChange={(e) => 
                          setTrialSettings(prev => prev ? { 
                            ...prev, 
                            features: { 
                              ...prev.features, 
                              limitedTests: parseInt(e.target.value) || 0 
                            } 
                          } : null)
                        }
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">{texts.features}</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="flex items-center space-x-2 rtl:space-x-reverse">
                        <Switch
                          checked={trialSettings.features.fullAccess}
                          onCheckedChange={(checked) => 
                            setTrialSettings(prev => prev ? { 
                              ...prev, 
                              features: { ...prev.features, fullAccess: checked }
                            } : null)
                          }
                        />
                        <Label>{texts.fullAccess}</Label>
                      </div>

                      <div className="flex items-center space-x-2 rtl:space-x-reverse">
                        <Switch
                          checked={trialSettings.features.supportAccess}
                          onCheckedChange={(checked) => 
                            setTrialSettings(prev => prev ? { 
                              ...prev, 
                              features: { ...prev.features, supportAccess: checked }
                            } : null)
                          }
                        />
                        <Label>{texts.supportAccess}</Label>
                      </div>

                      <div className="flex items-center space-x-2 rtl:space-x-reverse">
                        <Switch
                          checked={trialSettings.features.analyticsAccess}
                          onCheckedChange={(checked) => 
                            setTrialSettings(prev => prev ? { 
                              ...prev, 
                              features: { ...prev.features, analyticsAccess: checked }
                            } : null)
                          }
                        />
                        <Label>{texts.analyticsAccess}</Label>
                      </div>

                      <div className="flex items-center space-x-2 rtl:space-x-reverse">
                        <Switch
                          checked={trialSettings.requirePaymentMethod}
                          onCheckedChange={(checked) => 
                            setTrialSettings(prev => prev ? { ...prev, requirePaymentMethod: checked } : null)
                          }
                        />
                        <Label>{texts.requirePaymentMethod}</Label>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <Button onClick={() => trialSettings && saveTrialSettings(trialSettings)} disabled={saving}>
                      {saving ? texts.saving : texts.save}
                    </Button>
                  </div>
                </div>
              )}
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
                    <p className="text-sm text-gray-600 dark:text-gray-400">{texts.totalSubscribers}</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {plans.reduce((sum, plan) => sum + plan.statistics.totalSubscribers, 0).toLocaleString()}
                    </p>
                  </div>
                  <UserGroupIcon className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{texts.activeSubscribers}</p>
                    <p className="text-2xl font-bold text-green-600">
                      {plans.reduce((sum, plan) => sum + plan.statistics.activeSubscribers, 0).toLocaleString()}
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
                    <p className="text-sm text-gray-600 dark:text-gray-400">{texts.revenue}</p>
                    <p className="text-2xl font-bold text-purple-600">
                      {plans.reduce((sum, plan) => sum + plan.statistics.revenue, 0).toLocaleString()} SAR
                    </p>
                  </div>
                  <BanknotesIcon className="h-8 w-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{texts.conversionRate}</p>
                    <p className="text-2xl font-bold text-orange-600">
                      {Math.round(plans.reduce((sum, plan) => sum + plan.statistics.conversionRate, 0) / plans.length || 0)}%
                    </p>
                  </div>
                  <ChartBarIcon className="h-8 w-8 text-orange-600" />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
