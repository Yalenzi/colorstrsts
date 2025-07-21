'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { CreditCard, Lock } from 'lucide-react';

interface SubscriptionButtonProps {
  lang: 'ar' | 'en';
  planId: string;
  planName: string;
  price: number;
  onSuccess?: () => void;
}

export function SubscriptionButton({ lang, planId, planName, price, onSuccess }: SubscriptionButtonProps) {
  const [loading, setLoading] = useState(false);
  const isRTL = lang === 'ar';

  const handleSubscription = async () => {
    setLoading(true);
    try {
      // محاكاة عملية الدفع
      await new Promise(resolve => setTimeout(resolve, 2000));

      // حفظ الاشتراك في localStorage
      const subscription = {
        id: Date.now().toString(),
        userId: 'current_user',
        planId,
        planName,
        price,
        status: 'active',
        startDate: new Date().toISOString(),
        endDate: new Date(Date.now() + (planId === 'yearly' ? 365 : 30) * 24 * 60 * 60 * 1000).toISOString(),
        paymentMethod: 'stc_pay'
      };

      // حفظ الاشتراك
      const existingSubscriptions = JSON.parse(localStorage.getItem('user_subscriptions') || '[]');
      existingSubscriptions.push(subscription);
      localStorage.setItem('user_subscriptions', JSON.stringify(existingSubscriptions));

      // تحديث حالة المستخدم
      localStorage.setItem('user_subscription_status', 'active');
      localStorage.setItem('user_subscription_plan', planId);

      toast.success(isRTL ? 'تم تفعيل الاشتراك بنجاح!' : 'Subscription activated successfully!');
      
      if (onSuccess) {
        onSuccess();
      }

      // إعادة تحميل الصفحة لتطبيق التغييرات
      setTimeout(() => {
        window.location.reload();
      }, 1000);

    } catch (error) {
      console.error('Subscription error:', error);
      toast.error(isRTL ? 'خطأ في عملية الاشتراك' : 'Subscription error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button 
      onClick={handleSubscription}
      disabled={loading}
      className="w-full flex items-center justify-center space-x-2"
    >
      {loading ? (
        <div className="flex items-center space-x-2">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
          <span>{isRTL ? 'جاري المعالجة...' : 'Processing...'}</span>
        </div>
      ) : (
        <div className="flex items-center space-x-2">
          <CreditCard size={16} />
          <span>{isRTL ? `اشترك الآن - ${price} ريال` : `Subscribe Now - ${price} SAR`}</span>
          <Lock size={14} />
        </div>
      )}
    </Button>
  );
}