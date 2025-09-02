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
  signInWithGoogle: (useRedirect?: boolean) => Promise<void>;
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
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// معالجة أخطاء Firebase
function getFirebaseErrorMessage(errorCode: string): string {
  const errorMessages: { [key: string]: string } = {
    'auth/user-not-found': 'لم يتم العثور على حساب بهذا البريد الإلكتروني',
    'auth/wrong-password': 'كلمة المرور غير صحيحة',
    'auth/email-already-in-use': 'هذا البريد الإلكتروني مستخدم بالفعل',
    'auth/weak-password': 'كلمة المرور ضعيفة جداً',
    'auth/invalid-email': 'البريد الإلكتروني غير صحيح',
    'auth/user-disabled': 'تم تعطيل هذا الحساب',
    'auth/too-many-requests': 'تم تجاوز عدد المحاولات المسموح، حاول لاحقاً',
    'auth/network-request-failed': 'خطأ في الاتصال بالإنترنت',
    'auth/popup-blocked': 'تم حظر النافذة المنبثقة، يرجى السماح بالنوافذ المنبثقة',
    'auth/popup-closed-by-user': 'تم إغلاق النافذة المنبثقة',
    'auth/cancelled-popup-request': 'تم إلغاء طلب النافذة المنبثقة',
    'auth/internal-error': 'خطأ داخلي، يرجى المحاولة مرة أخرى',
    'auth/unauthorized-domain': 'النطاق غير مصرح له بالمصادقة',
    'auth/operation-not-allowed': 'هذه العملية غير مسموحة',
    'auth/requires-recent-login': 'يتطلب تسجيل دخول حديث'
  };

  return errorMessages[errorCode] || 'حدث خطأ غير متوقع، يرجى المحاولة مرة أخرى';
}

interface AuthProviderProps {
  children: React.ReactNode;
}

export function EnhancedAuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // تحديث ملف المستخدم
  const refreshUserProfile = async () => {
    if (user) {
      try {
        const profile = await getUserProfile(user.uid);
        setUserProfile(profile);
      } catch (error) {
        console.error('Error refreshing user profile:', error);
      }
    }
  };

  // إعادة تحميل بيانات المستخدم
  const reloadUser = async () => {
    if (user) {
      try {
        await reload(user);
        console.log('✅ User data reloaded');
      } catch (error) {
        console.error('❌ Error reloading user:', error);
      }
    }
  };

  // إرسال بريد التحقق
  const sendVerificationEmail = async () => {
    if (user && !user.emailVerified) {
      try {
        await sendEmailVerification(user);
        toast.success('تم إرسال بريد التحقق بنجاح');
      } catch (error: any) {
        console.error('❌ Error sending verification email:', error);
        toast.error(getFirebaseErrorMessage(error.code));
      }
    }
  };

  // تسجيل الدخول بالإيميل وكلمة المرور
  const signIn = async (email: string, password: string) => {
    try {
      console.log('🔄 Starting email/password sign in...');
      const result = await signInWithEmailAndPassword(auth, email, password);
      console.log('✅ Email/password sign in successful:', result.user.email);

      // إنشاء أو تحديث ملف المستخدم
      await createOrUpdateUserProfile(result.user);
      
      toast.success('تم تسجيل الدخول بنجاح');
    } catch (error: any) {
      console.error('❌ Sign in error:', error);
      const errorMessage = getFirebaseErrorMessage(error.code);
      toast.error(errorMessage);
      throw new Error(errorMessage);
    }
  };

  // التسجيل بالإيميل وكلمة المرور
  const signUp = async (email: string, password: string, displayName?: string) => {
    try {
      console.log('🔄 Starting email/password sign up...');
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      // تحديث اسم المستخدم إذا تم توفيره
      if (displayName && userCredential.user) {
        await updateProfile(userCredential.user, { displayName });
      }

      // إنشاء ملف المستخدم
      await createOrUpdateUserProfile(userCredential.user);

      console.log('✅ Sign up successful:', userCredential.user.email);
      toast.success('تم إنشاء الحساب بنجاح!');
      
    } catch (error: any) {
      console.error('❌ Sign up error:', error);
      const errorMessage = getFirebaseErrorMessage(error.code);
      toast.error(errorMessage);
      throw new Error(errorMessage);
    }
  };

  // تسجيل الدخول بـ Google
  const signInWithGoogle = async (useRedirect: boolean = false) => {
    try {
      console.log('🔄 Starting Google Sign-In...', useRedirect ? '(Redirect)' : '(Popup)');

      // التحقق من إعدادات Firebase
      if (!auth.app.options.apiKey) {
        throw new Error('Firebase API Key is missing');
      }

      const provider = new GoogleAuthProvider();

      // إعداد النطاقات المطلوبة
      provider.addScope('email');
      provider.addScope('profile');

      // إعداد معاملات مخصصة
      provider.setCustomParameters({
        prompt: 'select_account',
        access_type: 'offline'
      });

      let result;

      if (useRedirect) {
        // استخدام Redirect
        console.log('🔄 Using redirect method...');
        await signInWithRedirect(auth, provider);
        return; // سيتم إعادة التوجيه
      } else {
        // استخدام Popup
        console.log('🔄 Using popup method...');
        result = await signInWithPopup(auth, provider);
      }

      if (result) {
        console.log('✅ Google Sign-In successful:', result.user.email);
        console.log('User details:', {
          uid: result.user.uid,
          displayName: result.user.displayName,
          email: result.user.email,
          photoURL: result.user.photoURL
        });

        // إنشاء أو تحديث ملف المستخدم
        await createOrUpdateUserProfile(result.user);

        toast.success('تم تسجيل الدخول بـ Google بنجاح');
      }

    } catch (error: any) {
      console.error('❌ Google Sign-In error:', error);
      console.error('Error details:', {
        code: error.code,
        message: error.message,
        stack: error.stack
      });

      // معالجة أخطاء محددة
      if (!useRedirect && (
        error.code === 'auth/popup-blocked' ||
        error.code === 'auth/popup-closed-by-user' ||
        error.code === 'auth/cancelled-popup-request'
      )) {
        console.log('🔄 Popup failed, trying redirect...');
        toast.info('النافذة المنبثقة محجوبة، سيتم إعادة التوجيه...');
        return signInWithGoogle(true);
      }

      // معالجة أخطاء أخرى
      let errorMessage = 'حدث خطأ في تسجيل الدخول بـ Google';

      switch (error.code) {
        case 'auth/network-request-failed':
          errorMessage = 'خطأ في الاتصال بالإنترنت';
          break;
        case 'auth/too-many-requests':
          errorMessage = 'تم تجاوز عدد المحاولات المسموح، حاول لاحقاً';
          break;
        case 'auth/user-disabled':
          errorMessage = 'تم تعطيل هذا الحساب';
          break;
        case 'auth/operation-not-allowed':
          errorMessage = 'تسجيل الدخول بـ Google غير مفعل';
          break;
        default:
          errorMessage = getFirebaseErrorMessage(error.code) || errorMessage;
      }

      toast.error(errorMessage);
      throw new Error(errorMessage);
    }
  };

  // تسجيل الخروج
  const logout = async () => {
    try {
      await signOut(auth);
      setUserProfile(null);
      toast.success('تم تسجيل الخروج بنجاح');
    } catch (error: any) {
      console.error('❌ Logout error:', error);
      toast.error('حدث خطأ أثناء تسجيل الخروج');
    }
  };

  // إعادة تعيين كلمة المرور
  const resetPassword = async (email: string) => {
    try {
      await sendPasswordResetEmail(auth, email);
      toast.success('تم إرسال رابط إعادة تعيين كلمة المرور إلى بريدك الإلكتروني');
    } catch (error: any) {
      console.error('❌ Password reset error:', error);
      const errorMessage = getFirebaseErrorMessage(error.code);
      toast.error(errorMessage);
      throw new Error(errorMessage);
    }
  };

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

  // مراقبة حالة المصادقة
  useEffect(() => {
    console.log('🔄 Setting up auth state listener...');
    
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      console.log('🔄 Auth state changed:', user?.email || 'No user');
      
      setUser(user);
      
      if (user) {
        // تحديث ملف المستخدم
        try {
          const profile = await getUserProfile(user.uid);
          setUserProfile(profile);
        } catch (error) {
          console.error('Error loading user profile:', error);
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
