'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Language } from '@/types';
import { signInAdmin, getCurrentAdminSession } from '@/lib/admin-auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  ShieldCheckIcon,
  EyeIcon,
  EyeSlashIcon,
  ExclamationTriangleIcon,
  LockClosedIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import { GoogleAuthProvider, signInWithPopup, signInWithRedirect } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';

// Add some animations and better UX
const fadeIn = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 }
};

interface SecureAdminLoginProps {
  lang: Language;
}

export default function SecureAdminLogin({ lang }: SecureAdminLoginProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [attempts, setAttempts] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const [lockoutTime, setLockoutTime] = useState(0);

  const router = useRouter();
  const isRTL = lang === 'ar';

  // Check if already logged in
  useEffect(() => {
    const session = getCurrentAdminSession();
    if (session) {
      router.push(`/${lang}/admin`);
    }
  }, [lang, router]);

  // Check lockout status
  useEffect(() => {
    checkLockoutStatus();
  }, []);

  // Lockout countdown
  useEffect(() => {
    if (isLocked && lockoutTime > 0) {
      const timer = setInterval(() => {
        setLockoutTime(prev => {
          if (prev <= 1) {
            setIsLocked(false);
            setAttempts(0);
            localStorage.removeItem('admin_lockout_time');
            localStorage.removeItem('admin_attempts');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [isLocked, lockoutTime]);

  const checkLockoutStatus = () => {
    const lockoutEnd = localStorage.getItem('admin_lockout_time');
    const storedAttempts = localStorage.getItem('admin_attempts');

    if (lockoutEnd) {
      const remaining = parseInt(lockoutEnd) - Date.now();
      if (remaining > 0) {
        setIsLocked(true);
        setLockoutTime(Math.ceil(remaining / 1000));
        return;
      } else {
        localStorage.removeItem('admin_lockout_time');
        localStorage.removeItem('admin_attempts');
      }
    }

    if (storedAttempts) {
      setAttempts(parseInt(storedAttempts));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isLocked) {
      setError(isRTL ? 'الحساب مقفل مؤقتاً' : 'Account temporarily locked');
      return;
    }

    if (!email || !password) {
      setError(isRTL ? 'يرجى إدخال البريد الإلكتروني وكلمة المرور' : 'Please enter email and password');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await signInAdmin(email, password);

      // Clear attempts on successful login
      localStorage.removeItem('admin_attempts');
      localStorage.removeItem('admin_lockout_time');
      setAttempts(0);

      toast.success(isRTL ? 'تم تسجيل الدخول بنجاح' : 'Login successful');
      router.push(`/${lang}/admin`);

    } catch (error: any) {
      console.error('Admin login error:', error);

      // Handle failed login
      const newAttempts = attempts + 1;
      setAttempts(newAttempts);
      localStorage.setItem('admin_attempts', newAttempts.toString());

      const maxAttempts = 5;

      if (newAttempts >= maxAttempts) {
        const lockoutDuration = 15 * 60 * 1000; // 15 minutes
        const lockoutEnd = Date.now() + lockoutDuration;
        localStorage.setItem('admin_lockout_time', lockoutEnd.toString());
        setIsLocked(true);
        setLockoutTime(Math.ceil(lockoutDuration / 1000));

        setError(isRTL ? 'تم قفل الحساب لمدة 15 دقيقة بسبب المحاولات المتعددة' : 'Account locked for 15 minutes due to multiple failed attempts');
      } else {
        setError(error.message || (isRTL ? 'خطأ في تسجيل الدخول' : 'Login failed'));
      }
    } finally {
      setLoading(false);
    }
  };

  const texts = {
    title: isRTL ? 'دخول لوحة التحكم الإدارية' : 'Admin Panel Login',
    subtitle: isRTL ? 'دخول آمن للمديرين المصرح لهم فقط' : 'Secure access for authorized administrators only',
    email: isRTL ? 'البريد الإلكتروني' : 'Email',
    password: isRTL ? 'كلمة المرور' : 'Password',
    login: isRTL ? 'تسجيل الدخول' : 'Sign In',
    loggingIn: isRTL ? 'جاري تسجيل الدخول...' : 'Signing in...',
    showPassword: isRTL ? 'إظهار كلمة المرور' : 'Show password',
    hidePassword: isRTL ? 'إخفاء كلمة المرور' : 'Hide password',
    securityNotice: isRTL ? 'تحذير أمني' : 'Security Notice',
    securityText: isRTL ? 'هذه منطقة محظورة. جميع محاولات الدخول مسجلة ومراقبة.' : 'This is a restricted area. All access attempts are logged and monitored.',
    attemptsRemaining: isRTL ? 'المحاولات المتبقية' : 'Attempts remaining',
    accountLocked: isRTL ? 'الحساب مقفل' : 'Account Locked',
    unlockIn: isRTL ? 'سيتم إلغاء القفل خلال' : 'Will unlock in',
    minutes: isRTL ? 'دقيقة' : 'minutes',
    seconds: isRTL ? 'ثانية' : 'seconds'
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);
      setError('');

      const provider = new GoogleAuthProvider();
      provider.addScope('email');
      provider.addScope('profile');
      provider.setCustomParameters({ prompt: 'select_account' });

      let result;
      try {
        result = await signInWithPopup(auth, provider);
      } catch (popupError: any) {
        // fallback to redirect on popup issues
        if (
          popupError.code === 'auth/popup-blocked' ||
          popupError.code === 'auth/popup-closed-by-user' ||
          popupError.code === 'auth/cancelled-popup-request'
        ) {
          await signInWithRedirect(auth, provider);
          return;
        }
        throw popupError;
      }

      if (result && result.user) {
        const u = result.user;
        // Ensure admin profile in users collection for AdminAuthGuard
        const allowedEmails = ['aburakan4551@gmail.com', 'admin@colorstest.com'];
        const isSuper = allowedEmails.includes(u.email || '');
        await setDoc(
          doc(db, 'users', u.uid),
          {
            uid: u.uid,
            email: u.email || '',
            displayName: u.displayName || (u.email ? u.email.split('@')[0] : ''),
            role: isSuper ? 'super_admin' : 'admin',
            isActive: true,
            emailVerified: true,
            lastLoginAt: serverTimestamp(),
            createdAt: serverTimestamp()
          },
          { merge: true }
        );

        toast.success(isRTL ? 'تسجيل دخول Google ناجح' : 'Google Sign-In successful');
        router.push(`/${lang}/admin/tests`);
      }
    } catch (err: any) {
      console.error('Google Sign-In error:', err);
      setError(err?.message || (isRTL ? 'فشل تسجيل دخول Google' : 'Google Sign-In failed'));
      toast.error(isRTL ? 'فشل تسجيل دخول Google' : 'Google Sign-In failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Security Notice */}
        <Alert className="mb-6 border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-950">
          <ExclamationTriangleIcon className="h-4 w-4 text-yellow-600" />
          <AlertDescription className="text-yellow-800 dark:text-yellow-200">
            <div className="font-medium">{texts.securityNotice}</div>
            <div className="text-sm mt-1">{texts.securityText}</div>
          </AlertDescription>
        </Alert>

        {/* Login Card */}
        <Card className="shadow-2xl border-0 bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm">
          <CardHeader className="text-center pb-6">
            <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <ShieldCheckIcon className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            </div>
            <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">
              {texts.title}
            </CardTitle>
            <CardDescription className="text-gray-600 dark:text-gray-400">
              {texts.subtitle}
            </CardDescription>
          </CardHeader>

          <CardContent>
            {/* Lockout Status */}
            {isLocked && (
              <Alert className="mb-6 border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950">
                <LockClosedIcon className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-800 dark:text-red-200">
                  <div className="font-medium">{texts.accountLocked}</div>
                  <div className="text-sm mt-1">
                    {texts.unlockIn}: {formatTime(lockoutTime)}
                  </div>
                </AlertDescription>
              </Alert>
            )}

            {/* Attempts Warning */}
            {attempts > 0 && attempts < 5 && !isLocked && (
              <Alert className="mb-6 border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-950">
                <ExclamationTriangleIcon className="h-4 w-4 text-orange-600" />
                <AlertDescription className="text-orange-800 dark:text-orange-200">
                  {texts.attemptsRemaining}: {5 - attempts}
                </AlertDescription>
              </Alert>
            )}

            {/* Google Sign-In */}
            <div className="mb-4">
              <Button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={loading || isLocked}
                className="w-full bg-red-600 hover:bg-red-700 text-white font-medium py-2.5"
              >
                {isRTL ? 'تسجيل دخول عبر Google' : 'Sign in with Google'}
              </Button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email Field */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {texts.email}
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading || isLocked}
                  className="w-full"
                  placeholder={isRTL ? 'أدخل البريد الإلكتروني' : 'Enter your email'}
                  dir={isRTL ? 'rtl' : 'ltr'}
                />
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {texts.password}
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={loading || isLocked}
                    className="w-full pr-10"
                    placeholder={isRTL ? 'أدخل كلمة المرور' : 'Enter your password'}
                    dir={isRTL ? 'rtl' : 'ltr'}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    disabled={loading || isLocked}
                  >
                    {showPassword ? (
                      <EyeSlashIcon className="h-4 w-4 text-gray-400" />
                    ) : (
                      <EyeIcon className="h-4 w-4 text-gray-400" />
                    )}
                  </button>
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <Alert className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950">
                  <ExclamationTriangleIcon className="h-4 w-4 text-red-600" />
                  <AlertDescription className="text-red-800 dark:text-red-200">
                    {error}
                  </AlertDescription>
                </Alert>
              )}

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={loading || isLocked || !email || !password}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5"
              >
                {loading ? texts.loggingIn : texts.login}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center mt-6 text-sm text-gray-400">
          <p>© 2024 ColorTests Admin Panel</p>
        </div>
      </div>
    </div>
  );
}
