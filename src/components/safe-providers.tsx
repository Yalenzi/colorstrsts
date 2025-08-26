'use client';

import { ReactNode } from 'react';

// Smart provider that uses real auth in browser, safe defaults during build
export function Providers({ children }: { children: ReactNode }) {
  // During build time, use simple wrapper
  if (typeof window === 'undefined') {
    return <div data-providers="build-safe">{children}</div>;
  }

  // In browser, use real auth provider
  try {
    const { AuthProvider } = require('@/components/auth/AuthProvider');
    return <AuthProvider>{children}</AuthProvider>;
  } catch (error) {
    console.warn('⚠️ Failed to load AuthProvider, using fallback:', error);
    return <div data-providers="fallback">{children}</div>;
  }
}

// Smart useAuth that uses real auth in browser, safe defaults during build
export function useAuth() {
  // During build time, return safe defaults
  if (typeof window === 'undefined') {
    return {
      user: null,
      userProfile: null,
      loading: false,
      isAdmin: false,
      signIn: async () => {
        console.log('Auth not available during build');
      },
      signUp: async () => {
        console.log('Auth not available during build');
      },
      logout: async () => {
        console.log('Auth not available during build');
      },
      signInWithGoogle: async () => {
        console.log('Auth not available during build');
      },
      resetPassword: async () => {
        console.log('Auth not available during build');
      },
      refreshUserProfile: async () => {
        console.log('Auth not available during build');
      },
      checkEmailExists: async () => {
        console.log('Auth not available during build');
        return false;
      },
    };
  }

  // In browser, use real auth hook
  try {
    const { useAuth: useRealAuth } = require('@/components/auth/AuthProvider');
    return useRealAuth();
  } catch (error) {
    console.warn('⚠️ Failed to load real useAuth, using fallback:', error);
    return {
      user: null,
      userProfile: null,
      loading: false,
      isAdmin: false,
      signIn: async () => {
        throw new Error('Authentication not available');
      },
      signUp: async () => {
        throw new Error('Authentication not available');
      },
      logout: async () => {
        throw new Error('Authentication not available');
      },
      signInWithGoogle: async () => {
        throw new Error('Authentication not available');
      },
      resetPassword: async () => {
        throw new Error('Authentication not available');
      },
      refreshUserProfile: async () => {
        throw new Error('Authentication not available');
      },
      checkEmailExists: async () => {
        throw new Error('Authentication not available');
      },
    };
  }
}

// Build-safe useLanguage - returns safe defaults
export function useLanguage() {
  return {
    language: 'ar' as const,
    setLanguage: () => {
      console.log('Language not available during build');
    },
    direction: 'rtl' as const,
  };
}
