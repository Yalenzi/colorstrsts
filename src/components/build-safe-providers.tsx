'use client';

import { ReactNode } from 'react';

// Build-safe providers - NO hooks, NO context, NO complexity
export function Providers({ children }: { children: ReactNode }) {
  return <div data-providers="true">{children}</div>;
}

// Build-safe useAuth - returns safe defaults
export function useAuth() {
  return {
    user: null,
    loading: false,
    isAdmin: false,
    signIn: async () => {
      console.log('Auth not available during build');
    },
    signUp: async () => {
      console.log('Auth not available during build');
    },
    signOut: async () => {
      console.log('Auth not available during build');
    },
    refreshUser: async () => {
      console.log('Auth not available during build');
    },
    signInWithGoogle: async () => {
      console.log('Auth not available during build');
    },
    resetPassword: async () => {
      console.log('Auth not available during build');
    },
    sendVerificationEmail: async () => {
      console.log('Auth not available during build');
    },
  };
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
