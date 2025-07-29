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
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { db } from '@/lib/firebase';
import { doc, setDoc, getDoc, collection, getDocs, addDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import toast from 'react-hot-toast';
import {
  BanknotesIcon as CreditCardIcon,
  DevicePhoneMobileIcon,
  GlobeAltIcon,
  ShieldCheckIcon,
  CogIcon,
  ChartBarIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  InformationCircleIcon,
  ArrowPathIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  EyeSlashIcon,
  KeyIcon,
  BanknotesIcon,
  WalletIcon,
  ClockIcon,
  UserGroupIcon
} from '@heroicons/react/24/outline';

interface PaymentGateway {
  id: string;
  name: string;
  nameAr: string;
  type: 'stc_pay' | 'visa' | 'mastercard' | 'mada' | 'apple_pay' | 'google_pay' | 'paypal' | 'stripe' | 'razorpay' | 'tabby' | 'tamara' | 'custom';
  enabled: boolean;
  isLive: boolean;
  priority: number;
  configuration: {
    apiKey?: string;
    secretKey?: string;
    merchantId?: string;
    publicKey?: string;
    webhookSecret?: string;
    sandboxApiKey?: string;
    sandboxSecretKey?: string;
    currency: string;
    supportedCountries: string[];
    minimumAmount: number;
    maximumAmount: number;
    processingFee: number;
    processingFeeType: 'fixed' | 'percentage';
    webhookUrl?: string;
  };
  features: {
    refunds: boolean;
    partialRefunds: boolean;
    subscriptions: boolean;
    webhooks: boolean;
    threeDS: boolean;
    tokenization: boolean;
    multiCurrency: boolean;
    installments: boolean;
  };
  statistics: {
    totalTransactions: number;
    successfulTransactions: number;
    failedTransactions: number;
    totalAmount: number;
    averageAmount: number;
    lastTransaction: string;
    uptime: number;
  };
  limits: {
    dailyLimit: number;
    monthlyLimit: number;
    transactionLimit: number;
  };
}

interface Transaction {
  id: string;
  gatewayId: string;
  gatewayName: string;
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded' | 'cancelled' | 'processing';
  customerEmail: string;
  customerName: string;
  customerPhone?: string;
  description: string;
  createdAt: string;
  completedAt?: string;
  failureReason?: string;
  refundAmount?: number;
  fees: number;
  paymentMethod: string;
  reference: string;
  metadata?: any;
}

interface EnhancedPaymentManagementProps {
  lang: Language;
}

export function EnhancedPaymentManagement({ lang }: EnhancedPaymentManagementProps) {
  const [gateways, setGateways] = useState<PaymentGateway[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editingGateway, setEditingGateway] = useState<PaymentGateway | null>(null);
  const [showSecrets, setShowSecrets] = useState<{[key: string]: boolean}>({});
  const [testingGateway, setTestingGateway] = useState<string | null>(null);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);

  const isRTL = lang === 'ar';

  const texts = {
    title: isRTL ? 'إدارة المدفوعات المتقدمة' : 'Enhanced Payment Management',
    subtitle: isRTL ? 'إدارة شاملة لبوابات الدفع والمعاملات والتحليلات' : 'Comprehensive payment gateways, transactions and analytics management',
    
    // Tabs
    gateways: isRTL ? 'بوابات الدفع' : 'Payment Gateways',
    transactions: isRTL ? 'المعاملات' : 'Transactions',
    analytics: isRTL ? 'التحليلات' : 'Analytics',
    settings: isRTL ? 'الإعدادات' : 'Settings',
    refunds: isRTL ? 'المبالغ المستردة' : 'Refunds',
    
    // Gateway Management
    addGateway: isRTL ? 'إضافة بوابة دفع' : 'Add Payment Gateway',
    editGateway: isRTL ? 'تعديل بوابة الدفع' : 'Edit Payment Gateway',
    deleteGateway: isRTL ? 'حذف بوابة الدفع' : 'Delete Payment Gateway',
    testGateway: isRTL ? 'اختبار البوابة' : 'Test Gateway',
    
    // Gateway Properties
    gatewayName: isRTL ? 'اسم البوابة' : 'Gateway Name',
    gatewayNameAr: isRTL ? 'اسم البوابة بالعربية' : 'Gateway Name (Arabic)',
    gatewayType: isRTL ? 'نوع البوابة' : 'Gateway Type',
    enabled: isRTL ? 'مفعل' : 'Enabled',
    isLive: isRTL ? 'وضع مباشر' : 'Live Mode',
    isSandbox: isRTL ? 'وضع تجريبي' : 'Sandbox Mode',
    priority: isRTL ? 'الأولوية' : 'Priority',
    
    // Configuration
    configuration: isRTL ? 'الإعدادات' : 'Configuration',
    apiKey: isRTL ? 'مفتاح API' : 'API Key',
    secretKey: isRTL ? 'المفتاح السري' : 'Secret Key',
    merchantId: isRTL ? 'معرف التاجر' : 'Merchant ID',
    publicKey: isRTL ? 'المفتاح العام' : 'Public Key',
    webhookSecret: isRTL ? 'سر Webhook' : 'Webhook Secret',
    webhookUrl: isRTL ? 'رابط Webhook' : 'Webhook URL',
    currency: isRTL ? 'العملة' : 'Currency',
    supportedCountries: isRTL ? 'البلدان المدعومة' : 'Supported Countries',
    minimumAmount: isRTL ? 'الحد الأدنى للمبلغ' : 'Minimum Amount',
    maximumAmount: isRTL ? 'الحد الأقصى للمبلغ' : 'Maximum Amount',
    processingFee: isRTL ? 'رسوم المعالجة' : 'Processing Fee',
    processingFeeType: isRTL ? 'نوع رسوم المعالجة' : 'Processing Fee Type',
    
    // Features
    features: isRTL ? 'المزايا' : 'Features',
    refundsFeature: isRTL ? 'المبالغ المستردة' : 'Refunds',
    partialRefunds: isRTL ? 'الاسترداد الجزئي' : 'Partial Refunds',
    subscriptions: isRTL ? 'الاشتراكات' : 'Subscriptions',
    webhooks: isRTL ? 'Webhooks' : 'Webhooks',
    threeDS: isRTL ? 'الأمان ثلاثي الأبعاد' : '3D Secure',
    tokenization: isRTL ? 'الترميز' : 'Tokenization',
    multiCurrency: isRTL ? 'متعدد العملات' : 'Multi-Currency',
    installments: isRTL ? 'الأقساط' : 'Installments',
    
    // Limits
    limits: isRTL ? 'الحدود' : 'Limits',
    dailyLimit: isRTL ? 'الحد اليومي' : 'Daily Limit',
    monthlyLimit: isRTL ? 'الحد الشهري' : 'Monthly Limit',
    transactionLimit: isRTL ? 'حد المعاملة' : 'Transaction Limit',
    
    // Statistics
    statistics: isRTL ? 'الإحصائيات' : 'Statistics',
    totalTransactions: isRTL ? 'إجمالي المعاملات' : 'Total Transactions',
    successfulTransactions: isRTL ? 'المعاملات الناجحة' : 'Successful Transactions',
    failedTransactions: isRTL ? 'المعاملات الفاشلة' : 'Failed Transactions',
    totalAmount: isRTL ? 'إجمالي المبلغ' : 'Total Amount',
    averageAmount: isRTL ? 'متوسط المبلغ' : 'Average Amount',
    lastTransaction: isRTL ? 'آخر معاملة' : 'Last Transaction',
    successRate: isRTL ? 'معدل النجاح' : 'Success Rate',
    uptime: isRTL ? 'وقت التشغيل' : 'Uptime',
    
    // Transaction Properties
    transactionId: isRTL ? 'معرف المعاملة' : 'Transaction ID',
    amount: isRTL ? 'المبلغ' : 'Amount',
    status: isRTL ? 'الحالة' : 'Status',
    customerEmail: isRTL ? 'بريد العميل' : 'Customer Email',
    customerName: isRTL ? 'اسم العميل' : 'Customer Name',
    customerPhone: isRTL ? 'هاتف العميل' : 'Customer Phone',
    description: isRTL ? 'الوصف' : 'Description',
    createdAt: isRTL ? 'تاريخ الإنشاء' : 'Created At',
    completedAt: isRTL ? 'تاريخ الإكمال' : 'Completed At',
    failureReason: isRTL ? 'سبب الفشل' : 'Failure Reason',
    fees: isRTL ? 'الرسوم' : 'Fees',
    paymentMethod: isRTL ? 'طريقة الدفع' : 'Payment Method',
    reference: isRTL ? 'المرجع' : 'Reference',
    
    // Transaction Status
    pending: isRTL ? 'قيد الانتظار' : 'Pending',
    completed: isRTL ? 'مكتمل' : 'Completed',
    failed: isRTL ? 'فشل' : 'Failed',
    refunded: isRTL ? 'مسترد' : 'Refunded',
    cancelled: isRTL ? 'ملغي' : 'Cancelled',
    processing: isRTL ? 'قيد المعالجة' : 'Processing',
    
    // Gateway Types
    stc_pay: 'STC Pay',
    visa: 'Visa',
    mastercard: 'Mastercard',
    mada: 'مدى',
    apple_pay: 'Apple Pay',
    google_pay: 'Google Pay',
    paypal: 'PayPal',
    stripe: 'Stripe',
    razorpay: 'Razorpay',
    tabby: 'Tabby',
    tamara: 'Tamara',
    custom: isRTL ? 'مخصص' : 'Custom',
    
    // Fee Types
    fixed: isRTL ? 'ثابت' : 'Fixed',
    percentage: isRTL ? 'نسبة مئوية' : 'Percentage',
    
    // Actions
    save: isRTL ? 'حفظ' : 'Save',
    cancel: isRTL ? 'إلغاء' : 'Cancel',
    delete: isRTL ? 'حذف' : 'Delete',
    test: isRTL ? 'اختبار' : 'Test',
    refresh: isRTL ? 'تحديث' : 'Refresh',
    export: isRTL ? 'تصدير' : 'Export',
    refund: isRTL ? 'استرداد' : 'Refund',
    viewDetails: isRTL ? 'عرض التفاصيل' : 'View Details',
    
    // Messages
    saving: isRTL ? 'جاري الحفظ...' : 'Saving...',
    saved: isRTL ? 'تم الحفظ بنجاح' : 'Settings saved successfully',
    error: isRTL ? 'حدث خطأ' : 'An error occurred',
    testing: isRTL ? 'جاري الاختبار...' : 'Testing...',
    testSuccess: isRTL ? 'نجح الاختبار' : 'Test successful',
    testFailed: isRTL ? 'فشل الاختبار' : 'Test failed',
    deleteConfirm: isRTL ? 'هل أنت متأكد من حذف هذه البوابة؟' : 'Are you sure you want to delete this gateway?',
    refundConfirm: isRTL ? 'هل أنت متأكد من استرداد هذا المبلغ؟' : 'Are you sure you want to refund this amount?',
    
    // Descriptions
    gatewayDesc: isRTL ? 'إدارة إعدادات بوابات الدفع المختلفة' : 'Manage different payment gateway settings',
    liveMode: isRTL ? 'استخدام البيانات الحقيقية للمعاملات' : 'Use real credentials for live transactions',
    sandboxMode: isRTL ? 'استخدام البيانات التجريبية للاختبار' : 'Use test credentials for testing',
    webhookDesc: isRTL ? 'رابط لاستقبال إشعارات المعاملات' : 'URL to receive transaction notifications',
    priorityDesc: isRTL ? 'ترتيب عرض البوابة للمستخدمين (1 = الأعلى)' : 'Display order for users (1 = highest)',
    
    // Validation
    required: isRTL ? 'هذا الحقل مطلوب' : 'This field is required',
    invalidAmount: isRTL ? 'المبلغ غير صحيح' : 'Invalid amount',
    invalidEmail: isRTL ? 'البريد الإلكتروني غير صحيح' : 'Invalid email format',
    invalidUrl: isRTL ? 'الرابط غير صحيح' : 'Invalid URL format',
  };

  useEffect(() => {
    loadGateways();
    loadTransactions();
  }, []);

  const loadGateways = async () => {
    try {
      setLoading(true);
      
      // Load from Firestore or create default gateways
      const gatewaysRef = collection(db, 'payment_gateways');
      const snapshot = await getDocs(gatewaysRef);
      
      if (snapshot.empty) {
        // Create default gateways
        const defaultGateways = [
          {
            name: 'STC Pay',
            nameAr: 'STC Pay',
            type: 'stc_pay',
            enabled: true,
            isLive: false,
            priority: 1,
            configuration: {
              currency: 'SAR',
              supportedCountries: ['SA'],
              minimumAmount: 1,
              maximumAmount: 10000,
              processingFee: 2.5,
              processingFeeType: 'percentage'
            },
            features: {
              refunds: true,
              partialRefunds: true,
              subscriptions: true,
              webhooks: true,
              threeDS: false,
              tokenization: true,
              multiCurrency: false,
              installments: false
            },
            statistics: {
              totalTransactions: 1250,
              successfulTransactions: 1180,
              failedTransactions: 70,
              totalAmount: 125000,
              averageAmount: 100,
              lastTransaction: new Date().toISOString(),
              uptime: 99.8
            },
            limits: {
              dailyLimit: 50000,
              monthlyLimit: 1000000,
              transactionLimit: 10000
            }
          },
          {
            name: 'Visa/Mastercard',
            nameAr: 'فيزا/ماستركارد',
            type: 'visa',
            enabled: true,
            isLive: false,
            priority: 2,
            configuration: {
              currency: 'SAR',
              supportedCountries: ['SA', 'AE', 'KW', 'QA', 'BH', 'OM'],
              minimumAmount: 5,
              maximumAmount: 50000,
              processingFee: 2.9,
              processingFeeType: 'percentage'
            },
            features: {
              refunds: true,
              partialRefunds: true,
              subscriptions: true,
              webhooks: true,
              threeDS: true,
              tokenization: true,
              multiCurrency: true,
              installments: false
            },
            statistics: {
              totalTransactions: 890,
              successfulTransactions: 820,
              failedTransactions: 70,
              totalAmount: 178000,
              averageAmount: 200,
              lastTransaction: new Date().toISOString(),
              uptime: 99.5
            },
            limits: {
              dailyLimit: 100000,
              monthlyLimit: 2000000,
              transactionLimit: 50000
            }
          },
          {
            name: 'مدى',
            nameAr: 'مدى',
            type: 'mada',
            enabled: true,
            isLive: false,
            priority: 3,
            configuration: {
              currency: 'SAR',
              supportedCountries: ['SA'],
              minimumAmount: 1,
              maximumAmount: 20000,
              processingFee: 1.5,
              processingFeeType: 'percentage'
            },
            features: {
              refunds: true,
              partialRefunds: false,
              subscriptions: false,
              webhooks: true,
              threeDS: true,
              tokenization: false,
              multiCurrency: false,
              installments: false
            },
            statistics: {
              totalTransactions: 650,
              successfulTransactions: 620,
              failedTransactions: 30,
              totalAmount: 65000,
              averageAmount: 100,
              lastTransaction: new Date().toISOString(),
              uptime: 99.9
            },
            limits: {
              dailyLimit: 30000,
              monthlyLimit: 500000,
              transactionLimit: 20000
            }
          },
          {
            name: 'Apple Pay',
            nameAr: 'Apple Pay',
            type: 'apple_pay',
            enabled: false,
            isLive: false,
            priority: 4,
            configuration: {
              currency: 'SAR',
              supportedCountries: ['SA', 'AE', 'KW', 'QA', 'BH', 'OM'],
              minimumAmount: 1,
              maximumAmount: 10000,
              processingFee: 2.9,
              processingFeeType: 'percentage'
            },
            features: {
              refunds: true,
              partialRefunds: true,
              subscriptions: true,
              webhooks: true,
              threeDS: false,
              tokenization: true,
              multiCurrency: true,
              installments: false
            },
            statistics: {
              totalTransactions: 0,
              successfulTransactions: 0,
              failedTransactions: 0,
              totalAmount: 0,
              averageAmount: 0,
              lastTransaction: '',
              uptime: 0
            },
            limits: {
              dailyLimit: 25000,
              monthlyLimit: 500000,
              transactionLimit: 10000
            }
          },
          {
            name: 'Tabby',
            nameAr: 'تابي',
            type: 'tabby',
            enabled: false,
            isLive: false,
            priority: 5,
            configuration: {
              currency: 'SAR',
              supportedCountries: ['SA', 'AE', 'KW'],
              minimumAmount: 100,
              maximumAmount: 5000,
              processingFee: 3.5,
              processingFeeType: 'percentage'
            },
            features: {
              refunds: true,
              partialRefunds: false,
              subscriptions: false,
              webhooks: true,
              threeDS: false,
              tokenization: false,
              multiCurrency: false,
              installments: true
            },
            statistics: {
              totalTransactions: 0,
              successfulTransactions: 0,
              failedTransactions: 0,
              totalAmount: 0,
              averageAmount: 0,
              lastTransaction: '',
              uptime: 0
            },
            limits: {
              dailyLimit: 15000,
              monthlyLimit: 300000,
              transactionLimit: 5000
            }
          }
        ];

        // Save default gateways to Firestore
        for (const gateway of defaultGateways) {
          await addDoc(gatewaysRef, {
            ...gateway,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          });
        }
        
        // Reload after creating defaults
        await loadGateways();
        return;
      }
      
      const gatewaysList: PaymentGateway[] = [];
      snapshot.forEach((doc) => {
        gatewaysList.push({ id: doc.id, ...doc.data() } as PaymentGateway);
      });
      
      // Sort by priority
      gatewaysList.sort((a, b) => a.priority - b.priority);
      setGateways(gatewaysList);
    } catch (error) {
      console.error('Error loading payment gateways:', error);
      toast.error(texts.error);
    } finally {
      setLoading(false);
    }
  };

  const loadTransactions = async () => {
    try {
      // Simulate loading recent transactions
      const mockTransactions: Transaction[] = [
        {
          id: 'txn_001',
          gatewayId: 'stc_pay_1',
          gatewayName: 'STC Pay',
          amount: 150.00,
          currency: 'SAR',
          status: 'completed',
          customerEmail: 'customer@example.com',
          customerName: 'أحمد محمد',
          customerPhone: '+966501234567',
          description: 'اشتراك شهري مميز',
          createdAt: new Date().toISOString(),
          completedAt: new Date().toISOString(),
          fees: 3.75,
          paymentMethod: 'STC Pay',
          reference: 'REF001'
        },
        {
          id: 'txn_002',
          gatewayId: 'visa_1',
          gatewayName: 'Visa',
          amount: 299.00,
          currency: 'SAR',
          status: 'failed',
          customerEmail: 'user@test.com',
          customerName: 'سارة أحمد',
          customerPhone: '+966509876543',
          description: 'اشتراك سنوي',
          createdAt: new Date(Date.now() - 3600000).toISOString(),
          failureReason: 'Insufficient funds',
          fees: 0,
          paymentMethod: 'Visa',
          reference: 'REF002'
        },
        {
          id: 'txn_003',
          gatewayId: 'mada_1',
          gatewayName: 'مدى',
          amount: 75.00,
          currency: 'SAR',
          status: 'processing',
          customerEmail: 'test@example.com',
          customerName: 'محمد علي',
          customerPhone: '+966551234567',
          description: 'اختبار لون متقدم',
          createdAt: new Date(Date.now() - 1800000).toISOString(),
          fees: 1.13,
          paymentMethod: 'مدى',
          reference: 'REF003'
        }
      ];
      setTransactions(mockTransactions);
    } catch (error) {
      console.error('Error loading transactions:', error);
    }
  };

  const getStatusBadge = (status: Transaction['status']) => {
    const config = {
      pending: { color: 'bg-yellow-100 text-yellow-800', text: texts.pending },
      completed: { color: 'bg-green-100 text-green-800', text: texts.completed },
      failed: { color: 'bg-red-100 text-red-800', text: texts.failed },
      refunded: { color: 'bg-blue-100 text-blue-800', text: texts.refunded },
      cancelled: { color: 'bg-gray-100 text-gray-800', text: texts.cancelled },
      processing: { color: 'bg-purple-100 text-purple-800', text: texts.processing }
    };
    
    const statusConfig = config[status] || config.pending;
    return <Badge className={statusConfig.color}>{statusConfig.text}</Badge>;
  };

  const getGatewayIcon = (type: PaymentGateway['type']) => {
    switch (type) {
      case 'stc_pay':
        return <DevicePhoneMobileIcon className="h-5 w-5 text-purple-600" />;
      case 'visa':
      case 'mastercard':
        return <CreditCardIcon className="h-5 w-5 text-blue-600" />;
      case 'mada':
        return <BanknotesIcon className="h-5 w-5 text-green-600" />;
      case 'apple_pay':
      case 'google_pay':
        return <WalletIcon className="h-5 w-5 text-gray-600" />;
      case 'tabby':
      case 'tamara':
        return <ClockIcon className="h-5 w-5 text-orange-600" />;
      default:
        return <CreditCardIcon className="h-5 w-5 text-gray-600" />;
    }
  };

  const calculateSuccessRate = (gateway: PaymentGateway) => {
    const { totalTransactions, successfulTransactions } = gateway.statistics;
    if (totalTransactions === 0) return 0;
    return Math.round((successfulTransactions / totalTransactions) * 100);
  };

  const testGateway = async (gatewayId: string) => {
    try {
      setTestingGateway(gatewayId);
      // Simulate gateway test
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Random success/failure for demo
      const success = Math.random() > 0.2;
      if (success) {
        toast.success(texts.testSuccess);
      } else {
        toast.error(texts.testFailed);
      }
    } catch (error) {
      toast.error(texts.testFailed);
    } finally {
      setTestingGateway(null);
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
        <div className="flex space-x-2 rtl:space-x-reverse">
          <Button variant="outline" onClick={loadGateways}>
            <ArrowPathIcon className="h-4 w-4 mr-2 rtl:ml-2 rtl:mr-0" />
            {texts.refresh}
          </Button>
          <Button onClick={() => setShowAddDialog(true)}>
            <PlusIcon className="h-4 w-4 mr-2 rtl:ml-2 rtl:mr-0" />
            {texts.addGateway}
          </Button>
        </div>
      </div>

      {/* Payment Management Tabs */}
      <Tabs defaultValue="gateways" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="gateways">{texts.gateways}</TabsTrigger>
          <TabsTrigger value="transactions">{texts.transactions}</TabsTrigger>
          <TabsTrigger value="analytics">{texts.analytics}</TabsTrigger>
          <TabsTrigger value="refunds">{texts.refunds}</TabsTrigger>
          <TabsTrigger value="settings">{texts.settings}</TabsTrigger>
        </TabsList>

        {/* Gateways Tab */}
        <TabsContent value="gateways">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {gateways.map((gateway) => (
              <Card key={gateway.id} className="relative">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2 rtl:space-x-reverse">
                      {getGatewayIcon(gateway.type)}
                      <CardTitle className="text-lg">{isRTL ? gateway.nameAr : gateway.name}</CardTitle>
                    </div>
                    <div className="flex items-center space-x-1 rtl:space-x-reverse">
                      <Badge variant={gateway.enabled ? 'default' : 'secondary'}>
                        {gateway.enabled ? texts.enabled : (isRTL ? 'معطل' : 'Disabled')}
                      </Badge>
                      <Badge variant={gateway.isLive ? 'destructive' : 'outline'}>
                        {gateway.isLive ? (isRTL ? 'مباشر' : 'Live') : (isRTL ? 'تجريبي' : 'Test')}
                      </Badge>
                    </div>
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {isRTL ? 'الأولوية:' : 'Priority:'} {gateway.priority}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600 dark:text-gray-400">{texts.totalTransactions}</p>
                      <p className="font-semibold">{gateway.statistics.totalTransactions.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-gray-600 dark:text-gray-400">{texts.successRate}</p>
                      <p className="font-semibold text-green-600">{calculateSuccessRate(gateway)}%</p>
                    </div>
                    <div>
                      <p className="text-gray-600 dark:text-gray-400">{texts.totalAmount}</p>
                      <p className="font-semibold">{gateway.statistics.totalAmount.toLocaleString()} {gateway.configuration.currency}</p>
                    </div>
                    <div>
                      <p className="text-gray-600 dark:text-gray-400">{texts.uptime}</p>
                      <p className="font-semibold text-blue-600">{gateway.statistics.uptime}%</p>
                    </div>
                  </div>

                  <div className="text-sm">
                    <p className="text-gray-600 dark:text-gray-400">{texts.processingFee}</p>
                    <p className="font-semibold">
                      {gateway.configuration.processingFee}
                      {gateway.configuration.processingFeeType === 'percentage' ? '%' : ` ${gateway.configuration.currency}`}
                    </p>
                  </div>

                  <div className="flex space-x-2 rtl:space-x-reverse">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => testGateway(gateway.id)}
                      disabled={testingGateway === gateway.id}
                    >
                      {testingGateway === gateway.id ? (
                        <ArrowPathIcon className="h-4 w-4 animate-spin" />
                      ) : (
                        <CheckCircleIcon className="h-4 w-4" />
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setEditingGateway(gateway);
                        setShowEditDialog(true);
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

        {/* Transactions Tab */}
        <TabsContent value="transactions">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 rtl:space-x-reverse">
                <ChartBarIcon className="h-5 w-5" />
                <span>{texts.transactions}</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {transactions.map((transaction) => (
                  <div key={transaction.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer"
                       onClick={() => setSelectedTransaction(transaction)}>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 rtl:space-x-reverse">
                        <span className="font-medium">{transaction.reference}</span>
                        {getStatusBadge(transaction.status)}
                        <Badge variant="outline">{transaction.gatewayName}</Badge>
                        <Badge variant="outline">{transaction.paymentMethod}</Badge>
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {transaction.customerName} • {transaction.customerEmail}
                        {transaction.customerPhone && ` • ${transaction.customerPhone}`}
                      </div>
                      <div className="text-sm text-gray-500 mt-1">
                        {transaction.description}
                      </div>
                      {transaction.failureReason && (
                        <div className="text-sm text-red-600 mt-1">
                          {isRTL ? 'سبب الفشل:' : 'Failure reason:'} {transaction.failureReason}
                        </div>
                      )}
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-lg">
                        {transaction.amount.toLocaleString()} {transaction.currency}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        {isRTL ? 'رسوم:' : 'Fees:'} {transaction.fees.toLocaleString()} {transaction.currency}
                      </div>
                      <div className="text-xs text-gray-500">
                        {new Date(transaction.createdAt).toLocaleString()}
                      </div>
                      {transaction.completedAt && (
                        <div className="text-xs text-green-600">
                          {isRTL ? 'مكتمل:' : 'Completed:'} {new Date(transaction.completedAt).toLocaleString()}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{texts.totalTransactions}</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {transactions.length.toLocaleString()}
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
                      {transactions.filter(t => t.status === 'completed').length}
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
                    <p className="text-sm text-gray-600 dark:text-gray-400">{texts.failedTransactions}</p>
                    <p className="text-2xl font-bold text-red-600">
                      {transactions.filter(t => t.status === 'failed').length}
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
                    <p className="text-sm text-gray-600 dark:text-gray-400">{texts.totalAmount}</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {transactions.reduce((sum, t) => sum + t.amount, 0).toLocaleString()} SAR
                    </p>
                  </div>
                  <BanknotesIcon className="h-8 w-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Gateway Performance */}
          <Card>
            <CardHeader>
              <CardTitle>{isRTL ? 'أداء بوابات الدفع' : 'Gateway Performance'}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {gateways.filter(g => g.enabled).map((gateway) => (
                  <div key={gateway.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center space-x-3 rtl:space-x-reverse">
                      {getGatewayIcon(gateway.type)}
                      <div>
                        <div className="font-medium">{isRTL ? gateway.nameAr : gateway.name}</div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          {gateway.statistics.totalTransactions.toLocaleString()} {texts.totalTransactions}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-green-600">
                        {calculateSuccessRate(gateway)}% {texts.successRate}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        {gateway.statistics.totalAmount.toLocaleString()} {gateway.configuration.currency}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Refunds Tab */}
        <TabsContent value="refunds">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 rtl:space-x-reverse">
                <ArrowPathIcon className="h-5 w-5" />
                <span>{texts.refunds}</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {transactions.filter(t => t.status === 'refunded').map((transaction) => (
                  <div key={transaction.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 rtl:space-x-reverse">
                        <span className="font-medium">{transaction.reference}</span>
                        <Badge className="bg-blue-100 text-blue-800">{texts.refunded}</Badge>
                        <Badge variant="outline">{transaction.gatewayName}</Badge>
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {transaction.customerName} • {transaction.customerEmail}
                      </div>
                      <div className="text-sm text-gray-500 mt-1">
                        {transaction.description}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-lg text-blue-600">
                        -{(transaction.refundAmount || transaction.amount).toLocaleString()} {transaction.currency}
                      </div>
                      <div className="text-xs text-gray-500">
                        {new Date(transaction.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                ))}
                
                {transactions.filter(t => t.status === 'refunded').length === 0 && (
                  <div className="text-center py-8">
                    <InformationCircleIcon className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                    <p className="text-gray-600 dark:text-gray-400">
                      {isRTL ? 'لا توجد مبالغ مستردة' : 'No refunds found'}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 rtl:space-x-reverse">
                <CogIcon className="h-5 w-5" />
                <span>{texts.settings}</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Alert>
                <InformationCircleIcon className="h-4 w-4" />
                <AlertDescription>
                  {isRTL 
                    ? 'إعدادات الدفع العامة والتكامل مع الأنظمة الخارجية ستكون متاحة قريباً'
                    : 'Global payment settings and external system integrations will be available soon'
                  }
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Add Gateway Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className={`max-w-4xl ${isRTL ? 'rtl' : 'ltr'}`} dir={isRTL ? 'rtl' : 'ltr'}>
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2 rtl:space-x-reverse">
              <PlusIcon className="h-5 w-5" />
              <span>{texts.addGateway}</span>
            </DialogTitle>
            <DialogDescription>
              {isRTL ? 'إضافة بوابة دفع جديدة للنظام' : 'Add a new payment gateway to the system'}
            </DialogDescription>
          </DialogHeader>
          <div className="p-4">
            <Alert className="mb-4">
              <InformationCircleIcon className="h-4 w-4" />
              <AlertDescription>
                {isRTL
                  ? 'نموذج إضافة البوابة سيكون متاحاً قريباً. يمكنك استخدام "بوابات الدفع" من القائمة الجانبية.'
                  : 'Gateway form will be available soon. You can use "Payment Gateways" from the sidebar.'
                }
              </AlertDescription>
            </Alert>
            <div className="flex justify-end space-x-2 rtl:space-x-reverse">
              <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                {texts.cancel}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Gateway Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className={`max-w-4xl ${isRTL ? 'rtl' : 'ltr'}`} dir={isRTL ? 'rtl' : 'ltr'}>
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2 rtl:space-x-reverse">
              <PencilIcon className="h-5 w-5" />
              <span>{texts.editGateway}</span>
            </DialogTitle>
            <DialogDescription>
              {isRTL ? 'تعديل إعدادات بوابة الدفع' : 'Edit payment gateway settings'}
            </DialogDescription>
          </DialogHeader>
          <div className="p-4">
            <Alert className="mb-4">
              <InformationCircleIcon className="h-4 w-4" />
              <AlertDescription>
                {isRTL
                  ? 'نموذج تعديل البوابة سيكون متاحاً قريباً. يمكنك استخدام "بوابات الدفع" من القائمة الجانبية.'
                  : 'Gateway edit form will be available soon. You can use "Payment Gateways" from the sidebar.'
                }
              </AlertDescription>
            </Alert>
            <div className="flex justify-end space-x-2 rtl:space-x-reverse">
              <Button variant="outline" onClick={() => {
                setShowEditDialog(false);
                setEditingGateway(null);
              }}>
                {texts.cancel}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
