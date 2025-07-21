'use client';

import React, { useState, useEffect } from 'react';
import { Language } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  PlusIcon, 
  PencilIcon, 
  TrashIcon, 
  CheckIcon,
  XMarkIcon,
  ExclamationTriangleIcon,
  BanknotesIcon,
  CurrencyDollarIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

interface SubscriptionPlansManagementProps {
  lang: Language;
}

interface SubscriptionPlan {
  id: string;
  name_en: string;
  name_ar: string;
  description_en: string;
  description_ar: string;
  monthly_price: number;
  yearly_price: number;
  currency: string;
  features_en: string[];
  features_ar: string[];
  max_tests_per_month: number;
  is_popular: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export function SubscriptionPlansManagement({ lang }: SubscriptionPlansManagementProps) {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingPlan, setEditingPlan] = useState<SubscriptionPlan | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const isRTL = lang === 'ar';

  // Form state for adding/editing
  const [formData, setFormData] = useState({
    name_en: '',
    name_ar: '',
    description_en: '',
    description_ar: '',
    monthly_price: 0,
    yearly_price: 0,
    currency: 'SAR',
    features_en: [''],
    features_ar: [''],
    max_tests_per_month: 100,
    is_popular: false,
    is_active: true
  });

  useEffect(() => {
    loadPlans();
  }, []);

  const loadPlans = async () => {
    try {
      setLoading(true);
      
      // Mock data for subscription plans
      const mockPlans: SubscriptionPlan[] = [
        {
          id: 'basic-plan',
          name_en: 'Basic Plan',
          name_ar: 'الخطة الأساسية',
          description_en: 'Perfect for individual users and small labs',
          description_ar: 'مثالية للمستخدمين الأفراد والمختبرات الصغيرة',
          monthly_price: 99,
          yearly_price: 999,
          currency: 'SAR',
          features_en: [
            'Up to 50 tests per month',
            'Basic color analysis',
            'PDF reports',
            'Email support'
          ],
          features_ar: [
            'حتى 50 اختبار شهرياً',
            'تحليل الألوان الأساسي',
            'تقارير PDF',
            'دعم البريد الإلكتروني'
          ],
          max_tests_per_month: 50,
          is_popular: false,
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: 'professional-plan',
          name_en: 'Professional Plan',
          name_ar: 'الخطة المهنية',
          description_en: 'Ideal for professional labs and research institutions',
          description_ar: 'مثالية للمختبرات المهنية ومؤسسات البحث',
          monthly_price: 199,
          yearly_price: 1999,
          currency: 'SAR',
          features_en: [
            'Up to 200 tests per month',
            'Advanced color analysis',
            'Custom reports',
            'Priority support',
            'API access'
          ],
          features_ar: [
            'حتى 200 اختبار شهرياً',
            'تحليل الألوان المتقدم',
            'تقارير مخصصة',
            'دعم أولوية',
            'وصول API'
          ],
          max_tests_per_month: 200,
          is_popular: true,
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: 'enterprise-plan',
          name_en: 'Enterprise Plan',
          name_ar: 'خطة المؤسسات',
          description_en: 'For large organizations with unlimited testing needs',
          description_ar: 'للمؤسسات الكبيرة مع احتياجات اختبار غير محدودة',
          monthly_price: 499,
          yearly_price: 4999,
          currency: 'SAR',
          features_en: [
            'Unlimited tests',
            'Advanced analytics',
            'Custom integrations',
            '24/7 support',
            'Dedicated account manager'
          ],
          features_ar: [
            'اختبارات غير محدودة',
            'تحليلات متقدمة',
            'تكاملات مخصصة',
            'دعم 24/7',
            'مدير حساب مخصص'
          ],
          max_tests_per_month: -1, // Unlimited
          is_popular: false,
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ];

      setPlans(mockPlans);
      console.log(`💳 Loaded ${mockPlans.length} subscription plans`);
      
    } catch (error) {
      console.error('Error loading subscription plans:', error);
      toast.error(lang === 'ar' ? 'خطأ في تحميل خطط الاشتراك' : 'Error loading subscription plans');
    } finally {
      setLoading(false);
    }
  };

  const handleAddPlan = async () => {
    try {
      if (!formData.name_en || !formData.name_ar || formData.monthly_price <= 0) {
        toast.error(lang === 'ar' ? 'يرجى ملء جميع الحقول المطلوبة' : 'Please fill all required fields');
        return;
      }

      const newPlan: SubscriptionPlan = {
        id: `plan-${Date.now()}`,
        name_en: formData.name_en,
        name_ar: formData.name_ar,
        description_en: formData.description_en,
        description_ar: formData.description_ar,
        monthly_price: formData.monthly_price,
        yearly_price: formData.yearly_price,
        currency: formData.currency,
        features_en: formData.features_en.filter(f => f.trim() !== ''),
        features_ar: formData.features_ar.filter(f => f.trim() !== ''),
        max_tests_per_month: formData.max_tests_per_month,
        is_popular: formData.is_popular,
        is_active: formData.is_active,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      setPlans(prev => [...prev, newPlan]);
      
      // Reset form
      setFormData({
        name_en: '',
        name_ar: '',
        description_en: '',
        description_ar: '',
        monthly_price: 0,
        yearly_price: 0,
        currency: 'SAR',
        features_en: [''],
        features_ar: [''],
        max_tests_per_month: 100,
        is_popular: false,
        is_active: true
      });
      
      setShowAddForm(false);
      toast.success(lang === 'ar' ? 'تم إضافة الخطة بنجاح' : 'Plan added successfully');
      
    } catch (error) {
      console.error('Error adding plan:', error);
      toast.error(lang === 'ar' ? 'خطأ في إضافة الخطة' : 'Error adding plan');
    }
  };

  const handleEditPlan = async (plan: SubscriptionPlan) => {
    try {
      const updatedPlans = plans.map(p => 
        p.id === plan.id 
          ? { ...plan, updated_at: new Date().toISOString() }
          : p
      );
      
      setPlans(updatedPlans);
      setEditingPlan(null);
      toast.success(lang === 'ar' ? 'تم تحديث الخطة بنجاح' : 'Plan updated successfully');
      
    } catch (error) {
      console.error('Error updating plan:', error);
      toast.error(lang === 'ar' ? 'خطأ في تحديث الخطة' : 'Error updating plan');
    }
  };

  const handleDeletePlan = async (planId: string) => {
    try {
      setPlans(prev => prev.filter(p => p.id !== planId));
      setDeleteConfirm(null);
      toast.success(lang === 'ar' ? 'تم حذف الخطة بنجاح' : 'Plan deleted successfully');
      
    } catch (error) {
      console.error('Error deleting plan:', error);
      toast.error(lang === 'ar' ? 'خطأ في حذف الخطة' : 'Error deleting plan');
    }
  };

  const addFeature = (type: 'en' | 'ar') => {
    if (type === 'en') {
      setFormData(prev => ({ ...prev, features_en: [...prev.features_en, ''] }));
    } else {
      setFormData(prev => ({ ...prev, features_ar: [...prev.features_ar, ''] }));
    }
  };

  const removeFeature = (type: 'en' | 'ar', index: number) => {
    if (type === 'en') {
      setFormData(prev => ({ 
        ...prev, 
        features_en: prev.features_en.filter((_, i) => i !== index) 
      }));
    } else {
      setFormData(prev => ({ 
        ...prev, 
        features_ar: prev.features_ar.filter((_, i) => i !== index) 
      }));
    }
  };

  const updateFeature = (type: 'en' | 'ar', index: number, value: string) => {
    if (type === 'en') {
      setFormData(prev => ({
        ...prev,
        features_en: prev.features_en.map((f, i) => i === index ? value : f)
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        features_ar: prev.features_ar.map((f, i) => i === index ? value : f)
      }));
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2">{lang === 'ar' ? 'جاري التحميل...' : 'Loading...'}</span>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${isRTL ? 'rtl' : 'ltr'}`} dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3 rtl:space-x-reverse">
          <div className="w-10 h-10 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
            <BanknotesIcon className="h-6 w-6 text-green-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {lang === 'ar' ? 'إدارة خطط الاشتراك' : 'Subscription Plans Management'}
            </h1>
            <p className="text-gray-500">
              {lang === 'ar' 
                ? `إدارة ${plans.length} خطة اشتراك متاحة`
                : `Managing ${plans.length} available subscription plans`
              }
            </p>
          </div>
        </div>
        
        <Button onClick={() => setShowAddForm(true)} className="flex items-center space-x-2 rtl:space-x-reverse">
          <PlusIcon className="h-4 w-4" />
          <span>{lang === 'ar' ? 'إضافة خطة' : 'Add Plan'}</span>
        </Button>
      </div>

      {/* Add Plan Form */}
      {showAddForm && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>{lang === 'ar' ? 'إضافة خطة جديدة' : 'Add New Plan'}</span>
              <Button variant="ghost" size="sm" onClick={() => setShowAddForm(false)}>
                <XMarkIcon className="h-4 w-4" />
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  {lang === 'ar' ? 'اسم الخطة (إنجليزي)' : 'Plan Name (English)'} *
                </label>
                <Input
                  value={formData.name_en}
                  onChange={(e) => setFormData(prev => ({ ...prev, name_en: e.target.value }))}
                  placeholder="Enter plan name in English..."
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  {lang === 'ar' ? 'اسم الخطة (عربي)' : 'Plan Name (Arabic)'} *
                </label>
                <Input
                  value={formData.name_ar}
                  onChange={(e) => setFormData(prev => ({ ...prev, name_ar: e.target.value }))}
                  placeholder="أدخل اسم الخطة بالعربية..."
                  required
                  dir="rtl"
                />
              </div>
            </div>

            {/* Descriptions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  {lang === 'ar' ? 'الوصف (إنجليزي)' : 'Description (English)'}
                </label>
                <Textarea
                  value={formData.description_en}
                  onChange={(e) => setFormData(prev => ({ ...prev, description_en: e.target.value }))}
                  placeholder="Enter plan description in English..."
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  {lang === 'ar' ? 'الوصف (عربي)' : 'Description (Arabic)'}
                </label>
                <Textarea
                  value={formData.description_ar}
                  onChange={(e) => setFormData(prev => ({ ...prev, description_ar: e.target.value }))}
                  placeholder="أدخل وصف الخطة بالعربية..."
                  rows={3}
                  dir="rtl"
                />
              </div>
            </div>

            {/* Pricing */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  {lang === 'ar' ? 'السعر الشهري' : 'Monthly Price'} *
                </label>
                <div className="relative">
                  <CurrencyDollarIcon className="absolute left-3 rtl:right-3 rtl:left-auto top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.monthly_price}
                    onChange={(e) => setFormData(prev => ({ ...prev, monthly_price: parseFloat(e.target.value) || 0 }))}
                    className="pl-10 rtl:pr-10 rtl:pl-3"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  {lang === 'ar' ? 'السعر السنوي' : 'Yearly Price'} *
                </label>
                <div className="relative">
                  <CurrencyDollarIcon className="absolute left-3 rtl:right-3 rtl:left-auto top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.yearly_price}
                    onChange={(e) => setFormData(prev => ({ ...prev, yearly_price: parseFloat(e.target.value) || 0 }))}
                    className="pl-10 rtl:pr-10 rtl:pl-3"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  {lang === 'ar' ? 'العملة' : 'Currency'}
                </label>
                <select
                  value={formData.currency}
                  onChange={(e) => setFormData(prev => ({ ...prev, currency: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="SAR">SAR - ريال سعودي</option>
                  <option value="USD">USD - US Dollar</option>
                  <option value="EUR">EUR - Euro</option>
                </select>
              </div>
            </div>

            {/* Settings */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  {lang === 'ar' ? 'عدد الاختبارات الشهرية' : 'Monthly Tests Limit'}
                </label>
                <Input
                  type="number"
                  min="-1"
                  value={formData.max_tests_per_month}
                  onChange={(e) => setFormData(prev => ({ ...prev, max_tests_per_month: parseInt(e.target.value) || 0 }))}
                  placeholder={lang === 'ar' ? '-1 للاختبارات غير المحدودة' : '-1 for unlimited tests'}
                />
                <p className="text-xs text-gray-500 mt-1">
                  {lang === 'ar' ? 'استخدم -1 للاختبارات غير المحدودة' : 'Use -1 for unlimited tests'}
                </p>
              </div>

              <div className="space-y-3 pt-6">
                <div className="flex items-center space-x-2 rtl:space-x-reverse">
                  <input
                    type="checkbox"
                    id="is_popular"
                    checked={formData.is_popular}
                    onChange={(e) => setFormData(prev => ({ ...prev, is_popular: e.target.checked }))}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <label htmlFor="is_popular" className="text-sm font-medium">
                    {lang === 'ar' ? 'خطة شائعة' : 'Popular Plan'}
                  </label>
                </div>

                <div className="flex items-center space-x-2 rtl:space-x-reverse">
                  <input
                    type="checkbox"
                    id="is_active"
                    checked={formData.is_active}
                    onChange={(e) => setFormData(prev => ({ ...prev, is_active: e.target.checked }))}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <label htmlFor="is_active" className="text-sm font-medium">
                    {lang === 'ar' ? 'خطة نشطة' : 'Active Plan'}
                  </label>
                </div>
              </div>
            </div>

            {/* Features */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium mb-2">
                  {lang === 'ar' ? 'المميزات (إنجليزي)' : 'Features (English)'}
                </label>
                <div className="space-y-2">
                  {formData.features_en.map((feature, index) => (
                    <div key={index} className="flex items-center space-x-2 rtl:space-x-reverse">
                      <Input
                        value={feature}
                        onChange={(e) => updateFeature('en', index, e.target.value)}
                        placeholder="Enter feature..."
                        className="flex-1"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFeature('en', index)}
                        className="text-red-600"
                      >
                        <XMarkIcon className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => addFeature('en')}
                    className="w-full"
                  >
                    <PlusIcon className="h-4 w-4 mr-2" />
                    {lang === 'ar' ? 'إضافة ميزة' : 'Add Feature'}
                  </Button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  {lang === 'ar' ? 'المميزات (عربي)' : 'Features (Arabic)'}
                </label>
                <div className="space-y-2">
                  {formData.features_ar.map((feature, index) => (
                    <div key={index} className="flex items-center space-x-2 rtl:space-x-reverse">
                      <Input
                        value={feature}
                        onChange={(e) => updateFeature('ar', index, e.target.value)}
                        placeholder="أدخل الميزة..."
                        className="flex-1"
                        dir="rtl"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFeature('ar', index)}
                        className="text-red-600"
                      >
                        <XMarkIcon className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => addFeature('ar')}
                    className="w-full"
                  >
                    <PlusIcon className="h-4 w-4 mr-2" />
                    {lang === 'ar' ? 'إضافة ميزة' : 'Add Feature'}
                  </Button>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-2 rtl:space-x-reverse pt-4">
              <Button variant="outline" onClick={() => setShowAddForm(false)}>
                {lang === 'ar' ? 'إلغاء' : 'Cancel'}
              </Button>
              <Button onClick={handleAddPlan}>
                {lang === 'ar' ? 'إضافة الخطة' : 'Add Plan'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {plans.map((plan) => (
          <Card key={plan.id} className={`relative hover:shadow-lg transition-shadow ${plan.is_popular ? 'ring-2 ring-blue-500' : ''}`}>
            {plan.is_popular && (
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <Badge className="bg-blue-500 text-white px-3 py-1">
                  {lang === 'ar' ? 'الأكثر شعبية' : 'Most Popular'}
                </Badge>
              </div>
            )}

            <CardHeader className="text-center pb-4">
              <CardTitle className="text-xl">
                {isRTL ? plan.name_ar : plan.name_en}
              </CardTitle>
              <CardDescription>
                {isRTL ? plan.description_ar : plan.description_en}
              </CardDescription>

              <div className="mt-4">
                <div className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                  {plan.monthly_price} {plan.currency}
                  <span className="text-sm font-normal text-gray-500">
                    /{lang === 'ar' ? 'شهر' : 'month'}
                  </span>
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {plan.yearly_price} {plan.currency} {lang === 'ar' ? 'سنوياً' : 'yearly'}
                  <span className="text-green-600 ml-2">
                    ({Math.round((1 - (plan.yearly_price / 12) / plan.monthly_price) * 100)}% {lang === 'ar' ? 'توفير' : 'save'})
                  </span>
                </div>
              </div>
            </CardHeader>

            <CardContent>
              <div className="space-y-3 mb-6">
                <div className="flex items-center justify-between text-sm">
                  <span>{lang === 'ar' ? 'الاختبارات الشهرية:' : 'Monthly Tests:'}</span>
                  <span className="font-medium">
                    {plan.max_tests_per_month === -1
                      ? (lang === 'ar' ? 'غير محدود' : 'Unlimited')
                      : plan.max_tests_per_month
                    }
                  </span>
                </div>

                <div className="space-y-2">
                  {(isRTL ? plan.features_ar : plan.features_en).map((feature, index) => (
                    <div key={index} className="flex items-center space-x-2 rtl:space-x-reverse text-sm">
                      <CheckIcon className="h-4 w-4 text-green-500 flex-shrink-0" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t">
                <div className="flex items-center space-x-2 rtl:space-x-reverse">
                  <Badge variant={plan.is_active ? 'default' : 'secondary'}>
                    {plan.is_active
                      ? (lang === 'ar' ? 'نشط' : 'Active')
                      : (lang === 'ar' ? 'غير نشط' : 'Inactive')
                    }
                  </Badge>
                </div>

                <div className="flex items-center space-x-2 rtl:space-x-reverse">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setEditingPlan(plan)}
                  >
                    <PencilIcon className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setDeleteConfirm(plan.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Delete Confirmation Dialog */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 rtl:space-x-reverse text-red-600">
                <ExclamationTriangleIcon className="h-5 w-5" />
                <span>{lang === 'ar' ? 'تأكيد الحذف' : 'Confirm Delete'}</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 dark:text-gray-300 mb-6">
                {lang === 'ar'
                  ? 'هل أنت متأكد من حذف هذه الخطة؟ لا يمكن التراجع عن هذا الإجراء.'
                  : 'Are you sure you want to delete this plan? This action cannot be undone.'
                }
              </p>
              <div className="flex justify-end space-x-2 rtl:space-x-reverse">
                <Button variant="outline" onClick={() => setDeleteConfirm(null)}>
                  {lang === 'ar' ? 'إلغاء' : 'Cancel'}
                </Button>
                <Button variant="destructive" onClick={() => handleDeletePlan(deleteConfirm)}>
                  {lang === 'ar' ? 'حذف' : 'Delete'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
