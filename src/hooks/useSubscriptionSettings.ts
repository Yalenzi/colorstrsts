'use client';

import { useState, useEffect } from 'react';
import {
  getSubscriptionSettings,
  saveSubscriptionSettings,
  listenToSubscriptionSettings,
  SubscriptionSettings
} from '@/lib/firebase-realtime';
import {
  getSubscriptionSettingsLocal,
  saveSubscriptionSettingsLocal,
  initializeLocalStorage
} from '@/lib/local-data-service';

const defaultSettings: SubscriptionSettings = {
  freeTestsEnabled: true,
  freeTestsCount: 5,
  premiumRequired: true,
  globalFreeAccess: false,
  specificPremiumTests: []
};

/**
 * Hook to manage subscription settings
 * Hook لإدارة إعدادات الاشتراكات
 */
export function useSubscriptionSettings() {
  const [settings, setSettings] = useState<SubscriptionSettings>(defaultSettings);
  const [loading, setLoading] = useState(true);

  // Load settings from localStorage first, then Firebase as fallback
  const loadSettings = async () => {
    // Check if we're in browser environment
    if (typeof window === 'undefined') {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      // Try localStorage first
      try {
        initializeLocalStorage();
        const localSettings = getSubscriptionSettingsLocal();
        setSettings(localSettings);

        // Set global settings for immediate access
        (window as any).subscriptionSettings = localSettings;

        console.log('✅ Loaded subscription settings from localStorage');
        return;

      } catch (localError) {
        console.warn('Failed to load from localStorage, trying Firebase:', localError);
      }

      // Fallback to Firebase
      const firebaseSettings = await getSubscriptionSettings();
      setSettings(firebaseSettings);

      // Also set global settings for immediate access
      (window as any).subscriptionSettings = firebaseSettings;

      console.log('✅ Loaded subscription settings from Firebase');

    } catch (error) {
      console.error('Error loading subscription settings:', error);
      setSettings(defaultSettings);

      // Set default settings in global object as fallback
      if (typeof window !== 'undefined') {
        (window as any).subscriptionSettings = defaultSettings;
      }
    } finally {
      setLoading(false);
    }
  };

  // Listen for settings changes from Firebase
  useEffect(() => {
    // Only run in browser environment
    if (typeof window === 'undefined') {
      return;
    }

    loadSettings();

    // Set up real-time listener for Firebase changes
    let unsubscribe: (() => void) | null = null;

    try {
      unsubscribe = listenToSubscriptionSettings((newSettings) => {
        setSettings(newSettings);

        // Update global settings for immediate access
        (window as any).subscriptionSettings = newSettings;

        // Dispatch custom event to notify other components
        window.dispatchEvent(new CustomEvent('subscriptionSettingsUpdated', {
          detail: newSettings
        }));
      });
    } catch (error) {
      console.error('Error setting up Firebase listener:', error);
    }

    // Listen for custom events (for immediate updates in same tab)
    const handleSettingsUpdate = (e: CustomEvent) => {
      if (e.detail) {
        setSettings(e.detail);
        (window as any).subscriptionSettings = e.detail;
      }
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('subscriptionSettingsUpdated', handleSettingsUpdate as EventListener);
    }

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
      if (typeof window !== 'undefined') {
        window.removeEventListener('subscriptionSettingsUpdated', handleSettingsUpdate as EventListener);
      }
    };
  }, []);

  // Function to update settings (for admin use)
  const updateSettings = async (newSettings: SubscriptionSettings) => {
    try {
      setSettings(newSettings);

      // Save to localStorage first
      try {
        saveSubscriptionSettingsLocal(newSettings);
        console.log('✅ Saved subscription settings to localStorage');
      } catch (localError) {
        console.warn('Failed to save to localStorage:', localError);
      }

      // Also save to Firebase as backup
      try {
        await saveSubscriptionSettings(newSettings);
        console.log('✅ Saved subscription settings to Firebase');
      } catch (firebaseError) {
        console.warn('Failed to save to Firebase:', firebaseError);
      }

      if (typeof window !== 'undefined') {
        // Set global settings for immediate access
        (window as any).subscriptionSettings = newSettings;

        // Dispatch custom event to notify other components immediately
        window.dispatchEvent(new CustomEvent('subscriptionSettingsUpdated', {
          detail: newSettings
        }));
      }
    } catch (error) {
      console.error('Error updating subscription settings:', error);
      throw error;
    }
  };

  // Function to check if a test is accessible based on current settings
  const isTestAccessible = (testIndex: number, userHasPremium: boolean = false): boolean => {
    // If global free access is enabled, all tests are accessible
    if (settings.globalFreeAccess) {
      return true;
    }

    // Check if this specific test requires premium
    if (settings.specificPremiumTests.includes(testIndex + 1)) {
      return userHasPremium;
    }

    // Check free tests limit
    if (settings.freeTestsEnabled && testIndex < settings.freeTestsCount) {
      return true;
    }

    // Check if premium is required for advanced tests
    if (settings.premiumRequired && testIndex >= settings.freeTestsCount) {
      return userHasPremium;
    }

    // Default allow access
    return true;
  };

  // Function to get access status for a test
  const getTestAccessStatus = (testIndex: number, userHasPremium: boolean = false) => {
    const isAccessible = isTestAccessible(testIndex, userHasPremium);
    
    if (isAccessible) {
      return {
        canAccess: true,
        reason: settings.globalFreeAccess ? 'Global free access enabled' : 'Test is accessible'
      };
    }

    if (settings.specificPremiumTests.includes(testIndex + 1)) {
      return {
        canAccess: false,
        reason: 'Premium subscription required for this specific test',
        requiresSubscription: true
      };
    }

    if (testIndex >= settings.freeTestsCount) {
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
  };

  // Always return an object, never undefined
  return {
    settings: settings || defaultSettings,
    loading: loading || false,
    updateSettings: updateSettings || (() => Promise.resolve()),
    loadSettings: loadSettings || (() => Promise.resolve()),
    isTestAccessible: isTestAccessible || (() => true),
    getTestAccessStatus: getTestAccessStatus || (() => ({ canAccess: true, reason: 'Default access' }))
  };
}

export default useSubscriptionSettings;
