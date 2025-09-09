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
  fetchSignInMethodsForEmail,
  updateProfile,
  sendEmailVerification,
  reload
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
  checkEmailExists: (email: string) => Promise<boolean>;
  sendVerificationEmail: () => Promise<void>;
  reloadUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an ImprovedAuthProvider');
  }
  return context;
}

interface ImprovedAuthProviderProps {
  children: React.ReactNode;
}

export function ImprovedAuthProvider({ children }: ImprovedAuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Helper function to get Firebase error messages
  const getFirebaseErrorMessage = (errorCode: string): string => {
    switch (errorCode) {
      case 'auth/user-not-found':
        return 'المستخدم غير موجود';
      case 'auth/wrong-password':
        return 'كلمة المرور غير صحيحة';
      case 'auth/email-already-in-use':
        return 'البريد الإلكتروني مستخدم بالفعل';
      case 'auth/weak-password':
        return 'كلمة المرور ضعيفة';
      case 'auth/invalid-email':
        return 'البريد الإلكتروني غير صحيح';
      case 'auth/too-many-requests':
        return 'محاولات كثيرة جداً. حاول لاحقاً';
      case 'auth/network-request-failed':
        return 'خطأ في الشبكة. تحقق من اتصال الإنترنت';
      case 'auth/popup-blocked':
        return 'تم حظر النافذة المنبثقة. يرجى السماح بالنوافذ المنبثقة';
      case 'auth/popup-closed-by-user':
        return 'تم إغلاق النافذة من قبل المستخدم';
      case 'auth/cancelled-popup-request':
        return 'تم إلغاء طلب تسجيل الدخول';
      case 'auth/operation-not-allowed':
        return 'تسجيل الدخول بـ Google غير مفعل';
      case 'auth/user-disabled':
        return 'تم تعطيل هذا الحساب';
      default:
        return 'حدث خطأ غير متوقع';
    }
  };

  // Load user profile
  const loadUserProfile = async (user: User) => {
    try {
      const profile = await getUserProfile(user.uid);
      setUserProfile(profile);
    } catch (error) {
      console.error('Error loading user profile:', error);
      setUserProfile(null);
    }
  };

  // Sign in with email and password
  const signIn = async (email: string, password: string) => {
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      await createOrUpdateUserProfile(result.user);
      console.log('✅ Email sign-in successful');
    } catch (error: any) {
      console.error('❌ Email sign-in error:', error);
      throw new Error(getFirebaseErrorMessage(error.code));
    }
  };

  // Sign up with email and password
  const signUp = async (email: string, password: string, displayName?: string) => {
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      
      if (displayName) {
        await updateProfile(result.user, { displayName });
      }
      
      await createOrUpdateUserProfile(result.user);
      await sendEmailVerification(result.user);
      
      console.log('✅ Email sign-up successful');
    } catch (error: any) {
      console.error('❌ Email sign-up error:', error);
      throw new Error(getFirebaseErrorMessage(error.code));
    }
  };

  // Sign in with Google
  const signInWithGoogle = async () => {
    try {
      console.log('🔄 Starting Google Sign-In...');

      // Validate Firebase configuration
      if (!auth.app.options.apiKey || !auth.app.options.projectId) {
        throw new Error('Firebase configuration is incomplete');
      }

      const provider = new GoogleAuthProvider();
      provider.addScope('email');
      provider.addScope('profile');
      provider.setCustomParameters({
        prompt: 'select_account',
        access_type: 'offline'
      });

      let result;

      try {
        // Try popup first
        result = await signInWithPopup(auth, provider);
        console.log('✅ Google popup sign-in successful:', result.user.email);
      } catch (popupError: any) {
        console.warn('⚠️ Popup failed, trying redirect:', popupError.code);
        
        // If popup fails, use redirect
        if (popupError.code === 'auth/popup-blocked' || 
            popupError.code === 'auth/popup-closed-by-user' ||
            popupError.code === 'auth/cancelled-popup-request') {
          
          console.log('🔄 Using redirect method...');
          await signInWithRedirect(auth, provider);
          return; // Will redirect, so return here
        } else {
          throw popupError; // Re-throw other errors
        }
      }

      // If we get here, popup was successful
      if (result) {
        await createOrUpdateUserProfile(result.user);
        console.log('✅ Google Sign-In completed successfully');
      }

    } catch (error: any) {
      console.error('❌ Google Sign-In error:', error);
      throw new Error(getFirebaseErrorMessage(error.code));
    }
  };

  // Logout
  const logout = async () => {
    try {
      await signOut(auth);
      setUserProfile(null);
      console.log('✅ Logout successful');
    } catch (error: any) {
      console.error('❌ Logout error:', error);
      throw new Error('خطأ في تسجيل الخروج');
    }
  };

  // Reset password
  const resetPassword = async (email: string) => {
    try {
      await sendPasswordResetEmail(auth, email);
      console.log('✅ Password reset email sent');
    } catch (error: any) {
      console.error('❌ Password reset error:', error);
      throw new Error(getFirebaseErrorMessage(error.code));
    }
  };

  // Check if email exists
  const checkEmailExists = async (email: string): Promise<boolean> => {
    try {
      const methods = await fetchSignInMethodsForEmail(auth, email);
      return methods.length > 0;
    } catch (error) {
      console.error('Error checking email:', error);
      return false;
    }
  };

  // Send verification email
  const sendVerificationEmail = async () => {
    if (user && !user.emailVerified) {
      try {
        await sendEmailVerification(user);
        console.log('✅ Verification email sent');
      } catch (error: any) {
        console.error('❌ Send verification error:', error);
        throw new Error('خطأ في إرسال رسالة التحقق');
      }
    }
  };

  // Reload user
  const reloadUser = async () => {
    if (user) {
      try {
        await reload(user);
        console.log('✅ User reloaded');
      } catch (error: any) {
        console.error('❌ Reload user error:', error);
        throw new Error('خطأ في إعادة تحميل بيانات المستخدم');
      }
    }
  };

  // Refresh user profile
  const refreshUserProfile = async () => {
    if (user) {
      await loadUserProfile(user);
    }
  };

  // Auth state listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      console.log('🔄 Auth state changed:', user?.email || 'No user');
      setUser(user);
      
      if (user) {
        await loadUserProfile(user);
      } else {
        setUserProfile(null);
      }
      
      setLoading(false);
    });

    // Check for redirect result on mount
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
        toast.error(getFirebaseErrorMessage(error.code));
      });

    return () => unsubscribe();
  }, []);

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
    checkEmailExists,
    sendVerificationEmail,
    reloadUser
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
