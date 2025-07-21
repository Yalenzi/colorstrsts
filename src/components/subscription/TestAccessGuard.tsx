import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { getCurrentSettings } from '@/hooks/useSubscriptionSettings';
import { canAccessTest, recordTestUsage } from '@/lib/subscription-service';
import { Crown, Star, Lock } from 'lucide-react';
import LoginModal from '@/components/auth/LoginModal';
import SignupModal from '@/components/auth/SignupModal';
import SubscriptionModal from '@/components/subscription/SubscriptionModal';

interface TestAccessGuardProps {
  testIndex: number;
  testId: string;
  testName: string;
  children: React.ReactNode;
  onAccessGranted?: () => void;
}

export function TestAccessGuard({
  testIndex,
  testId,
  testName,
  children,
  onAccessGranted
}: TestAccessGuardProps) {
  const { user, userProfile } = useAuth();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showSignupModal, setShowSignupModal] = useState(false);
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const [accessStatus, setAccessStatus] = useState<{
    canAccess: boolean;
    reason?: string;
    requiresSubscription?: boolean;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState(getCurrentSettings());

  // التحقق من إمكانية الوصول
  const checkAccess = async () => {
    try {
      console.log('🔍 Checking access for test:', testIndex);
      
      // الحصول على أحدث الإعدادات
      const currentSettings = getCurrentSettings();
      setSettings(currentSettings);
      
      console.log('📋 Current settings:', currentSettings);

      // إذا كان الوصول المجاني العام مفعل، السماح فور
      if (currentSettings.globalFreeAccess) {
        console.log('✅ Global free access enabled - granting access');
        setAccessStatus({ 
          canAccess: true, 
          reason: 'Global free access enabled' 
        });
        setLoading(false);
        return;
      }

      // إذا لم يكن المستخدم مسجل دخول
      if (!user) {
        console.log('❌ User not logged in');
        setAccessStatus({ 
          canAccess: false, 
          reason: 'Login required' 
        });
        setLoading(false);
        return;
      }

      // فحص الوصول عبر النظام العادي
      const access = await canAccessTest(user.uid, testIndex);
      console.log('🎯 Access result:', access);
      setAccessStatus(access);
    } catch (error) {
      console.error('❌ Error checking test access:', error);
      setAccessStatus({ 
        canAccess: false, 
        reason: 'Error checking access' 
      });
    } finally {
      setLoading(false);
    }
  };

  // تحديث الوصول عند تغيير الإعدادات
  useEffect(() => {
    checkAccess();

    // الاستماع للتحديثات الفورية
    const handleSettingsUpdate = (e: CustomEvent) => {
      console.log('🔄 Settings updated, rechecking access');
      setSettings(e.detail);
      checkAccess();
    };

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'subscription_settings') {
        console.log('🔄 Storage updated, rechecking access');
        checkAccess();
      }
    };

    window.addEventListener('subscriptionSettingsUpdated', handleSettingsUpdate as EventListener);
    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('subscriptionSettingsUpdated', handleSettingsUpdate as EventListener);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [user, testIndex, userProfile]);

  // تسجيل استخدام الاختبار عند الوصول
  const handleAccessTest = async () => {
    if (!user || !accessStatus?.canAccess) return;

    try {
      const isFreeTest = testIndex < settings.freeTestsCount;
      await recordTestUsage(user.uid, testId, testName, isFreeTest);
      onAccessGranted?.();
    } catch (error) {
      console.error('Error recording test usage:', error);
    }
  };

  // عرض شاشة التحميل
  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="mr-2 text-gray-600">جاري التحقق من الصلاحيات...</span>
      </div>
    );
  }

  // إذا كان المستخدم غير مسجل دخول
  if (!user && !settings.globalFreeAccess) {
    return (
      <>
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-indigo-50 bg-opacity-95 flex items-center justify-center z-10 rounded-lg">
            <div className="text-center p-6 bg-white rounded-lg shadow-lg max-w-sm border-2 border-blue-200">
              <Lock className="w-12 h-12 text-blue-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                تسجيل الدخول مطلوب
              </h3>
              <p className="text-gray-600 mb-4">
                يجب تسجيل الدخول للوصول إلى هذا الاختبار
              </p>
              <div className="space-y-2">
                <button
                  onClick={() => setShowLoginModal(true)}
                  className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 font-semibold"
                >
                  تسجيل الدخول
                </button>
                <button
                  onClick={() => setShowSignupModal(true)}
                  className="w-full bg-gray-100 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-200 font-semibold"
                >
                  إنشاء حساب جديد
                </button>
              </div>
            </div>
          </div>
          <div className="filter blur-sm pointer-events-none">
            {children}
          </div>
        </div>

        <LoginModal
          isOpen={showLoginModal}
          onClose={() => setShowLoginModal(false)}
        />
        <SignupModal
          isOpen={showSignupModal}
          onClose={() => setShowSignupModal(false)}
        />
      </>
    );
  }

  // إذا كان الاختبار يتطلب اشتراك مميز
  if (accessStatus?.requiresSubscription) {
    return (
      <>
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-br from-yellow-50 to-orange-50 bg-opacity-95 flex items-center justify-center z-10 rounded-lg">
            <div className="text-center p-6 bg-white rounded-lg shadow-lg max-w-sm border-2 border-yellow-200">
              <Crown className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                اشتراك مميز مطلوب
              </h3>
              <p className="text-gray-600 mb-2">
                هذا الاختبار متاح للمشتركين المميزين فقط
              </p>
              <div className="bg-blue-50 p-3 rounded-md mb-4">
                <p className="text-sm text-blue-800">
                  <Star className="w-4 h-4 inline mr-1" />
                  أول {settings.freeTestsCount} اختبارات مجانية للجميع
                </p>
                <p className="text-sm text-blue-800">
                  <Crown className="w-4 h-4 inline mr-1" />
                  الاختبارات المتقدمة تتطلب اشتراك (29 ريال/شهر)
                </p>
              </div>
              <button
                onClick={() => setShowSubscriptionModal(true)}
                className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 text-white py-2 px-4 rounded-md hover:from-yellow-600 hover:to-orange-600 font-semibold"
              >
                اشترك الآن - 29 ريال/شهر
              </button>
            </div>
          </div>
          <div className="filter blur-sm pointer-events-none">
            {children}
          </div>
        </div>

        <SubscriptionModal
          isOpen={showSubscriptionModal}
          onClose={() => setShowSubscriptionModal(false)}
        />
      </>
    );
  }

  // إذا كان الوصول مرفوض لأسباب أخرى
  if (!accessStatus?.canAccess) {
    return (
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-br from-red-50 to-pink-50 bg-opacity-95 flex items-center justify-center z-10 rounded-lg">
          <div className="text-center p-6 bg-white rounded-lg shadow-lg max-w-sm border-2 border-red-200">
            <Lock className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              الوصول مرفوض
            </h3>
            <p className="text-gray-600 mb-4">
              {accessStatus?.reason || 'لا يمكن الوصول إلى هذا الاختبار'}
            </p>
          </div>
        </div>
        <div className="filter blur-sm pointer-events-none">
          {children}
        </div>
      </div>
    );
  }

  // إذا كان الوصول مسموح، عرض المحتوى مع تسجيل الاستخدام
  return (
    <div onClick={handleAccessTest}>
      {children}
    </div>
  );
}

export default TestAccessGuard;

