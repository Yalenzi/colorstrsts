import { Metadata } from 'next';
import { Language } from '@/types';
import { SimpleAdminDashboard } from '@/components/admin/SimpleAdminDashboard';
import { getTranslations } from '@/lib/translations';

// Generate static params for supported languages
export async function generateStaticParams() {
  return [
    { lang: 'ar' },
    { lang: 'en' },
  ];
}

interface AdminPageProps {
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
    title: t('admin.title'),
    description: t('admin.dashboard'),
  };
}

export default async function AdminPageRoute({ params }: AdminPageProps) {
  const { lang } = await params;
  return <SimpleAdminDashboard lang={lang} />;
}
