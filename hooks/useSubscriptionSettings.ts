import { useState, useEffect, useCallback } from 'react';
import { getSubscriptionSettingsAsync, saveSubscriptionSettings } from '@/lib/subscription-service';

export interface SubscriptionSettings {
  freeTestsEnabled: boolean;
  freeTestsCount: number;
  premiumRequired: boolean;
  globalFreeAccess: boolean;
  specificPremiumTests: number[];
}

// إنشاء event emitter للتحديثات الفورية
class SettingsEventEmitter {
  private listeners: ((settings: SubscriptionSettings) => void)[] = [];

  subscribe(listener: (settings: SubscriptionSettings) => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  emit(settings: SubscriptionSettings) {
    this.listeners.forEach(listener => listener(settings));
  }
}

const settingsEmitter = new SettingsEventEmitter();

// متغير عام لحفظ الإعدادات الحالية
let globalSettings: SubscriptionSettings | null = null;

export function useSubscriptionSettings() {
  const [settings, setSettings] = useState<SubscriptionSettings>({
    freeTestsEnabled: true,
    freeTestsCount: 5,
    premiumRequired: true,
    globalFreeAccess: false,
    specificPremiumTests: []
  });
  const [loading, setLoading] = useState(true);

  // تحميل الإعدادات من Firebase
  const loadSettings = useCallback(async () => {
    try {
      setLoading(true);
      console.log('🔄 Loading subscription settings...');
      
      const firebaseSettings = await getSubscriptionSettingsAsync();
      console.log('📥 Settings loaded from Firebase:', firebaseSettings);
      
      // تحديث الإعدادات العامة
      globalSettings = firebaseSettings;
      
      // حفظ في localStorage للوصول السريع
      localStorage.setItem('subscription_settings', JSON.stringify(firebaseSettings));
      
      // تحديث الحالة المحلية
      setSettings(firebaseSettings);
      
      // إرسال تحديث لجميع المكونات
      settingsEmitter.emit(firebaseSettings);
      
      // إرسال custom event للمكونات الأخرى
      window.dispatchEvent(new CustomEvent('subscriptionSettingsUpdated', {
        detail: firebaseSettings
      }));
      
      console.log('✅ Settings updated successfully');
    } catch (error) {
      console.error('❌ Error loading settings:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // حفظ الإعدادات في Firebase
  const updateSettings = useCallback(async (newSettings: SubscriptionSettings) => {
    try {
      console.log('💾 Saving settings to Firebase:', newSettings);
      
      // حفظ في Firebase
      await saveSubscriptionSettings(newSettings);
      
      // تحديث الإعدادات العامة فورا
      globalSettings = newSettings;
      
      // حفظ في localStorage
      localStorage.setItem('subscription_settings', JSON.stringify(newSettings));
      
      // تحديث الحالة المحلية
      setSettings(newSettings);
      
      // إرسال تحديث فوري لجميع المكونات
      settingsEmitter.emit(newSettings);
      
      // إرسال custom event
      window.dispatchEvent(new CustomEvent('subscriptionSettingsUpdated', {
        detail: newSettings
      }));
      
      // إرسال storage event للتبويبات الأخرى
      window.dispatchEvent(new StorageEvent('storage', {
        key: 'subscription_settings',
        newValue: JSON.stringify(newSettings),
        oldValue: localStorage.getItem('subscription_settings')
      }));
      
      console.log('✅ Settings saved and broadcasted successfully');
      
      return true;
    } catch (error) {
      console.error('❌ Error saving settings:', error);
      return false;
    }
  }, []);

  // الاستماع للتحديثات من المكونات الأخرى
  useEffect(() => {
    // تحميل الإعدادات عند البداية
    loadSettings();

    // الاستماع للتحديثات من event emitter
    const unsubscribe = settingsEmitter.subscribe((newSettings) => {
      setSettings(newSettings);
    });

    // الاستماع للتحديثات من localStorage
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'subscription_settings' && e.newValue) {
        try {
          const newSettings = JSON.parse(e.newValue);
          setSettings(newSettings);
          globalSettings = newSettings;
        } catch (error) {
          console.error('Error parsing storage settings:', error);
        }
      }
    };

    // الاستماع للأحداث المخصصة
    const handleCustomEvent = (e: CustomEvent) => {
      setSettings(e.detail);
      globalSettings = e.detail;
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('subscriptionSettingsUpdated', handleCustomEvent as EventListener);

    return () => {
      unsubscribe();
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('subscriptionSettingsUpdated', handleCustomEvent as EventListener);
    };
  }, [loadSettings]);

  // دوال مساعدة للتحقق من الوصول
  const isTestAccessible = useCallback((testIndex: number, userHasPremium: boolean = false): boolean => {
    const currentSettings = globalSettings || settings;
    
    // إذا كان الوصول المجاني العام مفعل
    if (currentSettings.globalFreeAccess) {
      return true;
    }

    // فحص الاختبارات المحددة التي تتطلب اشتراك
    if (currentSettings.specificPremiumTests.includes(testIndex + 1)) {
      return userHasPremium;
    }

    // فحص حد الاختبارات المجانية
    if (currentSettings.freeTestsEnabled && testIndex < currentSettings.freeTestsCount) {
      return true;
    }

    // فحص إذا كانت الاختبارات المتقدمة تتطلب اشتراك
    if (currentSettings.premiumRequired && testIndex >= currentSettings.freeTestsCount) {
      return userHasPremium;
    }

    return true;
  }, [settings]);

  const getTestAccessStatus = useCallback((testIndex: number, userHasPremium: boolean = false) => {
    const currentSettings = globalSettings || settings;
    const isAccessible = isTestAccessible(testIndex, userHasPremium);
    
    if (isAccessible) {
      return {
        canAccess: true,
        reason: currentSettings.globalFreeAccess ? 'Global free access enabled' : 'Test is accessible'
      };
    }

    if (currentSettings.specificPremiumTests.includes(testIndex + 1)) {
      return {
        canAccess: false,
        reason: 'Premium subscription required for this specific test',
        requiresSubscription: true
      };
    }

    if (testIndex >= currentSettings.freeTestsCount) {
      return {
        canAccess: false,
        reason: 'Premium subscription required for advanced tests',
        requiresSubscription: true
      };
    }

    return {
      canAccess: false,
      reason: 'Access denied'
    };
  }, [settings, isTestAccessible]);

  return {
    settings,
    loading,
    updateSettings,
    loadSettings,
    isTestAccessible,
    getTestAccessStatus
  };
}

// دالة للحصول على الإعدادات الحالية بشكل متزامن
export function getCurrentSettings(): SubscriptionSettings {
  if (globalSettings) {
    return globalSettings;
  }
  
  // محاولة قراءة من localStorage
  try {
    const stored = localStorage.getItem('subscription_settings');
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Error reading settings from localStorage:', error);
  }
  
  // إعدادات افتراضية
  return {
    freeTestsEnabled: true,
    freeTestsCount: 5,
    premiumRequired: true,
    globalFreeAccess: false,
    specificPremiumTests: []
  };
}

