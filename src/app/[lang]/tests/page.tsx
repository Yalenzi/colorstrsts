import { Metadata } from 'next';
import { Language } from '@/types';
import { TestsPage } from '@/components/pages/tests-page';
import { getTranslations } from '@/lib/translations';
import { AuthGuard } from '@/components/auth/AuthGuard';

// Generate static params for supported languages
export async function generateStaticParams() {
  return [
    { lang: 'ar' },
    { lang: 'en' },
  ];
}

interface TestsPageProps {
  params: { lang: Language };
}

export async function generateMetadata({
  params,
}: {
  params: { lang: Language };
}): Promise<Metadata> {
  const { lang } = params;
  const t = await getTranslations(lang);

  return {
    title: t('tests.title'),
    description: t('tests.subtitle'),
  };
}

export default function Tests({ params }: TestsPageProps) {
  const { lang } = params;
  return (
    <AuthGuard lang={lang} requireAuth={true}>
      <TestsPage lang={lang} />
    </AuthGuard>
  );
}
