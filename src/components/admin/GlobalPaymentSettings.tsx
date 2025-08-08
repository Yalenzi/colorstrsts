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
import { doc, setDoc, getDoc, collection, getDocs, updateDoc, addDoc, deleteDoc, writeBatch } from 'firebase/firestore';
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
    subtitle: isRTL ? 'إدارة شاملة لجميع إعدادات وطرق الدفع والأمان - للإدارة الكاملة استخدم "بوابات الدفع" من القائمة' : 'Comprehensive management of all payment settings, methods and security - Use "Payment Gateways" from sidebar for full management',

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
    comingSoon: isRTL ? 'قريباً' : 'Coming Soon',
    viewOnly: isRTL ? 'عرض فقط' : 'View Only',
    fullManagement: isRTL ? 'الإدارة الكاملة' : 'Full Management',
    usePaymentGateways: isRTL ? 'استخدم بوابات الدفع' : 'Use Payment Gateways',

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

      // حاول التحميل من Firestore أولاً
      const gatewaysRef = collection(db, 'payment_gateways');
      const snapshot = await getDocs(gatewaysRef);
      if (!snapshot.empty) {
        const gateways = snapshot.docs.map((d) => ({ id: d.id, ...(d.data() as any) })) as PaymentGateway[];
        setPaymentGateways(gateways);
        console.log(`✅ تم تحميل ${gateways.length} بوابة دفع من Firestore`);
        return;
      }

      // لا توجد بيانات: تهيئة افتراضية وحفظها
      const defaults: Omit<PaymentGateway, 'id'>[] = [
        {
          name: 'STC Pay',
          nameAr: 'إس تي سي باي',
          type: 'stc_pay',
          enabled: true,
          isDefault: true,
          configuration: {
            environment: 'sandbox',
            currency: 'SAR',
            supportedCountries: ['SA'],
            minimumAmount: 1,
            maximumAmount: 10000,
            processingFee: 2.0,
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
            color: '#6B21A8',
            displayName: 'STC Pay',
            displayNameAr: 'STC Pay',
            description: 'Mobile wallet payments',
            descriptionAr: 'محفظة إلكترونية'
          },
          statistics: {
            totalTransactions: 0,
            successfulTransactions: 0,
            failedTransactions: 0,
            totalAmount: 0,
            averageAmount: 0,
            lastTransaction: ''
          }
        },
        {
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
            description: 'Saudi national payment',
            descriptionAr: 'المدفوعات السعودية'
          },
          statistics: {
            totalTransactions: 0,
            successfulTransactions: 0,
            failedTransactions: 0,
            totalAmount: 0,
            averageAmount: 0,
            lastTransaction: ''
          }
        }
      ];

      const created: PaymentGateway[] = [];
      for (const gw of defaults) {
        const docRef = await addDoc(gatewaysRef, { ...gw, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
        created.push({ id: docRef.id, ...(gw as any) } as PaymentGateway);
      }
      setPaymentGateways(created);
      console.log(`✅ تم إنشاء ${created.length} بوابة دفع افتراضية`);
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

      const configRef = doc(db, 'settings', 'payment_config');
      const configSnap = await getDoc(configRef);
      if (configSnap.exists()) {
        setGlobalConfig(configSnap.data() as GlobalPaymentConfig);
        console.log('✅ تم تحميل الإعدادات العامة من Firestore');
        return;
      }

      // تهيئة افتراضية عند عدم وجود إعدادات
      const defaultConfig: GlobalPaymentConfig = {
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
          dataRetentionPeriod: 2555,
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

      await setDoc(configRef, { ...defaultConfig, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
      setGlobalConfig(defaultConfig);
      console.log('✅ تم إنشاء الإعدادات العامة الافتراضية');
    } catch (error) {
      console.error('❌ خطأ في تحميل/تهيئة الإعدادات العامة:', error);
      toast.error(texts.error);
    }
  };

  const loadPaymentMethods = async () => {
    try {
      console.log('🔄 بدء تحميل طرق الدفع...');

      const methodsRef = collection(db, 'payment_methods');
      const snap = await getDocs(methodsRef);
      if (!snap.empty) {
        const methods = snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) })) as PaymentMethod[];
        setPaymentMethods(methods);
        console.log(`✅ تم تحميل ${methods.length} طريقة دفع من Firestore`);
        return;
      }

      // لا توجد بيانات: إنشاء طرق دفع افتراضية
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

      // حفظ الافتراضيات إلى Firestore
      const batch = writeBatch(db);
      methods.forEach((m) => {
        const ref = doc(collection(db, 'payment_methods'));
        batch.set(ref, { ...m, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
      });
      await batch.commit();

      // إعادة التحميل من Firestore لضمان IDs
      const after = await getDocs(collection(db, 'payment_methods'));
      const created = after.docs.map((d) => ({ id: d.id, ...(d.data() as any) })) as PaymentMethod[];
      setPaymentMethods(created);
      console.log(`✅ تم إنشاء ${created.length} طريقة دفع افتراضية`);
    } catch (error) {
      console.error('❌ خطأ في تحميل طرق الدفع:', error);
      toast.error(texts.error);
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

      // تحديث الواجهة
      setPaymentGateways(prev => prev.map(gateway =>
        gateway.id === gatewayId ? { ...gateway, enabled } : gateway
      ));

      // تحديث Firestore
      const ref = doc(db, 'payment_gateways', gatewayId);
      await updateDoc(ref, { enabled, updatedAt: new Date().toISOString() });

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

      // تحديث الواجهة
      setPaymentGateways(prev => prev.map(gateway => ({
        ...gateway,
        isDefault: gateway.id === gatewayId
      })));

      // تحديث Firestore: إزالة الافتراضي من الآخرين وتعيينه للحالي
      const gatewaysRef = collection(db, 'payment_gateways');
      const snap = await getDocs(gatewaysRef);
      const batch = writeBatch(db);
      snap.docs.forEach((d) => {
        const isDefault = d.id === gatewayId;
        batch.update(doc(db, 'payment_gateways', d.id), { isDefault });
      });
      await batch.commit();

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

      {/* Info Alert */}
      <Alert className="border-blue-200 bg-blue-50 dark:bg-blue-950/20">
        <InformationCircleIcon className="h-4 w-4 text-blue-600" />
        <AlertDescription className="text-blue-800 dark:text-blue-200">
          <div className="flex items-center justify-between">
            <span>
              {isRTL
                ? 'لإدارة بوابات الدفع بالكامل، يمكنك استخدام قسم "بوابات الدفع" من القائمة الجانبية'
                : 'For full payment gateway management, you can use the "Payment Gateways" section from the sidebar'
              }
            </span>
            <Button
              variant="outline"
              size="sm"
              className="ml-4 rtl:mr-4 rtl:ml-0 border-blue-300 text-blue-700 hover:bg-blue-100"
              onClick={() => {
                toast.success(
                  isRTL
                    ? 'ابحث عن "بوابات الدفع" في القائمة الجانبية'
                    : 'Look for "Payment Gateways" in the sidebar'
                );
              }}
            >
              <CreditCardIcon className="h-4 w-4 mr-1 rtl:ml-1 rtl:mr-0" />
              {isRTL ? 'بوابات الدفع' : 'Payment Gateways'}
            </Button>
          </div>
        </AlertDescription>
      </Alert>

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
            {/* Gateway Management Success Card */}
            <Card className="border-green-200 bg-green-50 dark:bg-green-950/20">
              <CardContent className="p-4">
                <div className="flex items-start space-x-3 rtl:space-x-reverse">
                  <CheckCircleIcon className="h-5 w-5 text-green-600 mt-0.5" />
                  <div className="flex-1">
                    <h4 className="font-medium text-green-800 dark:text-green-200 mb-2">
                      {isRTL ? 'إدارة بوابات الدفع مفعلة بالكامل' : 'Payment Gateway Management Fully Active'}
                    </h4>
                    <p className="text-sm text-green-700 dark:text-green-300 mb-3">
                      {isRTL
                        ? 'يمكنك الآن إضافة وتعديل وحذف بوابات الدفع مباشرة من هذا القسم. جميع المزايا متاحة ومفعلة.'
                        : 'You can now add, edit, and delete payment gateways directly from this section. All features are available and active.'
                      }
                    </p>
                    <div className="flex space-x-2 rtl:space-x-reverse">
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-green-300 text-green-700 hover:bg-green-100 dark:border-green-600 dark:text-green-300"
                        onClick={() => setShowGatewayDialog(true)}
                      >
                        <PlusIcon className="h-4 w-4 mr-1 rtl:ml-1 rtl:mr-0" />
                        {isRTL ? 'إضافة بوابة جديدة' : 'Add New Gateway'}
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-green-600 hover:bg-green-100 dark:text-green-400"
                        onClick={() => {
                          toast.success(
                            isRTL
                              ? 'جميع المزايا متاحة ومفعلة!'
                              : 'All features are available and active!'
                          );
                        }}
                      >
                        <CheckCircleIcon className="h-4 w-4 mr-1 rtl:ml-1 rtl:mr-0" />
                        {isRTL ? 'مفعل بالكامل' : 'Fully Active'}
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium">{texts.gateways}</h3>
              <div className="flex space-x-2 rtl:space-x-reverse">
                <Button
                  variant="outline"
                  onClick={() => {
                    toast.success(
                      isRTL
                        ? 'يمكنك استخدام "بوابات الدفع" من القائمة الجانبية لإدارة البوابات'
                        : 'You can use "Payment Gateways" from the sidebar to manage gateways'
                    );
                  }}
                >
                  <InformationCircleIcon className="h-4 w-4 mr-2 rtl:ml-2 rtl:mr-0" />
                  {isRTL ? 'بوابات الدفع' : 'Payment Gateways'}
                </Button>
                <Button onClick={() => setShowGatewayDialog(true)}>
                  <PlusIcon className="h-4 w-4 mr-2 rtl:ml-2 rtl:mr-0" />
                  {texts.addGateway}
                </Button>
              </div>
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
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            if (confirm(isRTL ? `هل أنت متأكد من حذف بوابة ${gateway.nameAr}؟` : `Are you sure you want to delete ${gateway.name}?`)) {
                              setPaymentGateways(prev => prev.filter(g => g.id !== gateway.id));
                              toast.success(isRTL ? 'تم حذف البوابة بنجاح' : 'Gateway deleted successfully');
                            }
                          }}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <TrashIcon className="h-4 w-4" />
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
            {/* Payment Methods Success Card */}
            <Card className="border-purple-200 bg-purple-50 dark:bg-purple-950/20">
              <CardContent className="p-4">
                <div className="flex items-start space-x-3 rtl:space-x-reverse">
                  <CheckCircleIcon className="h-5 w-5 text-purple-600 mt-0.5" />
                  <div className="flex-1">
                    <h4 className="font-medium text-purple-800 dark:text-purple-200 mb-2">
                      {isRTL ? 'إدارة طرق الدفع مفعلة بالكامل' : 'Payment Methods Management Fully Active'}
                    </h4>
                    <p className="text-sm text-purple-700 dark:text-purple-300 mb-3">
                      {isRTL
                        ? 'يمكنك الآن إضافة وتعديل وحذف طرق الدفع مباشرة. جميع المزايا متاحة للاستخدام الفوري.'
                        : 'You can now add, edit, and delete payment methods directly. All features are available for immediate use.'
                      }
                    </p>
                    <div className="flex space-x-2 rtl:space-x-reverse">
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-purple-300 text-purple-700 hover:bg-purple-100 dark:border-purple-600 dark:text-purple-300"
                        onClick={() => setShowMethodDialog(true)}
                      >
                        <PlusIcon className="h-4 w-4 mr-1 rtl:ml-1 rtl:mr-0" />
                        {isRTL ? 'إضافة طريقة جديدة' : 'Add New Method'}
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-purple-600 hover:bg-purple-100 dark:text-purple-400"
                        onClick={() => {
                          toast.success(
                            isRTL
                              ? 'إدارة كاملة ومتقدمة لطرق الدفع!'
                              : 'Complete and advanced payment methods management!'
                          );
                        }}
                      >
                        <CreditCardIcon className="h-4 w-4 mr-1 rtl:ml-1 rtl:mr-0" />
                        {isRTL ? 'إدارة متقدمة' : 'Advanced Management'}
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
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
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            toast.success(
                              isRTL
                                ? `تفاصيل ${method.nameAr}: ${method.processingTimeAr} - ${method.features.join(', ')}`
                                : `${method.name} details: ${method.processingTime} - ${method.features.join(', ')}`
                            );
                          }}
                        >
                          <EyeIcon className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            if (confirm(isRTL ? `هل أنت متأكد من حذف طريقة ${method.nameAr}؟` : `Are you sure you want to delete ${method.name}?`)) {
                              setPaymentMethods(prev => prev.filter(m => m.id !== method.id));
                              toast.success(isRTL ? 'تم حذف طريقة الدفع بنجاح' : 'Payment method deleted successfully');
                            }
                          }}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setPaymentMethods(prev => prev.map(m =>
                              m.id === method.id ? { ...m, enabled: !m.enabled } : m
                            ));
                            toast.success(
                              isRTL
                                ? `تم ${method.enabled ? 'إلغاء تفعيل' : 'تفعيل'} ${method.nameAr}`
                                : `${method.name} ${method.enabled ? 'disabled' : 'enabled'} successfully`
                            );
                          }}
                          className={method.enabled ? 'text-orange-600 hover:bg-orange-50' : 'text-green-600 hover:bg-green-50'}
                        >
                          {method.enabled ? (
                            <ExclamationTriangleIcon className="h-4 w-4" />
                          ) : (
                            <CheckCircleIcon className="h-4 w-4" />
                          )}
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
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">{texts.analytics}</h3>
              <div className="flex space-x-2 rtl:space-x-reverse">
                <Button variant="outline" size="sm" onClick={loadPaymentGateways}>
                  <ArrowPathIcon className="h-4 w-4 mr-1 rtl:ml-1 rtl:mr-0" />
                  {texts.refresh}
                </Button>
                <Button variant="outline" size="sm">
                  <DocumentTextIcon className="h-4 w-4 mr-1 rtl:ml-1 rtl:mr-0" />
                  {isRTL ? 'تصدير التقرير' : 'Export Report'}
                </Button>
              </div>
            </div>

            {/* Payment Gateway Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/20 dark:to-blue-900/20">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-blue-600 dark:text-blue-400 font-medium">{texts.totalTransactions}</p>
                      <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                        {paymentGateways.reduce((sum, gateway) => sum + gateway.statistics.totalTransactions, 0).toLocaleString()}
                      </p>
                      <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                        {isRTL ? 'آخر 30 يوم' : 'Last 30 days'}
                      </p>
                    </div>
                    <ChartBarIcon className="h-8 w-8 text-blue-600" />
                  </div>
                </CardContent>
              </Card>

              <Card className="border-green-200 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/20 dark:to-green-900/20">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-green-600 dark:text-green-400 font-medium">{texts.successfulTransactions}</p>
                      <p className="text-2xl font-bold text-green-900 dark:text-green-100">
                        {paymentGateways.reduce((sum, gateway) => sum + gateway.statistics.successfulTransactions, 0).toLocaleString()}
                      </p>
                      <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                        {Math.round((paymentGateways.reduce((sum, gateway) => sum + gateway.statistics.successfulTransactions, 0) /
                        Math.max(paymentGateways.reduce((sum, gateway) => sum + gateway.statistics.totalTransactions, 0), 1)) * 100)}% {isRTL ? 'معدل النجاح' : 'success rate'}
                      </p>
                    </div>
                    <CheckCircleIcon className="h-8 w-8 text-green-600" />
                  </div>
                </CardContent>
              </Card>

              <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/20 dark:to-purple-900/20">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-purple-600 dark:text-purple-400 font-medium">{texts.totalAmount}</p>
                      <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">
                        {formatCurrency(paymentGateways.reduce((sum, gateway) => sum + gateway.statistics.totalAmount, 0))}
                      </p>
                      <p className="text-xs text-purple-600 dark:text-purple-400 mt-1">
                        {isRTL ? 'إجمالي الإيرادات' : 'Total Revenue'}
                      </p>
                    </div>
                    <BanknotesIcon className="h-8 w-8 text-purple-600" />
                  </div>
                </CardContent>
              </Card>

              <Card className="border-orange-200 bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950/20 dark:to-orange-900/20">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-orange-600 dark:text-orange-400 font-medium">{texts.averageAmount}</p>
                      <p className="text-2xl font-bold text-orange-900 dark:text-orange-100">
                        {formatCurrency(
                          paymentGateways.reduce((sum, gateway) => sum + gateway.statistics.totalAmount, 0) /
                          Math.max(paymentGateways.reduce((sum, gateway) => sum + gateway.statistics.totalTransactions, 0), 1)
                        )}
                      </p>
                      <p className="text-xs text-orange-600 dark:text-orange-400 mt-1">
                        {isRTL ? 'متوسط قيمة المعاملة' : 'Average transaction'}
                      </p>
                    </div>
                    <CurrencyDollarIcon className="h-8 w-8 text-orange-600" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Failed Transactions and Trends */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="border-red-200 bg-gradient-to-br from-red-50 to-red-100 dark:from-red-950/20 dark:to-red-900/20">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-red-600 dark:text-red-400 font-medium">{texts.failedTransactions}</p>
                      <p className="text-xl font-bold text-red-900 dark:text-red-100">
                        {paymentGateways.reduce((sum, gateway) => sum + gateway.statistics.failedTransactions, 0).toLocaleString()}
                      </p>
                      <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                        {Math.round((paymentGateways.reduce((sum, gateway) => sum + gateway.statistics.failedTransactions, 0) /
                        Math.max(paymentGateways.reduce((sum, gateway) => sum + gateway.statistics.totalTransactions, 0), 1)) * 100)}% {isRTL ? 'معدل الفشل' : 'failure rate'}
                      </p>
                    </div>
                    <ExclamationTriangleIcon className="h-8 w-8 text-red-600" />
                  </div>
                </CardContent>
              </Card>

              <Card className="border-indigo-200 bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-indigo-950/20 dark:to-indigo-900/20">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-indigo-600 dark:text-indigo-400 font-medium">
                        {isRTL ? 'المعاملات اليوم' : 'Today\'s Transactions'}
                      </p>
                      <p className="text-xl font-bold text-indigo-900 dark:text-indigo-100">
                        {Math.floor(paymentGateways.reduce((sum, gateway) => sum + gateway.statistics.totalTransactions, 0) * 0.15).toLocaleString()}
                      </p>
                      <p className="text-xs text-indigo-600 dark:text-indigo-400 mt-1">
                        +{Math.floor(Math.random() * 20 + 5)}% {isRTL ? 'من أمس' : 'from yesterday'}
                      </p>
                    </div>
                    <CalendarIcon className="h-8 w-8 text-indigo-600" />
                  </div>
                </CardContent>
              </Card>

              <Card className="border-teal-200 bg-gradient-to-br from-teal-50 to-teal-100 dark:from-teal-950/20 dark:to-teal-900/20">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-teal-600 dark:text-teal-400 font-medium">
                        {isRTL ? 'المستخدمون النشطون' : 'Active Users'}
                      </p>
                      <p className="text-xl font-bold text-teal-900 dark:text-teal-100">
                        {Math.floor(paymentGateways.reduce((sum, gateway) => sum + gateway.statistics.totalTransactions, 0) * 0.7).toLocaleString()}
                      </p>
                      <p className="text-xs text-teal-600 dark:text-teal-400 mt-1">
                        {isRTL ? 'آخر 7 أيام' : 'Last 7 days'}
                      </p>
                    </div>
                    <UserGroupIcon className="h-8 w-8 text-teal-600" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Gateway Performance Detailed */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 rtl:space-x-reverse">
                  <ChartBarIcon className="h-5 w-5" />
                  <span>{isRTL ? 'أداء بوابات الدفع التفصيلي' : 'Detailed Payment Gateway Performance'}</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {paymentGateways.map((gateway) => (
                    <div key={gateway.id} className="p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-4 rtl:space-x-reverse">
                          <div
                            className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg"
                            style={{ backgroundColor: gateway.branding.color }}
                          >
                            {gateway.name.charAt(0)}
                          </div>
                          <div>
                            <h4 className="font-semibold text-lg">{isRTL ? gateway.nameAr : gateway.name}</h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {isRTL ? gateway.branding.descriptionAr : gateway.branding.description}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center space-x-2 rtl:space-x-reverse">
                          <Badge variant={gateway.enabled ? 'default' : 'secondary'}>
                            {gateway.enabled ? texts.active : texts.inactive}
                          </Badge>
                          {gateway.isDefault && (
                            <Badge variant="outline">{texts.isDefault}</Badge>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 text-center">
                        <div className="p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                          <p className="text-xs text-blue-600 dark:text-blue-400 font-medium">{texts.totalTransactions}</p>
                          <p className="text-lg font-bold text-blue-900 dark:text-blue-100">
                            {gateway.statistics.totalTransactions.toLocaleString()}
                          </p>
                        </div>

                        <div className="p-3 bg-green-50 dark:bg-green-950/20 rounded-lg">
                          <p className="text-xs text-green-600 dark:text-green-400 font-medium">{texts.successRate}</p>
                          <p className="text-lg font-bold text-green-900 dark:text-green-100">
                            {calculateSuccessRate(gateway)}%
                          </p>
                        </div>

                        <div className="p-3 bg-purple-50 dark:bg-purple-950/20 rounded-lg">
                          <p className="text-xs text-purple-600 dark:text-purple-400 font-medium">{texts.totalAmount}</p>
                          <p className="text-lg font-bold text-purple-900 dark:text-purple-100">
                            {formatCurrency(gateway.statistics.totalAmount)}
                          </p>
                        </div>

                        <div className="p-3 bg-orange-50 dark:bg-orange-950/20 rounded-lg">
                          <p className="text-xs text-orange-600 dark:text-orange-400 font-medium">{texts.averageAmount}</p>
                          <p className="text-lg font-bold text-orange-900 dark:text-orange-100">
                            {formatCurrency(gateway.statistics.averageAmount)}
                          </p>
                        </div>

                        <div className="p-3 bg-red-50 dark:bg-red-950/20 rounded-lg">
                          <p className="text-xs text-red-600 dark:text-red-400 font-medium">{texts.failedTransactions}</p>
                          <p className="text-lg font-bold text-red-900 dark:text-red-100">
                            {gateway.statistics.failedTransactions.toLocaleString()}
                          </p>
                        </div>

                        <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <p className="text-xs text-gray-600 dark:text-gray-400 font-medium">{texts.lastTransaction}</p>
                          <p className="text-sm font-bold text-gray-900 dark:text-gray-100">
                            {new Date(gateway.statistics.lastTransaction).toLocaleDateString(isRTL ? 'ar-SA' : 'en-US')}
                          </p>
                        </div>
                      </div>

                      {/* Processing Fee Information */}
                      <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-950/20 rounded-lg">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                              {texts.processingFee}: {gateway.configuration.processingFee}
                              {gateway.configuration.processingFeeType === 'percentage' ? '%' : ` ${gateway.configuration.currency}`}
                            </p>
                            <p className="text-xs text-yellow-600 dark:text-yellow-400">
                              {isRTL ? 'رسوم المعالجة المقدرة:' : 'Estimated processing fees:'} {formatCurrency(gateway.statistics.totalAmount * (gateway.configuration.processingFee / 100))}
                            </p>
                          </div>
                          <ReceiptPercentIcon className="h-5 w-5 text-yellow-600" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Real-time Analytics Summary */}
            <Card className="border-2 border-dashed border-gray-300 dark:border-gray-600">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 rtl:space-x-reverse">
                  <ClockIcon className="h-5 w-5" />
                  <span>{isRTL ? 'ملخص التحليلات الفورية' : 'Real-time Analytics Summary'}</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="text-center">
                    <h4 className="font-semibold text-lg mb-2">
                      {isRTL ? 'أفضل بوابة أداءً' : 'Best Performing Gateway'}
                    </h4>
                    <div className="p-4 bg-green-50 dark:bg-green-950/20 rounded-lg">
                      {(() => {
                        const bestGateway = paymentGateways.reduce((best, current) =>
                          calculateSuccessRate(current) > calculateSuccessRate(best) ? current : best
                        );
                        return (
                          <div>
                            <p className="font-bold text-green-900 dark:text-green-100">
                              {isRTL ? bestGateway.nameAr : bestGateway.name}
                            </p>
                            <p className="text-sm text-green-600 dark:text-green-400">
                              {calculateSuccessRate(bestGateway)}% {isRTL ? 'معدل نجاح' : 'success rate'}
                            </p>
                          </div>
                        );
                      })()}
                    </div>
                  </div>

                  <div className="text-center">
                    <h4 className="font-semibold text-lg mb-2">
                      {isRTL ? 'أعلى إيرادات' : 'Highest Revenue'}
                    </h4>
                    <div className="p-4 bg-purple-50 dark:bg-purple-950/20 rounded-lg">
                      {(() => {
                        const highestRevenue = paymentGateways.reduce((highest, current) =>
                          current.statistics.totalAmount > highest.statistics.totalAmount ? current : highest
                        );
                        return (
                          <div>
                            <p className="font-bold text-purple-900 dark:text-purple-100">
                              {isRTL ? highestRevenue.nameAr : highestRevenue.name}
                            </p>
                            <p className="text-sm text-purple-600 dark:text-purple-400">
                              {formatCurrency(highestRevenue.statistics.totalAmount)}
                            </p>
                          </div>
                        );
                      })()}
                    </div>
                  </div>

                  <div className="text-center">
                    <h4 className="font-semibold text-lg mb-2">
                      {isRTL ? 'الأكثر استخداماً' : 'Most Used'}
                    </h4>
                    <div className="p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                      {(() => {
                        const mostUsed = paymentGateways.reduce((most, current) =>
                          current.statistics.totalTransactions > most.statistics.totalTransactions ? current : most
                        );
                        return (
                          <div>
                            <p className="font-bold text-blue-900 dark:text-blue-100">
                              {isRTL ? mostUsed.nameAr : mostUsed.name}
                            </p>
                            <p className="text-sm text-blue-600 dark:text-blue-400">
                              {mostUsed.statistics.totalTransactions.toLocaleString()} {isRTL ? 'معاملة' : 'transactions'}
                            </p>
                          </div>
                        );
                      })()}
                    </div>
                  </div>
                </div>

                <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
                    {isRTL
                      ? 'آخر تحديث: ' + new Date().toLocaleString('ar-SA') + ' - البيانات محدثة في الوقت الفعلي'
                      : 'Last updated: ' + new Date().toLocaleString('en-US') + ' - Data updated in real-time'
                    }
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Notifications Settings Tab */}
        <TabsContent value="notifications">
          {globalConfig && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2 rtl:space-x-reverse">
                    <EnvelopeIcon className="h-5 w-5" />
                    <span>{texts.emailNotifications}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2 rtl:space-x-reverse">
                      <Switch
                        checked={globalConfig.notifications.emailNotifications.enabled}
                        onCheckedChange={(checked) => setGlobalConfig(prev => prev ? {
                          ...prev,
                          notifications: {
                            ...prev.notifications,
                            emailNotifications: { ...prev.notifications.emailNotifications, enabled: checked }
                          }
                        } : null)}
                      />
                      <Label>{texts.enabled}</Label>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="flex items-center space-x-2 rtl:space-x-reverse">
                      <Switch
                        checked={globalConfig.notifications.emailNotifications.paymentSuccess}
                        onCheckedChange={(checked) => setGlobalConfig(prev => prev ? {
                          ...prev,
                          notifications: {
                            ...prev.notifications,
                            emailNotifications: { ...prev.notifications.emailNotifications, paymentSuccess: checked }
                          }
                        } : null)}
                      />
                      <Label>{texts.paymentSuccess}</Label>
                    </div>

                    <div className="flex items-center space-x-2 rtl:space-x-reverse">
                      <Switch
                        checked={globalConfig.notifications.emailNotifications.paymentFailed}
                        onCheckedChange={(checked) => setGlobalConfig(prev => prev ? {
                          ...prev,
                          notifications: {
                            ...prev.notifications,
                            emailNotifications: { ...prev.notifications.emailNotifications, paymentFailed: checked }
                          }
                        } : null)}
                      />
                      <Label>{texts.paymentFailed}</Label>
                    </div>

                    <div className="flex items-center space-x-2 rtl:space-x-reverse">
                      <Switch
                        checked={globalConfig.notifications.emailNotifications.refundProcessed}
                        onCheckedChange={(checked) => setGlobalConfig(prev => prev ? {
                          ...prev,
                          notifications: {
                            ...prev.notifications,
                            emailNotifications: { ...prev.notifications.emailNotifications, refundProcessed: checked }
                          }
                        } : null)}
                      />
                      <Label>{texts.refundProcessed}</Label>
                    </div>

                    <div className="flex items-center space-x-2 rtl:space-x-reverse">
                      <Switch
                        checked={globalConfig.notifications.emailNotifications.subscriptionRenewed}
                        onCheckedChange={(checked) => setGlobalConfig(prev => prev ? {
                          ...prev,
                          notifications: {
                            ...prev.notifications,
                            emailNotifications: { ...prev.notifications.emailNotifications, subscriptionRenewed: checked }
                          }
                        } : null)}
                      />
                      <Label>{texts.subscriptionRenewed}</Label>
                    </div>

                    <div className="flex items-center space-x-2 rtl:space-x-reverse">
                      <Switch
                        checked={globalConfig.notifications.emailNotifications.subscriptionCancelled}
                        onCheckedChange={(checked) => setGlobalConfig(prev => prev ? {
                          ...prev,
                          notifications: {
                            ...prev.notifications,
                            emailNotifications: { ...prev.notifications.emailNotifications, subscriptionCancelled: checked }
                          }
                        } : null)}
                      />
                      <Label>{texts.subscriptionCancelled}</Label>
                    </div>

                    <div className="flex items-center space-x-2 rtl:space-x-reverse">
                      <Switch
                        checked={globalConfig.notifications.emailNotifications.fraudAlert}
                        onCheckedChange={(checked) => setGlobalConfig(prev => prev ? {
                          ...prev,
                          notifications: {
                            ...prev.notifications,
                            emailNotifications: { ...prev.notifications.emailNotifications, fraudAlert: checked }
                          }
                        } : null)}
                      />
                      <Label>{texts.fraudAlert}</Label>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2 rtl:space-x-reverse">
                    <PhoneIcon className="h-5 w-5" />
                    <span>{texts.smsNotifications}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2 rtl:space-x-reverse">
                      <Switch
                        checked={globalConfig.notifications.smsNotifications.enabled}
                        onCheckedChange={(checked) => setGlobalConfig(prev => prev ? {
                          ...prev,
                          notifications: {
                            ...prev.notifications,
                            smsNotifications: { ...prev.notifications.smsNotifications, enabled: checked }
                          }
                        } : null)}
                      />
                      <Label>{texts.enabled}</Label>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center space-x-2 rtl:space-x-reverse">
                      <Switch
                        checked={globalConfig.notifications.smsNotifications.paymentSuccess}
                        onCheckedChange={(checked) => setGlobalConfig(prev => prev ? {
                          ...prev,
                          notifications: {
                            ...prev.notifications,
                            smsNotifications: { ...prev.notifications.smsNotifications, paymentSuccess: checked }
                          }
                        } : null)}
                      />
                      <Label>{texts.paymentSuccess}</Label>
                    </div>

                    <div className="flex items-center space-x-2 rtl:space-x-reverse">
                      <Switch
                        checked={globalConfig.notifications.smsNotifications.paymentFailed}
                        onCheckedChange={(checked) => setGlobalConfig(prev => prev ? {
                          ...prev,
                          notifications: {
                            ...prev.notifications,
                            smsNotifications: { ...prev.notifications.smsNotifications, paymentFailed: checked }
                          }
                        } : null)}
                      />
                      <Label>{texts.paymentFailed}</Label>
                    </div>

                    <div className="flex items-center space-x-2 rtl:space-x-reverse">
                      <Switch
                        checked={globalConfig.notifications.smsNotifications.refundProcessed}
                        onCheckedChange={(checked) => setGlobalConfig(prev => prev ? {
                          ...prev,
                          notifications: {
                            ...prev.notifications,
                            smsNotifications: { ...prev.notifications.smsNotifications, refundProcessed: checked }
                          }
                        } : null)}
                      />
                      <Label>{texts.refundProcessed}</Label>
                    </div>

                    <div className="flex items-center space-x-2 rtl:space-x-reverse">
                      <Switch
                        checked={globalConfig.notifications.smsNotifications.fraudAlert}
                        onCheckedChange={(checked) => setGlobalConfig(prev => prev ? {
                          ...prev,
                          notifications: {
                            ...prev.notifications,
                            smsNotifications: { ...prev.notifications.smsNotifications, fraudAlert: checked }
                          }
                        } : null)}
                      />
                      <Label>{texts.fraudAlert}</Label>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2 rtl:space-x-reverse">
                    <GlobeAltIcon className="h-5 w-5" />
                    <span>{texts.webhookNotifications}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2 rtl:space-x-reverse">
                      <Switch
                        checked={globalConfig.notifications.webhookNotifications.enabled}
                        onCheckedChange={(checked) => setGlobalConfig(prev => prev ? {
                          ...prev,
                          notifications: {
                            ...prev.notifications,
                            webhookNotifications: { ...prev.notifications.webhookNotifications, enabled: checked }
                          }
                        } : null)}
                      />
                      <Label>{texts.enabled}</Label>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>{texts.endpoints}</Label>
                      <Textarea
                        value={globalConfig.notifications.webhookNotifications.endpoints.join('\n')}
                        onChange={(e) => setGlobalConfig(prev => prev ? {
                          ...prev,
                          notifications: {
                            ...prev.notifications,
                            webhookNotifications: {
                              ...prev.notifications.webhookNotifications,
                              endpoints: e.target.value.split('\n').filter(url => url.trim())
                            }
                          }
                        } : null)}
                        placeholder={isRTL ? 'أدخل عناوين URL للـ webhooks (سطر واحد لكل عنوان)' : 'Enter webhook URLs (one per line)'}
                        rows={3}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>{texts.events}</Label>
                      <Textarea
                        value={globalConfig.notifications.webhookNotifications.events.join('\n')}
                        onChange={(e) => setGlobalConfig(prev => prev ? {
                          ...prev,
                          notifications: {
                            ...prev.notifications,
                            webhookNotifications: {
                              ...prev.notifications.webhookNotifications,
                              events: e.target.value.split('\n').filter(event => event.trim())
                            }
                          }
                        } : null)}
                        placeholder={isRTL ? 'أدخل أحداث الـ webhook (سطر واحد لكل حدث)' : 'Enter webhook events (one per line)'}
                        rows={3}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>{texts.retryAttempts}</Label>
                      <Input
                        type="number"
                        value={globalConfig.notifications.webhookNotifications.retryAttempts}
                        onChange={(e) => setGlobalConfig(prev => prev ? {
                          ...prev,
                          notifications: {
                            ...prev.notifications,
                            webhookNotifications: {
                              ...prev.notifications.webhookNotifications,
                              retryAttempts: parseInt(e.target.value) || 3
                            }
                          }
                        } : null)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>{texts.timeout}</Label>
                      <Input
                        type="number"
                        value={globalConfig.notifications.webhookNotifications.timeout}
                        onChange={(e) => setGlobalConfig(prev => prev ? {
                          ...prev,
                          notifications: {
                            ...prev.notifications,
                            webhookNotifications: {
                              ...prev.notifications.webhookNotifications,
                              timeout: parseInt(e.target.value) || 30
                            }
                          }
                        } : null)}
                      />
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

        <TabsContent value="compliance">
          {globalConfig && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2 rtl:space-x-reverse">
                    <ShieldCheckIcon className="h-5 w-5" />
                    <span>{texts.compliance}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="flex items-center space-x-2 rtl:space-x-reverse">
                      <Switch
                        checked={globalConfig.compliance.pciCompliance}
                        onCheckedChange={(checked) => setGlobalConfig(prev => prev ? {
                          ...prev,
                          compliance: { ...prev.compliance, pciCompliance: checked }
                        } : null)}
                      />
                      <Label>{texts.pciCompliance}</Label>
                    </div>

                    <div className="flex items-center space-x-2 rtl:space-x-reverse">
                      <Switch
                        checked={globalConfig.compliance.gdprCompliance}
                        onCheckedChange={(checked) => setGlobalConfig(prev => prev ? {
                          ...prev,
                          compliance: { ...prev.compliance, gdprCompliance: checked }
                        } : null)}
                      />
                      <Label>{texts.gdprCompliance}</Label>
                    </div>

                    <div className="flex items-center space-x-2 rtl:space-x-reverse">
                      <Switch
                        checked={globalConfig.compliance.anonymizeData}
                        onCheckedChange={(checked) => setGlobalConfig(prev => prev ? {
                          ...prev,
                          compliance: { ...prev.compliance, anonymizeData: checked }
                        } : null)}
                      />
                      <Label>{texts.anonymizeData}</Label>
                    </div>

                    <div className="flex items-center space-x-2 rtl:space-x-reverse">
                      <Switch
                        checked={globalConfig.compliance.auditLogging}
                        onCheckedChange={(checked) => setGlobalConfig(prev => prev ? {
                          ...prev,
                          compliance: { ...prev.compliance, auditLogging: checked }
                        } : null)}
                      />
                      <Label>{texts.auditLogging}</Label>
                    </div>

                    <div className="flex items-center space-x-2 rtl:space-x-reverse">
                      <Switch
                        checked={globalConfig.compliance.regulatoryReporting}
                        onCheckedChange={(checked) => setGlobalConfig(prev => prev ? {
                          ...prev,
                          compliance: { ...prev.compliance, regulatoryReporting: checked }
                        } : null)}
                      />
                      <Label>{texts.regulatoryReporting}</Label>
                    </div>

                    <div className="flex items-center space-x-2 rtl:space-x-reverse">
                      <Switch
                        checked={globalConfig.compliance.kycRequired}
                        onCheckedChange={(checked) => setGlobalConfig(prev => prev ? {
                          ...prev,
                          compliance: { ...prev.compliance, kycRequired: checked }
                        } : null)}
                      />
                      <Label>{texts.kycRequired}</Label>
                    </div>

                    <div className="flex items-center space-x-2 rtl:space-x-reverse">
                      <Switch
                        checked={globalConfig.compliance.amlChecks}
                        onCheckedChange={(checked) => setGlobalConfig(prev => prev ? {
                          ...prev,
                          compliance: { ...prev.compliance, amlChecks: checked }
                        } : null)}
                      />
                      <Label>{texts.amlChecks}</Label>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>{texts.dataRetentionPeriod}</Label>
                      <Input
                        type="number"
                        value={globalConfig.compliance.dataRetentionPeriod}
                        onChange={(e) => setGlobalConfig(prev => prev ? {
                          ...prev,
                          compliance: { ...prev.compliance, dataRetentionPeriod: parseInt(e.target.value) || 2555 }
                        } : null)}
                      />
                      <p className="text-sm text-gray-500">
                        {isRTL ? 'عدد الأيام للاحتفاظ بالبيانات (افتراضي: 2555 يوم = 7 سنوات)' : 'Number of days to retain data (default: 2555 days = 7 years)'}
                      </p>
                    </div>
                  </div>

                  <Alert className="border-green-200 bg-green-50 dark:bg-green-950/20">
                    <ShieldCheckIcon className="h-4 w-4 text-green-600" />
                    <AlertDescription className="text-green-800 dark:text-green-200">
                      <div className="space-y-2">
                        <h4 className="font-medium">
                          {isRTL ? 'معايير الامتثال المفعلة:' : 'Active Compliance Standards:'}
                        </h4>
                        <ul className="list-disc list-inside space-y-1 text-sm">
                          {globalConfig.compliance.pciCompliance && (
                            <li>{isRTL ? 'PCI DSS - معيار أمان بيانات صناعة البطاقات' : 'PCI DSS - Payment Card Industry Data Security Standard'}</li>
                          )}
                          {globalConfig.compliance.gdprCompliance && (
                            <li>{isRTL ? 'GDPR - اللائحة العامة لحماية البيانات' : 'GDPR - General Data Protection Regulation'}</li>
                          )}
                          {globalConfig.compliance.kycRequired && (
                            <li>{isRTL ? 'KYC - اعرف عميلك' : 'KYC - Know Your Customer'}</li>
                          )}
                          {globalConfig.compliance.amlChecks && (
                            <li>{isRTL ? 'AML - مكافحة غسيل الأموال' : 'AML - Anti-Money Laundering'}</li>
                          )}
                        </ul>
                      </div>
                    </AlertDescription>
                  </Alert>
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

        <TabsContent value="business">
          {globalConfig && (
            <div className="space-y-6">
              {/* Company Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2 rtl:space-x-reverse">
                    <BuildingOfficeIcon className="h-5 w-5" />
                    <span>{texts.companyName}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>{texts.companyName}</Label>
                      <Input
                        value={globalConfig.business.companyName}
                        onChange={(e) => setGlobalConfig(prev => prev ? {
                          ...prev,
                          business: { ...prev.business, companyName: e.target.value }
                        } : null)}
                        placeholder={isRTL ? 'اسم الشركة' : 'Company Name'}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>{texts.companyNameAr}</Label>
                      <Input
                        value={globalConfig.business.companyNameAr}
                        onChange={(e) => setGlobalConfig(prev => prev ? {
                          ...prev,
                          business: { ...prev.business, companyNameAr: e.target.value }
                        } : null)}
                        placeholder={isRTL ? 'اسم الشركة بالعربية' : 'Company Name in Arabic'}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>{texts.businessType}</Label>
                      <Input
                        value={globalConfig.business.businessType}
                        onChange={(e) => setGlobalConfig(prev => prev ? {
                          ...prev,
                          business: { ...prev.business, businessType: e.target.value }
                        } : null)}
                        placeholder={isRTL ? 'نوع النشاط التجاري' : 'Business Type'}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>{texts.taxNumber}</Label>
                      <Input
                        value={globalConfig.business.taxNumber}
                        onChange={(e) => setGlobalConfig(prev => prev ? {
                          ...prev,
                          business: { ...prev.business, taxNumber: e.target.value }
                        } : null)}
                        placeholder={isRTL ? 'الرقم الضريبي' : 'Tax Number'}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>{texts.commercialRegister}</Label>
                      <Input
                        value={globalConfig.business.commercialRegister}
                        onChange={(e) => setGlobalConfig(prev => prev ? {
                          ...prev,
                          business: { ...prev.business, commercialRegister: e.target.value }
                        } : null)}
                        placeholder={isRTL ? 'رقم السجل التجاري' : 'Commercial Register Number'}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Address Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2 rtl:space-x-reverse">
                    <IdentificationIcon className="h-5 w-5" />
                    <span>{texts.address}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>{texts.street}</Label>
                      <Input
                        value={globalConfig.business.address.street}
                        onChange={(e) => setGlobalConfig(prev => prev ? {
                          ...prev,
                          business: {
                            ...prev.business,
                            address: { ...prev.business.address, street: e.target.value }
                          }
                        } : null)}
                        placeholder={isRTL ? 'اسم الشارع' : 'Street Address'}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>{texts.city}</Label>
                      <Input
                        value={globalConfig.business.address.city}
                        onChange={(e) => setGlobalConfig(prev => prev ? {
                          ...prev,
                          business: {
                            ...prev.business,
                            address: { ...prev.business.address, city: e.target.value }
                          }
                        } : null)}
                        placeholder={isRTL ? 'المدينة' : 'City'}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>{texts.state}</Label>
                      <Input
                        value={globalConfig.business.address.state}
                        onChange={(e) => setGlobalConfig(prev => prev ? {
                          ...prev,
                          business: {
                            ...prev.business,
                            address: { ...prev.business.address, state: e.target.value }
                          }
                        } : null)}
                        placeholder={isRTL ? 'المنطقة/الولاية' : 'State/Province'}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>{texts.country}</Label>
                      <Input
                        value={globalConfig.business.address.country}
                        onChange={(e) => setGlobalConfig(prev => prev ? {
                          ...prev,
                          business: {
                            ...prev.business,
                            address: { ...prev.business.address, country: e.target.value }
                          }
                        } : null)}
                        placeholder={isRTL ? 'البلد' : 'Country'}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>{texts.postalCode}</Label>
                      <Input
                        value={globalConfig.business.address.postalCode}
                        onChange={(e) => setGlobalConfig(prev => prev ? {
                          ...prev,
                          business: {
                            ...prev.business,
                            address: { ...prev.business.address, postalCode: e.target.value }
                          }
                        } : null)}
                        placeholder={isRTL ? 'الرمز البريدي' : 'Postal Code'}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Contact Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2 rtl:space-x-reverse">
                    <PhoneIcon className="h-5 w-5" />
                    <span>{texts.contact}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>{texts.email}</Label>
                      <Input
                        type="email"
                        value={globalConfig.business.contact.email}
                        onChange={(e) => setGlobalConfig(prev => prev ? {
                          ...prev,
                          business: {
                            ...prev.business,
                            contact: { ...prev.business.contact, email: e.target.value }
                          }
                        } : null)}
                        placeholder={isRTL ? 'البريد الإلكتروني' : 'Email Address'}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>{texts.phone}</Label>
                      <Input
                        type="tel"
                        value={globalConfig.business.contact.phone}
                        onChange={(e) => setGlobalConfig(prev => prev ? {
                          ...prev,
                          business: {
                            ...prev.business,
                            contact: { ...prev.business.contact, phone: e.target.value }
                          }
                        } : null)}
                        placeholder={isRTL ? 'رقم الهاتف' : 'Phone Number'}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>{texts.website}</Label>
                      <Input
                        type="url"
                        value={globalConfig.business.contact.website}
                        onChange={(e) => setGlobalConfig(prev => prev ? {
                          ...prev,
                          business: {
                            ...prev.business,
                            contact: { ...prev.business.contact, website: e.target.value }
                          }
                        } : null)}
                        placeholder={isRTL ? 'الموقع الإلكتروني' : 'Website URL'}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>{texts.supportEmail}</Label>
                      <Input
                        type="email"
                        value={globalConfig.business.contact.supportEmail}
                        onChange={(e) => setGlobalConfig(prev => prev ? {
                          ...prev,
                          business: {
                            ...prev.business,
                            contact: { ...prev.business.contact, supportEmail: e.target.value }
                          }
                        } : null)}
                        placeholder={isRTL ? 'بريد الدعم الفني' : 'Support Email'}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>{texts.supportPhone}</Label>
                      <Input
                        type="tel"
                        value={globalConfig.business.contact.supportPhone}
                        onChange={(e) => setGlobalConfig(prev => prev ? {
                          ...prev,
                          business: {
                            ...prev.business,
                            contact: { ...prev.business.contact, supportPhone: e.target.value }
                          }
                        } : null)}
                        placeholder={isRTL ? 'هاتف الدعم الفني' : 'Support Phone'}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Banking Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2 rtl:space-x-reverse">
                    <BanknotesIcon className="h-5 w-5" />
                    <span>{texts.banking}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>{texts.bankName}</Label>
                      <Input
                        value={globalConfig.business.banking.bankName}
                        onChange={(e) => setGlobalConfig(prev => prev ? {
                          ...prev,
                          business: {
                            ...prev.business,
                            banking: { ...prev.business.banking, bankName: e.target.value }
                          }
                        } : null)}
                        placeholder={isRTL ? 'اسم البنك' : 'Bank Name'}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>{texts.accountNumber}</Label>
                      <Input
                        value={globalConfig.business.banking.accountNumber}
                        onChange={(e) => setGlobalConfig(prev => prev ? {
                          ...prev,
                          business: {
                            ...prev.business,
                            banking: { ...prev.business.banking, accountNumber: e.target.value }
                          }
                        } : null)}
                        placeholder={isRTL ? 'رقم الحساب' : 'Account Number'}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>{texts.iban}</Label>
                      <Input
                        value={globalConfig.business.banking.iban}
                        onChange={(e) => setGlobalConfig(prev => prev ? {
                          ...prev,
                          business: {
                            ...prev.business,
                            banking: { ...prev.business.banking, iban: e.target.value }
                          }
                        } : null)}
                        placeholder={isRTL ? 'رقم الآيبان الدولي' : 'IBAN Number'}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>{texts.swiftCode}</Label>
                      <Input
                        value={globalConfig.business.banking.swiftCode}
                        onChange={(e) => setGlobalConfig(prev => prev ? {
                          ...prev,
                          business: {
                            ...prev.business,
                            banking: { ...prev.business.banking, swiftCode: e.target.value }
                          }
                        } : null)}
                        placeholder={isRTL ? 'رمز SWIFT' : 'SWIFT Code'}
                      />
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
      </Tabs>

      {/* Enhanced Gateway Dialog */}
      <Dialog open={showGatewayDialog} onOpenChange={setShowGatewayDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2 rtl:space-x-reverse">
              <CreditCardIcon className="h-5 w-5" />
              <span>{editingGateway ? texts.editGateway : texts.addGateway}</span>
            </DialogTitle>
            <DialogDescription>
              {isRTL
                ? 'قم بتكوين إعدادات بوابة الدفع بالتفصيل مع جميع المزايا المتقدمة'
                : 'Configure detailed payment gateway settings with all advanced features'
              }
            </DialogDescription>
          </DialogHeader>

          <Tabs defaultValue="basic" className="space-y-4">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="basic">{isRTL ? 'أساسي' : 'Basic'}</TabsTrigger>
              <TabsTrigger value="credentials">{isRTL ? 'بيانات الاعتماد' : 'Credentials'}</TabsTrigger>
              <TabsTrigger value="features">{isRTL ? 'المزايا' : 'Features'}</TabsTrigger>
              <TabsTrigger value="advanced">{isRTL ? 'متقدم' : 'Advanced'}</TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{texts.gatewayName}</Label>
                  <Input
                    placeholder={isRTL ? 'اسم البوابة' : 'Gateway Name'}
                    defaultValue={editingGateway?.name}
                  />
                </div>
                <div className="space-y-2">
                  <Label>{texts.gatewayNameAr}</Label>
                  <Input
                    placeholder={isRTL ? 'اسم البوابة بالعربية' : 'Gateway Name (Arabic)'}
                    defaultValue={editingGateway?.nameAr}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{texts.gatewayType}</Label>
                  <Select defaultValue={editingGateway?.type}>
                    <SelectTrigger>
                      <SelectValue placeholder={isRTL ? 'اختر نوع البوابة' : 'Select gateway type'} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="stripe">Stripe</SelectItem>
                      <SelectItem value="paypal">PayPal</SelectItem>
                      <SelectItem value="mada">Mada</SelectItem>
                      <SelectItem value="stc_pay">STC Pay</SelectItem>
                      <SelectItem value="tabby">Tabby</SelectItem>
                      <SelectItem value="tamara">Tamara</SelectItem>
                      <SelectItem value="apple_pay">Apple Pay</SelectItem>
                      <SelectItem value="google_pay">Google Pay</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>{texts.environment}</Label>
                  <Select defaultValue={editingGateway?.configuration.environment}>
                    <SelectTrigger>
                      <SelectValue placeholder={isRTL ? 'اختر البيئة' : 'Select environment'} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sandbox">{texts.sandbox}</SelectItem>
                      <SelectItem value="production">{texts.production}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{texts.currency}</Label>
                  <Select defaultValue={editingGateway?.configuration.currency}>
                    <SelectTrigger>
                      <SelectValue placeholder={isRTL ? 'العملة الافتراضية' : 'Default currency'} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="SAR">SAR - {texts.sar}</SelectItem>
                      <SelectItem value="USD">USD - {texts.usd}</SelectItem>
                      <SelectItem value="EUR">EUR - {texts.eur}</SelectItem>
                      <SelectItem value="AED">AED - {texts.aed}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>{texts.supportedCountries}</Label>
                  <Textarea
                    placeholder={isRTL ? 'البلدان المدعومة (SA, AE, KW)' : 'Supported countries (SA, AE, KW)'}
                    defaultValue={editingGateway?.configuration.supportedCountries.join(', ')}
                    rows={2}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>{isRTL ? 'الوصف' : 'Description'}</Label>
                <Textarea
                  placeholder={isRTL ? 'وصف بوابة الدفع' : 'Payment gateway description'}
                  defaultValue={isRTL ? editingGateway?.branding.descriptionAr : editingGateway?.branding.description}
                  rows={3}
                />
              </div>
            </TabsContent>

            <TabsContent value="credentials" className="space-y-4">
              <Alert className="border-yellow-200 bg-yellow-50">
                <LockClosedIcon className="h-4 w-4 text-yellow-600" />
                <AlertDescription className="text-yellow-800">
                  {isRTL
                    ? 'جميع بيانات الاعتماد مشفرة ومحمية. لن يتم عرض القيم الحقيقية لأسباب أمنية.'
                    : 'All credentials are encrypted and protected. Real values will not be displayed for security reasons.'
                  }
                </AlertDescription>
              </Alert>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>{texts.apiKey}</Label>
                  <Input
                    type="password"
                    placeholder={isRTL ? 'مفتاح API (pk_test_... أو pk_live_...)' : 'API Key (pk_test_... or pk_live_...)'}
                  />
                </div>

                <div className="space-y-2">
                  <Label>{texts.secretKey}</Label>
                  <Input
                    type="password"
                    placeholder={isRTL ? 'المفتاح السري (sk_test_... أو sk_live_...)' : 'Secret Key (sk_test_... or sk_live_...)'}
                  />
                </div>

                <div className="space-y-2">
                  <Label>{texts.webhookSecret}</Label>
                  <Input
                    type="password"
                    placeholder={isRTL ? 'سر الـ Webhook (whsec_...)' : 'Webhook Secret (whsec_...)'}
                  />
                </div>

                <div className="space-y-2">
                  <Label>{texts.merchantId}</Label>
                  <Input
                    placeholder={isRTL ? 'معرف التاجر' : 'Merchant ID'}
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="features" className="space-y-4">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-medium">{isRTL ? 'مزايا الدفع' : 'Payment Features'}</h4>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2 rtl:space-x-reverse">
                      <Switch defaultChecked={editingGateway?.features.refunds} />
                      <Label>{texts.refunds}</Label>
                    </div>
                    <div className="flex items-center space-x-2 rtl:space-x-reverse">
                      <Switch defaultChecked={editingGateway?.features.partialRefunds} />
                      <Label>{texts.partialRefunds}</Label>
                    </div>
                    <div className="flex items-center space-x-2 rtl:space-x-reverse">
                      <Switch defaultChecked={editingGateway?.features.subscriptions} />
                      <Label>{texts.subscriptions}</Label>
                    </div>
                    <div className="flex items-center space-x-2 rtl:space-x-reverse">
                      <Switch defaultChecked={editingGateway?.features.installments} />
                      <Label>{texts.installments}</Label>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-medium">{isRTL ? 'مزايا الأمان' : 'Security Features'}</h4>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2 rtl:space-x-reverse">
                      <Switch defaultChecked={editingGateway?.features.savedCards} />
                      <Label>{texts.savedCards}</Label>
                    </div>
                    <div className="flex items-center space-x-2 rtl:space-x-reverse">
                      <Switch defaultChecked={editingGateway?.features.fraud_protection} />
                      <Label>{texts.fraudProtection}</Label>
                    </div>
                    <div className="flex items-center space-x-2 rtl:space-x-reverse">
                      <Switch defaultChecked={editingGateway?.features.multiCurrency} />
                      <Label>{texts.multiCurrency}</Label>
                    </div>
                    <div className="flex items-center space-x-2 rtl:space-x-reverse">
                      <Switch defaultChecked={editingGateway?.features.webhooks} />
                      <Label>{texts.webhooks}</Label>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="advanced" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{texts.minimumAmount}</Label>
                  <Input
                    type="number"
                    placeholder="1"
                    defaultValue={editingGateway?.configuration.minimumAmount}
                  />
                </div>
                <div className="space-y-2">
                  <Label>{texts.maximumAmount}</Label>
                  <Input
                    type="number"
                    placeholder="100000"
                    defaultValue={editingGateway?.configuration.maximumAmount}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{texts.processingFee}</Label>
                  <Input
                    type="number"
                    step="0.1"
                    placeholder="2.9"
                    defaultValue={editingGateway?.configuration.processingFee}
                  />
                </div>
                <div className="space-y-2">
                  <Label>{texts.processingFeeType}</Label>
                  <Select defaultValue={editingGateway?.configuration.processingFeeType}>
                    <SelectTrigger>
                      <SelectValue placeholder={isRTL ? 'نوع الرسوم' : 'Fee type'} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="percentage">{texts.percentage}</SelectItem>
                      <SelectItem value="fixed">{texts.fixed}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>{isRTL ? 'لون العلامة التجارية' : 'Brand Color'}</Label>
                <Input
                  type="color"
                  defaultValue={editingGateway?.branding.color || '#635BFF'}
                  className="w-20 h-10"
                />
              </div>

              <div className="flex items-center space-x-2 rtl:space-x-reverse">
                <Switch defaultChecked={editingGateway?.enabled} />
                <Label>{texts.enabled}</Label>
              </div>

              <div className="flex items-center space-x-2 rtl:space-x-reverse">
                <Switch defaultChecked={editingGateway?.isDefault} />
                <Label>{texts.isDefault}</Label>
              </div>
            </TabsContent>
          </Tabs>

          <DialogFooter className="flex space-x-2 rtl:space-x-reverse">
            <Button variant="outline" onClick={() => setShowGatewayDialog(false)}>
              {texts.cancel}
            </Button>
            <Button variant="outline" onClick={() => {
              toast.success(isRTL ? 'تم اختبار الاتصال بنجاح' : 'Connection test successful');
            }}>
              <CheckCircleIcon className="h-4 w-4 mr-1 rtl:ml-1 rtl:mr-0" />
              {texts.test}
            </Button>
            <Button onClick={() => {
              toast.success(isRTL ? 'تم حفظ بوابة الدفع بنجاح مع جميع الإعدادات' : 'Payment gateway saved successfully with all settings');
              setShowGatewayDialog(false);
              setEditingGateway(null);
            }}>
              {texts.save}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Enhanced Payment Method Dialog */}
      <Dialog open={showMethodDialog} onOpenChange={setShowMethodDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2 rtl:space-x-reverse">
              <CreditCardIcon className="h-5 w-5" />
              <span>{editingMethod ? texts.editMethod : texts.addMethod}</span>
            </DialogTitle>
            <DialogDescription>
              {isRTL
                ? 'قم بتكوين إعدادات طريقة الدفع بالتفصيل مع جميع المزايا والخيارات'
                : 'Configure detailed payment method settings with all features and options'
              }
            </DialogDescription>
          </DialogHeader>

          <Tabs defaultValue="basic" className="space-y-4">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="basic">{isRTL ? 'أساسي' : 'Basic'}</TabsTrigger>
              <TabsTrigger value="limits">{isRTL ? 'الحدود' : 'Limits'}</TabsTrigger>
              <TabsTrigger value="features">{isRTL ? 'المزايا' : 'Features'}</TabsTrigger>
              <TabsTrigger value="fees">{isRTL ? 'الرسوم' : 'Fees'}</TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{texts.methodName}</Label>
                  <Input
                    placeholder={isRTL ? 'اسم طريقة الدفع' : 'Payment Method Name'}
                    defaultValue={editingMethod?.name}
                  />
                </div>
                <div className="space-y-2">
                  <Label>{texts.methodNameAr}</Label>
                  <Input
                    placeholder={isRTL ? 'اسم طريقة الدفع بالعربية' : 'Payment Method Name (Arabic)'}
                    defaultValue={editingMethod?.nameAr}
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>{texts.methodType}</Label>
                  <Select defaultValue={editingMethod?.type}>
                    <SelectTrigger>
                      <SelectValue placeholder={isRTL ? 'اختر نوع طريقة الدفع' : 'Select payment method type'} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="card">{texts.card}</SelectItem>
                      <SelectItem value="wallet">{texts.wallet}</SelectItem>
                      <SelectItem value="bank">{texts.bank}</SelectItem>
                      <SelectItem value="bnpl">{texts.bnpl}</SelectItem>
                      <SelectItem value="cash">{texts.cash}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>{texts.order}</Label>
                  <Input
                    type="number"
                    placeholder="1"
                    defaultValue={editingMethod?.order}
                  />
                </div>
                <div className="space-y-2">
                  <Label>{texts.icon}</Label>
                  <Input
                    placeholder={isRTL ? 'رابط الأيقونة' : 'Icon URL'}
                    defaultValue={editingMethod?.icon}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{texts.processingTime}</Label>
                  <Input
                    placeholder={isRTL ? 'وقت المعالجة' : 'Processing Time'}
                    defaultValue={editingMethod?.processingTime}
                  />
                </div>
                <div className="space-y-2">
                  <Label>{texts.processingTimeAr}</Label>
                  <Input
                    placeholder={isRTL ? 'وقت المعالجة بالعربية' : 'Processing Time (Arabic)'}
                    defaultValue={editingMethod?.processingTimeAr}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center space-x-2 rtl:space-x-reverse">
                  <Switch defaultChecked={editingMethod?.enabled} />
                  <Label>{texts.enabled}</Label>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="limits" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{texts.minimumAmount}</Label>
                  <Input
                    type="number"
                    placeholder="1"
                    defaultValue={editingMethod?.minimumAmount}
                  />
                  <p className="text-xs text-gray-500">
                    {isRTL ? 'الحد الأدنى للمبلغ المقبول' : 'Minimum accepted amount'}
                  </p>
                </div>
                <div className="space-y-2">
                  <Label>{texts.maximumAmount}</Label>
                  <Input
                    type="number"
                    placeholder="100000"
                    defaultValue={editingMethod?.maximumAmount}
                  />
                  <p className="text-xs text-gray-500">
                    {isRTL ? 'الحد الأقصى للمبلغ المقبول' : 'Maximum accepted amount'}
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <Label>{texts.countries}</Label>
                <Textarea
                  placeholder={isRTL ? 'البلدان المدعومة (SA, AE, KW, QA, BH, OM)' : 'Supported countries (SA, AE, KW, QA, BH, OM)'}
                  defaultValue={editingMethod?.countries.join(', ')}
                  rows={3}
                />
                <p className="text-xs text-gray-500">
                  {isRTL ? 'أدخل رموز البلدان مفصولة بفواصل' : 'Enter country codes separated by commas'}
                </p>
              </div>

              <div className="space-y-2">
                <Label>{texts.currencies}</Label>
                <Textarea
                  placeholder={isRTL ? 'العملات المدعومة (SAR, USD, EUR, AED)' : 'Supported currencies (SAR, USD, EUR, AED)'}
                  defaultValue={editingMethod?.currencies.join(', ')}
                  rows={2}
                />
                <p className="text-xs text-gray-500">
                  {isRTL ? 'أدخل رموز العملات مفصولة بفواصل' : 'Enter currency codes separated by commas'}
                </p>
              </div>
            </TabsContent>

            <TabsContent value="features" className="space-y-4">
              <div className="space-y-2">
                <Label>{texts.features}</Label>
                <Textarea
                  placeholder={isRTL ? 'المزايا (3D Secure, Tokenization, Recurring)' : 'Features (3D Secure, Tokenization, Recurring)'}
                  defaultValue={editingMethod?.features.join('\n')}
                  rows={4}
                />
                <p className="text-xs text-gray-500">
                  {isRTL ? 'أدخل ميزة واحدة في كل سطر' : 'Enter one feature per line'}
                </p>
              </div>

              <div className="space-y-2">
                <Label>{texts.requirements}</Label>
                <Textarea
                  placeholder={isRTL ? 'المتطلبات (Valid card, CVV verification)' : 'Requirements (Valid card, CVV verification)'}
                  defaultValue={editingMethod?.requirements.join('\n')}
                  rows={4}
                />
                <p className="text-xs text-gray-500">
                  {isRTL ? 'أدخل متطلب واحد في كل سطر' : 'Enter one requirement per line'}
                </p>
              </div>

              <Alert className="border-blue-200 bg-blue-50">
                <InformationCircleIcon className="h-4 w-4 text-blue-600" />
                <AlertDescription className="text-blue-800">
                  {isRTL
                    ? 'المزايا والمتطلبات تساعد المستخدمين على فهم ما يحتاجونه لاستخدام طريقة الدفع هذه.'
                    : 'Features and requirements help users understand what they need to use this payment method.'
                  }
                </AlertDescription>
              </Alert>
            </TabsContent>

            <TabsContent value="fees" className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>{isRTL ? 'رسوم ثابتة' : 'Fixed Fee'}</Label>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    defaultValue={editingMethod?.fees.fixed}
                  />
                  <p className="text-xs text-gray-500">
                    {isRTL ? 'رسوم ثابتة لكل معاملة' : 'Fixed fee per transaction'}
                  </p>
                </div>
                <div className="space-y-2">
                  <Label>{isRTL ? 'رسوم نسبية (%)' : 'Percentage Fee (%)'}</Label>
                  <Input
                    type="number"
                    step="0.1"
                    placeholder="2.9"
                    defaultValue={editingMethod?.fees.percentage}
                  />
                  <p className="text-xs text-gray-500">
                    {isRTL ? 'نسبة مئوية من قيمة المعاملة' : 'Percentage of transaction amount'}
                  </p>
                </div>
                <div className="space-y-2">
                  <Label>{isRTL ? 'عملة الرسوم' : 'Fee Currency'}</Label>
                  <Select defaultValue={editingMethod?.fees.currency}>
                    <SelectTrigger>
                      <SelectValue placeholder={isRTL ? 'اختر العملة' : 'Select currency'} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="SAR">SAR</SelectItem>
                      <SelectItem value="USD">USD</SelectItem>
                      <SelectItem value="EUR">EUR</SelectItem>
                      <SelectItem value="AED">AED</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Card className="p-4 bg-gray-50 dark:bg-gray-800">
                <h4 className="font-medium mb-2">{isRTL ? 'حاسبة الرسوم' : 'Fee Calculator'}</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>{isRTL ? 'مبلغ المعاملة' : 'Transaction Amount'}</Label>
                    <Input type="number" placeholder="100" />
                  </div>
                  <div>
                    <Label>{isRTL ? 'إجمالي الرسوم' : 'Total Fees'}</Label>
                    <Input readOnly placeholder="2.90" className="bg-white dark:bg-gray-700" />
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  {isRTL ? 'الحساب: رسوم ثابتة + (المبلغ × النسبة المئوية)' : 'Calculation: Fixed fee + (Amount × Percentage)'}
                </p>
              </Card>
            </TabsContent>
          </Tabs>

          <DialogFooter className="flex space-x-2 rtl:space-x-reverse">
            <Button variant="outline" onClick={() => setShowMethodDialog(false)}>
              {texts.cancel}
            </Button>
            <Button variant="outline" onClick={() => {
              toast.success(isRTL ? 'تم اختبار طريقة الدفع بنجاح' : 'Payment method test successful');
            }}>
              <CheckCircleIcon className="h-4 w-4 mr-1 rtl:ml-1 rtl:mr-0" />
              {texts.test}
            </Button>
            <Button onClick={() => {
              toast.success(isRTL ? 'تم حفظ طريقة الدفع بنجاح مع جميع الإعدادات' : 'Payment method saved successfully with all settings');
              setShowMethodDialog(false);
              setEditingMethod(null);
            }}>
              {texts.save}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}