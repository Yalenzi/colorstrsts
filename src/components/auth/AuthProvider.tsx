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
  sendPasswordResetEmail,
  fetchSignInMethodsForEmail,
  updateProfile,
  getRedirectResult
} from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { createOrUpdateUserProfile, getUserProfile, UserProfile } from '@/lib/subscription-service';

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
  checkEmailExists: (email: string) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// دالة معالجة أخطاء Google Sign-In
function getGoogleSignInErrorMessage(errorCode: string): string {
  switch (errorCode) {
    case 'auth/popup-closed-by-user':
      return 'تم إغلاق نافذة تسجيل الدخول. يرجى المحاولة مرة أخرى';
    case 'auth/popup-blocked':
      return 'تم حجب النافذة المنبثقة. يرجى السماح بالنوافذ المنبثقة في متصفحك والمحاولة مرة أخرى';
    case 'auth/cancelled-popup-request':
      return 'تم إلغاء طلب تسجيل الدخول';
    case 'auth/operation-not-allowed':
      return 'تسجيل الدخول بـ Google غير مفعل. يرجى التواصل مع المدير';
    case 'auth/unauthorized-domain':
      return 'النطاق الحالي غير مصرح له. يرجى استخدام النطاق الصحيح';
    case 'auth/network-request-failed':
      return 'خطأ في الاتصال بالشبكة. تحقق من اتصالك بالإنترنت والمحاولة مرة أخرى';
    case 'auth/internal-error':
      return 'خطأ داخلي في Firebase. قد يكون النطاق غير مصرح به. يرجى المحاولة مرة أخرى أو استخدام طريقة أخرى';
    case 'auth/too-many-requests':
      return 'تم تجاوز عدد المحاولات المسموح. يرجى الانتظار قليلاً والمحاولة مرة أخرى';
    case 'auth/user-disabled':
      return 'تم تعطيل هذا الحساب. يرجى التواصل مع المدير';
    case 'auth/account-exists-with-different-credential':
      return 'يوجد حساب بنفس البريد الإلكتروني مع طريقة تسجيل دخول مختلفة';
    case 'auth/credential-already-in-use':
      return 'هذا الحساب مستخدم بالفعل مع طريقة تسجيل دخول أخرى';
    case 'auth/unauthorized-domain':
      return 'النطاق الحالي غير مصرح له في إعدادات Firebase. يرجى التواصل مع المدير';
    default:
      return 'خطأ غير متوقع في تسجيل الدخول بـ Google. يرجى المحاولة مرة أخرى';
  }
}

// دالة معالجة أخطاء تسجيل الدخول العادي
function getSignInErrorMessage(errorCode: string): string {
  switch (errorCode) {
    case 'auth/user-not-found':
      return 'لا يوجد حساب بهذا البريد الإلكتروني. يرجى التحقق من البريد الإلكتروني أو إنشاء حساب جديد';
    case 'auth/wrong-password':
      return 'كلمة المرور غير صحيحة. يرجى المحاولة مرة أخرى';
    case 'auth/invalid-email':
      return 'البريد الإلكتروني غير صالح. يرجى التحقق من صيغة البريد الإلكتروني';
    case 'auth/user-disabled':
      return 'تم تعطيل هذا الحساب. يرجى التواصل مع المدير';
    case 'auth/too-many-requests':
      return 'تم تجاوز عدد المحاولات المسموح. يرجى الانتظار قليلاً والمحاولة مرة أخرى';
    case 'auth/network-request-failed':
      return 'خطأ في الاتصال بالشبكة. تحقق من اتصالك بالإنترنت';
    case 'auth/invalid-credential':
      return 'بيانات تسجيل الدخول غير صحيحة';
    default:
      return 'خطأ في تسجيل الدخول. يرجى المحاولة مرة أخرى';
  }
}

// دالة معالجة أخطاء إنشاء الحساب
function getSignUpErrorMessage(errorCode: string): string {
  switch (errorCode) {
    case 'auth/email-already-in-use':
      return 'هذا البريد الإلكتروني مستخدم بالفعل. يرجى تسجيل الدخول أو استخدام بريد إلكتروني آخر';
    case 'auth/weak-password':
      return 'كلمة المرور ضعيفة. يجب أن تكون 6 أحرف على الأقل وتحتوي على أرقام وحروف';
    case 'auth/invalid-email':
      return 'البريد الإلكتروني غير صالح. يرجى التحقق من صيغة البريد الإلكتروني';
    case 'auth/operation-not-allowed':
      return 'إنشاء الحسابات غير مفعل حالياً. يرجى التواصل مع المدير';
    case 'auth/network-request-failed':
      return 'خطأ في الاتصال بالشبكة. تحقق من اتصالك بالإنترنت';
    default:
      return 'حدث خطأ أثناء إنشاء الحساب. يرجى المحاولة مرة أخرى';
  }
}

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // تحديث ملف المستخدم
  const refreshUserProfile = async () => {
    if (user) {
      const profile = await getUserProfile(user.uid);
      setUserProfile(profile);
    }
  };

  // تسجيل الدخول بالإيميل وكلمة المرور
  const signIn = async (email: string, password: string) => {
    try {
      console.log('🔄 Starting email/password sign in...');
      const result = await signInWithEmailAndPassword(auth, email, password);
      console.log('✅ Email/password sign in successful:', result.user.email);

      // Create secure session cookie via Netlify Function
      try {
        const idToken = await result.user.getIdToken(true);
        await fetch('/api/sessionLogin', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ idToken })
        });
      } catch (e) {
        console.warn('⚠️ Failed to create session cookie:', e);
      }
      return result;
    } catch (error: any) {
      console.error('❌ Sign in error:', error);

      // معالجة أخطاء محددة
      const errorMessage = getSignInErrorMessage(error.code);
      throw new Error(errorMessage);
    }
  };

  // إنشاء حساب جديد
  const signUp = async (email: string, password: string, displayName?: string) => {
    try {
      console.log('🔄 Starting sign up...');
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);

      if (displayName && userCredential.user) {
        // تحديث اسم المستخدم
        try {
          await updateProfile(userCredential.user, {
            displayName: displayName
          });
          console.log('✅ Display name updated:', displayName);
        } catch (updateError) {
          console.warn('⚠️ Failed to update display name:', updateError);
        }
      }

      console.log('✅ Sign up successful:', userCredential.user.email);
      return userCredential;
    } catch (error: any) {
      console.error('❌ Sign up error:', error);

      // معالجة أخطاء محددة
      const errorMessage = getSignUpErrorMessage(error.code);
      throw new Error(errorMessage);
    }
  };

  // تسجيل الدخول بـ Google
  const signInWithGoogle = async () => {
    try {
      console.log('🔄 Starting Google Sign-In...');
      console.log('🔧 Current domain:', typeof window !== 'undefined' ? window.location.hostname : 'SSR');
      console.log('🔧 Auth domain:', auth.app.options.authDomain);

      // التحقق من إعدادات Firebase
      if (!auth.app.options.apiKey) {
        console.error('❌ Firebase API Key is missing');
        throw new Error('Firebase API Key is missing. Please check your Firebase configuration.');
      }

      if (!auth.app.options.projectId) {
        console.error('❌ Firebase Project ID is missing');
        throw new Error('Firebase Project ID is missing. Please check your Firebase configuration.');
      }

      console.log('✅ Firebase configuration is valid');
      console.log('🔧 Project ID:', auth.app.options.projectId);

      const provider = new GoogleAuthProvider();

      // إعداد إضافي لـ Google Provider
      provider.addScope('email');
      provider.addScope('profile');

      // إعداد معاملات مخصصة
      provider.setCustomParameters({
        prompt: 'select_account',
        access_type: 'offline'
      });

      const FORCE_REDIRECT = process.env.NEXT_PUBLIC_AUTH_FORCE_REDIRECT === 'true';

      // إذا كنا على colorstest.com ونريد تقليل مشاكل الـ popup، نستخدم redirect مباشرة
      const isProductionHost = typeof window !== 'undefined' && /(^|\.)colorstest\.com$/i.test(window.location.hostname);
      if (FORCE_REDIRECT && isProductionHost) {
        const { signInWithRedirect } = await import('firebase/auth');
        await signInWithRedirect(auth, provider);
        return;
      }

      console.log('🔄 Attempting popup sign-in...');
      console.log('Firebase Auth instance:', auth);
      console.log('Google Provider:', provider);

      // محاولة استخدام popup أولاً، ثم redirect كـ fallback
      let result;
      try {
        result = await signInWithPopup(auth, provider);
        // Create secure session cookie via Netlify Function
        try {
          const idToken = await result.user.getIdToken(true);
          await fetch('/api/sessionLogin', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ idToken })
          });
        } catch (e) {
          console.warn('⚠️ Failed to create session cookie:', e);
        }
      } catch (popupError: any) {
        console.warn('⚠️ Popup failed, trying redirect...', popupError);

        // قائمة الأخطاء التي تستدعي استخدام redirect
        const redirectErrors = [
          'auth/popup-blocked',
          'auth/popup-closed-by-user',
          'auth/cancelled-popup-request',
          'auth/internal-error', // إضافة internal-error للـ fallback
          'auth/unauthorized-domain',
          'auth/network-request-failed'
        ];

        if (redirectErrors.includes(popupError.code)) {
          console.log('🔄 Switching to redirect authentication...');
          // استخدام redirect كبديل
          const { signInWithRedirect } = await import('firebase/auth');
          await signInWithRedirect(auth, provider);
          return; // سيتم إعادة التوجيه
        }
        throw popupError;
      }

      // التحقق من نجاح العملية
      if (result.user) {
        console.log('✅ Google sign in successful:', result.user.email);
        console.log('User details:', {
          uid: result.user.uid,
          email: result.user.email,
          displayName: result.user.displayName,
          photoURL: result.user.photoURL
        });
        return result;
      } else {
        throw new Error('No user returned from Google sign in');
      }
    } catch (error: any) {
      console.error('❌ Google sign in error:', error);
      console.error('Error details:', {
        code: error.code,
        message: error.message,
        stack: error.stack,
        currentDomain: typeof window !== 'undefined' ? window.location.hostname : 'SSR',
        authDomain: auth.app.options.authDomain,
        projectId: auth.app.options.projectId
      });

      // إضافة معلومات تشخيصية للأخطاء الشائعة
      if (error.code === 'auth/unauthorized-domain') {
        console.error('🚨 UNAUTHORIZED DOMAIN ERROR:');
        console.error('Current domain:', typeof window !== 'undefined' ? window.location.hostname : 'Unknown');
        console.error('Auth domain:', auth.app.options.authDomain);
        console.error('Solution: Add this domain to Firebase Console > Authentication > Settings > Authorized domains');
      }

      if (error.code === 'auth/popup-blocked') {
        console.error('🚨 POPUP BLOCKED ERROR:');
        console.error('Solution: Allow popups in browser or the system will automatically try redirect method');
      }

      if (error.code === 'auth/internal-error') {
        console.error('🚨 INTERNAL ERROR:');
        console.error('This might be due to configuration issues or network problems');
        console.error('Check Firebase configuration and network connectivity');
      }

      // معالجة أخطاء محددة مع رسائل واضحة
      const errorMessage = getGoogleSignInErrorMessage(error.code);
      throw new Error(errorMessage);
    }
  };

  // تسجيل الخروج
  const logout = async () => {
    try {
      try {
        await fetch('/api/sessionLogout', { method: 'POST' });
      } catch (e) {
        console.warn('⚠️ Failed to clear session cookie:', e);
      }
      await signOut(auth);
      setUserProfile(null);
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  };

  // إعادة تعيين كلمة المرور
  const resetPassword = async (email: string) => {
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (error) {
      console.error('Password reset error:', error);
      throw error;
    }
  };

  // مراقبة حالة المصادقة
  useEffect(() => {
    let redirectChecked = false;

    // فحص نتيجة redirect عند تحميل الصفحة (مرة واحدة فقط)
    const checkRedirectResult = async () => {
      if (redirectChecked) return;
      redirectChecked = true;

      try {
        console.log('🔄 Checking redirect result...');
        const result = await getRedirectResult(auth);
        if (result) {
          console.log('✅ Redirect sign-in successful:', result.user.email);
          console.log('User details:', {
            uid: result.user.uid,
            email: result.user.email,
            displayName: result.user.displayName,
            providerId: result.providerId,
            operationType: result.operationType
          });

          // Create secure session cookie via Netlify Function
          try {
            const idToken = await result.user.getIdToken(true);
            const response = await fetch('/api/sessionLogin', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ idToken })
            });

            if (response.ok) {
              console.log('✅ Session cookie created successfully');
            } else {
              console.warn('⚠️ Session cookie creation failed:', response.status);
            }
          } catch (e) {
            console.warn('⚠️ Failed to create session cookie:', e);
          }
        } else {
          console.log('ℹ️ No redirect result found');

          // إضافة معلومات تشخيصية
          console.log('🔍 Current URL:', window.location.href);
          console.log('🔍 URL params:', window.location.search);
          console.log('🔍 URL hash:', window.location.hash);
        }
      } catch (error: any) {
        console.error('❌ Redirect result error:', error);
        console.error('Error details:', {
          code: error.code,
          message: error.message,
          stack: error.stack
        });

        // معالجة أخطاء محددة
        if (error.code === 'auth/internal-error') {
          console.warn('⚠️ Internal error - possibly CSP or configuration issue');
          // لا نرمي خطأ هنا لتجنب كسر التطبيق
        } else if (error.code === 'auth/network-request-failed') {
          console.warn('⚠️ Network error during redirect');
        } else {
          console.error('Unexpected redirect error:', error);
        }
      }
    };

    checkRedirectResult();

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);

      if (user) {
        // إنشاء أو تحديث ملف المستخدم
        try {
          const profile = await createOrUpdateUserProfile(user);
          setUserProfile(profile);
        } catch (error) {
          console.error('Error creating/updating user profile:', error);
        }
      } else {
        setUserProfile(null);
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // فحص وجود البريد الإلكتروني
  const checkEmailExists = async (email: string): Promise<boolean> => {
    try {
      const methods = await fetchSignInMethodsForEmail(auth, email);
      return methods.length > 0;
    } catch (error) {
      console.error('Error checking email:', error);
      return false;
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
    refreshUserProfile,
    checkEmailExists
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
