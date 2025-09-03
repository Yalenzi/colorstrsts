import { Metadata } from 'next';
import { Language } from '@/types';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { SimpleSignInPage } from '@/components/auth/SimpleSignInPage';

interface SignInPageProps {
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
    title: lang === 'ar' ? 'تسجيل الدخول' : 'Sign In',
    description: lang === 'ar' 
      ? 'تسجيل الدخول إلى حسابك'
      : 'Sign in to your account',
  };
}

export default async function SignInPage({ params }: SignInPageProps) {
  const { lang } = await params;

  return (
    <AuthGuard lang={lang} requireAuth={false}>
      <SimpleSignInPage lang={lang} />
    </AuthGuard>
  );
}
