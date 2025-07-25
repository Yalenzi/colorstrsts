import { Metadata } from 'next';
import { Language } from '@/types';
import { getTranslations } from '@/lib/translations';
import { AuthPage } from '@/components/pages/login-page';
import { AuthGuard } from '@/components/auth/AuthGuard';

// Generate static params for supported languages
export async function generateStaticParams() {
  return [
    { lang: 'ar' },
    { lang: 'en' },
  ];
}

interface LoginPageProps {
  params: Promise<{ lang: Language }>;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: Language }>;
}): Promise<Metadata> {
  const { lang } = await params;
  const t = await getTranslations(lang);

  return {
    title: t('auth.login.title'),
    description: t('auth.login.description'),
  };
}

export default async function Login({ params }: LoginPageProps) {
  const { lang } = await params;
  return (
    <AuthGuard lang={lang} requireAuth={false}>
      <AuthPage lang={lang} />
    </AuthGuard>
  );
}
