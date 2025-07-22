'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

interface Subscription {
  id: string;
  userId: string;
  userEmail: string;
  plan: 'free' | 'monthly' | 'yearly';
  status: 'active' | 'cancelled' | 'expired';
  startDate: string;
  endDate: string;
  amount: number;
  paymentMethod: 'stc_pay';
  updatedAt?: string;
}

export function SubscriptionsManagement({ lang }: { lang: string }) {
  const isRTL = lang === 'ar';
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSubscriptions();
  }, []);

  const loadSubscriptions = async () => {
    try {
      const stored = localStorage.getItem('subscriptions');
      if (stored) {
        setSubscriptions(JSON.parse(stored));
      } else {
        // إضافة بيانات تجريبية
        const mockSubscriptions: Subscription[] = [
          {
            id: 'sub_1',
            userId: 'user_1',
            userEmail: 'user1@example.com',
            plan: 'monthly',
            status: 'active',
            startDate: '2024-01-01',
            endDate: '2024-02-01',
            amount: 29.99,
            paymentMethod: 'stc_pay'
          },
          {
            id: 'sub_2',
            userId: 'user_2',
            userEmail: 'user2@example.com',
            plan: 'yearly',
            status: 'active',
            startDate: '2024-01-01',
            endDate: '2025-01-01',
            amount: 299.99,
            paymentMethod: 'stc_pay'
          },
          {
            id: 'sub_3',
            userId: 'user_3',
            userEmail: 'user3@example.com',
            plan: 'monthly',
            status: 'expired',
            startDate: '2023-12-01',
            endDate: '2024-01-01',
            amount: 29.99,
            paymentMethod: 'stc_pay'
          }
        ];
        setSubscriptions(mockSubscriptions);
        localStorage.setItem('subscriptions', JSON.stringify(mockSubscriptions));
      }
    } catch (error) {
      console.error('Error loading subscriptions:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateSubscriptionStatus = async (id: string, newStatus: 'active' | 'cancelled' | 'expired') => {
    try {
      setLoading(true);
      const updated = subscriptions.map(sub =>
        sub.id === id ? { ...sub, status: newStatus, updatedAt: new Date().toISOString() } : sub
      );
      setSubscriptions(updated);
      localStorage.setItem('subscriptions', JSON.stringify(updated));

      // محاكاة API call
      await new Promise(resolve => setTimeout(resolve, 500));

      toast.success(isRTL ? 'تم تحديث الاشتراك بنجاح' : 'Subscription updated successfully');
    } catch (error) {
      console.error('Error updating subscription:', error);
      toast.error(isRTL ? 'خطأ في تحديث الاشتراك' : 'Error updating subscription');
    } finally {
      setLoading(false);
    }
  };

  const cancelSubscription = async (id: string) => {
    await updateSubscriptionStatus(id, 'cancelled');
  };

  const reactivateSubscription = async (id: string) => {
    await updateSubscriptionStatus(id, 'active');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{isRTL ? 'إدارة الاشتراكات' : 'Subscriptions Management'}</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-2">{isRTL ? 'جاري التحميل...' : 'Loading...'}</span>
          </div>
        ) : (
          <div className="space-y-4">
            {subscriptions.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                {isRTL ? 'لا توجد اشتراكات' : 'No subscriptions found'}
              </div>
            ) : (
              subscriptions.map((subscription) => (
            <div key={subscription.id} className="border rounded-lg p-4">
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-medium">{subscription.userEmail}</p>
                  <p className="text-sm text-gray-600">
                    {isRTL ? 'الخطة:' : 'Plan:'} {subscription.plan}
                  </p>
                  <Badge variant={subscription.status === 'active' ? 'default' : 'secondary'}>
                    {subscription.status}
                  </Badge>
                </div>
                <div className="space-x-2">
                  {subscription.status === 'active' ? (
                    <Button 
                      variant="destructive" 
                      size="sm"
                      onClick={() => cancelSubscription(subscription.id)}
                    >
                      {isRTL ? 'إلغاء' : 'Cancel'}
                    </Button>
                  ) : (
                    <Button 
                      variant="default" 
                      size="sm"
                      onClick={() => reactivateSubscription(subscription.id)}
                    >
                      {isRTL ? 'إعادة تفعيل' : 'Reactivate'}
                    </Button>
                  )}
                </div>
              </div>
            </div>
              ))
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}