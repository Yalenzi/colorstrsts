'use client';

import React, { useState, useEffect } from 'react';
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
  WalletIcon
} from '@heroicons/react/24/outline';

interface PaymentGateway {
  id: string;
  name: string;
  type: 'stc_pay' | 'visa' | 'mastercard' | 'mada' | 'apple_pay' | 'google_pay' | 'paypal' | 'stripe' | 'razorpay' | 'custom';
  enabled: boolean;
  isLive: boolean;
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
  };
  features: {
    refunds: boolean;
    partialRefunds: boolean;
    subscriptions: boolean;
    webhooks: boolean;
    threeDS: boolean;
    tokenization: boolean;
    multiCurrency: boolean;
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

interface Transaction {
  id: string;
  gatewayId: string;
  gatewayName: string;
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded' | 'cancelled';
  customerEmail: string;
  customerName: string;
  description: string;
  createdAt: string;
  completedAt?: string;
  failureReason?: string;
  refundAmount?: number;
  fees: number;
}

interface PaymentGatewaysManagementProps {
  lang: Language;
}

export function PaymentGatewaysManagement({ lang }: PaymentGatewaysManagementProps) {
  const [gateways, setGateways] = useState<PaymentGateway[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editingGateway, setEditingGateway] = useState<PaymentGateway | null>(null);
  const [showSecrets, setShowSecrets] = useState<{[key: string]: boolean}>({});
  const [testingGateway, setTestingGateway] = useState<string | null>(null);

  const isRTL = lang === 'ar';

  const texts = {
    title: isRTL ? 'إدارة بوابات الدفع' : 'Payment Gateways Management',
    subtitle: isRTL ? 'إدارة شاملة لجميع بوابات الدفع والمعاملات' : 'Comprehensive management of all payment gateways and transactions',
    
    // Tabs
    gateways: isRTL ? 'البوابات' : 'Gateways',
    transactions: isRTL ? 'المعاملات' : 'Transactions',
    analytics: isRTL ? 'التحليلات' : 'Analytics',
    settings: isRTL ? 'الإعدادات' : 'Settings',
    
    // Gateway Management
    addGateway: isRTL ? 'إضافة بوابة دفع' : 'Add Payment Gateway',
    editGateway: isRTL ? 'تعديل بوابة الدفع' : 'Edit Payment Gateway',
    deleteGateway: isRTL ? 'حذف بوابة الدفع' : 'Delete Payment Gateway',
    testGateway: isRTL ? 'اختبار البوابة' : 'Test Gateway',
    
    // Gateway Properties
    gatewayName: isRTL ? 'اسم البوابة' : 'Gateway Name',
    gatewayType: isRTL ? 'نوع البوابة' : 'Gateway Type',
    enabled: isRTL ? 'مفعل' : 'Enabled',
    isLive: isRTL ? 'وضع مباشر' : 'Live Mode',
    isSandbox: isRTL ? 'وضع تجريبي' : 'Sandbox Mode',
    
    // Configuration
    configuration: isRTL ? 'الإعدادات' : 'Configuration',
    apiKey: isRTL ? 'مفتاح API' : 'API Key',
    secretKey: isRTL ? 'المفتاح السري' : 'Secret Key',
    merchantId: isRTL ? 'معرف التاجر' : 'Merchant ID',
    publicKey: isRTL ? 'المفتاح العام' : 'Public Key',
    webhookSecret: isRTL ? 'سر Webhook' : 'Webhook Secret',
    sandboxApiKey: isRTL ? 'مفتاح API التجريبي' : 'Sandbox API Key',
    sandboxSecretKey: isRTL ? 'المفتاح السري التجريبي' : 'Sandbox Secret Key',
    currency: isRTL ? 'العملة' : 'Currency',
    supportedCountries: isRTL ? 'البلدان المدعومة' : 'Supported Countries',
    minimumAmount: isRTL ? 'الحد الأدنى للمبلغ' : 'Minimum Amount',
    maximumAmount: isRTL ? 'الحد الأقصى للمبلغ' : 'Maximum Amount',
    processingFee: isRTL ? 'رسوم المعالجة' : 'Processing Fee',
    processingFeeType: isRTL ? 'نوع رسوم المعالجة' : 'Processing Fee Type',
    
    // Features
    features: isRTL ? 'المزايا' : 'Features',
    refunds: isRTL ? 'المبالغ المستردة' : 'Refunds',
    partialRefunds: isRTL ? 'الاسترداد الجزئي' : 'Partial Refunds',
    subscriptions: isRTL ? 'الاشتراكات' : 'Subscriptions',
    webhooks: isRTL ? 'Webhooks' : 'Webhooks',
    threeDS: isRTL ? 'الأمان ثلاثي الأبعاد' : '3D Secure',
    tokenization: isRTL ? 'الترميز' : 'Tokenization',
    multiCurrency: isRTL ? 'متعدد العملات' : 'Multi-Currency',
    
    // Statistics
    statistics: isRTL ? 'الإحصائيات' : 'Statistics',
    totalTransactions: isRTL ? 'إجمالي المعاملات' : 'Total Transactions',
    successfulTransactions: isRTL ? 'المعاملات الناجحة' : 'Successful Transactions',
    failedTransactions: isRTL ? 'المعاملات الفاشلة' : 'Failed Transactions',
    totalAmount: isRTL ? 'إجمالي المبلغ' : 'Total Amount',
    averageAmount: isRTL ? 'متوسط المبلغ' : 'Average Amount',
    lastTransaction: isRTL ? 'آخر معاملة' : 'Last Transaction',
    successRate: isRTL ? 'معدل النجاح' : 'Success Rate',
    
    // Transaction Properties
    transactionId: isRTL ? 'معرف المعاملة' : 'Transaction ID',
    amount: isRTL ? 'المبلغ' : 'Amount',
    status: isRTL ? 'الحالة' : 'Status',
    customerEmail: isRTL ? 'بريد العميل' : 'Customer Email',
    customerName: isRTL ? 'اسم العميل' : 'Customer Name',
    description: isRTL ? 'الوصف' : 'Description',
    createdAt: isRTL ? 'تاريخ الإنشاء' : 'Created At',
    completedAt: isRTL ? 'تاريخ الإكمال' : 'Completed At',
    failureReason: isRTL ? 'سبب الفشل' : 'Failure Reason',
    fees: isRTL ? 'الرسوم' : 'Fees',
    
    // Transaction Status
    pending: isRTL ? 'قيد الانتظار' : 'Pending',
    completed: isRTL ? 'مكتمل' : 'Completed',
    failed: isRTL ? 'فشل' : 'Failed',
    refunded: isRTL ? 'مسترد' : 'Refunded',
    cancelled: isRTL ? 'ملغي' : 'Cancelled',
    
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
    
    // Messages
    saving: isRTL ? 'جاري الحفظ...' : 'Saving...',
    saved: isRTL ? 'تم الحفظ بنجاح' : 'Settings saved successfully',
    error: isRTL ? 'حدث خطأ' : 'An error occurred',
    testing: isRTL ? 'جاري الاختبار...' : 'Testing...',
    testSuccess: isRTL ? 'نجح الاختبار' : 'Test successful',
    testFailed: isRTL ? 'فشل الاختبار' : 'Test failed',
    deleteConfirm: isRTL ? 'هل أنت متأكد من حذف هذه البوابة؟' : 'Are you sure you want to delete this gateway?',
    
    // Descriptions
    gatewayDesc: isRTL ? 'إدارة إعدادات بوابات الدفع المختلفة' : 'Manage different payment gateway settings',
    liveMode: isRTL ? 'استخدام البيانات الحقيقية للمعاملات' : 'Use real credentials for live transactions',
    sandboxMode: isRTL ? 'استخدام البيانات التجريبية للاختبار' : 'Use test credentials for testing',
    webhookDesc: isRTL ? 'رابط لاستقبال إشعارات المعاملات' : 'URL to receive transaction notifications',
    
    // Validation
    required: isRTL ? 'هذا الحقل مطلوب' : 'This field is required',
    invalidAmount: isRTL ? 'المبلغ غير صحيح' : 'Invalid amount',
    invalidEmail: isRTL ? 'البريد الإلكتروني غير صحيح' : 'Invalid email format',
  };

  const defaultGateway: Omit<PaymentGateway, 'id'> = {
    name: '',
    type: 'stc_pay',
    enabled: false,
    isLive: false,
    configuration: {
      currency: 'SAR',
      supportedCountries: ['SA'],
      minimumAmount: 1,
      maximumAmount: 10000,
      processingFee: 2.9,
      processingFeeType: 'percentage'
    },
    features: {
      refunds: true,
      partialRefunds: true,
      subscriptions: false,
      webhooks: true,
      threeDS: true,
      tokenization: false,
      multiCurrency: false
    },
    statistics: {
      totalTransactions: 0,
      successfulTransactions: 0,
      failedTransactions: 0,
      totalAmount: 0,
      averageAmount: 0,
      lastTransaction: ''
    }
  };



  useEffect(() => {
    loadGateways();
    loadTransactions();
  }, []);

  const loadGateways = async () => {
    try {
      setLoading(true);
      const gatewaysRef = collection(db, 'payment_gateways');
      const snapshot = await getDocs(gatewaysRef);
      
      const gatewaysList: PaymentGateway[] = [];
      snapshot.forEach((doc) => {
        gatewaysList.push({ id: doc.id, ...doc.data() } as PaymentGateway);
      });
      
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
      // Simulate loading transactions
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
          description: 'اشتراك شهري مميز',
          createdAt: new Date().toISOString(),
          completedAt: new Date().toISOString(),
          fees: 4.35
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
          description: 'اشتراك سنوي',
          createdAt: new Date(Date.now() - 3600000).toISOString(),
          failureReason: 'Insufficient funds',
          fees: 0
        }
      ];
      setTransactions(mockTransactions);
    } catch (error) {
      console.error('Error loading transactions:', error);
    }
  };

  const saveGateway = async (gateway: Omit<PaymentGateway, 'id'>) => {
    try {
      setSaving(true);
      
      if (editingGateway) {
        // Update existing gateway
        const gatewayRef = doc(db, 'payment_gateways', editingGateway.id);
        await updateDoc(gatewayRef, {
          ...gateway,
          updatedAt: new Date().toISOString()
        });
      } else {
        // Add new gateway
        const gatewaysRef = collection(db, 'payment_gateways');
        await addDoc(gatewaysRef, {
          ...gateway,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });
      }
      
      toast.success(texts.saved);
      setShowAddDialog(false);
      setShowEditDialog(false);
      setEditingGateway(null);
      await loadGateways();
    } catch (error) {
      console.error('Error saving gateway:', error);
      toast.error(texts.error);
    } finally {
      setSaving(false);
    }
  };

  const deleteGateway = async (gatewayId: string) => {
    try {
      if (!confirm(texts.deleteConfirm)) return;
      
      const gatewayRef = doc(db, 'payment_gateways', gatewayId);
      await deleteDoc(gatewayRef);
      
      toast.success(texts.saved);
      await loadGateways();
    } catch (error) {
      console.error('Error deleting gateway:', error);
      toast.error(texts.error);
    }
  };

  const testGateway = async (gatewayId: string) => {
    try {
      setTestingGateway(gatewayId);
      // Simulate gateway test
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Random success/failure for demo
      const success = Math.random() > 0.3;
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

  const getStatusBadge = (status: Transaction['status']) => {
    const config = {
      pending: { color: 'bg-yellow-100 text-yellow-800', text: texts.pending },
      completed: { color: 'bg-green-100 text-green-800', text: texts.completed },
      failed: { color: 'bg-red-100 text-red-800', text: texts.failed },
      refunded: { color: 'bg-blue-100 text-blue-800', text: texts.refunded },
      cancelled: { color: 'bg-gray-100 text-gray-800', text: texts.cancelled }
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
      default:
        return <CreditCardIcon className="h-5 w-5 text-gray-600" />;
    }
  };

  const calculateSuccessRate = (gateway: PaymentGateway) => {
    const { totalTransactions, successfulTransactions } = gateway.statistics;
    if (totalTransactions === 0) return 0;
    return Math.round((successfulTransactions / totalTransactions) * 100);
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

      {/* Payment Gateways Tabs */}
      <Tabs defaultValue="gateways" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="gateways">{texts.gateways}</TabsTrigger>
          <TabsTrigger value="transactions">{texts.transactions}</TabsTrigger>
          <TabsTrigger value="analytics">{texts.analytics}</TabsTrigger>
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
                      <CardTitle className="text-lg">{gateway.name}</CardTitle>
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
                      <p className="text-gray-600 dark:text-gray-400">{texts.processingFee}</p>
                      <p className="font-semibold">
                        {gateway.configuration.processingFee}
                        {gateway.configuration.processingFeeType === 'percentage' ? '%' : ` ${gateway.configuration.currency}`}
                      </p>
                    </div>
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
                      onClick={() => deleteGateway(gateway.id)}
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
                  <div key={transaction.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 rtl:space-x-reverse">
                        <span className="font-medium">{transaction.id}</span>
                        {getStatusBadge(transaction.status)}
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
                      <div className="font-semibold text-lg">
                        {transaction.amount.toLocaleString()} {transaction.currency}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        {isRTL ? 'رسوم:' : 'Fees:'} {transaction.fees.toLocaleString()} {transaction.currency}
                      </div>
                      <div className="text-xs text-gray-500">
                        {new Date(transaction.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
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
                    ? 'إعدادات الدفع العامة ستكون متاحة قريباً'
                    : 'Global payment settings will be available soon'
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
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{texts.gatewayName}</Label>
                <Input placeholder={isRTL ? 'أدخل اسم البوابة' : 'Enter gateway name'} />
              </div>
              <div className="space-y-2">
                <Label>{texts.gatewayType}</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder={isRTL ? 'اختر نوع البوابة' : 'Select gateway type'} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="stc_pay">{texts.stc_pay}</SelectItem>
                    <SelectItem value="visa">{texts.visa}</SelectItem>
                    <SelectItem value="mastercard">{texts.mastercard}</SelectItem>
                    <SelectItem value="mada">{texts.mada}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                {texts.cancel}
              </Button>
              <Button onClick={() => {
                toast.success(isRTL ? 'سيتم إضافة البوابة قريباً' : 'Gateway will be added soon');
                setShowAddDialog(false);
              }}>
                {texts.save}
              </Button>
            </DialogFooter>
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
          <div className="space-y-4">
            <Alert>
              <InformationCircleIcon className="h-4 w-4" />
              <AlertDescription>
                {isRTL
                  ? 'نموذج تعديل البوابة سيكون متاحاً قريباً'
                  : 'Gateway edit form will be available soon'
                }
              </AlertDescription>
            </Alert>
            <DialogFooter>
              <Button variant="outline" onClick={() => {
                setShowEditDialog(false);
                setEditingGateway(null);
              }}>
                {texts.cancel}
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
