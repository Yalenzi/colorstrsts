'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  User,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  sendPasswordResetEmail,
  updateProfile
} from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { createOrUpdateUserProfile, getUserProfile, UserProfile } from '@/lib/subscription-service';
import { toast } from 'sonner';

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, displayName?: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  refreshUserProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthFixProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('🔄 Setting up auth state listener...');
    
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      console.log('🔄 Auth state changed:', user ? user.email : 'No user');
      setUser(user);
      
      if (user) {
        try {
          const profile = await getUserProfile(user.uid);
          setUserProfile(profile);
          console.log('✅ User profile loaded');
        } catch (error) {
          console.error('❌ Error loading user profile:', error);
        }
      } else {
        setUserProfile(null);
      }
      
      setLoading(false);
    });

    // فحص نتيجة Redirect عند تحميل الصفحة
    getRedirectResult(auth)
      .then(async (result) => {
        if (result) {
          console.log('✅ Redirect result:', result.user.email);
          await createOrUpdateUserProfile(result.user);
          toast.success('تم تسجيل الدخول بـ Google بنجاح');
        }
      })
      .catch((error) => {
        console.error('❌ Redirect result error:', error);
      });

    return () => unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      console.log('🔄 Starting email/password sign in...');
      const result = await signInWithEmailAndPassword(auth, email, password);
      console.log('✅ Email/password sign in successful:', result.user.email);
      await createOrUpdateUserProfile(result.user);
      toast.success('تم تسجيل الدخول بنجاح');
    } catch (error: any) {
      console.error('❌ Sign in error:', error);
      toast.error('خطأ في تسجيل الدخول');
      throw error;
    }
  };

  const signUp = async (email: string, password: string, displayName?: string) => {
    try {
      console.log('🔄 Starting email/password sign up...');
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      if (displayName && userCredential.user) {
        await updateProfile(userCredential.user, { displayName });
      }

      await createOrUpdateUserProfile(userCredential.user);
      console.log('✅ Sign up successful:', userCredential.user.email);
      toast.success('تم إنشاء الحساب بنجاح!');
    } catch (error: any) {
      console.error('❌ Sign up error:', error);
      toast.error('خطأ في إنشاء الحساب');
      throw error;
    }
  };

  const signInWithGoogle = async () => {
    try {
      console.log('🔄 Starting Google Sign-In...');

      const provider = new GoogleAuthProvider();
      provider.addScope('email');
      provider.addScope('profile');
      provider.setCustomParameters({
        prompt: 'select_account'
      });

      let result;

      try {
        result = await signInWithPopup(auth, provider);
      } catch (popupError: any) {
        if (
          popupError.code === 'auth/popup-blocked' ||
          popupError.code === 'auth/popup-closed-by-user' ||
          popupError.code === 'auth/cancelled-popup-request'
        ) {
          console.log('🔄 Popup failed, trying redirect...');
          toast.info('النافذة المنبثقة محجوبة، سيتم إعادة التوجيه...');
          await signInWithRedirect(auth, provider);
          return;
        } else {
          throw popupError;
        }
      }

      if (result) {
        console.log('✅ Google Sign-In successful:', result.user.email);
        await createOrUpdateUserProfile(result.user);
        toast.success('تم تسجيل الدخول بـ Google بنجاح');
      }

    } catch (error: any) {
      console.error('❌ Google Sign-In error:', error);
      toast.error('خطأ في تسجيل الدخول بـ Google');
      throw error;
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      setUserProfile(null);
      toast.success('تم تسجيل الخروج بنجاح');
    } catch (error: any) {
      console.error('❌ Logout error:', error);
      toast.error('خطأ في تسجيل الخروج');
      throw error;
    }
  };

  const resetPassword = async (email: string) => {
    try {
      await sendPasswordResetEmail(auth, email);
      toast.success('تم إرسال رابط إعادة تعيين كلمة المرور');
    } catch (error: any) {
      console.error('❌ Reset password error:', error);
      toast.error('خطأ في إرسال رابط إعادة التعيين');
      throw error;
    }
  };

  const refreshUserProfile = async () => {
    if (!user) return;
    
    try {
      const profile = await getUserProfile(user.uid);
      setUserProfile(profile);
    } catch (error) {
      console.error('❌ Error refreshing user profile:', error);
    }
  };

  const value: AuthContextType = {
    user,
    userProfile,
    loading,
    signIn,
    signUp,
    signInWithGoogle,
    logout,
    resetPassword,
    refreshUserProfile
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthFix() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuthFix must be used within an AuthFixProvider');
  }
  return context;
}
