'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { DirectGoogleAuth } from '@/components/auth/DirectGoogleAuth';
import { GoogleAuth404Fix } from '@/components/auth/GoogleAuth404Fix';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuth } from '@/components/safe-providers';
import { toast } from 'sonner';
import { Language } from '@/types';

interface SimpleSignInPageProps {
  lang: Language;
}

export function SimpleSignInPage({ lang }: SimpleSignInPageProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { signIn } = useAuth();
  const router = useRouter();
  const isRTL = lang === 'ar';

  const texts = {
    ar: {
      title: 'تسجيل الدخول',
      subtitle: 'أدخل بياناتك للوصول إلى حسابك',
      email: 'البريد الإلكتروني',
      password: 'كلمة المرور',
      signInButton: 'تسجيل الدخول',
      googleButton: 'تسجيل الدخول بـ Google',
      or: 'أو',
      noAccount: 'ليس لديك حساب؟',
      signUp: 'إنشاء حساب',
      forgotPassword: 'نسيت كلمة المرور؟',
      signingIn: 'جاري تسجيل الدخول...',
      success: 'تم تسجيل الدخول بنجاح',
      error: 'خطأ في تسجيل الدخول'
    },
    en: {
      title: 'Sign In',
      subtitle: 'Enter your credentials to access your account',
      email: 'Email',
      password: 'Password',
      signInButton: 'Sign In',
      googleButton: 'Sign in with Google',
      or: 'or',
      noAccount: "Don't have an account?",
      signUp: 'Sign up',
      forgotPassword: 'Forgot password?',
      signingIn: 'Signing in...',
      success: 'Successfully signed in',
      error: 'Sign in error'
    }
  };

  const t = texts[lang];

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    setLoading(true);
    setError('');

    try {
      if (signIn) {
        await signIn(email, password);
        toast.success(t.success);
        router.push(`/${lang}/dashboard`);
      }
    } catch (error: any) {
      console.error('Sign in error:', error);
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

            {/* Google Sign In with 404 Fix */}
            <div className="space-y-4">
              <DirectGoogleAuth
                lang={lang}
                onSuccess={handleGoogleSuccess}
                onError={handleGoogleError}
                variant="outline"
                size="default"
                className="w-full"
              />

              {error && error.includes('404') && (
                <div className="mt-4">
                  <GoogleAuth404Fix
                    lang={lang}
                    onSuccess={handleGoogleSuccess}
                    onError={handleGoogleError}
                  />
                </div>
              )}
            </div>

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
            <form onSubmit={handleEmailSignIn} className="space-y-4">
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

              <Button
                type="submit"
                className="w-full"
                disabled={loading || !email || !password}
              >
                {loading ? t.signingIn : t.signInButton}
              </Button>
            </form>

            <div className="text-center space-y-2">
              <Link
                href={`/${lang}/auth/forgot-password`}
                className="text-sm text-primary hover:underline"
              >
                {t.forgotPassword}
              </Link>
              
              <div className="text-sm text-muted-foreground">
                {t.noAccount}{' '}
                <Link
                  href={`/${lang}/auth/signup`}
                  className="text-primary hover:underline"
                >
                  {t.signUp}
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
