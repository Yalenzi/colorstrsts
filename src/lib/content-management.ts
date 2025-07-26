import { doc, getDoc, updateDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from './firebase';

export interface ContentSettings {
  freeTestsEnabled: boolean;
  freeTestsLimit: number;
  premiumTestsEnabled: boolean;
  premiumPrice: number;
  currency: 'SAR' | 'USD';
  freeTestsList: number[];
  subscriptionPlans: {
    monthly: {
      enabled: boolean;
      price: number;
      testsLimit: number;
    };
    yearly: {
      enabled: boolean;
      price: number;
      testsLimit: number;
    };
    unlimited: {
      enabled: boolean;
      price: number;
    };
  };
  paymentMethods: {
    stcPay: boolean;
    creditCard: boolean;
    applePay: boolean;
  };
}

export interface UserSubscription {
  plan: 'monthly' | 'yearly' | 'unlimited';
  status: 'active' | 'expired' | 'cancelled';
  startDate: string;
  expiryDate: string;
  testsUsed: number;
  testsLimit: number;
}

export interface TestAccess {
  canAccess: boolean;
  reason?: string;
  requiresPayment?: boolean;
  requiresSubscription?: boolean;
  price?: number;
  currency?: string;
}

// Default settings
const defaultSettings: ContentSettings = {
  freeTestsEnabled: true,
  freeTestsLimit: 3,
  premiumTestsEnabled: true,
  premiumPrice: 10,
  currency: 'SAR',
  freeTestsList: [0, 1, 2], // First 3 tests are free
  subscriptionPlans: {
    monthly: {
      enabled: true,
      price: 29,
      testsLimit: 50
    },
    yearly: {
      enabled: true,
      price: 299,
      testsLimit: 1000
    },
    unlimited: {
      enabled: true,
      price: 499
    }
  },
  paymentMethods: {
    stcPay: true,
    creditCard: true,
    applePay: false
  }
};

// Get current content settings
export async function getContentSettings(): Promise<ContentSettings> {
  try {
    // Try to get from localStorage first for performance
    const cached = localStorage.getItem('content_settings');
    if (cached) {
      const settings = JSON.parse(cached);
      // Validate settings structure
      if (settings.freeTestsEnabled !== undefined) {
        return { ...defaultSettings, ...settings };
      }
    }

    // Get from Firestore
    const settingsDoc = await getDoc(doc(db, 'settings', 'content'));
    if (settingsDoc.exists()) {
      const settings = settingsDoc.data() as ContentSettings;
      // Cache in localStorage
      localStorage.setItem('content_settings', JSON.stringify(settings));
      return { ...defaultSettings, ...settings };
    }

    return defaultSettings;
  } catch (error) {
    console.error('Error getting content settings:', error);
    return defaultSettings;
  }
}

// Get current settings synchronously from localStorage
export function getCurrentSettings(): ContentSettings {
  try {
    const cached = localStorage.getItem('content_settings');
    if (cached) {
      const settings = JSON.parse(cached);
      return { ...defaultSettings, ...settings };
    }
    return defaultSettings;
  } catch (error) {
    console.error('Error getting current settings:', error);
    return defaultSettings;
  }
}

// Check if user can access a specific test
export async function canAccessTest(userId: string, testIndex: number): Promise<TestAccess> {
  try {
    const settings = await getContentSettings();
    
    // Get user data
    const userDoc = await getDoc(doc(db, 'users', userId));
    if (!userDoc.exists()) {
      return { canAccess: false, reason: 'User not found' };
    }

    const userData = userDoc.data();
    
    // Check if test is in free list
    if (settings.freeTestsEnabled && settings.freeTestsList.includes(testIndex)) {
      return { canAccess: true, reason: 'Free test' };
    }

    // Check if user has purchased this specific test
    if (userData.purchasedTests && userData.purchasedTests[testIndex]) {
      return { canAccess: true, reason: 'Purchased test' };
    }

    // Check user subscription
    const subscription = userData.subscription as UserSubscription | undefined;
    if (subscription && subscription.status === 'active') {
      const now = new Date();
      const expiryDate = new Date(subscription.expiryDate);
      
      if (expiryDate > now) {
        // Check if user has remaining tests (for limited plans)
        if (subscription.plan === 'unlimited') {
          return { canAccess: true, reason: 'Unlimited subscription' };
        } else {
          const testsUsed = subscription.testsUsed || 0;
          const testsLimit = subscription.testsLimit || 0;
          
          if (testsUsed < testsLimit) {
            return { canAccess: true, reason: 'Active subscription' };
          } else {
            return { 
              canAccess: false, 
              reason: 'Subscription tests limit reached',
              requiresSubscription: true 
            };
          }
        }
      } else {
        return { 
          canAccess: false, 
          reason: 'Subscription expired',
          requiresSubscription: true 
        };
      }
    }

    // Check free tests limit for non-subscribers
    if (settings.freeTestsEnabled) {
      const testsUsed = userData.freeTestsUsed || 0;
      
      if (testsUsed < settings.freeTestsLimit) {
        return { canAccess: true, reason: 'Free test allowance' };
      } else {
        return { 
          canAccess: false, 
          reason: 'Free tests limit reached',
          requiresPayment: settings.premiumTestsEnabled,
          requiresSubscription: true,
          price: settings.premiumPrice,
          currency: settings.currency
        };
      }
    }

    // No access available
    return { 
      canAccess: false, 
      reason: 'Payment required',
      requiresPayment: settings.premiumTestsEnabled,
      price: settings.premiumPrice,
      currency: settings.currency
    };

  } catch (error) {
    console.error('Error checking test access:', error);
    return { canAccess: false, reason: 'Error checking access' };
  }
}

// Record test usage
export async function recordTestUsage(userId: string, testIndex: number): Promise<void> {
  try {
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);
    
    if (!userDoc.exists()) {
      throw new Error('User not found');
    }

    const userData = userDoc.data();
    const subscription = userData.subscription as UserSubscription | undefined;
    
    // Update based on access type
    if (subscription && subscription.status === 'active') {
      // Update subscription usage
      await updateDoc(userRef, {
        'subscription.testsUsed': (subscription.testsUsed || 0) + 1,
        updatedAt: new Date().toISOString()
      });
    } else {
      // Update free tests usage
      const freeTestsUsed = userData.freeTestsUsed || 0;
      await updateDoc(userRef, {
        freeTestsUsed: freeTestsUsed + 1,
        updatedAt: new Date().toISOString()
      });
    }

    console.log('✅ Test usage recorded for user:', userId, 'test:', testIndex);
  } catch (error) {
    console.error('Error recording test usage:', error);
    throw error;
  }
}

// Get user's test usage statistics
export async function getUserTestStats(userId: string): Promise<{
  freeTestsUsed: number;
  freeTestsLimit: number;
  subscription?: UserSubscription;
  purchasedTests: string[];
}> {
  try {
    const settings = await getContentSettings();
    const userDoc = await getDoc(doc(db, 'users', userId));
    
    if (!userDoc.exists()) {
      return {
        freeTestsUsed: 0,
        freeTestsLimit: settings.freeTestsLimit,
        purchasedTests: []
      };
    }

    const userData = userDoc.data();
    
    return {
      freeTestsUsed: userData.freeTestsUsed || 0,
      freeTestsLimit: settings.freeTestsLimit,
      subscription: userData.subscription,
      purchasedTests: Object.keys(userData.purchasedTests || {})
    };
  } catch (error) {
    console.error('Error getting user test stats:', error);
    return {
      freeTestsUsed: 0,
      freeTestsLimit: 3,
      purchasedTests: []
    };
  }
}

// Check if test is free
export function isTestFree(testIndex: number, settings?: ContentSettings): boolean {
  const currentSettings = settings || getCurrentSettings();
  return currentSettings.freeTestsEnabled && currentSettings.freeTestsList.includes(testIndex);
}

// Get test price
export function getTestPrice(testIndex: number, settings?: ContentSettings): { price: number; currency: string } | null {
  const currentSettings = settings || getCurrentSettings();
  
  if (isTestFree(testIndex, currentSettings)) {
    return null;
  }
  
  if (currentSettings.premiumTestsEnabled) {
    return {
      price: currentSettings.premiumPrice,
      currency: currentSettings.currency
    };
  }
  
  return null;
}

// Listen for settings updates
export function listenForSettingsUpdates(callback: (settings: ContentSettings) => void): () => void {
  const handleUpdate = (event: CustomEvent) => {
    callback(event.detail);
  };

  window.addEventListener('contentSettingsUpdated', handleUpdate as EventListener);
  
  return () => {
    window.removeEventListener('contentSettingsUpdated', handleUpdate as EventListener);
  };
}
