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
import { collection, getDocs, doc, updateDoc, addDoc, deleteDoc, query, orderBy, setDoc, getDoc } from 'firebase/firestore';
import toast from 'react-hot-toast';
import {
  DocumentTextIcon,
  BeakerIcon,
  PhotoIcon,
  LanguageIcon,
  TagIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  StarIcon,
  LockClosedIcon,
  GiftIcon,
  ArrowPathIcon,
  InformationCircleIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  CogIcon,
  CurrencyDollarIcon,
  UserGroupIcon,
  ChartBarIcon,
  BanknotesIcon as CreditCardIcon,
  DevicePhoneMobileIcon
} from '@heroicons/react/24/outline';

interface ChemicalTest {
  id: string;
  name: string;
  nameAr: string;
  slug: string;
  description: string;
  descriptionAr: string;
  category: string;
  categoryAr: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  subscriptionLevel: 'free' | 'basic' | 'premium' | 'pro';
  price?: number;
  estimatedTime: number;
  safetyLevel: 'low' | 'medium' | 'high';
  equipment: string[];
  equipmentAr: string[];
  chemicals: string[];
  chemicalsAr: string[];
  steps: TestStep[];
  expectedResults: ExpectedResult[];
  images: TestImage[];
  videos?: string[];
  tags: string[];
  tagsAr: string[];
  isActive: boolean;
  isFeatured: boolean;
  createdAt: string;
  updatedAt: string;
  viewCount: number;
  completionCount: number;
  rating: number;
  ratingCount: number;
}

interface TestStep {
  id: string;
  stepNumber: number;
  title: string;
  titleAr: string;
  description: string;
  descriptionAr: string;
  image?: string;
  video?: string;
  duration: number;
  safetyNotes: string;
  safetyNotesAr: string;
  tips: string;
  tipsAr: string;
}

interface ExpectedResult {
  id: string;
  condition: string;
  conditionAr: string;
  result: string;
  resultAr: string;
  color?: string;
  image?: string;
  interpretation: string;
  interpretationAr: string;
  confidence: number;
}

interface TestImage {
  id: string;
  url: string;
  alt: string;
  altAr: string;
  type: 'equipment' | 'step' | 'result' | 'safety';
  stepId?: string;
  resultId?: string;
}

interface ContentManagementProps {
  lang: Language;
}

interface ContentSettings {
  freeTestsEnabled: boolean;
  freeTestsLimit: number;
  premiumTestsEnabled: boolean;
  premiumPrice: number;
  currency: 'SAR' | 'USD';
  freeTestsList: number[];
  globalFreeAccess: boolean;
  enableAllTests: boolean;
  subscriptionPlans: {
    monthly: {
      enabled: boolean;
      price: number;
      testsLimit: number;
    };
    yearly: {
      enabled: boolean;
      price: number;
      testsLimit: number;
    };
    unlimited: {
      enabled: boolean;
      price: number;
    };
  };
  paymentMethods: {
    stcPay: boolean;
    creditCard: boolean;
    applePay: boolean;
  };
}

const defaultSettings: ContentSettings = {
  freeTestsEnabled: true,
  freeTestsLimit: 3,
  premiumTestsEnabled: true,
  premiumPrice: 10,
  currency: 'SAR',
  freeTestsList: [0, 1, 2], // First 3 tests are free
  globalFreeAccess: false, // افتراضياً معطل
  enableAllTests: false, // افتراضياً معطل
  subscriptionPlans: {
    monthly: {
      enabled: true,
      price: 29,
      testsLimit: 50
    },
    yearly: {
      enabled: true,
      price: 299,
      testsLimit: 1000
    },
    unlimited: {
      enabled: true,
      price: 499
    }
  },
  paymentMethods: {
    stcPay: true,
    creditCard: true,
    applePay: false
  }
};

export function ContentManagement({ lang }: ContentManagementProps) {
  const [settings, setSettings] = useState<ContentSettings>(defaultSettings);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const isRTL = lang === 'ar';

  const texts = {
    title: isRTL ? 'إدارة المحتوى والاشتراكات' : 'Content & Subscription Management',
    subtitle: isRTL ? 'تحكم في الوصول للاختبارات وأسعار الاشتراكات' : 'Control test access and subscription pricing',
    
    // Free Tests
    freeTests: isRTL ? 'الاختبارات المجانية' : 'Free Tests',
    enableFreeTests: isRTL ? 'تفعيل الاختبارات المجانية' : 'Enable Free Tests',
    freeTestsLimit: isRTL ? 'عدد الاختبارات المجانية' : 'Free Tests Limit',
    freeTestsDescription: isRTL ? 'عدد الاختبارات المسموح بها للمستخدمين غير المشتركين' : 'Number of tests allowed for non-subscribers',
    
    // Premium Tests
    premiumTests: isRTL ? 'الاختبارات المميزة' : 'Premium Tests',
    enablePremiumTests: isRTL ? 'تفعيل الاختبارات المميزة' : 'Enable Premium Tests',
    premiumPrice: isRTL ? 'سعر الاختبار المميز' : 'Premium Test Price',
    currency: isRTL ? 'العملة' : 'Currency',
    
    // Subscription Plans
    subscriptionPlans: isRTL ? 'خطط الاشتراك' : 'Subscription Plans',
    monthly: isRTL ? 'شهري' : 'Monthly',
    yearly: isRTL ? 'سنوي' : 'Yearly',
    unlimited: isRTL ? 'غير محدود' : 'Unlimited',
    price: isRTL ? 'السعر' : 'Price',
    testsLimit: isRTL ? 'حد الاختبارات' : 'Tests Limit',
    enabled: isRTL ? 'مفعل' : 'Enabled',
    
    // Payment Methods
    paymentMethods: isRTL ? 'طرق الدفع' : 'Payment Methods',
    stcPay: isRTL ? 'STC Pay' : 'STC Pay',
    creditCard: isRTL ? 'بطاقة ائتمان' : 'Credit Card',
    applePay: isRTL ? 'Apple Pay' : 'Apple Pay',
    
    // Actions
    save: isRTL ? 'حفظ الإعدادات' : 'Save Settings',
    saving: isRTL ? 'جاري الحفظ...' : 'Saving...',
    saved: isRTL ? 'تم الحفظ!' : 'Saved!',
    reset: isRTL ? 'إعادة تعيين' : 'Reset',
    
    // Status
    active: isRTL ? 'نشط' : 'Active',
    inactive: isRTL ? 'غير نشط' : 'Inactive',
    
    // Global Access
    globalFreeAccess: isRTL ? 'وصول مجاني شامل' : 'Global Free Access',
    enableAllTests: isRTL ? 'تفعيل جميع الاختبارات' : 'Enable All Tests',
    globalFreeAccessDesc: isRTL ? 'السماح لجميع المستخدمين بالوصول لجميع الاختبارات مجاناً' : 'Allow all users to access all tests for free',
    enableAllTestsDesc: isRTL ? 'إلغاء قفل جميع الاختبارات للمستخدمين المسجلين' : 'Unlock all tests for registered users',

    // Warnings
    warning: isRTL ? 'تحذير' : 'Warning',
    disableFreeTestsWarning: isRTL ? 'تعطيل الاختبارات المجانية سيتطلب من جميع المستخدمين الاشتراك' : 'Disabling free tests will require all users to subscribe',
  };

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const settingsDoc = await getDoc(doc(db, 'settings', 'content'));
      if (settingsDoc.exists()) {
        const data = settingsDoc.data() as ContentSettings;
        setSettings({ ...defaultSettings, ...data });
      }
    } catch (error) {
      console.error('Error loading content settings:', error);
      toast.error(isRTL ? 'خطأ في تحميل الإعدادات' : 'Error loading settings');
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    setSaving(true);
    try {
      // استخدام setDoc مع merge: true بدلاً من updateDoc لتجنب خطأ "No document to update"
      const settingsRef = doc(db, 'settings', 'content');
      await setDoc(settingsRef, {
        ...settings,
        updatedAt: new Date().toISOString(),
        createdAt: new Date().toISOString()
      }, { merge: true });

      // Update localStorage for immediate access
      localStorage.setItem('content_settings', JSON.stringify(settings));

      // Dispatch event for real-time updates
      window.dispatchEvent(new CustomEvent('contentSettingsUpdated', { detail: settings }));

      toast.success(isRTL ? 'تم حفظ الإعدادات بنجاح' : 'Settings saved successfully');
      console.log('✅ Content settings saved successfully to Firestore');
    } catch (error) {
      console.error('❌ Error saving content settings:', error);
      toast.error(isRTL ? 'خطأ في حفظ الإعدادات' : 'Error saving settings');
    } finally {
      setSaving(false);
    }
  };

  const resetSettings = () => {
    if (confirm(isRTL ? 'هل أنت متأكد من إعادة تعيين الإعدادات؟' : 'Are you sure you want to reset settings?')) {
      setSettings(defaultSettings);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

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
        <CogIcon className="h-8 w-8 text-blue-600" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Free Tests Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 rtl:space-x-reverse">
              <StarIcon className="h-5 w-5 text-green-600" />
              <span>{texts.freeTests}</span>
              <Badge variant={settings.freeTestsEnabled ? "default" : "secondary"}>
                {settings.freeTestsEnabled ? texts.active : texts.inactive}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-base">{texts.enableFreeTests}</Label>
                <p className="text-sm text-muted-foreground">
                  {texts.freeTestsDescription}
                </p>
              </div>
              <Switch
                checked={settings.freeTestsEnabled}
                onCheckedChange={(checked) =>
                  setSettings(prev => ({ ...prev, freeTestsEnabled: checked }))
                }
              />
            </div>
            
            {!settings.freeTestsEnabled && (
              <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                <div className="flex items-center space-x-2 rtl:space-x-reverse">
                  <ExclamationTriangleIcon className="h-4 w-4 text-yellow-600" />
                  <p className="text-sm text-yellow-800 dark:text-yellow-200">
                    {texts.disableFreeTestsWarning}
                  </p>
                </div>
              </div>
            )}
            
            {settings.freeTestsEnabled && (
              <div className="space-y-2">
                <Label htmlFor="freeTestsLimit">{texts.freeTestsLimit}</Label>
                <Input
                  id="freeTestsLimit"
                  type="number"
                  min="0"
                  max="50"
                  value={settings.freeTestsLimit}
                  onChange={(e) =>
                    setSettings(prev => ({ ...prev, freeTestsLimit: parseInt(e.target.value) || 0 }))
                  }
                />
              </div>
            )}

            {/* Global Access Controls */}
            <div className="space-y-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base font-medium">{texts.globalFreeAccess}</Label>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {texts.globalFreeAccessDesc}
                  </p>
                </div>
                <Switch
                  checked={settings.globalFreeAccess}
                  onCheckedChange={(checked) =>
                    setSettings(prev => ({ ...prev, globalFreeAccess: checked }))
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base font-medium">{texts.enableAllTests}</Label>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {texts.enableAllTestsDesc}
                  </p>
                </div>
                <Switch
                  checked={settings.enableAllTests}
                  onCheckedChange={(checked) =>
                    setSettings(prev => ({ ...prev, enableAllTests: checked }))
                  }
                />
              </div>

              {(settings.globalFreeAccess || settings.enableAllTests) && (
                <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                  <div className="flex items-center space-x-2 rtl:space-x-reverse">
                    <CheckCircleIcon className="h-4 w-4 text-green-600" />
                    <p className="text-sm text-green-800 dark:text-green-200">
                      {settings.globalFreeAccess
                        ? (isRTL ? 'جميع الاختبارات متاحة مجاناً لجميع المستخدمين' : 'All tests are free for all users')
                        : (isRTL ? 'جميع الاختبارات متاحة للمستخدمين المسجلين' : 'All tests are available for registered users')
                      }
                    </p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Premium Tests Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 rtl:space-x-reverse">
              <LockClosedIcon className="h-5 w-5 text-yellow-600" />
              <span>{texts.premiumTests}</span>
              <Badge variant={settings.premiumTestsEnabled ? "default" : "secondary"}>
                {settings.premiumTestsEnabled ? texts.active : texts.inactive}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-base">{texts.enablePremiumTests}</Label>
                <p className="text-sm text-muted-foreground">
                  {isRTL ? 'تفعيل الاختبارات المدفوعة' : 'Enable paid tests'}
                </p>
              </div>
              <Switch
                checked={settings.premiumTestsEnabled}
                onCheckedChange={(checked) =>
                  setSettings(prev => ({ ...prev, premiumTestsEnabled: checked }))
                }
              />
            </div>
            
            {settings.premiumTestsEnabled && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="premiumPrice">{texts.premiumPrice}</Label>
                    <Input
                      id="premiumPrice"
                      type="number"
                      min="1"
                      value={settings.premiumPrice}
                      onChange={(e) =>
                        setSettings(prev => ({ ...prev, premiumPrice: parseInt(e.target.value) || 1 }))
                      }
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="currency">{texts.currency}</Label>
                    <Select
                      value={settings.currency}
                      onValueChange={(value: 'SAR' | 'USD') =>
                        setSettings(prev => ({ ...prev, currency: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="SAR">SAR (ريال سعودي)</SelectItem>
                        <SelectItem value="USD">USD (دولار أمريكي)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Subscription Plans */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 rtl:space-x-reverse">
            <CurrencyDollarIcon className="h-5 w-5 text-blue-600" />
            <span>{texts.subscriptionPlans}</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Monthly Plan */}
            <Card className="border-2 border-gray-200 dark:border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>{texts.monthly}</span>
                  <Switch
                    checked={settings.subscriptionPlans.monthly.enabled}
                    onCheckedChange={(checked) =>
                      setSettings(prev => ({
                        ...prev,
                        subscriptionPlans: {
                          ...prev.subscriptionPlans,
                          monthly: { ...prev.subscriptionPlans.monthly, enabled: checked }
                        }
                      }))
                    }
                  />
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>{texts.price}</Label>
                  <Input
                    type="number"
                    min="1"
                    value={settings.subscriptionPlans.monthly.price}
                    onChange={(e) =>
                      setSettings(prev => ({
                        ...prev,
                        subscriptionPlans: {
                          ...prev.subscriptionPlans,
                          monthly: { ...prev.subscriptionPlans.monthly, price: parseInt(e.target.value) || 1 }
                        }
                      }))
                    }
                    disabled={!settings.subscriptionPlans.monthly.enabled}
                  />
                </div>
                <div className="space-y-2">
                  <Label>{texts.testsLimit}</Label>
                  <Input
                    type="number"
                    min="1"
                    value={settings.subscriptionPlans.monthly.testsLimit}
                    onChange={(e) =>
                      setSettings(prev => ({
                        ...prev,
                        subscriptionPlans: {
                          ...prev.subscriptionPlans,
                          monthly: { ...prev.subscriptionPlans.monthly, testsLimit: parseInt(e.target.value) || 1 }
                        }
                      }))
                    }
                    disabled={!settings.subscriptionPlans.monthly.enabled}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Yearly Plan */}
            <Card className="border-2 border-blue-200 dark:border-blue-700">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>{texts.yearly}</span>
                  <Switch
                    checked={settings.subscriptionPlans.yearly.enabled}
                    onCheckedChange={(checked) =>
                      setSettings(prev => ({
                        ...prev,
                        subscriptionPlans: {
                          ...prev.subscriptionPlans,
                          yearly: { ...prev.subscriptionPlans.yearly, enabled: checked }
                        }
                      }))
                    }
                  />
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>{texts.price}</Label>
                  <Input
                    type="number"
                    min="1"
                    value={settings.subscriptionPlans.yearly.price}
                    onChange={(e) =>
                      setSettings(prev => ({
                        ...prev,
                        subscriptionPlans: {
                          ...prev.subscriptionPlans,
                          yearly: { ...prev.subscriptionPlans.yearly, price: parseInt(e.target.value) || 1 }
                        }
                      }))
                    }
                    disabled={!settings.subscriptionPlans.yearly.enabled}
                  />
                </div>
                <div className="space-y-2">
                  <Label>{texts.testsLimit}</Label>
                  <Input
                    type="number"
                    min="1"
                    value={settings.subscriptionPlans.yearly.testsLimit}
                    onChange={(e) =>
                      setSettings(prev => ({
                        ...prev,
                        subscriptionPlans: {
                          ...prev.subscriptionPlans,
                          yearly: { ...prev.subscriptionPlans.yearly, testsLimit: parseInt(e.target.value) || 1 }
                        }
                      }))
                    }
                    disabled={!settings.subscriptionPlans.yearly.enabled}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Unlimited Plan */}
            <Card className="border-2 border-yellow-200 dark:border-yellow-700">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>{texts.unlimited}</span>
                  <Switch
                    checked={settings.subscriptionPlans.unlimited.enabled}
                    onCheckedChange={(checked) =>
                      setSettings(prev => ({
                        ...prev,
                        subscriptionPlans: {
                          ...prev.subscriptionPlans,
                          unlimited: { ...prev.subscriptionPlans.unlimited, enabled: checked }
                        }
                      }))
                    }
                  />
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>{texts.price}</Label>
                  <Input
                    type="number"
                    min="1"
                    value={settings.subscriptionPlans.unlimited.price}
                    onChange={(e) =>
                      setSettings(prev => ({
                        ...prev,
                        subscriptionPlans: {
                          ...prev.subscriptionPlans,
                          unlimited: { ...prev.subscriptionPlans.unlimited, price: parseInt(e.target.value) || 1 }
                        }
                      }))
                    }
                    disabled={!settings.subscriptionPlans.unlimited.enabled}
                  />
                </div>
                <div className="text-center py-4">
                  <Badge variant="secondary">
                    {isRTL ? 'اختبارات غير محدودة' : 'Unlimited Tests'}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>

      {/* Payment Methods */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 rtl:space-x-reverse">
            <CreditCardIcon className="h-5 w-5 text-green-600" />
            <span>{texts.paymentMethods}</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center space-x-2 rtl:space-x-reverse">
                <DevicePhoneMobileIcon className="h-5 w-5 text-purple-600" />
                <span>{texts.stcPay}</span>
              </div>
              <Switch
                checked={settings.paymentMethods.stcPay}
                onCheckedChange={(checked) =>
                  setSettings(prev => ({
                    ...prev,
                    paymentMethods: { ...prev.paymentMethods, stcPay: checked }
                  }))
                }
              />
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center space-x-2 rtl:space-x-reverse">
                <CreditCardIcon className="h-5 w-5 text-blue-600" />
                <span>{texts.creditCard}</span>
              </div>
              <Switch
                checked={settings.paymentMethods.creditCard}
                onCheckedChange={(checked) =>
                  setSettings(prev => ({
                    ...prev,
                    paymentMethods: { ...prev.paymentMethods, creditCard: checked }
                  }))
                }
              />
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center space-x-2 rtl:space-x-reverse">
                <DevicePhoneMobileIcon className="h-5 w-5 text-gray-600" />
                <span>{texts.applePay}</span>
              </div>
              <Switch
                checked={settings.paymentMethods.applePay}
                onCheckedChange={(checked) =>
                  setSettings(prev => ({
                    ...prev,
                    paymentMethods: { ...prev.paymentMethods, applePay: checked }
                  }))
                }
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-center pt-6">
        <div className="flex space-x-4 rtl:space-x-reverse">
          <Button onClick={resetSettings} variant="outline">
            {texts.reset}
          </Button>
          <Button onClick={saveSettings} disabled={saving} className="px-8">
            {saving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2 rtl:ml-2 rtl:mr-0"></div>
                {texts.saving}
              </>
            ) : (
              <>
                <CheckCircleIcon className="h-4 w-4 mr-2 rtl:ml-2 rtl:mr-0" />
                {texts.save}
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
