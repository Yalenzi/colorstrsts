import { Metadata } from 'next';
import { Language } from '@/types';
import { getTranslations } from '@/lib/translations';
import { AuthPage } from '@/components/pages/login-page';
import { AuthRedirectHandler } from '@/components/auth/AuthRedirectHandler';

// Static generation compatible with output: export
// Client-side auth will be handled by components

// Generate static params for supported languages
export async function generateStaticParams() {
  return [
    { lang: 'ar' },
    { lang: 'en' },
  ];
}

interface AuthPageProps {
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

export default async function Auth({ params }: AuthPageProps) {
  const { lang } = await params;
  return (
    <>
      <AuthRedirectHandler lang={lang} />
      <AuthPage lang={lang} />
    </>
  );
}
