'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { Language } from '@/types';
import { getTranslations } from '@/lib/translations';

interface AdminAuthGuardProps {
  children: React.ReactNode;
  lang: Language;
}

interface UserProfile {
  role: string;
  isActive: boolean;
  emailVerified: boolean;
}

export function AdminAuthGuard({ children, lang }: AdminAuthGuardProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [error, setError] = useState<string>('');
  const router = useRouter();
  const isRTL = lang === 'ar';

  // Immediate check on mount
  useEffect(() => {
    console.log('[ADMIN AUTH] AdminAuthGuard mounted, checking initial auth state');
    const currentUser = auth.currentUser;
    if (!currentUser) {
      console.warn('[ADMIN AUTH] No current user on mount, redirecting immediately');
      setIsLoading(false);
      router.push(`/${lang}/admin/login`);
    }
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      try {
        console.log('[ADMIN AUTH] Checking authentication...', { currentUser: !!currentUser });

        if (!currentUser) {
          // No user logged in - redirect immediately
          console.warn('[ADMIN AUTH] No user logged in, redirecting to login');
          setError(isRTL ? 'يجب تسجيل الدخول أولاً' : 'Please login first');
          setIsLoading(false);
          router.push(`/${lang}/admin/login`);
          return;
        }

        // Check if email is verified
        console.log('[ADMIN AUTH] Email verified:', currentUser.emailVerified);
        if (!currentUser.emailVerified) {
          console.warn('[ADMIN AUTH] Email not verified');
          setError(isRTL ? 'يجب تأكيد البريد الإلكتروني أولاً' : 'Email verification required');
          setIsLoading(false);
          router.push(`/${lang}/admin/login`);
          return;
        }

        // Get user profile from Firestore
        console.log('[ADMIN AUTH] Checking user profile in Firestore...');
        const userDoc = await getDoc(doc(db, 'users', currentUser.uid));

        if (!userDoc.exists()) {
          console.warn('[ADMIN AUTH] User profile not found in Firestore');
          setError(isRTL ? 'ملف المستخدم غير موجود' : 'User profile not found');
          setIsLoading(false);
          router.push(`/${lang}/admin/login`);
          return;
        }

        const userProfile = userDoc.data() as UserProfile;
        console.log('[ADMIN AUTH] User profile:', { role: userProfile.role, isActive: userProfile.isActive });

        // Check if user is active
        if (!userProfile.isActive) {
          console.warn('[ADMIN AUTH] Account is disabled');
          setError(isRTL ? 'الحساب معطل' : 'Account is disabled');
          setIsLoading(false);
          router.push(`/${lang}/admin/login`);
          return;
        }

        // Check if user has admin privileges
        const adminRoles = ['admin', 'super_admin'];
        if (!adminRoles.includes(userProfile.role)) {
          console.warn('[ADMIN AUTH] User does not have admin role:', userProfile.role);
          setError(isRTL ? 'ليس لديك صلاحيات إدارية' : 'Admin access required');
          setIsLoading(false);
          router.push(`/${lang}/admin/login`);
          return;
        }

        // Additional security check - verify admin emails
        const adminEmails = [
          'aburakan4551@gmail.com',
          'admin@colorstest.com',
          // Add more admin emails here
        ];

        if (!adminEmails.includes(currentUser.email || '')) {
          console.warn('[ADMIN AUTH] Email not in admin whitelist:', currentUser.email);
          setError(isRTL ? 'البريد الإلكتروني غير مصرح له بالوصول للإدارة' : 'Email not authorized for admin access');
          setIsLoading(false);
          router.push(`/${lang}/admin/login`);
          return;
        }

        // All checks passed
        console.log('[ADMIN AUTH] All checks passed, granting access');
        setUser(currentUser);
        setIsAuthorized(true);
        setIsLoading(false);

      } catch (error) {
        console.error('Admin auth check error:', error);
        setError(isRTL ? 'خطأ في التحقق من الصلاحيات' : 'Authorization check failed');
        setIsLoading(false);
      }
    });

    return () => unsubscribe();
  }, [lang, router, isRTL]);

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            {isRTL ? 'جاري التحقق من الصلاحيات...' : 'Verifying permissions...'}
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            {isRTL ? 'يرجى الانتظار' : 'Please wait'}
          </p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !isAuthorized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 text-center">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            {isRTL ? 'وصول مرفوض' : 'Access Denied'}
          </h1>
          
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {error}
          </p>
          
          <div className="space-y-3">
            <button
              onClick={() => router.push(`/${lang}/admin/login`)}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
            >
              {isRTL ? 'دخول الأدمن' : 'Admin Login'}
            </button>

            <button
              onClick={() => router.push(`/${lang}/`)}
              className="w-full bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-white font-medium py-2 px-4 rounded-lg transition-colors"
            >
              {isRTL ? 'العودة للرئيسية' : 'Go to Home'}
            </button>
          </div>
          
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-6">
            {isRTL ? 'إذا كنت تعتقد أن هذا خطأ، يرجى الاتصال بالدعم' : 'If you believe this is an error, please contact support'}
          </p>
        </div>
      </div>
    );
  }

  // Authorized - render admin content
  return (
    <div className="admin-protected">
      {/* Security header for admin pages */}
      <div className="hidden">
        <meta name="robots" content="noindex, nofollow" />
        <meta name="googlebot" content="noindex, nofollow" />
      </div>
      {children}
    </div>
  );
}

// Additional security hook for admin components
export function useAdminAuth() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAdminStatus = async () => {
      try {
        const currentUser = auth.currentUser;
        if (!currentUser) {
          setIsAdmin(false);
          setLoading(false);
          return;
        }

        const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          const adminRoles = ['admin', 'super_admin'];
          setIsAdmin(adminRoles.includes(userData.role) && userData.isActive);
        }
      } catch (error) {
        console.error('Admin auth check error:', error);
        setIsAdmin(false);
      } finally {
        setLoading(false);
      }
    };

    checkAdminStatus();
  }, []);

  return { isAdmin, loading };
}
