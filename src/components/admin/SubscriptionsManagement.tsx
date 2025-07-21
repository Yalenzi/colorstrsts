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
      }
    } catch (error) {
      console.error('Error loading subscriptions:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateSubscriptionStatus = async (id: string, status: string) => {
    try {
      const updated = subscriptions.map(sub => 
        sub.id === id ? { ...sub, status } : sub
      );
      setSubscriptions(updated);
      localStorage.setItem('subscriptions', JSON.stringify(updated));
      toast.success(isRTL ? 'تم تحديث الاشتراك بنجاح' : 'Subscription updated successfully');
    } catch (error) {
      toast.error(isRTL ? 'خطأ في تحديث الاشتراك' : 'Error updating subscription');
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
        <div className="space-y-4">
          {subscriptions.map((subscription) => (
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
          ))}
        </div>
      </CardContent>
    </Card>
  );
}