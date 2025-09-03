import { Metadata } from 'next';
import { Language } from '@/types';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { SimpleSignUpPage } from '@/components/auth/SimpleSignUpPage';

interface SignUpPageProps {
  params: {
    lang: Language;
  };
}

export async function generateMetadata({
  params,
}: {
  params: { lang: Language };
}): Promise<Metadata> {
  const { lang } = params;

  return {
    title: lang === 'ar' ? 'إنشاء حساب جديد' : 'Sign Up',
    description: lang === 'ar' 
      ? 'إنشاء حساب جديد للوصول إلى جميع الميزات'
      : 'Create a new account to access all features',
  };
}

export default async function SignUpPage({ params }: SignUpPageProps) {
  const { lang } = await params;

  return (
    <AuthGuard lang={lang} requireAuth={false}>
      <SimpleSignUpPage lang={lang} />
    </AuthGuard>
  );
}
