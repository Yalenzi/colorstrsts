import { Metadata } from 'next';
import { Language } from '@/types';
import { ModernAdminDashboard } from '@/components/admin/ModernAdminDashboard';
import { getTranslations } from '@/lib/translations';
import { AdminAuthGuard } from '@/components/admin/AdminAuthGuard';

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

  return (
    <AdminAuthGuard lang={lang}>
      <ModernAdminDashboard lang={lang} />
    </AdminAuthGuard>
  );
}
