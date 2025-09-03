'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { DirectGoogleAuth } from '@/components/auth/DirectGoogleAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuth } from '@/components/safe-providers';
import { toast } from 'sonner';
import { Language } from '@/types';

interface SimpleSignUpPageProps {
  lang: Language;
}

export function SimpleSignUpPage({ lang }: SimpleSignUpPageProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { signUp } = useAuth();
  const router = useRouter();
  const isRTL = lang === 'ar';

  const texts = {
    ar: {
      title: 'إنشاء حساب جديد',
      subtitle: 'أدخل بياناتك لإنشاء حساب جديد',
      email: 'البريد الإلكتروني',
      password: 'كلمة المرور',
      confirmPassword: 'تأكيد كلمة المرور',
      signUpButton: 'إنشاء حساب',
      googleButton: 'إنشاء حساب بـ Google',
      or: 'أو',
      haveAccount: 'لديك حساب بالفعل؟',
      signIn: 'تسجيل الدخول',
      signingUp: 'جاري إنشاء الحساب...',
      success: 'تم إنشاء الحساب بنجاح',
      error: 'خطأ في إنشاء الحساب',
      passwordMismatch: 'كلمات المرور غير متطابقة',
      passwordTooShort: 'كلمة المرور يجب أن تكون 6 أحرف على الأقل'
    },
    en: {
      title: 'Create New Account',
      subtitle: 'Enter your details to create a new account',
      email: 'Email',
      password: 'Password',
      confirmPassword: 'Confirm Password',
      signUpButton: 'Sign Up',
      googleButton: 'Sign up with Google',
      or: 'or',
      haveAccount: 'Already have an account?',
      signIn: 'Sign in',
      signingUp: 'Creating account...',
      success: 'Account created successfully',
      error: 'Sign up error',
      passwordMismatch: 'Passwords do not match',
      passwordTooShort: 'Password must be at least 6 characters'
    }
  };

  const t = texts[lang];

  const validateForm = () => {
    if (password !== confirmPassword) {
      setError(t.passwordMismatch);
      return false;
    }
    
    if (password.length < 6) {
      setError(t.passwordTooShort);
      return false;
    }
    
    return true;
  };

  const handleEmailSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || !confirmPassword) return;

    if (!validateForm()) return;

    setLoading(true);
    setError('');

    try {
      if (signUp) {
        await signUp(email, password);
        toast.success(t.success);
        router.push(`/${lang}/dashboard`);
      }
    } catch (error: any) {
      console.error('Sign up error:', error);
      setError(error.message || t.error);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = () => {
    toast.success(t.success);
    router.push(`/${lang}/dashboard`);
  };

  const handleGoogleError = (error: string) => {
    setError(error);
  };

  return (
    <div className={`min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-950 dark:via-background dark:to-blue-950 p-4 ${isRTL ? 'rtl' : 'ltr'}`} dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="w-full max-w-md">
        <Card>
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center">
              {t.title}
            </CardTitle>
            <CardDescription className="text-center">
              {t.subtitle}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Google Sign Up */}
            <DirectGoogleAuth
              lang={lang}
              onSuccess={handleGoogleSuccess}
              onError={handleGoogleError}
              variant="outline"
              size="default"
              className="w-full"
            />

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <Separator className="w-full" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  {t.or}
                </span>
              </div>
            </div>

            {/* Email/Password Form */}
            <form onSubmit={handleEmailSignUp} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">{t.email}</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t.email}
                  required
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">{t.password}</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={t.password}
                  required
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">{t.confirmPassword}</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder={t.confirmPassword}
                  required
                  disabled={loading}
                />
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={loading || !email || !password || !confirmPassword}
              >
                {loading ? t.signingUp : t.signUpButton}
              </Button>
            </form>

            <div className="text-center">
              <div className="text-sm text-muted-foreground">
                {t.haveAccount}{' '}
                <Link
                  href={`/${lang}/auth/signin`}
                  className="text-primary hover:underline"
                >
                  {t.signIn}
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
