import { Metadata } from 'next';
import { Language } from '@/types';
import { getTranslations } from '@/lib/translations';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { SimpleDashboard } from '@/components/dashboard/SimpleDashboard';

// Generate static params for supported languages
export async function generateStaticParams() {
  return [
    { lang: 'ar' },
    { lang: 'en' },
  ];
}

interface DashboardPageProps {
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
    title: lang === 'ar' ? 'لوحة التحكم' : 'Dashboard',
    description: lang === 'ar' 
      ? 'لوحة التحكم الشخصية لإدارة الاختبارات والنتائج'
      : 'Personal dashboard to manage tests and results',
  };
}

export default async function Dashboard({ params }: DashboardPageProps) {
  const { lang } = await params;

  return (
    <AuthGuard lang={lang} requireAuth={true}>
      <SimpleDashboard lang={lang} />
    </AuthGuard>
  );
}
