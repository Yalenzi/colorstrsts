'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/safe-providers';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { 
  Eye, 
  EyeOff, 
  Mail, 
  Lock, 
  LogIn, 
  UserPlus,
  AlertCircle,
  CheckCircle,
  Loader2
} from 'lucide-react';
import { Language } from '@/types';
import { GoogleSignInRedirectButton } from '@/components/auth/GoogleSignInRedirectButton';

interface EnhancedLoginFormProps {
  lang: Language;
  onSuccess?: () => void;
  redirectTo?: string;
}

export function EnhancedLoginForm({ lang, onSuccess, redirectTo }: EnhancedLoginFormProps) {
  const router = useRouter();
  const { signIn, signUp, signInWithGoogle, resetPassword, sendVerificationEmail, user } = useAuth();
  const isRTL = lang === 'ar';
  
  const [mode, setMode] = useState<'login' | 'signup' | 'reset'>('login');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    displayName: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [acceptTerms, setAcceptTerms] = useState(false);

  const texts = {
    login: {
      title: isRTL ? 'تسجيل الدخول' : 'Sign In',
      subtitle: isRTL ? 'أدخل بياناتك للوصول إلى حسابك' : 'Enter your credentials to access your account',
      email: isRTL ? 'البريد الإلكتروني' : 'Email',
      password: isRTL ? 'كلمة المرور' : 'Password',
      signInButton: isRTL ? 'تسجيل الدخول' : 'Sign In',
      googleButton: isRTL ? 'تسجيل الدخول بـ Google' : 'Continue with Google',
      forgotPassword: isRTL ? 'نسيت كلمة المرور؟' : 'Forgot password?',
      noAccount: isRTL ? 'ليس لديك حساب؟' : "Don't have an account?",
      signUp: isRTL ? 'إنشاء حساب' : 'Sign up',
      or: isRTL ? 'أو' : 'or'
    },
    signup: {
      title: isRTL ? 'إنشاء حساب جديد' : 'Create Account',
      subtitle: isRTL ? 'أنشئ حساباً جديداً للبدء' : 'Create a new account to get started',
      displayName: isRTL ? 'الاسم الكامل' : 'Full Name',
      email: isRTL ? 'البريد الإلكتروني' : 'Email',
      password: isRTL ? 'كلمة المرور' : 'Password',
      confirmPassword: isRTL ? 'تأكيد كلمة المرور' : 'Confirm Password',
      signUpButton: isRTL ? 'إنشاء الحساب' : 'Create Account',
      googleButton: isRTL ? 'التسجيل بـ Google' : 'Sign up with Google',
      haveAccount: isRTL ? 'لديك حساب بالفعل؟' : 'Already have an account?',
      signIn: isRTL ? 'تسجيل الدخول' : 'Sign in',
      acceptTerms: isRTL ? 'أوافق على الشروط والأحكام' : 'I agree to the Terms and Conditions',
      or: isRTL ? 'أو' : 'or'
    },
    reset: {
      title: isRTL ? 'إعادة تعيين كلمة المرور' : 'Reset Password',
      subtitle: isRTL ? 'أدخل بريدك الإلكتروني لإعادة تعيين كلمة المرور' : 'Enter your email to reset your password',
      email: isRTL ? 'البريد الإلكتروني' : 'Email',
      resetButton: isRTL ? 'إرسال رابط الإعادة' : 'Send Reset Link',
      backToLogin: isRTL ? 'العودة لتسجيل الدخول' : 'Back to Sign In'
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
    setError('');
  };

  const validateForm = () => {
    if (!formData.email) {
      setError(isRTL ? 'البريد الإلكتروني مطلوب' : 'Email is required');
      return false;
    }

    if (mode !== 'reset' && !formData.password) {
      setError(isRTL ? 'كلمة المرور مطلوبة' : 'Password is required');
      return false;
    }

    if (mode === 'signup') {
      if (!formData.displayName) {
        setError(isRTL ? 'الاسم الكامل مطلوب' : 'Full name is required');
        return false;
      }

      if (formData.password.length < 6) {
        setError(isRTL ? 'كلمة المرور يجب أن تكون 6 أحرف على الأقل' : 'Password must be at least 6 characters');
        return false;
      }

      if (formData.password !== formData.confirmPassword) {
        setError(isRTL ? 'كلمات المرور غير متطابقة' : 'Passwords do not match');
        return false;
      }

      if (!acceptTerms) {
        setError(isRTL ? 'يجب الموافقة على الشروط والأحكام' : 'You must accept the terms and conditions');
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      if (mode === 'login') {
        await signIn(formData.email, formData.password);
        if (onSuccess) onSuccess();
        if (redirectTo) router.push(redirectTo);
      } else if (mode === 'signup') {
        await signUp(formData.email, formData.password, formData.displayName);
        setSuccess(isRTL ? 'تم إنشاء الحساب بنجاح! يرجى التحقق من بريدك الإلكتروني' : 'Account created successfully! Please check your email');
        setMode('login');
      } else if (mode === 'reset') {
        await resetPassword(formData.email);
        setSuccess(isRTL ? 'تم إرسال رابط إعادة التعيين إلى بريدك الإلكتروني' : 'Reset link sent to your email');
        setMode('login');
      }
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError('');

    try {
      await signInWithGoogle();
      if (onSuccess) onSuccess();
      if (redirectTo) router.push(redirectTo);
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSendVerification = async () => {
    try {
      await sendVerificationEmail();
    } catch (error: any) {
      setError(error.message);
    }
  };

  const currentTexts = texts[mode];

  return (
    <div className={`w-full max-w-md mx-auto ${isRTL ? 'rtl' : 'ltr'}`}>
      <Card>
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">
            {currentTexts.title}
          </CardTitle>
          <CardDescription className="text-center">
            {currentTexts.subtitle}
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Email Verification Alert */}
          {user && !user.emailVerified && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="flex items-center justify-between">
                <span>
                  {isRTL ? 'يرجى التحقق من بريدك الإلكتروني' : 'Please verify your email'}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSendVerification}
                  className="ml-2"
                >
                  {isRTL ? 'إعادة الإرسال' : 'Resend'}
                </Button>
              </AlertDescription>
            </Alert>
          )}

          {/* Error Alert */}
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Success Alert */}
          {success && (
            <Alert className="border-green-200 bg-green-50">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">{success}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Display Name (Signup only) */}
            {mode === 'signup' && (
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  {currentTexts.displayName}
                </label>
                <div className="relative">
                  <Input
                    name="displayName"
                    type="text"
                    value={formData.displayName}
                    onChange={handleInputChange}
                    className={`${isRTL ? 'pr-10' : 'pl-10'}`}
                    placeholder={currentTexts.displayName}
                  />
                  <div className={`absolute inset-y-0 ${isRTL ? 'right-0 pr-3' : 'left-0 pl-3'} flex items-center`}>
                    <UserPlus className="h-4 w-4 text-gray-400" />
                  </div>
                </div>
              </div>
            )}

            {/* Email */}
            <div className="space-y-2">
              <label className="text-sm font-medium">
                {currentTexts.email}
              </label>
              <div className="relative">
                <Input
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className={`${isRTL ? 'pr-10' : 'pl-10'}`}
                  placeholder={currentTexts.email}
                />
                <div className={`absolute inset-y-0 ${isRTL ? 'right-0 pr-3' : 'left-0 pl-3'} flex items-center`}>
                  <Mail className="h-4 w-4 text-gray-400" />
                </div>
              </div>
            </div>

            {/* Password (Login and Signup) */}
            {mode !== 'reset' && (
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  {currentTexts.password}
                </label>
                <div className="relative">
                  <Input
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={handleInputChange}
                    className={`${isRTL ? 'pr-10 pl-10' : 'pl-10 pr-10'}`}
                    placeholder={currentTexts.password}
                  />
                  <div className={`absolute inset-y-0 ${isRTL ? 'right-0 pr-3' : 'left-0 pl-3'} flex items-center`}>
                    <Lock className="h-4 w-4 text-gray-400" />
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className={`absolute inset-y-0 ${isRTL ? 'left-0 pl-3' : 'right-0 pr-3'} flex items-center`}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-gray-400" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-400" />
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* Confirm Password (Signup only) */}
            {mode === 'signup' && (
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  {currentTexts.confirmPassword}
                </label>
                <div className="relative">
                  <Input
                    name="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className={`${isRTL ? 'pr-10 pl-10' : 'pl-10 pr-10'}`}
                    placeholder={currentTexts.confirmPassword}
                  />
                  <div className={`absolute inset-y-0 ${isRTL ? 'right-0 pr-3' : 'left-0 pl-3'} flex items-center`}>
                    <Lock className="h-4 w-4 text-gray-400" />
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className={`absolute inset-y-0 ${isRTL ? 'left-0 pl-3' : 'right-0 pr-3'} flex items-center`}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4 text-gray-400" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-400" />
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* Terms Checkbox (Signup only) */}
            {mode === 'signup' && (
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="acceptTerms"
                  checked={acceptTerms}
                  onChange={(e) => setAcceptTerms(e.target.checked)}
                  className="rounded border-gray-300"
                />
                <label htmlFor="acceptTerms" className="text-sm">
                  {currentTexts.acceptTerms}
                </label>
              </div>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full"
              disabled={loading}
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {mode === 'login' && currentTexts.signInButton}
              {mode === 'signup' && currentTexts.signUpButton}
              {mode === 'reset' && currentTexts.resetButton}
            </Button>
          </form>

          {/* Google Sign In (Login and Signup only) */}
          {mode !== 'reset' && (
            <>
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <Separator className="w-full" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">
                    {currentTexts.or}
                  </span>
                </div>
              </div>

              <GoogleSignInRedirectButton
                lang={lang}
                onError={(error) => setError(error)}
                variant="outline"
                size="default"
                fullWidth={true}
              >
                {currentTexts.googleButton}
              </GoogleSignInRedirectButton>
            </>
          )}

          {/* Mode Switch Links */}
          <div className="text-center text-sm">
            {mode === 'login' && (
              <>
                <button
                  type="button"
                  onClick={() => setMode('reset')}
                  className="text-primary hover:underline"
                >
                  {texts.login.forgotPassword}
                </button>
                <div className="mt-2">
                  <span className="text-muted-foreground">{texts.login.noAccount} </span>
                  <button
                    type="button"
                    onClick={() => setMode('signup')}
                    className="text-primary hover:underline"
                  >
                    {texts.login.signUp}
                  </button>
                </div>
              </>
            )}

            {mode === 'signup' && (
              <div>
                <span className="text-muted-foreground">{texts.signup.haveAccount} </span>
                <button
                  type="button"
                  onClick={() => setMode('login')}
                  className="text-primary hover:underline"
                >
                  {texts.signup.signIn}
                </button>
              </div>
            )}

            {mode === 'reset' && (
              <button
                type="button"
                onClick={() => setMode('login')}
                className="text-primary hover:underline"
              >
                {texts.reset.backToLogin}
              </button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
