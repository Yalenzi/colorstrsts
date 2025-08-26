'use client';

import { useState, useEffect } from 'react';
import { Language } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/components/safe-providers';
import { doc, updateDoc, addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import toast from 'react-hot-toast';
import {
  CreditCardIcon,
  DevicePhoneMobileIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ClockIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

interface STCPayComponentProps {
  lang: Language;
  amount: number;
  currency: 'SAR' | 'USD';
  testId?: string;
  subscriptionPlan?: string;
  onSuccess?: (paymentId: string) => void;
  onError?: (error: string) => void;
  onCancel?: () => void;
}

interface PaymentData {
  amount: number;
  currency: string;
  phoneNumber: string;
  email: string;
  description: string;
  testId?: string;
  subscriptionPlan?: string;
}

export function STCPayComponent({
  lang,
  amount,
  currency,
  testId,
  subscriptionPlan,
  onSuccess,
  onError,
  onCancel
}: STCPayComponentProps) {
  const { user } = useAuth();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'processing' | 'success' | 'failed'>('idle');
  const [paymentId, setPaymentId] = useState<string>('');
  const isRTL = lang === 'ar';

  const texts = {
    title: isRTL ? 'الدفع عبر STC Pay' : 'Pay with STC Pay',
    subtitle: isRTL ? 'ادفع بأمان باستخدام STC Pay' : 'Pay securely using STC Pay',
    phoneNumber: isRTL ? 'رقم الجوال' : 'Phone Number',
    phoneNumberPlaceholder: isRTL ? 'أدخل رقم جوالك' : 'Enter your phone number',
    amount: isRTL ? 'المبلغ' : 'Amount',
    payNow: isRTL ? 'ادفع الآن' : 'Pay Now',
    processing: isRTL ? 'جاري المعالجة...' : 'Processing...',
    success: isRTL ? 'تم الدفع بنجاح!' : 'Payment Successful!',
    failed: isRTL ? 'فشل في الدفع' : 'Payment Failed',
    cancel: isRTL ? 'إلغاء' : 'Cancel',
    retry: isRTL ? 'إعادة المحاولة' : 'Retry',
    
    // Instructions
    instructions: isRTL ? 'التعليمات:' : 'Instructions:',
    step1: isRTL ? '1. أدخل رقم جوالك المسجل في STC Pay' : '1. Enter your STC Pay registered phone number',
    step2: isRTL ? '2. اضغط على "ادفع الآن"' : '2. Click "Pay Now"',
    step3: isRTL ? '3. ستصلك رسالة تأكيد على جوالك' : '3. You will receive a confirmation SMS',
    step4: isRTL ? '4. أكد العملية من تطبيق STC Pay' : '4. Confirm the transaction in STC Pay app',
    
    // Validation
    phoneRequired: isRTL ? 'رقم الجوال مطلوب' : 'Phone number is required',
    phoneInvalid: isRTL ? 'رقم الجوال غير صحيح' : 'Invalid phone number',
    
    // Status messages
    paymentInitiated: isRTL ? 'تم بدء عملية الدفع' : 'Payment initiated',
    waitingConfirmation: isRTL ? 'في انتظار التأكيد...' : 'Waiting for confirmation...',
    paymentCompleted: isRTL ? 'تم إكمال الدفع بنجاح' : 'Payment completed successfully',
    paymentCancelled: isRTL ? 'تم إلغاء الدفع' : 'Payment cancelled',
    
    // Test/Subscription info
    testAccess: isRTL ? 'الوصول للاختبار' : 'Test Access',
    subscriptionAccess: isRTL ? 'اشتراك' : 'Subscription',
  };

  const validatePhoneNumber = (phone: string): boolean => {
    // Saudi phone number validation (05xxxxxxxx or 9665xxxxxxxx)
    const saudiPhoneRegex = /^(05|9665)\d{8}$/;
    return saudiPhoneRegex.test(phone.replace(/\s+/g, ''));
  };

  const formatPhoneNumber = (phone: string): string => {
    // Remove spaces and format to international format
    const cleaned = phone.replace(/\s+/g, '');
    if (cleaned.startsWith('05')) {
      return '+966' + cleaned.substring(1);
    } else if (cleaned.startsWith('9665')) {
      return '+' + cleaned;
    }
    return cleaned;
  };

  const initiatePayment = async () => {
    if (!user) {
      toast.error(isRTL ? 'يجب تسجيل الدخول أولاً' : 'Please login first');
      return;
    }

    if (!phoneNumber.trim()) {
      toast.error(texts.phoneRequired);
      return;
    }

    if (!validatePhoneNumber(phoneNumber)) {
      toast.error(texts.phoneInvalid);
      return;
    }

    setLoading(true);
    setPaymentStatus('processing');

    try {
      const paymentData: PaymentData = {
        amount,
        currency,
        phoneNumber: formatPhoneNumber(phoneNumber),
        email: user.email || '',
        description: testId 
          ? `${texts.testAccess} - Test ${testId}`
          : `${texts.subscriptionAccess} - ${subscriptionPlan}`,
        testId,
        subscriptionPlan
      };

      // Create payment record in Firestore
      const paymentRef = await addDoc(collection(db, 'payments'), {
        userId: user.uid,
        userEmail: user.email,
        ...paymentData,
        status: 'pending',
        paymentMethod: 'stc_pay',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      setPaymentId(paymentRef.id);

      // Simulate STC Pay API call
      // In real implementation, you would call STC Pay API here
      await simulateSTCPayment(paymentRef.id, paymentData);

    } catch (error) {
      console.error('Payment initiation error:', error);
      setPaymentStatus('failed');
      toast.error(isRTL ? 'خطأ في بدء عملية الدفع' : 'Error initiating payment');
      onError?.(error instanceof Error ? error.message : 'Payment failed');
    } finally {
      setLoading(false);
    }
  };

  const simulateSTCPayment = async (paymentId: string, paymentData: PaymentData) => {
    // Simulate STC Pay processing time
    toast.success(texts.paymentInitiated);
    
    // Simulate waiting for user confirmation
    setTimeout(async () => {
      try {
        // Simulate successful payment (90% success rate)
        const isSuccess = Math.random() > 0.1;
        
        if (isSuccess) {
          // Update payment status
          await updateDoc(doc(db, 'payments', paymentId), {
            status: 'completed',
            completedAt: serverTimestamp(),
            transactionId: `STC_${Date.now()}`,
            updatedAt: serverTimestamp()
          });

          // Grant access based on payment type
          if (testId) {
            // Grant test access
            await grantTestAccess(paymentData);
          } else if (subscriptionPlan) {
            // Grant subscription access
            await grantSubscriptionAccess(paymentData);
          }

          setPaymentStatus('success');
          toast.success(texts.paymentCompleted);
          onSuccess?.(paymentId);
        } else {
          // Simulate payment failure
          await updateDoc(doc(db, 'payments', paymentId), {
            status: 'failed',
            failedAt: serverTimestamp(),
            errorMessage: 'Payment declined by STC Pay',
            updatedAt: serverTimestamp()
          });

          setPaymentStatus('failed');
          toast.error(texts.failed);
          onError?.('Payment declined');
        }
      } catch (error) {
        console.error('Payment processing error:', error);
        setPaymentStatus('failed');
        onError?.(error instanceof Error ? error.message : 'Payment processing failed');
      }
    }, 3000); // 3 seconds simulation
  };

  const grantTestAccess = async (paymentData: PaymentData) => {
    if (!user || !testId) return;

    try {
      // Add test access to user's purchased tests
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        [`purchasedTests.${testId}`]: {
          purchasedAt: serverTimestamp(),
          paymentId,
          amount: paymentData.amount,
          currency: paymentData.currency
        },
        updatedAt: serverTimestamp()
      });

      console.log('✅ Test access granted for test:', testId);
    } catch (error) {
      console.error('Error granting test access:', error);
    }
  };

  const grantSubscriptionAccess = async (paymentData: PaymentData) => {
    if (!user || !subscriptionPlan) return;

    try {
      const now = new Date();
      const expiryDate = new Date();
      
      // Set expiry based on plan
      if (subscriptionPlan === 'monthly') {
        expiryDate.setMonth(now.getMonth() + 1);
      } else if (subscriptionPlan === 'yearly') {
        expiryDate.setFullYear(now.getFullYear() + 1);
      } else if (subscriptionPlan === 'unlimited') {
        expiryDate.setFullYear(now.getFullYear() + 100); // Effectively unlimited
      }

      // Update user subscription
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        subscription: {
          plan: subscriptionPlan,
          status: 'active',
          startDate: serverTimestamp(),
          expiryDate: expiryDate.toISOString(),
          paymentId,
          amount: paymentData.amount,
          currency: paymentData.currency
        },
        updatedAt: serverTimestamp()
      });

      console.log('✅ Subscription access granted:', subscriptionPlan);
    } catch (error) {
      console.error('Error granting subscription access:', error);
    }
  };

  const handleCancel = () => {
    setPaymentStatus('idle');
    setPhoneNumber('');
    setPaymentId('');
    onCancel?.();
  };

  const handleRetry = () => {
    setPaymentStatus('idle');
    setPaymentId('');
  };

  return (
    <Card className={`w-full max-w-md mx-auto ${isRTL ? 'rtl' : 'ltr'}`} dir={isRTL ? 'rtl' : 'ltr'}>
      <CardHeader className="text-center">
        <CardTitle className="flex items-center justify-center space-x-2 rtl:space-x-reverse">
          <DevicePhoneMobileIcon className="h-6 w-6 text-purple-600" />
          <span>{texts.title}</span>
        </CardTitle>
        <p className="text-sm text-muted-foreground">{texts.subtitle}</p>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Amount Display */}
        <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            {amount} {currency}
          </div>
          <div className="text-sm text-muted-foreground">
            {testId ? texts.testAccess : `${texts.subscriptionAccess} - ${subscriptionPlan}`}
          </div>
        </div>

        {paymentStatus === 'idle' && (
          <>
            {/* Instructions */}
            <div className="space-y-2">
              <h4 className="font-medium text-gray-900 dark:text-white">{texts.instructions}</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>{texts.step1}</li>
                <li>{texts.step2}</li>
                <li>{texts.step3}</li>
                <li>{texts.step4}</li>
              </ul>
            </div>

            {/* Phone Number Input */}
            <div className="space-y-2">
              <Label htmlFor="phoneNumber">{texts.phoneNumber}</Label>
              <Input
                id="phoneNumber"
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder={texts.phoneNumberPlaceholder}
                dir="ltr"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-3 rtl:space-x-reverse">
              <Button onClick={handleCancel} variant="outline" className="flex-1">
                {texts.cancel}
              </Button>
              <Button 
                onClick={initiatePayment} 
                disabled={loading || !phoneNumber.trim()}
                className="flex-1"
              >
                {loading ? texts.processing : texts.payNow}
              </Button>
            </div>
          </>
        )}

        {paymentStatus === 'processing' && (
          <div className="text-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white">{texts.waitingConfirmation}</h4>
              <p className="text-sm text-muted-foreground mt-1">
                {isRTL ? 'يرجى تأكيد العملية من تطبيق STC Pay' : 'Please confirm the transaction in STC Pay app'}
              </p>
            </div>
            <Badge variant="secondary" className="flex items-center space-x-1 rtl:space-x-reverse">
              <ClockIcon className="h-3 w-3" />
              <span>{texts.processing}</span>
            </Badge>
          </div>
        )}

        {paymentStatus === 'success' && (
          <div className="text-center space-y-4">
            <CheckCircleIcon className="h-16 w-16 text-green-600 mx-auto" />
            <div>
              <h4 className="font-medium text-green-600">{texts.success}</h4>
              <p className="text-sm text-muted-foreground mt-1">
                {isRTL ? 'تم منح الوصول بنجاح' : 'Access granted successfully'}
              </p>
            </div>
            <Badge variant="default" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
              {texts.paymentCompleted}
            </Badge>
          </div>
        )}

        {paymentStatus === 'failed' && (
          <div className="text-center space-y-4">
            <XMarkIcon className="h-16 w-16 text-red-600 mx-auto" />
            <div>
              <h4 className="font-medium text-red-600">{texts.failed}</h4>
              <p className="text-sm text-muted-foreground mt-1">
                {isRTL ? 'يرجى المحاولة مرة أخرى' : 'Please try again'}
              </p>
            </div>
            <div className="flex space-x-3 rtl:space-x-reverse">
              <Button onClick={handleCancel} variant="outline" className="flex-1">
                {texts.cancel}
              </Button>
              <Button onClick={handleRetry} className="flex-1">
                {texts.retry}
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
