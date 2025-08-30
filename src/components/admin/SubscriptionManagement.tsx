'use client';

import { useState, useEffect } from 'react';
import { Language } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  getUserSTCSubscription,
  getSTCPaymentHistory,
  updateSTCSubscriptionStatus,
  isSTCSubscriptionValid 
} from '@/lib/subscription-service';
import { UserSubscription, PaymentHistory, SUBSCRIPTION_PLANS } from '@/types/subscription';
import { stcPayService } from '@/lib/stc-pay';
import {
  UsersIcon,
  BanknotesIcon as CreditCardIcon,
  ChartBarIcon,
  Cog6ToothIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  CurrencyDollarIcon,
  CalendarIcon,
  MagnifyingGlassIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';

interface SubscriptionManagementProps {
  lang: Language;
}

interface SubscriptionStats {
  totalSubscriptions: number;
  activeSubscriptions: number;
  expiredSubscriptions: number;
  totalRevenue: number;
  monthlyRevenue: number;
}

interface UserSubscriptionData {
  userId: string;
  userEmail: string;
  subscription: UserSubscription | null;
  isValid: boolean;
  paymentHistory: PaymentHistory[];
}

export function SubscriptionManagement({ lang }: SubscriptionManagementProps) {
  const [stats, setStats] = useState<SubscriptionStats>({
    totalSubscriptions: 0,
    activeSubscriptions: 0,
    expiredSubscriptions: 0,
    totalRevenue: 0,
    monthlyRevenue: 0
  });
  const [users, setUsers] = useState<UserSubscriptionData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<UserSubscriptionData | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const isRTL = lang === 'ar';

  useEffect(() => {
    loadSubscriptionData();
  }, []);

  const loadSubscriptionData = async () => {
    setLoading(true);
    try {
      // في التطبيق الحقيقي، ستجلب هذه البيانات من Firebase
      // هنا سنستخدم بيانات تجريبية
      const mockUsers: UserSubscriptionData[] = [
        {
          userId: 'user1',
          userEmail: 'user1@example.com',
          subscription: {
            id: 'sub_1',
            userId: 'user1',
            planId: 'monthly',
            status: 'active',
            startDate: new Date('2024-01-01'),
            endDate: new Date('2024-02-01'),
            paymentMethod: 'stc_pay',
            transactionId: 'txn_123',
            amount: 29.99,
            currency: 'SAR',
            autoRenew: true,
            createdAt: new Date('2024-01-01'),
            updatedAt: new Date('2024-01-01')
          },
          isValid: true,
          paymentHistory: []
        },
        {
          userId: 'user2',
          userEmail: 'user2@example.com',
          subscription: {
            id: 'sub_2',
            userId: 'user2',
            planId: 'yearly',
            status: 'active',
            startDate: new Date('2024-01-01'),
            endDate: new Date('2025-01-01'),
            paymentMethod: 'stc_pay',
            transactionId: 'txn_456',
            amount: 299.99,
            currency: 'SAR',
            autoRenew: false,
            createdAt: new Date('2024-01-01'),
            updatedAt: new Date('2024-01-01')
          },
          isValid: true,
          paymentHistory: []
        },
        {
          userId: 'user3',
          userEmail: 'user3@example.com',
          subscription: null,
          isValid: false,
          paymentHistory: []
        }
      ];

      setUsers(mockUsers);

      // حساب الإحصائيات
      const activeCount = mockUsers.filter(u => u.subscription?.status === 'active').length;
      const expiredCount = mockUsers.filter(u => u.subscription?.status === 'expired').length;
      const totalRevenue = mockUsers.reduce((sum, u) => 
        sum + (u.subscription?.amount || 0), 0
      );

      setStats({
        totalSubscriptions: mockUsers.filter(u => u.subscription).length,
        activeSubscriptions: activeCount,
        expiredSubscriptions: expiredCount,
        totalRevenue,
        monthlyRevenue: totalRevenue * 0.3 // تقدير تقريبي
      });

    } catch (error) {
      console.error('Error loading subscription data:', error);
      setMessage({
        type: 'error',
        text: isRTL ? 'خطأ في تحميل بيانات الاشتراكات' : 'Error loading subscription data'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateSubscription = async (userId: string, status: UserSubscription['status']) => {
    try {
      console.log('🔄 تحديث الاشتراك:', { userId, status });

      const user = users.find(u => u.userId === userId);
      if (!user?.subscription) {
        console.error('❌ لم يتم العثور على المستخدم أو الاشتراك');
        setMessage({
          type: 'error',
          text: isRTL ? 'لم يتم العثور على الاشتراك' : 'Subscription not found'
        });
        return;
      }

      // محاولة تحديث Firebase أولاً
      try {
        await updateSTCSubscriptionStatus(user.subscription.id, status);
        console.log('✅ تم تحديث Firebase بنجاح');
      } catch (firebaseError) {
        console.warn('⚠️ فشل تحديث Firebase، سيتم التحديث محلياً فقط:', firebaseError);
      }

      // تحديث البيانات المحلية دائماً
      setUsers(users.map(u =>
        u.userId === userId && u.subscription
          ? { ...u, subscription: { ...u.subscription, status } }
          : u
      ));

      // حفظ في localStorage كنسخة احتياطية
      const updatedUsers = users.map(u =>
        u.userId === userId && u.subscription
          ? { ...u, subscription: { ...u.subscription, status } }
          : u
      );
      localStorage.setItem('subscription_users', JSON.stringify(updatedUsers));

      setMessage({
        type: 'success',
        text: isRTL ? 'تم تحديث الاشتراك بنجاح' : 'Subscription updated successfully'
      });

      console.log('✅ تم تحديث الاشتراك بنجاح');

    } catch (error) {
      console.error('❌ خطأ في تحديث الاشتراك:', error);
      setMessage({
        type: 'error',
        text: isRTL ? 'خطأ في تحديث الاشتراك' : 'Error updating subscription'
      });
    }
  };

  const formatPrice = (amount: number, currency: string = 'SAR') => {
    return stcPayService.formatPrice(amount, currency, isRTL ? 'ar-SA' : 'en-US');
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString(isRTL ? 'ar-SA' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getPlanName = (planId: string) => {
    const plan = SUBSCRIPTION_PLANS.find(p => p.id === planId);
    return plan ? (isRTL ? plan.nameAr : plan.name) : planId;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-100';
      case 'expired': return 'text-red-600 bg-red-100';
      case 'cancelled': return 'text-gray-600 bg-gray-100';
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusText = (status: string) => {
    const statusMap = {
      active: isRTL ? 'نشط' : 'Active',
      expired: isRTL ? 'منتهي' : 'Expired',
      cancelled: isRTL ? 'ملغي' : 'Cancelled',
      pending: isRTL ? 'معلق' : 'Pending'
    };
    return statusMap[status as keyof typeof statusMap] || status;
  };

  const filteredUsers = users.filter(user =>
    user.userEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.userId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${isRTL ? 'rtl' : 'ltr'}`} dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            {isRTL ? 'إدارة الاشتراكات والمدفوعات' : 'Subscription & Payment Management'}
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            {isRTL ? 'إدارة اشتراكات المستخدمين ومدفوعات STC Pay' : 'Manage user subscriptions and STC Pay payments'}
          </p>
        </div>
        <Button onClick={loadSubscriptionData} className="flex items-center gap-2">
          <ArrowPathIcon className="h-4 w-4" />
          {isRTL ? 'تحديث' : 'Refresh'}
        </Button>
      </div>

      {/* Status Message */}
      {message && (
        <Alert className={message.type === 'error' ? 'border-red-200 bg-red-50 dark:bg-red-900/20' : 'border-green-200 bg-green-50 dark:bg-green-900/20'}>
          <AlertDescription className={message.type === 'error' ? 'text-red-800 dark:text-red-200' : 'text-green-800 dark:text-green-200'}>
            {message.text}
          </AlertDescription>
        </Alert>
      )}

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {isRTL ? 'إجمالي الاشتراكات' : 'Total Subscriptions'}
            </CardTitle>
            <UsersIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalSubscriptions}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {isRTL ? 'الاشتراكات النشطة' : 'Active Subscriptions'}
            </CardTitle>
            <CheckCircleIcon className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.activeSubscriptions}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {isRTL ? 'الاشتراكات المنتهية' : 'Expired Subscriptions'}
            </CardTitle>
            <XCircleIcon className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.expiredSubscriptions}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {isRTL ? 'إجمالي الإيرادات' : 'Total Revenue'}
            </CardTitle>
            <CurrencyDollarIcon className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {formatPrice(stats.totalRevenue)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="flex items-center space-x-4 rtl:space-x-reverse">
        <div className="relative flex-1 max-w-md">
          <MagnifyingGlassIcon className="absolute left-3 rtl:right-3 rtl:left-auto top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
          <input
            type="text"
            placeholder={isRTL ? 'البحث بالإيميل أو معرف المستخدم...' : 'Search by email or user ID...'}
            value={searchTerm || ''}
            onChange={(e) => {
              try {
                setSearchTerm(e.target.value || '');
              } catch (error) {
                console.error('Search input error:', error);
              }
            }}
            className="w-full pl-10 rtl:pr-10 rtl:pl-3 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>{isRTL ? 'قائمة المستخدمين والاشتراكات' : 'Users & Subscriptions List'}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left rtl:text-right py-2">{isRTL ? 'المستخدم' : 'User'}</th>
                  <th className="text-left rtl:text-right py-2">{isRTL ? 'الخطة' : 'Plan'}</th>
                  <th className="text-left rtl:text-right py-2">{isRTL ? 'الحالة' : 'Status'}</th>
                  <th className="text-left rtl:text-right py-2">{isRTL ? 'تاريخ الانتهاء' : 'End Date'}</th>
                  <th className="text-left rtl:text-right py-2">{isRTL ? 'المبلغ' : 'Amount'}</th>
                  <th className="text-left rtl:text-right py-2">{isRTL ? 'الإجراءات' : 'Actions'}</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user.userId} className="border-b hover:bg-gray-50 dark:hover:bg-gray-800">
                    <td className="py-3">
                      <div>
                        <div className="font-medium">{user.userEmail}</div>
                        <div className="text-gray-500 text-xs">{user.userId}</div>
                      </div>
                    </td>
                    <td className="py-3">
                      {user.subscription ? getPlanName(user.subscription.planId) : (isRTL ? 'مجاني' : 'Free')}
                    </td>
                    <td className="py-3">
                      {user.subscription ? (
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(user.subscription.status)}`}>
                          {getStatusText(user.subscription.status)}
                        </span>
                      ) : (
                        <span className="px-2 py-1 rounded-full text-xs font-medium text-gray-600 bg-gray-100">
                          {isRTL ? 'لا يوجد اشتراك' : 'No subscription'}
                        </span>
                      )}
                    </td>
                    <td className="py-3">
                      {user.subscription ? formatDate(user.subscription.endDate) : '-'}
                    </td>
                    <td className="py-3">
                      {user.subscription ? formatPrice(user.subscription.amount) : '-'}
                    </td>
                    <td className="py-3">
                      <div className="flex items-center space-x-2 rtl:space-x-reverse">
                        {user.subscription && user.subscription.status === 'active' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleUpdateSubscription(user.userId, 'cancelled')}
                            className="text-red-600 border-red-300 hover:bg-red-50"
                          >
                            {isRTL ? 'إلغاء' : 'Cancel'}
                          </Button>
                        )}
                        {user.subscription && user.subscription.status === 'cancelled' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleUpdateSubscription(user.userId, 'active')}
                            className="text-green-600 border-green-300 hover:bg-green-50"
                          >
                            {isRTL ? 'تفعيل' : 'Activate'}
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setSelectedUser(user)}
                        >
                          {isRTL ? 'تفاصيل' : 'Details'}
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
