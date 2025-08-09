'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { Language } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { EyeIcon, EyeSlashIcon, ShieldCheckIcon } from '@heroicons/react/24/outline';

interface AdminLoginFormProps {
  lang: Language;
}

// Admin credentials (for UX only; real verification uses env hash)
const ADMIN_CREDENTIALS = {
  email: process.env.NEXT_PUBLIC_ADMIN_EMAIL || 'admin@colorstest.com'
};

export function AdminLoginForm({ lang }: AdminLoginFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showAdminPassword, setShowAdminPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState<'credentials' | 'admin-password'>('credentials');
  
  const router = useRouter();
  const isRTL = lang === 'ar';

  const texts = {
    title: isRTL ? 'دخول لوحة التحكم الإدارية' : 'Admin Panel Login',
    subtitle: isRTL ? 'دخول آمن للمديرين المصرح لهم فقط' : 'Secure access for authorized administrators only',
    email: isRTL ? 'البريد الإلكتروني' : 'Email Address',
    password: isRTL ? 'كلمة المرور' : 'Password',
    adminPassword: isRTL ? 'كلمة مرور الأدمن' : 'Admin Password',
    adminPasswordHint: isRTL ? 'أدخل كلمة مرور الأدمن الخاصة' : 'Enter the special admin password',
    login: isRTL ? 'تسجيل الدخول' : 'Login',
    continue: isRTL ? 'متابعة' : 'Continue',
    back: isRTL ? 'رجوع' : 'Back',
    loggingIn: isRTL ? 'جاري تسجيل الدخول...' : 'Logging in...',
    verifying: isRTL ? 'جاري التحقق...' : 'Verifying...',
    emailPlaceholder: isRTL ? 'أدخل بريدك الإلكتروني' : 'Enter your email',
    passwordPlaceholder: isRTL ? 'أدخل كلمة المرور' : 'Enter your password',
    adminPasswordPlaceholder: isRTL ? 'أدخل كلمة مرور الأدمن' : 'Enter admin password',
    securityNotice: isRTL ? 'هذه منطقة محمية للمديرين فقط' : 'This is a protected area for administrators only',
    unauthorizedAccess: isRTL ? 'محاولة الوصول غير المصرح بها سيتم تسجيلها' : 'Unauthorized access attempts will be logged'
  };

  const handleCredentialsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Verify email only (password will be verified against env hash in next step)
      if (email !== ADMIN_CREDENTIALS.email) {
        setError(isRTL ? 'البريد الإلكتروني غير مصرح' : 'Email not authorized');
        setLoading(false);
        return;
      }

      // Move to admin password step
      setStep('admin-password');
      setLoading(false);

    } catch (error: any) {
      console.error('Credentials verification error:', error);
      setError(isRTL ? 'خطأ في التحقق من البيانات' : 'Credentials verification failed');
      setLoading(false);
    }
  };

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Verify admin password securely (using env hash + salt)
      const isValid = await (await import('@/lib/auth-utils')).validateAdminPassword(adminPassword);
      if (!isValid) {
        setError(isRTL ? 'كلمة مرور الأدمن غير صحيحة' : 'Invalid admin password');
        setLoading(false);
        return;
      }

      // Sign in with Firebase
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Get or create user profile
      const userDocRef = doc(db, 'users', user.uid);
      let userDoc = await getDoc(userDocRef);

      if (!userDoc.exists()) {
        // Create admin profile if doesn't exist
        await setDoc(userDocRef, {
          email: user.email,
          displayName: user.displayName || 'Admin User',
          role: 'super_admin',
          isActive: true,
          emailVerified: true,
          createdAt: serverTimestamp(),
          lastLoginAt: serverTimestamp(),
          language: lang,
          adminAccess: true,
          securitySettings: {
            mfaEnabled: false,
            lastPasswordChange: serverTimestamp(),
            loginAttempts: 0
          }
        });
      } else {
        // Update existing user to admin
        await updateDoc(userDocRef, {
          role: 'super_admin',
          isActive: true,
          emailVerified: true,
          lastLoginAt: serverTimestamp(),
          adminAccess: true
        });
      }

      // Set admin session cookies
      document.cookie = `auth-token=${await user.getIdToken()}; path=/; secure; samesite=strict`;
      document.cookie = `user-email=${user.email}; path=/; secure; samesite=strict`;

      // Redirect to admin dashboard
      router.push(`/${lang}/admin`);

    } catch (error: any) {
      console.error('Admin login error:', error);
      
      if (error.code === 'auth/user-not-found') {
        setError(isRTL ? 'المستخدم غير موجود' : 'User not found');
      } else if (error.code === 'auth/wrong-password') {
        setError(isRTL ? 'كلمة المرور غير صحيحة' : 'Wrong password');
      } else if (error.code === 'auth/too-many-requests') {
        setError(isRTL ? 'محاولات كثيرة، حاول لاحقاً' : 'Too many attempts, try later');
      } else {
        setError(isRTL ? 'خطأ في تسجيل الدخول' : 'Login failed');
      }
      
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900">
      <div className="absolute inset-0 bg-black/20"></div>
      
      <div className="relative w-full max-w-md mx-4">
        <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm rounded-2xl shadow-2xl border border-gray-200/50 dark:border-gray-700/50 p-8">
          
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <ShieldCheckIcon className="w-8 h-8 text-white" />
            </div>
            
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              {texts.title}
            </h1>
            
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {texts.subtitle}
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-sm text-red-600 dark:text-red-400 text-center">
                {error}
              </p>
            </div>
          )}

          {/* Step 1: Credentials */}
          {step === 'credentials' && (
            <form onSubmit={handleCredentialsSubmit} className="space-y-6">
              <div>
                <Label htmlFor="email" className="text-gray-700 dark:text-gray-300">
                  {texts.email}
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={texts.emailPlaceholder}
                  required
                  className="mt-1"
                  dir={isRTL ? 'rtl' : 'ltr'}
                />
              </div>

              <div>
                <Label htmlFor="password" className="text-gray-700 dark:text-gray-300">
                  {texts.password}
                </Label>
                <div className="relative mt-1">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={texts.passwordPlaceholder}
                    required
                    className="pr-10"
                    dir={isRTL ? 'rtl' : 'ltr'}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    {showPassword ? (
                      <EyeSlashIcon className="h-5 w-5 text-gray-400" />
                    ) : (
                      <EyeIcon className="h-5 w-5 text-gray-400" />
                    )}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              >
                {loading ? texts.verifying : texts.continue}
              </Button>
            </form>
          )}

          {/* Step 2: Admin Password */}
          {step === 'admin-password' && (
            <form onSubmit={handleAdminLogin} className="space-y-6">
              <div className="text-center mb-6">
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-3">
                  <ShieldCheckIcon className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {texts.adminPasswordHint}
                </p>
              </div>

              <div>
                <Label htmlFor="adminPassword" className="text-gray-700 dark:text-gray-300">
                  {texts.adminPassword}
                </Label>
                <div className="relative mt-1">
                  <Input
                    id="adminPassword"
                    type={showAdminPassword ? 'text' : 'password'}
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    placeholder={texts.adminPasswordPlaceholder}
                    required
                    className="pr-10"
                    dir={isRTL ? 'rtl' : 'ltr'}
                  />
                  <button
                    type="button"
                    onClick={() => setShowAdminPassword(!showAdminPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    {showAdminPassword ? (
                      <EyeSlashIcon className="h-5 w-5 text-gray-400" />
                    ) : (
                      <EyeIcon className="h-5 w-5 text-gray-400" />
                    )}
                  </button>
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  type="button"
                  onClick={() => setStep('credentials')}
                  variant="outline"
                  className="flex-1"
                >
                  {texts.back}
                </Button>
                
                <Button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {loading ? texts.loggingIn : texts.login}
                </Button>
              </div>
            </form>
          )}

          {/* Security Notice */}
          <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
            <div className="text-center space-y-2">
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {texts.securityNotice}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {texts.unauthorizedAccess}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
