'use client';

import { useState } from 'react';
import { Language } from '@/types';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { STCPayComponent } from './STCPayComponent';
import {
  CreditCardIcon,
  DevicePhoneMobileIcon,
  XMarkIcon,
  StarIcon,
  LockClosedIcon
} from '@heroicons/react/24/outline';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
  paymentType: 'test' | 'subscription';
  testId?: string;
  testName?: string;
  subscriptionPlan?: {
    id: string;
    name: string;
    price: number;
    currency: string;
    features: string[];
  };
  amount: number;
  currency: 'SAR' | 'USD';
  onSuccess?: (paymentId: string) => void;
  onError?: (error: string) => void;
}

export function PaymentModal({
  isOpen,
  onClose,
  lang,
  paymentType,
  testId,
  testName,
  subscriptionPlan,
  amount,
  currency,
  onSuccess,
  onError
}: PaymentModalProps) {
  const [activePaymentMethod, setActivePaymentMethod] = useState('stc-pay');
  const isRTL = lang === 'ar';

  const texts = {
    title: isRTL ? 'إتمام الدفع' : 'Complete Payment',
    subtitle: isRTL ? 'اختر طريقة الدفع المناسبة' : 'Choose your preferred payment method',
    
    // Payment methods
    stcPay: 'STC Pay',
    creditCard: isRTL ? 'بطاقة ائتمان' : 'Credit Card',
    applePay: 'Apple Pay',
    
    // Test payment
    testAccess: isRTL ? 'الوصول للاختبار' : 'Test Access',
    testName: isRTL ? 'اسم الاختبار' : 'Test Name',
    oneTimePayment: isRTL ? 'دفعة واحدة' : 'One-time payment',
    
    // Subscription payment
    subscriptionAccess: isRTL ? 'اشتراك' : 'Subscription',
    subscriptionPlan: isRTL ? 'خطة الاشتراك' : 'Subscription Plan',
    monthlyBilling: isRTL ? 'فوترة شهرية' : 'Monthly billing',
    yearlyBilling: isRTL ? 'فوترة سنوية' : 'Yearly billing',
    unlimitedAccess: isRTL ? 'وصول غير محدود' : 'Unlimited access',
    
    // Features
    features: isRTL ? 'المزايا' : 'Features',
    
    // Actions
    cancel: isRTL ? 'إلغاء' : 'Cancel',
    payNow: isRTL ? 'ادفع الآن' : 'Pay Now',
    
    // Status
    secure: isRTL ? 'آمن' : 'Secure',
    encrypted: isRTL ? 'مشفر' : 'Encrypted',
    
    // Coming soon
    comingSoon: isRTL ? 'قريباً' : 'Coming Soon',
  };

  const handlePaymentSuccess = (paymentId: string) => {
    onSuccess?.(paymentId);
    onClose();
  };

  const handlePaymentError = (error: string) => {
    onError?.(error);
  };

  const paymentMethods = [
    {
      id: 'stc-pay',
      name: texts.stcPay,
      icon: DevicePhoneMobileIcon,
      available: true,
      description: isRTL ? 'ادفع باستخدام STC Pay' : 'Pay using STC Pay'
    },
    {
      id: 'credit-card',
      name: texts.creditCard,
      icon: CreditCardIcon,
      available: false,
      description: isRTL ? 'ادفع باستخدام بطاقة ائتمان' : 'Pay using credit card'
    }
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={`max-w-2xl ${isRTL ? 'rtl' : 'ltr'}`} dir={isRTL ? 'rtl' : 'ltr'}>
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2 rtl:space-x-reverse">
              {paymentType === 'test' ? (
                <LockClosedIcon className="h-6 w-6 text-yellow-600" />
              ) : (
                <StarIcon className="h-6 w-6 text-blue-600" />
              )}
              <span>{texts.title}</span>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <XMarkIcon className="h-4 w-4" />
            </Button>
          </DialogTitle>
          <p className="text-muted-foreground">{texts.subtitle}</p>
        </DialogHeader>

        <div className="space-y-6">
          {/* Payment Summary */}
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-medium text-gray-900 dark:text-white">
                {paymentType === 'test' ? texts.testAccess : texts.subscriptionAccess}
              </h3>
              <Badge variant="secondary">
                {paymentType === 'test' ? texts.oneTimePayment : texts.monthlyBilling}
              </Badge>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">
                  {paymentType === 'test' ? texts.testName : texts.subscriptionPlan}:
                </span>
                <span className="font-medium">
                  {paymentType === 'test' ? testName : subscriptionPlan?.name}
                </span>
              </div>
              
              <div className="flex justify-between text-lg font-bold">
                <span>{isRTL ? 'المجموع:' : 'Total:'}</span>
                <span className="text-blue-600">{amount} {currency}</span>
              </div>
            </div>

            {/* Subscription Features */}
            {paymentType === 'subscription' && subscriptionPlan?.features && (
              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                  {texts.features}:
                </h4>
                <ul className="space-y-1">
                  {subscriptionPlan.features.map((feature, index) => (
                    <li key={index} className="text-sm text-muted-foreground flex items-center">
                      <span className="w-1.5 h-1.5 bg-blue-600 rounded-full mr-2 rtl:ml-2 rtl:mr-0"></span>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Payment Methods */}
          <div>
            <h3 className="font-medium text-gray-900 dark:text-white mb-4">
              {isRTL ? 'طرق الدفع' : 'Payment Methods'}
            </h3>
            
            <Tabs value={activePaymentMethod} onValueChange={setActivePaymentMethod}>
              <TabsList className="grid w-full grid-cols-2">
                {paymentMethods.map((method) => (
                  <TabsTrigger 
                    key={method.id} 
                    value={method.id}
                    disabled={!method.available}
                    className="flex items-center space-x-2 rtl:space-x-reverse"
                  >
                    <method.icon className="h-4 w-4" />
                    <span>{method.name}</span>
                    {!method.available && (
                      <Badge variant="secondary" className="text-xs">
                        {texts.comingSoon}
                      </Badge>
                    )}
                  </TabsTrigger>
                ))}
              </TabsList>

              {/* STC Pay */}
              <TabsContent value="stc-pay" className="mt-6">
                <STCPayComponent
                  lang={lang}
                  amount={amount}
                  currency={currency}
                  testId={testId}
                  subscriptionPlan={subscriptionPlan?.id}
                  onSuccess={handlePaymentSuccess}
                  onError={handlePaymentError}
                  onCancel={onClose}
                />
              </TabsContent>

              {/* Credit Card */}
              <TabsContent value="credit-card" className="mt-6">
                <div className="text-center py-8">
                  <CreditCardIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    {texts.comingSoon}
                  </h3>
                  <p className="text-muted-foreground">
                    {isRTL 
                      ? 'سيتم إضافة الدفع بالبطاقة الائتمانية قريباً'
                      : 'Credit card payment will be available soon'
                    }
                  </p>
                </div>
              </TabsContent>
            </Tabs>
          </div>

          {/* Security Notice */}
          <div className="flex items-center justify-center space-x-4 rtl:space-x-reverse text-sm text-muted-foreground">
            <div className="flex items-center space-x-1 rtl:space-x-reverse">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>{texts.secure}</span>
            </div>
            <div className="flex items-center space-x-1 rtl:space-x-reverse">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span>{texts.encrypted}</span>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
