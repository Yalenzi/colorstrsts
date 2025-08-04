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
  BanknotesIcon,
  ShieldCheckIcon,
  GlobeAltIcon,
  CogIcon,
  KeyIcon,
  LockClosedIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  InformationCircleIcon,
  ArrowPathIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  ClockIcon,
  ChartBarIcon,
  DocumentTextIcon,
  PhoneIcon,
  EnvelopeIcon,
  BuildingOfficeIcon,
  IdentificationIcon,
  CurrencyDollarIcon,
  ReceiptPercentIcon,
  CalendarIcon,
  UserGroupIcon,
  StarIcon
} from '@heroicons/react/24/outline';

interface PaymentGateway {
  id: string;
  name: string;
  nameAr: string;
  type: 'stripe' | 'paypal' | 'mada' | 'stc_pay' | 'tabby' | 'tamara' | 'apple_pay' | 'google_pay' | 'bank_transfer' | 'cash_on_delivery';
  enabled: boolean;
  isDefault: boolean;
  configuration: {
    apiKey?: string;
    secretKey?: string;
    webhookSecret?: string;
    merchantId?: string;
    environment: 'sandbox' | 'production';
    currency: string;
    supportedCountries: string[];
    minimumAmount: number;
    maximumAmount: number;
    processingFee: number;
    processingFeeType: 'fixed' | 'percentage';
  };
  features: {
    refunds: boolean;
    partialRefunds: boolean;
    subscriptions: boolean;
    installments: boolean;
    savedCards: boolean;
    multiCurrency: boolean;
    webhooks: boolean;
    fraud_protection: boolean;
  };
  branding: {
    logo?: string;
    color?: string;
    displayName: string;
    displayNameAr: string;
    description: string;
    descriptionAr: string;
  };
  statistics: {
    totalTransactions: number;
    successfulTransactions: number;
    failedTransactions: number;
    totalAmount: number;
    averageAmount: number;
    lastTransaction: string;
  };
}

interface GlobalPaymentConfig {
  general: {
    defaultCurrency: string;
    supportedCurrencies: string[];
    taxRate: number;
    taxIncluded: boolean;
    minimumOrderAmount: number;
    maximumOrderAmount: number;
    allowGuestCheckout: boolean;
    requirePhoneVerification: boolean;
    requireEmailVerification: boolean;
    autoCapture: boolean;
    paymentTimeout: number; // minutes
  };
  security: {
    enableFraudDetection: boolean;
    maxFailedAttempts: number;
    blockDuration: number; // minutes
    requireCVV: boolean;
    require3DSecure: boolean;
    enableTokenization: boolean;
    encryptSensitiveData: boolean;
    logAllTransactions: boolean;
    enableRiskScoring: boolean;
    suspiciousAmountThreshold: number;
  };
  notifications: {
    emailNotifications: {
      enabled: boolean;
      paymentSuccess: boolean;
      paymentFailed: boolean;
      refundProcessed: boolean;
      subscriptionRenewed: boolean;
      subscriptionCancelled: boolean;
      fraudAlert: boolean;
    };
    smsNotifications: {
      enabled: boolean;
      paymentSuccess: boolean;
      paymentFailed: boolean;
      refundProcessed: boolean;
      fraudAlert: boolean;
    };
    webhookNotifications: {
      enabled: boolean;
      endpoints: string[];
      events: string[];
      retryAttempts: number;
      timeout: number;
    };
  };
  compliance: {
    pciCompliance: boolean;
    gdprCompliance: boolean;
    dataRetentionPeriod: number; // days
    anonymizeData: boolean;
    auditLogging: boolean;
    regulatoryReporting: boolean;
    kycRequired: boolean;
    amlChecks: boolean;
  };
  localization: {
    defaultLanguage: string;
    supportedLanguages: string[];
    dateFormat: string;
    timeFormat: string;
    numberFormat: string;
    currencyDisplay: 'symbol' | 'code' | 'name';
    rtlSupport: boolean;
  };
  business: {
    companyName: string;
    companyNameAr: string;
    businessType: string;
    taxNumber: string;
    commercialRegister: string;
    address: {
      street: string;
      city: string;
      state: string;
      country: string;
      postalCode: string;
    };
    contact: {
      email: string;
      phone: string;
      website: string;
      supportEmail: string;
      supportPhone: string;
    };
    banking: {
      bankName: string;
      accountNumber: string;
      iban: string;
      swiftCode: string;
    };
  };
}

interface PaymentMethod {
  id: string;
  name: string;
  nameAr: string;
  type: 'card' | 'wallet' | 'bank' | 'bnpl' | 'cash';
  icon: string;
  enabled: boolean;
  order: number;
  countries: string[];
  currencies: string[];
  minimumAmount: number;
  maximumAmount: number;
  processingTime: string;
  processingTimeAr: string;
  fees: {
    fixed: number;
    percentage: number;
    currency: string;
  };
  features: string[];
  requirements: string[];
}

interface GlobalPaymentSettingsProps {
  lang: Language;
}

export function GlobalPaymentSettings({ lang }: GlobalPaymentSettingsProps) {
  const [paymentGateways, setPaymentGateways] = useState<PaymentGateway[]>([]);
  const [globalConfig, setGlobalConfig] = useState<GlobalPaymentConfig | null>(null);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showGatewayDialog, setShowGatewayDialog] = useState(false);
  const [showMethodDialog, setShowMethodDialog] = useState(false);
  const [editingGateway, setEditingGateway] = useState<PaymentGateway | null>(null);
  const [editingMethod, setEditingMethod] = useState<PaymentMethod | null>(null);

  const isRTL = lang === 'ar';

  const texts = {
    title: isRTL ? 'إعدادات الدفع العامة' : 'Global Payment Settings',
    subtitle: isRTL ? 'إدارة شاملة لجميع إعدادات وطرق الدفع والأمان' : 'Comprehensive management of all payment settings, methods and security',

    // Tabs
    gateways: isRTL ? 'بوابات الدفع' : 'Payment Gateways',
    methods: isRTL ? 'طرق الدفع' : 'Payment Methods',
    general: isRTL ? 'الإعدادات العامة' : 'General Settings',
    security: isRTL ? 'الأمان' : 'Security',
    notifications: isRTL ? 'الإشعارات' : 'Notifications',
    compliance: isRTL ? 'الامتثال' : 'Compliance',
    business: isRTL ? 'معلومات الشركة' : 'Business Info',
    analytics: isRTL ? 'التحليلات' : 'Analytics',

    // Payment Gateways
    addGateway: isRTL ? 'إضافة بوابة دفع' : 'Add Payment Gateway',
    editGateway: isRTL ? 'تعديل بوابة الدفع' : 'Edit Payment Gateway',
    deleteGateway: isRTL ? 'حذف بوابة الدفع' : 'Delete Payment Gateway',
    gatewayName: isRTL ? 'اسم البوابة' : 'Gateway Name',
    gatewayNameAr: isRTL ? 'اسم البوابة بالعربية' : 'Gateway Name (Arabic)',
    gatewayType: isRTL ? 'نوع البوابة' : 'Gateway Type',
    enabled: isRTL ? 'مفعل' : 'Enabled',
    isDefault: isRTL ? 'افتراضي' : 'Default',
    environment: isRTL ? 'البيئة' : 'Environment',
    sandbox: isRTL ? 'تجريبي' : 'Sandbox',
    production: isRTL ? 'إنتاج' : 'Production',

    // Configuration
    configuration: isRTL ? 'التكوين' : 'Configuration',
    apiKey: isRTL ? 'مفتاح API' : 'API Key',
    secretKey: isRTL ? 'المفتاح السري' : 'Secret Key',
    webhookSecret: isRTL ? 'سر الـ Webhook' : 'Webhook Secret',
    merchantId: isRTL ? 'معرف التاجر' : 'Merchant ID',
    currency: isRTL ? 'العملة' : 'Currency',
    supportedCountries: isRTL ? 'البلدان المدعومة' : 'Supported Countries',
    minimumAmount: isRTL ? 'الحد الأدنى للمبلغ' : 'Minimum Amount',
    maximumAmount: isRTL ? 'الحد الأقصى للمبلغ' : 'Maximum Amount',
    processingFee: isRTL ? 'رسوم المعالجة' : 'Processing Fee',
    processingFeeType: isRTL ? 'نوع رسوم المعالجة' : 'Processing Fee Type',
    fixed: isRTL ? 'ثابت' : 'Fixed',
    percentage: isRTL ? 'نسبة مئوية' : 'Percentage',

    // Features
    features: isRTL ? 'المزايا' : 'Features',
    refunds: isRTL ? 'المبالغ المستردة' : 'Refunds',
    partialRefunds: isRTL ? 'الاسترداد الجزئي' : 'Partial Refunds',
    subscriptions: isRTL ? 'الاشتراكات' : 'Subscriptions',
    installments: isRTL ? 'الأقساط' : 'Installments',
    savedCards: isRTL ? 'البطاقات المحفوظة' : 'Saved Cards',
    multiCurrency: isRTL ? 'متعدد العملات' : 'Multi Currency',
    webhooks: isRTL ? 'الـ Webhooks' : 'Webhooks',
    fraudProtection: isRTL ? 'الحماية من الاحتيال' : 'Fraud Protection',

    // General Settings
    defaultCurrency: isRTL ? 'العملة الافتراضية' : 'Default Currency',
    supportedCurrencies: isRTL ? 'العملات المدعومة' : 'Supported Currencies',
    taxRate: isRTL ? 'معدل الضريبة (%)' : 'Tax Rate (%)',
    taxIncluded: isRTL ? 'الضريبة مشمولة' : 'Tax Included',
    allowGuestCheckout: isRTL ? 'السماح بالدفع كضيف' : 'Allow Guest Checkout',
    requirePhoneVerification: isRTL ? 'يتطلب تأكيد الهاتف' : 'Require Phone Verification',
    requireEmailVerification: isRTL ? 'يتطلب تأكيد البريد الإلكتروني' : 'Require Email Verification',
    autoCapture: isRTL ? 'الالتقاط التلقائي' : 'Auto Capture',
    paymentTimeout: isRTL ? 'انتهاء وقت الدفع (دقيقة)' : 'Payment Timeout (minutes)',

    // Security Settings
    enableFraudDetection: isRTL ? 'تفعيل كشف الاحتيال' : 'Enable Fraud Detection',
    maxFailedAttempts: isRTL ? 'الحد الأقصى للمحاولات الفاشلة' : 'Max Failed Attempts',
    blockDuration: isRTL ? 'مدة الحظر (دقيقة)' : 'Block Duration (minutes)',
    requireCVV: isRTL ? 'يتطلب CVV' : 'Require CVV',
    require3DSecure: isRTL ? 'يتطلب 3D Secure' : 'Require 3D Secure',
    enableTokenization: isRTL ? 'تفعيل الترميز' : 'Enable Tokenization',
    encryptSensitiveData: isRTL ? 'تشفير البيانات الحساسة' : 'Encrypt Sensitive Data',
    logAllTransactions: isRTL ? 'تسجيل جميع المعاملات' : 'Log All Transactions',
    enableRiskScoring: isRTL ? 'تفعيل تقييم المخاطر' : 'Enable Risk Scoring',
    suspiciousAmountThreshold: isRTL ? 'حد المبلغ المشبوه' : 'Suspicious Amount Threshold',

    // Notifications
    emailNotifications: isRTL ? 'إشعارات البريد الإلكتروني' : 'Email Notifications',
    smsNotifications: isRTL ? 'إشعارات الرسائل النصية' : 'SMS Notifications',
    webhookNotifications: isRTL ? 'إشعارات الـ Webhook' : 'Webhook Notifications',
    paymentSuccess: isRTL ? 'نجاح الدفع' : 'Payment Success',
    paymentFailed: isRTL ? 'فشل الدفع' : 'Payment Failed',
    refundProcessed: isRTL ? 'تمت معالجة الاسترداد' : 'Refund Processed',
    subscriptionRenewed: isRTL ? 'تجديد الاشتراك' : 'Subscription Renewed',
    subscriptionCancelled: isRTL ? 'إلغاء الاشتراك' : 'Subscription Cancelled',
    fraudAlert: isRTL ? 'تنبيه احتيال' : 'Fraud Alert',
    endpoints: isRTL ? 'نقاط النهاية' : 'Endpoints',
    events: isRTL ? 'الأحداث' : 'Events',
    retryAttempts: isRTL ? 'محاولات الإعادة' : 'Retry Attempts',
    timeout: isRTL ? 'انتهاء الوقت' : 'Timeout',

    // Compliance
    pciCompliance: isRTL ? 'امتثال PCI' : 'PCI Compliance',
    gdprCompliance: isRTL ? 'امتثال GDPR' : 'GDPR Compliance',
    dataRetentionPeriod: isRTL ? 'فترة الاحتفاظ بالبيانات (أيام)' : 'Data Retention Period (days)',
    anonymizeData: isRTL ? 'إخفاء هوية البيانات' : 'Anonymize Data',
    auditLogging: isRTL ? 'تسجيل المراجعة' : 'Audit Logging',
    regulatoryReporting: isRTL ? 'التقارير التنظيمية' : 'Regulatory Reporting',
    kycRequired: isRTL ? 'يتطلب KYC' : 'KYC Required',
    amlChecks: isRTL ? 'فحوصات AML' : 'AML Checks',

    // Business Info
    companyName: isRTL ? 'اسم الشركة' : 'Company Name',
    companyNameAr: isRTL ? 'اسم الشركة بالعربية' : 'Company Name (Arabic)',
    businessType: isRTL ? 'نوع النشاط' : 'Business Type',
    taxNumber: isRTL ? 'الرقم الضريبي' : 'Tax Number',
    commercialRegister: isRTL ? 'السجل التجاري' : 'Commercial Register',
    address: isRTL ? 'العنوان' : 'Address',
    street: isRTL ? 'الشارع' : 'Street',
    city: isRTL ? 'المدينة' : 'City',
    state: isRTL ? 'المنطقة' : 'State',
    country: isRTL ? 'البلد' : 'Country',
    postalCode: isRTL ? 'الرمز البريدي' : 'Postal Code',
    contact: isRTL ? 'معلومات الاتصال' : 'Contact Information',
    email: isRTL ? 'البريد الإلكتروني' : 'Email',
    phone: isRTL ? 'الهاتف' : 'Phone',
    website: isRTL ? 'الموقع الإلكتروني' : 'Website',
    supportEmail: isRTL ? 'بريد الدعم' : 'Support Email',
    supportPhone: isRTL ? 'هاتف الدعم' : 'Support Phone',
    banking: isRTL ? 'المعلومات المصرفية' : 'Banking Information',
    bankName: isRTL ? 'اسم البنك' : 'Bank Name',
    accountNumber: isRTL ? 'رقم الحساب' : 'Account Number',
    iban: isRTL ? 'رقم الآيبان' : 'IBAN',
    swiftCode: isRTL ? 'رمز SWIFT' : 'SWIFT Code',

    // Payment Methods
    addMethod: isRTL ? 'إضافة طريقة دفع' : 'Add Payment Method',
    editMethod: isRTL ? 'تعديل طريقة الدفع' : 'Edit Payment Method',
    deleteMethod: isRTL ? 'حذف طريقة الدفع' : 'Delete Payment Method',
    methodName: isRTL ? 'اسم طريقة الدفع' : 'Payment Method Name',
    methodNameAr: isRTL ? 'اسم طريقة الدفع بالعربية' : 'Payment Method Name (Arabic)',
    methodType: isRTL ? 'نوع طريقة الدفع' : 'Payment Method Type',
    card: isRTL ? 'بطاقة' : 'Card',
    wallet: isRTL ? 'محفظة' : 'Wallet',
    bank: isRTL ? 'بنك' : 'Bank',
    bnpl: isRTL ? 'اشتر الآن ادفع لاحقاً' : 'Buy Now Pay Later',
    cash: isRTL ? 'نقدي' : 'Cash',
    icon: isRTL ? 'الأيقونة' : 'Icon',
    order: isRTL ? 'الترتيب' : 'Order',
    countries: isRTL ? 'البلدان' : 'Countries',
    currencies: isRTL ? 'العملات' : 'Currencies',
    processingTime: isRTL ? 'وقت المعالجة' : 'Processing Time',
    processingTimeAr: isRTL ? 'وقت المعالجة بالعربية' : 'Processing Time (Arabic)',
    fees: isRTL ? 'الرسوم' : 'Fees',
    requirements: isRTL ? 'المتطلبات' : 'Requirements',

    // Gateway Types
    stripe: 'Stripe',
    paypal: 'PayPal',
    mada: 'مدى',
    stc_pay: 'STC Pay',
    tabby: 'Tabby',
    tamara: 'Tamara',
    apple_pay: 'Apple Pay',
    google_pay: 'Google Pay',
    bank_transfer: isRTL ? 'تحويل بنكي' : 'Bank Transfer',
    cash_on_delivery: isRTL ? 'الدفع عند الاستلام' : 'Cash on Delivery',

    // Statistics
    statistics: isRTL ? 'الإحصائيات' : 'Statistics',
    totalTransactions: isRTL ? 'إجمالي المعاملات' : 'Total Transactions',
    successfulTransactions: isRTL ? 'المعاملات الناجحة' : 'Successful Transactions',
    failedTransactions: isRTL ? 'المعاملات الفاشلة' : 'Failed Transactions',
    totalAmount: isRTL ? 'إجمالي المبلغ' : 'Total Amount',
    averageAmount: isRTL ? 'متوسط المبلغ' : 'Average Amount',
    lastTransaction: isRTL ? 'آخر معاملة' : 'Last Transaction',
    successRate: isRTL ? 'معدل النجاح' : 'Success Rate',

    // Actions
    save: isRTL ? 'حفظ' : 'Save',
    cancel: isRTL ? 'إلغاء' : 'Cancel',
    delete: isRTL ? 'حذف' : 'Delete',
    edit: isRTL ? 'تعديل' : 'Edit',
    view: isRTL ? 'عرض' : 'View',
    test: isRTL ? 'اختبار' : 'Test',
    refresh: isRTL ? 'تحديث' : 'Refresh',
    configure: isRTL ? 'تكوين' : 'Configure',

    // Messages
    saving: isRTL ? 'جاري الحفظ...' : 'Saving...',
    saved: isRTL ? 'تم الحفظ بنجاح' : 'Saved successfully',
    error: isRTL ? 'حدث خطأ' : 'An error occurred',
    deleteConfirm: isRTL ? 'هل أنت متأكد من الحذف؟' : 'Are you sure you want to delete?',
    testSuccess: isRTL ? 'نجح الاختبار' : 'Test successful',
    testFailed: isRTL ? 'فشل الاختبار' : 'Test failed',

    // Validation
    required: isRTL ? 'هذا الحقل مطلوب' : 'This field is required',
    invalidEmail: isRTL ? 'بريد إلكتروني غير صحيح' : 'Invalid email',
    invalidPhone: isRTL ? 'رقم هاتف غير صحيح' : 'Invalid phone number',
    invalidUrl: isRTL ? 'رابط غير صحيح' : 'Invalid URL',
    invalidAmount: isRTL ? 'مبلغ غير صحيح' : 'Invalid amount',

    // Status
    active: isRTL ? 'نشط' : 'Active',
    inactive: isRTL ? 'غير نشط' : 'Inactive',
    pending: isRTL ? 'في الانتظار' : 'Pending',
    configured: isRTL ? 'مكون' : 'Configured',
    notConfigured: isRTL ? 'غير مكون' : 'Not Configured',

    // Currencies
    sar: isRTL ? 'ريال سعودي' : 'Saudi Riyal',
    usd: isRTL ? 'دولار أمريكي' : 'US Dollar',
    eur: isRTL ? 'يورو' : 'Euro',
    aed: isRTL ? 'درهم إماراتي' : 'UAE Dirham',

    // Countries
    sa: isRTL ? 'السعودية' : 'Saudi Arabia',
    ae: isRTL ? 'الإمارات' : 'UAE',
    kw: isRTL ? 'الكويت' : 'Kuwait',
    qa: isRTL ? 'قطر' : 'Qatar',
    bh: isRTL ? 'البحرين' : 'Bahrain',
    om: isRTL ? 'عمان' : 'Oman',

    // Languages
    ar: isRTL ? 'العربية' : 'Arabic',
    en: isRTL ? 'الإنجليزية' : 'English',

    // Date/Time Formats
    dateFormat: isRTL ? 'تنسيق التاريخ' : 'Date Format',
    timeFormat: isRTL ? 'تنسيق الوقت' : 'Time Format',
    numberFormat: isRTL ? 'تنسيق الأرقام' : 'Number Format',
    currencyDisplay: isRTL ? 'عرض العملة' : 'Currency Display',
    symbol: isRTL ? 'رمز' : 'Symbol',
    code: isRTL ? 'كود' : 'Code',
    name: isRTL ? 'اسم' : 'Name',
    rtlSupport: isRTL ? 'دعم RTL' : 'RTL Support',
  };

  useEffect(() => {
    loadPaymentGateways();
    loadGlobalConfig();
    loadPaymentMethods();
  }, []);

  const loadPaymentGateways = async () => {
    try {
      setLoading(true);
      console.log('🔄 بدء تحميل بوابات الدفع...');

      // Mock data for now - replace with actual Firebase call
      const gateways: PaymentGateway[] = [
        {
          id: 'stripe',
          name: 'Stripe',
          nameAr: 'سترايب',
          type: 'stripe',
          enabled: true,
          isDefault: true,
          configuration: {
            environment: 'sandbox',
            currency: 'SAR',
            supportedCountries: ['SA', 'AE', 'KW', 'QA'],
            minimumAmount: 1,
            maximumAmount: 100000,
            processingFee: 2.9,
            processingFeeType: 'percentage'
          },
          features: {
            refunds: true,
            partialRefunds: true,
            subscriptions: true,
            installments: false,
            savedCards: true,
            multiCurrency: true,
            webhooks: true,
            fraud_protection: true
          },
          branding: {
            color: '#635BFF',
            displayName: 'Stripe',
            displayNameAr: 'سترايب',
            description: 'Secure online payments',
            descriptionAr: 'مدفوعات آمنة عبر الإنترنت'
          },
          statistics: {
            totalTransactions: 1250,
            successfulTransactions: 1180,
            failedTransactions: 70,
            totalAmount: 315000,
            averageAmount: 252,
            lastTransaction: '2024-01-15T10:30:00Z'
          }
        },
        {
          id: 'mada',
          name: 'Mada',
          nameAr: 'مدى',
          type: 'mada',
          enabled: true,
          isDefault: false,
          configuration: {
            environment: 'production',
            currency: 'SAR',
            supportedCountries: ['SA'],
            minimumAmount: 1,
            maximumAmount: 50000,
            processingFee: 1.5,
            processingFeeType: 'percentage'
          },
          features: {
            refunds: true,
            partialRefunds: false,
            subscriptions: false,
            installments: false,
            savedCards: false,
            multiCurrency: false,
            webhooks: true,
            fraud_protection: true
          },
          branding: {
            color: '#00A651',
            displayName: 'Mada',
            displayNameAr: 'مدى',
            description: 'Saudi national payment system',
            descriptionAr: 'نظام المدفوعات الوطني السعودي'
          },
          statistics: {
            totalTransactions: 850,
            successfulTransactions: 820,
            failedTransactions: 30,
            totalAmount: 180000,
            averageAmount: 212,
            lastTransaction: '2024-01-15T09:45:00Z'
          }
        }
      ];

      setPaymentGateways(gateways);
      console.log(`✅ تم تحميل ${gateways.length} بوابة دفع بنجاح`);
    } catch (error) {
      console.error('❌ خطأ في تحميل بوابات الدفع:', error);
      toast.error(texts.error);
    } finally {
      setLoading(false);
    }
  };

  const loadGlobalConfig = async () => {
    try {
      console.log('🔄 بدء تحميل الإعدادات العامة...');

      // Mock data for now - replace with actual Firebase call
      const config: GlobalPaymentConfig = {
        general: {
          defaultCurrency: 'SAR',
          supportedCurrencies: ['SAR', 'USD', 'EUR', 'AED'],
          taxRate: 15,
          taxIncluded: true,
          minimumOrderAmount: 1,
          maximumOrderAmount: 100000,
          allowGuestCheckout: true,
          requirePhoneVerification: false,
          requireEmailVerification: true,
          autoCapture: true,
          paymentTimeout: 30
        },
        security: {
          enableFraudDetection: true,
          maxFailedAttempts: 3,
          blockDuration: 30,
          requireCVV: true,
          require3DSecure: true,
          enableTokenization: true,
          encryptSensitiveData: true,
          logAllTransactions: true,
          enableRiskScoring: true,
          suspiciousAmountThreshold: 10000
        },
        notifications: {
          emailNotifications: {
            enabled: true,
            paymentSuccess: true,
            paymentFailed: true,
            refundProcessed: true,
            subscriptionRenewed: true,
            subscriptionCancelled: true,
            fraudAlert: true
          },
          smsNotifications: {
            enabled: false,
            paymentSuccess: false,
            paymentFailed: true,
            refundProcessed: false,
            fraudAlert: true
          },
          webhookNotifications: {
            enabled: true,
            endpoints: ['https://api.colorstest.com/webhooks/payment'],
            events: ['payment.success', 'payment.failed', 'refund.processed'],
            retryAttempts: 3,
            timeout: 30
          }
        },
        compliance: {
          pciCompliance: true,
          gdprCompliance: true,
          dataRetentionPeriod: 2555, // 7 years
          anonymizeData: true,
          auditLogging: true,
          regulatoryReporting: true,
          kycRequired: false,
          amlChecks: true
        },
        localization: {
          defaultLanguage: 'ar',
          supportedLanguages: ['ar', 'en'],
          dateFormat: 'DD/MM/YYYY',
          timeFormat: '24h',
          numberFormat: 'arabic',
          currencyDisplay: 'symbol',
          rtlSupport: true
        },
        business: {
          companyName: 'ColorTest Company',
          companyNameAr: 'شركة كولور تست',
          businessType: 'Technology',
          taxNumber: '123456789',
          commercialRegister: 'CR-123456789',
          address: {
            street: 'King Fahd Road',
            city: 'Riyadh',
            state: 'Riyadh Province',
            country: 'Saudi Arabia',
            postalCode: '12345'
          },
          contact: {
            email: 'info@colorstest.com',
            phone: '+966501234567',
            website: 'https://colorstest.com',
            supportEmail: 'support@colorstest.com',
            supportPhone: '+966501234568'
          },
          banking: {
            bankName: 'Saudi National Bank',
            accountNumber: '123456789012',
            iban: 'SA1234567890123456789012',
            swiftCode: 'SNBKSARI'
          }
        }
      };

      setGlobalConfig(config);
      console.log('✅ تم تحميل الإعدادات العامة بنجاح');
    } catch (error) {
      console.error('❌ خطأ في تحميل الإعدادات العامة:', error);
    }
  };

  const loadPaymentMethods = async () => {
    try {
      console.log('🔄 بدء تحميل طرق الدفع...');

      // Mock data for now - replace with actual Firebase call
      const methods: PaymentMethod[] = [
        {
          id: 'visa',
          name: 'Visa',
          nameAr: 'فيزا',
          type: 'card',
          icon: 'visa-icon',
          enabled: true,
          order: 1,
          countries: ['SA', 'AE', 'KW', 'QA', 'BH', 'OM'],
          currencies: ['SAR', 'USD', 'EUR', 'AED'],
          minimumAmount: 1,
          maximumAmount: 100000,
          processingTime: 'Instant',
          processingTimeAr: 'فوري',
          fees: {
            fixed: 0,
            percentage: 2.9,
            currency: 'SAR'
          },
          features: ['3D Secure', 'Tokenization', 'Recurring'],
          requirements: ['Valid card', 'CVV verification']
        },
        {
          id: 'mastercard',
          name: 'Mastercard',
          nameAr: 'ماستركارد',
          type: 'card',
          icon: 'mastercard-icon',
          enabled: true,
          order: 2,
          countries: ['SA', 'AE', 'KW', 'QA', 'BH', 'OM'],
          currencies: ['SAR', 'USD', 'EUR', 'AED'],
          minimumAmount: 1,
          maximumAmount: 100000,
          processingTime: 'Instant',
          processingTimeAr: 'فوري',
          fees: {
            fixed: 0,
            percentage: 2.9,
            currency: 'SAR'
          },
          features: ['3D Secure', 'Tokenization', 'Recurring'],
          requirements: ['Valid card', 'CVV verification']
        },
        {
          id: 'mada',
          name: 'Mada',
          nameAr: 'مدى',
          type: 'card',
          icon: 'mada-icon',
          enabled: true,
          order: 3,
          countries: ['SA'],
          currencies: ['SAR'],
          minimumAmount: 1,
          maximumAmount: 50000,
          processingTime: 'Instant',
          processingTimeAr: 'فوري',
          fees: {
            fixed: 0,
            percentage: 1.5,
            currency: 'SAR'
          },
          features: ['Local payment', 'High security'],
          requirements: ['Saudi bank account', 'Mada card']
        },
        {
          id: 'stc_pay',
          name: 'STC Pay',
          nameAr: 'إس تي سي باي',
          type: 'wallet',
          icon: 'stc-pay-icon',
          enabled: true,
          order: 4,
          countries: ['SA'],
          currencies: ['SAR'],
          minimumAmount: 1,
          maximumAmount: 10000,
          processingTime: 'Instant',
          processingTimeAr: 'فوري',
          fees: {
            fixed: 0,
            percentage: 2.0,
            currency: 'SAR'
          },
          features: ['Mobile wallet', 'QR code', 'Instant transfer'],
          requirements: ['STC Pay account', 'Mobile verification']
        },
        {
          id: 'apple_pay',
          name: 'Apple Pay',
          nameAr: 'آبل باي',
          type: 'wallet',
          icon: 'apple-pay-icon',
          enabled: true,
          order: 5,
          countries: ['SA', 'AE', 'KW', 'QA'],
          currencies: ['SAR', 'USD', 'AED'],
          minimumAmount: 1,
          maximumAmount: 50000,
          processingTime: 'Instant',
          processingTimeAr: 'فوري',
          fees: {
            fixed: 0,
            percentage: 2.9,
            currency: 'SAR'
          },
          features: ['Touch ID', 'Face ID', 'Secure'],
          requirements: ['iOS device', 'Apple ID', 'Supported card']
        },
        {
          id: 'tabby',
          name: 'Tabby',
          nameAr: 'تابي',
          type: 'bnpl',
          icon: 'tabby-icon',
          enabled: true,
          order: 6,
          countries: ['SA', 'AE', 'KW'],
          currencies: ['SAR', 'AED', 'KWD'],
          minimumAmount: 100,
          maximumAmount: 5000,
          processingTime: '1-2 business days',
          processingTimeAr: '1-2 يوم عمل',
          fees: {
            fixed: 0,
            percentage: 3.5,
            currency: 'SAR'
          },
          features: ['Split payments', 'No interest', 'Instant approval'],
          requirements: ['Age 18+', 'Valid ID', 'Credit check']
        }
      ];

      setPaymentMethods(methods);
      console.log(`✅ تم تحميل ${methods.length} طريقة دفع بنجاح`);
    } catch (error) {
      console.error('❌ خطأ في تحميل طرق الدفع:', error);
    }
  };

  const saveGlobalConfig = async (config: GlobalPaymentConfig) => {
    try {
      setSaving(true);
      console.log('🔄 بدء حفظ الإعدادات العامة...');

      // Save to Firebase
      const configRef = doc(db, 'settings', 'payment_config');
      await setDoc(configRef, {
        ...config,
        updatedAt: new Date()
      });

      setGlobalConfig(config);
      toast.success(texts.saved);
      console.log('✅ تم حفظ الإعدادات العامة بنجاح');
    } catch (error) {
      console.error('❌ خطأ في حفظ الإعدادات العامة:', error);
      toast.error(texts.error);
    } finally {
      setSaving(false);
    }
  };

  const toggleGateway = async (gatewayId: string, enabled: boolean) => {
    try {
      console.log(`🔄 ${enabled ? 'تفعيل' : 'إلغاء تفعيل'} بوابة الدفع: ${gatewayId}`);

      setPaymentGateways(prev => prev.map(gateway =>
        gateway.id === gatewayId ? { ...gateway, enabled } : gateway
      ));

      toast.success(enabled ?
        (isRTL ? 'تم تفعيل بوابة الدفع' : 'Payment gateway enabled') :
        (isRTL ? 'تم إلغاء تفعيل بوابة الدفع' : 'Payment gateway disabled')
      );
    } catch (error) {
      console.error('❌ خطأ في تغيير حالة بوابة الدفع:', error);
      toast.error(texts.error);
    }
  };

  const setDefaultGateway = async (gatewayId: string) => {
    try {
      console.log(`🔄 تعيين بوابة الدفع الافتراضية: ${gatewayId}`);

      setPaymentGateways(prev => prev.map(gateway => ({
        ...gateway,
        isDefault: gateway.id === gatewayId
      })));

      toast.success(isRTL ? 'تم تعيين بوابة الدفع الافتراضية' : 'Default payment gateway set');
    } catch (error) {
      console.error('❌ خطأ في تعيين بوابة الدفع الافتراضية:', error);
      toast.error(texts.error);
    }
  };

  const testGateway = async (gatewayId: string) => {
    try {
      console.log(`🔄 اختبار بوابة الدفع: ${gatewayId}`);

      // Simulate test
      await new Promise(resolve => setTimeout(resolve, 2000));

      toast.success(texts.testSuccess);
    } catch (error) {
      console.error('❌ خطأ في اختبار بوابة الدفع:', error);
      toast.error(texts.testFailed);
    }
  };

  const getGatewayStatusBadge = (gateway: PaymentGateway) => {
    if (!gateway.enabled) {
      return <Badge variant="secondary">{texts.inactive}</Badge>;
    }

    const hasRequiredConfig = gateway.configuration.apiKey || gateway.configuration.merchantId;
    if (!hasRequiredConfig) {
      return <Badge variant="destructive">{texts.notConfigured}</Badge>;
    }

    return <Badge variant="default">{texts.active}</Badge>;
  };

  const getMethodTypeBadge = (type: PaymentMethod['type']) => {
    const config = {
      card: { color: 'bg-blue-100 text-blue-800', text: texts.card },
      wallet: { color: 'bg-green-100 text-green-800', text: texts.wallet },
      bank: { color: 'bg-purple-100 text-purple-800', text: texts.bank },
      bnpl: { color: 'bg-orange-100 text-orange-800', text: texts.bnpl },
      cash: { color: 'bg-gray-100 text-gray-800', text: texts.cash }
    };

    const typeConfig = config[type];
    return <Badge className={typeConfig.color}>{typeConfig.text}</Badge>;
  };

  const formatCurrency = (amount: number, currency: string = 'SAR') => {
    return new Intl.NumberFormat(isRTL ? 'ar-SA' : 'en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2
    }).format(amount);
  };

  const calculateSuccessRate = (gateway: PaymentGateway) => {
    if (gateway.statistics.totalTransactions === 0) return 0;
    return Math.round((gateway.statistics.successfulTransactions / gateway.statistics.totalTransactions) * 100);
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
          <Button variant="outline" onClick={loadPaymentGateways}>
            <ArrowPathIcon className="h-4 w-4 mr-2 rtl:ml-2 rtl:mr-0" />
            {texts.refresh}
          </Button>
        </div>
      </div>

      {/* Payment Settings Tabs */}
      <Tabs defaultValue="gateways" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 lg:grid-cols-8">
          <TabsTrigger value="gateways">{texts.gateways}</TabsTrigger>
          <TabsTrigger value="methods">{texts.methods}</TabsTrigger>
          <TabsTrigger value="general">{texts.general}</TabsTrigger>
          <TabsTrigger value="security">{texts.security}</TabsTrigger>
          <TabsTrigger value="notifications">{texts.notifications}</TabsTrigger>
          <TabsTrigger value="compliance">{texts.compliance}</TabsTrigger>
          <TabsTrigger value="business">{texts.business}</TabsTrigger>
          <TabsTrigger value="analytics">{texts.analytics}</TabsTrigger>
        </TabsList>

        {/* Payment Gateways Tab */}
        <TabsContent value="gateways">
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium">{texts.gateways}</h3>
              <Button onClick={() => setShowGatewayDialog(true)}>
                <PlusIcon className="h-4 w-4 mr-2 rtl:ml-2 rtl:mr-0" />
                {texts.addGateway}
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {paymentGateways.map((gateway) => (
                <Card key={gateway.id} className="relative">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2 rtl:space-x-reverse">
                        <div
                          className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold"
                          style={{ backgroundColor: gateway.branding.color }}
                        >
                          {gateway.name.charAt(0)}
                        </div>
                        <div>
                          <h4 className="font-medium">{isRTL ? gateway.nameAr : gateway.name}</h4>
                          <p className="text-xs text-gray-500">{gateway.type}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-1 rtl:space-x-reverse">
                        {gateway.isDefault && (
                          <Badge variant="outline" className="text-xs">
                            {texts.isDefault}
                          </Badge>
                        )}
                        {getGatewayStatusBadge(gateway)}
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    <div className="text-sm">
                      <p className="text-gray-600 dark:text-gray-400">
                        {isRTL ? gateway.branding.descriptionAr : gateway.branding.description}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600">{texts.environment}</p>
                        <p className="font-medium">
                          {gateway.configuration.environment === 'sandbox' ? texts.sandbox : texts.production}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-600">{texts.currency}</p>
                        <p className="font-medium">{gateway.configuration.currency}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">{texts.processingFee}</p>
                        <p className="font-medium">
                          {gateway.configuration.processingFee}
                          {gateway.configuration.processingFeeType === 'percentage' ? '%' : ` ${gateway.configuration.currency}`}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-600">{texts.successRate}</p>
                        <p className="font-medium text-green-600">{calculateSuccessRate(gateway)}%</p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <p className="text-sm font-medium">{texts.features}</p>
                      <div className="flex flex-wrap gap-1">
                        {Object.entries(gateway.features).filter(([_, enabled]) => enabled).map(([feature]) => (
                          <Badge key={feature} variant="outline" className="text-xs">
                            {texts[feature as keyof typeof texts] || feature}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t">
                      <div className="flex items-center space-x-2 rtl:space-x-reverse">
                        <Switch
                          checked={gateway.enabled}
                          onCheckedChange={(checked) => toggleGateway(gateway.id, checked)}
                        />
                        <Label className="text-sm">{texts.enabled}</Label>
                      </div>

                      <div className="flex space-x-1 rtl:space-x-reverse">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => testGateway(gateway.id)}
                        >
                          <CheckCircleIcon className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setEditingGateway(gateway);
                            setShowGatewayDialog(true);
                          }}
                        >
                          <PencilIcon className="h-4 w-4" />
                        </Button>
                        {!gateway.isDefault && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setDefaultGateway(gateway.id)}
                          >
                            <StarIcon className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </TabsContent>

        {/* Payment Methods Tab */}
        <TabsContent value="methods">
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium">{texts.methods}</h3>
              <Button onClick={() => setShowMethodDialog(true)}>
                <PlusIcon className="h-4 w-4 mr-2 rtl:ml-2 rtl:mr-0" />
                {texts.addMethod}
              </Button>
            </div>

            <div className="space-y-4">
              {paymentMethods.map((method) => (
                <Card key={method.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4 rtl:space-x-reverse">
                        <div className="w-12 h-8 bg-gray-100 rounded flex items-center justify-center">
                          <span className="text-xs font-medium">{method.name.substring(0, 3)}</span>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 rtl:space-x-reverse mb-1">
                            <h4 className="font-medium">{isRTL ? method.nameAr : method.name}</h4>
                            {getMethodTypeBadge(method.type)}
                            <Badge variant={method.enabled ? 'default' : 'secondary'}>
                              {method.enabled ? texts.active : texts.inactive}
                            </Badge>
                          </div>

                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div>
                              <p className="text-gray-600">{texts.processingTime}</p>
                              <p className="font-medium">{isRTL ? method.processingTimeAr : method.processingTime}</p>
                            </div>
                            <div>
                              <p className="text-gray-600">{texts.fees}</p>
                              <p className="font-medium">
                                {method.fees.percentage > 0 && `${method.fees.percentage}%`}
                                {method.fees.fixed > 0 && ` + ${formatCurrency(method.fees.fixed, method.fees.currency)}`}
                              </p>
                            </div>
                            <div>
                              <p className="text-gray-600">{texts.minimumAmount}</p>
                              <p className="font-medium">{formatCurrency(method.minimumAmount)}</p>
                            </div>
                            <div>
                              <p className="text-gray-600">{texts.maximumAmount}</p>
                              <p className="font-medium">{formatCurrency(method.maximumAmount)}</p>
                            </div>
                          </div>

                          <div className="mt-2 flex flex-wrap gap-1">
                            {method.features.map((feature) => (
                              <Badge key={feature} variant="outline" className="text-xs">
                                {feature}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="flex space-x-2 rtl:space-x-reverse">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setEditingMethod(method);
                            setShowMethodDialog(true);
                          }}
                        >
                          <PencilIcon className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <EyeIcon className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </TabsContent>

        {/* General Settings Tab */}
        <TabsContent value="general">
          {globalConfig && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2 rtl:space-x-reverse">
                    <CogIcon className="h-5 w-5" />
                    <span>{texts.general}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>{texts.defaultCurrency}</Label>
                      <Select
                        value={globalConfig.general.defaultCurrency}
                        onValueChange={(value) => setGlobalConfig(prev => prev ? {
                          ...prev,
                          general: { ...prev.general, defaultCurrency: value }
                        } : null)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="SAR">{texts.sar}</SelectItem>
                          <SelectItem value="USD">{texts.usd}</SelectItem>
                          <SelectItem value="EUR">{texts.eur}</SelectItem>
                          <SelectItem value="AED">{texts.aed}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>{texts.taxRate}</Label>
                      <Input
                        type="number"
                        value={globalConfig.general.taxRate}
                        onChange={(e) => setGlobalConfig(prev => prev ? {
                          ...prev,
                          general: { ...prev.general, taxRate: parseFloat(e.target.value) || 0 }
                        } : null)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>{texts.minimumAmount}</Label>
                      <Input
                        type="number"
                        value={globalConfig.general.minimumOrderAmount}
                        onChange={(e) => setGlobalConfig(prev => prev ? {
                          ...prev,
                          general: { ...prev.general, minimumOrderAmount: parseFloat(e.target.value) || 0 }
                        } : null)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>{texts.maximumAmount}</Label>
                      <Input
                        type="number"
                        value={globalConfig.general.maximumOrderAmount}
                        onChange={(e) => setGlobalConfig(prev => prev ? {
                          ...prev,
                          general: { ...prev.general, maximumOrderAmount: parseFloat(e.target.value) || 0 }
                        } : null)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>{texts.paymentTimeout}</Label>
                      <Input
                        type="number"
                        value={globalConfig.general.paymentTimeout}
                        onChange={(e) => setGlobalConfig(prev => prev ? {
                          ...prev,
                          general: { ...prev.general, paymentTimeout: parseInt(e.target.value) || 30 }
                        } : null)}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="flex items-center space-x-2 rtl:space-x-reverse">
                      <Switch
                        checked={globalConfig.general.taxIncluded}
                        onCheckedChange={(checked) => setGlobalConfig(prev => prev ? {
                          ...prev,
                          general: { ...prev.general, taxIncluded: checked }
                        } : null)}
                      />
                      <Label>{texts.taxIncluded}</Label>
                    </div>

                    <div className="flex items-center space-x-2 rtl:space-x-reverse">
                      <Switch
                        checked={globalConfig.general.allowGuestCheckout}
                        onCheckedChange={(checked) => setGlobalConfig(prev => prev ? {
                          ...prev,
                          general: { ...prev.general, allowGuestCheckout: checked }
                        } : null)}
                      />
                      <Label>{texts.allowGuestCheckout}</Label>
                    </div>

                    <div className="flex items-center space-x-2 rtl:space-x-reverse">
                      <Switch
                        checked={globalConfig.general.requirePhoneVerification}
                        onCheckedChange={(checked) => setGlobalConfig(prev => prev ? {
                          ...prev,
                          general: { ...prev.general, requirePhoneVerification: checked }
                        } : null)}
                      />
                      <Label>{texts.requirePhoneVerification}</Label>
                    </div>

                    <div className="flex items-center space-x-2 rtl:space-x-reverse">
                      <Switch
                        checked={globalConfig.general.requireEmailVerification}
                        onCheckedChange={(checked) => setGlobalConfig(prev => prev ? {
                          ...prev,
                          general: { ...prev.general, requireEmailVerification: checked }
                        } : null)}
                      />
                      <Label>{texts.requireEmailVerification}</Label>
                    </div>

                    <div className="flex items-center space-x-2 rtl:space-x-reverse">
                      <Switch
                        checked={globalConfig.general.autoCapture}
                        onCheckedChange={(checked) => setGlobalConfig(prev => prev ? {
                          ...prev,
                          general: { ...prev.general, autoCapture: checked }
                        } : null)}
                      />
                      <Label>{texts.autoCapture}</Label>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="flex justify-end">
                <Button
                  onClick={() => globalConfig && saveGlobalConfig(globalConfig)}
                  disabled={saving}
                >
                  {saving ? texts.saving : texts.save}
                </Button>
              </div>
            </div>
          )}
        </TabsContent>

        {/* Security Settings Tab */}
        <TabsContent value="security">
          {globalConfig && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2 rtl:space-x-reverse">
                    <ShieldCheckIcon className="h-5 w-5" />
                    <span>{texts.security}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>{texts.maxFailedAttempts}</Label>
                      <Input
                        type="number"
                        value={globalConfig.security.maxFailedAttempts}
                        onChange={(e) => setGlobalConfig(prev => prev ? {
                          ...prev,
                          security: { ...prev.security, maxFailedAttempts: parseInt(e.target.value) || 3 }
                        } : null)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>{texts.blockDuration}</Label>
                      <Input
                        type="number"
                        value={globalConfig.security.blockDuration}
                        onChange={(e) => setGlobalConfig(prev => prev ? {
                          ...prev,
                          security: { ...prev.security, blockDuration: parseInt(e.target.value) || 30 }
                        } : null)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>{texts.suspiciousAmountThreshold}</Label>
                      <Input
                        type="number"
                        value={globalConfig.security.suspiciousAmountThreshold}
                        onChange={(e) => setGlobalConfig(prev => prev ? {
                          ...prev,
                          security: { ...prev.security, suspiciousAmountThreshold: parseFloat(e.target.value) || 10000 }
                        } : null)}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="flex items-center space-x-2 rtl:space-x-reverse">
                      <Switch
                        checked={globalConfig.security.enableFraudDetection}
                        onCheckedChange={(checked) => setGlobalConfig(prev => prev ? {
                          ...prev,
                          security: { ...prev.security, enableFraudDetection: checked }
                        } : null)}
                      />
                      <Label>{texts.enableFraudDetection}</Label>
                    </div>

                    <div className="flex items-center space-x-2 rtl:space-x-reverse">
                      <Switch
                        checked={globalConfig.security.requireCVV}
                        onCheckedChange={(checked) => setGlobalConfig(prev => prev ? {
                          ...prev,
                          security: { ...prev.security, requireCVV: checked }
                        } : null)}
                      />
                      <Label>{texts.requireCVV}</Label>
                    </div>

                    <div className="flex items-center space-x-2 rtl:space-x-reverse">
                      <Switch
                        checked={globalConfig.security.require3DSecure}
                        onCheckedChange={(checked) => setGlobalConfig(prev => prev ? {
                          ...prev,
                          security: { ...prev.security, require3DSecure: checked }
                        } : null)}
                      />
                      <Label>{texts.require3DSecure}</Label>
                    </div>

                    <div className="flex items-center space-x-2 rtl:space-x-reverse">
                      <Switch
                        checked={globalConfig.security.enableTokenization}
                        onCheckedChange={(checked) => setGlobalConfig(prev => prev ? {
                          ...prev,
                          security: { ...prev.security, enableTokenization: checked }
                        } : null)}
                      />
                      <Label>{texts.enableTokenization}</Label>
                    </div>

                    <div className="flex items-center space-x-2 rtl:space-x-reverse">
                      <Switch
                        checked={globalConfig.security.encryptSensitiveData}
                        onCheckedChange={(checked) => setGlobalConfig(prev => prev ? {
                          ...prev,
                          security: { ...prev.security, encryptSensitiveData: checked }
                        } : null)}
                      />
                      <Label>{texts.encryptSensitiveData}</Label>
                    </div>

                    <div className="flex items-center space-x-2 rtl:space-x-reverse">
                      <Switch
                        checked={globalConfig.security.logAllTransactions}
                        onCheckedChange={(checked) => setGlobalConfig(prev => prev ? {
                          ...prev,
                          security: { ...prev.security, logAllTransactions: checked }
                        } : null)}
                      />
                      <Label>{texts.logAllTransactions}</Label>
                    </div>

                    <div className="flex items-center space-x-2 rtl:space-x-reverse">
                      <Switch
                        checked={globalConfig.security.enableRiskScoring}
                        onCheckedChange={(checked) => setGlobalConfig(prev => prev ? {
                          ...prev,
                          security: { ...prev.security, enableRiskScoring: checked }
                        } : null)}
                      />
                      <Label>{texts.enableRiskScoring}</Label>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="flex justify-end">
                <Button
                  onClick={() => globalConfig && saveGlobalConfig(globalConfig)}
                  disabled={saving}
                >
                  {saving ? texts.saving : texts.save}
                </Button>
              </div>
            </div>
          )}
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics">
          <div className="space-y-6">
            <h3 className="text-lg font-medium">{texts.analytics}</h3>

            {/* Payment Gateway Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{texts.totalTransactions}</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">
                        {paymentGateways.reduce((sum, gateway) => sum + gateway.statistics.totalTransactions, 0).toLocaleString()}
                      </p>
                    </div>
                    <ChartBarIcon className="h-8 w-8 text-blue-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{texts.successfulTransactions}</p>
                      <p className="text-2xl font-bold text-green-600">
                        {paymentGateways.reduce((sum, gateway) => sum + gateway.statistics.successfulTransactions, 0).toLocaleString()}
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
                      <p className="text-sm text-gray-600 dark:text-gray-400">{texts.totalAmount}</p>
                      <p className="text-2xl font-bold text-purple-600">
                        {formatCurrency(paymentGateways.reduce((sum, gateway) => sum + gateway.statistics.totalAmount, 0))}
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
                      <p className="text-sm text-gray-600 dark:text-gray-400">{texts.averageAmount}</p>
                      <p className="text-2xl font-bold text-orange-600">
                        {formatCurrency(
                          paymentGateways.reduce((sum, gateway) => sum + gateway.statistics.totalAmount, 0) /
                          Math.max(paymentGateways.reduce((sum, gateway) => sum + gateway.statistics.totalTransactions, 0), 1)
                        )}
                      </p>
                    </div>
                    <CurrencyDollarIcon className="h-8 w-8 text-orange-600" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Gateway Performance */}
            <Card>
              <CardHeader>
                <CardTitle>{isRTL ? 'أداء بوابات الدفع' : 'Payment Gateway Performance'}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {paymentGateways.map((gateway) => (
                    <div key={gateway.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4 rtl:space-x-reverse">
                        <div
                          className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold"
                          style={{ backgroundColor: gateway.branding.color }}
                        >
                          {gateway.name.charAt(0)}
                        </div>
                        <div>
                          <h4 className="font-medium">{isRTL ? gateway.nameAr : gateway.name}</h4>
                          <p className="text-sm text-gray-600">
                            {gateway.statistics.totalTransactions.toLocaleString()} {texts.totalTransactions}
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-8 text-center">
                        <div>
                          <p className="text-sm text-gray-600">{texts.successRate}</p>
                          <p className="text-lg font-bold text-green-600">{calculateSuccessRate(gateway)}%</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">{texts.totalAmount}</p>
                          <p className="text-lg font-bold">{formatCurrency(gateway.statistics.totalAmount)}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">{texts.averageAmount}</p>
                          <p className="text-lg font-bold">{formatCurrency(gateway.statistics.averageAmount)}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Coming Soon Message for other tabs */}
        <TabsContent value="notifications">
          <Card>
            <CardContent className="p-8 text-center">
              <InformationCircleIcon className="h-16 w-16 text-blue-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">
                {isRTL ? 'إعدادات الإشعارات' : 'Notification Settings'}
              </h3>
              <p className="text-gray-600">
                {isRTL ? 'ستكون متاحة قريباً' : 'Coming Soon'}
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="compliance">
          <Card>
            <CardContent className="p-8 text-center">
              <ShieldCheckIcon className="h-16 w-16 text-green-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">
                {isRTL ? 'إعدادات الامتثال' : 'Compliance Settings'}
              </h3>
              <p className="text-gray-600">
                {isRTL ? 'ستكون متاحة قريباً' : 'Coming Soon'}
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="business">
          <Card>
            <CardContent className="p-8 text-center">
              <BuildingOfficeIcon className="h-16 w-16 text-purple-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">
                {isRTL ? 'معلومات الشركة' : 'Business Information'}
              </h3>
              <p className="text-gray-600">
                {isRTL ? 'ستكون متاحة قريباً' : 'Coming Soon'}
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}